export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
export const TEST_BASE_URL = process.env.NEXT_PUBLIC_TEST_API_BASE_URL || 'http://localhost:8070';

export const API_ENDPOINTS = {
  auth: {
    apiHealth: '/api/auth/api-health',
    dbHealth: '/api/auth/db-health',
    register: '/api/auth/register',
    verifyOtp: '/api/auth/verify-otp',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
  },
  user: {
    profile: '/api/user/profile',
    updateProfile: '/api/user/profile',
    dashboard: '/api/user/dashboard',
  },
  test: {
    getTests: '/test',
    generate: '/test/generate',
    getById: (testId: number | string) => `/test/${testId}`,
    questionImage: (questionId: number | string) => `/question/${questionId}/image`,
    answerImage: (answerId: number | string) => `/answer/${answerId}/answer_image`,
  },
  testSession: {
    register: '/api/testSession/testSession',
    verify: (sessionId: number | string) => `/api/testSession/verifyTest/${sessionId}`,
  },
} as const;
