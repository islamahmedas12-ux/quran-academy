"use client";

import * as React from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string | null;
  currentVerseId: string | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onEnded: () => void;
}

export function AudioPlayer({ audioUrl, currentVerseId, isPlaying, onPlayPause, onEnded }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl || "";
      audioRef.current.load();
    }
  }, [audioUrl]);

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
      <audio
        ref={audioRef}
        onEnded={onEnded}
      />
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            className="h-10 w-10 rounded-full"
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
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-slate-400" />
          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary rounded-full" />
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Verse {currentVerseId?.split("-").pop() || "1"}
        </p>
      </div>
    </div>
  );
}