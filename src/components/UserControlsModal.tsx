'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Ticket, Award, BarChart3, User, Calendar, Trash2, CheckCircle2 } from 'lucide-react';
import { SoundFX } from '@/lib/soundFx';

export default function UserControlsModal() {
  const {
    isUserDashboardOpen,
    closeUserDashboard,
    userBookings,
    cancelUserBooking,
    userProfile,
    updateProfileName,
    openBooking
  } = useApp();

  const [activeTab, setActiveTab] = useState<'passes' | 'metrics' | 'badges' | 'profile'>('passes');
  const [editName, setEditName] = useState(userProfile.name);
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isUserDashboardOpen) return null;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileName(editName, editPhone);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const downloadCalendarFile = (booking: typeof userBookings[0]) => {
    SoundFX.playPop(620);
    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TalkLab//English Conversation Club//EN
BEGIN:VEVENT
SUMMARY:TalkLab - ${booking.sessionName} (Seat #${booking.seatNumber})
DESCRIPTION:Tripoli's English Conversation Club at People & Spaces (مركز سفراء العلم). Fee: 30 LYD at door.
LOCATION:مركز سفراء العلم (People & Spaces), Hay Al-Andalus, Tripoli, Libya
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TalkLab-${booking.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeUserDashboard}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl bg-[var(--bg-canvas)] border-[3px] border-[var(--border-color)] rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center font-['Outfit'] font-black text-xl shadow-[2px_2px_0px_var(--shadow-color)]">
              {userProfile.name.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Outfit'] font-black text-xl sm:text-2xl text-[var(--text-main)]">
                  {userProfile.name}
                </h3>
                <span className="pop-badge mint text-[0.62rem] py-0.5">Active Member</span>
              </div>
              <p className="font-mono text-xs text-[var(--text-muted)]">
                {userProfile.level} • {userProfile.speakingHours} speaking hours
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeUserDashboard}
            className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border-2 border-[var(--border-color)] flex items-center justify-center font-bold hover:scale-105 active:scale-95"
            aria-label="Close user dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-2xl">
          <button
            type="button"
            onClick={() => { setActiveTab('passes'); SoundFX.playPop(520); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'passes'
                ? 'bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>My Passes ({userBookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('metrics'); SoundFX.playPop(560); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'metrics'
                ? 'bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Fluency Scores</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('badges'); SoundFX.playPop(600); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'badges'
                ? 'bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Badges</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('profile'); SoundFX.playPop(640); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {/* TAB 1: PASSES & TICKET WALLET */}
        {activeTab === 'passes' && (
          <div className="space-y-4">
            {userBookings.length === 0 ? (
              <div className="p-8 text-center bg-[var(--bg-surface)] border-2 border-dashed border-[var(--border-color)] rounded-2xl space-y-3">
                <span className="text-3xl block">🎟️</span>
                <h4 className="font-['Outfit'] font-black text-lg text-[var(--text-main)]">
                  No active session passes
                </h4>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  You don&apos;t have any reserved seats yet. Grab a chair at the Saturday or Tuesday roundtable!
                </p>
                <button
                  type="button"
                  onClick={() => { closeUserDashboard(); openBooking(); }}
                  className="pop-btn pop-btn-primary pop-btn-sm"
                >
                  <span>Book Session (30 LYD)</span>
                </button>
              </div>
            ) : (
              userBookings.map(b => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] space-y-3"
                >
                  <div className="flex items-start justify-between border-b border-dashed border-[var(--border-color)] pb-3">
                    <div>
                      <span className="font-mono text-[0.62rem] uppercase font-black text-[var(--text-muted)] block">
                        Confirmed Boarding Pass
                      </span>
                      <h4 className="font-['Outfit'] font-black text-lg text-[var(--color-primary)]">
                        {b.sessionName}
                      </h4>
                      <p className="font-mono text-xs font-bold text-[var(--text-main)]">
                        {b.day} • {b.time}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-[0.62rem] uppercase font-black text-[var(--text-muted)] block">
                        Your Seat
                      </span>
                      <span className="font-['Outfit'] font-black text-2xl text-[var(--color-accent-coral)]">
                        #{b.seatNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="text-[var(--text-muted)]">
                      Pass ID: <strong className="text-[var(--text-main)]">{b.id}</strong> • Fee: <strong className="text-[var(--color-accent-mint)]">30 LYD</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadCalendarFile(b)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-main)] font-bold hover:scale-105 transition-transform"
                      >
                        <Calendar className="w-3 h-3 text-[var(--color-primary)]" />
                        <span>Add to Calendar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cancelUserBooking(b.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 text-red-600 dark:text-red-400 font-bold hover:bg-red-100"
                        title="Release this seat"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: FLUENCY SCORES & STATS */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)]">
                <div className="font-['Outfit'] font-black text-2xl text-[var(--color-primary)]">{userProfile.speakingHours}h</div>
                <div className="font-mono text-[0.65rem] font-bold text-[var(--text-muted)] uppercase">Speaking Time</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)]">
                <div className="font-['Outfit'] font-black text-2xl text-[var(--color-accent-gold-dark)]">{userProfile.sessionsAttended}</div>
                <div className="font-mono text-[0.65rem] font-bold text-[var(--text-muted)] uppercase">Sessions Joined</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)]">
                <div className="font-['Outfit'] font-black text-2xl text-[var(--color-accent-coral)]">{userProfile.activeStreak}🔥</div>
                <div className="font-mono text-[0.65rem] font-bold text-[var(--text-muted)] uppercase">Weekly Streak</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)]">
                <div className="font-['Outfit'] font-black text-2xl text-[var(--color-accent-mint)]">{userProfile.xpPoints}</div>
                <div className="font-mono text-[0.65rem] font-bold text-[var(--text-muted)] uppercase">Arcade XP</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] space-y-4">
              <h4 className="font-['Outfit'] font-black text-base text-[var(--text-main)]">
                Fluency Dimensions (Peer Assessed)
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold font-mono mb-1">
                    <span>Social Confidence &amp; Ease</span>
                    <span className="text-[var(--color-primary)]">{userProfile.fluencyScores.confidence}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] overflow-hidden">
                    <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${userProfile.fluencyScores.confidence}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold font-mono mb-1">
                    <span>Spontaneous Speaking Reflex</span>
                    <span className="text-[var(--color-accent-gold-dark)]">{userProfile.fluencyScores.spontaneity}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] overflow-hidden">
                    <div className="h-full bg-[var(--color-accent-gold)] rounded-full" style={{ width: `${userProfile.fluencyScores.spontaneity}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold font-mono mb-1">
                    <span>Active Listening &amp; Flow</span>
                    <span className="text-[var(--color-accent-mint)]">{userProfile.fluencyScores.activeListening}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] overflow-hidden">
                    <div className="h-full bg-[var(--color-accent-mint)] rounded-full" style={{ width: `${userProfile.fluencyScores.activeListening}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold font-mono mb-1">
                    <span>Modern Idiom &amp; Slang Nuance</span>
                    <span className="text-[var(--color-accent-coral)]">{userProfile.fluencyScores.vocabulary}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] overflow-hidden">
                    <div className="h-full bg-[var(--color-accent-coral)] rounded-full" style={{ width: `${userProfile.fluencyScores.vocabulary}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BADGES */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userProfile.badges.map(b => (
              <div
                key={b.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                  b.unlocked
                    ? 'bg-[var(--bg-surface)] border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)]'
                    : 'bg-[var(--bg-canvas)] border-dashed border-neutral-400 opacity-60'
                }`}
              >
                <span className="text-3xl flex-shrink-0">{b.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="font-['Outfit'] font-black text-sm text-[var(--text-main)]">
                      {b.title}
                    </strong>
                    {b.unlocked && <span className="text-xs text-[var(--color-accent-mint)]">✓</span>}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-0.5">
                    {b.desc}
                  </p>
                  <span className="font-mono text-[0.62rem] font-bold uppercase mt-1 block text-[var(--color-primary)]">
                    {b.unlocked ? 'Unlocked' : 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block font-mono text-xs font-black uppercase text-[var(--text-muted)] mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] font-bold text-sm text-[var(--text-main)] shadow-[2px_2px_0px_var(--shadow-color)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-black uppercase text-[var(--text-muted)] mb-1">
                WhatsApp Phone
              </label>
              <input
                type="tel"
                required
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] font-bold text-sm text-[var(--text-main)] shadow-[2px_2px_0px_var(--shadow-color)]"
              />
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <button
              type="submit"
              className="pop-btn pop-btn-primary pop-btn-md w-full justify-center"
            >
              <span>Save Profile Changes</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
