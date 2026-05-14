import type { AdminUser, AdminUserCreateDTO, AdminUserUpdateDTO } from "@/lib/types/admin"

class ApiException extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = "ApiException"
    this.status = status
    this.errors = errors
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    let errors: Record<string, string[]> | undefined

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorData.Message || errorMessage
      errors = errorData.errors
    } catch {
      // keep default
    }

    throw new ApiException(errorMessage, response.status, errors)
  }

  const text = await response.text()
  if (!text) {
    return {} as T
  }

  try {
    return JSON.parse(text)
  } catch {
    return text as T
  }
}

export const adminApi = {
  async getUsers(): Promise<AdminUser[]> {
    const token = getAuthToken()

    if (!token) {
      throw new ApiException("No authentication token found", 401)
    }

    const response = await fetch("/api/admin/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    return handleResponse<AdminUser[]>(response)
  },

  async getUserById(userId: number): Promise<AdminUser> {
    const token = getAuthToken()

    if (!token) {
      throw new ApiException("No authentication token found", 401)
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    return handleResponse<AdminUser>(response)
  },

  async getUsersByRole(role: string): Promise<AdminUser[]> {
    const token = getAuthToken()

    if (!token) {
      throw new ApiException("No authentication token found", 401)
    }

    const response = await fetch(`/api/admin/users/role/${encodeURIComponent(role)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    return handleResponse<AdminUser[]>(response)
  },

  async createUser(payload: AdminUserCreateDTO): Promise<AdminUser> {
    const token = getAuthToken()

    if (!token) {
      throw new ApiException("No authentication token found", 401)
    }

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    return handleResponse<AdminUser>(response)
  },

  async updateUser(userId: number, payload: AdminUserUpdateDTO): Promise<AdminUser> {
    const token = getAuthToken()

    if (!token) {
      throw new ApiException("No authentication token found", 401)
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    return handleResponse<AdminUser>(response)
  },

  async deleteUser(userId: number): Promise<void> {
    const token = getAuthToken()

    if (!token) {
      throw new ApiException("No authentication token found", 401)
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    await handleResponse(response)
  },
}

export { ApiException }
