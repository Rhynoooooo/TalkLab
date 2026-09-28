'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Volume2, VolumeX, Sparkles, User, Shield } from 'lucide-react';

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Card */}
      <div className="fixed inset-y-0 right-0 w-[85%] max-w-[340px] bg-[var(--bg-canvas)] border-l-[3px] border-[var(--border-color)] p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="font-['Outfit'] font-black text-lg">Menu &amp; Controls</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border-2 border-[var(--border-color)] font-mono font-bold flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* User & Admin Portals Shortcuts */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                openUserDashboard();
              }}
              className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] text-left space-y-1 hover:scale-102 transition-transform"
            >
              <div className="flex items-center justify-between">
                <User className="w-4 h-4 text-[var(--color-primary)]" />
                {userBookings.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[0.6rem] font-bold flex items-center justify-center">
                    {userBookings.length}
                  </span>
                )}
              </div>
              <strong className="block text-xs font-['Outfit'] font-extrabold text-[var(--text-main)]">My Passes</strong>
              <span className="text-[0.62rem] text-[var(--text-muted)] block">Wallet &amp; Stats</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                openAdminModal();
              }}
              className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] text-left space-y-1 hover:scale-102 transition-transform"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <strong className="block text-xs font-['Outfit'] font-extrabold text-[var(--text-main)]">Admin Hub</strong>
              <span className="text-[0.62rem] text-[var(--text-muted)] block">Moderator PIN</span>
            </button>
          </div>

          {/* Theme Palette Cards */}
          <div>
            <div className="text-xs font-mono font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">
              🎨 Choose Atmosphere
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setTheme('pop')}
                className={`flex items-center justify-between p-2.5 rounded-xl border-2 border-[var(--border-color)] text-left transition-all ${
                  theme === 'pop'
                    ? 'bg-[#2F42F0] text-white shadow-[3px_3px_0px_var(--shadow-color)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-main)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⚡</span>
                  <div>
                    <div className="font-extrabold text-sm">Pop Vibrance</div>
                    <div className="text-[0.7rem] opacity-80">Electric Blue &amp; Gold</div>
                  </div>
                </div>
                {theme === 'pop' && <span className="font-bold">✓</span>}
              </button>

              <button
                type="button"
                onClick={() => setTheme('cyber')}
                className={`flex items-center justify-between p-2.5 rounded-xl border-2 border-[var(--border-color)] text-left transition-all ${
                  theme === 'cyber'
                    ? 'bg-[#5965F3] text-white shadow-[3px_3px_0px_var(--shadow-color)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-main)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🌌</span>
                  <div>
                    <div className="font-extrabold text-sm">Cyber Night</div>
                    <div className="text-[0.7rem] opacity-80">Neon Synthwave Dark</div>
                  </div>
                </div>
                {theme === 'cyber' && <span className="font-bold">✓</span>}
              </button>

              <button
                type="button"
                onClick={() => setTheme('ember')}
                className={`flex items-center justify-between p-2.5 rounded-xl border-2 border-[var(--border-color)] text-left transition-all ${
                  theme === 'ember'
                    ? 'bg-[#A8342D] text-white shadow-[3px_3px_0px_var(--shadow-color)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-main)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🔥</span>
                  <div>
                    <div className="font-extrabold text-sm">Ember Warmth</div>
                    <div className="text-[0.7rem] opacity-80">Sunset Crimson &amp; Café</div>
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
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] text-xs font-mono font-bold"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>Sound Effects: {soundMuted ? 'OFF' : 'ON'}</span>
          </button>

          {/* Nav Links */}
          <div className="flex flex-col space-y-2 pt-2 border-t-2 border-[var(--border-color)]">
            <a
              href="#vibe-quiz"
              onClick={onClose}
              className="flex items-center gap-2 p-2 rounded-lg font-bold text-sm hover:bg-[var(--color-primary-light)]"
            >
              <span>🎯</span>
              <span>60-Second Vibe Quiz</span>
            </a>
            <a
              href="#slot-machine"
              onClick={onClose}
              className="flex items-center gap-2 p-2 rounded-lg font-bold text-sm hover:bg-[var(--color-primary-light)]"
            >
              <span>🎰</span>
              <span>Conversation Slot Machine</span>
            </a>
            <a
              href="#arcade"
              onClick={onClose}
              className="flex items-center gap-2 p-2 rounded-lg font-bold text-sm hover:bg-[var(--color-primary-light)]"
            >
              <span>🎮</span>
              <span>Taboo Word-Ban Arcade</span>
            </a>
            <a
              href="#booking"
              onClick={onClose}
              className="flex items-center gap-2 p-2 rounded-lg font-bold text-sm hover:bg-[var(--color-primary-light)]"
            >
              <span>🗓️</span>
              <span>Book a Seat (30 LYD)</span>
            </a>
            <a
              href="#venue"
              onClick={onClose}
              className="flex items-center gap-2 p-2 rounded-lg font-bold text-sm hover:bg-[var(--color-primary-light)]"
            >
              <span>📍</span>
              <span>The Space in Tripoli</span>
            </a>
            <a
              href="#dashboard"
              onClick={onClose}
              className="flex items-center gap-2 p-2 rounded-lg font-bold text-sm hover:bg-[var(--color-primary-light)]"
            >
              <span>📊</span>
              <span>Community Debate Poll</span>
            </a>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 border-t-2 border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => {
              onClose();
              openBooking();
            }}
            className="w-full pop-btn pop-btn-primary pop-btn-md justify-center text-center"
          >
            <span>Book Next Session (30 LYD) 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
}
