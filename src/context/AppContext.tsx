'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { ThemePalette, BookedSeat, UserBooking, MemberProfile } from '@/lib/types';
import { THEMES, DEFAULT_SATURDAY_BOOKINGS, DEFAULT_TUESDAY_BOOKINGS } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';

const DEFAULT_PROFILE: MemberProfile = {
  name: 'Sarah Al-Mansouri',
  phone: '+218 91 234 5678',
  level: 'Conversationalist (B1-B2)',
  speakingHours: 18.5,
  sessionsAttended: 5,
  activeStreak: 4,
  xpPoints: 650,
  fluencyScores: {
    confidence: 86,
    spontaneity: 80,
    vocabulary: 78,
    activeListening: 92
  },
  badges: [
    { id: 'icebreaker', title: 'Icebreaker Pro', icon: '❄️', desc: 'Introduced 3 spontaneous topics with zero hesitation', unlocked: true },
    { id: 'debater', title: 'Debate Maestro', icon: '⚖️', desc: 'Defended a controversial stance in the Fishbowl', unlocked: true },
    { id: 'vocab', title: 'Word Ban Slayer', icon: '🎯', desc: 'Won 3 consecutive Taboo sprint rounds', unlocked: true },
    { id: 'streak', title: 'Loyal Speaker', icon: '🔥', desc: 'Attended 4 consecutive weekly sessions', unlocked: true },
    { id: 'moderator', title: 'Discussion Lead', icon: '👑', desc: 'Moderated a full 4-minute speed debate', unlocked: false }
  ]
};

interface AppContextType {
  theme: ThemePalette;
  setTheme: (t: ThemePalette) => void;
  cycleTheme: () => void;
  themeConfig: (typeof THEMES)[0];
  soundMuted: boolean;
  toggleSound: () => void;
  activeSession: 'saturday' | 'tuesday';
  setActiveSession: (s: 'saturday' | 'tuesday') => void;
  selectedSeat: number | null;
  setSelectedSeat: (s: number | null) => void;
  isBookingOpen: boolean;
  openBooking: (seat?: number | null, session?: 'saturday' | 'tuesday') => void;
  closeBooking: () => void;
  bookedSeats: {
    saturday: Record<number, BookedSeat>;
    tuesday: Record<number, BookedSeat>;
  };
  userBookings: UserBooking[];
  addBooking: (booking: UserBooking) => void;
  cancelUserBooking: (id: string) => void;
  // User Controls
  isUserDashboardOpen: boolean;
  openUserDashboard: () => void;
  closeUserDashboard: () => void;
  userProfile: MemberProfile;
  updateProfileName: (name: string, phone: string) => void;
  // Admin Controls
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  adminCheckIn: (session: 'saturday' | 'tuesday', seatNumber: number) => void;
  adminReleaseSeat: (session: 'saturday' | 'tuesday', seatNumber: number) => void;
  adminAssignSeat: (session: 'saturday' | 'tuesday', seatNumber: number, name: string, phone: string) => void;
  adminResetSession: (session: 'saturday' | 'tuesday') => void;
  // Confetti & Easter
  fireConfetti: () => void;
  easterModal: { isOpen: boolean; title: string; content: ReactNode | null };
  openEasterModal: (title: string, content: ReactNode) => void;
  closeEasterModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePalette>('pop');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<'saturday' | 'tuesday'>('saturday');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<MemberProfile>(DEFAULT_PROFILE);

  const [easterModal, setEasterModal] = useState<{ isOpen: boolean; title: string; content: ReactNode | null }>({
    isOpen: false,
    title: '',
    content: null
  });

  const [bookedSeats, setBookedSeats] = useState<{
    saturday: Record<number, BookedSeat>;
    tuesday: Record<number, BookedSeat>;
  }>({
    saturday: { ...DEFAULT_SATURDAY_BOOKINGS },
    tuesday: { ...DEFAULT_TUESDAY_BOOKINGS }
  });

  const [userBookings, setUserBookings] = useState<UserBooking[]>([
    {
      id: 'TL-SAT-18-8421',
      name: 'Sarah Al-Mansouri',
      phone: '+218 91 234 5678',
      normPhone: '218912345678',
      session: 'saturday',
      sessionName: 'Saturday Immersion Lab',
      day: 'Every Saturday',
      time: '12:00 PM – 4:00 PM',
      seatNumber: 18,
      level: 'Conversationalist (B1-B2)',
      bookedAt: new Date().toISOString(),
      checkedIn: false
    }
  ]);

  // Sync state to LocalStorage
  const persistState = (newSeats: typeof bookedSeats, newBookings: UserBooking[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      'talklab_boardroom_v3',
      JSON.stringify({
        saturday: { bookedSeats: newSeats.saturday },
        tuesday: { bookedSeats: newSeats.tuesday },
        userBookings: newBookings
      })
    );
  };

  // Initialize from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Theme
    const savedTheme = localStorage.getItem('talklab_palette') as ThemePalette;
    if (savedTheme && ['pop', 'cyber', 'ember'].includes(savedTheme)) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-palette', savedTheme);
    } else {
      document.documentElement.setAttribute('data-palette', 'pop');
    }

    // Sound
    const savedSound = localStorage.getItem('talklab_sound_muted');
    if (savedSound === 'true') {
      setSoundMuted(true);
      SoundFX.setMuted(true);
    }

    // Bookings
    const savedState = localStorage.getItem('talklab_boardroom_v3');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.saturday?.bookedSeats && parsed.tuesday?.bookedSeats) {
          setBookedSeats({
            saturday: parsed.saturday.bookedSeats,
            tuesday: parsed.tuesday.bookedSeats
          });
        }
        if (Array.isArray(parsed.userBookings) && parsed.userBookings.length > 0) {
          setUserBookings(parsed.userBookings);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const setTheme = (t: ThemePalette) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-palette', t);
    localStorage.setItem('talklab_palette', t);
    const cfg = THEMES.find(item => item.id === t);
    if (cfg) SoundFX.playPop(cfg.soundPitch);
  };

  const cycleTheme = () => {
    const list: ThemePalette[] = ['pop', 'cyber', 'ember'];
    const idx = list.indexOf(theme);
    const next = list[(idx + 1) % list.length];
    setTheme(next);
  };

  const toggleSound = () => {
    const newMuted = SoundFX.toggleMute();
    setSoundMuted(newMuted);
  };

  const openBooking = (seat?: number | null, session?: 'saturday' | 'tuesday') => {
    if (seat !== undefined && seat !== null) setSelectedSeat(seat);
    if (session) setActiveSession(session);
    setIsBookingOpen(true);
    SoundFX.playPop(620);
  };

  const closeBooking = () => setIsBookingOpen(false);

  const openUserDashboard = () => {
    setIsUserDashboardOpen(true);
    SoundFX.playPop(560);
  };

  const closeUserDashboard = () => setIsUserDashboardOpen(false);

  const openAdminModal = () => {
    setIsAdminModalOpen(true);
    SoundFX.playPop(580);
  };

  const closeAdminModal = () => setIsAdminModalOpen(false);

  const loginAdmin = (pin: string): boolean => {
    // Passcode for TalkLab Facilitators & Mods
    if (pin.trim() === '7788' || pin.trim().toUpperCase() === 'TALKLAB') {
      setIsAdminAuthenticated(true);
      SoundFX.playFanfare();
      return true;
    }
    SoundFX.playBuzzer();
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    SoundFX.playPop(420);
  };

  const updateProfileName = (name: string, phone: string) => {
    setUserProfile(prev => ({ ...prev, name, phone }));
    SoundFX.playPop(640);
  };

  const addBooking = (booking: UserBooking) => {
    const initial = booking.name.trim().charAt(0).toUpperCase() || 'M';
    const updated = {
      ...bookedSeats,
      [booking.session]: {
        ...bookedSeats[booking.session],
        [booking.seatNumber]: { initial, name: booking.name, phone: booking.phone, checkedIn: false }
      }
    };
    const updatedUserBookings = [...userBookings, booking];

    setBookedSeats(updated);
    setUserBookings(updatedUserBookings);
    persistState(updated, updatedUserBookings);
  };

  const cancelUserBooking = (bookingId: string) => {
    const target = userBookings.find(b => b.id === bookingId);
    if (!target) return;

    const sessionSeats = { ...bookedSeats[target.session] };
    delete sessionSeats[target.seatNumber];

    const updatedSeats = {
      ...bookedSeats,
      [target.session]: sessionSeats
    };

    const updatedUserBookings = userBookings.filter(b => b.id !== bookingId);

    setBookedSeats(updatedSeats);
    setUserBookings(updatedUserBookings);
    persistState(updatedSeats, updatedUserBookings);
    SoundFX.playPop(480);
  };

  // Admin Seat Operations
  const adminCheckIn = (session: 'saturday' | 'tuesday', seatNumber: number) => {
    const seat = bookedSeats[session][seatNumber];
    if (!seat) return;

    const updatedSession = {
      ...bookedSeats[session],
      [seatNumber]: { ...seat, checkedIn: !seat.checkedIn }
    };

    const updatedSeats = {
      ...bookedSeats,
      [session]: updatedSession
    };

    const updatedBookings = userBookings.map(b =>
      b.session === session && b.seatNumber === seatNumber
        ? { ...b, checkedIn: !b.checkedIn }
        : b
    );

    setBookedSeats(updatedSeats);
    setUserBookings(updatedBookings);
    persistState(updatedSeats, updatedBookings);
    SoundFX.playPop(700);
  };

  const adminReleaseSeat = (session: 'saturday' | 'tuesday', seatNumber: number) => {
    const sessionSeats = { ...bookedSeats[session] };
    delete sessionSeats[seatNumber];

    const updatedSeats = {
      ...bookedSeats,
      [session]: sessionSeats
    };

    const updatedBookings = userBookings.filter(
      b => !(b.session === session && b.seatNumber === seatNumber)
    );

    setBookedSeats(updatedSeats);
    setUserBookings(updatedBookings);
    persistState(updatedSeats, updatedBookings);
    SoundFX.playPop(450);
  };

  const adminAssignSeat = (session: 'saturday' | 'tuesday', seatNumber: number, name: string, phone: string) => {
    const initial = name.trim().charAt(0).toUpperCase() || 'M';
    const updatedSeats = {
      ...bookedSeats,
      [session]: {
        ...bookedSeats[session],
        [seatNumber]: { initial, name, phone, checkedIn: false }
      }
    };

    const newBooking: UserBooking = {
      id: `TL-ADM-${seatNumber}-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      phone,
      normPhone: phone.replace(/\D/g, ''),
      session,
      sessionName: session === 'saturday' ? 'Saturday Immersion Lab' : 'Tuesday Twilight Lab',
      day: session === 'saturday' ? 'Every Saturday' : 'Every Tuesday',
      time: session === 'saturday' ? '12:00 PM – 4:00 PM' : '4:00 PM – 7:00 PM',
      seatNumber,
      level: 'Conversationalist',
      bookedAt: new Date().toISOString(),
      checkedIn: false
    };

    const updatedBookings = [...userBookings, newBooking];
    setBookedSeats(updatedSeats);
    setUserBookings(updatedBookings);
    persistState(updatedSeats, updatedBookings);
    SoundFX.playFanfare();
  };

  const adminResetSession = (session: 'saturday' | 'tuesday') => {
    const defaults = session === 'saturday' ? DEFAULT_SATURDAY_BOOKINGS : DEFAULT_TUESDAY_BOOKINGS;
    const updatedSeats = {
      ...bookedSeats,
      [session]: { ...defaults }
    };
    const updatedBookings = userBookings.filter(b => b.session !== session);

    setBookedSeats(updatedSeats);
    setUserBookings(updatedBookings);
    persistState(updatedSeats, updatedBookings);
    SoundFX.playBuzzer();
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const openEasterModal = (title: string, content: ReactNode) => {
    setEasterModal({ isOpen: true, title, content });
    SoundFX.playFanfare();
    fireConfetti();
  };

  const closeEasterModal = () => {
    setEasterModal({ isOpen: false, title: '', content: null });
  };

  const themeConfig = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        themeConfig,
        soundMuted,
        toggleSound,
        activeSession,
        setActiveSession,
        selectedSeat,
        setSelectedSeat,
        isBookingOpen,
        openBooking,
        closeBooking,
        bookedSeats,
        userBookings,
        addBooking,
        cancelUserBooking,
        isUserDashboardOpen,
        openUserDashboard,
        closeUserDashboard,
        userProfile,
        updateProfileName,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        adminCheckIn,
        adminReleaseSeat,
        adminAssignSeat,
        adminResetSession,
        fireConfetti,
        easterModal,
        openEasterModal,
        closeEasterModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
