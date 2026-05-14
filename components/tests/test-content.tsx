"use client"

import React, { useMemo, useState } from "react"
import { Loader2, RefreshCw, CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { testApi, ApiException } from "@/lib/api/test"
import type {
  AvailableTest,
  RegisterTestSessionRequest,
  TestQuestionSlot,
  VerifyTestResponse,
} from "@/lib/types/test"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/i18n/i18n-provider"

interface AnswerOption {
  id: number
}

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = result[index]
    result[index] = result[randomIndex]
    result[randomIndex] = current
  }
  return result
}

function extractSessionId(response: unknown): number | null {
  if (typeof response === "number") return response
  if (!response || typeof response !== "object") return null

  const record = response as Record<string, unknown>
  const candidates = [record.sessionId, record.testSessionId, record.id, record.session_id]

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate
    }
    if (typeof candidate === "string" && candidate.trim()) {
      const parsed = Number(candidate)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return null
}

function buildPayload(test: AvailableTest, answers: Record<number, number | null>): RegisterTestSessionRequest {
  const ordered = [...test.questions].sort((a, b) => a.position - b.position)

  return {
    testId: test.test_id,
    testComponents: ordered.map((question) => ({
      id: question.position,
      answer_id: answers[question.question_id] ?? null,
      question_id: question.question_id,
    })),
  }
}

function getAnswerOptions(question: TestQuestionSlot): AnswerOption[] {
  const options: AnswerOption[] = [
    { id: question.correct_answer_id },
    ...question.incorrect_answer_ids.map((id) => ({ id })),
  ]

  return shuffleArray(options)
}

export function TestContent() {
  const { toast } = useToast()
  const { t } = useI18n()

  const typeOptions = ["math", "romanian", "history", "english", "physics", "chemistry", "biology", "informatics"]
  const languageOptions = ["ro", "en", "ru"]

  const [type, setType] = useState("math")
  const [language, setLanguage] = useState("ro")

  const [isLoadingTests, setIsLoadingTests] = useState(false)
  const [isGeneratingTest, setIsGeneratingTest] = useState(false)
  const [isStartingTest, setIsStartingTest] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [availableTests, setAvailableTests] = useState<AvailableTest[]>([])
  const [activeTest, setActiveTest] = useState<AvailableTest | null>(null)
  const [result, setResult] = useState<VerifyTestResponse | null>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<number, number | null>>({})

  const sortedQuestions = useMemo(() => {
    if (!activeTest) return []
    return [...activeTest.questions].sort((a, b) => a.position - b.position)
  }, [activeTest])

  const currentQuestion = sortedQuestions[currentQuestionIndex]
  const currentAnswerOptions = useMemo(() => {
    if (!currentQuestion) return []
    return getAnswerOptions(currentQuestion)
  }, [currentQuestion])

  const answeredCount = Object.values(answersByQuestionId).filter((value) => value !== null && value !== undefined).length
  const progressValue = sortedQuestions.length
    ? Math.round(((currentQuestionIndex + 1) / sortedQuestions.length) * 100)
    : 0

  const handleLoadTests = async () => {
    if (!type.trim()) {
      toast({
        title: String(t("toasts.typeRequired")),
        description: String(t("toasts.enterTypeBeforeLoad")),
        variant: "destructive",
      })
      return
    }

    setIsLoadingTests(true)

    try {
      const tests = await testApi.getTests(type.trim(), language.trim())
      setAvailableTests(tests)

      toast({
        title: String(t("toasts.testsLoaded")),
        description: `Found ${tests.length} available test(s)`,
      })
    } catch (error) {
      const message = error instanceof ApiException ? error.message : String(t("toasts.couldNotLoadTests"))
      toast({
        title: String(t("toasts.couldNotLoadTests")),
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoadingTests(false)
    }
  }

  const handleGenerateTest = async () => {
    if (!type.trim() || !language.trim()) {
      toast({
        title: String(t("toasts.missingFields")),
        description: String(t("toasts.typeLanguageRequired")),
        variant: "destructive",
      })
      return
    }

    setIsGeneratingTest(true)

    try {
      const generated = await testApi.generateTest({
        type: type.trim(),
        language: language.trim(),
      })

      setAvailableTests((previous) => {
        const withoutCurrent = previous.filter((item) => item.test_id !== generated.test_id)
        return [generated, ...withoutCurrent]
      })

      toast({
        title: String(t("toasts.testGenerated")),
        description: `Test #${generated.test_id} is ready`,
      })
    } catch (error) {
      const message = error instanceof ApiException ? error.message : String(t("toasts.generationFailed"))
      toast({
        title: String(t("toasts.generationFailed")),
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsGeneratingTest(false)
    }
  }

  const handleStartTest = async (test: AvailableTest) => {
    setIsStartingTest(true)

    try {
      const detailedTest = await testApi.getTestById(test.test_id)

      setActiveTest(detailedTest)
      setResult(null)
      setSessionId(null)
      setCurrentQuestionIndex(0)
      setAnswersByQuestionId({})
    } catch (error) {
      const message = error instanceof ApiException ? error.message : String(t("toasts.couldNotStartTest"))
      toast({
        title: String(t("toasts.couldNotStartTest")),
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsStartingTest(false)
    }
  }

  const handleSelectAnswer = (questionId: number, answerId: number) => {
    setAnswersByQuestionId((previous) => ({
      ...previous,
      [questionId]: answerId,
    }))
  }

  const handleSubmitTest = async () => {
    if (!activeTest) return

    const hasMissingAnswers = sortedQuestions.some((question) => {
      const selectedAnswer = answersByQuestionId[question.question_id]
      return selectedAnswer === null || selectedAnswer === undefined
    })

    if (hasMissingAnswers) {
      toast({
        title: String(t("toasts.completeAll")),
        description: String(t("toasts.chooseEveryAnswer")),
        variant: "destructive",
      })
      return
    }

    const payload = buildPayload(activeTest, answersByQuestionId)
    setIsSubmitting(true)

    try {
      const registerResponse = await testApi.registerTestSession(payload)
      const extractedSessionId = extractSessionId(registerResponse)

      if (!extractedSessionId) {
        throw new Error("Session ID missing from register response")
      }

      setSessionId(extractedSessionId)

      const verifyResponse = await testApi.verifyTest(extractedSessionId, payload)
      setResult(verifyResponse)

      toast({
        title: String(t("toasts.testVerified")),
        description: `Score: ${verifyResponse.scorePercentage}%`,
      })
    } catch (error) {
      const message = error instanceof ApiException ? error.message : String(t("toasts.submissionFailed"))
      toast({
        title: String(t("toasts.submissionFailed")),
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedAnswerForCurrentQuestion = currentQuestion
    ? answersByQuestionId[currentQuestion.question_id]
    : null

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container max-w-6xl py-8 px-4 space-y-6">
        {!activeTest && !result && (
          <Card>
            <CardHeader>
              <CardTitle>{String(t("tests.takeTest"))}</CardTitle>
              <CardDescription>
                {String(t("tests.intro"))}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{String(t("tests.type"))}</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{String(t("tests.language"))}</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <Button onClick={handleLoadTests} disabled={isLoadingTests}>
                    {isLoadingTests ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {String(t("tests.loading"))}
                      </>
                    ) : (
                      String(t("tests.loadTests"))
                    )}
                  </Button>

                  <Button variant="outline" onClick={handleGenerateTest} disabled={isGeneratingTest}>
                    {isGeneratingTest ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {String(t("tests.generating"))}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {String(t("tests.generateTest"))}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {String(t("tests.availableTests"))}
                </h3>

                {availableTests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{String(t("tests.noTests"))}</p>
                ) : (
                  <div className="grid gap-3">
                    {availableTests.map((test) => (
                      <div
                        key={test.test_id}
                        className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{test.name || `Test #${test.test_id}`}</Badge>
                            <Badge variant="outline">{test.type}</Badge>
                            <Badge variant="outline">{test.language}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {test.questions.length} {String(t("tests.questionsCount"))}
                          </p>
                        </div>

                        <Button onClick={() => void handleStartTest(test)} disabled={isStartingTest}>
                          {isStartingTest ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {String(t("tests.loading"))}
                            </>
                          ) : (
                            String(t("tests.startTest"))
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTest && !result && currentQuestion && (
          <>
            <Card>
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{activeTest.name || `Test #${activeTest.test_id}`}</CardTitle>
                  <Badge variant="outline">
                    {String(t("tests.question"))} {currentQuestionIndex + 1} / {sortedQuestions.length}
                  </Badge>
                </div>
                <Progress value={progressValue} />
                <CardDescription>
                  {String(t("tests.answered"))} {answeredCount} / {sortedQuestions.length}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{String(t("tests.questionImage"))}</CardTitle>
                <CardDescription>
                  {String(t("tests.position"))} {currentQuestion.position} · {String(t("tests.questionId"))} {currentQuestion.question_id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-2 bg-muted/40">
                  <img
                    src={testApi.getQuestionImageUrl(currentQuestion.question_id)}
                    alt={`Question ${currentQuestion.position}`}
                    className="w-full h-auto max-h-[420px] object-contain mx-auto"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{String(t("tests.chooseAnswer"))}</CardTitle>
                <CardDescription>{String(t("tests.selectedStored"))}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {currentAnswerOptions.map((option, index) => {
                  const isSelected = selectedAnswerForCurrentQuestion === option.id

                  return (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => handleSelectAnswer(currentQuestion.question_id, option.id)}
                      className={`text-left border rounded-lg p-3 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{String(t("tests.option"))} {index + 1}</span>
                        {isSelected && <Badge>{String(t("tests.selected"))}</Badge>}
                      </div>
                      <div className="rounded-md border p-2 bg-muted/30">
                        <img
                          src={testApi.getAnswerImageUrl(option.id)}
                          alt={`Answer option ${index + 1}`}
                          className="w-full h-auto max-h-[220px] object-contain mx-auto"
                        />
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex((previous) => Math.max(previous - 1, 0))}
                disabled={currentQuestionIndex === 0 || isSubmitting}
              >
                {String(t("tests.previous"))}
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex < sortedQuestions.length - 1 ? (
                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex((previous) =>
                        Math.min(previous + 1, sortedQuestions.length - 1),
                      )
                    }
                    disabled={isSubmitting}
                  >
                    {String(t("tests.next"))}
                  </Button>
                ) : (
                  <>
                    {selectedAnswerForCurrentQuestion !== null && selectedAnswerForCurrentQuestion !== undefined ? (
                      <Button onClick={handleSubmitTest} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {String(t("tests.submitting"))}
                          </>
                        ) : (
                          String(t("tests.finishVerify"))
                        )}
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground self-center">
                        {String(t("tests.selectToSubmit"))}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {result && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{String(t("tests.result"))}</CardTitle>
                <CardDescription>
                  Session ID: {sessionId ?? result.sessionId} · Verified at: {new Date(result.verifiedAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">{String(t("tests.score"))}</p>
                  <p className="text-2xl font-bold">{result.scorePercentage}%</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">{String(t("tests.correct"))}</p>
                  <p className="text-2xl font-bold">{result.correctAnswers}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">{String(t("tests.skipped"))}</p>
                  <p className="text-2xl font-bold">{result.skipped}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">{String(t("tests.total"))}</p>
                  <p className="text-2xl font-bold">{result.totalQuestions}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{String(t("tests.perQuestionStatus"))}</CardTitle>
                <CardDescription>{String(t("tests.verificationDetails"))}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.detailedResults
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((detail) => (
                    <div key={detail.id} className="border rounded-md p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{String(t("tests.question"))} {detail.position}</p>
                        <p className="text-sm text-muted-foreground">
                          {String(t("tests.submitted"))}: {detail.submittedAnswerId ?? String(t("tests.skippedValue"))} · {String(t("tests.correct"))}: {detail.correctAnswerId}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {detail.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-accent" />
                            <span className="text-sm">{String(t("tests.correct"))}</span>
                          </>
                        ) : detail.submittedAnswerId === null ? (
                          <>
                            <MinusCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{String(t("tests.skipped"))}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-destructive" />
                            <span className="text-sm">{String(t("tests.incorrect"))}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setActiveTest(null)
                  setResult(null)
                  setSessionId(null)
                  setCurrentQuestionIndex(0)
                  setAnswersByQuestionId({})
                }}
              >
                {String(t("tests.takeAnother"))}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
