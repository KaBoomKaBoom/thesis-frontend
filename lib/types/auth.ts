// DTOs matching the backend API
export interface UserToRegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface UserToLoginDTO {
  email: string;
  password: string;
}

export interface VerifyOTPDTO {
  email: string;
  otp: string;
}

export interface RefreshTokenRequest {
  token: string;
}

// Response types
export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
