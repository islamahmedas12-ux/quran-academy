"use client";

import * as React from "react";
import { Play, Pause, BookOpen, Mic } from "lucide-react";
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
  darkMode?: boolean;
}

export function VerseDisplay({
  verses,
  fontSize,
  translationLang,
  onPlayVerse,
  onBookClass,
  playingVerseId,
  isPlaying,
  darkMode = false,
}: VerseDisplayProps) {
  if (verses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Mic className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-slate-500">Select a Surah to read</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {verses.map((verse, index) => (
        <div
          key={verse.id}
          className={cn(
            "group relative p-6 lg:p-8 rounded-2xl border transition-all duration-300 animate-slide-up",
            darkMode
              ? "bg-slate-800/50 border-slate-700 hover:border-primary/30"
              : "bg-white border-slate-100 hover:border-primary/20 hover:shadow-lg",
            playingVerseId === verse.id && isPlaying && "ring-2 ring-primary"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Verse number badge */}
          <div className="absolute -top-3 left-4">
            <span className={cn(
              "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm",
              darkMode
                ? "bg-primary text-white"
                : "bg-gradient-to-br from-primary to-primary/80 text-white"
            )}>
              {verse.verse}
            </span>
          </div>

          <div className="space-y-4">
            {/* Arabic text */}
            <p
              className="font-arabic leading-loose text-right"
              style={{ fontSize: `${fontSize}px`, lineHeight: "2.2" }}
              dir="rtl"
            >
              {verse.text}
            </p>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <span className="text-primary">◆</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>

            {/* Transliteration */}
            <p className={cn(
              "italic leading-relaxed text-center",
              darkMode ? "text-slate-400" : "text-slate-500"
            )} style={{ fontSize: `${fontSize * 0.6}px` }}>
              {verse.transliteration}
            </p>

            {/* Translation */}
            <p className={cn(
              "leading-relaxed text-center font-medium",
              darkMode ? "text-slate-300" : "text-slate-700"
            )} style={{ fontSize: `${fontSize * 0.7}px` }}>
              {verse.translation}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant={playingVerseId === verse.id && isPlaying ? "default" : "outline"}
                size="sm"
                onClick={() => onPlayVerse(verse.audioUrl, verse.id)}
                className={cn(
                  "gap-2 transition-all",
                  playingVerseId === verse.id && isPlaying
                    ? "bg-primary shadow-md"
                    : darkMode && "border-slate-600 hover:bg-slate-700"
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
                className={cn(
                  "gap-2 transition-all",
                  darkMode && "border-slate-600 hover:bg-slate-700"
                )}
              >
                <BookOpen className="h-4 w-4" />
                Book Class
              </Button>
            </div>
          </div>

          {/* Playing indicator */}
          {playingVerseId === verse.id && isPlaying && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
