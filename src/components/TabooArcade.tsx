'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { TABOO_DECK } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';

export default function TabooArcade() {
  const { fireConfetti } = useApp();
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [timerSeconds, setTimerSeconds] = useState<number>(45);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const card = TABOO_DECK[cardIndex];

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            SoundFX.playBuzzer();
            return 45;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      SoundFX.playPop(480);
    } else {
      setIsTimerRunning(true);
      SoundFX.playPop(700);
    }
  };

  const handleCorrect = () => {
    SoundFX.playPop(620 + combo * 40);
    setScore(prev => prev + 100 * combo);
    const nextCombo = combo + 1;
    setCombo(nextCombo);

    if (nextCombo >= 3) {
      fireConfetti();
    }

    setCardIndex(prev => (prev + 1) % TABOO_DECK.length);
  };

  const handlePass = () => {
    SoundFX.playBuzzer();
    setCombo(1);
    setCardIndex(prev => (prev + 1) % TABOO_DECK.length);
  };

  return (
    <section className="py-16 sm:py-20 border-t-[2.5px] border-[var(--border-color)]" id="arcade">
      <div className="tl-container max-w-4xl">
        <div className="text-center space-y-3 mb-10">
          <span className="pop-badge mint">Vocabulary Sprint</span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)]">
            Taboo Word-Ban Arcade
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">
            Describe the target word in English without using ANY of the 4 forbidden words. Chain together correct guesses to stack up combo multipliers!
          </p>
        </div>

        <div className="pop-card p-6 sm:p-9 bg-[var(--bg-surface)]">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[var(--border-color)] pb-4 mb-6">
            <div>
              <span className="font-mono text-xs font-black text-[var(--text-muted)] uppercase tracking-wider block">
                Active Game Mode
              </span>
              <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)]">
                Fluency Circumlocution Lab
              </h3>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="font-mono text-xs font-black px-2.5 py-1 bg-[var(--color-accent-coral-light)] text-[var(--color-accent-coral-dark)] border-[1.5px] border-[var(--color-accent-coral)] rounded-full shadow-[2px_2px_0px_var(--shadow-color)]">
                🔥 COMBO: {combo}x
              </span>
              <span className="pop-badge gold font-mono font-black text-xs">
                XP: {score}
              </span>
            </div>
          </div>

          {/* Arena: Left Physical Card + Right Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left Card Simulation */}
            <div className="md:col-span-6 p-6 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)] flex flex-col justify-between space-y-6">
              <div>
                <span className="font-mono text-xs font-black uppercase text-[var(--text-muted)] tracking-wider block mb-1">
                  Explain This Word
                </span>
                <div className="font-['Outfit'] font-black text-3xl sm:text-4xl text-[var(--color-primary)] tracking-tight">
                  {card.target}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] space-y-2">
                <span className="font-mono text-xs font-black uppercase text-[var(--color-accent-coral)] tracking-wider block">
                  Forbidden Words (Do Not Say!)
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {card.forbidden.map((word, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-xs font-bold px-2 py-1.5 rounded-lg bg-[var(--color-accent-coral-light)] text-[var(--color-accent-coral-dark)] border border-[var(--color-accent-coral)]"
                    >
                      🚫 {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)]">
                <h4 className="font-extrabold text-sm sm:text-base text-[var(--text-main)] mb-1">
                  The Arcade Rule:
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Get your partner to say the target word without slipping up on any forbidden words. Hit <strong>Buzz / Pass</strong> if you slip, or <strong>Got It!</strong> to level up!
                </p>
              </div>

              {/* Timer Row */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                <div>
                  <span className="font-mono text-[0.7rem] uppercase font-bold text-[var(--text-muted)] block">
                    Round Clock
                  </span>
                  <div className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--color-primary)]">
                    {timerSeconds}s
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="pop-btn pop-btn-surface pop-btn-sm"
                >
                  <span>{isTimerRunning ? '⏸ Pause' : '▶ Start Timer'}</span>
                </button>
              </div>

              {/* Pass / Got It Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePass}
                  className="pop-btn pop-btn-surface pop-btn-md flex-1 justify-center"
                >
                  <span>✕ Pass / Buzz</span>
                </button>
                <button
                  type="button"
                  onClick={handleCorrect}
                  className="pop-btn pop-btn-primary pop-btn-md flex-1.5 justify-center"
                >
                  <span>✓ Got It! (+{100 * combo} XP)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
