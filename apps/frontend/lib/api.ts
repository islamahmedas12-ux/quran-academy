export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiClient {
  private baseUrl: string;
  private isDemoMode: boolean;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    this.isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !this.baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: "An error occurred",
        statusCode: response.status,
      };

      try {
        const data = await response.json();
        error.message = data.message || error.message;
        error.code = data.code;
      } catch {
        error.message = response.statusText || error.message;
      }

      throw error;
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    if (this.isDemoMode) {
      return this.getMockData<T>(endpoint);
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<T>>(response);
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    if (this.isDemoMode) {
      return this.getMockData<T>(endpoint);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<ApiResponse<T>>(response);
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    if (this.isDemoMode) {
      return this.getMockData<T>(endpoint);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<ApiResponse<T>>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    if (this.isDemoMode) {
      return this.getMockData<T>(endpoint);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<T>>(response);
  }

  private getMockData<T>(endpoint: string): ApiResponse<T> {
    const mockDatabase: Record<string, unknown> = {
      "/auth/me": {
        data: {
          id: "user_1",
          email: "student@example.com",
          name: "Ahmed Muhammad",
          role: "student",
          avatar: null,
          organizationId: "org_1",
        },
        success: true,
      },
      "/users/me": {
        data: {
          id: "user_1",
          email: "student@example.com",
          name: "Ahmed Muhammad",
          role: "student",
          avatar: null,
          organizationId: "org_1",
          createdAt: new Date().toISOString(),
        },
        success: true,
      },
      "/organizations/current": {
        data: {
          id: "org_1",
          name: "Quran Academy",
          domain: "quran-academy.com",
          subscriptionPlan: "premium",
        },
        success: true,
      },
      "/classes/upcoming": {
        data: [
          {
            id: "class_1",
            teacherId: "teacher_1",
            teacherName: "Sheikh Ibrahim",
            studentId: "user_1",
            startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            status: "scheduled",
            jitsiRoom: "class_1_room",
          },
          {
            id: "class_2",
            teacherId: "teacher_2",
            teacherName: "Sheikh Abdullah",
            studentId: "user_1",
            startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
            status: "scheduled",
            jitsiRoom: "class_2_room",
          },
          {
            id: "class_3",
            teacherId: "teacher_1",
            teacherName: "Sheikh Ibrahim",
            studentId: "user_1",
            startTime: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 51 * 60 * 60 * 1000).toISOString(),
            status: "scheduled",
            jitsiRoom: "class_3_room",
          },
        ],
        success: true,
      },
      "/courses/enrolled": {
        data: [
          {
            id: "course_1",
            title: "Quran Memorization Basics",
            description: "Learn to memorize short surahs",
            progress: 65,
            totalLessons: 20,
            completedLessons: 13,
            thumbnail: null,
          },
          {
            id: "course_2",
            title: "Arabic Grammar Fundamentals",
            description: "Understanding Arabic grammar rules",
            progress: 30,
            totalLessons: 15,
            completedLessons: 5,
            thumbnail: null,
          },
          {
            id: "course_3",
            title: "Tajweed Rules",
            description: "Master the rules of Quran recitation",
            progress: 0,
            totalLessons: 12,
            completedLessons: 0,
            thumbnail: null,
          },
        ],
        success: true,
      },
    };

    const mockResponse = mockDatabase[endpoint];

    if (mockResponse) {
      return mockResponse as ApiResponse<T>;
    }

    return {
      data: {} as T,
      success: true,
    };
  }

  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }
}

export const api = new ApiClient();
