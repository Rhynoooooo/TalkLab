'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { SoundFX } from '@/lib/soundFx';
import { Volume2, VolumeX, Menu, X, User, Shield, Sparkles } from 'lucide-react';

export default function Navbar({
  onToggleMobileDrawer,
  isMobileDrawerOpen
}: {
  onToggleMobileDrawer: () => void;
  isMobileDrawerOpen: boolean;
}) {
  const {
    theme,
    setTheme,
    cycleTheme,
    themeConfig,
    soundMuted,
    toggleSound,
    openBooking,
    openUserDashboard,
    openAdminModal,
    openEasterModal,
    userBookings
  } = useApp();

  const logoClicksRef = useRef<number>(0);
  const logoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    logoClicksRef.current += 1;
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);

    SoundFX.playPop(450 + logoClicksRef.current * 70);

    if (logoClicksRef.current >= 5) {
      logoClicksRef.current = 0;
      openEasterModal(
        '🕵️ TALKLAB FOUNDER\'S SECRET NOTEBOOK',
        <div className="text-left space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📓</span>
            <div>
              <h4 className="text-xl font-black">The Real Story of TalkLab</h4>
              <span className="font-mono text-xs font-bold text-[var(--color-primary)]">
                CONFIDENTIAL • FOUNDER VAULT
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            TalkLab wasn&apos;t born in an academic boardroom. It was created in Tripoli by students who were exhausted by boring grammar worksheets that never taught anyone how to actually converse.
          </p>
          <div className="bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] rounded-xl p-3 text-xs font-mono">
            <strong>Rule #1 of TalkLab:</strong> Perfection is the enemy of fluency. Make 10 mistakes loud and proud, laugh it off, and keep talking!
          </div>
        </div>
      );
    } else {
      logoTimerRef.current = setTimeout(() => {
        logoClicksRef.current = 0;
      }, 2200);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-canvas)]/85 backdrop-blur-xl border-b-2 border-[var(--border-color)] transition-colors duration-200">
      <div className="tl-container flex items-center justify-between h-[74px]">
        {/* Brand Anchor */}
        <a
          href="#"
          onClick={handleLogoClick}
          className="flex items-center gap-3 group select-none cursor-pointer"
          title="TalkLab Tripoli — English Conversation Club (Click 5 times for a secret!)"
        >
          <div
            className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border-2 p-1 flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)] transition-all duration-300 group-hover:scale-105 group-hover:-rotate-3"
            style={{
              backgroundColor: themeConfig.bg,
              borderColor: themeConfig.boxBorder
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={themeConfig.logo}
                alt="TalkLab Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-['Outfit'] font-black text-xl sm:text-2xl tracking-tight text-[var(--text-main)]">
                TalkLab
              </span>
              <span className="font-mono text-[0.62rem] font-black px-1.5 py-0.5 bg-[var(--color-accent-gold)] text-slate-900 border border-[var(--border-color)] rounded-full">
                🇱🇾 TRIPOLI
              </span>
            </div>
            <span className="font-mono text-[0.65rem] sm:text-[0.7rem] font-bold text-[var(--color-primary)] uppercase tracking-wider">
              English Conversation Club
            </span>
          </div>
        </a>

        {/* Desktop Nav Items */}
        <nav className="hidden xl:flex items-center gap-1 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-1 rounded-full shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
          <a
            href="#vibe-quiz"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>🎯</span>
            <span>Vibe Quiz</span>
          </a>
          <a
            href="#slot-machine"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>🎰</span>
            <span>Slot Machine</span>
          </a>
          <a
            href="#arcade"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>🎮</span>
            <span>Taboo</span>
          </a>
          <a
            href="#booking"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>🪑</span>
            <span>Boardroom</span>
          </a>
          <a
            href="#hot-seat"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>🔥</span>
            <span>Hot Seat</span>
          </a>
          <a
            href="#venue"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>📍</span>
            <span>The Space</span>
          </a>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Passes Button */}
          <button
            type="button"
            onClick={openUserDashboard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_var(--shadow-color)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="My Tickets & Bookings"
          >
            <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span className="hidden sm:inline">Passes</span>
            {userBookings.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[0.6rem] font-black flex items-center justify-center">
                {userBookings.length}
              </span>
            )}
          </button>

          {/* Facilitator Hub PIN protected */}
          <button
            type="button"
            onClick={openAdminModal}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-mono font-bold bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_var(--shadow-color)] hover:scale-105 active:scale-95 transition-all text-amber-600 dark:text-amber-400 cursor-pointer"
            title="Facilitator & Moderator Hub (PIN: 2026)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Admin</span>
          </button>

          {/* Theme Switcher (Desktop) */}
          <div className="hidden lg:flex items-center bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-1 rounded-xl shadow-[2px_2px_0px_var(--shadow-color)]">
            <button
              type="button"
              onClick={() => setTheme('pop')}
              className={`px-2 py-0.8 text-[0.7rem] font-mono font-black rounded-lg transition-all cursor-pointer ${
                theme === 'pop'
                  ? 'bg-[#3B50FF] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              ⚡ Pop
            </button>
            <button
              type="button"
              onClick={() => setTheme('cyber')}
              className={`px-2 py-0.8 text-[0.7rem] font-mono font-black rounded-lg transition-all cursor-pointer ${
                theme === 'cyber'
                  ? 'bg-[#6366F1] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              🌌 Cyber
            </button>
            <button
              type="button"
              onClick={() => setTheme('ember')}
              className={`px-2 py-0.8 text-[0.7rem] font-mono font-black rounded-lg transition-all cursor-pointer ${
                theme === 'ember'
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              🔥 Ember
            </button>
          </div>

          {/* Theme Quick Cycle (Mobile) */}
          <button
            type="button"
            onClick={cycleTheme}
            className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer"
            title="Cycle Palette"
          >
            <span>{themeConfig.icon}</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] transition-all cursor-pointer ${
              soundMuted
                ? 'bg-slate-200 dark:bg-slate-800 text-[var(--text-muted)]'
                : 'bg-emerald-100 text-emerald-800 border-[var(--border-color)]'
            }`}
            title="Toggle Sound Synthesizer"
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">{soundMuted ? 'Muted' : 'Sound'}</span>
          </button>

          {/* Book 30 LYD CTA */}
          <button
            type="button"
            onClick={() => openBooking()}
            className="pop-btn pop-btn-primary pop-btn-sm btn-shimmer"
          >
            <span>Book Seat</span>
            <span className="text-[0.65rem] bg-white/25 px-1.5 py-0.5 rounded-full font-mono">
              30 LYD
            </span>
          </button>

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={onToggleMobileDrawer}
            className="xl:hidden p-2 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
