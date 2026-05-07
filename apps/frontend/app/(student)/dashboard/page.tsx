"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth, useUpcomingClasses, useEnrolledCourses, useNotifications } from "@/lib/hooks";
import { BookOpen, Calendar, Quran, Clock, ChevronRight, Bell } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { classes, isLoading: classesLoading } = useUpcomingClasses();
  const { courses, isLoading: coursesLoading } = useEnrolledCourses();
  const { notifications } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="text-slate-600 mt-1">
            Continue your Quran learning journey
          </p>
        </div>
        <Link href="/(student)/book">
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Book a Class
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Classes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>Your next scheduled sessions</CardDescription>
              </div>
              <Link
                href="/(student)/classes"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {classesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-slate-100 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : classes.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No upcoming classes</p>
                  <Link href="/(student)/book">
                    <Button variant="outline" size="sm" className="mt-3">
                      Book your first class
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {classes.slice(0, 3).map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                    >
                      <Avatar name={cls.teacherName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">{cls.teacherName}</p>
                        <p className="text-sm text-slate-500">
                          {format(parseISO(cls.startTime), "EEEE, MMM d")} at{" "}
                          {format(parseISO(cls.startTime), "h:mm a")}
                        </p>
                      </div>
                      <Badge status="active">Scheduled</Badge>
                      <Link href={`/(student)/classes/${cls.id}`}>
                        <Button variant="outline" size="sm">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Your enrolled courses and progress</CardDescription>
              </div>
              <Link
                href="/(student)/courses"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Browse more
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-slate-100 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No enrolled courses</p>
                  <Link href="/(student)/courses">
                    <Button variant="outline" size="sm" className="mt-3">
                      Browse courses
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">{course.title}</p>
                        <p className="text-sm text-slate-500">
                          {course.completedLessons} of {course.totalLessons} lessons
                        </p>
                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                      <Link href={`/(student)/courses/${course.id}`}>
                        <Button variant="ghost" size="sm">
                          Continue
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
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/(student)/book" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Class
                </Button>
              </Link>
              <Link href="/(student)/quran" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Quran className="h-4 w-4 mr-2" />
                  Read Quran
                </Button>
              </Link>
              <Link href="/(student)/courses" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="error">{unreadCount} new</Badge>
              )}
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-4">
                  <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${
                        notification.isRead ? "bg-slate-50" : "bg-primary/5 border border-primary/20"
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDistanceToNow(parseISO(notification.createdAt), {
                          addSuffix: true,
                        })}
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
