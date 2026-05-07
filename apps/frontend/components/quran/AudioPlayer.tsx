"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
} from "lucide-react";

interface AudioPlayerProps {
  currentVerse: { surah: number; verse: number } | null;
  isPlaying: boolean;
  reciter: string;
  onReciterChange: (reciter: string) => void;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  progress?: number;
}

const RECITERS = [
  { id: "alafasy", name: "Mishary Alafasy", flag: "🇰🇼" },
  { id: "abdulbaset", name: "Abdul Rahman Al-Sudais", flag: "🇸🇦" },
  { id: "shuraim", name: "Saud Al-Shuraim", flag: "🇸🇦" },
  { id: "maher", name: "Maher Al Muaiqly", flag: "🇸🇦" },
];

export function AudioPlayer({
  currentVerse,
  isPlaying,
  reciter,
  onReciterChange,
  onPlayPause,
  onPrevious,
  onNext,
  progress = 0,
}: AudioPlayerProps) {
  const [volume, setVolume] = React.useState(80);
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 transition-transform duration-300",
        currentVerse ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              value={reciter}
              onChange={(e) => onReciterChange(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.flag} {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              disabled={!currentVerse}
              className="h-8 w-8"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onPlayPause}
              disabled={!currentVerse}
              className="h-10 w-10 bg-primary text-white hover:bg-primary-hover rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={!currentVerse}
              className="h-8 w-8"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-900">
                {currentVerse
                  ? `Surah ${currentVerse.surah}, Verse ${currentVerse.verse}`
                  : "Select a verse to play"}
              </span>
            </div>
            <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-slate-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 accent-primary"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
