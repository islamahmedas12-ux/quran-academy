"use client";

import * as React from "react";
import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 mt-2", change >= 0 ? "text-emerald-600" : "text-red-600")}>
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {change >= 0 ? "+" : ""}{change}%
                </span>
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn("p-4 rounded-full", color)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminAnalyticsPage() {
  const totalStudents = 1247;
  const totalTeachers = 48;
  const totalCourses = 23;
  const monthlyRevenue = 45890;

  const monthlyData = [
    { month: "Jan", students: 980, revenue: 32000 },
    { month: "Feb", students: 1050, revenue: 35500 },
    { month: "Mar", students: 1120, revenue: 38200 },
    { month: "Apr", students: 1180, revenue: 41000 },
    { month: "May", students: 1210, revenue: 42800 },
    { month: "Jun", students: 1247, revenue: 45890 },
  ];

  const maxStudents = Math.max(...monthlyData.map((d) => d.students));
  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  const topCourses = [
    { name: "Quran Memorization Basics", enrolled: 156, rating: 4.8 },
    { name: "Tajweed Rules Mastery", enrolled: 234, rating: 4.95 },
    { name: "Arabic Grammar Fundamentals", enrolled: 89, rating: 4.6 },
    { name: "Islamic Studies for Beginners", enrolled: 312, rating: 4.7 },
    { name: "Advanced Tafsir", enrolled: 45, rating: 4.9 },
  ];

  const topTeachers = [
    { name: "Sheikh Muhammad", classes: 234, rating: 4.95 },
    { name: "Ustadha Fatima", classes: 312, rating: 4.8 },
    { name: "Sheikh Ibrahim", classes: 189, rating: 4.85 },
    { name: "Sheikh Abdullah", classes: 156, rating: 4.7 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Overview of platform performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          change={8.2}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Active Teachers"
          value={totalTeachers.toString()}
          change={4.1}
          icon={GraduationCap}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Total Courses"
          value={totalCourses.toString()}
          change={2.5}
          icon={BookOpen}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={`SAR ${monthlyRevenue.toLocaleString()}`}
          change={12.5}
          icon={DollarSign}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Students Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Students Growth</CardTitle>
            <CardDescription>New enrollments over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 gap-2">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                    style={{
                      height: `${(data.students / maxStudents) * 100}%`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-xl font-bold">{totalStudents.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Growth</p>
                <p className="text-xl font-bold text-emerald-600">+27.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 gap-2">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600"
                    style={{
                      height: `${(data.revenue / maxRevenue) * 100}%`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold">SAR {monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">vs Last Month</p>
                <p className="text-xl font-bold text-emerald-600">+7.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Courses</CardTitle>
            <CardDescription>Most popular courses by enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCourses.map((course, i) => (
                <div key={course.name} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{course.name}</p>
                    <p className="text-sm text-muted-foreground">{course.enrolled} students</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span>★</span>
                    <span className="font-medium">{course.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Teachers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Teachers</CardTitle>
            <CardDescription>Teachers with the most classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTeachers.map((teacher, i) => (
                <div key={teacher.name} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground">{teacher.classes} classes</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span>★</span>
                    <span className="font-medium">{teacher.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">94%</p>
              <p className="text-sm text-muted-foreground mt-1">Student Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">4.85</p>
              <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">2,340</p>
              <p className="text-sm text-muted-foreground mt-1">Classes This Month</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">98.2%</p>
              <p className="text-sm text-muted-foreground mt-1">Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}