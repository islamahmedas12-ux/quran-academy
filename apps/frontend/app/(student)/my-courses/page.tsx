"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import type { Course } from "@/lib/types";
import { BookOpen, Clock, Play, CheckCircle, BarChart3 } from "lucide-react";

interface EnrolledCourse extends Course {
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export default function MyCoursesPage() {
  const [courses, setCourses] = React.useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "in_progress" | "completed">("all");

  React.useEffect(() => {
    async function fetchEnrolledCourses() {
      try {
        const response = await api.get<EnrolledCourse[]>("/courses/enrolled");
        if (response.success && response.data) {
          setCourses(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchEnrolledCourses();
  }, []);

  const filteredCourses = React.useMemo(() => {
    switch (filter) {
      case "in_progress":
        return courses.filter((c) => c.progress > 0 && c.progress < 100);
      case "completed":
        return courses.filter((c) => c.progress === 100);
      default:
        return courses;
    }
  }, [courses, filter]);

  const inProgressCount = courses.filter(
    (c) => c.progress > 0 && c.progress < 100
  ).length;
  const completedCount = courses.filter((c) => c.progress === 100).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            Continue learning where you left off
          </p>
        </div>
        <Link href="/courses">
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            Browse More Courses
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-sm text-muted-foreground">Total Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {Math.round(
                courses.reduce((acc, c) => acc + c.progress, 0) / courses.length || 0
              )}%
            </div>
            <p className="text-sm text-muted-foreground">Avg. Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({courses.length})</TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({inProgressCount})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-muted-foreground mt-1">
                {filter === "all"
                  ? "You haven't enrolled in any courses yet"
                  : filter === "in_progress"
                  ? "You don't have any courses in progress"
                  : "You haven't completed any courses yet"}
              </p>
              {filter !== "all" && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilter("all")}
                >
                  View All Courses
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary/50" />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {course.completedLessons} of {course.totalLessons} lessons
                      </span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDuration(course.duration)}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                      {course.progress === 100 ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          {course.progress > 0 ? "Continue" : "Start"}
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
