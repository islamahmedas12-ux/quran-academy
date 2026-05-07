"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth, useUpcomingClasses } from "@/lib/hooks";
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Video,
  ChevronRight,
  Plus,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface UpcomingClass {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  startTime: string;
  endTime: string;
  status: string;
  jitsiRoom: string;
}

const MOCK_UPCOMING_CLASSES: UpcomingClass[] = [
  {
    id: "1",
    teacherId: "t1",
    teacherName: "Sheikh Ahmad",
    studentId: "s1",
    studentName: "Ahmed Mohammed",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    jitsiRoom: "room-1",
  },
  {
    id: "2",
    teacherId: "t1",
    teacherName: "Sheikh Ahmad",
    studentId: "s2",
    studentName: "Fatima Ali",
    startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    jitsiRoom: "room-2",
  },
  {
    id: "3",
    teacherId: "t1",
    teacherName: "Sheikh Ahmad",
    studentId: "s3",
    studentName: "Omar Hassan",
    startTime: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 51 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    jitsiRoom: "room-3",
  },
];

const MOCK_TODAY_SCHEDULE = [
  { time: "09:00", student: "Ahmed Mohammed", topic: "Tajweed Practice", status: "completed" },
  { time: "11:00", student: "Fatima Ali", topic: "Hifz Progress", status: "completed" },
  { time: "14:00", student: "Omar Hassan", topic: "Surah Al-Baqarah", status: "upcoming" },
  { time: "16:00", student: "Sara Ahmed", topic: "Arabic Grammar", status: "available" },
];

export default function TeacherDashboard() {
  const { user } = useAuth();

  const isWithinJoinWindow = (startTime: string) => {
    const diff = new Date(startTime).getTime() - Date.now();
    return diff > 0 && diff <= 15 * 60 * 1000;
  };

  const totalEarnings = 2450;
  const monthlyEarnings = 850;
  const totalStudents = 24;
  const totalClasses = 156;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(" ")[0] || "Teacher"}
          </h1>
          <p className="text-slate-600 mt-1">Here is your teaching overview</p>
        </div>
        <Link href="/(teacher)/availability">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Set Availability
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{totalEarnings} SAR</p>
              <p className="text-sm text-slate-500">Total earnings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{monthlyEarnings} SAR</p>
              <p className="text-sm text-slate-500">This month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
              <p className="text-sm text-slate-500">Active students</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{totalClasses}</p>
              <p className="text-sm text-slate-500">Total classes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>Your next scheduled sessions</CardDescription>
              </div>
              <Link href="/(teacher)/schedule" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_UPCOMING_CLASSES.map((cls) => (
                  <div key={cls.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <Avatar name={cls.studentName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{cls.studentName}</p>
                      <p className="text-sm text-slate-500">
                        {format(parseISO(cls.startTime), "EEEE, MMM d")} at{" "}
                        {format(parseISO(cls.startTime), "h:mm a")}
                      </p>
                    </div>
                    <Badge status="active">Scheduled</Badge>
                    {isWithinJoinWindow(cls.startTime) && (
                      <Button size="sm">
                        <Video className="h-4 w-4 mr-1" />
                        Join Now
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_TODAY_SCHEDULE.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium text-slate-500">{slot.time}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{slot.student}</p>
                      <p className="text-xs text-slate-500">{slot.topic}</p>
                    </div>
                    <Badge
                      variant={
                        slot.status === "completed"
                          ? "secondary"
                          : slot.status === "upcoming"
                          ? "primary"
                          : "outline"
                      }
                    >
                      {slot.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/(teacher)/availability" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Manage Availability
                </Button>
              </Link>
              <Link href="/(teacher)/schedule" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full Schedule
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
