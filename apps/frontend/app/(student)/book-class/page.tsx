"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { TeacherCard } from "@/components/quran/TeacherCard";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Star,
  ChevronRight,
  Check,
  Download,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  avatar: string | null;
  bio: string;
  specialization: string[];
  rating: number;
  totalClasses: number;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface BookingSummary {
  teacher: Teacher | null;
  slot: TimeSlot | null;
  date: Date | null;
  topic: string;
}

const MOCK_TEACHERS: Teacher[] = [
  {
    id: "1",
    name: "Sheikh Ahmad Al-Mahdi",
    avatar: null,
    bio: "Expert in Tajweed and Hifz with over 15 years of teaching experience. Specializes in helping students master proper recitation.",
    specialization: ["Tajweed", "Hifz", "Qira'at"],
    rating: 4.9,
    totalClasses: 248,
  },
  {
    id: "2",
    name: "Sheikh Mohammed Salim",
    avatar: null,
    bio: "Graduated from Al-Azhar University. Passionate about teaching Quranic Arabic and building strong foundations for beginners.",
    specialization: ["Arabic Grammar", "Beginners", "Tafseer"],
    rating: 4.7,
    totalClasses: 156,
  },
  {
    id: "3",
    name: "Sheikh Abdullah Yusuf",
    avatar: null,
    bio: "Specializes in classical recitation styles and is certified in multiple Qira'at. Great for advanced students.",
    specialization: ["Qira'at", "Advanced Tajweed", "Classical Recitation"],
    rating: 4.8,
    totalClasses: 189,
  },
  {
    id: "4",
    name: "Sheikh Omar Farooq",
    avatar: null,
    bio: "Focuses on practical application of Tajweed rules with daily life examples. Known for patient and encouraging teaching style.",
    specialization: ["Tajweed", "Practical Recitation", "Beginners"],
    rating: 4.6,
    totalClasses: 98,
  },
];

function generateCalendarLinks(booking: BookingSummary) {
  const startDate = booking.date ? new Date(booking.date) : new Date();
  const [startHour, startMin] = (booking.slot?.startTime || "09:00").split(":");
  startDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

  const endDate = new Date(startDate);
  const [endHour, endMin] = (booking.slot?.endTime || "10:00").split(":");
  endDate.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

  const title = `Quran Class with ${booking.teacher?.name}`;
  const details = `Topic: ${booking.topic}`;
  const location = "Online - Link will be sent before class";

  const googleLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

  return { googleLink };
}

export default function BookClassPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlot | null>(null);
  const [topic, setTopic] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [bookingComplete, setBookingComplete] = React.useState(false);

  const timeSlots: TimeSlot[] = [
    { id: "1", startTime: "09:00", endTime: "10:00", isAvailable: true },
    { id: "2", startTime: "10:00", endTime: "11:00", isAvailable: true },
    { id: "3", startTime: "11:00", endTime: "12:00", isAvailable: false },
    { id: "4", startTime: "14:00", endTime: "15:00", isAvailable: true },
    { id: "5", startTime: "15:00", endTime: "16:00", isAvailable: true },
    { id: "6", startTime: "16:00", endTime: "17:00", isAvailable: false },
    { id: "7", startTime: "17:00", endTime: "18:00", isAvailable: true },
    { id: "8", startTime: "18:00", endTime: "19:00", isAvailable: true },
    { id: "9", startTime: "19:00", endTime: "20:00", isAvailable: false },
  ];

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const bookingSummary: BookingSummary = {
    teacher: selectedTeacher,
    slot: selectedSlot,
    date: selectedDate,
    topic,
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setBookingComplete(true);
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  const handleDownloadICS = () => {
    const startDate = selectedDate ? new Date(selectedDate) : new Date();
    const [startHour, startMin] = (selectedSlot?.startTime || "09:00").split(":");
    startDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

    const endDate = new Date(startDate);
    const [endHour, endMin] = (selectedSlot?.endTime || "10:00").split(":");
    endDate.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

    const formatICSDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Quran Class with ${selectedTeacher?.name}
DESCRIPTION:Topic: ${topic}
LOCATION:Online
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quran-class.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const { googleLink } = generateCalendarLinks(bookingSummary);

  if (bookingComplete) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Class Booked!</h1>
            <p className="text-slate-600 mb-8">
              Your class with {selectedTeacher?.name} has been scheduled.
            </p>

            <Card className="bg-slate-50">
              <CardContent className="space-y-4 pt-4 text-left">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedTeacher?.name || ""} size="lg" />
                  <div>
                    <p className="font-semibold">{selectedTeacher?.name}</p>
                    <div className="flex gap-1 flex-wrap">
                      {selectedTeacher?.specialization.map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {selectedDate?.toLocaleDateString("en", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {selectedSlot?.startTime} - {selectedSlot?.endTime}
                    </span>
                  </div>
                </div>

                {topic && (
                  <div className="text-sm text-slate-600">
                    <p className="font-medium">Topic:</p>
                    <p className="text-slate-500">{topic}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <Button variant="outline" onClick={handleDownloadICS}>
                <Download className="h-4 w-4 mr-2" />
                Download Calendar
              </Button>
              <Button onClick={() => window.open(googleLink, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Add to Google Calendar
              </Button>
            </div>

            <Button variant="ghost" onClick={() => router.push("/(student)/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Book a Class</h1>
        <p className="text-slate-600 mt-1">Schedule a 1-on-1 session with an expert teacher</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s < step
                  ? "bg-primary text-white"
                  : s === step
                  ? "bg-primary text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            <span className={`text-sm font-medium ${s === step ? "text-slate-900" : "text-slate-500"}`}>
              {s === 1 ? "Select Teacher" : s === 2 ? "Choose Time" : "Confirm"}
            </span>
            {s < 3 && <ChevronRight className="h-4 w-4 text-slate-300" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Choose a Teacher</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {MOCK_TEACHERS.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onSelect={setSelectedTeacher}
                isSelected={selectedTeacher?.id === teacher.id}
              />
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar name={selectedTeacher?.name || ""} size="md" />
                <div>
                  <p className="font-medium">{selectedTeacher?.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm text-slate-500">{selectedTeacher?.rating}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="ml-auto">
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Select a Date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((date) => {
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 w-16 py-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs opacity-70">
                      {date.toLocaleDateString("en", { weekday: "short" })}
                    </p>
                    <p className="text-lg font-bold">{date.getDate()}</p>
                    <p className="text-xs opacity-70">
                      {date.toLocaleDateString("en", { month: "short" })}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Select a Time</h2>
              <div className="grid gap-2 sm:grid-cols-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                    disabled={!slot.isAvailable}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                      !slot.isAvailable
                        ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                        : selectedSlot?.id === slot.id
                        ? "border-primary bg-primary text-white"
                        : "border-slate-200 hover:border-primary"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedTeacher?.name || ""} size="lg" />
                <div className="flex-1">
                  <p className="font-semibold text-lg">{selectedTeacher?.name}</p>
                  <div className="flex gap-1 mt-1">
                    {selectedTeacher?.specialization.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {selectedDate?.toLocaleDateString("en", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {selectedSlot?.startTime} - {selectedSlot?.endTime}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">What would you like to focus on?</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Tajweed practice, Surah Al-Fatihah recitation, Memorization..."
              className="w-full h-28 px-4 py-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 1 ? "Cancel" : "Back"}
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && !selectedTeacher) ||
              (step === 2 && (!selectedDate || !selectedSlot))
            }
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleConfirm} isLoading={isLoading}>
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
}
