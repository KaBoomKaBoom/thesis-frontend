"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  GraduationCap,
  User,
  Users,
  Settings,
  LogOut,
  BookOpen,
  BarChart3,
  Menu,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { useI18n } from "@/components/i18n/i18n-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { userApi } from "@/lib/api/user"

interface HeaderProps {
  user?: {
    firstName: string
    lastName: string
    email: string
    avatar?: string
    role?: string
  }
}

export function DashboardHeader({ user }: HeaderProps) {
  const router = useRouter()
  const { t } = useI18n()

  const [headerUser, setHeaderUser] = useState<HeaderProps["user"]>(
    user || {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    },
  )

  useEffect(() => {
    if (user) {
      setHeaderUser(user)
      return
    }

    let isMounted = true

    const loadUser = async () => {
      try {
        const profile = await userApi.getProfile()

        if (!isMounted) return

        setHeaderUser({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          role: profile.role || "",
        })
      } catch {
        if (!isMounted) return

        setHeaderUser({
          firstName: "",
          lastName: "",
          email: "",
          role: "",
        })
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [user])

  const initials = headerUser?.firstName && headerUser.lastName
    ? `${headerUser.firstName[0]}${headerUser.lastName[0]}`
    : "?"

  const isTeacher = headerUser?.role?.toLowerCase() === "teacher"
  const isAdmin = headerUser?.role?.toLowerCase() === "admin"

  const handleLogout = () => {
    router.push("/login")
  }

  const navLinks = [
    { href: "/dashboard", label: String(t("header.dashboard")), icon: BarChart3 },
    ...(isAdmin
      ? [{ href: "/admin", label: String(t("header.adminPanel")), icon: Shield }]
      : []),
    ...(isTeacher
      ? [{ href: "/teacher/students", label: String(t("header.teacherWorkspace")), icon: Users }]
      : []),
    ...(!isTeacher
      ? [{ href: "/tests", label: String(t("header.takeTest")), icon: BookOpen }]
      : []),
    { href: "/profile", label: String(t("header.profile")), icon: User },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:inline">
            ExamPrep
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" className="gap-2">
                <link.icon className="w-4 h-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={headerUser?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">
                  {headerUser?.lastName || "-"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>
                    {headerUser?.firstName || "-"} {headerUser?.lastName || ""}
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {headerUser?.email || "-"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  {String(t("header.profile"))}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  {String(t("header.settings"))}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {String(t("header.logout"))}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-2 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  {String(t("header.logout"))}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
