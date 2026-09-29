'use client';

import React, { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { SESSIONS } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';
import { Crown, Check, Monitor, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';

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

  // 12 Seats on Left (1 - 12)
  const leftSeats = Array.from({ length: 12 }, (_, i) => i + 1);
  // 12 Seats on Right (14 - 25)
  const rightSeats = Array.from({ length: 12 }, (_, i) => i + 14);

  return (
    <section className="py-16 sm:py-24 border-t-[2.5px] border-[var(--border-color)] bg-[var(--bg-canvas)]" id="booking">
      <div className="tl-container">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-full shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
            <span className="text-base">🪑</span>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[var(--text-main)]">
              Interactive Boardroom Map • 30 LYD Flat
            </span>
          </div>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)] tracking-tight">
            Pick Your Exact Roundtable Seat
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Strictly limited to 25 members inside <strong>مركز سفراء العلم</strong> (People &amp; Spaces) for high-intensity conversation. Flat entrance fee: <strong>30 LYD</strong>.
          </p>
        </div>

        {/* 2 Session Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {/* Saturday Card */}
          <div
            onClick={() => {
              setActiveSession('saturday');
              SoundFX.playPop(520);
            }}
            className={`pop-card p-6 sm:p-7 cursor-pointer transition-all ${
              activeSession === 'saturday'
                ? 'border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20 shadow-[6px_6px_0px_var(--shadow-color)] bg-[var(--bg-surface)]'
                : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="pop-badge blue">Weekend Immersion</span>
              <span className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--color-primary)]">
                30 LYD
              </span>
            </div>
            <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)] mb-1">
              Saturday Immersion Lab
            </h3>
            <div className="font-mono text-xs sm:text-sm font-bold text-[var(--color-primary)] mb-2 flex items-center gap-1.5">
              <span>📅 Every Saturday • 12:00 PM – 4:00 PM (4 Hours)</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Oxford Fishbowl debates, spontaneous improv battles, in-house cafe break &amp; team vocabulary sprints.
            </p>
            <div className="font-mono text-xs font-bold text-[var(--color-accent-mint)] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-mint)] animate-pulse" />
              <span>{activeSession === 'saturday' ? '● Currently viewing seat layout' : 'Click to select this session'}</span>
            </div>
          </div>

          {/* Tuesday Card */}
          <div
            onClick={() => {
              setActiveSession('tuesday');
              SoundFX.playPop(620);
            }}
            className={`pop-card p-6 sm:p-7 cursor-pointer transition-all ${
              activeSession === 'tuesday'
                ? 'border-[var(--color-accent-coral)] ring-4 ring-[var(--color-accent-coral)]/20 shadow-[6px_6px_0px_var(--shadow-color)] bg-[var(--bg-surface)]'
                : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="pop-badge coral">Midweek Sprint</span>
              <span className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--color-accent-coral)]">
                30 LYD
              </span>
            </div>
            <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)] mb-1">
              Tuesday Twilight Lab
            </h3>
            <div className="font-mono text-xs sm:text-sm font-bold text-[var(--color-accent-coral)] mb-2 flex items-center gap-1.5">
              <span>📅 Every Tuesday • 4:00 PM – 7:00 PM (3 Hours)</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Speed networking rotations, moral dilemma defense, modern slang breakdown &amp; cafe discount perks.
            </p>
            <div className="font-mono text-xs font-bold text-[var(--color-accent-mint)] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-mint)] animate-pulse" />
              <span>{activeSession === 'tuesday' ? '● Currently viewing seat layout' : 'Click to select this session'}</span>
            </div>
          </div>
        </div>

        {/* Boardroom Arena Card */}
        <div className="pop-card p-6 sm:p-10 bg-[var(--bg-surface)] max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[var(--border-subtle)] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)]">
                  {sessionConfig.name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
                {sessionConfig.time} • People &amp; Spaces Conference Room
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="pop-badge mint text-xs font-bold">
                {spotsLeft} of 25 seats free
              </span>
            </div>
          </div>

          {/* Architectural Boardroom Arena Floor */}
          <div className="relative p-6 sm:p-10 rounded-3xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] shadow-inner overflow-hidden">
            {/* Ambient Room Lighting Cone from Projector */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-b from-blue-400/10 via-cyan-400/5 to-transparent pointer-events-none rounded-t-full blur-xl" />

            {/* Top Row: 4K Projection Screen + Entry Door */}
            <div className="relative flex items-center justify-between gap-4 mb-8">
              {/* Projection Screen Wall */}
              <div className="flex-1 p-3.5 rounded-2xl bg-slate-900 border-2 border-slate-700 text-white flex items-center justify-between px-5 shadow-lg">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="font-mono text-xs sm:text-sm font-black tracking-widest text-cyan-300">
                    MAIN 4K DISPLAY WALL
                  </span>
                </div>
                <span className="font-mono text-[0.65rem] sm:text-xs text-slate-400 hidden md:inline">
                  مركز سفراء العلم • LIVE STAGE
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>

              {/* Entrance Doorway */}
              <div
                className="p-3 rounded-2xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-surface)] text-center flex-shrink-0"
                title="Check in at reception desk, enter here"
              >
                <div className="font-mono text-[0.72rem] sm:text-xs font-black text-[var(--color-primary)]">
                  🚪 ENTRANCE
                </div>
                <div className="font-mono text-[0.6rem] text-[var(--text-muted)]">
                  Main Hall
                </div>
              </div>
            </div>

            {/* Moderator Lead Area */}
            <div className="relative flex flex-col items-center justify-center mb-6">
              <span className="font-mono text-[0.7rem] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider mb-1.5 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                Discussion Facilitator / Moderator
              </span>
              <button
                type="button"
                onClick={handleModeratorClick}
                className="group relative w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 border-2 border-[var(--border-color)] flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="Discussion Lead (Click 3 times to strike the Gavel!)"
              >
                <Crown className="w-6 h-6 text-slate-900 group-hover:rotate-12 transition-transform" />
                <span className="absolute -bottom-2 px-1.5 py-0.2 bg-slate-900 text-amber-300 font-mono text-[0.58rem] font-bold rounded-full">
                  LEAD
                </span>
              </button>
            </div>

            {/* Table Arena: Left Chairs + Central Conference Table + Right Chairs */}
            <div className="relative flex items-center justify-center gap-3 sm:gap-6 py-2">
              {/* Left Column Chairs (1 to 12) */}
              <div className="flex flex-col gap-2.5">
                {leftSeats.map(seatNum => {
                  const booked = currentRoster[seatNum];
                  const isSelected = selectedSeat === seatNum;

                  return (
                    <div key={seatNum} className="relative group">
                      <button
                        type="button"
                        onClick={() => handleSeatClick(seatNum)}
                        className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl border-2 flex items-center justify-center font-mono text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--color-primary)] text-white border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] scale-110 ring-4 ring-[var(--color-primary)]/30 z-20'
                            : booked
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-white border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:scale-110 active:scale-95'
                        }`}
                        title={booked ? `Reserved by ${booked.name}` : `Seat #${seatNum} (Click to select)`}
                      >
                        {/* Chair backrest pill visual */}
                        <span className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full border border-black/20 ${
                          isSelected ? 'bg-blue-300' : booked ? 'bg-slate-300' : 'bg-emerald-600'
                        }`} />
                        
                        {isSelected ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : booked ? (
                          <span className="text-[0.65rem]">{booked.initial}</span>
                        ) : (
                          <span>{seatNum}</span>
                        )}
                      </button>

                      {/* Tooltip on hover */}
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-30 pointer-events-none">
                        <span className="px-2 py-1 bg-slate-900 text-white text-[0.68rem] font-mono font-bold rounded-lg shadow-lg whitespace-nowrap">
                          {booked ? `🔒 Taken: ${booked.name}` : `✓ Seat #${seatNum} (Free)`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Central Conference Table Slab */}
              <div className="w-24 sm:w-36 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-2 border-[var(--border-color)] rounded-3xl shadow-[4px_4px_0px_var(--shadow-color)] p-3 relative flex flex-col justify-between items-center min-h-[560px]">
                {/* Conference Mic Hub Top */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[0.62rem] font-black uppercase text-[var(--text-main)]">
                    STAGE MIC
                  </span>
                </div>

                {/* Central Channel Strip with Conference Dots */}
                <div className="my-auto flex flex-col items-center gap-4 py-4">
                  <span className="font-mono text-[0.65rem] font-black tracking-widest text-[var(--color-primary)] opacity-70 [writing-mode:vertical-lr] rotate-180 uppercase">
                    TALKLAB ROUNDTABLE
                  </span>
                  <div className="w-1.5 h-16 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <div className="w-1.5 h-16 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="font-mono text-[0.65rem] font-black tracking-widest text-[var(--color-primary)] opacity-70 [writing-mode:vertical-lr] rotate-180 uppercase">
                    25 AMBITIOUS VOICES
                  </span>
                </div>

                {/* Conference Mic Hub Bottom */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="font-mono text-[0.62rem] font-black uppercase text-[var(--text-main)]">
                    REAR MIC
                  </span>
                </div>
              </div>

              {/* Right Column Chairs (14 to 25) */}
              <div className="flex flex-col gap-2.5">
                {rightSeats.map(seatNum => {
                  const booked = currentRoster[seatNum];
                  const isSelected = selectedSeat === seatNum;

                  return (
                    <div key={seatNum} className="relative group">
                      <button
                        type="button"
                        onClick={() => handleSeatClick(seatNum)}
                        className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl border-2 flex items-center justify-center font-mono text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--color-primary)] text-white border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] scale-110 ring-4 ring-[var(--color-primary)]/30 z-20'
                            : booked
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-white border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:scale-110 active:scale-95'
                        }`}
                        title={booked ? `Reserved by ${booked.name}` : `Seat #${seatNum} (Click to select)`}
                      >
                        {isSelected ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : booked ? (
                          <span className="text-[0.65rem]">{booked.initial}</span>
                        ) : (
                          <span>{seatNum}</span>
                        )}

                        {/* Chair backrest pill visual */}
                        <span className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full border border-black/20 ${
                          isSelected ? 'bg-blue-300' : booked ? 'bg-slate-300' : 'bg-emerald-600'
                        }`} />
                      </button>

                      {/* Tooltip on hover */}
                      <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-30 pointer-events-none">
                        <span className="px-2 py-1 bg-slate-900 text-white text-[0.68rem] font-mono font-bold rounded-lg shadow-lg whitespace-nowrap">
                          {booked ? `🔒 Taken: ${booked.name}` : `✓ Seat #${seatNum} (Free)`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-xs font-bold text-[var(--text-muted)] pt-1">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-lg bg-emerald-500 border-2 border-[var(--border-color)]" />
              <span>Available (Click Chair)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-lg bg-slate-300 dark:bg-slate-700 border border-slate-400" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-lg bg-[var(--color-primary)] border-2 border-[var(--border-color)]" />
              <span>Your Selected Seat</span>
            </div>
          </div>

          {/* Selection Banner & Booking Action */}
          <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-mono font-black text-lg shadow-sm">
                {selectedSeat ? `#${selectedSeat}` : '★'}
              </div>
              <div>
                <strong className="block text-sm text-[var(--text-main)]">
                  {selectedSeat ? `Seat #${selectedSeat} Selected` : 'No Seat Picked Yet'}
                </strong>
                <span className="text-xs text-[var(--text-muted)]">
                  {selectedSeat
                    ? `${sessionConfig.name} • 30 LYD at reception`
                    : 'Click any green chair above or book any available'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openBooking(selectedSeat, activeSession)}
              className="pop-btn pop-btn-primary pop-btn-lg w-full sm:w-auto px-8 btn-shimmer"
            >
              <span>{selectedSeat ? `Confirm Seat #${selectedSeat} (30 LYD)` : 'Book Any Seat (30 LYD)'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
