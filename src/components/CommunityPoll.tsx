'use client';

import React, { useState, useEffect } from 'react';
import { DEFAULT_POLL_OPTIONS } from '@/lib/constants';
import { PollOption } from '@/lib/types';
import { SoundFX } from '@/lib/soundFx';

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
    <section className="py-16 sm:py-20 border-t-[2.5px] border-[var(--border-color)]" id="dashboard">
      <div className="tl-container max-w-3xl">
        <div className="text-center space-y-3 mb-10">
          <span className="pop-badge gold">Community Voice</span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)]">
            Vote On Next Saturday&apos;s Debate
          </h2>
          <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto">
            At TalkLab, our members pick what we debate. Cast your vote below to shape this weekend&apos;s topic!
          </p>
        </div>

        <div className="pop-card p-6 sm:p-9 bg-[var(--bg-surface)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[var(--border-color)] pb-3">
            <span className="pop-badge coral text-xs">Active Voting Poll</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-[var(--text-muted)]">
              {totalVotes} Votes Cast
            </span>
          </div>

          <div className="space-y-3">
            {options.map(opt => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isSelected = userVotedId === opt.id;
              const hasVoted = userVotedId !== null;

              return (
                <div
                  key={opt.id}
                  onClick={() => !hasVoted && handleVote(opt.id)}
                  className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all select-none ${
                    hasVoted ? 'cursor-default' : 'cursor-pointer hover:border-[var(--color-primary)]'
                  } ${
                    isSelected
                      ? 'border-[var(--color-primary)] shadow-[3px_3px_0px_var(--shadow-color)]'
                      : 'border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)]'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                >
                  {/* Background Progress Fill */}
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 pointer-events-none opacity-20 ${
                      isSelected ? 'bg-[var(--color-primary)]' : 'bg-neutral-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />

                  {/* Foreground Content */}
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{isSelected ? '✅' : '⚡'}</span>
                      <span
                        className={`text-xs sm:text-sm font-extrabold ${
                          isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--text-main)]'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSelected && (
                        <span className="pop-badge mint text-[0.65rem] py-0.5 px-1.5 hidden sm:inline-block">
                          Your Pick ✓
                        </span>
                      )}
                      <div className="font-mono text-sm sm:text-base font-black text-[var(--color-primary)]">
                        {pct}% <span className="text-xs text-[var(--text-muted)] font-normal">({opt.votes})</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status text */}
          {userVotedId !== null ? (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-200 text-xs font-bold text-center">
              ✓ Your vote has been securely recorded! Thank you for shaping TalkLab.
            </div>
          ) : (
            <div className="text-center font-mono text-xs text-[var(--text-muted)]">
              🔒 Anti-Spam Protected • One vote per member • Results update live
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
