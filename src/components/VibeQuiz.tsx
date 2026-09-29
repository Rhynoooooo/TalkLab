'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { QUIZ_QUESTIONS, PERSONAS } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';
import { Sparkles, RotateCcw, CheckCircle, ArrowRight } from 'lucide-react';

export default function VibeQuiz() {
  const { openBooking, fireConfetti } = useApp();
  const [step, setStep] = useState<number>(0);
  const [scores, setScores] = useState<Record<string, number>>({
    yapper: 0,
    overthinker: 0,
    debater: 0,
    observer: 0
  });
  const [resultPersonaKey, setResultPersonaKey] = useState<string | null>(null);

  const handlePickOption = (vibe: string) => {
    SoundFX.playPop(500 + step * 80);
    const updated = { ...scores, [vibe]: (scores[vibe] || 0) + 1 };
    setScores(updated);

    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(prev => prev + 1);
    } else {
      // Determine winner
      let highest = 0;
      let winner = 'yapper';
      for (const [key, count] of Object.entries(updated)) {
        if (count > highest) {
          highest = count;
          winner = key;
        }
      }
      setResultPersonaKey(winner);
      SoundFX.playFanfare();
      fireConfetti();
    }
  };

  const handleRestart = () => {
    setStep(0);
    setScores({ yapper: 0, overthinker: 0, debater: 0, observer: 0 });
    setResultPersonaKey(null);
    SoundFX.playPop(480);
  };

  const currentQ = QUIZ_QUESTIONS[step];
  const persona = resultPersonaKey ? PERSONAS[resultPersonaKey] : null;

  return (
    <section className="py-16 sm:py-24 border-t-[2.5px] border-[var(--border-color)] bg-[var(--bg-canvas)]" id="vibe-quiz">
      <div className="tl-container max-w-3xl">
        <div className="text-center space-y-4 mb-12">
          <span className="pop-badge gold inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Diagnostic Mini-Game</span>
          </span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)] tracking-tight">
            What&apos;s Your English Speaking Persona?
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Answer 4 quick, brutally honest dilemmas to discover your exact speaking vibe and receive your tailored TalkLab immersion strategy!
          </p>
        </div>

        <div className="pop-card p-6 sm:p-10 bg-[var(--bg-surface)]">
          {!resultPersonaKey ? (
            <div className="space-y-6">
              {/* Progress Meta */}
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-black">
                <span className="text-[var(--text-muted)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                  Dilemma {step + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2.5 py-0.5 rounded-full">
                  60-Second Check
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-mint)] rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Question Title */}
              <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)] pt-2 leading-snug">
                {currentQ.title}
              </h3>

              {/* 4 Interactive Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePickOption(opt.vibe)}
                      className="group flex items-start gap-3.5 p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] text-left hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[4px_4px_0px_var(--shadow-color)] transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] font-mono font-black text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                        {letters[idx]}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="text-xl group-hover:scale-120 transition-transform inline-block">
                          {opt.icon}
                        </div>
                        <p className="font-extrabold text-sm text-[var(--text-main)] leading-snug">
                          {opt.text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Result Card */
            <div className="text-center space-y-6">
              <div className="text-6xl sm:text-7xl animate-bounce">
                {persona?.avatar}
              </div>

              <div className="space-y-2">
                <span className="pop-badge mint text-xs">
                  {persona?.badge}
                </span>
                <h3 className="font-['Outfit'] font-black text-2xl sm:text-4xl text-[var(--text-main)]">
                  {persona?.name}
                </h3>
              </div>

              <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-lg mx-auto">
                {persona?.desc}
              </p>

              {/* Recommended Action Box */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] text-left space-y-2 max-w-md mx-auto">
                <div className="font-mono text-xs font-black text-[var(--color-primary)] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Your TalkLab Immersion Track:
                </div>
                <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] leading-relaxed">
                  {persona?.tag}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => openBooking(null, persona?.recommended?.includes('Saturday') ? 'saturday' : 'tuesday')}
                  className="pop-btn pop-btn-primary pop-btn-md w-full sm:w-auto px-6 btn-shimmer"
                >
                  <span>Book {persona?.recommended?.includes('Saturday') ? 'Saturday Immersion (30 LYD)' : 'Tuesday Twilight (30 LYD)'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="pop-btn pop-btn-surface pop-btn-md w-full sm:w-auto px-5"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  <span>Retake Quiz</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
