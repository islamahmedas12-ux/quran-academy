"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Surah } from "@/lib/types";

interface SurahListProps {
  surahs: Surah[];
  selectedSurah: number;
  onSelectSurah: (number: number) => void;
  isLoading?: boolean;
}

const revelationColors = {
  Meccan: "bg-amber-100 text-amber-800",
  Medinan: "bg-emerald-100 text-emerald-800",
};

export function SurahList({ surahs, selectedSurah, onSelectSurah, isLoading }: SurahListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {surahs.map((surah) => (
        <button
          key={surah.number}
          onClick={() => onSelectSurah(surah.number)}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
            selectedSurah === surah.number
              ? "bg-primary text-white"
              : "hover:bg-slate-100"
          )}
        >
          <span
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              selectedSurah === surah.number
                ? "bg-white/20 text-white"
                : "bg-primary/10 text-primary"
            )}
          >
            {surah.number}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "font-medium truncate",
                  selectedSurah === surah.number ? "text-white" : "text-slate-900"
                )}
              >
                {surah.englishName}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  selectedSurah === surah.number
                    ? "border-white/30 text-white"
                    : revelationColors[surah.revelationType]
                )}
              >
                {surah.revelationType}
              </Badge>
            </div>
            <p
              className={cn(
                "text-sm truncate",
                selectedSurah === surah.number ? "text-white/80" : "text-slate-500"
              )}
            >
              {surah.numberOfAyahs} verses · {surah.englishNameTranslation}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}