"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { dictionaries, type Locale } from "../../lib/i18n"

type TranslationValue = string | string[]

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => TranslationValue
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getByPath(source: unknown, path: string): TranslationValue {
  const value = path.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") return undefined
    return (current as Record<string, unknown>)[segment]
  }, source)

  if (typeof value === "string" || Array.isArray(value)) {
    return value
  }

  return path
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null
    if (stored && ["en", "ro", "ru"].includes(stored)) {
      setLocaleState(stored)
      document.documentElement.lang = stored
      return
    }

    const preferred = navigator.language.toLowerCase()
    const initialLocale: Locale = preferred.startsWith("ro") ? "ro" : preferred.startsWith("ru") ? "ru" : "en"
    setLocaleState(initialLocale)
    document.documentElement.lang = initialLocale
  }, [])

  const setLocale = (value: Locale) => {
    setLocaleState(value)
    localStorage.setItem("locale", value)
    document.documentElement.lang = value
  }

  const contextValue = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale]

    return {
      locale,
      setLocale,
      t: (key: string) => getByPath(dict, key),
    }
  }, [locale])

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }

  return context
}
