'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { SoundFX } from '@/lib/soundFx';
import { Sparkles, Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const { openBooking, bookedSeats } = useApp();
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  // Saturday 12:00 PM countdown
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
  const percentBooked = Math.round((bookedSaturdayCount / 25) * 100);

  return (
    <section className="relative py-12 sm:py-20 overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Emojis Portal */}
      {floatingEmojis.map(item => (
        <div
          key={item.id}
          className="fixed pointer-events-none z-50 text-3xl sm:text-4xl animate-[talklabFloat_1.2s_ease-out_forwards]"
          style={{ left: item.x - 20, top: item.y - 20 }}
        >
          {item.emoji}
        </div>
      ))}

      <div className="tl-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Hero Headline & Value Props */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Badges Row */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="pop-badge blue flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>Youth &amp; Student Friendly</span>
              </span>
              <span className="pop-badge gold">⚡ 30 LYD Flat Fee</span>
              <span className="pop-badge mint">☕ In-House Cafe Perk</span>
              <a
                href="https://maps.google.com/?q=People+%26+Spaces+Tripoli"
                target="_blank"
                rel="noopener noreferrer"
                className="pop-badge coral hover:scale-105 transition-transform"
                title="View location in Hay Al-Andalus"
              >
                📍 مركز سفراء العلم ↗
              </a>
            </div>

            {/* Headline with Gradient Accent */}
            <div className="space-y-3">
              <h1 className="font-['Outfit'] font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-[var(--text-main)]">
                Where English Feels Like <br />
                <span className="inline-block relative">
                  <span className="relative z-10 text-white bg-[var(--color-primary)] px-3.5 py-1 rounded-2xl -rotate-1 shadow-[4px_4px_0px_var(--shadow-color)] inline-block my-1">
                    Hanging Out,
                  </span>
                </span> <br />
                Not Homework.
              </h1>
              <p
                className="font-['Cairo'] font-bold text-base sm:text-lg text-[var(--color-primary)] pt-1 text-right"
                dir="rtl"
              >
                حيث الإنجليزية تبدو مثل التسلية الحقيقية، لا الواجب المدرسي الجاف.
              </p>
            </div>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-xl">
              Zero boring grammar drills or awkward lectures. TalkLab is Tripoli&apos;s weekly conversation club where ambitious young minds debate spicy moral dilemmas, play fast-paced party word games, and build fearless fluency.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openBooking()}
                className="pop-btn pop-btn-primary pop-btn-lg justify-center text-center btn-shimmer group"
              >
                <span>Claim a Roundtable Chair</span>
                <span className="font-mono text-xs bg-white/20 px-2 py-0.5 rounded-full ml-1 font-black">
                  30 LYD
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#slot-machine"
                className="pop-btn pop-btn-gold pop-btn-lg justify-center text-center"
              >
                <span>Spin Slot Machine 🎰</span>
              </a>
            </div>

            {/* Emoji Reaction Bar */}
            <div className="flex items-center gap-3 p-2 px-3.5 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-2xl shadow-[3px_3px_0px_var(--shadow-color)] max-w-md">
              <span className="font-mono text-xs font-black text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                <span>Hype:</span>
              </span>
              <div className="flex items-center gap-2">
                {['🔥', '🗣️', '💯', '☕', '🚀', '💀'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={e => handleEmojiClick(e, emoji)}
                    className="text-xl sm:text-2xl hover:scale-130 transition-transform active:scale-95 p-1 rounded-xl hover:bg-[var(--bg-surface-elevated)] cursor-pointer"
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
            <div className="pop-card p-6 sm:p-8 bg-[var(--bg-surface)] space-y-6 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="pop-badge coral mb-2">Upcoming Session</span>
                  <h3 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                    Saturday Immersion
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-['Outfit'] font-black text-3xl sm:text-4xl text-[var(--color-primary)]">
                    30 LYD
                  </div>
                  <div className="font-mono text-[0.68rem] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                    Flat Door Fee
                  </div>
                </div>
              </div>

              {/* Session Meta */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] space-y-2">
                <div className="flex items-center gap-2 font-black text-sm sm:text-base text-[var(--text-main)]">
                  <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>Every Saturday • 12:00 PM – 4:00 PM</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>4 Full Hours of Pure Speaking Immersion</span>
                </div>
                <a
                  href="https://maps.google.com/?q=People+%26+Spaces+Tripoli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline pt-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <span>مركز سفراء العلم (People &amp; Spaces) • حي الأندلس ↗</span>
                </a>
              </div>

              {/* Live Countdown Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs font-black uppercase text-[var(--text-muted)]">
                  <span>Countdown to Kickoff</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                    <div className="font-['Space_Grotesk'] font-black text-xl sm:text-2xl text-[var(--color-primary)]">
                      {countdown.days}
                    </div>
                    <div className="font-mono text-[0.62rem] font-bold uppercase text-[var(--text-muted)]">
                      Days
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                    <div className="font-['Space_Grotesk'] font-black text-xl sm:text-2xl text-[var(--color-primary)]">
                      {countdown.hours}
                    </div>
                    <div className="font-mono text-[0.62rem] font-bold uppercase text-[var(--text-muted)]">
                      Hours
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                    <div className="font-['Space_Grotesk'] font-black text-xl sm:text-2xl text-[var(--color-primary)]">
                      {countdown.minutes}
                    </div>
                    <div className="font-mono text-[0.62rem] font-bold uppercase text-[var(--text-muted)]">
                      Mins
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                    <div className="font-['Space_Grotesk'] font-black text-xl sm:text-2xl text-[var(--color-primary)]">
                      {countdown.seconds}
                    </div>
                    <div className="font-mono text-[0.62rem] font-bold uppercase text-[var(--text-muted)]">
                      Secs
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs font-black">
                  <span className="text-[var(--text-main)] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    Roundtable Boardroom (25 Max)
                  </span>
                  <span className="text-[var(--color-accent-coral)] font-bold">
                    {spotsLeft} seats remaining
                  </span>
                </div>
                <div className="h-3 w-full bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentBooked}%` }}
                  />
                </div>
                <div className="flex justify-between text-[0.65rem] font-mono text-[var(--text-muted)]">
                  <span>{bookedSaturdayCount} Booked</span>
                  <span>{percentBooked}% Capacity</span>
                </div>
              </div>

              {/* Direct Booking CTA */}
              <button
                type="button"
                onClick={() => openBooking(null, 'saturday')}
                className="w-full pop-btn pop-btn-primary pop-btn-lg justify-center text-center btn-shimmer"
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
