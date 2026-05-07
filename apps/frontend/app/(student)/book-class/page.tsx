"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle, Clock, Video, ArrowLeft, Download, User, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { TeacherCard } from "@/components/quran/TeacherCard";
import { Badge } from "@/components/ui/badge";
import { EmptyStateCard } from "@/components/ui/empty-state";
import type { Teacher } from "@/lib/types";

const MOCK_TEACHERS: Teacher[] = [
  { id: "teacher_1", userId: "user_1", name: "Sheikh Ibrahim", email: "ibrahim@quranacademy.com", avatar: null, bio: "Experienced Quran teacher with 15 years of experience. Specializes in Tajweed, Hifz (memorization), and Tafsir. Graduate from Al-Azhar University.", specialization: ["Tajweed", "Hifz", "Tafsir"], availability: [], rating: 4.9, totalClasses: 245 },
  { id: "teacher_2", userId: "user_2", name: "Sheikh Abdullah", email: "abdullah@quranacademy.com", avatar: null, bio: "Dedicated Quran instructor focusing on proper pronunciation and Quranic Arabic. Passionate about helping students build strong foundations.", specialization: ["Arabic Grammar", "Tajweed", "Reading"], availability: [], rating: 4.7, totalClasses: 189 },
  { id: "teacher_3", userId: "user_3", name: "Ustadha Fatima", email: "fatima@quranacademy.com", avatar: null, bio: "Female Quran teacher specializing in teaching children and beginners. Patient and caring approach with interactive learning methods.", specialization: ["Children", "Beginners", "Tajweed"], availability: [], rating: 4.8, totalClasses: 312 },
  { id: "teacher_4", userId: "user_4", name: "Sheikh Muhammad", email: "muhammad@quranacademy.com", avatar: null, bio: "Expert in Quran recitation with beautiful voice. Teaches advanced Tajweed rules and prepares students for Quran competitions.", specialization: ["Advanced Tajweed", "Qira'at", "Competition Prep"], availability: [], rating: 4.95, totalClasses: 178 },
];

type Step = "teacher" | "time" | "confirm" | "success";

const STEPS = [
  { id: "teacher", label: "Teacher" },
  { id: "time", label: "Schedule" },
  { id: "confirm", label: "Confirm" },
];

export default function BookClassPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("teacher");
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null);
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTime, setSelectedTime] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isBooking, setIsBooking] = React.useState(false);

  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return {
      value: date.toISOString().split("T")[0],
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });

  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!selectedTeacher || !selectedDate || !selectedTime) return;
    setIsBooking(true);
    try {
      const startTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      await api.post("/classes/book", {
        teacherId: selectedTeacher.id,
        startTime,
        topic: notes,
      });
      setStep("success");
    } catch (error) {
      console.error("Failed to book class:", error);
    } finally {
      setIsBooking(false);
    }
  };

  const handleGoBack = () => {
    if (step === "time") {
      setStep("teacher");
    } else if (step === "confirm") {
      setSelectedDate("");
      setSelectedTime("");
      setStep("time");
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(`${selectedDate}T${selectedTime}:00`);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    const event = { title: `Quran Class with ${selectedTeacher?.name}`, start: startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z", end: endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z", description: `Your Quran class session with ${selectedTeacher?.name}` };
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&description=${encodeURIComponent(event.description)}`;
    window.open(googleCalUrl, "_blank");
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {step !== "teacher" && step !== "success" && (
              <button onClick={handleGoBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">Book a Class</h1>
              <p className="text-sm text-slate-500">
                {step === "success" ? "Booking Confirmed" : `Step ${currentStepIndex + 1} of ${STEPS.length}`}
              </p>
            </div>
          </div>

          {/* Stepper */}
          {step !== "success" && (
            <div className="flex items-center gap-2 mt-4">
              {STEPS.map((s, i) => {
                const isActive = s.id === step;
                const isCompleted = STEPS.findIndex((sc) => sc.id === step) > i;
                return (
                  <React.Fragment key={s.id}>
                    <div className={cn("flex items-center gap-2", isActive && "flex-1")}>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                        isActive && "bg-primary text-white shadow-md",
                        isCompleted && "bg-primary/20 text-primary",
                        !isActive && !isCompleted && "bg-slate-100 text-slate-400"
                      )}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={cn("text-sm font-medium hidden sm:block", isActive ? "text-primary" : "text-slate-400")}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn("flex-1 h-1 rounded-full transition-colors", isCompleted ? "bg-primary" : "bg-slate-100")} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Select Teacher */}
        {step === "teacher" && (
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Choose Your Teacher</h2>
              <p className="text-sm text-slate-500">Select a teacher that fits your learning goals</p>
            </div>
            <div className="grid gap-4">
              {MOCK_TEACHERS.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} onSelect={handleTeacherSelect} isSelected={selectedTeacher?.id === teacher.id} />
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Time */}
        {step === "time" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden">
              <CardContent className="p-4 bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-4">
                  <Avatar name={selectedTeacher?.name || ""} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{selectedTeacher?.name}</h3>
                      <Badge variant="warning" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {selectedTeacher?.rating}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{selectedTeacher?.specialization.join(" · ")}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep("teacher")}>Change</Button>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Select Date
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDate(date.value)}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all duration-200 hover:shadow-md",
                      selectedDate === date.value
                        ? "bg-primary text-white border-primary shadow-md"
                        : "border-slate-200 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    <p className={cn("text-xs opacity-70", selectedDate === date.value && "opacity-100")}>{date.day}</p>
                    <p className="font-bold text-lg">{date.date}</p>
                    <p className={cn("text-xs opacity-70", selectedDate === date.value && "opacity-100")}>{date.month}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="animate-slide-up">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Select Time
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={cn(
                        "p-3 rounded-xl border text-center font-medium transition-all duration-200 hover:shadow-md",
                        selectedTime === time
                          ? "bg-accent text-white border-accent shadow-md"
                          : "border-slate-200 hover:border-accent/30 hover:bg-accent/5"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && selectedTeacher && (
          <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <Avatar name={selectedTeacher.name} size="lg" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{selectedTeacher.name}</p>
                    <p className="text-sm text-slate-500">{selectedTeacher.specialization.join(" · ")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm text-slate-500">Date</span>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-sm text-slate-500">Time</span>
                    </div>
                    <p className="font-semibold text-slate-900">{selectedTime}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <label className="text-sm font-medium mb-2 block">
                    What would you like to focus on? (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Tajweed rules for specific letters, memorization of a specific surah..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleConfirm} isLoading={isBooking} className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow">
              Confirm Booking
            </Button>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="text-center py-8 animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
            <p className="text-slate-500 mb-8">
              Your class with {selectedTeacher?.name} has been scheduled.
            </p>

            <Card className="text-left mb-8 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="font-bold">Class Details</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Date</p>
                    <p className="font-medium text-slate-900">
                      {selectedDate && new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Time</p>
                    <p className="font-medium text-slate-900">{selectedTime}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Duration</p>
                    <p className="font-medium text-slate-900">30 minutes</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Teacher</p>
                    <p className="font-medium text-slate-900">{selectedTeacher?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleAddToCalendar} className="flex-1 gap-2 h-12">
                <Download className="h-4 w-4" />
                Add to Calendar
              </Button>
              <Button onClick={() => router.push("/(student)/dashboard")} className="flex-1 h-12">
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
