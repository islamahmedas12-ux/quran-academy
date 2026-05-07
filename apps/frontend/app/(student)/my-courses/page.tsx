"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Clock, CheckCircle, Play, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/lib/types";

const MOCK_COURSES: Course[] = [
  {
    id: "course_1",
    title: "Quran Memorization Basics",
    description: "Learn to memorize short surahs with proper Tajweed. This course covers essential memorization techniques.",
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
    description: "Understanding Arabic grammar rules for Quranic Arabic. Build a strong foundation.",
    thumbnail: null,
    difficulty: "intermediate",
    language: "Arabic",
    duration: 600,
    totalLessons: 15,
    instructor: "Sheikh Abdullah",
    enrollmentCount: 89,
    rating: 4.6,
  },
  {
    id: "course_3",
    title: "Tajweed Rules Mastery",
    description: "Master the rules of Quran recitation including proper pronunciation and elongation.",
    thumbnail: null,
    difficulty: "advanced",
    language: "Arabic",
    duration: 720,
    totalLessons: 12,
    instructor: "Sheikh Muhammad",
    enrollmentCount: 234,
    rating: 4.95,
  },
  {
    id: "course_4",
    title: "Islamic Studies for Beginners",
    description: "Comprehensive introduction to Islamic teachings, history, and practice.",
    thumbnail: null,
    difficulty: "beginner",
    language: "English",
    duration: 360,
    totalLessons: 10,
    instructor: "Ustadha Fatima",
    enrollmentCount: 312,
    rating: 4.7,
  },
];

const ENROLLMENTS = [
  { courseId: "course_1", progress: 65, completedLessons: 13 },
  { courseId: "course_2", progress: 30, completedLessons: 5 },
  { courseId: "course_3", progress: 0, completedLessons: 0 },
];

type FilterType = "all" | "in_progress" | "completed";

export default function MyCoursesPage() {
  const [filter, setFilter] = React.useState<FilterType>("all");

  const coursesWithProgress = MOCK_COURSES.map((course) => {
    const enrollment = ENROLLMENTS.find((e) => e.courseId === course.id);
    return {
      ...course,
      progress: enrollment?.progress || 0,
      completedLessons: enrollment?.completedLessons || 0,
    };
  });

  const filteredCourses = coursesWithProgress.filter((course) => {
    if (filter === "in_progress") return course.progress > 0 && course.progress < 100;
    if (filter === "completed") return course.progress === 100;
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-emerald-100 text-emerald-800";
      case "intermediate":
        return "bg-amber-100 text-amber-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-2">My Courses</h1>
          <p className="text-slate-500">Continue learning where you left off</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex gap-2">
            {(["all", "in_progress", "completed"] as FilterType[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" && "All Courses"}
                {f === "in_progress" && "In Progress"}
                {f === "completed" && "Completed"}
              </Button>
            ))}
          </div>
        </div>

        {/* Course grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-primary/40" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  {course.progress === 100 && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.completedLessons}/{course.totalLessons} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.instructor}
                    </div>
                  </div>

                  <Link href={`/courses/${course.id}/lessons/${course.completedLessons + 1}`}>
                    <Button
                      className="w-full gap-2"
                      variant={course.progress === 0 ? "default" : "outline"}
                    >
                      <Play className="h-4 w-4" />
                      {course.progress === 0 ? "Start Course" : "Continue Learning"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No courses found</h3>
            <p className="text-slate-500">
              {filter === "all" && "You haven't enrolled in any courses yet."}
              {filter === "in_progress" && "No courses in progress."}
              {filter === "completed" && "No completed courses yet."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}