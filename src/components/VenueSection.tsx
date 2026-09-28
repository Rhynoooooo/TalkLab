'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { Coffee, Zap, Wifi, MonitorPlay, Armchair, Car, Phone, Navigation } from 'lucide-react';

export default function VenueSection() {
  const { themeConfig } = useApp();

  return (
    <section className="py-16 sm:py-20 bg-[var(--bg-surface-elevated)] border-t-[2.5px] border-[var(--border-color)]" id="venue">
      <div className="tl-container">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10 max-w-2xl mx-auto">
          <span className="pop-badge terracotta">📍 Official Host Venue</span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)]">
            Where TalkLab Lives — <span className="font-['Cairo']">مركز سفراء العلم</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Every week, TalkLab takes over People &amp; Spaces inside <strong>مركز سفراء العلم للتدريب والتطوير</strong> (Sofaraa Al-Elm Center) — Tripoli&apos;s premier creative learning &amp; coworking hub in Hay Al-Andalus.
          </p>
        </div>

        {/* Partnership Banner */}
        <div className="pop-card p-6 sm:p-8 bg-[var(--bg-surface)] mb-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Venue Logo */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-[2.5px] border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)]">
                <Image
                  src="/assets/people-spaces-logo.jpg"
                  alt="People & Spaces — مركز سفراء العلم"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <span className="font-['Cairo'] font-bold text-[0.65rem] text-[var(--text-muted)]">
                مركز سفراء العلم
              </span>
            </div>

            <span className="font-['Outfit'] font-black text-2xl text-[var(--text-faint)]">×</span>

            {/* TalkLab Logo */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-[2.5px] p-2 flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)] transition-colors duration-200"
                style={{
                  backgroundColor: themeConfig.bg,
                  borderColor: themeConfig.boxBorder
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={themeConfig.logo}
                    alt="TalkLab"
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
              </div>
              <span className="font-mono font-bold text-[0.65rem] text-[var(--text-muted)] uppercase">
                TalkLab
              </span>
            </div>
          </div>

          <div className="space-y-2 flex-1 text-center md:text-left">
            <span className="font-mono text-xs font-black uppercase text-[var(--color-accent-coral)] tracking-wider block">
              🤝 Official Hosting Partnership
            </span>
            <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)]">
              Sofaraa Al-Elm Center (مركز سفراء العلم / People &amp; Spaces) is the Official Home of TalkLab
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Tripoli&apos;s accredited training and coworking center in Hay Al-Andalus hosts every TalkLab session — featuring a 4K projection stage, ergonomic boardroom seating, fiber Wi-Fi, backup power &amp; exclusive member café discounts.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <a href="tel:+218920920230" className="pop-btn pop-btn-gold pop-btn-sm">
                <Phone className="w-3.5 h-3.5" />
                <span>+218 92-0920230</span>
              </a>
              <a
                href="https://www.facebook.com/profile.php/?id=61586379443424"
                target="_blank"
                rel="noopener noreferrer"
                className="pop-btn pop-btn-surface pop-btn-sm"
              >
                <span>📘 People &amp; Spaces</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4 Authentic Venue Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          <div className="pop-card overflow-hidden group">
            <div className="relative h-64 sm:h-72 w-full">
              <Image
                src="/assets/talklab-session-discussion.jpg"
                alt="Live TalkLab English conversation and debate session at مركز سفراء العلم Tripoli"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white font-mono text-xs font-bold">
                🗣️ Live Conversation Session • Hay Al-Andalus
              </div>
            </div>
          </div>

          <div className="pop-card overflow-hidden group">
            <div className="relative h-64 sm:h-72 w-full">
              <Image
                src="/assets/talklab-session-screens.png"
                alt="TalkLab participants seated at the conference table with presentation displays"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white font-mono text-xs font-bold">
                📺 Dual-Display Conference Stage &amp; Boardroom
              </div>
            </div>
          </div>

          <div className="pop-card overflow-hidden group">
            <div className="relative h-64 sm:h-72 w-full">
              <Image
                src="/assets/venue-breathe-wall.png"
                alt="People & Spaces main lounge feature wall in Tripoli — Space to Breathe, Learn & Create"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white font-mono text-xs font-bold">
                ✨ &quot;Space to Breathe, Learn &amp; Create&quot; Wall
              </div>
            </div>
          </div>

          <div className="pop-card overflow-hidden group">
            <div className="relative h-64 sm:h-72 w-full">
              <Image
                src="/assets/venue-screen-table.png"
                alt="Training boardroom and presentation setup at مركز سفراء العلم People & Spaces Tripoli"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white font-mono text-xs font-bold">
                🏢 People &amp; Spaces Training Stage
              </div>
            </div>
          </div>
        </div>

        {/* Venue Info + Google Map */}
        <div className="pop-card p-6 sm:p-9 bg-[var(--bg-surface)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          <div className="lg:col-span-7 space-y-5">
            <div>
              <span className="font-mono text-xs font-black uppercase text-[var(--color-primary)] tracking-wider block">
                Exact Official Location
              </span>
              <h3 className="font-['Cairo'] font-black text-2xl text-[var(--text-main)] mt-1">
                مركز سفراء العلم للتدريب والتطوير
              </h3>
              <p className="font-mono text-xs sm:text-sm font-bold text-[var(--text-muted)]">
                حي الأندلس، شارع البريد — طرابلس، ليبيا 🇱🇾
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Sofaraa Al-Elm Center • Hay Al-Andalus, Al-Bareed St
              </p>
            </div>

            {/* 6 Amenities Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                <Coffee className="w-5 h-5 text-[var(--color-primary)] mb-1" />
                <strong className="block text-xs font-extrabold text-[var(--text-main)]">In-House Cafe</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)]">Exclusive discount</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                <Zap className="w-5 h-5 text-amber-500 mb-1" />
                <strong className="block text-xs font-extrabold text-[var(--text-main)]">Generator Backup</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)]">100% no cuts</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                <Wifi className="w-5 h-5 text-emerald-500 mb-1" />
                <strong className="block text-xs font-extrabold text-[var(--text-main)]">Fiber Wi-Fi</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)]">High-speed net</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                <MonitorPlay className="w-5 h-5 text-indigo-500 mb-1" />
                <strong className="block text-xs font-extrabold text-[var(--text-main)]">4K Projection</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)]">Live debate screen</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                <Armchair className="w-5 h-5 text-purple-500 mb-1" />
                <strong className="block text-xs font-extrabold text-[var(--text-main)]">25 Seats</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)]">Ergonomic mesh</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)]">
                <Car className="w-5 h-5 text-cyan-500 mb-1" />
                <strong className="block text-xs font-extrabold text-[var(--text-main)]">Free Parking</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)]">On-site entrance</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://maps.google.com/?q=People+%26+Spaces+Tripoli"
                target="_blank"
                rel="noopener noreferrer"
                className="pop-btn pop-btn-gold pop-btn-md"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Turn-by-Turn Directions</span>
              </a>
              <a
                href="tel:+218920920230"
                className="pop-btn pop-btn-surface pop-btn-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call 0920920230</span>
              </a>
            </div>
          </div>

          {/* Right Map Embed */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border-[2.5px] border-[var(--border-color)] shadow-[5px_5px_0px_var(--shadow-color)] h-[320px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3348.56!2d13.145!3d32.885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13a8edb16770518d%3A0xac3648e0d6923b2e!2z2YXYsdmD2LIg2LPZgdix2KfYoSDYp9mE2LnZhNmF!5e0!3m2!1sar!2sly!4v1710000000000!5m2!1sar!2sly"
                className="w-full h-full border-0"
                loading="lazy"
                title="Google Maps Location for مركز سفراء العلم"
              />
            </div>
          </div>
        </div>

        {/* Arrival Guide 4 Steps */}
        <div className="pop-card p-6 sm:p-8 bg-[var(--bg-surface)]">
          <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)] mb-6 text-center">
            🗺️ How to Reach Sofaraa Al-Elm Center
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--color-primary)]">01</span>
              <div className="font-black text-sm text-[var(--text-main)]">Head to Al-Andalus District</div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Navigate towards Hay Al-Andalus in central Tripoli using the directions button above.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--color-primary)]">02</span>
              <div className="font-black text-sm text-[var(--text-main)]">Turn into Al-Bareed Street</div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Turn onto شارع البريد. You will see the clear signage for مركز سفراء العلم للتدريب والتطوير.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--color-primary)]">03</span>
              <div className="font-black text-sm text-[var(--text-main)]">Check In at Reception</div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Walk inside, present your TalkLab digital pass at reception, and enter the Boardroom Suite.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--color-primary)]">04</span>
              <div className="font-black text-sm text-[var(--text-main)]">Grab a Coffee &amp; Enjoy</div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Avail member discounts at the in-house cafe lounge. Immersion sessions kick off sharp on time!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
