"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Play,
  FileText,
  List,
  X,
} from "lucide-react";

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isCompleted: boolean;
}

interface CourseLessons {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function LessonPlayerPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const [course, setCourse] = React.useState<CourseLessons | null>(null);
  const [currentLesson, setCurrentLesson] = React.useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    async function fetchLesson() {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();
        if (data.success && data.data) {
          setCourse(data.data);
          const lesson = data.data.lessons.find(
            (l: Lesson) => l.id === lessonId
          );
          setCurrentLesson(lesson || null);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchLesson();
  }, [courseId, lessonId]);

  const currentIndex = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const previousLesson = currentIndex > 0 ? course?.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < (course?.lessons.length ?? 0) - 1
      ? course?.lessons[currentIndex + 1]
      : null;

  const handleMarkComplete = () => {
    if (!currentLesson) return;
    setCurrentLesson((prev) => (prev ? { ...prev, isCompleted: true } : null));
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 p-6">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4 mt-6" />
          <Skeleton className="h-4 w-full mt-4" />
        </div>
        <Skeleton className="w-80 hidden lg:block" />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Lesson not found</h3>
        <Link href={`/courses/${courseId}`}>
          <Button className="mt-4">Back to Course</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Player */}
        <div className="relative bg-black aspect-video">
          <div className="absolute inset-0 flex items-center justify-center">
            {isPlaying ? (
              <video
                key={currentLesson.videoUrl}
                className="w-full h-full"
                controls
                autoPlay
                src={currentLesson.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <button
                onClick={() => setIsPlaying(true)}
                className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              >
                <Play className="h-8 w-8 text-primary ml-1" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden absolute top-4 right-4 p-2 bg-black/50 rounded-lg text-white"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        </div>

        {/* Lesson Info */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <Badge variant={currentLesson.isCompleted ? "success" : "outline"}>
                {currentLesson.isCompleted ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Completed
                  </span>
                ) : (
                  "In Progress"
                )}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Lesson {currentIndex + 1} of {course.lessons.length}
              </span>
            </div>

            <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {currentLesson.description}
            </p>

            <div className="mt-6 flex gap-4">
              {!currentLesson.isCompleted && (
                <Button onClick={handleMarkComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
              <Link href={`/courses/${courseId}`}>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Course Info
                </Button>
              </Link>
            </div>

            {/* Transcript placeholder */}
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Transcript</h3>
              <p className="text-sm text-muted-foreground">
                Transcript content would appear here. This section displays the
                text version of the lesson for accessibility and better
                comprehension.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {previousLesson ? (
              <Link href={`/courses/${courseId}/lessons/${previousLesson.id}`}>
                <Button variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous: {previousLesson.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                <Button>
                  Next: {nextLesson.title}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href={`/courses/${courseId}`}>
                <Button>
                  Complete Course
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } fixed inset-y-0 right-0 z-50 lg:relative lg:translate-x-0 w-80 bg-background border-l transition-transform lg:block overflow-auto`}
      >
        <div className="p-4 border-b sticky top-0 bg-background">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{course.title}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-muted rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {course.lessons.filter((l) => l.isCompleted).length} of{" "}
            {course.lessons.length} completed
          </p>
          <Progress
            value={
              (course.lessons.filter((l) => l.isCompleted).length /
                course.lessons.length) *
              100
            }
            className="mt-2"
          />
        </div>

        <div className="p-2">
          {course.lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/courses/${courseId}/lessons/${lesson.id}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div
                className={`flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
                  lesson.id === lessonId
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  {lesson.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : lesson.id === lessonId ? (
                    <div className="w-5 h-5 rounded-full border-2 border-primary" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${
                      lesson.id === lessonId ? "font-medium" : ""
                    }`}
                  >
                    {index + 1}. {lesson.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.duration} min
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
