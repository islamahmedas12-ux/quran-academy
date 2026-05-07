"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";

interface QuranVerse {
  id: string;
  surah: number;
  verse: number;
  text: string;
  transliteration: string;
  translation: string;
  audioUrl: string;
}

interface VerseDisplayProps {
  verse: QuranVerse;
  isPlaying: boolean;
  isCurrentVerse: boolean;
  showTranslation: boolean;
  translationLanguage: string;
  fontSize: "sm" | "md" | "lg" | "xl";
  onPlayAudio: (verse: QuranVerse) => void;
  onBookClass: (verse: QuranVerse) => void;
}

export function VerseDisplay({
  verse,
  isPlaying,
  isCurrentVerse,
  showTranslation,
  translationLanguage,
  fontSize,
  onPlayAudio,
  onBookClass,
}: VerseDisplayProps) {
  const fontSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <div
      className={cn(
        "group relative p-6 rounded-xl transition-all duration-300",
        isCurrentVerse
          ? "bg-primary/5 ring-2 ring-primary/20"
          : "hover:bg-slate-50"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-500">
          {verse.verse}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <button
              onClick={() => onPlayAudio(verse)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                isPlaying && isCurrentVerse
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-primary hover:text-white"
              )}
            >
              {isPlaying && isCurrentVerse ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isPlaying && isCurrentVerse ? "Playing" : "Play"}
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onBookClass(verse)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Book a Class
            </Button>
          </div>

          <p
            dir="rtl"
            className={cn(
              "font-arabic text-right leading-[2] text-slate-900 mb-4",
              fontSizes[fontSize]
            )}
          >
            {verse.text}
          </p>

          <p className="text-lg text-slate-600 italic mb-4 leading-relaxed">
            {verse.transliteration}
          </p>

          {showTranslation && (
            <p className="text-base text-slate-500 leading-relaxed">
              {verse.translation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
