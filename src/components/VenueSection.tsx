'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { Coffee, Zap, Wifi, MonitorPlay, Armchair, Car, Phone, Navigation, Building, ShieldCheck } from 'lucide-react';

export default function VenueSection() {
  const { themeConfig } = useApp();

  return (
    <section className="py-16 sm:py-24 bg-[var(--bg-surface-elevated)] border-t-[2.5px] border-[var(--border-color)]" id="venue">
      <div className="tl-container">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="pop-badge terracotta inline-flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>Official Host Venue</span>
            </span>
            <span className="ink-stamp text-xs py-0.5">
              ★ VENUE SCRAPBOOK • TRIPOLI
            </span>
          </div>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)] tracking-tight">
            Where TalkLab Lives — <span className="font-['Cairo']">مركز سفراء العلم</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Every week, TalkLab takes over People &amp; Spaces inside <strong>مركز سفراء العلم للتدريب والتطوير</strong> (Sofaraa Al-Elm Center) — Tripoli&apos;s premier creative learning &amp; coworking hub in Hay Al-Andalus.
          </p>
          <p className="font-hand text-xl text-[var(--color-primary)] font-bold -rotate-1">
            ✎ Field photographs from our Hay Al-Andalus boardroom &amp; lounge!
          </p>
        </div>

        {/* Partnership Banner */}
        <div className="pop-card p-6 sm:p-9 bg-[var(--bg-surface)] mb-12 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Venue Logo */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)]">
                <Image
                  src="/assets/people-spaces-logo.jpg"
                  alt="People & Spaces — مركز سفراء العلم"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <span className="font-['Cairo'] font-bold text-[0.7rem] text-[var(--text-muted)] text-center leading-tight">
                مركز سفراء العلم
              </span>
            </div>

            <span className="font-['Outfit'] font-black text-2xl text-[var(--text-faint)]">×</span>

            {/* TalkLab Logo */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 p-2 flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)] transition-colors duration-200"
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
              <span className="font-mono font-bold text-[0.7rem] text-[var(--text-muted)] uppercase tracking-wider">
                TalkLab
              </span>
            </div>
          </div>

          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="pop-badge coral text-[0.65rem] py-0.5">
                <ShieldCheck className="w-3 h-3 mr-1 inline" />
                Accredited Hub
              </span>
              <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                Hay Al-Andalus • Tripoli
              </span>
            </div>
            <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)] leading-snug">
              Sofaraa Al-Elm Center (People &amp; Spaces) is the Official Home of TalkLab
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Tripoli&apos;s accredited training and coworking center in Hay Al-Andalus hosts every TalkLab session — featuring a 4K projection stage, ergonomic executive boardroom seating, high-speed fiber Wi-Fi, generator backup power &amp; exclusive member café discounts.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
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
                <span>📘 Facebook Page</span>
              </a>
              <a
                href="https://maps.google.com/?q=32.8735292,13.1321153"
                target="_blank"
                rel="noopener noreferrer"
                className="pop-btn pop-btn-outline pop-btn-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4 Authentic Venue Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="pop-card overflow-hidden group relative">
            <div className="washi-tape washi-tape-yellow -top-3 left-6 w-24 -rotate-3 z-20" />
            <div className="relative h-64 sm:h-72 w-full">
              <Image
                src="/assets/talklab-session-discussion.jpg"
                alt="Live TalkLab English conversation and debate session at مركز سفراء العلم Tripoli"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                  🗣️ Live Conversation Session • Hay Al-Andalus Hub
                </span>
                <span className="font-hand text-base sm:text-lg text-amber-300 font-bold -rotate-1 mt-0.5">
                  “The Oxford Fishbowl in action — passionate, spontaneous &amp; lively!”
                </span>
              </div>
            </div>
          </div>

          <div className="pop-card overflow-hidden group relative">
            <div className="washi-tape washi-tape-pink -top-3 right-6 w-24 rotate-2 z-20" />
            <div className="relative h-64 sm:h-72 w-full">
              <Image
                src="/assets/talklab-session-screens.png"
                alt="TalkLab participants seated at the conference table with presentation displays"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                  📺 Dual-Display Conference Stage &amp; Boardroom
                </span>
                <span className="font-hand text-base sm:text-lg text-amber-300 font-bold rotate-1 mt-0.5">
                  “All 25 seats have crystal clear sightlines to the stage display.”
                </span>
              </div>
            </div>
          </div>

          <div className="pop-card overflow-hidden group relative">
            <div className="washi-tape washi-tape-cyan -top-3 left-8 w-24 rotate-3 z-20" />
            <div className="relative h-64 sm:h-72 w-full">
              <Image
                src="/assets/venue-breathe-wall.png"
                alt="People & Spaces main lounge feature wall in Tripoli — Space to Breathe, Learn & Create"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                  ✨ &quot;Space to Breathe, Learn &amp; Create&quot; Lounge Wall
                </span>
                <span className="font-hand text-base sm:text-lg text-amber-300 font-bold -rotate-1 mt-0.5">
                  “The creative atmosphere where ideas and friendships ignite!”
                </span>
              </div>
            </div>
          </div>

          <div className="pop-card overflow-hidden group relative">
            <div className="washi-tape washi-tape-yellow -top-3 right-8 w-24 -rotate-2 z-20" />
            <div className="relative h-64 sm:h-72 w-full">
              <Image
                src="/assets/venue-screen-table.png"
                alt="Training boardroom and presentation setup at مركز سفراء العلم People & Spaces Tripoli"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                  🏢 People &amp; Spaces Training Stage &amp; Round Table
                </span>
                <span className="font-hand text-base sm:text-lg text-amber-300 font-bold rotate-1 mt-0.5">
                  “Executive chairs &amp; studio-quality conference acoustic design.”
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Venue Amenities & Map Embed */}
        <div className="pop-card p-6 sm:p-10 bg-[var(--bg-surface)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="font-mono text-xs font-black uppercase text-[var(--color-primary)] tracking-wider block">
                Exact Official Location
              </span>
              <h3 className="font-['Cairo'] font-black text-2xl sm:text-3xl text-[var(--text-main)] mt-1">
                مركز سفراء العلم للتدريب والتطوير
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base flex-shrink-0">📍</span>
                <span className="font-['Cairo'] text-xs sm:text-sm font-bold text-[var(--text-muted)]" dir="rtl">
                  حي الأندلس، شارع البريد — طرابلس، ليبيا
                </span>
                <span className="font-mono text-xs font-bold text-[var(--color-primary)] px-2 py-0.5 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-color)]">
                  📍 Hay Al-Andalus • Tripoli
                </span>
              </div>
            </div>

            {/* 6 Amenities Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-1">
                <Coffee className="w-5 h-5 text-[var(--color-primary)]" />
                <strong className="block text-xs font-black text-[var(--text-main)]">In-House Cafe</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)] block leading-tight">Member discount</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-1">
                <Zap className="w-5 h-5 text-amber-500" />
                <strong className="block text-xs font-black text-[var(--text-main)]">Generator Backup</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)] block leading-tight">Zero power outages</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-1">
                <Wifi className="w-5 h-5 text-emerald-500" />
                <strong className="block text-xs font-black text-[var(--text-main)]">Fiber Wi-Fi</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)] block leading-tight">Ultra high-speed</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-1">
                <MonitorPlay className="w-5 h-5 text-indigo-500" />
                <strong className="block text-xs font-black text-[var(--text-main)]">4K Screen</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)] block leading-tight">Live stage wall</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-1">
                <Armchair className="w-5 h-5 text-purple-500" />
                <strong className="block text-xs font-black text-[var(--text-main)]">25 Chairs</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)] block leading-tight">Ergonomic comfort</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-1">
                <Car className="w-5 h-5 text-cyan-500" />
                <strong className="block text-xs font-black text-[var(--text-main)]">Parking Area</strong>
                <span className="text-[0.68rem] text-[var(--text-muted)] block leading-tight">Convenient access</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://maps.google.com/?q=32.8735292,13.1321153"
                target="_blank"
                rel="noopener noreferrer"
                className="pop-btn pop-btn-gold pop-btn-md btn-shimmer"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Turn-by-Turn Directions</span>
              </a>
              <a
                href="tel:+218920920230"
                className="pop-btn pop-btn-surface pop-btn-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call Center</span>
              </a>
            </div>
          </div>

          {/* Right Map Embed / Interactive Location Hub */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border-2 border-[var(--border-color)] shadow-[5px_5px_0px_var(--shadow-color)] h-[320px] relative bg-[var(--bg-canvas)] flex flex-col">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=13.1241%2C32.8685%2C13.1401%2C32.8785&layer=mapnik&marker=32.87353%2C13.13212"
                className="w-full h-full border-0"
                loading="lazy"
                title="Real Location Map of مركز سفراء العلم People & Spaces Tripoli"
              />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[var(--bg-surface)]/95 backdrop-blur-md p-2.5 rounded-xl border border-[var(--border-color)] flex items-center justify-between shadow-md">
                <div className="text-[0.68rem] font-mono leading-tight">
                  <strong className="text-[var(--text-main)] block font-bold">People &amp; Spaces Hub</strong>
                  <span className="text-[var(--text-muted)]">Hay Al-Andalus • Tripoli</span>
                </div>
                <a
                  href="https://maps.google.com/?q=32.8735292,13.1321153"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pop-btn pop-btn-primary pop-btn-sm text-[0.68rem] py-1 px-2.5 flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Open Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Arrival Guide Steps */}
        <div className="pop-card p-6 sm:p-9 bg-[var(--bg-surface)]">
          <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)] mb-6 text-center">
            🗺️ How to Reach Sofaraa Al-Elm Center
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--color-primary)]">01</span>
              <div className="font-black text-sm text-[var(--text-main)]">Head to Hay Al-Andalus</div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Navigate towards Hay Al-Andalus in central Tripoli using the directions button above.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--color-primary)]">02</span>
              <div className="font-black text-sm text-[var(--text-main)]">Turn into Al-Bareed St</div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Turn onto شارع البريد. You will see the clear signage for مركز سفراء العلم للتدريب والتطوير.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--color-primary)]">03</span>
              <div className="font-black text-sm text-[var(--text-main)]">Check In at Reception</div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Walk inside, present your TalkLab digital pass at reception, and enter the Boardroom Suite.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--color-primary)]">04</span>
              <div className="font-black text-sm text-[var(--text-main)]">Grab a Drink &amp; Speak!</div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Avail member discounts at the in-house cafe lounge. Sessions start sharp on time!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
