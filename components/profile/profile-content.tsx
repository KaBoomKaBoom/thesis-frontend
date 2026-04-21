"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Edit2,
  Camera,
  Save,
  X,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  Loader2,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { userApi, ApiException } from "@/lib/api/user"
import { testApi } from "@/lib/api/test"
import type { SessionActivitySummary } from "@/lib/types/test"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  dateOfBirth: string
  role: string
  gradeLevel: string
  school: string
  bio: string
  avatar?: string
}

export function ProfileContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [sessions, setSessions] = useState<SessionActivitySummary[]>([])
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    role: "",
    gradeLevel: "",
    school: "",
    bio: "",
  })

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile)

  useEffect(() => {
    fetchProfile()
    fetchActivitySessions()
  }, [])

  const toReadableDateTime = (value: string) => {
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

  const getErrorStatus = (error: unknown) => {
    if (typeof error === "object" && error !== null && "status" in error) {
      return Number((error as { status: number }).status)
    }

    return null
  }

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message
    }

    return fallback
  }

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const data = await userApi.getProfile()
      
      const userProfile: UserProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || "",
        location: data.location || "",
        dateOfBirth: data.dateOfBirth || "",
        role: data.role,
        gradeLevel: data.gradeLevel || "",
        school: data.school || "",
        bio: data.bio || "",
      }
      
      setProfile(userProfile)
      setEditedProfile(userProfile)
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.status === 401) {
          toast({
            title: "Authentication required",
            description: "Please log in to view your profile",
            variant: "destructive",
          })
          router.push("/login")
        } else {
          toast({
            title: "Error loading profile",
            description: error.message,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActivitySessions = async () => {
    setIsLoadingSessions(true)
    try {
      const response = await testApi.getActivitySessions()
      setSessions(response)
    } catch (error) {
      const errorStatus = getErrorStatus(error)

      if (errorStatus === 401) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your session activity",
          variant: "destructive",
        })
        router.push("/login")
      } else {
        toast({
          title: "Could not load activity",
          description: getErrorMessage(error, "Failed to load your sessions"),
          variant: "destructive",
        })
      }

      setSessions([])
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updateData = {
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        email: editedProfile.email,
        phoneNumber: editedProfile.phone,
        location: editedProfile.location,
        gradeLevel: editedProfile.gradeLevel,
        school: editedProfile.school,
        biography: editedProfile.bio,
      }

      const response = await userApi.updateProfile(updateData)
      
      // Update profile with the response data
      const updatedProfile: UserProfile = {
        firstName: response.profile.firstName,
        lastName: response.profile.lastName,
        email: response.profile.email,
        phone: response.profile.phone || "",
        location: response.profile.location || "",
        dateOfBirth: response.profile.dateOfBirth || "",
        role: response.profile.role,
        gradeLevel: response.profile.gradeLevel || "",
        school: response.profile.school || "",
        bio: response.profile.bio || "",
      }
      
      setProfile(updatedProfile)
      setEditedProfile(updatedProfile)
      setIsEditing(false)
      
      toast({
        title: "Profile updated",
        description: response.message || "Your profile has been updated successfully",
      })
    } catch (error) {
      if (error instanceof ApiException) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred while updating your profile",
          variant: "destructive",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const stats = [
    {
      label: "Tests Completed",
      value: 47,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      label: "Average Score",
      value: "78%",
      icon: Target,
      color: "text-accent",
    },
    {
      label: "Study Hours",
      value: 124,
      icon: TrendingUp,
      color: "text-chart-3",
    },
    {
      label: "Achievements",
      value: 12,
      icon: Award,
      color: "text-chart-5",
    },
  ]

  const achievements = [
    { name: "First Test", description: "Complete your first test", earned: true },
    { name: "Week Streak", description: "Study 7 days in a row", earned: true },
    { name: "Perfect Score", description: "Get 100% on any test", earned: false },
    { name: "Math Master", description: "Complete 50 math tests", earned: false },
  ]

  const initials = profile.firstName && profile.lastName 
    ? `${profile.firstName[0]}${profile.lastName[0]}`
    : "?"

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8 px-4">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8 px-4">
      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-24 h-24 md:w-32 md:h-32">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl md:text-3xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        {profile.firstName} {profile.lastName}
                      </h1>
                      <p className="text-muted-foreground">
                        {profile.role === "student"
                          ? `${profile.gradeLevel}th Grade Student`
                          : profile.role.charAt(0).toUpperCase() +
                            profile.role.slice(1)}
                      </p>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      BAC 2026
                    </Badge>
                    <Badge variant="secondary">
                      <MapPin className="w-3 h-3 mr-1" />
                      {profile.location}
                    </Badge>
                    <Badge variant="outline">Real Profile</Badge>
                  </div>

                  {profile.bio && (
                    <p className="text-muted-foreground text-sm">{profile.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editedProfile.firstName}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editedProfile.lastName}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editedProfile.phone}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editedProfile.location}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={editedProfile.dateOfBirth}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade Level</Label>
                    <Select
                      value={editedProfile.gradeLevel}
                      onValueChange={(value) =>
                        setEditedProfile({ ...editedProfile, gradeLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9">9th Grade</SelectItem>
                        <SelectItem value="10">10th Grade</SelectItem>
                        <SelectItem value="11">11th Grade</SelectItem>
                        <SelectItem value="12">12th Grade (BAC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">School</Label>
                    <Input
                      id="school"
                      value={editedProfile.school}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          school: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editedProfile.bio}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, bio: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField
                    icon={<User className="w-4 h-4" />}
                    label="Full Name"
                    value={`${profile.firstName} ${profile.lastName}`}
                  />
                  <ProfileField
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    value={profile.email}
                  />
                  <ProfileField
                    icon={<Phone className="w-4 h-4" />}
                    label="Phone"
                    value={profile.phone}
                  />
                  <ProfileField
                    icon={<MapPin className="w-4 h-4" />}
                    label="Location"
                    value={profile.location}
                  />
                  <ProfileField
                    icon={<Calendar className="w-4 h-4" />}
                    label="Date of Birth"
                    value={new Date(profile.dateOfBirth).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  />
                  <ProfileField
                    icon={<GraduationCap className="w-4 h-4" />}
                    label="School"
                    value={profile.school}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Taken Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions found.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, index) => {
                    return (
                      <div
                        key={`${session.sessionId}-${session.testTakenTime}-${index}`}
                        className="w-full text-left p-4 rounded-lg border bg-muted/30 border-border hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              Session #{session.sessionId} • Test #{session.testId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Taken: {toReadableDateTime(session.testTakenTime)}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right min-w-[80px]">
                              <p className="font-semibold text-foreground">{session.resultLabel}</p>
                              <p className="text-xs text-muted-foreground">
                                {session.scorePercentage}%
                              </p>
                            </div>
                            <Progress value={session.scorePercentage} className="w-24 h-2" />
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/profile/activity/${session.sessionId}`}>
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      achievement.earned
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/30 border-border opacity-60"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.earned
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {achievement.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.earned && (
                      <Badge className="ml-auto" variant="secondary">
                        Earned
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
