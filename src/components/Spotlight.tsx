'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';

export default function Spotlight() {
  const { openBooking, themeConfig } = useApp();

  return (
    <section className="py-16 sm:py-20 border-t-[2.5px] border-[var(--border-color)] bg-[var(--bg-canvas)]" id="about-talklab">
      <div className="tl-container">
        <div className="pop-card p-6 sm:p-12 bg-[var(--bg-surface)] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Emblem Box */}
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
            <div
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl border-[3.5px] p-4 flex items-center justify-center shadow-[6px_6px_0px_var(--shadow-color)] floating-emblem transition-colors duration-200"
              style={{
                backgroundColor: themeConfig.bg,
                borderColor: themeConfig.boxBorder
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={themeConfig.logo}
                  alt="TalkLab Official Logo Tripoli"
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
            </div>

            <span className="font-mono text-xs font-black uppercase px-3 py-1 bg-[var(--color-accent-gold)] text-[#13172E] border-2 border-[var(--border-color)] rounded-full shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
              ★ Official Tripoli Club 🇱🇾
            </span>
          </div>

          {/* Right Mission & DNA */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <div>
              <span className="pop-badge blue mb-2">
                ✨ The TalkLab Standard
              </span>
              <h2 className="font-['Outfit'] font-black text-2xl sm:text-4xl text-[var(--text-main)] tracking-tight">
                Tripoli&apos;s English Conversation Club Built for Ambitious Minds.
              </h2>
              <p className="mt-1 font-['Cairo'] font-bold text-sm sm:text-base text-[var(--color-primary)]" dir="rtl">
                نادي المحادثة الإنجليزية في طرابلس المصمم للعقول الطموحة.
              </p>
            </div>

            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              We created TalkLab to replace outdated, dry grammar courses with high-energy peer conversation. Every week in Hay Al-Andalus, 25 young thinkers gather at <strong>مركز سفراء العلم</strong> (People &amp; Spaces) to argue spicy dilemmas, build genuine speaking confidence, and connect without fear of judgment.
            </p>

            {/* Feature Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <strong className="block text-xs sm:text-sm text-[var(--text-main)]">Zero Grammar Drills</strong>
                  <span className="font-mono text-[0.7rem] text-[var(--text-muted)]">100% interactive immersion</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <strong className="block text-xs sm:text-sm text-[var(--text-main)]">30 LYD Flat Fee</strong>
                  <span className="font-mono text-[0.7rem] text-[var(--text-muted)]">Pay at door • All games</span>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=People+%26+Spaces+Tripoli"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] flex items-center gap-3 hover:scale-102 transition-transform"
              >
                <span className="text-2xl">📍</span>
                <div>
                  <strong className="block text-xs sm:text-sm text-[var(--text-main)]">مركز سفراء العلم Hub ↗</strong>
                  <span className="font-mono text-[0.7rem] text-[var(--text-muted)]">Hay Al-Andalus, Tripoli</span>
                </div>
              </a>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openBooking()}
                className="pop-btn pop-btn-primary pop-btn-md"
              >
                <span>Claim a 30 LYD Seat 🗓️</span>
              </button>
              <a
                href="#venue"
                className="pop-btn pop-btn-surface pop-btn-md"
              >
                <span>Explore Venue &amp; Photos 📍</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
