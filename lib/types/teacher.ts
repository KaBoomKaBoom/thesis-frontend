export interface TeacherStudent {
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  grade: string | null;
  school: string | null;
  location: string | null;
  teacherId: number | null;
  averageScorePercentage?: number | null;
  totalSessions?: number | null;
}

export interface TeacherStudentsResponse {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  students: TeacherStudent[];
}

export interface TeacherStudentsQuery {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
  grade?: string;
  school?: string;
  location?: string;
}

export type TeacherTestLanguage = 'ro' | 'ru' | 'eng';

export type TeacherQuestionType =
  | 'math'
  | 'romanian'
  | 'history'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'geography'
  | 'computer_science'
  | 'engineering'
  | 'other';

export interface TeacherUploadTestResult {
  filename: string;
  success: boolean;
  test_id?: number;
  test_name?: string;
  userId?: number;
  [key: string]: unknown;
}

export interface TeacherUploadTestResponse {
  total_files: number;
  processed: number;
  failed: number;
  results: TeacherUploadTestResult[];
}

export interface TeacherBaremAnswer {
  exercise_number: number;
  answer_path: string;
  steps_path: string;
  page: number;
}

export interface TeacherUploadBaremResponse {
  success: boolean;
  message: string;
  answers_saved: number;
  answers: TeacherBaremAnswer[];
  output_directory?: string;
  linked_to_test?: string;
}

export interface TeacherUploadedTestQuestion {
  position: number;
  question_id: number;
  correct_answer_id: number | null;
  incorrect_answer_ids: number[];
}

export interface TeacherUploadedTest {
  test_id: number;
  userId: number;
  name: string;
  type: string;
  language: string;
  questions: TeacherUploadedTestQuestion[];
}

export interface TeacherStudentProfileInfo {
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  gradeLevel?: string;
  school?: string;
  bio?: string;
}

export interface TeacherStudentStatsInfo {
  totalSessions: number;
  averageScorePercentage: number;
  bestScorePercentage: number;
  lastSessionResultLabel: string;
  lastSessionTakenAt: string;
}

export interface TeacherStudentRecentSession {
  sessionId: number;
  testId: number;
  testTakenTime: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  resultLabel: string;
}

export interface TeacherStudentScoreTrendPoint {
  date: string;
  averageScorePercentage: number;
  sessionsCount: number;
}

export interface TeacherStudentOverview {
  profile: TeacherStudentProfileInfo;
  dashboard: {
    stats: TeacherStudentStatsInfo;
    recentSessions: TeacherStudentRecentSession[];
    scoreTrend: TeacherStudentScoreTrendPoint[];
  };
}
