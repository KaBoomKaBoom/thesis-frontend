"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { teacherApi, ApiException as TeacherApiException } from "@/lib/api/teacher"
import { userApi, ApiException as UserApiException } from "@/lib/api/user"
import { getUserIdFromJwt } from "@/lib/auth-token"
import type {
  TeacherQuestionType,
  TeacherStudent,
  TeacherStudentsQuery,
  TeacherStudentsResponse,
  TeacherTestLanguage,
  TeacherUploadBaremResponse,
  TeacherUploadTestResponse,
} from "@/lib/types/teacher"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/i18n/i18n-provider"

const DEFAULT_PAGE_SIZE = 10

const languageOptions: Array<{ value: TeacherTestLanguage; labelKey: string }> = [
  { value: "ro", labelKey: "teacher.langRo" },
  { value: "ru", labelKey: "teacher.langRu" },
  { value: "eng", labelKey: "teacher.langEng" },
]

const questionTypeOptions: Array<{ value: TeacherQuestionType; labelKey: string }> = [
  { value: "math", labelKey: "teacher.qtMath" },
  { value: "romanian", labelKey: "teacher.qtRomanian" },
  { value: "history", labelKey: "teacher.qtHistory" },
  { value: "physics", labelKey: "teacher.qtPhysics" },
  { value: "chemistry", labelKey: "teacher.qtChemistry" },
  { value: "biology", labelKey: "teacher.qtBiology" },
  { value: "geography", labelKey: "teacher.qtGeography" },
  { value: "computer_science", labelKey: "teacher.qtComputerScience" },
  { value: "engineering", labelKey: "teacher.qtEngineering" },
  { value: "other", labelKey: "teacher.qtOther" },
]

function getUniqueValues(items: TeacherStudent[], pick: (student: TeacherStudent) => string | null | undefined) {
  return Array.from(
    new Set(
      items
        .map((student) => (pick(student) || "").trim())
        .filter((value) => value.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b))
}

export function TeacherStudentsContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigningId, setIsAssigningId] = useState<number | null>(null)
  const [studentsData, setStudentsData] = useState<TeacherStudentsResponse | null>(null)
  const [teacherUserId, setTeacherUserId] = useState<number | null>(null)

  const [testFiles, setTestFiles] = useState<File[]>([])
  const [baremFile, setBaremFile] = useState<File | null>(null)
  const [testLanguage, setTestLanguage] = useState<TeacherTestLanguage>("ro")
  const [questionType, setQuestionType] = useState<TeacherQuestionType>("math")
  const [isUploadingTest, setIsUploadingTest] = useState(false)
  const [isUploadingBarem, setIsUploadingBarem] = useState(false)
  const [testUploadResult, setTestUploadResult] = useState<TeacherUploadTestResponse | null>(null)
  const [baremUploadResult, setBaremUploadResult] = useState<TeacherUploadBaremResponse | null>(null)

  const [name, setName] = useState("")
  const [grade, setGrade] = useState("all")
  const [school, setSchool] = useState("all")
  const [location, setLocation] = useState("all")
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pageNumber, setPageNumber] = useState(1)

  const query = useMemo<TeacherStudentsQuery>(() => {
    return {
      pageNumber,
      pageSize,
      name: name.trim() || undefined,
      grade: grade === "all" ? undefined : grade,
      school: school === "all" ? undefined : school,
      location: location === "all" ? undefined : location,
    }
  }, [grade, location, name, pageNumber, pageSize, school])

  const fetchStudents = useCallback(async (nextQuery: TeacherStudentsQuery) => {
    setIsLoading(true)
    try {
      const response = await teacherApi.getStudents(nextQuery)
      setStudentsData(response)
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
        title: String(t("toasts.couldNotLoadStudents")),
        description: error instanceof Error ? error.message : String(t("toasts.failedLoadStudents")),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [router, t, toast])

  useEffect(() => {
    const verifyTeacherAccess = async () => {
      try {
        const jwtTeacherId = getUserIdFromJwt(localStorage.getItem("authToken"))

        const profile = await userApi.getProfile()
        if (profile.role.toLowerCase() !== "teacher") {
          toast({
            title: String(t("toasts.accessDenied")),
            description: String(t("toasts.teacherOnly")),
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        const resolvedTeacherId =
          jwtTeacherId ??
          (typeof profile.userId === "number"
            ? profile.userId
            : typeof profile.id === "number"
              ? profile.id
              : null)

        if (resolvedTeacherId !== null) {
          setTeacherUserId(resolvedTeacherId)
        }

        setIsAuthorized(true)
      } catch (error) {
        if (error instanceof UserApiException && error.status === 401) {
          toast({
            title: String(t("toasts.authRequired")),
            description: String(t("toasts.loginToTeacher")),
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        toast({
          title: String(t("toasts.accessDenied")),
          description: error instanceof Error ? error.message : String(t("toasts.teacherOnly")),
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    }

    verifyTeacherAccess()
  }, [router, t, toast])

  useEffect(() => {
    if (!isAuthorized) return
    fetchStudents(query)
  }, [fetchStudents, isAuthorized, query])

  const gradeOptions = useMemo(() => getUniqueValues(studentsData?.students || [], (student) => student.grade), [studentsData])
  const schoolOptions = useMemo(() => getUniqueValues(studentsData?.students || [], (student) => student.school), [studentsData])
  const locationOptions = useMemo(() => getUniqueValues(studentsData?.students || [], (student) => student.location), [studentsData])

  const handleResetFilters = () => {
    setName("")
    setGrade("all")
    setSchool("all")
    setLocation("all")
    setPageNumber(1)
  }

  const handleAssignMe = async (studentId: number) => {
    setIsAssigningId(studentId)
    try {
      await teacherApi.assignMe(studentId)
      toast({
        title: String(t("toasts.success")),
        description: String(t("toasts.studentAssigned")),
      })
      await fetchStudents(query)
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
        title: String(t("toasts.failedAssignStudent")),
        description: error instanceof Error ? error.message : String(t("toasts.unexpected")),
        variant: "destructive",
      })
    } finally {
      setIsAssigningId(null)
    }
  }

  const handleUploadTest = async () => {
    if (testFiles.length === 0) {
      toast({
        title: String(t("toasts.missingFields")),
        description: String(t("toasts.selectTestPdf")),
        variant: "destructive",
      })
      return
    }

    if (!teacherUserId || teacherUserId <= 0) {
      toast({
        title: String(t("toasts.missingFields")),
        description: String(t("toasts.teacherIdRequired")),
        variant: "destructive",
      })
      return
    }

    setIsUploadingTest(true)
    try {
      const response = await teacherApi.uploadTestPdf({
        files: testFiles,
        userId: teacherUserId,
        questionType,
        language: testLanguage,
      })

      setTestUploadResult(response)
      toast({
        title: String(t("toasts.success")),
        description: String(t("toasts.testUploaded")),
      })
    } catch (error) {
      toast({
        title: String(t("toasts.couldNotUploadTest")),
        description: error instanceof Error ? error.message : String(t("toasts.failedUploadTest")),
        variant: "destructive",
      })
    } finally {
      setIsUploadingTest(false)
    }
  }

  const handleUploadBarem = async () => {
    if (!baremFile) {
      toast({
        title: String(t("toasts.missingFields")),
        description: String(t("toasts.selectBaremPdf")),
        variant: "destructive",
      })
      return
    }

    setIsUploadingBarem(true)
    try {
      const response = await teacherApi.uploadBaremPdf(baremFile)
      setBaremUploadResult(response)

      toast({
        title: String(t("toasts.success")),
        description: String(t("toasts.baremUploaded")),
      })
    } catch (error) {
      toast({
        title: String(t("toasts.couldNotUploadBarem")),
        description: error instanceof Error ? error.message : String(t("toasts.failedUploadBarem")),
        variant: "destructive",
      })
    } finally {
      setIsUploadingBarem(false)
    }
  }

  const hasStudents = (studentsData?.students?.length || 0) > 0

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container max-w-6xl py-8 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{String(t("teacher.title"))}</h1>
          <p className="text-sm text-muted-foreground">{String(t("teacher.subtitle"))}</p>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="students">{String(t("teacher.studentsTab"))}</TabsTrigger>
            <TabsTrigger value="test-management">{String(t("teacher.testManagementTab"))}</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{String(t("teacher.search"))}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Input
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value)
                      setPageNumber(1)
                    }}
                    placeholder={String(t("teacher.searchName"))}
                  />

                  <Select value={grade} onValueChange={(value) => { setGrade(value); setPageNumber(1) }}>
                    <SelectTrigger>
                      <SelectValue placeholder={String(t("teacher.grade"))} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{String(t("teacher.allGrades"))}</SelectItem>
                      {gradeOptions.map((value) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={school} onValueChange={(value) => { setSchool(value); setPageNumber(1) }}>
                    <SelectTrigger>
                      <SelectValue placeholder={String(t("teacher.school"))} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{String(t("teacher.allSchools"))}</SelectItem>
                      {schoolOptions.map((value) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={location} onValueChange={(value) => { setLocation(value); setPageNumber(1) }}>
                    <SelectTrigger>
                      <SelectValue placeholder={String(t("teacher.location"))} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{String(t("teacher.allLocations"))}</SelectItem>
                      {locationOptions.map((value) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => fetchStudents(query)}>{String(t("teacher.search"))}</Button>
                  <Button variant="outline" onClick={handleResetFilters}>{String(t("teacher.reset"))}</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle>{String(t("teacher.students"))}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{String(t("teacher.pageSize"))}</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPageSize(Number(value))
                      setPageNumber(1)
                    }}
                  >
                    <SelectTrigger className="w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">{String(t("teacher.loading"))}</p>
                ) : !hasStudents ? (
                  <p className="text-sm text-muted-foreground">{String(t("teacher.noStudents"))}</p>
                ) : (
                  <div className="space-y-3">
                    {studentsData?.students.map((student) => (
                      <div
                        key={student.studentId}
                        className="rounded-lg border bg-muted/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {String(t("teacher.grade"))}: {student.grade || "-"} • {String(t("teacher.school"))}: {student.school || "-"} • {String(t("teacher.location"))}: {student.location || "-"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={student.teacherId ? "default" : "secondary"}>
                            {student.teacherId ? String(t("teacher.assigned")) : String(t("teacher.unassigned"))}
                          </Badge>
                          {!student.teacherId ? (
                            <Button
                              onClick={() => handleAssignMe(student.studentId)}
                              disabled={isAssigningId === student.studentId}
                            >
                              {isAssigningId === student.studentId ? String(t("teacher.assigning")) : String(t("teacher.assignMe"))}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {String(t("teacher.page"))} {studentsData?.pageNumber || pageNumber} {String(t("teacher.of"))} {studentsData?.totalPages || 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPageNumber((previous) => Math.max(1, previous - 1))}
                      disabled={(studentsData?.pageNumber || pageNumber) <= 1 || isLoading}
                    >
                      {String(t("teacher.previous"))}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPageNumber((previous) => previous + 1)}
                      disabled={isLoading || (studentsData ? studentsData.pageNumber >= studentsData.totalPages : true)}
                    >
                      {String(t("teacher.next"))}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test-management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{String(t("teacher.uploadTestTitle"))}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{String(t("teacher.languageLabel"))}</Label>
                    <Select value={testLanguage} onValueChange={(value) => setTestLanguage(value as TeacherTestLanguage)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {String(t(option.labelKey))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{String(t("teacher.questionTypeLabel"))}</Label>
                    <Select value={questionType} onValueChange={(value) => setQuestionType(value as TeacherQuestionType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {String(t(option.labelKey))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-pdf">{String(t("teacher.testPdf"))}</Label>
                    <Input
                      id="test-pdf"
                      type="file"
                      multiple
                      accept="application/pdf"
                      onChange={(event) => setTestFiles(Array.from(event.target.files || []))}
                    />
                  </div>
                </div>

                <Button onClick={handleUploadTest} disabled={isUploadingTest}>
                  {isUploadingTest ? String(t("teacher.uploading")) : String(t("teacher.uploadTestButton"))}
                </Button>

                {testUploadResult ? (
                  <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                    <p className="font-medium text-foreground">{String(t("teacher.uploadTestResult"))}</p>
                    <p className="text-sm text-muted-foreground">
                      {String(t("teacher.totalFiles"))}: {testUploadResult.total_files} • {String(t("teacher.processed"))}: {testUploadResult.processed} • {String(t("teacher.failed"))}: {testUploadResult.failed}
                    </p>
                    <div className="space-y-2">
                      {testUploadResult.results.map((result, index) => (
                        <div key={`${result.filename}-${index}`} className="rounded-md border p-3 bg-background">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">{result.filename}</p>
                            <Badge variant={result.success ? "default" : "destructive"}>
                              {result.success ? String(t("teacher.successStatus")) : String(t("teacher.failedStatus"))}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Test ID: {result.test_id ?? "-"} • {String(t("teacher.teacherId"))}: {result.userId ?? "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{String(t("teacher.uploadBaremTitle"))}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barem-pdf">{String(t("teacher.baremPdf"))}</Label>
                  <Input
                    id="barem-pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => setBaremFile(event.target.files?.[0] || null)}
                  />
                </div>

                <Button onClick={handleUploadBarem} disabled={isUploadingBarem}>
                  {isUploadingBarem ? String(t("teacher.uploading")) : String(t("teacher.uploadBaremButton"))}
                </Button>

                {baremUploadResult ? (
                  <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                    <p className="font-medium text-foreground">{String(t("teacher.uploadBaremResult"))}</p>
                    <p className="text-sm text-muted-foreground">{baremUploadResult.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {String(t("teacher.answersSaved"))}: {baremUploadResult.answers_saved}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
