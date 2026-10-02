'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DEFAULT_POLL_OPTIONS } from '@/lib/constants';
import { Vote, CheckCircle2, ShieldCheck, BarChart3, AlertCircle } from 'lucide-react';

export default function CommunityPoll() {
  const { pollState, userVotedPollId, votePoll } = useApp();
  const [votingId, setVotingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fallback to DEFAULT_POLL_OPTIONS if pollState is still initializing
  const options = pollState?.options || DEFAULT_POLL_OPTIONS;
  const title = pollState?.title || "Vote On Next Weekend's Debate";
  const subtitle =
    pollState?.subtitle ||
    "At TalkLab, our community decides what hits the roundtable floor. Cast your live vote below to shape Saturday's headline topic!";
  const isActive = pollState?.isActive !== false;
  const totalVotes = pollState?.totalVotes ?? options.reduce((acc, o) => acc + o.votes, 0);

  const handleVote = async (id: number) => {
    if (userVotedPollId !== null || !isActive || votingId !== null) {
      return;
    }

    setVotingId(id);
    setErrorMessage(null);

    const result = await votePoll(id);
    setVotingId(null);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to submit vote');
    }
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
            {title}
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="pop-card p-6 sm:p-10 bg-[var(--bg-surface)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isActive ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className={`pop-badge ${isActive ? 'coral' : 'outline'} text-xs font-bold`}>
                {isActive ? 'Active Live Poll' : 'Poll Closed • Final Results'}
              </span>
            </div>
            <span className="font-mono text-xs sm:text-sm font-black text-[var(--text-muted)] flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{totalVotes} Total Vote{totalVotes === 1 ? '' : 's'}</span>
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {options.map(opt => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isSelected = userVotedPollId === opt.id;
              const hasVoted = userVotedPollId !== null;
              const canClick = isActive && !hasVoted && votingId === null;

              return (
                <div
                  key={opt.id}
                  onClick={() => canClick && handleVote(opt.id)}
                  className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border-2 transition-all select-none ${
                    canClick
                      ? 'cursor-pointer hover:border-[var(--color-primary)] hover:scale-[1.01]'
                      : 'cursor-default'
                  } ${
                    isSelected
                      ? 'border-[var(--color-primary)] shadow-[3px_3px_0px_var(--shadow-color)] bg-[var(--bg-surface)]'
                      : 'border-slate-300 dark:border-slate-700 bg-[var(--bg-surface-elevated)]'
                  }`}
                  role="button"
                  tabIndex={canClick ? 0 : -1}
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
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                            : 'border-slate-400 bg-white dark:bg-slate-900'
                        }`}
                      >
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
                        {pct}%{' '}
                        <span className="text-xs text-[var(--text-muted)] font-normal font-sans">
                          ({opt.votes})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Banner */}
          {userVotedPollId !== null ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Your vote is confirmed! You helped decide this weekend&apos;s Oxford debate topic.</span>
            </div>
          ) : !isActive ? (
            <div className="text-center font-mono text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5">
              <span>Voting for this topic cycle is closed by the moderator. Final counts are displayed above.</span>
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
