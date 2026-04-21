"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react"
import { testApi, ApiException } from "@/lib/api/test"
import type { SessionActivityDetail } from "@/lib/types/test"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/i18n/i18n-provider"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SessionDetailContentProps {
  sessionId: string
}

interface ImagePreviewState {
  src: string
  alt: string
  label: string
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
  const { t } = useI18n()

  const [isLoading, setIsLoading] = useState(true)
  const [detail, setDetail] = useState<SessionActivityDetail | null>(null)
  const [preview, setPreview] = useState<ImagePreviewState | null>(null)

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
            title: String(t("toasts.authRequired")),
            description: String(t("toasts.loginToSession")),
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        toast({
          title: String(t("toasts.couldNotLoadSession")),
          description: error instanceof Error ? error.message : String(t("toasts.failedLoadSession")),
          variant: "destructive",
        })
        setDetail(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [isValidSessionId, parsedSessionId, router, toast])

  const renderPreviewableImage = ({ src, alt, label }: ImagePreviewState) => (
    <button
      type="button"
      onClick={() => setPreview({ src, alt, label })}
      className="rounded-md border p-2 bg-muted/30 w-full text-left hover:border-primary/50 transition-colors"
      aria-label={`${String(t("sessionDetail.imagePreview"))} ${label}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto max-h-[140px] object-contain mx-auto"
      />
    </button>
  )

  return (
    <div className="container max-w-6xl py-8 px-4 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">{String(t("sessionDetail.title"))}</h1>
        <Button asChild variant="outline">
          <Link href="/profile">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {String(t("sessionDetail.back"))}
          </Link>
        </Button>
      </div>

      {!isValidSessionId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{String(t("sessionDetail.invalidId"))}</p>
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
            <p className="text-sm text-muted-foreground">{String(t("sessionDetail.unavailable"))}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{String(t("sessionDetail.summary"))}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{String(t("sessionDetail.sessionId"))}</p>
                  <p className="font-semibold text-foreground">{detail.sessionId}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{String(t("sessionDetail.testId"))}</p>
                  <p className="font-semibold text-foreground">{detail.testId}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{String(t("sessionDetail.result"))}</p>
                  <p className="font-semibold text-foreground">
                    {detail.correctAnswers}/{detail.totalQuestions}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{String(t("sessionDetail.score"))}</p>
                  <p className="font-semibold text-foreground">{detail.scorePercentage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{String(t("sessionDetail.takenAt"))}</p>
                  <p className="font-medium text-foreground">{toReadableDateTime(detail.testTakenTime)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{String(t("sessionDetail.verifiedAt"))}</p>
                  <p className="font-medium text-foreground">{toReadableDateTime(detail.verifiedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{String(t("sessionDetail.submittedAnswers"))}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-72 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{String(t("sessionDetail.question"))}</TableHead>
                      <TableHead>{String(t("sessionDetail.submitted"))} {String(t("sessionDetail.answer"))}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.submittedAnswers.map((item) => (
                      <TableRow key={`${item.questionId}-${item.answerId}`}>
                        <TableCell>
                          <div className="space-y-2 min-w-[220px]">
                            <p className="text-xs text-muted-foreground">Question #{item.questionId}</p>
                            {renderPreviewableImage({
                              src: testApi.getQuestionImageUrl(item.questionId),
                              alt: `Question ${item.questionId}`,
                              label: `Question #${item.questionId}`,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 min-w-[220px]">
                            <p className="text-xs text-muted-foreground">Answer #{item.answerId}</p>
                            {renderPreviewableImage({
                              src: testApi.getAnswerImageUrl(item.answerId),
                              alt: `Submitted answer ${item.answerId}`,
                              label: `Submitted answer #${item.answerId}`,
                            })}
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
              <CardTitle>{String(t("sessionDetail.perQuestion"))}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>{String(t("sessionDetail.question"))}</TableHead>
                      <TableHead>{String(t("sessionDetail.submitted"))}</TableHead>
                      <TableHead>{String(t("sessionDetail.correct"))}</TableHead>
                      <TableHead>{String(t("sessionDetail.status"))}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.results.map((result) => (
                      <TableRow key={result.position}>
                        <TableCell>{result.position}</TableCell>
                        <TableCell>
                          <div className="space-y-2 min-w-[220px]">
                            <p className="text-xs text-muted-foreground">Question #{result.questionId}</p>
                            {renderPreviewableImage({
                              src: testApi.getQuestionImageUrl(result.questionId),
                              alt: `Question ${result.questionId}`,
                              label: `Question #${result.questionId}`,
                            })}
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
                              {renderPreviewableImage({
                                src: testApi.getAnswerImageUrl(result.submittedAnswerId),
                                alt: `Submitted answer ${result.submittedAnswerId}`,
                                label: `Submitted answer #${result.submittedAnswerId}`,
                              })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 min-w-[220px]">
                            <p className="text-xs text-muted-foreground">Answer #{result.correctAnswerId}</p>
                            {renderPreviewableImage({
                              src: testApi.getAnswerImageUrl(result.correctAnswerId),
                              alt: `Correct answer ${result.correctAnswerId}`,
                              label: `Correct answer #${result.correctAnswerId}`,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-chart-3 font-medium">
                              <CheckCircle2 className="w-4 h-4" />
                              {String(t("sessionDetail.correctStatus"))}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-destructive font-medium">
                              <XCircle className="w-4 h-4" />
                              {String(t("sessionDetail.incorrectStatus"))}
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

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{preview?.label ?? String(t("sessionDetail.imagePreview"))}</DialogTitle>
            <DialogDescription>{String(t("sessionDetail.closeHint"))}</DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="rounded-md border p-2 bg-muted/30">
              <img
                src={preview.src}
                alt={preview.alt}
                className="w-full h-auto max-h-[75vh] object-contain mx-auto"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
