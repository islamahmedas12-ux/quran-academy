import type { ApiResponse, PaginatedResponse } from "./api";
import type { Status, UserRole, ClassStatus } from "./utils";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  subscriptionPlan: "free" | "basic" | "premium" | "institution";
  createdAt: string;
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string;
  specialization: string[];
  availability: AvailabilitySlot[];
  rating: number;
  totalClasses: number;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface ScheduledClass {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  startTime: string;
  endTime: string;
  status: ClassStatus;
  jitsiRoom: string;
  notes?: string;
  recordingUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  language: string;
  duration: number;
  totalLessons: number;
  instructor: string;
  enrollmentCount: number;
  rating: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isCompleted: boolean;
}

export interface QuranVerse {
  id: string;
  surah: number;
  verse: number;
  text: string;
  transliteration: string;
  translation: string;
  audioUrl: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
}

export type CourseCategory = "quran" | "arabic" | "fiqh" | "seerah" | "hadith" | "tajweed" | "memorization";

export interface CourseFilters {
  category?: CourseCategory;
  language?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  search?: string;
}

export interface TeacherEarnings {
  month: string;
  classesCompleted: number;
  gross: number;
  fee: number;
  net: number;
}

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalRevenue: number;
}

export interface EnrollmentTrend {
  date: string;
  count: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface TopCourse {
  courseId: string;
  title: string;
  enrollmentCount: number;
}

export interface RecentActivity {
  id: string;
  type: "enrollment" | "course_created" | "class_completed" | "user_registered";
  description: string;
  timestamp: string;
}
