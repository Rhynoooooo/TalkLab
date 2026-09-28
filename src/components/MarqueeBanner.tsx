'use client';

import React from 'react';

interface MarqueeBannerProps {
  primary?: boolean;
  items?: string[];
}

const DEFAULT_ITEMS = [
  '🔥 NEXT SESSION: SATURDAY AT 12:00 PM',
  'FEE: 30 LYD FLAT',
  '25 SEATS PER IMMERSION TABLE',
  'HOSTED AT مركز سفراء العلم (PEOPLE & SPACES) TRIPOLI',
  'IN-HOUSE CAFE MEMBER DISCOUNT',
  'TUESDAY TWILIGHT AT 4:00 PM',
  'ZERO BORING GRAMMAR HOMEWORK'
];

export default function MarqueeBanner({ primary = false, items = DEFAULT_ITEMS }: MarqueeBannerProps) {
  // Duplicate array 3 times for a seamless infinite loop
  const repeated = [...items, ...items, ...items];

  return (
    <div
      className={`marquee-ribbon ${primary ? 'primary py-2.5 text-sm sm:text-base' : 'py-1.5 text-xs sm:text-sm'}`}
      aria-hidden="true"
    >
      <div className="marquee-track flex items-center">
        {repeated.map((text, idx) => (
          <span key={idx} className="inline-flex items-center px-4 font-mono font-bold tracking-wider">
            {text}
            <span className="ml-4 text-[var(--color-accent-gold)] font-black">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
