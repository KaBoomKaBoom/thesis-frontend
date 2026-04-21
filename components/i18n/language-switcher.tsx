"use client"

import { Languages } from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Locale } from "../../lib/i18n"

const localeLabels: Record<Locale, string> = {
  en: "English",
  ro: "Română",
  ru: "Русский",
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="w-4 h-4" />
          {localeLabels[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["en", "ro", "ru"] as Locale[]).map((item) => (
          <DropdownMenuItem key={item} onClick={() => setLocale(item)}>
            {localeLabels[item]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
