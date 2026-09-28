'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Volume2, Volume1, VolumeX, Repeat } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function LofiPlayer() {
  const { soundMuted } = useApp();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.6);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const LOOP_END = 240; // 4 minutes exactly (240 seconds)
  const FADE_OUT_DURATION = 5;

  // Initialize and handle first user interaction unlocking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const unlockAudio = () => {
      if (audio.paused && !soundMuted) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll'].forEach(evt => {
      window.addEventListener(evt, unlockAudio, { capture: true, once: true, passive: true });
    });

    return () => {
      ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll'].forEach(evt => {
        window.removeEventListener(evt, unlockAudio);
      });
    };
  }, [soundMuted, volume]);

  // Handle loop and smooth 5s fade-out before 4:00
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const ct = audio.currentTime;
    setCurrentTime(ct);

    // Loop check
    if (ct >= LOOP_END) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }

    // 5-second fade-out before 240s
    const fadeStart = LOOP_END - FADE_OUT_DURATION;
    if (ct >= fadeStart) {
      const remaining = LOOP_END - ct;
      const ratio = Math.max(0, remaining / FADE_OUT_DURATION);
      audio.volume = volume * ratio;
    } else {
      audio.volume = volume;
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  const formatLoopTime = (secs: number) => {
    const bounded = Math.min(LOOP_END, Math.max(0, Math.floor(secs)));
    const m = Math.floor(bounded / 60);
    const s = String(bounded % 60).padStart(2, '0');
    return `${m}:${s} / 4:00`;
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/assets/lofi-song.mp3"
        preload="auto"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }}
      />

      {/* Floating Vinyl Player Widget */}
      <aside
        aria-label="TalkLab Lo-Fi Player"
        className="fixed bottom-5 right-5 z-40 select-none flex items-center"
      >
        {!isExpanded ? (
          /* Mini Disc Trigger */
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--border-color)] border-2 border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all"
            title="TalkLab Lo-Fi Music (Click to expand controls)"
          >
            {/* Spinning Grooves */}
            <div
              className={`w-full h-full rounded-full border-2 border-neutral-700 bg-radial from-neutral-800 via-black to-neutral-900 flex items-center justify-center ${
                isPlaying ? 'spinning-vinyl' : ''
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] border border-white flex items-center justify-center">
                <span className="text-[0.6rem] text-white font-black">
                  {isPlaying ? '▶' : '⏸'}
                </span>
              </div>
            </div>

            {/* Pulse Ring when playing */}
            {isPlaying && (
              <span className="absolute -inset-1 rounded-full border-2 border-[var(--color-primary)] animate-ping opacity-30 pointer-events-none" />
            )}
          </button>
        ) : (
          /* Expanded Player Card */
          <div className="pop-card p-4 bg-[var(--bg-surface)] w-[300px] sm:w-[340px] shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Mini Vinyl */}
                <div
                  className={`w-10 h-10 rounded-full border-2 border-[var(--border-color)] bg-black flex items-center justify-center flex-shrink-0 ${
                    isPlaying ? 'spinning-vinyl' : ''
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[var(--text-main)] line-clamp-1">
                    TalkLab Lo-Fi Chill ☕
                  </h4>
                  <p className="font-mono text-[0.68rem] text-[var(--text-muted)]">
                    Super Lofi World • 4-Min Loop
                  </p>
                </div>
              </div>

              {/* Close / Collapse button */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-xs font-bold hover:scale-105"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* EQ Bar & Loop Indicator */}
            <div className="flex items-center justify-between font-mono text-[0.68rem] text-[var(--text-muted)] bg-[var(--bg-canvas)] p-2 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>{formatLoopTime(currentTime)}</span>
              </div>

              {/* Visualizer bars */}
              <div className="flex items-end gap-1 h-3.5">
                <span className={`w-1 bg-[var(--color-primary)] rounded-full transition-all ${isPlaying ? 'h-3 animate-pulse' : 'h-1'}`} />
                <span className={`w-1 bg-[var(--color-accent-coral)] rounded-full transition-all ${isPlaying ? 'h-2 animate-bounce' : 'h-1'}`} />
                <span className={`w-1 bg-[var(--color-accent-gold)] rounded-full transition-all ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1'}`} />
                <span className={`w-1 bg-[var(--color-accent-mint)] rounded-full transition-all ${isPlaying ? 'h-2.5 animate-bounce' : 'h-1'}`} />
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 flex-1">
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                  aria-label="Lo-Fi volume"
                />
              </div>

              {/* Play / Pause CTA */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
