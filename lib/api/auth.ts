import { API_BASE_URL, API_ENDPOINTS } from '@/lib/api-config';
import type {
  UserToRegisterDTO,
  UserToLoginDTO,
  VerifyOTPDTO,
  RefreshTokenRequest,
  AuthResponse,
  ApiError,
} from '@/lib/types/auth';

class ApiException extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.errors = errors;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errors: Record<string, string[]> | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errors = errorData.errors;
    } catch {
      // If parsing fails, use default error message
    }

    throw new ApiException(errorMessage, response.status, errors);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text as T;
  }
}

export const authApi = {
  /**
   * Check API health
   */
  async checkApiHealth(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.apiHealth}`);
    await handleResponse(response);
  },

  /**
   * Check database health
   */
  async checkDbHealth(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.dbHealth}`);
    await handleResponse(response);
  },

  /**
   * Register a new user
   */
  async register(data: UserToRegisterDTO): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.register}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<AuthResponse>(response);
  },

  /**
   * Verify OTP code
   */
  async verifyOtp(data: VerifyOTPDTO): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.verifyOtp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<AuthResponse>(response);
  },

  /**
   * Login user
   */
  async login(data: UserToLoginDTO): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<AuthResponse>(response);
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<AuthResponse>(response);
  },
};

export { ApiException };
