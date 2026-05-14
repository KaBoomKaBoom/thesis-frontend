"use client"

import Link from "next/link"
import {
  GraduationCap,
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  const { t } = useI18n()

  const features = [BookOpen, Target, TrendingUp, Users].map((icon, index) => ({
    icon,
    title: (t("home.features") as { title: string; description: string }[])[index].title,
    description: (t("home.features") as { title: string; description: string }[])[index].description,
  }))

  const stats = [
    { value: "10,000+", label: (t("home.stats") as string[])[0] },
    { value: "5,000+", label: (t("home.stats") as string[])[1] },
    { value: "50+", label: (t("home.stats") as string[])[2] },
    { value: "95%", label: (t("home.stats") as string[])[3] },
  ]

  const subjects = t("home.subjects") as string[]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ExamPrep</span>
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost">{String(t("home.signIn"))}</Button>
            </Link>
            <Link href="/register">
              <Button>{String(t("home.getStarted"))}</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            {String(t("home.badge"))}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
            {String(t("home.heroTitle"))}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            {String(t("home.heroSubtitle"))}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                {String(t("home.startPreparing"))}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                {String(t("home.haveAccount"))}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {String(t("home.featuresTitle"))}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {String(t("home.featuresSubtitle"))}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {String(t("home.subjectsTitle"))}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {String(t("home.subjectsSubtitle"))}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {subjects.map((subject) => (
              <div
                key={subject}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border"
              >
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-foreground font-medium">{subject}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <div className="p-8 md:p-12 rounded-2xl bg-primary text-primary-foreground">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {String(t("home.ctaTitle"))}
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              {String(t("home.ctaSubtitle"))}
            </p>
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
              >
                {String(t("home.ctaButton"))}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">ExamPrep</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">
                {String(t("home.footerLinks.about"))}
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                {String(t("home.footerLinks.contact"))}
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                {String(t("home.footerLinks.privacy"))}
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                {String(t("home.footerLinks.terms"))}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              {String(t("home.footerRights"))}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
