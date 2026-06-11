"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { suggestLang } from "@/lib/vedic/api"

import ar from "./locales/ar"
import bn from "./locales/bn"
import de from "./locales/de"
import en from "./locales/en"
import es from "./locales/es"
import fa from "./locales/fa"
import fr from "./locales/fr"
import he from "./locales/he"
import hi from "./locales/hi"
import ja from "./locales/ja"
import ne from "./locales/ne"
import pt from "./locales/pt"
import ru from "./locales/ru"
import ta from "./locales/ta"
import zh from "./locales/zh"

export const LANGUAGES = [
  { id: "en", label: "English", native: "EN" },
  { id: "hi", label: "हिन्दी", native: "हिं" },
  { id: "ta", label: "தமிழ்", native: "த" },
  { id: "bn", label: "বাংলা", native: "বা" },
  { id: "ne", label: "नेपाली", native: "ने" },
  { id: "zh", label: "中文", native: "中" },
  { id: "ja", label: "日本語", native: "日" },
  { id: "es", label: "Español", native: "ES" },
  { id: "de", label: "Deutsch", native: "DE" },
  { id: "pt", label: "Português", native: "PT" },
  { id: "fr", label: "Français", native: "FR" },
  { id: "ru", label: "Русский", native: "РУ" },
  { id: "ar", label: "العربية", native: "ع" },
  { id: "fa", label: "فارسی", native: "فا" },
  { id: "he", label: "עברית", native: "עב" },
] as const

export type LangId = (typeof LANGUAGES)[number]["id"]

type Dict = Record<string, string>

export const translations: Record<string, Dict> = {
  en,
  hi,
  ta,
  bn,
  ne,
  zh,
  ja,
  es,
  de,
  pt,
  fr,
  ru,
  ar,
  fa,
  he,
}

const RTL_LANGS = new Set<string>(["ar", "fa", "he"])
const STORAGE_KEY = "jk_lang"

function applyDir(lang: LangId) {
  if (typeof document !== "undefined") {
    document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr"
  }
}

type I18nContextValue = {
  lang: LangId
  t: (key: string) => string
  setLang: (l: LangId) => void
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  t: (k) => k,
  setLang: () => {},
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangId>(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    const known = new Set(LANGUAGES.map((l) => l.id))
    const initial = (
      saved && known.has(saved as LangId) ? saved : "en"
    ) as LangId
    if (typeof document !== "undefined") {
      document.documentElement.lang = initial
    }
    applyDir(initial)
    return initial
  })

  const setLang = useCallback((next: LangId) => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = next
    }
    applyDir(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next)
    }
    setLangState(next)
  }, [])

  const langSuggestedRef = useRef(false)
  useEffect(() => {
    if (langSuggestedRef.current) return
    langSuggestedRef.current = true
    if (typeof window === "undefined") return
    if (localStorage.getItem(STORAGE_KEY)) return
    const known = new Set(LANGUAGES.map((l) => l.id))
    suggestLang()
      .then((d) => {
        if (d?.lang && d.lang !== "en" && known.has(d.lang as LangId)) {
          setLang(d.lang as LangId)
        }
      })
      .catch(() => {})
  }, [setLang])

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: (key: string) =>
        translations[lang]?.[key] ?? translations.en[key] ?? key,
    }),
    [lang, setLang]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext)
}
