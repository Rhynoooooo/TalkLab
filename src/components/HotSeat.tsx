'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DEBATE_TOPICS } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';

export default function HotSeat() {
  const { openBooking } = useApp();
  const [topicIndex, setTopicIndex] = useState<number>(0);
  const [stance, setStance] = useState<'pro' | 'con'>('pro');

  const topic = DEBATE_TOPICS[topicIndex];
  const bullets = stance === 'pro' ? topic.proArguments : topic.conArguments;

  const handleNextTopic = () => {
    SoundFX.playPop(520);
    setTopicIndex(prev => (prev + 1) % DEBATE_TOPICS.length);
  };

  const handleStanceChange = (newStance: 'pro' | 'con') => {
    SoundFX.playPop(newStance === 'pro' ? 660 : 440);
    setStance(newStance);
  };

  return (
    <section className="py-16 sm:py-20 border-t-[2.5px] border-[var(--border-color)]" id="hot-seat">
      <div className="tl-container max-w-3xl">
        <div className="text-center space-y-3 mb-10">
          <span className="pop-badge coral">Hot Seat Simulator</span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)]">
            The Fishbowl Argument Generator
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">
            Step into the virtual hot seat. Choose whether you&apos;re PRO or CON, and get punchy debate opening lines to test out loud right now!
          </p>
        </div>

        <div className="pop-card p-6 sm:p-9 bg-[var(--bg-surface)] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="pop-badge blue text-xs">{topic.category}</span>
            <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl lg:text-3xl text-[var(--text-main)] leading-snug">
              “{topic.topic}”
            </h3>
          </div>

          {/* Stance Toggle */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
            <button
              type="button"
              onClick={() => handleStanceChange('pro')}
              className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                stance === 'pro'
                  ? 'bg-emerald-500 text-white border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)]'
                  : 'bg-[var(--bg-surface-elevated)] text-[var(--text-main)] border-[var(--border-color)] opacity-70'
              }`}
            >
              <div className="font-['Outfit'] font-black text-sm sm:text-base">🟢 TAKE PRO</div>
              <div className="text-[0.7rem] font-bold opacity-80">Affirmative Stance</div>
            </button>

            <button
              type="button"
              onClick={() => handleStanceChange('con')}
              className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                stance === 'con'
                  ? 'bg-rose-500 text-white border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)]'
                  : 'bg-[var(--bg-surface-elevated)] text-[var(--text-main)] border-[var(--border-color)] opacity-70'
              }`}
            >
              <div className="font-['Outfit'] font-black text-sm sm:text-base">🔴 TAKE CON</div>
              <div className="text-[0.7rem] font-bold opacity-80">Negative Stance</div>
            </button>
          </div>

          {/* Argument Bullets Box */}
          <div className="space-y-3 pt-2">
            {bullets.map((arg, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)]"
              >
                <span className="w-6 h-6 rounded-lg bg-[var(--color-primary)] text-white font-mono text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] leading-relaxed">
                  {arg}
                </p>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t-2 border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleNextTopic}
              className="pop-btn pop-btn-surface pop-btn-md w-full sm:w-auto justify-center"
            >
              <span>Roll Next Debate Dilemma 🎲</span>
            </button>
            <button
              type="button"
              onClick={() => openBooking()}
              className="pop-btn pop-btn-primary pop-btn-md w-full sm:w-auto justify-center"
            >
              <span>Debate This in Person (30 LYD)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
