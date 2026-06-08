"use client"

import { Loader2, MapPin } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import type { PlaceSuggestion } from "@/lib/astrology/types"

export interface ResolvedPlace {
  displayName: string
  latitude: number
  longitude: number
  timezone?: string
}

interface PlaceSearchProps {
  value: string
  onChange: (value: string) => void
  onPlaceResolved?: (place: ResolvedPlace | null) => void
  disabled?: boolean
  placeholder?: string
}

export function PlaceSearch({
  value,
  onChange,
  onPlaceResolved,
  disabled = false,
  placeholder = "City, State/Region, Country",
}: PlaceSearchProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [resolvedPlace, setResolvedPlace] = useState<ResolvedPlace | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (query: string) => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(trimmed)}`
      )
      if (!response.ok) {
        setSuggestions([])
        return
      }

      const data = (await response.json()) as {
        suggestions: PlaceSuggestion[]
      }
      setSuggestions(data.suggestions ?? [])
      setIsOpen((data.suggestions?.length ?? 0) > 0)
    } catch {
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleInputChange = useCallback(
    (nextValue: string) => {
      onChange(nextValue)
      setResolvedPlace(null)
      onPlaceResolved?.(null)

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        void fetchSuggestions(nextValue)
      }, 350)
    },
    [onChange, onPlaceResolved, fetchSuggestions]
  )

  const selectPlace = useCallback(
    async (suggestion: PlaceSuggestion) => {
      onChange(suggestion.displayName)
      setSuggestions([])
      setIsOpen(false)

      const base: ResolvedPlace = {
        displayName: suggestion.displayName,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      }

      setResolvedPlace(base)
      onPlaceResolved?.(base)

      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(suggestion.displayName)}&resolve=true`
        )
        if (response.ok) {
          const location = (await response.json()) as ResolvedPlace
          const resolved: ResolvedPlace = {
            displayName: location.displayName ?? suggestion.displayName,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: location.timezone,
          }
          setResolvedPlace(resolved)
          onPlaceResolved?.(resolved)
        }
      } catch {
        // Coordinates from search are still usable
      }
    },
    [onChange, onPlaceResolved]
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          autoComplete="address-level2"
          disabled={disabled}
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />
        {isSearching && (
          <Loader2
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover py-1 shadow-md"
        >
          {suggestions.map((suggestion) => (
            <li key={`${suggestion.latitude}-${suggestion.longitude}`}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => void selectPlace(suggestion)}
              >
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span>{suggestion.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {resolvedPlace && (
        <p className="mt-2 text-xs text-muted-foreground">
          <MapPin className="mr-1 inline size-3" aria-hidden="true" />
          {resolvedPlace.latitude.toFixed(4)}°, {resolvedPlace.longitude.toFixed(4)}°
          {resolvedPlace.timezone ? ` · ${resolvedPlace.timezone}` : ""}
        </p>
      )}
    </div>
  )
}
