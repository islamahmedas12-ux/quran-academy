"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherSchedule } from "@/lib/hooks";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { Video, Clock, User, MapPin, FileText, ChevronLeft, ChevronRight } from "lucide-react";

function formatClassTime(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow at ${format(date, "h:mm a")}`;
  return format(date, "EEEE, MMM d 'at' h:mm a");
}

function getClassStatus(
  status: string,
  startTime: string
): { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" } {
  if (isPast(parseISO(startTime))) {
    return { label: "Completed", variant: "secondary" };
  }
  switch (status) {
    case "scheduled":
      return { label: "Scheduled", variant: "success" };
    case "in_progress":
      return { label: "In Progress", variant: "default" };
    case "cancelled":
      return { label: "Cancelled", variant: "destructive" };
    default:
      return { label: status, variant: "outline" };
  }
}

export default function TeacherSchedulePage() {
  const { classes, isLoading } = useTeacherSchedule();
  const [selectedClass, setSelectedClass] = React.useState<ScheduledClass | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = React.useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const upcomingClasses = classes.filter(
    (c) => !isPast(parseISO(c.startTime)) || true
  );

  const classesByDate = React.useMemo(() => {
    const grouped: Record<string, ScheduledClass[]> = {};
    upcomingClasses.forEach((cls) => {
      const dateKey = format(parseISO(cls.startTime), "yyyy-MM-dd");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(cls);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [upcomingClasses]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">Manage your upcoming classes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-32 text-center">
            {format(currentWeekStart, "MMM d")} -{" "}
            {format(
              new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
              "MMM d, yyyy"
            )}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Classes by Date */}
      {classesByDate.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No upcoming classes</h3>
            <p className="text-muted-foreground mt-1">
              You don&apos;t have any scheduled classes this week
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {classesByDate.map(([dateKey, dateClasses]) => (
            <div key={dateKey}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                {format(parseISO(dateKey), "EEEE, MMMM d")}
              </h2>
              <div className="space-y-3">
                {dateClasses.map((cls) => {
                  const status = getClassStatus(cls.status, cls.startTime);
                  const isPastClass = isPast(parseISO(cls.startTime));
                  return (
                    <Card
                      key={cls.id}
                      className={`cursor-pointer transition-colors ${
                        isPastClass
                          ? "bg-muted/50 opacity-75"
                          : "hover:bg-muted/30"
                      }`}
                      onClick={() => setSelectedClass(cls)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar name={cls.studentName} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{cls.studentName}</p>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatClassTime(cls.startTime)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                {format(parseISO(cls.startTime), "h:mm a")} -{" "}
                                {format(parseISO(cls.endTime), "h:mm a")}
                              </span>
                            </div>
                          </div>
                          {!isPastClass && (
                            <Button size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Join Class
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Detail Modal (simplified) */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Class Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClass(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedClass.studentName} size="lg" />
                <div>
                  <p className="font-semibold">{selectedClass.studentName}</p>
                  <p className="text-sm text-muted-foreground">Student</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatClassTime(selectedClass.startTime)} (
                    {format(parseISO(selectedClass.startTime), "h:mm a")} -{" "}
                    {format(parseISO(selectedClass.endTime), "h:mm a")}
                    )
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Room: {selectedClass.jitsiRoom}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedClass.notes || "No notes for this class"}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                {!isPast(parseISO(selectedClass.startTime)) && (
                  <Button className="flex-1">
                    <Video className="h-4 w-4 mr-2" />
                    Join Class
                  </Button>
                )}
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
