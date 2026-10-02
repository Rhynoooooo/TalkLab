'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DEBATE_TOPICS } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';
import { Flame, Shuffle, MessageCircle } from 'lucide-react';

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
    <section className="py-16 sm:py-24 border-t-[2.5px] border-[var(--border-color)] bg-[var(--bg-canvas)]" id="hot-seat">
      <div className="tl-container max-w-3xl">
        <div className="text-center space-y-4 mb-12">
          <span className="pop-badge coral inline-flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>Oxford Fishbowl Debate Arena</span>
          </span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)] tracking-tight">
            The Fishbowl Argument Generator
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Step into the virtual hot seat. Toggle between PRO and CON stances to test ready-to-fire debate arguments before your weekly immersion session!
          </p>
        </div>

        <div className="pop-card p-6 sm:p-10 bg-[var(--bg-surface)] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2.5 border-b border-slate-200 dark:border-slate-800 pb-5">
            <span className="pop-badge blue text-xs font-mono">{topic.category}</span>
            <h3 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--text-main)] leading-snug">
              “{topic.topic}”
            </h3>
          </div>

          {/* Stance Toggle */}
          <div className="grid grid-cols-2 gap-3.5 max-w-md mx-auto pt-1">
            <button
              type="button"
              onClick={() => handleStanceChange('pro')}
              className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                stance === 'pro'
                  ? 'bg-emerald-600 text-white border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] scale-102'
                  : 'bg-[var(--bg-surface-elevated)] text-[var(--text-main)] border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="font-['Outfit'] font-black text-base sm:text-lg flex items-center justify-center gap-1.5">
                <span>🟢 TAKE PRO</span>
              </div>
              <div className="text-[0.72rem] font-bold opacity-90 mt-0.5">Affirmative Defense</div>
            </button>

            <button
              type="button"
              onClick={() => handleStanceChange('con')}
              className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                stance === 'con'
                  ? 'bg-rose-600 text-white border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] scale-102'
                  : 'bg-[var(--bg-surface-elevated)] text-[var(--text-main)] border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="font-['Outfit'] font-black text-base sm:text-lg flex items-center justify-center gap-1.5">
                <span>🔴 TAKE CON</span>
              </div>
              <div className="text-[0.72rem] font-bold opacity-90 mt-0.5">Negative Counter</div>
            </button>
          </div>

          {/* Argument Bullets */}
          <div className="space-y-3 pt-2">
            {bullets.map((arg, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:-translate-y-0.5 transition-transform"
              >
                <span className="w-7 h-7 rounded-xl bg-[var(--color-primary)] text-white font-mono text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] leading-relaxed">
                  {arg}
                </p>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 border-t-2 border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleNextTopic}
              className="pop-btn pop-btn-surface pop-btn-md w-full sm:w-auto justify-center"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle Debate Dilemma</span>
            </button>
            <button
              type="button"
              onClick={() => openBooking()}
              className="pop-btn pop-btn-primary pop-btn-md w-full sm:w-auto justify-center btn-shimmer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Debate in Person (30 LYD)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
