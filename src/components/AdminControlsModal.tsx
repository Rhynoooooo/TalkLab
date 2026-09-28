'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, ShieldCheck, CheckCircle2, UserPlus, RotateCcw, LogOut, Radio, AlertTriangle } from 'lucide-react';
import { SoundFX } from '@/lib/soundFx';
import { SESSIONS } from '@/lib/constants';

export default function AdminControlsModal() {
  const {
    isAdminModalOpen,
    closeAdminModal,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    bookedSeats,
    adminCheckIn,
    adminReleaseSeat,
    adminAssignSeat,
    adminResetSession
  } = useApp();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [adminSession, setAdminSession] = useState<'saturday' | 'tuesday'>('saturday');

  // Manual Assign Form
  const [manualSeat, setManualSeat] = useState<number>(1);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');

  if (!isAdminModalOpen) return null;

  const currentRoster = bookedSeats[adminSession];
  const occupiedSeatNums = Object.keys(currentRoster).map(Number).sort((a, b) => a - b);
  const totalOccupied = occupiedSeatNums.length;
  const totalCheckedIn = occupiedSeatNums.filter(num => currentRoster[num]?.checkedIn).length;
  const vacantCount = Math.max(0, 25 - totalOccupied);

  // Available seat numbers for manual assignment
  const emptySeatNums: number[] = [];
  for (let i = 1; i <= 25; i++) {
    if (!currentRoster[i]) emptySeatNums.push(i);
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const success = loginAdmin(pinInput);
    if (!success) {
      setPinError('Invalid passcode. (Hint: Try 7788 or TALKLAB)');
    } else {
      setPinInput('');
    }
  };

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    adminAssignSeat(adminSession, manualSeat, manualName, manualPhone || '+218 91 000 0000');
    setManualSuccess(`Assigned Seat #${manualSeat} to ${manualName}!`);
    setManualName('');
    setManualPhone('');
    setTimeout(() => setManualSuccess(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeAdminModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-3xl bg-[var(--bg-canvas)] border-[3px] border-[var(--border-color)] rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-gold-light)] border-2 border-[var(--border-color)] text-[var(--text-main)] flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_var(--shadow-color)]">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)]">
                  Moderator &amp; Facilitator Hub
                </h3>
                {isAdminAuthenticated && (
                  <span className="pop-badge coral text-[0.62rem] py-0.5">Admin Verified</span>
                )}
              </div>
              <p className="font-mono text-xs text-[var(--text-muted)]">
                People &amp; Spaces Venue Operations • Live Roster &amp; WhatsApp Bot
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAdminModal}
            className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border-2 border-[var(--border-color)] flex items-center justify-center font-bold hover:scale-105 active:scale-95"
            aria-label="Close admin modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN LOGIN SCREEN (If not authenticated) */}
        {!isAdminAuthenticated ? (
          <div className="py-6 max-w-md mx-auto text-center space-y-5">
            <span className="text-4xl block animate-bounce">🔐</span>
            <div>
              <h4 className="font-['Outfit'] font-black text-xl text-[var(--text-main)]">
                Facilitator Passcode Required
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Enter your moderator PIN to manage seats, verify check-ins, and control the WhatsApp dispatch engine.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter PIN (e.g. 7788)"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="w-full text-center font-['Space_Grotesk'] font-black text-2xl tracking-widest p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />

              {pinError && (
                <div className="text-xs font-bold text-[var(--color-accent-coral)]">
                  {pinError}
                </div>
              )}

              <button
                type="submit"
                className="pop-btn pop-btn-primary pop-btn-md w-full justify-center shadow-[3px_3px_0px_var(--shadow-color)]"
              >
                <span>Unlock Facilitator Portal</span>
              </button>

              <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[0.72rem] font-mono text-[var(--text-muted)] text-center">
                🔑 <strong>Facilitator Demo Passcode:</strong> <code className="font-bold text-[var(--color-primary)]">7788</code> or <code className="font-bold text-[var(--color-primary)]">TALKLAB</code>
              </div>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="space-y-6">
            {/* Top Bar: Session Switcher & Logout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--bg-surface)] p-2.5 rounded-2xl border-2 border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setAdminSession('saturday'); SoundFX.playPop(520); }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                    adminSession === 'saturday'
                      ? 'bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Saturday Immersion (12–4pm)
                </button>
                <button
                  type="button"
                  onClick={() => { setAdminSession('tuesday'); SoundFX.playPop(620); }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                    adminSession === 'tuesday'
                      ? 'bg-[var(--color-accent-coral)] text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Tuesday Twilight (4–7pm)
                </button>
              </div>

              <button
                type="button"
                onClick={logoutAdmin}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock Dashboard</span>
              </button>
            </div>

            {/* KPI Overview Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)]">
                <div className="font-['Outfit'] font-black text-2xl text-[var(--text-main)]">25</div>
                <div className="font-mono text-[0.65rem] font-bold text-[var(--text-muted)] uppercase">Total Seats</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)]">
                <div className="font-['Outfit'] font-black text-2xl text-[var(--color-primary)]">{totalOccupied}</div>
                <div className="font-mono text-[0.65rem] font-bold text-[var(--text-muted)] uppercase">Reserved Seats</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)]">
                <div className="font-['Outfit'] font-black text-2xl text-[var(--color-accent-mint)]">{totalCheckedIn}</div>
                <div className="font-mono text-[0.65rem] font-bold text-[var(--text-muted)] uppercase">Paid &amp; Checked-in</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)]">
                <div className="font-['Outfit'] font-black text-2xl text-[var(--color-accent-coral)]">{vacantCount}</div>
                <div className="font-mono text-[0.65rem] font-bold text-[var(--text-muted)] uppercase">Open Seats</div>
              </div>
            </div>

            {/* Live Attendee Roster Table */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <h4 className="font-['Outfit'] font-black text-base text-[var(--text-main)]">
                  Live Attendance &amp; Check-In ({SESSIONS[adminSession].name})
                </h4>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  Fee: 30 LYD at Door
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {occupiedSeatNums.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[var(--text-muted)]">
                    No seats currently reserved for this session.
                  </div>
                ) : (
                  occupiedSeatNums.map(seatNum => {
                    const seat = currentRoster[seatNum];
                    const isPaid = !!seat.checkedIn;

                    return (
                      <div
                        key={seatNum}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isPaid
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400'
                            : 'bg-[var(--bg-canvas)] border-[var(--border-color)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white font-mono text-xs font-black flex items-center justify-center flex-shrink-0">
                            #{seatNum}
                          </span>
                          <div>
                            <div className="font-extrabold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                              <span>{seat.name}</span>
                              {isPaid && (
                                <span className="font-mono text-[0.62rem] font-black px-1.5 py-0.2 bg-emerald-600 text-white rounded-md">
                                  PAID 30 LYD
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[0.7rem] text-[var(--text-muted)]">
                              {seat.phone || 'Phone verified via WhatsApp'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => adminCheckIn(adminSession, seatNum)}
                            className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                              isPaid
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)] hover:border-emerald-500'
                            }`}
                          >
                            {isPaid ? '✓ Checked In' : 'Mark Paid (30 LYD)'}
                          </button>

                          <button
                            type="button"
                            onClick={() => adminReleaseSeat(adminSession, seatNum)}
                            className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                            title="Release seat"
                          >
                            ✕ Release
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Walk-In / VIP Seat Assign Form */}
            {emptySeatNums.length > 0 && (
              <form onSubmit={handleManualAssign} className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] space-y-3">
                <div className="flex items-center gap-2 font-['Outfit'] font-black text-sm text-[var(--text-main)]">
                  <UserPlus className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>Manual Walk-In or VIP Seat Assignment</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={manualSeat}
                    onChange={e => setManualSeat(Number(e.target.value))}
                    className="p-2 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] font-mono text-xs font-bold text-[var(--text-main)]"
                  >
                    {emptySeatNums.map(n => (
                      <option key={n} value={n}>Assign Seat #{n}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    required
                    placeholder="Guest Name (e.g. Youssef K.)"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    className="p-2 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] text-xs font-bold text-[var(--text-main)]"
                  />

                  <input
                    type="tel"
                    placeholder="Phone (Optional)"
                    value={manualPhone}
                    onChange={e => setManualPhone(e.target.value)}
                    className="p-2 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] text-xs font-bold text-[var(--text-main)]"
                  />
                </div>

                {manualSuccess && (
                  <div className="text-xs font-bold text-emerald-600">
                    {manualSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="pop-btn pop-btn-primary pop-btn-sm"
                >
                  <span>Lock In Walk-In Seat</span>
                </button>
              </form>
            )}

            {/* WhatsApp OpenWA Engine Status Card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
                <div>
                  <div className="font-extrabold text-xs sm:text-sm text-[var(--text-main)]">
                    OpenWA WhatsApp Engine Proxy
                  </div>
                  <div className="font-mono text-[0.68rem] text-[var(--text-muted)]">
                    Target: http://127.0.0.1:2785 • Dispatches OTPs &amp; Boarding Passes
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="pop-badge mint text-[0.65rem] py-0.5">
                  🟢 Ready for Dispatch
                </span>
                <button
                  type="button"
                  onClick={() => adminResetSession(adminSession)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[var(--color-accent-coral)] border border-[var(--color-accent-coral)] rounded-lg hover:bg-rose-50"
                  title="Reset session to default layout"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Session</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
