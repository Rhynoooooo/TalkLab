'use client';

import React, { useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { SoundFX } from '@/lib/soundFx';
import { X } from 'lucide-react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

export default function EasterEggsModal() {
  const { easterModal, closeEasterModal, openEasterModal, cycleTheme, fireConfetti } = useApp();
  const konamiIdxRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in form inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // 't' key shortcut to cycle theme
      if (e.key === 't' || e.key === 'T') {
        cycleTheme();
        return;
      }

      // Konami Code sequence
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = KONAMI_CODE[konamiIdxRef.current].length === 1
        ? KONAMI_CODE[konamiIdxRef.current].toLowerCase()
        : KONAMI_CODE[konamiIdxRef.current];

      if (key === expected) {
        konamiIdxRef.current += 1;
        if (konamiIdxRef.current === KONAMI_CODE.length) {
          konamiIdxRef.current = 0;
          triggerKonamiCelebration();
        }
      } else {
        konamiIdxRef.current = 0;
      }
    };

    const triggerKonamiCelebration = () => {
      document.documentElement.classList.add('party-mode-active');
      setTimeout(() => {
        document.documentElement.classList.remove('party-mode-active');
      }, 12000);

      openEasterModal(
        '🎮 RETRO CHEAT CODE ACTIVATED!',
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce">🕹️</div>
          <span className="pop-badge gold text-xs">Secret Developer Vault</span>
          <h4 className="font-['Outfit'] font-black text-xl text-[var(--text-main)]">
            You Found the Konami Easter Egg!
          </h4>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            You unlocked the hidden retro gamer badge! Take a screenshot and flash it to the TalkLab facilitators at <strong>People & Spaces</strong> for an exclusive welcome sticker pack.
          </p>
          <div className="p-3 bg-[var(--bg-surface-elevated)] border-2 border-dashed border-[var(--color-primary)] rounded-xl font-mono text-sm font-black text-[var(--color-primary)]">
            SECRET PASS: TALKCHAMP-25
          </div>
        </div>
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cycleTheme, openEasterModal, fireConfetti]);

  if (!easterModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeEasterModal}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-[var(--bg-canvas)] border-[3px] border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={closeEasterModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[var(--bg-surface)] border-2 border-[var(--border-color)] flex items-center justify-center font-bold hover:scale-105 active:scale-95"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-['Outfit'] font-black text-lg sm:text-xl text-[var(--text-main)] pr-6 border-b-2 border-[var(--border-color)] pb-3">
          {easterModal.title}
        </h3>

        <div>{easterModal.content}</div>

        <button
          type="button"
          onClick={closeEasterModal}
          className="w-full pop-btn pop-btn-surface pop-btn-md justify-center mt-2"
        >
          <span>Awesome, Got It!</span>
        </button>
      </div>
    </div>
  );
}
