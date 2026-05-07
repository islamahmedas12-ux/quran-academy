"use client";

import * as React from "react";
import { Star, Video, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Teacher } from "@/lib/types";

interface TeacherCardProps {
  teacher: Teacher;
  onSelect: (teacher: Teacher) => void;
  isSelected?: boolean;
}

export function TeacherCard({ teacher, onSelect, isSelected }: TeacherCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => onSelect(teacher)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar name={teacher.name} src={teacher.avatar} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{teacher.name}</h3>
              {isSelected && (
                <Badge variant="success" className="text-xs">Selected</Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-2">
              {teacher.specialization.join(", ")}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-medium">{teacher.rating.toFixed(1)}</span>
                <span className="text-slate-400">({teacher.totalClasses})</span>
              </div>
              <div className="text-slate-400">·</div>
              <span className="text-slate-500">{teacher.totalClasses} classes</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600 line-clamp-2">{teacher.bio}</p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <Video className="h-4 w-4" />
            View Profile
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(teacher);
            }}
          >
            <BookOpen className="h-4 w-4" />
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}