"use client"

import { Loader2, MapPin } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { PlaceSuggestion } from "@/lib/astrology/geocoding"

interface PlaceSearchInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  "aria-invalid"?: boolean
}

export function PlaceSearchInput({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "City, State/Region, Country",
  "aria-invalid": ariaInvalid,
}: PlaceSearchInputProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listId = "place-search-suggestions"

  const searchPlaces = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query.trim())}`
      )

      if (!response.ok) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      const data = (await response.json()) as {
        suggestions?: PlaceSuggestion[]
      }
      const results = data.suggestions ?? []
      setSuggestions(results)
      setIsOpen(results.length > 0)
      setActiveIndex(-1)
    } catch {
      setSuggestions([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectSuggestion = useCallback(
    (suggestion: PlaceSuggestion) => {
      onChange(suggestion.displayName)
      setSuggestions([])
      setIsOpen(false)
      setActiveIndex(-1)
    },
    [onChange]
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    onChange(nextValue)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      void searchPlaces(nextValue)
    }, 300)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      return
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setActiveIndex((index) =>
          index < suggestions.length - 1 ? index + 1 : 0
        )
        break
      case "ArrowUp":
        event.preventDefault()
        setActiveIndex((index) =>
          index > 0 ? index - 1 : suggestions.length - 1
        )
        break
      case "Enter":
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          event.preventDefault()
          selectSuggestion(suggestions[activeIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsOpen(false)
              onBlur?.()
            }, 150)
          }}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `place-suggestion-${activeIndex}` : undefined
          }
          aria-invalid={ariaInvalid}
        />
        {isLoading && (
          <Loader2
            className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-popover py-1 shadow-md"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}
              id={`place-suggestion-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={cn(
                "flex cursor-pointer items-start gap-2 px-3 py-2 text-sm text-popover-foreground",
                index === activeIndex && "bg-accent text-accent-foreground"
              )}
              onMouseDown={(event) => {
                event.preventDefault()
                selectSuggestion(suggestion)
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="line-clamp-2">{suggestion.displayName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
