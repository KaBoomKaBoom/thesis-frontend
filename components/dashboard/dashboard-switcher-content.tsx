"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { TeacherDashboardContent } from "@/components/dashboard/teacher-dashboard-content"
import { Card, CardContent } from "@/components/ui/card"
import { userApi, ApiException } from "@/lib/api/user"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useToast } from "@/hooks/use-toast"

export function DashboardSwitcherContent() {
  const router = useRouter()
  const { t } = useI18n()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const loadRole = async () => {
      setIsLoading(true)
      try {
        const profile = await userApi.getProfile()
        setRole(profile.role || null)
      } catch (error) {
        if (error instanceof ApiException && error.status === 401) {
          toast({
            title: String(t("toasts.authRequired")),
            description: String(t("toasts.loginToDashboard")),
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        toast({
          title: String(t("toasts.couldNotLoadDashboard")),
          description: error instanceof Error ? error.message : String(t("toasts.failedLoadDashboard")),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRole()
  }, [router, t, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container max-w-6xl py-8 px-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{String(t("dashboard.loading"))}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (role?.toLowerCase() === "teacher") {
    return <TeacherDashboardContent />
  }

  return <DashboardContent />
}
