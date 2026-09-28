'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { SoundFX } from '@/lib/soundFx';

export default function HeroSection() {
  const { openBooking, bookedSeats } = useApp();
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  // Calculate Saturday 12:00 PM countdown
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const targetDay = 6; // Saturday
      const targetHour = 12; // 12:00 PM

      let daysToAdd = (targetDay - now.getDay() + 7) % 7;
      if (daysToAdd === 0 && now.getHours() >= targetHour) {
        daysToAdd = 7;
      }

      const target = new Date(now);
      target.setDate(now.getDate() + daysToAdd);
      target.setHours(targetHour, 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => String(n).padStart(2, '0');
      setCountdown({ days: pad(d), hours: pad(h), minutes: pad(m), seconds: pad(s) });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Drop floating emoji reaction
  const handleEmojiClick = (e: React.MouseEvent<HTMLButtonElement>, emoji: string) => {
    SoundFX.playPop(480 + Math.random() * 260);
    const rect = e.currentTarget.getBoundingClientRect();
    const newId = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev, { id: newId, emoji, x: rect.left + rect.width / 2, y: rect.top }]);

    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(item => item.id !== newId));
    }, 1200);
  };

  const bookedSaturdayCount = Object.keys(bookedSeats.saturday).length;
  const spotsLeft = Math.max(0, 25 - bookedSaturdayCount);

  return (
    <section className="relative py-10 sm:py-16 overflow-hidden">
      {/* Floating Emojis Portal */}
      {floatingEmojis.map(item => (
        <div
          key={item.id}
          className="fixed pointer-events-none z-50 text-3xl font-bold animate-[talklabFloat_1.2s_ease-out_forwards]"
          style={{ left: item.x - 16, top: item.y - 20 }}
        >
          {item.emoji}
        </div>
      ))}

      <div className="tl-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            {/* Badges Row */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="pop-badge blue">✨ Youth &amp; Student Friendly</span>
              <span className="pop-badge gold">⚡ 30 LYD</span>
              <span className="pop-badge mint">☕ In-House Cafe Perk</span>
              <a
                href="https://maps.google.com/?q=People+%26+Spaces+Tripoli"
                target="_blank"
                rel="noopener noreferrer"
                className="pop-badge coral hover:scale-105 transition-transform"
                title="Open مركز سفراء العلم in Google Maps"
              >
                🏢 مركز سفراء العلم ↗
              </a>
            </div>

            {/* Headline */}
            <div>
              <h1 className="font-['Outfit'] font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-[var(--text-main)]">
                Where English Feels Like <br />
                <span className="inline-block bg-[var(--color-primary)] text-white px-3 py-1 rounded-xl -rotate-1 shadow-[4px_4px_0px_var(--shadow-color)] mt-1.5 mb-1.5">
                  Hanging Out,
                </span> <br />
                Not Homework.
              </h1>
              <p className="mt-3 text-base sm:text-lg font-['Cairo'] font-bold text-[var(--color-primary)] text-right" dir="rtl">
                حيث الإنجليزية تبدو مثل التسلية الحقيقية، لا الواجب المدرسي الجاف.
              </p>
            </div>

            {/* Subtitles */}
            <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-xl">
              Zero boring grammar worksheets. TalkLab is Tripoli&apos;s weekly club where ambitious young minds debate spicy dilemmas, play fast-paced party word games, and unlock unshakeable fluency.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openBooking()}
                className="pop-btn pop-btn-primary pop-btn-lg justify-center text-center"
              >
                <span>Claim a Roundtable Chair</span>
                <span className="font-mono text-sm bg-white/20 px-2 py-0.5 rounded-md">30 LYD</span>
              </button>
              <a
                href="#slot-machine"
                className="pop-btn pop-btn-gold pop-btn-lg justify-center text-center"
              >
                <span>Spin Slot Machine 🎰</span>
              </a>
            </div>

            {/* Emoji Reaction Bar */}
            <div className="flex items-center gap-2 p-2 px-3 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-2xl shadow-[3px_3px_0px_var(--shadow-color)] max-w-md">
              <span className="font-mono text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Drop Hype:
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {['🔥', '🗣️', '💯', '☕', '🚀', '💀'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={e => handleEmojiClick(e, emoji)}
                    className="text-xl sm:text-2xl hover:scale-125 transition-transform active:scale-95 p-1 rounded-lg"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Showcase Booking Card */}
          <div className="lg:col-span-5">
            <div className="pop-card p-6 sm:p-7 bg-[var(--bg-surface)] space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="pop-badge coral mb-1.5">Next Live Session</span>
                  <h3 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                    Saturday Immersion
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-['Outfit'] font-black text-3xl text-[var(--color-primary)]">
                    30 LYD
                  </div>
                  <div className="font-mono text-[0.7rem] text-[var(--text-muted)] uppercase">
                    Flat Door Fee
                  </div>
                </div>
              </div>

              {/* Session Meta */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] space-y-1">
                <div className="font-extrabold text-sm sm:text-base text-[var(--text-main)]">
                  Every Saturday • 12:00 PM – 4:00 PM (4 Hours)
                </div>
                <a
                  href="https://maps.google.com/?q=People+%26+Spaces+Tripoli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs font-bold text-[var(--color-primary)] hover:underline"
                >
                  📍 مركز سفراء العلم (People &amp; Spaces) • حي الأندلس، طرابلس ↗
                </a>
              </div>

              {/* Countdown Grid */}
              <div>
                <div className="flex items-center justify-between font-mono text-xs font-black uppercase text-[var(--text-muted)] mb-2">
                  <span>Countdown to Table Kickoff</span>
                  <span className="text-[var(--color-accent-mint)] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent-mint)] animate-pulse" />
                    Live Sync
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                    <div className="font-['Space_Grotesk'] font-black text-xl sm:text-2xl text-[var(--color-primary)]">
                      {countdown.days}
                    </div>
                    <div className="font-mono text-[0.65rem] font-bold uppercase text-[var(--text-muted)]">
                      Days
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                    <div className="font-['Space_Grotesk'] font-black text-xl sm:text-2xl text-[var(--color-primary)]">
                      {countdown.hours}
                    </div>
                    <div className="font-mono text-[0.65rem] font-bold uppercase text-[var(--text-muted)]">
                      Hours
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                    <div className="font-['Space_Grotesk'] font-black text-xl sm:text-2xl text-[var(--color-primary)]">
                      {countdown.minutes}
                    </div>
                    <div className="font-mono text-[0.65rem] font-bold uppercase text-[var(--text-muted)]">
                      Mins
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                    <div className="font-['Space_Grotesk'] font-black text-xl sm:text-2xl text-[var(--color-primary)]">
                      {countdown.seconds}
                    </div>
                    <div className="font-mono text-[0.65rem] font-bold uppercase text-[var(--text-muted)]">
                      Secs
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity Status */}
              <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-black">
                <span className="text-[var(--text-main)]">Immersion Boardroom (25 Max)</span>
                <span className="text-[var(--color-accent-coral)] font-bold">
                  {spotsLeft} seats available
                </span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => openBooking(null, 'saturday')}
                className="w-full pop-btn pop-btn-primary pop-btn-lg justify-center text-center shadow-[4px_4px_0px_var(--shadow-color)]"
              >
                <span>Lock In Your Spot (30 LYD)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
