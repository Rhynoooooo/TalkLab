'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[var(--bg-canvas)]">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-6">
        {/* Big 404 */}
        <div className="font-['Outfit'] font-black text-8xl sm:text-9xl text-[var(--color-primary)] tracking-tight leading-none">
          404
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[var(--text-main)]">
            This Page Went Off-Script
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Looks like this page doesn&apos;t exist — kind of like trying to use &quot;very very good&quot;
            when you mean &quot;extraordinary.&quot; Let&apos;s get you back to the conversation!
          </p>
        </div>

        {/* Search hint */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)]">
          <div className="flex items-center gap-2 font-mono text-xs font-black text-[var(--text-muted)] uppercase">
            <Search className="w-3.5 h-3.5" />
            <span>Looking for something?</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Try the boardroom booking, slot machine, taboo arcade, or vibe quiz from the homepage.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="pop-btn pop-btn-primary pop-btn-lg w-full sm:w-auto justify-center btn-shimmer"
          >
            <Home className="w-4 h-4" />
            <span>Back to TalkLab</span>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="pop-btn pop-btn-surface pop-btn-md w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Fun TalkLab-branded footer */}
        <div className="font-mono text-[0.68rem] text-[var(--text-muted)] pt-4">
          💬 &quot;The best way to learn English is to get lost… just not on a website.&quot;
        </div>
      </div>
    </div>
  );
}
