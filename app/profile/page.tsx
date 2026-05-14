import { DashboardHeader } from "@/components/dashboard/header"
import { ProfileContent } from "@/components/profile/profile-content"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main>
        <ProfileContent />
      </main>
    </div>
  )
}
