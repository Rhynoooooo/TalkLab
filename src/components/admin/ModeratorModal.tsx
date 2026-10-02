'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  ShieldCheck,
  UserPlus,
  RotateCcw,
  LogOut,
  Radio,
  AlertTriangle,
  Lock,
  Send,
  Loader2,
  Vote,
  Save,
  Sliders,
  MessageSquare,
  Users,
  Clock
} from 'lucide-react';
import { SoundFX } from '@/lib/soundFx';
import { SESSIONS, DEFAULT_POLL_OPTIONS } from '@/lib/constants';

interface PollManagerTabProps {
  pollState: import('@/lib/poll/store').PollState | null;
  adminResetPoll: () => Promise<{ success: boolean; error?: string; archived?: unknown }>;
  adminUpdatePoll: (updates: {
    title?: string;
    subtitle?: string;
    isActive?: boolean;
    options?: Array<{ id: number; text: string; votes?: number }>;
  }) => Promise<{ success: boolean; error?: string }>;
  resetUserPollVote: () => void;
}

function PollManagerTab({
  pollState,
  adminResetPoll,
  adminUpdatePoll,
  resetUserPollVote
}: PollManagerTabProps) {
  const [pollTitle, setPollTitle] = useState(
    pollState?.title || "Vote On Next Weekend's Debate"
  );
  const [pollSubtitle, setPollSubtitle] = useState(
    pollState?.subtitle ||
      "At TalkLab, our community decides what hits the roundtable floor. Cast your live vote below to shape Saturday's headline topic!"
  );
  const [pollIsActive, setPollIsActive] = useState(pollState?.isActive !== false);
  const [pollOptions, setPollOptions] = useState<Array<{ id: number; text: string; votes: number }>>(
    pollState?.options
      ? pollState.options.map(o => ({ ...o }))
      : DEFAULT_POLL_OPTIONS.map(o => ({ ...o }))
  );
  const [pollSaving, setPollSaving] = useState(false);
  const [pollFeedback, setPollFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const [showPollResetConfirm, setShowPollResetConfirm] = useState(false);
  const [isPollResetting, setIsPollResetting] = useState(false);

  const handleSavePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setPollSaving(true);
    setPollFeedback(null);

    const result = await adminUpdatePoll({
      title: pollTitle,
      subtitle: pollSubtitle,
      isActive: pollIsActive,
      options: pollOptions
    });

    setPollSaving(false);

    if (result.success) {
      setPollFeedback({
        text: '✓ Live debate poll configuration updated and synchronized across all member devices!'
      });
      setTimeout(() => setPollFeedback(null), 4000);
    } else {
      setPollFeedback({
        text: result.error || 'Failed to update poll configuration',
        error: true
      });
    }
  };

  const handleExecutePollReset = async () => {
    setIsPollResetting(true);
    setPollFeedback(null);

    const result = await adminResetPoll();
    setIsPollResetting(false);
    setShowPollResetConfirm(false);

    if (result.success) {
      setPollFeedback({
        text: '✓ Poll votes have been permanently archived to data/poll-archives.json and all options reset to 0 votes!'
      });
      setTimeout(() => setPollFeedback(null), 5000);
    } else {
      setPollFeedback({
        text: result.error || 'Failed to reset poll',
        error: true
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Poll Reset Banner */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Outfit'] font-black text-lg text-[var(--text-main)]">
                Live Debate Poll Control Center
              </span>
              <span className={`pop-badge ${pollIsActive ? 'mint' : 'outline'} text-[0.62rem] py-0.5`}>
                {pollIsActive ? 'Accepting Live Votes' : 'Voting Paused / Closed'}
              </span>
            </div>
            <p className="font-mono text-xs text-[var(--text-muted)] mt-0.5">
              Current tally: {pollState?.totalVotes ?? 0} total community votes
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={resetUserPollVote}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] hover:border-[var(--color-primary)] text-[var(--text-main)] flex items-center gap-1 transition-all cursor-pointer"
              title="Clear your local member vote so you can test casting another vote"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Reset My Local Vote</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPollResetConfirm(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 hover:bg-rose-100 transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Poll to 0</span>
            </button>
          </div>
        </div>

        {/* DOUBLE CONFIRMATION FOR POLL RESET */}
        {showPollResetConfirm && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 dark:border-rose-700 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-['Outfit'] font-black text-sm text-rose-900 dark:text-rose-200">
                  Confirm Permanent Poll Reset
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                  This will reset all 4 option vote counts to <strong>0</strong> and reset the community vote tally.
                  Current results ({pollState?.totalVotes ?? 0} votes) will be automatically archived into <code>data/poll-archives.json</code> with a moderator timestamp.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200 dark:border-rose-800">
              <button
                type="button"
                disabled={isPollResetting}
                onClick={() => setShowPollResetConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPollResetting}
                onClick={handleExecutePollReset}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPollResetting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Archiving &amp; Resetting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Zero All Votes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Poll Status Switch */}
        <div className="flex items-center justify-between bg-[var(--bg-canvas)] p-3 rounded-xl border border-[var(--border-color)]">
          <div>
            <div className="font-bold text-xs text-[var(--text-main)]">
              Accepting Member Votes
            </div>
            <div className="text-[0.7rem] text-[var(--text-muted)]">
              Toggle off to freeze voting and display final debate winners
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPollIsActive(!pollIsActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              pollIsActive ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
            role="switch"
            aria-checked={pollIsActive}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                pollIsActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* EDIT POLL QUESTION & TOPICS FORM */}
      <form onSubmit={handleSavePoll} className="p-4 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2 font-['Outfit'] font-black text-base text-[var(--text-main)]">
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>Edit Poll Question &amp; Options</span>
          </div>
          <span className="font-mono text-[0.7rem] text-[var(--text-muted)]">
            Syncs immediately to homepage
          </span>
        </div>

        {/* Question Title */}
        <div className="space-y-1">
          <label className="font-mono text-xs font-bold text-[var(--text-main)]">
            Poll Headline Title
          </label>
          <input
            type="text"
            required
            value={pollTitle}
            onChange={e => setPollTitle(e.target.value)}
            placeholder="Vote On Next Weekend's Debate"
            className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] text-sm font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Question Subtitle */}
        <div className="space-y-1">
          <label className="font-mono text-xs font-bold text-[var(--text-main)]">
            Poll Description / Prompt
          </label>
          <textarea
            rows={2}
            value={pollSubtitle}
            onChange={e => setPollSubtitle(e.target.value)}
            placeholder="At TalkLab, our community decides what hits the roundtable floor..."
            className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border-2 border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* 4 Debate Options Editor */}
        <div className="space-y-3 pt-2">
          <label className="font-mono text-xs font-bold text-[var(--text-main)] block">
            Debate Topics &amp; Vote Overrides (4 Options)
          </label>

          {pollOptions.map((opt, idx) => (
            <div
              key={opt.id}
              className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <span className="w-6 h-6 rounded-md bg-[var(--color-primary)] text-white font-mono text-xs font-black flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>

              <input
                type="text"
                required
                value={opt.text}
                onChange={e => {
                  const updated = [...pollOptions];
                  updated[idx].text = e.target.value;
                  setPollOptions(updated);
                }}
                placeholder={`Debate Option #${idx + 1}`}
                className="flex-1 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)]"
              />

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-mono text-[0.7rem] text-[var(--text-muted)]">Votes:</span>
                <input
                  type="number"
                  min={0}
                  value={opt.votes}
                  onChange={e => {
                    const updated = [...pollOptions];
                    updated[idx].votes = Math.max(0, parseInt(e.target.value, 10) || 0);
                    setPollOptions(updated);
                  }}
                  className="w-16 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] font-mono text-xs font-black text-center text-[var(--color-primary)]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Poll Feedback Message */}
        {pollFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              pollFeedback.error
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{pollFeedback.text}</span>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={pollSaving}
            className="pop-btn pop-btn-primary pop-btn-md flex items-center gap-2 shadow-[2px_2px_0px_var(--shadow-color)] disabled:opacity-50 cursor-pointer"
          >
            {pollSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes to Live Poll</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ModeratorModal() {
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
    adminResetSession,
    pollState,
    adminResetPoll,
    adminUpdatePoll,
    resetUserPollVote,
    refreshPoll
  } = useApp();

  // Authentication State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'roster' | 'poll' | 'whatsapp'>('roster');

  // Boardroom Session Selection
  const [adminSession, setAdminSession] = useState<'saturday' | 'tuesday'>('saturday');

  // Manual Walk-in / VIP Assign Form
  const [manualSeat, setManualSeat] = useState<number>(1);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');

  // WhatsApp Dispatch State
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [waStatus, setWaStatus] = useState<{ loading: boolean; text: string; error?: boolean }>({
    loading: false,
    text: ''
  });

  // Session Reset State
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ text: string; error?: boolean } | null>(null);

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

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim() || isSubmitting) return;

    setPinError('');
    setIsSubmitting(true);

    const result = await loginAdmin(pinInput);
    setIsSubmitting(false);

    if (result.success) {
      setPinInput('');
      setPinError('');
      setRemainingAttempts(null);
      setIsLockedOut(false);
      refreshPoll();
    } else {
      setPinError(result.error || 'Authentication rejected by security policy');
      if (result.remainingAttempts !== undefined) {
        setRemainingAttempts(result.remainingAttempts);
      }
      if (result.lockedOut) {
        setIsLockedOut(true);
      }
    }
  };

  const handleManualAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    await adminAssignSeat(adminSession, manualSeat, manualName, manualPhone || '+218 91 000 0000');
    setManualSuccess(`✓ Assigned Seat #${manualSeat} to ${manualName}!`);
    setManualName('');
    setManualPhone('');
    setTimeout(() => setManualSuccess(''), 2500);
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);
    setResetFeedback(null);
    const result = await adminResetSession(adminSession);
    setIsResetting(false);

    if (result.success) {
      setShowResetConfirm(false);
      setResetFeedback({
        text: `✓ Session "${adminSession === 'saturday' ? 'Saturday Immersion' : 'Tuesday Twilight'}" roster has been archived and reset to pristine empty state!`
      });
      setTimeout(() => setResetFeedback(null), 5000);
    } else {
      setResetFeedback({
        text: result.error || 'Failed to reset session roster',
        error: true
      });
    }
  };

  // WhatsApp Dispatch Handler
  const handleSendWhatsAppNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waPhone.trim() || !waMessage.trim() || waStatus.loading) return;

    setWaStatus({ loading: true, text: 'Dispatching via OpenWA Engine...' });

    try {
      const res = await fetch('/api/admin/whatsapp/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: waPhone,
          text: waMessage,
          type: 'facilitator_direct_message'
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setWaStatus({
          loading: false,
          text: data.simulated
            ? '✓ WhatsApp simulated dispatch recorded (OpenWA engine standby)'
            : '✓ WhatsApp message successfully delivered!'
        });
        setWaMessage('');
        setTimeout(() => setWaStatus({ loading: false, text: '' }), 4000);
      } else {
        setWaStatus({
          loading: false,
          text: data.error || 'WhatsApp dispatch failed',
          error: true
        });
      }
    } catch {
      setWaStatus({
        loading: false,
        text: 'Network error connecting to WhatsApp dispatch endpoint',
        error: true
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeAdminModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-3xl bg-[var(--bg-canvas)] border-[3px] border-[var(--border-color)] rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
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
                  <span className="pop-badge mint text-[0.62rem] py-0.5 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Admin Verified
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-[var(--text-muted)]">
                People &amp; Spaces Venue Operations • Live Roster, Community Poll &amp; Dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAdminModal}
            className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border-2 border-[var(--border-color)] flex items-center justify-center font-bold hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Close admin modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SECURE SERVER-SIDE PIN LOGIN SCREEN */}
        {!isAdminAuthenticated ? (
          <div className="py-6 max-w-md mx-auto text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)]">
              <Lock className="w-8 h-8 text-[var(--color-primary)]" />
            </div>

            <div>
              <h4 className="font-['Outfit'] font-black text-xl text-[var(--text-main)]">
                Facilitator Passcode Required
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Enter your authorized facilitator passcode. Verified server-side with constant-time
                evaluation, rate-limiting, and RBAC session issuance.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  autoFocus
                  disabled={isSubmitting || isLockedOut}
                  placeholder="Enter Passcode"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="w-full text-center font-['Space_Grotesk'] font-black text-2xl tracking-widest p-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
                />
              </div>

              {/* Error & Rate Limit Alerts */}
              {pinError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-300 flex items-center gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div>{pinError}</div>
                    {remainingAttempts !== null && remainingAttempts > 0 && (
                      <div className="font-mono text-[0.68rem] text-red-500 mt-0.5">
                        Security notice: {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining before lockout.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isLockedOut && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Brute-force defense active. Temporary lockout enforced.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isLockedOut || !pinInput.trim()}
                className="pop-btn pop-btn-primary pop-btn-md w-full justify-center shadow-[3px_3px_0px_var(--shadow-color)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <span>Unlock Facilitator Portal</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[0.7rem] font-mono text-[var(--text-muted)]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by constant-time verification &amp; HttpOnly JWT cookies</span>
              </div>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED FACILITATOR DASHBOARD */
          <div className="space-y-6">
            {/* Top Navigation Tabs & Lock Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--bg-surface)] p-2 rounded-2xl border-2 border-[var(--border-color)]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('roster');
                    SoundFX.playPop(520);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'roster'
                      ? 'bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Seats &amp; Roster</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('poll');
                    SoundFX.playPop(620);
                    refreshPoll();
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'poll'
                      ? 'bg-amber-500 text-slate-950 shadow-[2px_2px_0px_var(--shadow-color)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>Debate Poll Controls</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('whatsapp');
                    SoundFX.playPop(580);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Dispatch</span>
                </button>
              </div>

              <button
                type="button"
                onClick={logoutAdmin}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock Dashboard</span>
              </button>
            </div>

            {/* TAB 1: BOARDROOM SEATS & ROSTER */}
            {activeTab === 'roster' && (
              <div className="space-y-6">
                {/* Session Selector */}
                <div className="flex items-center justify-between bg-[var(--bg-surface)] p-2.5 rounded-xl border border-[var(--border-color)]">
                  <span className="font-mono text-xs font-black text-[var(--text-muted)] uppercase">
                    Select Target Session:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminSession('saturday');
                        SoundFX.playPop(520);
                      }}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        adminSession === 'saturday'
                          ? 'bg-[var(--color-primary)] text-white shadow-xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      Saturday Immersion (12–4pm)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminSession('tuesday');
                        SoundFX.playPop(620);
                      }}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        adminSession === 'tuesday'
                          ? 'bg-[var(--color-accent-coral)] text-white shadow-xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      Tuesday Twilight (4–7pm)
                    </button>
                  </div>
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
                        No seats currently reserved for this session. Roster is clear.
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
                                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
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
                                className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
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
                      className="pop-btn pop-btn-primary pop-btn-sm cursor-pointer"
                    >
                      <span>Lock In Walk-In Seat</span>
                    </button>
                  </form>
                )}

                {/* Reset Session Roster Trigger */}
                <div className="pt-2 flex items-center justify-between border-t border-[var(--border-color)]">
                  <div className="text-xs text-[var(--text-muted)]">
                    Resetting archives all current reservations to disk before clearing the boardroom floor.
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 border-2 border-rose-300 dark:border-rose-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Session Roster</span>
                  </button>
                </div>

                {/* Reset Feedback Notification */}
                {resetFeedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                      resetFeedback.error
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-300'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>{resetFeedback.text}</span>
                  </div>
                )}

                {/* Session Reset Confirmation Dialog */}
                {showResetConfirm && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 dark:border-rose-700 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-['Outfit'] font-black text-sm text-rose-900 dark:text-rose-200">
                          Confirm Session Reset &amp; Roster Archival
                        </h4>
                        <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                          Are you sure you want to reset <strong>{adminSession === 'saturday' ? 'Saturday Immersion' : 'Tuesday Twilight'}</strong>?
                          All 25 seats will be flushed back to empty. The existing roster ({totalOccupied} booked seats) will be permanently archived with timestamps.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200 dark:border-rose-800">
                      <button
                        type="button"
                        disabled={isResetting}
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={isResetting}
                        onClick={handleExecuteReset}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isResetting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Archiving &amp; Flushing...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Confirm &amp; Archive Session</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: COMMUNITY POLL MANAGEMENT & EDITOR */}
            {activeTab === 'poll' && (
              <PollManagerTab
                key={pollState?.version ?? 0}
                pollState={pollState}
                adminResetPoll={adminResetPoll}
                adminUpdatePoll={adminUpdatePoll}
                resetUserPollVote={resetUserPollVote}
              />
            )}

            {/* TAB 3: WHATSAPP DISPATCH & ALERTS */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6">
                <form onSubmit={handleSendWhatsAppNotification} className="p-4 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                    <div className="flex items-center gap-2 font-['Outfit'] font-black text-base text-[var(--text-main)]">
                      <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span>Direct WhatsApp Dispatch (OpenWA Engine)</span>
                    </div>
                    <span className="pop-badge mint text-[0.62rem] py-0.5">
                      Proxy Authenticated
                    </span>
                  </div>

                  {/* Preset Dispatch Templates */}
                  <div className="space-y-1.5">
                    <span className="font-mono text-[0.7rem] font-bold text-[var(--text-muted)] uppercase">
                      Quick Message Templates:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setWaMessage(
                            '🎟️ [TalkLab Boarding Pass] Your roundtable seat is confirmed for Saturday 12:00 PM at People & Spaces (مركز سفراء العلم). See you there!'
                          )
                        }
                        className="px-2.5 py-1 text-[0.7rem] font-mono rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-[var(--color-primary)] text-[var(--text-main)] cursor-pointer"
                      >
                        Boarding Pass Reminder
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setWaMessage(
                            "🔥 [TalkLab Topic Alert] This weekend's Oxford Fishbowl debate topic has been locked in by popular vote! Review notes before kick-off."
                          )
                        }
                        className="px-2.5 py-1 text-[0.7rem] font-mono rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-[var(--color-primary)] text-[var(--text-main)] cursor-pointer"
                      >
                        Debate Topic Reveal
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setWaMessage(
                            '⏰ [1 Hour Reminder] TalkLab starts in 60 minutes! Head down to Hay Al-Andalus, Tripoli. Fresh coffee awaits at the in-house cafe.'
                          )
                        }
                        className="px-2.5 py-1 text-[0.7rem] font-mono rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-[var(--color-primary)] text-[var(--text-main)] cursor-pointer"
                      >
                        1-Hour Arrival Notice
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="tel"
                      required
                      placeholder="Attendee Phone (+218 91...)"
                      value={waPhone}
                      onChange={e => setWaPhone(e.target.value)}
                      className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-xs font-mono font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Direct message or boarding reminder"
                      value={waMessage}
                      onChange={e => setWaMessage(e.target.value)}
                      className="p-2.5 sm:col-span-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {waStatus.text && (
                    <div
                      className={`text-xs font-bold ${
                        waStatus.error ? 'text-red-500' : 'text-emerald-600'
                      }`}
                    >
                      {waStatus.text}
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="submit"
                      disabled={waStatus.loading || !waPhone.trim() || !waMessage.trim()}
                      className="pop-btn pop-btn-secondary pop-btn-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {waStatus.loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Dispatch WhatsApp Message</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { ModeratorModal };
