'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { QUIZ_QUESTIONS, PERSONAS } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';

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
    <section className="py-16 sm:py-20 border-t-[2.5px] border-[var(--border-color)]" id="vibe-quiz">
      <div className="tl-container max-w-3xl">
        <div className="text-center space-y-3 mb-10">
          <span className="pop-badge gold">Diagnostic Mini-Game</span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)]">
            What&apos;s Your English Speaking Vibe?
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">
            Answer 4 quick, brutally honest questions to diagnose your speaking persona and get your custom TalkLab playbook!
          </p>
        </div>

        <div className="pop-card p-6 sm:p-9 bg-[var(--bg-surface)]">
          {!resultPersonaKey ? (
            <div className="space-y-6">
              {/* Progress meta */}
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-black">
                <span className="text-[var(--text-muted)]">
                  Question {step + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-[var(--color-primary)]">60-Sec Check</span>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Question title */}
              <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)] pt-2">
                {currentQ.title}
              </h3>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickOption(opt.vibe)}
                    className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] text-left hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[4px_4px_0px_var(--shadow-color)] transition-all cursor-pointer group"
                  >
                    <span className="text-2xl flex-shrink-0 group-hover:scale-125 transition-transform">
                      {opt.icon}
                    </span>
                    <span className="font-extrabold text-sm text-[var(--text-main)] leading-snug">
                      {opt.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Result Card */
            <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-5xl sm:text-6xl animate-bounce">
                {persona?.avatar}
              </div>

              <div>
                <span className="pop-badge mint text-xs mb-2">
                  {persona?.badge}
                </span>
                <h3 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--text-main)] mt-1">
                  {persona?.name}
                </h3>
              </div>

              <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-lg mx-auto">
                {persona?.desc}
              </p>

              <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] inline-block max-w-md w-full">
                <div className="font-mono text-xs font-black text-[var(--color-primary)] uppercase">
                  ⚡ Recommended Action:
                </div>
                <div className="font-extrabold text-sm sm:text-base text-[var(--text-main)] mt-1">
                  {persona?.recommended}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => openBooking()}
                  className="pop-btn pop-btn-primary pop-btn-lg w-full sm:w-auto justify-center"
                >
                  <span>Book for 30 LYD &amp; Test This Persona 🗓️</span>
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="pop-btn pop-btn-surface pop-btn-md w-full sm:w-auto justify-center"
                >
                  <span>Retake Quiz ↺</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
