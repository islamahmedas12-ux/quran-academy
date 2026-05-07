"use client";

import * as React from "react";
import { Star, Video, BookOpen, Clock, Users, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TeacherCardProps {
  teacher: {
    id: string;
    userId: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string;
    specialization: string[];
    availability: unknown[];
    rating: number;
    totalClasses: number;
  };
  onSelect: (teacher: TeacherCardProps["teacher"]) => void;
  isSelected?: boolean;
}

export function TeacherCard({ teacher, onSelect, isSelected }: TeacherCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={() => onSelect(teacher)}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="relative p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar alt={teacher.name} src={teacher.avatar} size="lg" />
            {isSelected && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-slate-900">{teacher.name}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {teacher.specialization.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="default" className="text-xs bg-primary/10 text-primary border-0">
                  {spec}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-slate-900">{teacher.rating.toFixed(1)}</span>
                <span className="text-slate-400">({teacher.totalClasses})</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="h-4 w-4" />
                <span>{teacher.totalClasses} classes</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600 line-clamp-2 leading-relaxed">{teacher.bio}</p>

        <div className="flex gap-3 mt-5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 group-hover:border-primary/50 transition-colors"
          >
            <Video className="h-4 w-4" />
            View Profile
          </Button>
          <Button
            size="sm"
            className={cn(
              "flex-1 gap-2 transition-all",
              isSelected
                ? "bg-primary shadow-md"
                : "bg-primary/90 hover:bg-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(teacher);
            }}
          >
            <BookOpen className="h-4 w-4" />
            {isSelected ? "Selected" : "Select"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
