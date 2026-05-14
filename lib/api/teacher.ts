import type {
  TeacherQuestionType,
  TeacherStudentsQuery,
  TeacherStudentsResponse,
  TeacherTestLanguage,
  TeacherUploadedTest,
  TeacherUploadBaremResponse,
  TeacherUploadTestResponse,
} from '@/lib/types/teacher';
import type { UserDashboardDTO } from '@/lib/types/user';

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
      // keep default
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

function buildQueryString(query?: TeacherStudentsQuery): string {
  const params = new URLSearchParams();

  if (query?.pageNumber) params.set('pageNumber', String(query.pageNumber));
  if (query?.pageSize) params.set('pageSize', String(query.pageSize));
  if (query?.name?.trim()) params.set('name', query.name.trim());
  if (query?.grade?.trim()) params.set('grade', query.grade.trim());
  if (query?.school?.trim()) params.set('school', query.school.trim());
  if (query?.location?.trim()) params.set('location', query.location.trim());

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const teacherApi = {
  async getStudents(query?: TeacherStudentsQuery): Promise<TeacherStudentsResponse> {
    const token = getAuthToken();

    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const response = await fetch(`/api/teacher/students${buildQueryString(query)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    return handleResponse<TeacherStudentsResponse>(response);
  },

  async assignMe(studentId: number): Promise<void> {
    const token = getAuthToken();

    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const response = await fetch(`/api/teacher/students/${studentId}/assign-me`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await handleResponse(response);
  },

  async uploadTestPdf(params: {
    files: File[];
    userId: number;
    questionType: TeacherQuestionType;
    language: TeacherTestLanguage;
  }): Promise<TeacherUploadTestResponse> {
    const token = getAuthToken();

    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const formData = new FormData();
    params.files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('user_id', String(params.userId));
    formData.append('question_type', params.questionType);
    formData.append('language', params.language);

    const response = await fetch('/api/teacher/upload-test', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse<TeacherUploadTestResponse>(response);
  },

  async uploadBaremPdf(file: File): Promise<TeacherUploadBaremResponse> {
    const token = getAuthToken();

    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/teacher/upload-barem', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse<TeacherUploadBaremResponse>(response);
  },

  async getUploadedTestsByTeacher(teacherId: number): Promise<TeacherUploadedTest[]> {
    const token = getAuthToken();

    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const response = await fetch(`/api/teacher/tests/${teacherId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    return handleResponse<TeacherUploadedTest[]>(response);
  },

  async getStudentOverview(studentId: number): Promise<UserDashboardDTO> {
    const token = getAuthToken();

    if (!token) {
      throw new ApiException('No authentication token found', 401);
    }

    const response = await fetch(`/api/teacher/students/${studentId}/overview`, {
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
