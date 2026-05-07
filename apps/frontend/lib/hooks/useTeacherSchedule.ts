"use client";

import { useState, useEffect } from "react";
import { api } from "./api";
import type { ScheduledClass } from "./types";

export function useTeacherSchedule() {
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const mockSchedule: ScheduledClass[] = [
          {
            id: "cls_1",
            teacherId: "teacher_1",
            teacherName: "Sheikh Ibrahim",
            studentId: "student_1",
            studentName: "Ahmed Muhammad",
            startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            status: "scheduled",
            jitsiRoom: "class_1_room",
          },
          {
            id: "cls_2",
            teacherId: "teacher_1",
            teacherName: "Sheikh Ibrahim",
            studentId: "student_2",
            studentName: "Fatima Hassan",
            startTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            status: "scheduled",
            jitsiRoom: "class_2_room",
          },
          {
            id: "cls_3",
            teacherId: "teacher_1",
            teacherName: "Sheikh Ibrahim",
            studentId: "student_3",
            studentName: "Omar Khalid",
            startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
            status: "scheduled",
            jitsiRoom: "class_3_room",
          },
        ];

        setTimeout(() => {
          setClasses(mockSchedule);
          setIsLoading(false);
        }, 500);
      } catch {
        setIsLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  return { classes, isLoading };
}