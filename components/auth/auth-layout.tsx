"use client"

import React from "react"

import { BookOpen, GraduationCap, Target, TrendingUp } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">ExamPrep</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight text-balance">
            Prepare for success in your national exams
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Join thousands of Moldovan students preparing for BAC and 9th grade graduation exams with our curriculum-aligned practice tests.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <FeatureCard
              icon={<BookOpen className="w-5 h-5" />}
              title="Curriculum Aligned"
              description="Tests based on official Moldovan curriculum"
            />
            <FeatureCard
              icon={<Target className="w-5 h-5" />}
              title="Instant Feedback"
              description="Get explanations for every answer"
            />
            <FeatureCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Track Progress"
              description="Monitor your improvement over time"
            />
            <FeatureCard
              icon={<GraduationCap className="w-5 h-5" />}
              title="Mock Exams"
              description="Practice under real exam conditions"
            />
          </div>
        </div>

        <div className="relative z-10 text-primary-foreground/60 text-sm">
          Trusted by students across Moldova
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">ExamPrep</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
      <div className="text-primary-foreground mb-2">{icon}</div>
      <h3 className="font-semibold text-primary-foreground text-sm">{title}</h3>
      <p className="text-primary-foreground/70 text-xs mt-1">{description}</p>
    </div>
  )
}
