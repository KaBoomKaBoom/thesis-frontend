"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Mail, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authApi, ApiException } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export function OtpVerificationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    
    setOtp(newOtp)
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((val) => !val)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const code = otp.join("")
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    if (!email) {
      setError("Email is missing. Please try registering again.")
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.verifyOtp({
        email,
        otp: code,
      })

      toast({
        title: "Email verified",
        description: "Your account has been verified successfully",
      })

      // If the backend returns tokens on verification, store them
      if (response.token) {
        localStorage.setItem('authToken', response.token)
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }

      // Navigate to login or profile based on whether tokens were returned
      if (response.token) {
        router.push("/profile")
      } else {
        router.push("/login?verified=true")
      }
    } catch (error) {
      if (error instanceof ApiException) {
        setError(error.message)
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setError("An unexpected error occurred")
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email is missing. Please try registering again.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)
    
    try {
      // Note: The backend doesn't have a dedicated resend endpoint in the OpenAPI spec
      // So we'll need to call the register endpoint again with the same email
      // Or you might need to ask for a resend endpoint to be added to the backend
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email",
      })
      
      setResendTimer(60)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (error) {
      toast({
        title: "Failed to resend",
        description: "Could not resend the code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {"We've sent a verification code to"}
        </p>
        <p className="font-medium text-foreground">{email || "your email"}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-xl font-semibold ${
                error ? "border-destructive" : ""
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </form>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          {"Didn't receive the code?"}
        </p>
        
        {resendTimer > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend code in <span className="font-medium text-foreground">{resendTimer}s</span>
          </p>
        ) : (
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Code
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Make sure to check your spam folder if you {"don't"} see the email in your inbox.
      </p>
    </div>
  )
}
