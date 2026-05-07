"use client";

import * as React from "react";
import { Play, Pause, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { QuranVerse } from "@/lib/types";

interface VerseDisplayProps {
  verses: QuranVerse[];
  fontSize: number;
  translationLang: string;
  onPlayVerse: (audioUrl: string, verseId: string) => void;
  onBookClass: (verse: QuranVerse) => void;
  playingVerseId: string | null;
  isPlaying: boolean;
}

export function VerseDisplay({
  verses,
  fontSize,
  translationLang,
  onPlayVerse,
  onBookClass,
  playingVerseId,
  isPlaying,
}: VerseDisplayProps) {
  if (verses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <p>Select a Surah to read</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {verses.map((verse) => (
        <div
          key={verse.id}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
              {verse.verse}
            </span>
            <div className="flex-1">
              <p
                className="font-arabic leading-loose text-right mb-4"
                style={{ fontSize: `${fontSize}px`, lineHeight: "2" }}
                dir="rtl"
              >
                {verse.text}
              </p>
              <p className="text-slate-600 italic mb-3 text-sm">
                {verse.transliteration}
              </p>
              <p className="text-slate-700 mb-4" style={{ fontSize: `${fontSize * 0.75}px` }}>
                {verse.translation}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPlayVerse(verse.audioUrl, verse.id)}
                  className={cn(
                    "gap-2",
                    playingVerseId === verse.id && isPlaying && "bg-primary text-white"
                  )}
                >
                  {playingVerseId === verse.id && isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Playing
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBookClass(verse)}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Book Class
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}