"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BarChart3, CheckCircle2, Target, Trophy } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { teacherApi, ApiException as TeacherApiException } from "@/lib/api/teacher"
import type { UserDashboardDTO } from "@/lib/types/user"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  score: {
    label: "Average Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })
}

export function TeacherStudentDetailContent({ studentId }: { studentId: string }) {
  const parsedStudentId = Number(studentId)
  const isValidStudentId = Number.isFinite(parsedStudentId) && parsedStudentId > 0

  const router = useRouter()
  const { t } = useI18n()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<UserDashboardDTO | null>(null)

  useEffect(() => {
    if (!isValidStudentId) {
      setIsLoading(false)
      return
    }

    const loadOverview = async () => {
      setIsLoading(true)
      try {
        const response = await teacherApi.getStudentOverview(parsedStudentId)
        setDashboardData(response)
      } catch (error) {
        if (error instanceof TeacherApiException && error.status === 401) {
          toast({
            title: String(t("toasts.authRequired")),
            description: String(t("toasts.loginToTeacher")),
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

    loadOverview()
  }, [isValidStudentId, parsedStudentId, router, t, toast])

  const trendData = useMemo(() => {
    if (!dashboardData?.scoreTrend) return []
    return dashboardData.scoreTrend.map((item) => ({
      dateLabel: formatDate(item.date),
      score: item.averageScorePercentage,
      sessionsCount: item.sessionsCount,
    }))
  }, [dashboardData])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container max-w-6xl py-8 px-4 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{String(t("teacherDashboard.studentDetails"))}</h1>
            <p className="text-sm text-muted-foreground">{String(t("teacherDashboard.studentDetailsSubtitle"))}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {String(t("sessionDetail.back"))}
            </Link>
          </Button>
        </div>

        {!isValidStudentId ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">{String(t("sessionDetail.invalidId"))}</CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">{String(t("dashboard.loading"))}</CardContent>
          </Card>
        ) : !dashboardData ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">{String(t("dashboard.noData"))}</CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{String(t("dashboard.totalSessions"))}</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardData.stats.totalSessions}</p>
                  <BarChart3 className="w-5 h-5 text-primary mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{String(t("dashboard.averageScore"))}</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardData.stats.averageScorePercentage}%</p>
                  <Target className="w-5 h-5 text-primary mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{String(t("dashboard.bestScore"))}</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardData.stats.bestScorePercentage}%</p>
                  <Trophy className="w-5 h-5 text-primary mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{String(t("dashboard.lastResult"))}</p>
                  <p className="text-lg font-bold text-foreground">{dashboardData.stats.lastSessionResultLabel}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(dashboardData.stats.lastSessionTakenAt)}</p>
                  <CheckCircle2 className="w-5 h-5 text-primary mt-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{String(t("dashboard.scoreTrend"))}</CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{String(t("dashboard.noScoreTrend"))}</p>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[280px] w-full">
                    <LineChart data={trendData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} minTickGap={24} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={36} />
                      <ChartTooltip
                        cursor={false}
                        content={(
                          <ChartTooltipContent
                            labelFormatter={(label, payload) => {
                              const point = payload?.[0]?.payload as { dateLabel?: string; sessionsCount?: number } | undefined
                              if (!point) return label
                              return `${point.dateLabel} • ${String(t("dashboard.sessions"))} ${point.sessionsCount ?? 0}`
                            }}
                          />
                        )}
                      />
                      <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{String(t("dashboard.recentSessions"))}</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recentSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{String(t("dashboard.noSessions"))}</p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.recentSessions.map((session) => (
                      <div key={`${session.sessionId}-${session.testTakenTime}`} className="rounded-lg border bg-muted/30 p-4">
                        <p className="font-medium text-foreground">Session #{session.sessionId} • Test #{session.testId}</p>
                        <p className="text-sm text-muted-foreground">{formatDateTime(session.testTakenTime)}</p>
                        <p className="text-xs text-muted-foreground">{session.resultLabel} • {session.scorePercentage}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
