'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MobileDrawer from '@/components/MobileDrawer';
import MarqueeBanner from '@/components/MarqueeBanner';
import HeroSection from '@/components/HeroSection';
import VibeQuiz from '@/components/VibeQuiz';
import SlotMachine from '@/components/SlotMachine';
import TabooArcade from '@/components/TabooArcade';
import SlangLab from '@/components/SlangLab';
import Spotlight from '@/components/Spotlight';
import BoardroomBooking from '@/components/BoardroomBooking';
import HotSeat from '@/components/HotSeat';
import VenueSection from '@/components/VenueSection';
import CommunityPoll from '@/components/CommunityPoll';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Notification Ticker */}
      <MarqueeBanner />

      {/* Main Navbar */}
      <Navbar
        onToggleMobileDrawer={() => setIsMobileDrawerOpen(prev => !prev)}
        isMobileDrawerOpen={isMobileDrawerOpen}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection />

        {/* Middle Accent Ribbon */}
        <MarqueeBanner
          primary
          items={[
            '★ 25 SEATS PER IMMERSION TABLE',
            'HOSTED AT مركز سفراء العلم (PEOPLE & SPACES) TRIPOLI',
            'SATURDAY 12:00 PM – 4:00 PM (30 LYD)',
            'TUESDAY 4:00 PM – 7:00 PM (30 LYD)',
            'NO AWKWARD SILENCES',
            'PEOPLE & SPACES CAFE DISCOUNT',
            'OXFORD FISHBOWL DEBATES'
          ]}
        />

        <VibeQuiz />
        <SlotMachine />
        <TabooArcade />
        <SlangLab />
        <Spotlight />
        <BoardroomBooking />
        <HotSeat />
        <VenueSection />
        <CommunityPoll />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
