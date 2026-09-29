'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { REEL_TOPICS, REEL_TWISTS, REEL_TIMES } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';
import { Dices, Sparkles, Flame, Clock } from 'lucide-react';

export default function SlotMachine() {
  const { openBooking, fireConfetti } = useApp();
  const [reel1, setReel1] = useState<string>(REEL_TOPICS[0]);
  const [reel2, setReel2] = useState<string>(REEL_TWISTS[0]);
  const [reel3, setReel3] = useState<string>(REEL_TIMES[2]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinCount, setSpinCount] = useState<number>(0);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    SoundFX.playPop(420);

    const tickInterval = setInterval(() => {
      SoundFX.playSlotTick();
    }, 90);

    // Rapid shuffle text
    let cycle = 0;
    const shuffleInterval = setInterval(() => {
      setReel1(REEL_TOPICS[Math.floor(Math.random() * REEL_TOPICS.length)]);
      setReel2(REEL_TWISTS[Math.floor(Math.random() * REEL_TWISTS.length)]);
      setReel3(REEL_TIMES[Math.floor(Math.random() * REEL_TIMES.length)]);
      cycle++;
      if (cycle > 18) clearInterval(shuffleInterval);
    }, 70);

    // Stop reel 1 at 1.2s
    setTimeout(() => {
      const final1 = REEL_TOPICS[Math.floor(Math.random() * REEL_TOPICS.length)];
      setReel1(final1);
      SoundFX.playPop(520);
    }, 1200);

    // Stop reel 2 at 1.7s
    setTimeout(() => {
      const final2 = REEL_TWISTS[Math.floor(Math.random() * REEL_TWISTS.length)];
      setReel2(final2);
      SoundFX.playPop(650);
    }, 1700);

    // Stop reel 3 at 2.2s
    setTimeout(() => {
      clearInterval(tickInterval);
      const final3 = REEL_TIMES[Math.floor(Math.random() * REEL_TIMES.length)];
      setReel3(final3);
      SoundFX.playFanfare();
      fireConfetti();
      setIsSpinning(false);
      setSpinCount(prev => prev + 1);
    }, 2200);
  };

  return (
    <section className="py-16 sm:py-24 bg-[var(--bg-surface-elevated)] border-t-[2.5px] border-[var(--border-color)]" id="slot-machine">
      <div className="tl-container max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <span className="pop-badge coral inline-flex items-center gap-1.5">
            <Dices className="w-3.5 h-3.5" />
            <span>Spontaneous Speaking Engine</span>
          </span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)] tracking-tight">
            The Conversation Slot Machine
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Hit spin to roll a random dilemma, an unexpected rhetorical twist, and a countdown sprint. This is how we warm up our brains before Oxford debates at TalkLab!
          </p>
        </div>

        <div className="pop-card p-6 sm:p-10 bg-[var(--bg-surface)]">
          {/* Arcade Cabinet Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[var(--border-color)] pb-4 mb-8">
            <div>
              <span className="font-mono text-xs font-black text-[var(--color-primary)] uppercase tracking-wider block">
                Interactive Arcade Engine
              </span>
              <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)]">
                Spontaneous Debate Challenge
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="pop-badge gold text-xs">
                🎰 Ready to Roll
              </span>
            </div>
          </div>

          {/* 3 Mechanical Reels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Reel 1: Topic */}
            <div className="p-5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[0.7rem] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Reel 1: Topic
                </span>
                <Flame className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className={`font-['Outfit'] font-extrabold text-base sm:text-lg text-[var(--text-main)] leading-snug transition-all ${isSpinning ? 'opacity-60 blur-[1px] scale-98' : ''}`}>
                “{reel1}”
              </div>
              <span className="text-[0.68rem] font-mono text-[var(--text-muted)] mt-2">Dilemma</span>
            </div>

            {/* Reel 2: Twist */}
            <div className="p-5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[0.7rem] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Reel 2: Twist
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              </div>
              <div className={`font-['Outfit'] font-extrabold text-base sm:text-lg text-[var(--color-primary)] leading-snug transition-all ${isSpinning ? 'opacity-60 blur-[1px] scale-98' : ''}`}>
                {reel2}
              </div>
              <span className="text-[0.68rem] font-mono text-[var(--text-muted)] mt-2">Rhetoric Rule</span>
            </div>

            {/* Reel 3: Time */}
            <div className="p-5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[0.7rem] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Reel 3: Time Limit
                </span>
                <Clock className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className={`font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--color-accent-coral)] leading-snug transition-all ${isSpinning ? 'opacity-60 blur-[1px] scale-98' : ''}`}>
                {reel3}
              </div>
              <span className="text-[0.68rem] font-mono text-[var(--text-muted)] mt-2">Sprint Duration</span>
            </div>
          </div>

          {/* Callout Notice */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border-2 border-dashed border-[var(--border-color)] text-center text-sm font-semibold mb-8 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>⚡ <strong>Your Goal:</strong> Defend or attack this prompt out loud right now before the timer expires!</span>
            {spinCount > 0 && (
              <span className="font-mono text-xs text-[var(--color-primary)] font-black bg-[var(--color-primary-light)] px-2.5 py-0.5 rounded-full">
                Spins: {spinCount}
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              disabled={isSpinning}
              onClick={spin}
              className="pop-btn pop-btn-coral pop-btn-lg w-full sm:w-auto px-8 btn-shimmer"
            >
              <span>{isSpinning ? '🎰 SPINNING TUMBLERS...' : '🎰 PULL LEVER / SPIN!'}</span>
            </button>
            <button
              type="button"
              onClick={() => openBooking()}
              className="pop-btn pop-btn-surface pop-btn-lg w-full sm:w-auto px-6"
            >
              <span>Play This in Person (30 LYD)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
