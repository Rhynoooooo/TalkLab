'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';

export default function Footer() {
  const { themeConfig, openBooking, openEasterModal } = useApp();

  const handleSecretKeyClick = () => {
    openEasterModal(
      '🗝️ THE TALKLAB SECRET ARCHIVE',
      <div className="text-left space-y-3">
        <div className="text-4xl text-center">🏛️✨</div>
        <h4 className="font-['Outfit'] font-black text-lg text-[var(--text-main)]">
          You Unlocked the Secret Archive!
        </h4>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          Behind every lively session is a team of young facilitators from Tripoli committed to creating spaces where English isn&apos;t a test, but a bridge to global ideas.
        </p>
        <div className="p-3 bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] rounded-xl font-mono text-xs">
          <strong>Secret Tripoli Slang Translation:</strong> <br />
          <em>&quot;جو رايق&quot;</em> in English = <strong>&quot;Immaculate chill vibes&quot;</strong> ☕
        </div>
      </div>
    );
  };

  return (
    <footer className="border-t-[2.5px] border-[var(--border-color)] bg-[var(--bg-surface)] py-12 sm:py-16">
      <div className="tl-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b-2 border-dashed border-[var(--border-color)]">
          {/* Brand Info */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div
              className="relative w-16 h-16 rounded-2xl overflow-hidden border-[2.5px] p-2 flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)] flex-shrink-0"
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
                  sizes="64px"
                  className="object-contain"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-['Outfit'] font-black text-2xl text-[var(--text-main)]">
                  TalkLab
                </span>
                <span className="font-mono text-[0.62rem] font-black px-1.5 py-0.5 bg-[var(--color-accent-gold)] text-[#13172E] border border-[var(--border-color)] rounded-full">
                  🇱🇾 TRIPOLI
                </span>
              </div>
              <div className="font-mono text-xs font-bold text-[var(--color-primary)]">
                Tripoli&apos;s English Conversation Club
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                Hosted weekly at <strong>مركز سفراء العلم</strong> (People &amp; Spaces) • Hay Al-Andalus
              </div>
            </div>
          </div>

          {/* CTA */}
          <div>
            <button
              type="button"
              onClick={() => openBooking()}
              className="pop-btn pop-btn-primary pop-btn-md"
            >
              <span>Book Next Session (30 LYD)</span>
            </button>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[var(--text-muted)] text-center sm:text-left">
          <div>© {new Date().getFullYear()} TalkLab English Conversation Club. All rights reserved.</div>
          <div className="flex items-center gap-1 font-bold text-[var(--text-main)]">
            <span>&quot;This is your space to breathe, learn, and create&quot;</span>
            <button
              type="button"
              onClick={handleSecretKeyClick}
              className="opacity-50 hover:opacity-100 hover:scale-125 transition-all p-1"
              title="Secret Archive Key"
            >
              🗝️
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
