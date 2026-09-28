'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { SoundFX } from '@/lib/soundFx';
import { Volume2, VolumeX, Menu, X, User, Shield } from 'lucide-react';

export default function Navbar({ onToggleMobileDrawer, isMobileDrawerOpen }: { onToggleMobileDrawer: () => void; isMobileDrawerOpen: boolean }) {
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
              <span className="font-mono text-xs font-bold text-[var(--color-primary)]">CONFIDENTIAL • FOUNDER VAULT</span>
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
    <header className="sticky top-0 z-40 bg-[var(--bg-canvas)]/90 backdrop-blur-md border-b-[2.5px] border-[var(--border-color)] transition-colors duration-200">
      <div className="tl-container flex items-center justify-between h-[72px] sm:h-[80px]">
        {/* Brand Anchor */}
        <a
          href="#"
          onClick={handleLogoClick}
          className="flex items-center gap-3 group select-none cursor-pointer"
          title="TalkLab Tripoli — English Conversation Club (Click 5 times for a secret!)"
        >
          <div
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl border-[2.5px] p-1 flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)] transition-all duration-200 group-hover:scale-105 group-hover:-translate-y-0.5"
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
                sizes="52px"
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
              <span className="font-mono text-[0.62rem] sm:text-[0.68rem] font-black px-1.5 py-0.5 bg-[var(--color-accent-gold)] text-[#13172E] border-[1.5px] border-[var(--border-color)] rounded-full">
                🇱🇾 TRIPOLI
              </span>
            </div>
            <span className="font-mono text-[0.65rem] sm:text-[0.72rem] font-bold text-[var(--color-primary)] uppercase tracking-wider">
              English Conversation Club
            </span>
          </div>
        </a>

        {/* Desktop Nav Items */}
        <nav className="hidden xl:flex items-center gap-1 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-1.5 rounded-full shadow-[3px_3px_0px_var(--shadow-color)]">
          <a
            href="#vibe-quiz"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>🎯</span>
            <span>Vibe Quiz</span>
          </a>
          <a
            href="#slot-machine"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>🎰</span>
            <span>Slot Machine</span>
          </a>
          <a
            href="#arcade"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>🎮</span>
            <span>Taboo Arcade</span>
          </a>
          <a
            href="#hot-seat"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>🔥</span>
            <span>Hot Seat</span>
          </a>
          <a
            href="#venue"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-full hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span>📍</span>
            <span>The Space</span>
          </a>
        </nav>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Controls: My Passes / Profile Button */}
          <button
            type="button"
            onClick={openUserDashboard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-xl shadow-[2.5px_2.5px_0px_var(--shadow-color)] hover:scale-105 active:scale-95 transition-all"
            title="My Tickets & Fluency Profile"
          >
            <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span className="hidden sm:inline">My Passes</span>
            {userBookings.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[0.62rem] font-black flex items-center justify-center">
                {userBookings.length}
              </span>
            )}
          </button>

          {/* Admin Controls: Facilitator Modal Button */}
          <button
            type="button"
            onClick={openAdminModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-xl shadow-[2.5px_2.5px_0px_var(--shadow-color)] hover:scale-105 active:scale-95 transition-all text-amber-600 dark:text-amber-400"
            title="Facilitator & Moderator Hub (PIN Protected)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Segmented Theme Switcher (Desktop) */}
          <div className="hidden lg:flex items-center bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-1 rounded-xl shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
            <button
              type="button"
              onClick={() => setTheme('pop')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                theme === 'pop'
                  ? 'bg-[#2F42F0] text-white shadow-[1px_1px_0px_var(--shadow-color)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              ⚡ Pop
            </button>
            <button
              type="button"
              onClick={() => setTheme('cyber')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                theme === 'cyber'
                  ? 'bg-[#5965F3] text-white shadow-[1px_1px_0px_var(--shadow-color)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              🌌 Cyber
            </button>
            <button
              type="button"
              onClick={() => setTheme('ember')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                theme === 'ember'
                  ? 'bg-[#A8342D] text-white shadow-[1px_1px_0px_var(--shadow-color)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              🔥 Ember
            </button>
          </div>

          {/* Quick Theme Cycle Button (Mobile) */}
          <button
            type="button"
            onClick={cycleTheme}
            className="lg:hidden flex items-center gap-1 px-2 py-1.5 text-xs font-mono font-bold bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_var(--shadow-color)]"
            title="Cycle Theme (Pop • Cyber • Ember)"
          >
            <span>{themeConfig.icon}</span>
            <span className="text-[var(--text-muted)]">↻</span>
          </button>

          {/* Unified Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] transition-all ${
              soundMuted
                ? 'bg-neutral-200 dark:bg-neutral-800 text-[var(--text-muted)]'
                : 'bg-[var(--color-accent-mint-light)] text-[#0B6B34] border-[var(--border-color)]'
            }`}
            title="Toggle Sound Effects"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden xl:inline">{soundMuted ? 'Muted' : 'Sound: ON'}</span>
          </button>

          {/* Booking CTA Button */}
          <button
            type="button"
            onClick={() => openBooking()}
            className="hidden sm:inline-flex pop-btn pop-btn-primary pop-btn-sm"
          >
            <span>Book 30 LYD</span>
          </button>

          {/* Mobile Drawer Hamburger Button */}
          <button
            type="button"
            onClick={onToggleMobileDrawer}
            className="xl:hidden p-2 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)]"
            aria-label="Toggle navigation menu"
          >
            {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
