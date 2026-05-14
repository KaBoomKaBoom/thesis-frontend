import { API_BASE_URL, API_ENDPOINTS } from '@/lib/api-config';
import type {
  UserDashboardDTO,
  UserProfileDTO,
  UserToUpdateDTO,
  UpdateProfileResponse,
} from '@/lib/types/user';

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
      errorMessage = errorData.message || errorData.Message || errorMessage;
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

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export const userApi = {
  /**
   * Get current user profile (requires authentication)
   */
  async getProfile(): Promise<UserProfileDTO> {
    const token = getAuthToken();
    
    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.user.profile}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<UserProfileDTO>(response);
  },

  /**
   * Update current user profile (requires authentication)
   */
  async updateProfile(data: UserToUpdateDTO): Promise<UpdateProfileResponse> {
    const token = getAuthToken();
    
    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.user.updateProfile}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<UpdateProfileResponse>(response);
  },

  async getDashboard(): Promise<UserDashboardDTO> {
    const token = getAuthToken();

    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const response = await fetch('/api/user/dashboard', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    return handleResponse<UserDashboardDTO>(response);
  },
};

export { ApiException };
