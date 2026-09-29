'use client';

import React, { useState, useEffect } from 'react';
import { DEFAULT_POLL_OPTIONS } from '@/lib/constants';
import { PollOption } from '@/lib/types';
import { SoundFX } from '@/lib/soundFx';
import { Vote, CheckCircle2, ShieldCheck, BarChart3 } from 'lucide-react';

const STORAGE_KEY_VOTES = 'talklab_poll_votes_v2';
const STORAGE_KEY_USER_PICK = 'talklab_poll_user_voted_id_v2';

export default function CommunityPoll() {
  const [options, setOptions] = useState<PollOption[]>(DEFAULT_POLL_OPTIONS);
  const [userVotedId, setUserVotedId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedVotes = localStorage.getItem(STORAGE_KEY_VOTES);
      if (savedVotes) {
        const parsed = JSON.parse(savedVotes);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_POLL_OPTIONS.length) {
          setOptions(parsed);
        }
      }

      const savedPick = localStorage.getItem(STORAGE_KEY_USER_PICK);
      if (savedPick) {
        setUserVotedId(parseInt(savedPick, 10));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const totalVotes = options.reduce((acc, o) => acc + o.votes, 0);

  const handleVote = (id: number) => {
    if (userVotedId !== null) {
      SoundFX.playBuzzer();
      return;
    }

    SoundFX.playPop(620);
    const updated = options.map(opt => (opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt));
    setOptions(updated);
    setUserVotedId(id);

    localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_USER_PICK, String(id));
  };

  return (
    <section className="py-16 sm:py-24 border-t-[2.5px] border-[var(--border-color)] bg-[var(--bg-canvas)]" id="dashboard">
      <div className="tl-container max-w-3xl">
        <div className="text-center space-y-4 mb-12">
          <span className="pop-badge gold inline-flex items-center gap-1.5">
            <Vote className="w-3.5 h-3.5" />
            <span>Community Voice</span>
          </span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)] tracking-tight">
            Vote On Next Weekend&apos;s Debate
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            At TalkLab, our community decides what hits the roundtable floor. Cast your live vote below to shape Saturday&apos;s headline topic!
          </p>
        </div>

        <div className="pop-card p-6 sm:p-10 bg-[var(--bg-surface)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="pop-badge coral text-xs font-bold">Active Live Poll</span>
            </div>
            <span className="font-mono text-xs sm:text-sm font-black text-[var(--text-muted)] flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{totalVotes} Total Votes</span>
            </span>
          </div>

          <div className="space-y-3.5">
            {options.map(opt => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isSelected = userVotedId === opt.id;
              const hasVoted = userVotedId !== null;

              return (
                <div
                  key={opt.id}
                  onClick={() => !hasVoted && handleVote(opt.id)}
                  className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border-2 transition-all select-none ${
                    hasVoted ? 'cursor-default' : 'cursor-pointer hover:border-[var(--color-primary)] hover:scale-[1.01]'
                  } ${
                    isSelected
                      ? 'border-[var(--color-primary)] shadow-[3px_3px_0px_var(--shadow-color)] bg-[var(--bg-surface)]'
                      : 'border-slate-300 dark:border-slate-700 bg-[var(--bg-surface-elevated)]'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                >
                  {/* Background Progress Fill */}
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-700 pointer-events-none ${
                      isSelected
                        ? 'bg-[var(--color-primary)]/15 border-r-2 border-[var(--color-primary)]'
                        : 'bg-slate-300/30 dark:bg-slate-700/30'
                    }`}
                    style={{ width: `${pct}%` }}
                  />

                  {/* Foreground Content */}
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                          : 'border-slate-400 bg-white dark:bg-slate-900'
                      }`}>
                        {isSelected && <span className="text-xs font-black">✓</span>}
                      </div>
                      <span
                        className={`text-sm sm:text-base font-extrabold ${
                          isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--text-main)]'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isSelected && (
                        <span className="pop-badge mint text-[0.68rem] py-0.5 px-2 hidden sm:inline-block">
                          Your Vote
                        </span>
                      )}
                      <div className="font-mono text-base sm:text-lg font-black text-[var(--color-primary)]">
                        {pct}% <span className="text-xs text-[var(--text-muted)] font-normal font-sans">({opt.votes})</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Banner */}
          {userVotedId !== null ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Your vote is confirmed! You helped decide this weekend&apos;s Oxford debate topic.</span>
            </div>
          ) : (
            <div className="text-center font-mono text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>One vote per member • Anti-spam protected • Results sync live</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
