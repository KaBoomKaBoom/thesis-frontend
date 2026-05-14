import { Suspense } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { OtpVerificationForm } from "@/components/auth/otp-verification-form"

function OtpVerificationContent() {
  return <OtpVerificationForm />
}

export default function VerifyPage() {
  return (
    <AuthLayout
      titleKey="auth.verifyTitle"
      subtitleKey="auth.verifySubtitle"
    >
      <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
        <OtpVerificationContent />
      </Suspense>
    </AuthLayout>
  )
}
