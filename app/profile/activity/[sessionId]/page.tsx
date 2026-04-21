import { DashboardHeader } from "@/components/dashboard/header"
import { SessionDetailContent } from "@/components/profile/session-detail-content"

interface SessionDetailPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { sessionId } = await params

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main>
        <SessionDetailContent sessionId={sessionId} />
      </main>
    </div>
  )
}
