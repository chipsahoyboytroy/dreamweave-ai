"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Audio Player
// ═══════════════════════════════════════════════════════

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title?: string;
}

export default function AudioPlayer({ src, title = "Dream Narration" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!src || src === "generating") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-dream-card border border-dream-border">
        <div className="w-10 h-10 rounded-full bg-dream-accent/20 flex items-center justify-center">
          <Volume2 className="w-5 h-5 text-dream-accent animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium text-dream-text">{title}</p>
          <p className="text-xs text-dream-muted">Generating narration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-dream-card border border-dream-border">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-dream-accent hover:bg-dream-accent/80 flex items-center justify-center transition-colors flex-shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dream-text truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-dream-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-dream-accent rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-dream-muted flex-shrink-0">
            {duration ? formatTime(duration) : "0:00"}
          </span>
        </div>
      </div>
    </div>
  );
}
