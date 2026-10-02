'use client';

import React, { useState } from 'react';
import { SLANG_CARDS } from '@/lib/constants';
import { SlangCard } from '@/lib/types';
import { SoundFX } from '@/lib/soundFx';
import { BookOpen, RotateCw } from 'lucide-react';

export default function SlangLab() {
  const [filter, setFilter] = useState<'all' | 'internet' | 'rhetoric' | 'social'>('all');
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (id: number) => {
    SoundFX.playPop(520);
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCards = filter === 'all'
    ? SLANG_CARDS
    : SLANG_CARDS.filter(c => c.category === filter);

  return (
    <section className="py-16 sm:py-24 bg-[var(--bg-surface-elevated)] border-t-[2.5px] border-[var(--border-color)]" id="slang-lab">
      <div className="tl-container">
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="pop-badge gold inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Modern Conversational Fluency</span>
            </span>
            <span className="ink-stamp text-xs py-0.5">
              ★ STUDY JOURNAL FLASHCARDS
            </span>
          </div>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)] tracking-tight">
            The TalkLab Slang &amp; Idiom Lab
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Forget dry 1990s textbook dialogue. Click these interactive 3D flashcards to master modern cultural slang, debate rhetoric, and high-impact idiomatic phrases used today.
          </p>
          <p className="font-hand text-xl text-[var(--color-primary)] font-bold -rotate-1">
            ✎ Tap any card to test your slang recall &amp; view real-life conversation notes!
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`pop-btn pop-btn-sm ${filter === 'all' ? 'pop-btn-primary' : 'pop-btn-surface'}`}
            >
              All Expressions ({SLANG_CARDS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('internet')}
              className={`pop-btn pop-btn-sm ${filter === 'internet' ? 'pop-btn-primary' : 'pop-btn-surface'}`}
            >
              📱 Internet &amp; Pop Culture
            </button>
            <button
              type="button"
              onClick={() => setFilter('rhetoric')}
              className={`pop-btn pop-btn-sm ${filter === 'rhetoric' ? 'pop-btn-primary' : 'pop-btn-surface'}`}
            >
              🏛️ Debate Rhetoric
            </button>
            <button
              type="button"
              onClick={() => setFilter('social')}
              className={`pop-btn pop-btn-sm ${filter === 'social' ? 'pop-btn-primary' : 'pop-btn-surface'}`}
            >
              ☕ Social IQ &amp; Vibes
            </button>
          </div>
        </div>

        {/* 3D Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCards.map((card: SlangCard) => {
            const isFlipped = !!flippedCards[card.id];

            return (
              <div
                key={card.id}
                onClick={() => toggleFlip(card.id)}
                className={`slang-card-3d-wrap ${isFlipped ? 'flipped' : ''}`}
                title="Click to flip card"
              >
                <div className="slang-card-inner">
                  {/* Front Side */}
                  <div className="slang-card-front flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.65rem] font-black uppercase px-2.5 py-0.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)]">
                        {card.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-[var(--color-primary)] flex items-center gap-1">
                        <RotateCw className="w-3 h-3" />
                        <span>Flip</span>
                      </span>
                    </div>

                    <div className="my-auto text-center space-y-1.5 py-3">
                      <h3 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--text-main)] tracking-tight">
                        {card.term}
                      </h3>
                      <div className="font-mono text-xs text-[var(--text-muted)] italic">
                        {card.pronunciation}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex items-center justify-between text-[0.7rem] font-mono text-[var(--text-muted)]">
                      <span className="truncate max-w-[140px]">{card.type}</span>
                      <span className="text-[var(--color-primary)] font-bold flex-shrink-0">Tap to reveal</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="slang-card-back flex flex-col justify-between h-full">
                    <div className="space-y-2.5">
                      <div className="font-bold text-xs sm:text-[0.85rem] text-[var(--text-main)] leading-relaxed">
                        {card.meaning}
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <span className="font-mono text-[0.62rem] font-black text-[var(--color-primary)] uppercase tracking-wider block mb-1">
                          ⚡ IN CONVERSATION:
                        </span>
                        <div className="font-hand text-base sm:text-lg text-[var(--color-primary)] font-bold leading-snug">
                          “{card.example}”
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 mt-auto flex items-center justify-between gap-2 text-[0.7rem] font-mono">
                      <span className="text-[var(--text-muted)] truncate max-w-[160px] sm:max-w-[180px]" title={card.origin}>
                        {card.origin}
                      </span>
                      <span className="font-bold text-[var(--color-primary)] flex items-center gap-1 flex-shrink-0 hover:underline cursor-pointer">
                        <RotateCw className="w-3 h-3" />
                        <span>Flip Back</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
