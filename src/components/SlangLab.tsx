'use client';

import React, { useState } from 'react';
import { SLANG_CARDS } from '@/lib/constants';
import { SlangCard } from '@/lib/types';
import { SoundFX } from '@/lib/soundFx';

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
    <section className="py-16 sm:py-20 bg-[var(--bg-surface-elevated)] border-t-[2.5px] border-[var(--border-color)]" id="slang-lab">
      <div className="tl-container">
        <div className="text-center space-y-3 mb-10">
          <span className="pop-badge gold">Modern Expressions</span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)]">
            The TalkLab Slang &amp; Idiom Lab
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">
            Tired of outdated 1990s textbook English? Flip these interactive 3D cards to master modern slang, debate idioms, and phrases you will actually use.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                  <div className="slang-card-front">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.65rem] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)]">
                        {card.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                        Flip ↻
                      </span>
                    </div>

                    <div className="my-auto text-center space-y-1">
                      <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)] tracking-tight">
                        {card.term}
                      </h3>
                      <div className="font-mono text-xs text-[var(--text-muted)] italic">
                        {card.pronunciation}
                      </div>
                    </div>

                    <div className="border-t border-[var(--border-color)] pt-2 text-[0.72rem] font-mono text-[var(--text-muted)] text-center">
                      {card.type}
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="slang-card-back">
                    <div className="space-y-2">
                      <div className="font-bold text-xs text-[var(--text-main)] leading-relaxed">
                        {card.meaning}
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--color-primary)] font-medium italic">
                        {card.example}
                      </div>
                    </div>

                    <div className="border-t border-[var(--border-color)] pt-2 flex items-center justify-between text-[0.68rem] font-mono text-[var(--text-muted)]">
                      <span>{card.origin}</span>
                      <span className="font-bold text-[var(--color-primary)]">Flip ↺</span>
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
