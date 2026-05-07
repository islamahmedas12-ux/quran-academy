"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, BookOpen } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  avatar: string | null;
  bio: string;
  specialization: string[];
  rating: number;
  totalClasses: number;
  hourlyRate?: number;
}

interface TeacherCardProps {
  teacher: Teacher;
  onSelect?: (teacher: Teacher) => void;
  isSelected?: boolean;
  compact?: boolean;
}

export function TeacherCard({
  teacher,
  onSelect,
  isSelected,
  compact,
}: TeacherCardProps) {
  if (compact) {
    return (
      <button
        onClick={() => onSelect?.(teacher)}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
          isSelected
            ? "border-primary bg-primary/5"
            : "border-slate-200 hover:border-slate-300"
        )}
      >
        <Avatar name={teacher.name} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate">{teacher.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs text-slate-500">{teacher.rating}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              {teacher.totalClasses} classes
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden transition-all",
        isSelected ? "border-primary shadow-md" : "border-slate-200 hover:shadow-md"
      )}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Avatar name={teacher.name} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{teacher.name}</h3>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">{teacher.rating}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {teacher.specialization.map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-3 line-clamp-2">{teacher.bio}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{teacher.totalClasses} classes</span>
            </div>
          </div>
          {onSelect && (
            <Button onClick={() => onSelect(teacher)} size="sm">
              Select
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
