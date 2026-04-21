export interface TestQuestionSlot {
  position: number;
  question_id: number;
  correct_answer_id: number;
  incorrect_answer_ids: number[];
}

export interface AvailableTest {
  test_id: number;
  type: string;
  language: string;
  questions: TestQuestionSlot[];
}

export interface GenerateTestRequest {
  language: string;
  type: string;
}

export interface RegisterTestComponent {
  id: number;
  answer_id: number | null;
  question_id: number;
}

export interface RegisterTestSessionRequest {
  testId: number;
  testComponents: RegisterTestComponent[];
}

export interface RegisterTestSessionResponse {
  sessionId?: number;
  testSessionId?: number;
  id?: number;
  [key: string]: unknown;
}

export interface VerifyDetailedResult {
  id: number;
  position: number;
  questionId: number;
  submittedAnswerId: number | null;
  correctAnswerId: number;
  isCorrect: boolean;
}

export interface VerifyTestResponse {
  resultId: number;
  sessionId: number;
  totalQuestions: number;
  correctAnswers: number;
  skipped: number;
  scorePercentage: number;
  detailedResults: VerifyDetailedResult[];
  verifiedAt: string;
}

export interface SessionActivitySummary {
  sessionId: number;
  testId: number;
  testTakenTime: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  resultLabel: string;
}

export interface SessionSubmittedAnswer {
  questionId: number;
  answerId: number;
}

export interface SessionResultItem {
  position: number;
  questionId: number;
  submittedAnswerId: number | null;
  correctAnswerId: number;
  isCorrect: boolean;
}

export interface SessionActivityDetail {
  sessionId: number;
  testId: number;
  testTakenTime: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  skipped: number;
  scorePercentage: number;
  verifiedAt: string;
  submittedAnswers: SessionSubmittedAnswer[];
  results: SessionResultItem[];
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
