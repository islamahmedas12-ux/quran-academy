"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import type { Course, Lesson } from "@/lib/types";
import {
  Clock,
  Users,
  Star,
  BookOpen,
  Play,
  Lock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface CourseDetail extends Course {
  instructorBio: string;
  reviews: { id: string; userName: string; rating: number; comment: string; createdAt: string }[];
  lessons: Lesson[];
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatLessonDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "bg-green-100 text-green-800";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800";
    case "advanced":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = React.useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [expandedLessons, setExpandedLessons] = React.useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = React.useState(false);

  React.useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await api.get<CourseDetail>(`/courses/${courseId}`);
        if (response.success && response.data) {
          setCourse(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const completedCount = course?.lessons.filter((l) => l.isCompleted).length || 0;
  const progress = course ? (completedCount / course.lessons.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Course not found</h3>
        <Link href="/courses">
          <Button className="mt-4">Browse Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white p-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="relative z-10">
            <div className="flex gap-2 mb-4">
              <Badge className={getDifficultyColor(course.difficulty)}>
                {course.difficulty}
              </Badge>
              <Badge variant="secondary">{course.language}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="mt-2 text-white/90">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(course.duration)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.totalLessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.enrollmentCount} enrolled
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="h-4 w-4 fill-current" />
                {course.rating}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Avatar name={course.instructor} size="lg" />
              <div>
                <p className="font-medium">{course.instructor}</p>
                <p className="text-sm text-white/70">Instructor</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center mb-4">
              <PlayCircle className="h-16 w-16 text-white/80" />
            </div>
            {isEnrolled ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="bg-white/20" />
                <Link href={`/courses/${course.id}/lessons/${course.lessons[0]?.id}`}>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              </div>
            ) : (
              <Button className="w-full" size="lg">
                Enroll Now - Free
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="curriculum" className="space-y-6">
        <TabsList>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>
                {course.lessons.length} lessons • {formatDuration(course.duration)} total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleLesson(lesson.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {lesson.isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {lesson.duration} minutes
                      </p>
                    </div>
                    {expandedLessons.includes(lesson.id) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedLessons.includes(lesson.id) && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="pl-12 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {lesson.description}
                        </p>
                        {lesson.videoUrl && (
                          <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4 mr-2" />
                              {lesson.isCompleted ? "Watch Again" : "Start Lesson"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
              <CardDescription>
                {course.reviews.length} reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {course.reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={review.userName} size="sm" />
                      <span className="font-medium">{review.userName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? "fill-current" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {format(parseISO(review.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About the Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Instructor</h3>
                <div className="flex items-center gap-3">
                  <Avatar name={course.instructor} size="lg" />
                  <div>
                    <p className="font-medium">{course.instructor}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.instructorBio}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">What you&apos;ll learn</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Comprehensive understanding of {course.title}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {course.totalLessons} structured lessons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Practical exercises and applications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Certificate upon completion
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Requirements</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    No prior experience needed
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Commitment to complete all lessons
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
