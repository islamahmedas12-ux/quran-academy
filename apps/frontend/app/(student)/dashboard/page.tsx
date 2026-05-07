"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/loading";
import { useAuth, useUpcomingClasses, useEnrolledCourses, useNotifications } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { BookOpen, Calendar, Quran, Clock, Bell, ArrowRight, Play, Sparkles, Target, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";

interface StudentStats {
  classesCompleted: number;
  hoursLearned: number;
  currentStreak: number;
  totalCourses: number;
  totalTeachers: number;
}

function useStudentStats() {
  const [stats, setStats] = React.useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<StudentStats>("/students/stats");
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError("Failed to load stats");
      }
    } catch {
      setError("Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { classes, isLoading: classesLoading, error: classesError, refetch: refetchClasses } = useUpcomingClasses();
  const { courses, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useEnrolledCourses();
  const { notifications } = useNotifications();
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useStudentStats();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const statsData = stats ? [
    { label: "Classes Completed", value: stats.classesCompleted.toString(), icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Hours Learned", value: stats.hoursLearned.toString(), icon: Clock, color: "text-accent", bg: "bg-accent/10" },
    { label: "Current Streak", value: `${stats.currentStreak} days`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 lg:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                Welcome back, {user?.name?.split(" ")[0] || "Student"}
              </h1>
              <p className="text-white/80">
                Continue your Quran learning journey
              </p>
            </div>
            <Link href="/(student)/book">
              <Button className="bg-white text-primary hover:bg-white/90 shadow-lg gap-2">
                <Sparkles className="h-4 w-4" />
                Book a Class
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="p-4 lg:p-6"><Skeleton variant="card" className="h-20" /></CardContent></Card>
            ))}
          </>
        ) : statsError ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{statsError}</span>
            </div>
            <Button variant="outline" size="sm" onClick={refetchStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : (
          statsData.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Classes */}
          <Card hover>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Classes
                </CardTitle>
                <CardDescription>Your next scheduled sessions</CardDescription>
              </div>
              <Link href="/(student)/classes">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {classesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border">
                      <Skeleton variant="circular" width={48} height={48} />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="text" className="w-1/3" />
                        <Skeleton variant="text" className="w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : classes.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="h-8 w-8" />}
                  title="No upcoming classes"
                  description="Book a class with one of our expert teachers to start learning"
                  action={{
                    label: "Book your first class",
                    onClick: () => router.push("/(student)/book"),
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {classes.slice(0, 3).map((cls) => (
                    <div
                      key={cls.id}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all duration-200"
                    >
                      <Avatar name={cls.teacherName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{cls.teacherName}</p>
                        <p className="text-sm text-slate-500">
                          {format(parseISO(cls.startTime), "EEEE, MMM d")} at{" "}
                          {format(parseISO(cls.startTime), "h:mm a")}
                        </p>
                      </div>
                      <Badge status="active">Scheduled</Badge>
                      <Link href={`/(student)/classes/${cls.id}`}>
                        <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Join
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrolled Courses */}
          <Card hover>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  My Courses
                </CardTitle>
                <CardDescription>Your enrolled courses and progress</CardDescription>
              </div>
              <Link href="/(student)/courses">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Browse more
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} variant="card" className="h-24" />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-8 w-8" />}
                  title="No enrolled courses"
                  description="Explore our courses and start learning Quran today"
                  action={{
                    label: "Browse courses",
                    onClick: () => router.push("/(student)/courses"),
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-accent/20 hover:bg-accent/5 transition-all duration-200"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-7 w-7 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{course.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {course.completedLessons}/{course.totalLessons} lessons
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-accent">{course.progress}%</span>
                        </div>
                      </div>
                      <Link href={`/(student)/courses/${course.id}`}>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/(student)/book" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-primary hover:text-white hover:border-primary transition-all">
                  <Calendar className="h-4 w-4" />
                  Book a Class
                </Button>
              </Link>
              <Link href="/(student)/quran" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-primary hover:text-white hover:border-primary transition-all">
                  <Quran className="h-4 w-4" />
                  Read Quran
                </Button>
              </Link>
              <Link href="/(student)/courses" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-primary hover:text-white hover:border-primary transition-all">
                  <BookOpen className="h-4 w-4" />
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                Notifications
              </CardTitle>
              {unreadCount > 0 && (
                <Badge variant="accent">{unreadCount} new</Badge>
              )}
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-xl transition-all ${
                        notification.isRead
                          ? "bg-slate-50"
                          : "bg-primary/5 border border-primary/10"
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {notification.createdAt}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
