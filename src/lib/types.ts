export type ThemePalette = 'pop' | 'cyber' | 'ember';

export interface SessionConfig {
  id: 'saturday' | 'tuesday';
  name: string;
  shortName: string;
  tag: string;
  day: string;
  time: string;
  duration: string;
  price: string;
  priceNumber: number;
  capacity: number;
  venue: string;
  venuePerk: string;
  focus: string;
  agenda: { time: string; title: string; desc: string }[];
}

export interface BookedSeat {
  initial: string;
  name: string;
  phone?: string;
  checkedIn?: boolean;
}

export interface UserBooking {
  id: string;
  name: string;
  phone: string;
  normPhone: string;
  session: 'saturday' | 'tuesday';
  sessionName: string;
  day: string;
  time: string;
  seatNumber: number;
  level: string;
  bookedAt: string;
  checkedIn?: boolean;
}

export interface MemberBadge {
  id: string;
  title: string;
  icon: string;
  desc: string;
  unlocked: boolean;
}

export interface MemberProfile {
  name: string;
  phone: string;
  level: string;
  speakingHours: number;
  sessionsAttended: number;
  activeStreak: number;
  xpPoints: number;
  fluencyScores: {
    confidence: number;
    spontaneity: number;
    vocabulary: number;
    activeListening: number;
  };
  badges: MemberBadge[];
}

export interface QuizOption {
  icon: string;
  text: string;
  vibe: 'yapper' | 'overthinker' | 'debater' | 'observer';
}

export interface QuizQuestion {
  title: string;
  options: QuizOption[];
}

export interface PersonaInfo {
  name: string;
  avatar: string;
  badge: string;
  desc: string;
  recommended: string;
  tag: string;
}

export interface TabooCard {
  target: string;
  forbidden: string[];
}

export interface SlangCard {
  id: number;
  category: 'internet' | 'rhetoric' | 'social';
  term: string;
  pronunciation: string;
  type: string;
  meaning: string;
  example: string;
  origin: string;
}

export interface DebateTopic {
  topic: string;
  category: string;
  proArguments: string[];
  conArguments: string[];
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}
