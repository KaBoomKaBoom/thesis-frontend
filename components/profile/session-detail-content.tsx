"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react"
import { testApi, ApiException } from "@/lib/api/test"
import type { SessionActivityDetail } from "@/lib/types/test"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SessionDetailContentProps {
  sessionId: string
}

function toReadableDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function SessionDetailContent({ sessionId }: SessionDetailContentProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [detail, setDetail] = useState<SessionActivityDetail | null>(null)

  const parsedSessionId = useMemo(() => Number(sessionId), [sessionId])
  const isValidSessionId = Number.isFinite(parsedSessionId) && parsedSessionId > 0

  useEffect(() => {
    if (!isValidSessionId) {
      setIsLoading(false)
      return
    }

    const loadSession = async () => {
      setIsLoading(true)
      try {
        const response = await testApi.getActivitySessionById(parsedSessionId)
        setDetail(response)
      } catch (error) {
        if (error instanceof ApiException && error.status === 401) {
          toast({
            title: "Authentication required",
            description: "Please log in to view session details",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        toast({
          title: "Could not load session",
          description: error instanceof Error ? error.message : "Failed to load session details",
          variant: "destructive",
        })
        setDetail(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [isValidSessionId, parsedSessionId, router, toast])

  return (
    <div className="container max-w-6xl py-8 px-4 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Session Details</h1>
        <Button asChild variant="outline">
          <Link href="/profile">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
      </div>

      {!isValidSessionId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Invalid session ID.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : !detail ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Session details are not available.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Session ID</p>
                  <p className="font-semibold text-foreground">{detail.sessionId}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Test ID</p>
                  <p className="font-semibold text-foreground">{detail.testId}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Result</p>
                  <p className="font-semibold text-foreground">
                    {detail.correctAnswers}/{detail.totalQuestions}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="font-semibold text-foreground">{detail.scorePercentage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Taken at</p>
                  <p className="font-medium text-foreground">{toReadableDateTime(detail.testTakenTime)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Verified at</p>
                  <p className="font-medium text-foreground">{toReadableDateTime(detail.verifiedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submitted Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-72 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Submitted Answer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.submittedAnswers.map((item) => (
                      <TableRow key={`${item.questionId}-${item.answerId}`}>
                        <TableCell>
                          <div className="space-y-2 min-w-[220px]">
                            <p className="text-xs text-muted-foreground">Question #{item.questionId}</p>
                            <div className="rounded-md border p-2 bg-muted/30">
                              <img
                                src={testApi.getQuestionImageUrl(item.questionId)}
                                alt={`Question ${item.questionId}`}
                                className="w-full h-auto max-h-[140px] object-contain mx-auto"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 min-w-[220px]">
                            <p className="text-xs text-muted-foreground">Answer #{item.answerId}</p>
                            <div className="rounded-md border p-2 bg-muted/30">
                              <img
                                src={testApi.getAnswerImageUrl(item.answerId)}
                                alt={`Submitted answer ${item.answerId}`}
                                className="w-full h-auto max-h-[140px] object-contain mx-auto"
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Per-Question Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Correct</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.results.map((result) => (
                      <TableRow key={result.position}>
                        <TableCell>{result.position}</TableCell>
                        <TableCell>
                          <div className="space-y-2 min-w-[220px]">
                            <p className="text-xs text-muted-foreground">Question #{result.questionId}</p>
                            <div className="rounded-md border p-2 bg-muted/30">
                              <img
                                src={testApi.getQuestionImageUrl(result.questionId)}
                                alt={`Question ${result.questionId}`}
                                className="w-full h-auto max-h-[140px] object-contain mx-auto"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.submittedAnswerId === null ? (
                            <span className="text-sm text-muted-foreground">-</span>
                          ) : (
                            <div className="space-y-2 min-w-[220px]">
                              <p className="text-xs text-muted-foreground">
                                Answer #{result.submittedAnswerId}
                              </p>
                              <div className="rounded-md border p-2 bg-muted/30">
                                <img
                                  src={testApi.getAnswerImageUrl(result.submittedAnswerId)}
                                  alt={`Submitted answer ${result.submittedAnswerId}`}
                                  className="w-full h-auto max-h-[140px] object-contain mx-auto"
                                />
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 min-w-[220px]">
                            <p className="text-xs text-muted-foreground">Answer #{result.correctAnswerId}</p>
                            <div className="rounded-md border p-2 bg-muted/30">
                              <img
                                src={testApi.getAnswerImageUrl(result.correctAnswerId)}
                                alt={`Correct answer ${result.correctAnswerId}`}
                                className="w-full h-auto max-h-[140px] object-contain mx-auto"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-chart-3 font-medium">
                              <CheckCircle2 className="w-4 h-4" />
                              Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-destructive font-medium">
                              <XCircle className="w-4 h-4" />
                              Incorrect
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
