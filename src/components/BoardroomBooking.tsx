'use client';

import React, { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { SESSIONS } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';

export default function BoardroomBooking() {
  const {
    activeSession,
    setActiveSession,
    selectedSeat,
    setSelectedSeat,
    openBooking,
    bookedSeats,
    openEasterModal
  } = useApp();

  const gavelClicksRef = useRef<number>(0);
  const gavelTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sessionConfig = SESSIONS[activeSession];
  const currentRoster = bookedSeats[activeSession];
  const bookedCount = Object.keys(currentRoster).length;
  const spotsLeft = Math.max(0, sessionConfig.capacity - bookedCount);

  const handleSeatClick = (seatNum: number) => {
    if (currentRoster[seatNum]) {
      SoundFX.playBuzzer();
      return;
    }
    SoundFX.playPop(580);
    if (selectedSeat === seatNum) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seatNum);
    }
  };

  const handleModeratorClick = () => {
    gavelClicksRef.current += 1;
    SoundFX.playGavel();
    if (gavelTimerRef.current) clearTimeout(gavelTimerRef.current);

    if (gavelClicksRef.current >= 3) {
      gavelClicksRef.current = 0;
      openEasterModal(
        '⚖️ ORDER IN THE COURT! (GAVEL STRIKE)',
        <div className="text-left space-y-3">
          <div className="text-4xl text-center">🔨⚡</div>
          <p className="text-sm text-[var(--text-muted)]">
            You discovered the Moderator Gavel easter egg! In Oxford Fishbowl debates at TalkLab, the moderator uses a real wooden gavel to silence spicy chaos when debates get too passionate!
          </p>
          <div className="p-3 bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] rounded-xl text-xs font-mono text-center font-bold">
            Penalty: The speaker who yelled the loudest has to argue the next topic from the OPPOSITE perspective!
          </div>
        </div>
      );
    } else {
      gavelTimerRef.current = setTimeout(() => {
        gavelClicksRef.current = 0;
      }, 1500);
    }
  };

  // Seats 1 to 12 on Left Column
  const leftSeats = Array.from({ length: 12 }, (_, i) => i + 1);
  // Seats 14 to 25 on Right Column
  const rightSeats = Array.from({ length: 12 }, (_, i) => i + 14);

  // Table letters: T-A-B-L-E repeated vertically across 12 desk rows
  const tableLetters = ['T', 'A', 'B', 'L', 'E', '✦', 'T', 'A', 'B', 'L', 'E', '✦'];

  return (
    <section className="py-16 sm:py-20 border-t-[2.5px] border-[var(--border-color)]" id="booking">
      <div className="tl-container">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-full shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
            <span className="text-sm">🪑</span>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[var(--text-main)]">
              Official TalkLab Roundtable • 30 LYD
            </span>
          </div>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)]">
            Claim Your Roundtable Seat
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            No crowded lecture halls. Strictly 25 members inside <strong>مركز سفراء العلم</strong> (People &amp; Spaces) for deep speaking practice. Flat fee: <strong>30 LYD</strong>.
          </p>
        </div>

        {/* 2 Session Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Saturday Card */}
          <div
            onClick={() => {
              setActiveSession('saturday');
              SoundFX.playPop(520);
            }}
            className={`pop-card p-6 cursor-pointer transition-all ${
              activeSession === 'saturday'
                ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] shadow-[6px_6px_0px_var(--shadow-color)]'
                : 'opacity-85 hover:opacity-100'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="pop-badge blue">Weekend 4-Hour Lab</span>
              <span className="font-['Outfit'] font-black text-2xl text-[var(--color-primary)]">
                30 LYD
              </span>
            </div>
            <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)] mb-1">
              Saturday Immersion Lab
            </h3>
            <div className="font-mono text-xs sm:text-sm font-bold text-[var(--color-primary)] mb-2">
              Every Saturday • 12:00 PM – 4:00 PM (4 Hours)
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Oxford Fishbowl debates, spontaneous improv battles, People &amp; Spaces in-house cafe break &amp; team word games.
            </p>
            <div className="font-mono text-xs font-bold text-[var(--color-accent-mint)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent-mint)] animate-pulse" />
              Click to view table map (25 Seats)
            </div>
          </div>

          {/* Tuesday Card */}
          <div
            onClick={() => {
              setActiveSession('tuesday');
              SoundFX.playPop(620);
            }}
            className={`pop-card p-6 cursor-pointer transition-all ${
              activeSession === 'tuesday'
                ? 'border-[var(--color-accent-coral)] ring-2 ring-[var(--color-accent-coral)] shadow-[6px_6px_0px_var(--shadow-color)]'
                : 'opacity-85 hover:opacity-100'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="pop-badge coral">Midweek 3-Hour Sprint</span>
              <span className="font-['Outfit'] font-black text-2xl text-[var(--color-accent-coral)]">
                30 LYD
              </span>
            </div>
            <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)] mb-1">
              Tuesday Twilight Lab
            </h3>
            <div className="font-mono text-xs sm:text-sm font-bold text-[var(--color-accent-coral)] mb-2">
              Every Tuesday • 4:00 PM – 7:00 PM (3 Hours)
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Fast-paced speed networking rotations, moral dilemma defense, modern slang labs &amp; People &amp; Spaces cafe discounts.
            </p>
            <div className="font-mono text-xs font-bold text-[var(--color-accent-mint)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent-mint)] animate-pulse" />
              Click to view table map (25 Seats)
            </div>
          </div>
        </div>

        {/* Tactical Boardroom Stage Container */}
        <div className="pop-card p-5 sm:p-8 bg-[var(--bg-surface)] max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[var(--border-color)] pb-4">
            <div>
              <h3 className="font-['Outfit'] font-black text-lg sm:text-xl text-[var(--text-main)]">
                {sessionConfig.name} ({sessionConfig.time}) — 30 LYD
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Click any green chair to choose your exact seat position at People &amp; Spaces!
              </p>
            </div>
            <span className="pop-badge mint text-xs self-start sm:self-center">
              🟢 {spotsLeft} seats available (out of 25)
            </span>
          </div>

          {/* Outer Room Container */}
          <div className="p-4 sm:p-8 rounded-3xl bg-[var(--bg-canvas)] border-3 border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] relative">
            {/* Top Row: Screen + Entry Door */}
            <div className="flex items-center justify-between gap-4 mb-6">
              {/* Screen Bar */}
              <div className="flex-1 p-3 rounded-2xl bg-[var(--border-color)] text-white text-center flex items-center justify-between px-4 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <div>
                  <div className="font-mono text-xs sm:text-sm font-black tracking-widest text-cyan-300">
                    📺 SCREEN
                  </div>
                  <div className="font-mono text-[0.62rem] sm:text-[0.68rem] text-neutral-300 hidden sm:block">
                    PEOPLE &amp; SPACES MAIN STAGE • 4K LIVE PROJECTION WALL
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>

              {/* Entry Door */}
              <div
                className="p-2 sm:p-2.5 rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-surface)] text-center flex-shrink-0 cursor-default"
                title="Check in at reception desk, enter here"
              >
                <div className="font-mono text-[0.68rem] sm:text-xs font-black text-[var(--color-primary)]">
                  🚪 ENTRY
                </div>
                <div className="font-mono text-[0.58rem] text-[var(--text-muted)]">
                  Main Floor
                </div>
              </div>
            </div>

            {/* Moderator Lead Chair Area */}
            <div className="flex flex-col items-center justify-center mb-4">
              <span className="font-mono text-[0.68rem] font-black uppercase text-[var(--color-accent-gold-dark)] tracking-wider mb-1">
                👑 LEAD / MODERATOR
              </span>
              <button
                type="button"
                onClick={handleModeratorClick}
                className="w-11 h-11 rounded-full bg-[var(--color-accent-gold)] border-[2.5px] border-[var(--border-color)] flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_var(--shadow-color)] hover:scale-110 active:scale-95 transition-transform"
                title="Moderator / Discussion Lead (Triple-click for Gavel Easter Egg!)"
              >
                S
              </button>
            </div>

            {/* Table Arena Floor: Left Chairs + Table Slab + Right Chairs */}
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {/* Left Column Chairs (1 to 12) */}
              <div className="flex flex-col gap-2">
                {leftSeats.map(seatNum => {
                  const booked = currentRoster[seatNum];
                  const isSelected = selectedSeat === seatNum;

                  return (
                    <button
                      key={seatNum}
                      type="button"
                      onClick={() => handleSeatClick(seatNum)}
                      className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center font-mono text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] scale-110 z-10'
                          : booked
                          ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-400 cursor-not-allowed opacity-75'
                          : 'bg-[var(--color-accent-mint)] text-white border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:scale-110'
                      }`}
                      title={booked ? `Reserved by ${booked.name}` : `Seat #${seatNum} (Click to pick)`}
                    >
                      {/* Left curved arc */}
                      <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 text-[0.6rem] opacity-60 font-bold">
                        (
                      </span>
                      {isSelected ? '✓' : booked ? booked.initial : seatNum}
                    </button>
                  );
                })}
              </div>

              {/* Central Table Slab */}
              <div className="w-20 sm:w-32 bg-[var(--bg-surface)] border-[2.5px] border-[var(--border-color)] rounded-2xl shadow-[4px_4px_0px_var(--shadow-color)] p-2 sm:p-3 relative flex flex-col justify-between items-center min-h-[480px]">
                {/* MOD Pill Badge at Top */}
                <span className="font-mono text-[0.62rem] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--color-accent-gold)] text-[#13172E] border border-[var(--border-color)]">
                  MOD
                </span>

                {/* Center Spine Line */}
                <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-[2px] bg-teal-500/40 pointer-events-none" />

                {/* 12 Vertical Row Letter Marks */}
                <div className="w-full flex flex-col justify-between h-[420px] py-1 z-10">
                  {tableLetters.map((char, idx) => (
                    <div
                      key={idx}
                      className="text-center font-mono text-[0.72rem] sm:text-xs font-black text-[var(--color-primary)] opacity-80"
                    >
                      {char}
                    </div>
                  ))}
                </div>

                {/* Bottom Hallway Label */}
                <span className="font-mono text-[0.55rem] font-bold uppercase text-[var(--text-muted)] text-center">
                  Table End
                </span>
              </div>

              {/* Right Column Chairs (14 to 25) */}
              <div className="flex flex-col gap-2">
                {rightSeats.map(seatNum => {
                  const booked = currentRoster[seatNum];
                  const isSelected = selectedSeat === seatNum;

                  return (
                    <button
                      key={seatNum}
                      type="button"
                      onClick={() => handleSeatClick(seatNum)}
                      className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center font-mono text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] scale-110 z-10'
                          : booked
                          ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-400 cursor-not-allowed opacity-75'
                          : 'bg-[var(--color-accent-mint)] text-white border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:scale-110'
                      }`}
                      title={booked ? `Reserved by ${booked.name}` : `Seat #${seatNum} (Click to pick)`}
                    >
                      {isSelected ? '✓' : booked ? booked.initial : seatNum}
                      {/* Right curved arc */}
                      <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 text-[0.6rem] opacity-60 font-bold">
                        )
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-xs font-bold text-[var(--text-muted)] pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-[var(--color-accent-mint)] border border-[var(--border-color)] shadow-[1px_1px_0px_var(--shadow-color)]" />
              <span>Available (Click to Pick)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-neutral-400 border border-neutral-500" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-[var(--color-primary)] border border-[var(--border-color)]" />
              <span>Your Pick</span>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => openBooking(selectedSeat, activeSession)}
              className="pop-btn pop-btn-primary pop-btn-lg px-8 shadow-[4px_4px_0px_var(--shadow-color)]"
            >
              <span>
                {selectedSeat ? `Reserve Seat #${selectedSeat} for 30 LYD` : 'Reserve Any Available Seat (30 LYD)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
