export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

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
  },
} as const;
