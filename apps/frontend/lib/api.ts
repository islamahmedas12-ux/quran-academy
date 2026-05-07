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
      "/auth/teacher": {
        data: {
          id: "teacher_1",
          email: "teacher@example.com",
          name: "Sheikh Ibrahim",
          role: "teacher",
          avatar: null,
          organizationId: "org_1",
        },
        success: true,
      },
      "/auth/admin": {
        data: {
          id: "admin_1",
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
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
      "/courses": {
        data: [
          {
            id: "course_1",
            title: "Quran Memorization Basics",
            description: "Learn to memorize short surahs like Al-Fatiha, Al-Ikhlas, and others. Perfect for beginners.",
            thumbnail: null,
            difficulty: "beginner",
            language: "Arabic",
            duration: 480,
            totalLessons: 20,
            instructor: "Sheikh Ibrahim",
            enrollmentCount: 156,
            rating: 4.8,
          },
          {
            id: "course_2",
            title: "Arabic Grammar Fundamentals",
            description: "Understanding Arabic grammar rules from scratch. Learn noun cases, verbs, and sentence structure.",
            thumbnail: null,
            difficulty: "beginner",
            language: "Arabic",
            duration: 720,
            totalLessons: 30,
            instructor: "Sheikh Abdullah",
            enrollmentCount: 89,
            rating: 4.6,
          },
          {
            id: "course_3",
            title: "Tajweed Rules",
            description: "Master the rules of Quran recitation including noon sakinah, meem sakinah, and idgham.",
            thumbnail: null,
            difficulty: "intermediate",
            language: "Arabic",
            duration: 540,
            totalLessons: 24,
            instructor: "Sheikh Muhammad",
            enrollmentCount: 234,
            rating: 4.9,
          },
          {
            id: "course_4",
            title: "Fiqh al-Islami",
            description: "Islamic jurisprudence covering purification, prayer, zakah, and fasting according to the Quran and Sunnah.",
            thumbnail: null,
            difficulty: "intermediate",
            language: "Arabic",
            duration: 900,
            totalLessons: 40,
            instructor: "Sheikh Ahmad",
            enrollmentCount: 67,
            rating: 4.7,
          },
          {
            id: "course_5",
            title: "Seerah of the Prophet ﷺ",
            description: "Study the life of Prophet Muhammad ﷺ from birth to death, understanding his teachings and legacy.",
            thumbnail: null,
            difficulty: "beginner",
            language: "English",
            duration: 600,
            totalLessons: 25,
            instructor: "Dr. Omar",
            enrollmentCount: 312,
            rating: 4.9,
          },
          {
            id: "course_6",
            title: "Hadith Sciences",
            description: "Introduction to hadith literature, classification, and authentication methods.",
            thumbnail: null,
            difficulty: "advanced",
            language: "Arabic",
            duration: 840,
            totalLessons: 35,
            instructor: "Sheikh Ibrahim",
            enrollmentCount: 45,
            rating: 4.5,
          },
          {
            id: "course_7",
            title: "Hifz Program - Part 1",
            description: "Structured memorization program covering Juz Amma and Juz Tabarak.",
            thumbnail: null,
            difficulty: "intermediate",
            language: "Arabic",
            duration: 3600,
            totalLessons: 120,
            instructor: "Sheikh Yusuf",
            enrollmentCount: 78,
            rating: 4.8,
          },
          {
            id: "course_8",
            title: "Arabic Conversation",
            description: "Practice everyday Arabic conversations with native speakers.",
            thumbnail: null,
            difficulty: "beginner",
            language: "Arabic",
            duration: 420,
            totalLessons: 21,
            instructor: "Ustadha Fatima",
            enrollmentCount: 145,
            rating: 4.4,
          },
        ],
        success: true,
      },
      "/courses/course_1": {
        data: {
          id: "course_1",
          title: "Quran Memorization Basics",
          description: "Learn to memorize short surahs like Al-Fatiha, Al-Ikhlas, and others. Perfect for beginners who want to begin their Quran memorization journey. This comprehensive course covers proven memorization techniques and revision strategies.",
          thumbnail: null,
          difficulty: "beginner",
          language: "Arabic",
          duration: 480,
          totalLessons: 20,
          instructor: "Sheikh Ibrahim",
          instructorBio: "Sheikh Ibrahim has been teaching Quran for over 20 years. He specializes in helping beginners develop strong memorization foundations.",
          enrollmentCount: 156,
          rating: 4.8,
          reviews: [
            { id: "r1", userName: "Ahmed K.", rating: 5, comment: "Excellent course for beginners!", createdAt: "2026-04-15T10:00:00Z" },
            { id: "r2", userName: "Fatima M.", rating: 5, comment: "My child loves this course.", createdAt: "2026-04-10T14:30:00Z" },
          ],
          lessons: [
            { id: "l1", courseId: "course_1", title: "Introduction to Memorization", description: "Learn the basics of Quran memorization techniques", videoUrl: "https://example.com/video1.mp4", duration: 25, order: 1, isCompleted: true },
            { id: "l2", courseId: "course_1", title: "Surah Al-Fatiha", description: "Memorize the opening chapter of the Quran", videoUrl: "https://example.com/video2.mp4", duration: 30, order: 2, isCompleted: true },
            { id: "l3", courseId: "course_1", title: "Surah Al-Ikhlas", description: "Learn Surah Al-Ikhlas (The Sincerity)", videoUrl: "https://example.com/video3.mp4", duration: 20, order: 3, isCompleted: true },
            { id: "l4", courseId: "course_1", title: "Surah Al-Falaq", description: "Learn Surah Al-Falaq (The Daybreak)", videoUrl: "https://example.com/video4.mp4", duration: 22, order: 4, isCompleted: false },
            { id: "l5", courseId: "course_1", title: "Surah An-Nas", description: "Learn Surah An-Nas (Mankind)", videoUrl: "https://example.com/video5.mp4", duration: 20, order: 5, isCompleted: false },
          ],
        },
        success: true,
      },
      "/teacher/schedule": {
        data: [
          { id: "class_t1", teacherId: "teacher_1", teacherName: "Sheikh Ibrahim", studentId: "student_1", studentName: "Ahmed", startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), status: "scheduled", jitsiRoom: "room_1" },
          { id: "class_t2", teacherId: "teacher_1", teacherName: "Sheikh Ibrahim", studentId: "student_2", studentName: "Fatima", startTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), status: "scheduled", jitsiRoom: "room_2" },
          { id: "class_t3", teacherId: "teacher_1", teacherName: "Sheikh Ibrahim", studentId: "student_3", studentName: "Muhammad", startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), endTime: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(), status: "scheduled", jitsiRoom: "room_3" },
        ],
        success: true,
      },
      "/teacher/earnings": {
        data: [
          { month: "Jan 2026", classesCompleted: 24, gross: 2400, fee: 360, net: 2040 },
          { month: "Feb 2026", classesCompleted: 28, gross: 2800, fee: 420, net: 2380 },
          { month: "Mar 2026", classesCompleted: 22, gross: 2200, fee: 330, net: 1870 },
          { month: "Apr 2026", classesCompleted: 30, gross: 3000, fee: 450, net: 2550 },
          { month: "May 2026", classesCompleted: 26, gross: 2600, fee: 390, net: 2210 },
        ],
        success: true,
      },
      "/admin/users": {
        data: [
          { id: "u1", name: "Ahmed Muhammad", email: "student@example.com", role: "student", status: "active", createdAt: "2026-01-15T10:00:00Z" },
          { id: "u2", name: "Fatima Ali", email: "fatima@example.com", role: "student", status: "active", createdAt: "2026-02-20T14:30:00Z" },
          { id: "u3", name: "Sheikh Ibrahim", email: "teacher@example.com", role: "teacher", status: "active", createdAt: "2025-11-01T09:00:00Z" },
          { id: "u4", name: "Sheikh Abdullah", email: "abdullah@example.com", role: "teacher", status: "active", createdAt: "2025-12-10T11:00:00Z" },
          { id: "u5", name: "Admin User", email: "admin@example.com", role: "admin", status: "active", createdAt: "2025-10-01T08:00:00Z" },
          { id: "u6", name: "Inactive Teacher", email: "inactive@example.com", role: "teacher", status: "inactive", createdAt: "2025-09-15T10:00:00Z" },
        ],
        success: true,
      },
      "/admin/stats": {
        data: {
          totalStudents: 1250,
          totalTeachers: 45,
          totalCourses: 28,
          totalRevenue: 156000,
        },
        success: true,
      },
      "/admin/enrollment-trends": {
        data: [
          { date: "2026-01", count: 120 },
          { date: "2026-02", count: 145 },
          { date: "2026-03", count: 168 },
          { date: "2026-04", count: 192 },
          { date: "2026-05", count: 210 },
        ],
        success: true,
      },
      "/admin/revenue-by-month": {
        data: [
          { month: "Jan 2026", revenue: 24000 },
          { month: "Feb 2026", revenue: 28500 },
          { month: "Mar 2026", revenue: 31200 },
          { month: "Apr 2026", revenue: 35800 },
          { month: "May 2026", revenue: 32500 },
        ],
        success: true,
      },
      "/admin/top-courses": {
        data: [
          { courseId: "course_5", title: "Seerah of the Prophet ﷺ", enrollmentCount: 312 },
          { courseId: "course_3", title: "Tajweed Rules", enrollmentCount: 234 },
          { courseId: "course_1", title: "Quran Memorization Basics", enrollmentCount: 156 },
        ],
        success: true,
      },
      "/admin/recent-activity": {
        data: [
          { id: "a1", type: "enrollment", description: "Ahmed enrolled in Tajweed Rules", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
          { id: "a2", type: "course_created", description: "New course 'Hadith Sciences' published", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
          { id: "a3", type: "class_completed", description: "Class with Sheikh Ibrahim completed", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
          { id: "a4", type: "user_registered", description: "New student Fatima Ali registered", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
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
