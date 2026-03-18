import type {
  AvailableTest,
  GenerateTestRequest,
  RegisterTestSessionRequest,
  RegisterTestSessionResponse,
  VerifyTestResponse,
} from '@/lib/types/test';

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

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errors: Record<string, string[]> | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorData.Message || errorMessage;
      errors = errorData.errors;
    } catch {
      // If parsing fails, use default error message
    }

    throw new ApiException(errorMessage, response.status, errors);
  }

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

function buildTestListUrl(type: string, language?: string): string {
  const params = new URLSearchParams({ type });

  if (language && language.trim()) {
    params.set('language', language.trim());
  }

  return `/api/test?${params.toString()}`;
}

export const testApi = {
  getQuestionImageUrl(questionId: number | string): string {
    return `/api/question/${questionId}/image`;
  },

  getAnswerImageUrl(answerId: number | string): string {
    return `/api/answer/${answerId}/image`;
  },

  async getTests(type: string, language?: string): Promise<AvailableTest[]> {
    const response = await fetch(buildTestListUrl(type, language));
    return handleResponse<AvailableTest[]>(response);
  },

  async generateTest(data: GenerateTestRequest): Promise<AvailableTest> {
    const response = await fetch('/api/test/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<AvailableTest>(response);
  },

  async getTestById(testId: number): Promise<AvailableTest> {
    const response = await fetch(`/api/test/${testId}`);
    return handleResponse<AvailableTest>(response);
  },

  async registerTestSession(payload: RegisterTestSessionRequest): Promise<RegisterTestSessionResponse> {
    const token = getAuthToken();

    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const response = await fetch('/api/test-session/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return handleResponse<RegisterTestSessionResponse>(response);
  },

  async verifyTest(sessionId: number, payload: RegisterTestSessionRequest): Promise<VerifyTestResponse> {
    const token = getAuthToken();

    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const response = await fetch(`/api/test-session/verify/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return handleResponse<VerifyTestResponse>(response);
  },
};

export { ApiException };
