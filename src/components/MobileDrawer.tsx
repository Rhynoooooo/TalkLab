'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Volume2, VolumeX, Sparkles, User, Shield, X, ArrowRight } from 'lucide-react';

export default function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    theme,
    setTheme,
    soundMuted,
    toggleSound,
    openBooking,
    openUserDashboard,
    openAdminModal,
    userBookings
  } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-[85%] max-w-[340px] bg-[var(--bg-surface)] border-l-2 border-[var(--border-color)] p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="font-['Outfit'] font-black text-lg text-[var(--text-main)]">Menu &amp; Controls</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--bg-canvas)] border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User & Admin Portals */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                openUserDashboard();
              }}
              className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-slate-300 dark:border-slate-700 text-left space-y-1 hover:border-[var(--color-primary)] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <User className="w-4 h-4 text-[var(--color-primary)]" />
                {userBookings.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[0.6rem] font-black flex items-center justify-center">
                    {userBookings.length}
                  </span>
                )}
              </div>
              <strong className="block text-xs font-['Outfit'] font-black text-[var(--text-main)]">My Passes</strong>
              <span className="text-[0.62rem] text-[var(--text-muted)] block">Wallet &amp; Stats</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                openAdminModal();
              }}
              className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-slate-300 dark:border-slate-700 text-left space-y-1 hover:border-amber-500 transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <strong className="block text-xs font-['Outfit'] font-black text-[var(--text-main)]">Admin Hub</strong>
              <span className="text-[0.62rem] text-[var(--text-muted)] block">Facilitator PIN</span>
            </button>
          </div>

          {/* Atmosphere Palette */}
          <div>
            <div className="text-xs font-mono font-black text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
              🎨 Choose Atmosphere
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setTheme('pop')}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  theme === 'pop'
                    ? 'bg-[#3B50FF] text-white border-[#3B50FF] shadow-sm'
                    : 'bg-[var(--bg-canvas)] text-[var(--text-main)] border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⚡</span>
                  <div>
                    <div className="font-extrabold text-sm">Pop Vibrance</div>
                    <div className="text-[0.68rem] opacity-80">Electric Blue &amp; Gold</div>
                  </div>
                </div>
                {theme === 'pop' && <span className="font-bold">✓</span>}
              </button>

              <button
                type="button"
                onClick={() => setTheme('cyber')}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  theme === 'cyber'
                    ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-sm'
                    : 'bg-[var(--bg-canvas)] text-[var(--text-main)] border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🌌</span>
                  <div>
                    <div className="font-extrabold text-sm">Cyber Night</div>
                    <div className="text-[0.68rem] opacity-80">Neon Synthwave Dark</div>
                  </div>
                </div>
                {theme === 'cyber' && <span className="font-bold">✓</span>}
              </button>

              <button
                type="button"
                onClick={() => setTheme('ember')}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  theme === 'ember'
                    ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-sm'
                    : 'bg-[var(--bg-canvas)] text-[var(--text-main)] border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🔥</span>
                  <div>
                    <div className="font-extrabold text-sm">Ember Warmth</div>
                    <div className="text-[0.68rem] opacity-80">Sunset Crimson &amp; Café</div>
                  </div>
                </div>
                {theme === 'ember' && <span className="font-bold">✓</span>}
              </button>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-[var(--bg-canvas)] border-2 border-slate-300 dark:border-slate-700 text-xs font-mono font-bold cursor-pointer text-[var(--text-main)]"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            <span>Sound Synthesizer: {soundMuted ? 'Muted' : 'Sound ON'}</span>
          </button>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-1 pt-2 border-t-2 border-slate-200 dark:border-slate-800">
            <a
              href="#vibe-quiz"
              onClick={onClose}
              className="flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-sm text-[var(--text-main)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
            >
              <span>🎯</span>
              <span>60-Second Vibe Quiz</span>
            </a>
            <a
              href="#slot-machine"
              onClick={onClose}
              className="flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-sm text-[var(--text-main)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
            >
              <span>🎰</span>
              <span>Conversation Slot Machine</span>
            </a>
            <a
              href="#arcade"
              onClick={onClose}
              className="flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-sm text-[var(--text-main)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
            >
              <span>🎮</span>
              <span>Taboo Word-Ban Arcade</span>
            </a>
            <a
              href="#booking"
              onClick={onClose}
              className="flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-sm text-[var(--text-main)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
            >
              <span>🪑</span>
              <span>Boardroom Seating Map</span>
            </a>
            <a
              href="#venue"
              onClick={onClose}
              className="flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-sm text-[var(--text-main)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
            >
              <span>📍</span>
              <span>The Space in Tripoli</span>
            </a>
            <a
              href="#dashboard"
              onClick={onClose}
              className="flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-sm text-[var(--text-main)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
            >
              <span>📊</span>
              <span>Community Debate Poll</span>
            </a>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              openBooking();
            }}
            className="w-full pop-btn pop-btn-primary pop-btn-md justify-center text-center btn-shimmer"
          >
            <span>Book Next Session (30 LYD)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
