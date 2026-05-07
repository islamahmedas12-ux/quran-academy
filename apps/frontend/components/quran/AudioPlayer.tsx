"use client";

import * as React from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2 } from "lucide-react";
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
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);

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
      setProgress(0);
    }
  }, [audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  const waveformBars = React.useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const height = Math.random() * 40 + 20;
      const isActive = (i / 40) * 100 <= progressPercent;
      return { id: i, height, isActive };
    });
  }, [progressPercent]);

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl animate-slide-up">
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={onEnded} />

      {/* Waveform visualization */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Verse info */}
          <div className="hidden sm:block w-32">
            <p className="text-sm font-medium text-slate-900">
              Verse {currentVerseId?.split("-").pop() || "1"}
            </p>
            <p className="text-xs text-slate-500">Al-Fatiha</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={onPlayPause}
              className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress bar with waveform */}
          <div className="flex-1 flex items-center gap-3 px-2">
            <span className="text-xs text-slate-500 w-10">{formatTime(progress)}</span>
            <div className="flex-1 flex items-center gap-0.5 h-10 cursor-pointer" onClick={handleSeek}>
              {waveformBars.map((bar) => (
                <div
                  key={bar.id}
                  className={cn(
                    "w-1 rounded-full transition-all duration-100",
                    bar.isActive ? "bg-primary" : "bg-slate-200"
                  )}
                  style={{ height: `${bar.height}%` }}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 w-10">{formatTime(duration)}</span>
          </div>

          {/* Volume */}
          <div className="hidden md:flex items-center gap-2 w-32">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-slate-500" />
              ) : (
                <Volume2 className="h-4 w-4 text-slate-500" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
