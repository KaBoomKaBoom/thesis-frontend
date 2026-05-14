"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, CheckCircle2, Target, Trophy } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { userApi, ApiException } from "@/lib/api/user"
import type {
  DashboardQuestionAnalyticsDTO,
  DashboardRecentSessionDTO,
  UserDashboardDTO,
} from "@/lib/types/user"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/i18n/i18n-provider"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const scoreTrendConfig = {
  score: {
    label: "Average Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDayLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  })
}

function formatDateOnly(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

function AnalyticsList({
  title,
  items,
  badgeVariant,
  noDataLabel,
  questionLabel,
  correctLabel,
}: {
  title: string
  items: DashboardQuestionAnalyticsDTO[]
  badgeVariant: "default" | "destructive"
  noDataLabel: string
  questionLabel: string
  correctLabel: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{noDataLabel}</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.questionId} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{questionLabel} #{item.questionId}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.correctAnswers}/{item.attempts} {correctLabel}
                    </p>
                  </div>
                  <Badge variant={badgeVariant}>{item.accuracyPercentage}%</Badge>
                </div>
                <Progress value={item.accuracyPercentage} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()

  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<UserDashboardDTO | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true)
      try {
        const response = await userApi.getDashboard()
        setDashboardData(response)
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

    fetchDashboard()
  }, [router, toast, t])

  const trendChartData = useMemo(() => {
    if (!dashboardData) return []

    return dashboardData.scoreTrend.map((point) => ({
      dateLabel: formatDayLabel(point.date),
      fullDate: formatDateOnly(point.date),
      score: point.averageScorePercentage,
      sessionsCount: point.sessionsCount,
    }))
  }, [dashboardData])

  const statsCards = useMemo(() => {
    if (!dashboardData) return []

    return [
      {
        label: String(t("dashboard.totalSessions")),
        value: dashboardData.stats.totalSessions,
        helper: `${dashboardData.stats.completedSessions} ${String(t("dashboard.completed"))}`,
        icon: BarChart3,
      },
      {
        label: String(t("dashboard.averageScore")),
        value: `${dashboardData.stats.averageScorePercentage}%`,
        helper: String(t("dashboard.acrossAll")),
        icon: Target,
      },
      {
        label: String(t("dashboard.bestScore")),
        value: `${dashboardData.stats.bestScorePercentage}%`,
        helper: String(t("dashboard.highestRecorded")),
        icon: Trophy,
      },
      {
        label: String(t("dashboard.lastResult")),
        value: dashboardData.stats.lastSessionResultLabel,
        helper: formatDateTime(dashboardData.stats.lastSessionTakenAt),
        icon: CheckCircle2,
      },
    ]
  }, [dashboardData, t])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container max-w-6xl py-8 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{String(t("dashboard.title"))}</h1>
          <p className="text-sm text-muted-foreground">{String(t("dashboard.subtitle"))}</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{String(t("dashboard.loading"))}</p>
            </CardContent>
          </Card>
        ) : !dashboardData ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{String(t("dashboard.noData"))}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsCards.map((card) => (
                <Card key={card.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                        <p className="text-2xl font-bold text-foreground">{card.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{card.helper}</p>
                      </div>
                      <card.icon className="w-5 h-5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{String(t("dashboard.recentSessions"))}</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recentSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{String(t("dashboard.noSessions"))}</p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.recentSessions.map((session: DashboardRecentSessionDTO) => (
                      <div
                        key={`${session.sessionId}-${session.testTakenTime}`}
                        className="rounded-lg border bg-muted/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            Session #{session.sessionId} • Test #{session.testId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(session.testTakenTime)}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{session.resultLabel}</p>
                            <p className="text-xs text-muted-foreground">{session.scorePercentage}%</p>
                          </div>
                          <Progress value={session.scorePercentage} className="w-24 h-2" />
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/profile/activity/${session.sessionId}`}>{String(t("common.details"))}</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{String(t("dashboard.scoreTrend"))}</CardTitle>
              </CardHeader>
              <CardContent>
                {trendChartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{String(t("dashboard.noScoreTrend"))}</p>
                ) : (
                  <ChartContainer config={scoreTrendConfig} className="h-[280px] w-full">
                    <LineChart data={trendChartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            hideLabel
                            formatter={(value, _name, item) => (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">{String(t("dashboard.date"))}</span>
                                  <span className="font-medium">{item.payload.fullDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">{String(t("dashboard.sessions"))}</span>
                                  <span className="font-medium">{item.payload.sessionsCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">{String(t("dashboard.score"))}</span>
                                  <span className="font-medium">{value}%</span>
                                </div>
                              </div>
                            )}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-score)"
                        strokeWidth={2}
                        dot={{
                          r: 5,
                          fill: "var(--color-score)",
                          stroke: "hsl(var(--background))",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 7,
                          fill: "var(--color-score)",
                          stroke: "hsl(var(--background))",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnalyticsList
                title={String(t("dashboard.strongest"))}
                items={dashboardData.topicAnalytics.strongestQuestions}
                badgeVariant="default"
                noDataLabel={String(t("dashboard.noTopicData"))}
                questionLabel={String(t("dashboard.question"))}
                correctLabel={String(t("dashboard.correct"))}
              />
              <AnalyticsList
                title={String(t("dashboard.weakest"))}
                items={dashboardData.topicAnalytics.weakestQuestions}
                badgeVariant="destructive"
                noDataLabel={String(t("dashboard.noTopicData"))}
                questionLabel={String(t("dashboard.question"))}
                correctLabel={String(t("dashboard.correct"))}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
