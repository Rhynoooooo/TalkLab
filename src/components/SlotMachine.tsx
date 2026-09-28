'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { REEL_TOPICS, REEL_TWISTS, REEL_TIMES } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';

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
    <section className="py-16 sm:py-20 bg-[var(--bg-surface-elevated)] border-t-[2.5px] border-[var(--border-color)]" id="slot-machine">
      <div className="tl-container max-w-4xl">
        <div className="text-center space-y-3 mb-10">
          <span className="pop-badge coral">Arcade Game</span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)]">
            The Conversation Slot Machine
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">
            Hit spin to roll a random topic, a wild debate twist, and a countdown sprint. This is how we warm up at TalkLab!
          </p>
        </div>

        <div className="pop-card p-6 sm:p-9 bg-[var(--bg-surface)]">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[var(--border-color)] pb-4 mb-6">
            <div>
              <span className="font-mono text-xs font-black text-[var(--color-primary)] uppercase tracking-wider block">
                Interactive Arcade Engine
              </span>
              <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)]">
                Spin For A Chaotic Debate Challenge
              </h3>
            </div>
            <span className="pop-badge gold self-start sm:self-center">
              🎰 High-Speed Icebreaker
            </span>
          </div>

          {/* 3 Mechanical Reels Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Reel 1: Topic */}
            <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] flex flex-col justify-between">
              <span className="font-mono text-[0.7rem] font-black uppercase text-[var(--text-muted)] tracking-wider mb-2">
                1. Controversial Topic
              </span>
              <div className={`font-['Outfit'] font-extrabold text-base sm:text-lg text-[var(--text-main)] min-h-[56px] flex items-center ${isSpinning ? 'opacity-70 blur-[0.5px]' : ''}`}>
                {reel1}
              </div>
            </div>

            {/* Reel 2: Twist */}
            <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] flex flex-col justify-between">
              <span className="font-mono text-[0.7rem] font-black uppercase text-[var(--text-muted)] tracking-wider mb-2">
                2. Debate Twist
              </span>
              <div className={`font-['Outfit'] font-extrabold text-base sm:text-lg text-[var(--color-primary)] min-h-[56px] flex items-center ${isSpinning ? 'opacity-70 blur-[0.5px]' : ''}`}>
                {reel2}
              </div>
            </div>

            {/* Reel 3: Time */}
            <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] flex flex-col justify-between">
              <span className="font-mono text-[0.7rem] font-black uppercase text-[var(--text-muted)] tracking-wider mb-2">
                3. Time Limit
              </span>
              <div className={`font-['Outfit'] font-black text-lg sm:text-xl text-[var(--color-accent-coral)] min-h-[56px] flex items-center ${isSpinning ? 'opacity-70 blur-[0.5px]' : ''}`}>
                {reel3}
              </div>
            </div>
          </div>

          {/* Challenge summary callout */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border-2 border-dashed border-[var(--border-color)] text-center text-sm font-semibold mb-6">
            <strong>Ready?</strong> Pull the lever below to generate your spontaneous speaking challenge! {spinCount > 0 && <span className="font-mono text-xs text-[var(--color-primary)] font-bold ml-2">(Spins: {spinCount})</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              disabled={isSpinning}
              onClick={spin}
              className="pop-btn pop-btn-coral pop-btn-lg w-full sm:w-auto justify-center"
            >
              <span>{isSpinning ? '🎰 SPINNING REELS...' : '🎰 PULL LEVER / SPIN!'}</span>
            </button>
            <button
              type="button"
              onClick={() => openBooking()}
              className="pop-btn pop-btn-surface pop-btn-lg w-full sm:w-auto justify-center"
            >
              <span>Practice This In Person (30 LYD)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
