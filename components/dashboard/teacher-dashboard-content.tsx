"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { teacherApi, ApiException as TeacherApiException } from "@/lib/api/teacher"
import { getUserIdFromJwt } from "@/lib/auth-token"
import type { TeacherStudent, TeacherUploadedTest } from "@/lib/types/teacher"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/i18n/i18n-provider"

function toReadableDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

export function TeacherDashboardContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()

  const [isLoading, setIsLoading] = useState(true)
  const [students, setStudents] = useState<TeacherStudent[]>([])
  const [uploadedTests, setUploadedTests] = useState<TeacherUploadedTest[]>([])

  useEffect(() => {
    const loadTeacherDashboard = async () => {
      setIsLoading(true)
      try {
        const teacherId = getUserIdFromJwt(localStorage.getItem("authToken"))

        const [studentsResponse, testsResponse] = await Promise.all([
          teacherApi.getStudents({ pageNumber: 1, pageSize: 50 }),
          teacherId ? teacherApi.getUploadedTestsByTeacher(teacherId) : Promise.resolve([]),
        ])

        const assignedStudents = (studentsResponse.students || []).filter((student) =>
          teacherId ? student.teacherId === teacherId : false,
        )

        const studentsWithStats = await Promise.all(
          assignedStudents.map(async (student) => {
            try {
              const dashboard = await teacherApi.getStudentOverview(student.studentId)
              return {
                ...student,
                averageScorePercentage: dashboard.stats.averageScorePercentage,
                totalSessions: dashboard.stats.totalSessions,
              }
            } catch {
              return student
            }
          }),
        )

        setStudents(studentsWithStats)
        setUploadedTests(testsResponse || [])
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

    loadTeacherDashboard()
  }, [router, t, toast])

  const testsCountSummary = useMemo(() => {
    const totalQuestions = uploadedTests.reduce((accumulator, test) => accumulator + test.questions.length, 0)
    return { totalTests: uploadedTests.length, totalQuestions }
  }, [uploadedTests])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container max-w-6xl py-8 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{String(t("teacherDashboard.title"))}</h1>
          <p className="text-sm text-muted-foreground">{String(t("teacherDashboard.subtitle"))}</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{String(t("teacherDashboard.loading"))}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{String(t("teacherDashboard.assignedStudents"))}</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{String(t("teacherDashboard.noStudents"))}</p>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div
                        key={student.studentId}
                        className="rounded-lg border bg-muted/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {String(t("teacher.grade"))}: {student.grade || "-"} • {String(t("teacher.school"))}: {student.school || "-"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right min-w-[130px]">
                            <p className="text-xs text-muted-foreground">{String(t("teacherDashboard.avgScore"))}</p>
                            <p className="font-semibold text-foreground">{student.averageScorePercentage ?? "-"}{student.averageScorePercentage != null ? "%" : ""}</p>
                          </div>
                          <div className="text-right min-w-[120px]">
                            <p className="text-xs text-muted-foreground">{String(t("teacherDashboard.totalSessions"))}</p>
                            <p className="font-semibold text-foreground">{student.totalSessions ?? "-"}</p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/teacher/students/${student.studentId}`}>
                              {String(t("teacherDashboard.details"))}
                            </Link>
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
                <CardTitle>{String(t("teacherDashboard.uploadedTests"))}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="secondary">{String(t("teacherDashboard.tests"))}: {testsCountSummary.totalTests}</Badge>
                  <Badge variant="secondary">{String(t("teacherDashboard.questions"))}: {testsCountSummary.totalQuestions}</Badge>
                </div>

                {uploadedTests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{String(t("teacherDashboard.noTests"))}</p>
                ) : (
                  <div className="space-y-3">
                    {uploadedTests.map((test) => (
                      <div key={test.test_id} className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">#{test.test_id} • {test.name}</p>
                            <p className="text-xs text-muted-foreground">{String(t("tests.type"))}: {test.type} • {String(t("tests.language"))}: {test.language}</p>
                          </div>
                          <Badge variant="outline">{test.questions.length} {String(t("tests.questionsCount"))}</Badge>
                        </div>
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
