"use client";

import * as React from "react";
import { Calendar, Clock, DollarSign, Users, Video, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { format, parseISO, isToday, isTomorrow } from "date-fns";

interface UpcomingClass {
  id: string;
  studentName: string;
  startTime: string;
  endTime: string;
  jitsiRoom: string;
}

interface WeeklyEarning {
  day: string;
  amount: number;
}

export default function TeacherDashboardPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  React.useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const todayClasses: UpcomingClass[] = [
    {
      id: "1",
      studentName: "Ahmed Muhammad",
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      jitsiRoom: "class_1_abc",
    },
    {
      id: "2",
      studentName: "Fatima Hassan",
      startTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      jitsiRoom: "class_2_def",
    },
  ];

  const upcomingClasses: UpcomingClass[] = [
    {
      id: "3",
      studentName: "Omar Khalid",
      startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
      jitsiRoom: "class_3_ghi",
    },
    {
      id: "4",
      studentName: "Aisha Rahman",
      startTime: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 51 * 60 * 60 * 1000).toISOString(),
      jitsiRoom: "class_4_jkl",
    },
  ];

  const weeklyEarnings: WeeklyEarning[] = [
    { day: "Mon", amount: 120 },
    { day: "Tue", amount: 80 },
    { day: "Wed", amount: 160 },
    { day: "Thu", amount: 120 },
    { day: "Fri", amount: 200 },
    { day: "Sat", amount: 0 },
    { day: "Sun", amount: 0 },
  ];

  const maxEarning = Math.max(...weeklyEarnings.map((e) => e.amount));

  const stats = [
    {
      label: "Total Students",
      value: "24",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Classes This Week",
      value: "18",
      icon: Video,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Hours Taught",
      value: "42",
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "This Week's Earnings",
      value: currencyFormatter.format(680),
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  const formatClassTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, "h:mm a")}`;
    return format(date, "EEE, MMM d 'at' h:mm a");
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, Sheikh Ibrahim</h1>
        <p className="text-muted-foreground">Here&apos;s your teaching overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today&apos;s Schedule</CardTitle>
                <CardDescription>{format(new Date(), "EEEE, MMMM d")}</CardDescription>
              </div>
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                {todayClasses.length} classes
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayClasses.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No classes scheduled for today</p>
              </div>
            ) : (
              todayClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Avatar name={cls.studentName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{cls.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatClassTime(cls.startTime)}
                    </p>
                  </div>
                  <Button size="sm">
                    <Video className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Weekly Earnings Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Earnings</CardTitle>
                <CardDescription>This week vs last week</CardDescription>
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+12%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 gap-2">
              {weeklyEarnings.map((earning) => (
                <div key={earning.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/10 rounded-t-lg transition-all"
                    style={{
                      height: `${maxEarning > 0 ? (earning.amount / maxEarning) * 100 : 0}%`,
                      minHeight: earning.amount > 0 ? "8px" : "4px",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{earning.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total this week</p>
                <p className="text-xl font-bold">{currencyFormatter.format(680)}</p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
          <CardDescription>Next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingClasses.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No upcoming classes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <Avatar name={cls.studentName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{cls.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatClassTime(cls.startTime)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {format(parseISO(cls.startTime), "h:mm a")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Calendar className="h-5 w-5" />
          <span className="text-sm">Update Availability</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Users className="h-5 w-5" />
          <span className="text-sm">View Students</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <DollarSign className="h-5 w-5" />
          <span className="text-sm">Earnings</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Video className="h-5 w-5" />
          <span className="text-sm">Teaching Tips</span>
        </Button>
      </div>
    </div>
  );
}