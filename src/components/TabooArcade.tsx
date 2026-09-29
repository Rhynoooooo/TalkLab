'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { TABOO_DECK } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';
import { Gamepad2, Flame, Ban, Play, Pause, X, Check, Award } from 'lucide-react';

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
    <section className="py-16 sm:py-24 border-t-[2.5px] border-[var(--border-color)] bg-[var(--bg-canvas)]" id="arcade">
      <div className="tl-container max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <span className="pop-badge mint inline-flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Vocabulary Sprint Mini-Game</span>
          </span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)] tracking-tight">
            Taboo Word-Ban Arcade
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Explain the target word in English without using ANY of the 4 forbidden words. Chain together consecutive correct guesses to trigger explosive XP combo multipliers!
          </p>
        </div>

        <div className="pop-card p-6 sm:p-10 bg-[var(--bg-surface)]">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[var(--border-color)] pb-4 mb-8">
            <div>
              <span className="font-mono text-xs font-black text-[var(--text-muted)] uppercase tracking-wider block">
                Live Verbal Game
              </span>
              <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)]">
                Circumlocution Challenge
              </h3>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-black px-3 py-1 bg-rose-100 text-rose-700 border border-rose-300 rounded-full flex items-center gap-1 shadow-xs">
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>COMBO: {combo}x</span>
              </span>
              <span className="pop-badge gold font-mono font-black text-xs flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{score} XP</span>
              </span>
            </div>
          </div>

          {/* Game Arena Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left Physical Game Card */}
            <div className="md:col-span-6 p-6 rounded-3xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)] flex flex-col justify-between space-y-6">
              <div>
                <span className="font-mono text-xs font-black uppercase text-[var(--text-muted)] tracking-wider block mb-1">
                  🎯 Target Word to Explain:
                </span>
                <div className="font-['Outfit'] font-black text-3xl sm:text-4xl text-[var(--color-primary)] tracking-tight">
                  {card.target}
                </div>
              </div>

              {/* Forbidden Words Box */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-rose-400/50 space-y-2.5">
                <span className="font-mono text-xs font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider flex items-center gap-1.5">
                  <Ban className="w-3.5 h-3.5" />
                  Forbidden Words (Do Not Say!):
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {card.forbidden.map((word, idx) => (
                    <div
                      key={idx}
                      className="font-mono text-xs font-extrabold px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1.5"
                    >
                      <span className="text-rose-500 font-bold">✕</span>
                      <span>{word}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Controls & Clock */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-4">
              <div className="p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] space-y-1.5">
                <h4 className="font-extrabold text-sm sm:text-base text-[var(--text-main)]">
                  The Arcade Rule:
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Describe what the word means or does using stories and analogies. If you slip up and say a forbidden word, hit <strong>Pass</strong>. If you solve it, hit <strong>Got It!</strong>
                </p>
              </div>

              {/* Round Clock */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                <div>
                  <span className="font-mono text-[0.68rem] uppercase font-bold text-[var(--text-muted)] block">
                    Round Clock
                  </span>
                  <div className="font-['Space_Grotesk'] font-black text-3xl sm:text-4xl text-[var(--color-primary)]">
                    {timerSeconds}s
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="pop-btn pop-btn-surface pop-btn-sm"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Clock</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Start Round</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePass}
                  className="pop-btn pop-btn-surface pop-btn-md flex-1 justify-center"
                >
                  <X className="w-4 h-4 text-rose-500" />
                  <span>Pass / Buzz</span>
                </button>
                <button
                  type="button"
                  onClick={handleCorrect}
                  className="pop-btn pop-btn-primary pop-btn-md flex-1.5 justify-center btn-shimmer"
                >
                  <Check className="w-4 h-4" />
                  <span>Got It! (+{100 * combo} XP)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
