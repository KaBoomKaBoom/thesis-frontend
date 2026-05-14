// User Profile DTO matching backend
export interface UserProfileDTO {
  id?: number;
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  role: string;
  gradeLevel?: string;
  school?: string;
  bio?: string;
}

// User Update DTO for profile updates
export interface UserToUpdateDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  gradeLevel: string;
  school: string;
  biography: string;
}

// API response for profile update
export interface UpdateProfileResponse {
  message: string;
  profile: UserProfileDTO;
}

export interface DashboardStatsDTO {
  totalSessions: number;
  completedSessions: number;
  averageScorePercentage: number;
  bestScorePercentage: number;
  lastSessionResultLabel: string;
  lastSessionTakenAt: string;
}

export interface DashboardRecentSessionDTO {
  sessionId: number;
  testId: number;
  testTakenTime: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  resultLabel: string;
}

export interface DashboardScoreTrendPointDTO {
  date: string;
  averageScorePercentage: number;
  sessionsCount: number;
}

export interface DashboardQuestionAnalyticsDTO {
  questionId: number;
  attempts: number;
  correctAnswers: number;
  accuracyPercentage: number;
}

export interface DashboardTopicAnalyticsDTO {
  strongestQuestions: DashboardQuestionAnalyticsDTO[];
  weakestQuestions: DashboardQuestionAnalyticsDTO[];
}

export interface UserDashboardDTO {
  stats: DashboardStatsDTO;
  recentSessions: DashboardRecentSessionDTO[];
  scoreTrend: DashboardScoreTrendPointDTO[];
  topicAnalytics: DashboardTopicAnalyticsDTO;
}
