"use client"

import { useEffect, useState } from "react"

import { LANGUAGES, useI18n, type LangId } from "@/i18n"
import { cn } from "@/lib/utils"

const ROTATE_MS = 2400
const ANIMATE_FOR_MS = 10_000

function isFreshVisit(): boolean {
  if (typeof window === "undefined") return false
  return !localStorage.getItem("jk_lang")
}

export function LanguageSwitcher({
  testId = "lang-switcher",
  className,
}: {
  testId?: string
  className?: string
}) {
  const { lang, setLang } = useI18n()
  const [animating, setAnimating] = useState(false)
  const [animIndex, setAnimIndex] = useState(0)

  const stopAnim = () => setAnimating(false)

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value as LangId)
    stopAnim()
  }

  useEffect(() => {
    if (isFreshVisit()) setAnimating(true)
  }, [])

  useEffect(() => {
    if (!animating) return
    const intervalId = window.setInterval(() => {
      setAnimIndex((i) => (i + 1) % LANGUAGES.length)
    }, ROTATE_MS)
    const timeoutId = window.setTimeout(stopAnim, ANIMATE_FOR_MS)
    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [animating])

  const display = LANGUAGES[animIndex]
  const current = LANGUAGES.find((l) => l.id === lang) ?? LANGUAGES[0]
  const label = animating
    ? `${display.native} · ${display.label}`
    : `${current.native} · ${current.label}`

  return (
    <div
      className={cn(
        "relative inline-flex h-8 items-center overflow-hidden rounded-md border border-border bg-background pl-2.5 pr-7 text-sm transition-colors hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 sm:pl-3 sm:pr-8",
        animating && "lang-ring-pulse",
        className
      )}
      dir="ltr"
      onMouseEnter={stopAnim}
      onFocus={stopAnim}
    >
      <span
        key={animating ? animIndex : "static"}
        className={cn(
          "leading-none font-semibold whitespace-nowrap",
          animating && "lang-rotate-in"
        )}
        aria-hidden="true"
      >
        {label}
      </span>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-primary"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <select
        data-testid={testId}
        value={lang}
        onChange={onChange}
        aria-label="Language"
        dir="ltr"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {LANGUAGES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.native} · {l.label}
          </option>
        ))}
      </select>
    </div>
  )
}
