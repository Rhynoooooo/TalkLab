'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { ThemePalette, BookedSeat, UserBooking, MemberProfile } from '@/lib/types';
import { THEMES, DEFAULT_SATURDAY_BOOKINGS, DEFAULT_TUESDAY_BOOKINGS } from '@/lib/constants';
import { SoundFX } from '@/lib/soundFx';
import type { SessionPayload } from '@/lib/auth/types';

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
  // Unified RBAC Session & Member Controls
  currentUser: SessionPayload | null;
  refreshSession: () => Promise<SessionPayload | null>;
  logout: () => Promise<void>;
  isMemberModalOpen: boolean;
  openMemberModal: () => void;
  closeMemberModal: () => void;
  // Admin Controls
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  isAdminAuthenticated: boolean;
  checkAdminSession: () => Promise<boolean>;
  loginAdmin: (pin: string) => Promise<{ success: boolean; error?: string; remainingAttempts?: number; lockedOut?: boolean }>;
  logoutAdmin: () => Promise<void>;
  adminCheckIn: (session: 'saturday' | 'tuesday', seatNumber: number) => Promise<void>;
  adminReleaseSeat: (session: 'saturday' | 'tuesday', seatNumber: number) => Promise<void>;
  adminAssignSeat: (session: 'saturday' | 'tuesday', seatNumber: number, name: string, phone: string) => Promise<void>;
  adminResetSession: (session: 'saturday' | 'tuesday') => Promise<{ success: boolean; error?: string; archived?: unknown }>;
  // Community Poll Controls
  pollState: import('@/lib/poll/store').PollState | null;
  userVotedPollId: number | null;
  votePoll: (optionId: number) => Promise<{ success: boolean; error?: string }>;
  refreshPoll: () => Promise<void>;
  resetUserPollVote: () => void;
  adminResetPoll: () => Promise<{ success: boolean; error?: string; archived?: unknown }>;
  adminUpdatePoll: (updates: {
    title?: string;
    subtitle?: string;
    isActive?: boolean;
    options?: Array<{ id: number; text: string; votes?: number }>;
  }) => Promise<{ success: boolean; error?: string }>;
  // Confetti & Easter
  fireConfetti: () => void;
  easterModal: { isOpen: boolean; title: string; content: ReactNode | null };
  openEasterModal: (title: string, content: ReactNode) => void;
  closeEasterModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePalette>('notebook');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<'saturday' | 'tuesday'>('saturday');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState<boolean>(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<SessionPayload | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Poll state
  const [pollState, setPollState] = useState<import('@/lib/poll/store').PollState | null>(null);
  const [userVotedPollId, setUserVotedPollId] = useState<number | null>(null);

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

  const openMemberModal = () => {
    setIsMemberModalOpen(true);
    SoundFX.playPop(570);
  };

  const closeMemberModal = () => setIsMemberModalOpen(false);

  const refreshSession = async (): Promise<SessionPayload | null> => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.authenticated && data.user) {
        setCurrentUser(data.user);
        if (data.user.role === 'admin') {
          setIsAdminAuthenticated(true);
        }
        return data.user as SessionPayload;
      }
      setCurrentUser(null);
      return null;
    } catch {
      setCurrentUser(null);
      return null;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
    SoundFX.playPop(420);
  };

  const checkAdminSession = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/verify-session', { cache: 'no-store' });
      if (res.ok) {
        setIsAdminAuthenticated(true);
        return true;
      }
      setIsAdminAuthenticated(false);
      return false;
    } catch {
      setIsAdminAuthenticated(false);
      return false;
    }
  };

  const refreshPoll = async () => {
    try {
      const res = await fetch('/api/poll', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.poll) {
        setPollState(data.poll);
      }
    } catch {
      // ignore
    }
  };

  const refreshBoardroomState = async () => {
    try {
      const res = await fetch('/api/boardroom/state', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.state) {
        setBookedSeats({
          saturday: data.state.saturday.bookedSeats || {},
          tuesday: data.state.tuesday.bookedSeats || {}
        });
      }
    } catch {
      // ignore
    }
  };


  // Initialize from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    queueMicrotask(() => {
      // Theme
      const savedTheme = localStorage.getItem('talklab_palette') as ThemePalette;
      if (savedTheme && ['notebook', 'pop', 'cyber', 'ember'].includes(savedTheme)) {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-palette', savedTheme);
      } else {
        document.documentElement.setAttribute('data-palette', 'notebook');
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

      // Poll user vote pick
      const savedPollPick = localStorage.getItem('talklab_poll_user_voted_id_v2');
      if (savedPollPick) {
        setUserVotedPollId(parseInt(savedPollPick, 10));
      }
      refreshPoll();
      refreshBoardroomState();

      // Verify session and moderator on mount
      refreshSession();
      checkAdminSession();
    });
  }, []);

  const setTheme = (t: ThemePalette) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-palette', t);
    localStorage.setItem('talklab_palette', t);
    const cfg = THEMES.find(item => item.id === t);
    if (cfg) SoundFX.playPop(cfg.soundPitch);
  };

  const cycleTheme = () => {
    const list: ThemePalette[] = ['notebook', 'pop', 'cyber', 'ember'];
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
    checkAdminSession();
    SoundFX.playPop(580);
  };

  const closeAdminModal = () => setIsAdminModalOpen(false);

  const loginAdmin = async (
    pin: string
  ): Promise<{ success: boolean; error?: string; remainingAttempts?: number; lockedOut?: boolean }> => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        await refreshSession();
        SoundFX.playFanfare();
        return { success: true };
      }

      SoundFX.playBuzzer();
      return {
        success: false,
        error: data.error || 'Authentication failed',
        remainingAttempts: data.remainingAttempts,
        lockedOut: data.lockedOut
      };
    } catch (err: unknown) {
      SoundFX.playBuzzer();
      const msg = err instanceof Error ? err.message : 'Network error during authentication';
      return { success: false, error: msg };
    }
  };

  const logoutAdmin = async () => {
    await logout();
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

    // Persist to backend server Mutex disk store
    fetch('/api/boardroom/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: booking.session,
        seatNumber: booking.seatNumber,
        name: booking.name,
        phone: booking.phone
      })
    })
      .then(async res => {
        if (res.ok) {
          await refreshBoardroomState();
        }
      })
      .catch(err => {
        console.warn('Backend booking sync notice:', err);
      });
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

    fetch('/api/admin/seats/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: target.session,
        seatNumber: target.seatNumber
      })
    }).catch(() => {
      // ignore
    });
  };

  // Admin Seat Operations with Server-Side Audit Logging
  const adminCheckIn = async (session: 'saturday' | 'tuesday', seatNumber: number) => {
    const seat = bookedSeats[session][seatNumber];
    if (!seat) return;

    const newCheckedIn = !seat.checkedIn;

    // Optimistic UI update
    const updatedSession = {
      ...bookedSeats[session],
      [seatNumber]: { ...seat, checkedIn: newCheckedIn }
    };

    const updatedSeats = {
      ...bookedSeats,
      [session]: updatedSession
    };

    const updatedBookings = userBookings.map(b =>
      b.session === session && b.seatNumber === seatNumber
        ? { ...b, checkedIn: newCheckedIn }
        : b
    );

    setBookedSeats(updatedSeats);
    setUserBookings(updatedBookings);
    persistState(updatedSeats, updatedBookings);
    SoundFX.playPop(700);

    // Secure server-side audit logging
    try {
      const res = await fetch('/api/admin/seats/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, seatNumber, checkedIn: newCheckedIn })
      });
      if (res.status === 401) {
        setIsAdminAuthenticated(false);
      }
    } catch {
      // UI already state-synced locally
    }
  };

  const adminReleaseSeat = async (session: 'saturday' | 'tuesday', seatNumber: number) => {
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

    try {
      const res = await fetch('/api/admin/seats/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, seatNumber })
      });
      if (res.status === 401) {
        setIsAdminAuthenticated(false);
      }
    } catch {
      // UI already state-synced locally
    }
  };

  const adminAssignSeat = async (session: 'saturday' | 'tuesday', seatNumber: number, name: string, phone: string) => {
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

    try {
      const res = await fetch('/api/admin/seats/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, seatNumber, name, phone })
      });
      if (res.status === 401) {
        setIsAdminAuthenticated(false);
      }
    } catch {
      // UI already state-synced locally
    }
  };

  const adminResetSession = async (
    session: 'saturday' | 'tuesday'
  ): Promise<{ success: boolean; error?: string; archived?: unknown }> => {
    try {
      const res = await fetch('/api/admin/session/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, confirmed: true })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        // Reset local session state to empty pristine arena
        const updatedSeats = {
          ...bookedSeats,
          [session]: {}
        };
        const updatedBookings = userBookings.filter(b => b.session !== session);

        setBookedSeats(updatedSeats);
        setUserBookings(updatedBookings);
        persistState(updatedSeats, updatedBookings);
        SoundFX.playFanfare();

        return { success: true, archived: data.archived };
      }

      if (res.status === 401) {
        setIsAdminAuthenticated(false);
      }
      return { success: false, error: data.error || 'Failed to reset session roster' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error resetting session';
      return { success: false, error: msg };
    }
  };


  // Community Poll Methods

  const votePoll = async (optionId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.poll) {
        setPollState(data.poll);
        setUserVotedPollId(optionId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('talklab_poll_user_voted_id_v2', String(optionId));
        }
        SoundFX.playPop(620);
        return { success: true };
      }
      SoundFX.playBuzzer();
      return { success: false, error: data.error || 'Failed to submit vote' };
    } catch (err) {
      SoundFX.playBuzzer();
      const msg = err instanceof Error ? err.message : 'Network error casting vote';
      return { success: false, error: msg };
    }
  };

  const resetUserPollVote = () => {
    setUserVotedPollId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('talklab_poll_user_voted_id_v2');
      localStorage.removeItem('talklab_poll_votes_v2');
    }
    SoundFX.playPop(480);
  };

  const adminResetPoll = async (): Promise<{ success: boolean; error?: string; archived?: unknown }> => {
    try {
      const res = await fetch('/api/admin/poll/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.poll) {
        setPollState(data.poll);
        resetUserPollVote();
        SoundFX.playFanfare();
        return { success: true, archived: data.archived };
      }
      if (res.status === 401) {
        setIsAdminAuthenticated(false);
      }
      return { success: false, error: data.error || 'Failed to reset poll' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error resetting poll';
      return { success: false, error: msg };
    }
  };

  const adminUpdatePoll = async (updates: {
    title?: string;
    subtitle?: string;
    isActive?: boolean;
    options?: Array<{ id: number; text: string; votes?: number }>;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/poll', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.poll) {
        setPollState(data.poll);
        SoundFX.playFanfare();
        return { success: true };
      }
      if (res.status === 401) {
        setIsAdminAuthenticated(false);
      }
      return { success: false, error: data.error || 'Failed to update poll' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error updating poll';
      return { success: false, error: msg };
    }
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
        currentUser,
        refreshSession,
        logout,
        isMemberModalOpen,
        openMemberModal,
        closeMemberModal,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
        isAdminAuthenticated,
        checkAdminSession,
        loginAdmin,
        logoutAdmin,
        adminCheckIn,
        adminReleaseSeat,
        adminAssignSeat,
        adminResetSession,
        pollState,
        userVotedPollId,
        votePoll,
        refreshPoll,
        resetUserPollVote,
        adminResetPoll,
        adminUpdatePoll,
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
