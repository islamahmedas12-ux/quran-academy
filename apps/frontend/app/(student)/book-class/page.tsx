"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle, Clock, Video, ArrowLeft, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { TeacherCard } from "@/components/quran/TeacherCard";
import type { Teacher } from "@/lib/types";

const MOCK_TEACHERS: Teacher[] = [
  {
    id: "teacher_1",
    userId: "user_1",
    name: "Sheikh Ibrahim",
    email: "ibrahim@quranacademy.com",
    avatar: null,
    bio: "Experienced Quran teacher with 15 years of experience. Specializes in Tajweed, Hifz (memorization), and Tafsir. Graduate from Al-Azhar University.",
    specialization: ["Tajweed", "Hifz", "Tafsir"],
    availability: [],
    rating: 4.9,
    totalClasses: 245,
  },
  {
    id: "teacher_2",
    userId: "user_2",
    name: "Sheikh Abdullah",
    email: "abdullah@quranacademy.com",
    avatar: null,
    bio: "Dedicated Quran instructor focusing on proper pronunciation and Quranic Arabic. Passionate about helping students build strong foundations.",
    specialization: ["Arabic Grammar", "Tajweed", "Reading"],
    availability: [],
    rating: 4.7,
    totalClasses: 189,
  },
  {
    id: "teacher_3",
    userId: "user_3",
    name: "Ustadha Fatima",
    email: "fatima@quranacademy.com",
    avatar: null,
    bio: "Female Quran teacher specializing in teaching children and beginners. Patient and caring approach with interactive learning methods.",
    specialization: ["Children", "Beginners", "Tajweed"],
    availability: [],
    rating: 4.8,
    totalClasses: 312,
  },
  {
    id: "teacher_4",
    userId: "user_4",
    name: "Sheikh Muhammad",
    email: "muhammad@quranacademy.com",
    avatar: null,
    bio: "Expert in Quran recitation with beautiful voice. Teaches advanced Tajweed rules and prepares students for Quran competitions.",
    specialization: ["Advanced Tajweed", "Qira'at", "Competition Prep"],
    availability: [],
    rating: 4.95,
    totalClasses: 178,
  },
];

type Step = "teacher" | "time" | "confirm" | "success";

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

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
  ];

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setIsBooking(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsBooking(false);
    setStep("success");
  };

  const handleGoBack = () => {
    if (step === "time") {
      setSelectedTeacher(null);
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

    const event = {
      title: `Quran Class with ${selectedTeacher?.name}`,
      start: startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      end: endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      description: `Your Quran class session with ${selectedTeacher?.name}`,
    };

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&description=${encodeURIComponent(event.description)}`;

    window.open(googleCalUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {step !== "teacher" && step !== "success" && (
              <button
                onClick={handleGoBack}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold">Book a Class</h1>
              <p className="text-sm text-slate-500">
                {step === "teacher" && "Step 1 of 3"}
                {step === "time" && "Step 2 of 3"}
                {step === "confirm" && "Step 3 of 3"}
                {step === "success" && "Booking Confirmed"}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-4">
            {["teacher", "time", "confirm"].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step === s
                      ? "bg-primary text-white"
                      : ["teacher", "time", "confirm"].indexOf(step) > i
                      ? "bg-primary/20 text-primary"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={cn(
                      "flex-1 h-1 rounded",
                      ["teacher", "time", "confirm"].indexOf(step) > i
                        ? "bg-primary"
                        : "bg-slate-100"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Select Teacher */}
        {step === "teacher" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Select a Teacher</h2>
            {MOCK_TEACHERS.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onSelect={handleTeacherSelect}
                isSelected={selectedTeacher?.id === teacher.id}
              />
            ))}
          </div>
        )}

        {/* Step 2: Select Time */}
        {step === "time" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Avatar name={selectedTeacher?.name || ""} size="md" />
              <div>
                <p className="font-medium">{selectedTeacher?.name}</p>
                <p className="text-sm text-slate-500">
                  {selectedTeacher?.specialization.join(", ")}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Select Date</h3>
              <div className="grid grid-cols-7 gap-1">
                {availableDates.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDate(date.value)}
                    className={cn(
                      "p-2 rounded-lg border text-center transition-colors",
                      selectedDate === date.value
                        ? "bg-primary text-white border-primary"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <p className="text-xs opacity-70">{date.day}</p>
                    <p className="font-medium">{date.date}</p>
                    <p className="text-xs opacity-70">{date.month}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div>
                <h3 className="font-semibold mb-3">Select Time</h3>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={cn(
                        "p-3 rounded-lg border text-center transition-colors",
                        selectedTime === time
                          ? "bg-primary text-white border-primary"
                          : "border-slate-200 hover:bg-slate-50"
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedTeacher.name} size="lg" />
                  <div>
                    <p className="font-semibold">{selectedTeacher.name}</p>
                    <p className="text-sm text-slate-500">
                      {selectedTeacher.specialization.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Date</p>
                      <p className="font-medium">
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Time</p>
                      <p className="font-medium">{selectedTime}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className="text-sm font-medium mb-2 block">
                    What would you like to focus on? (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Tajweed rules for specific letters, memorization of a specific surah..."
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleConfirm}
              isLoading={isBooking}
              className="w-full"
              size="lg"
            >
              Confirm Booking
            </Button>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-slate-500 mb-6">
              Your class with {selectedTeacher?.name} has been scheduled.
            </p>

            <Card className="text-left mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="font-medium">Class Details</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-slate-500">Date:</span>{" "}
                    {selectedDate && new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    <span className="text-slate-500">Time:</span> {selectedTime}
                  </p>
                  <p>
                    <span className="text-slate-500">Duration:</span> 30 minutes
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleAddToCalendar}
                className="flex-1 gap-2"
              >
                <Download className="h-4 w-4" />
                Add to Calendar
              </Button>
              <Button onClick={() => router.push("/(student)/dashboard")} className="flex-1">
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}