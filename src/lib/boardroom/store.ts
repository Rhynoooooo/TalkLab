/**
 * TalkLab 2.0 - Boardroom State Management & Persistence Engine
 * 
 * Features:
 * - 25 numbered desks for Saturday (12-4 PM) & Tuesday (4-7 PM)
 * - Atomic concurrency control (Mutex lock preventing double-booking)
 * - Durable persistence to disk (atomic JSON file write)
 * - Archive system for Session Resets
 */

import fs from 'fs';
import path from 'path';
import { DEFAULT_SATURDAY_BOOKINGS, DEFAULT_TUESDAY_BOOKINGS } from '@/lib/constants';

export interface BoardroomSeat {
  seatNumber: number;
  initial: string;
  name: string;
  phone: string;
  passId: string;
  checkedIn: boolean;
  reservedAt: string;
}

export type SessionKey = 'saturday' | 'tuesday';

export interface SessionRoster {
  session: SessionKey;
  sessionName: string;
  day: string;
  time: string;
  capacity: number;
  bookedSeats: Record<number, BoardroomSeat>;
  updatedAt: string;
}

export interface BoardroomState {
  saturday: SessionRoster;
  tuesday: SessionRoster;
  version: number;
}

export interface ArchivedRoster {
  archiveId: string;
  session: SessionKey | 'both';
  resetAt: string;
  resetBy: string;
  totalSeatsArchived: number;
  attendees: BoardroomSeat[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'boardroom-state.json');
const ARCHIVE_FILE = path.join(DATA_DIR, 'roster-archives.json');

// Async Mutex to prevent race conditions on simultaneous booking
class AsyncMutex {
  private queue: Array<() => void> = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise(resolve => {
      const release = () => {
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          if (next) next();
        } else {
          this.locked = false;
        }
      };

      if (!this.locked) {
        this.locked = true;
        resolve(release);
      } else {
        this.queue.push(() => resolve(release));
      }
    });
  }
}

const mutex = new AsyncMutex();

function createInitialRoster(
  session: SessionKey,
  defaults: Record<number, { initial: string; name: string }>
): Record<number, BoardroomSeat> {
  const roster: Record<number, BoardroomSeat> = {};
  for (const [seatNumStr, item] of Object.entries(defaults)) {
    const seatNumber = parseInt(seatNumStr, 10);
    roster[seatNumber] = {
      seatNumber,
      initial: item.initial,
      name: item.name,
      phone: `+218 91 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`,
      passId: `TL-${session.toUpperCase().slice(0, 3)}-${seatNumber}-${Math.floor(1000 + Math.random() * 9000)}`,
      checkedIn: false,
      reservedAt: '2026-10-01T12:00:00.000Z'
    };
  }
  return roster;
}

// Initial boardroom state seeded with authentic Libyan TalkLab community attendees
export function getInitialState(): BoardroomState {
  return {
    saturday: {
      session: 'saturday',
      sessionName: 'Saturday Immersion Lab',
      day: 'Every Saturday',
      time: '12:00 PM – 4:00 PM',
      capacity: 25,
      bookedSeats: createInitialRoster('saturday', DEFAULT_SATURDAY_BOOKINGS),
      updatedAt: new Date().toISOString()
    },
    tuesday: {
      session: 'tuesday',
      sessionName: 'Tuesday Twilight Lab',
      day: 'Every Tuesday',
      time: '4:00 PM – 7:00 PM',
      capacity: 25,
      bookedSeats: createInitialRoster('tuesday', DEFAULT_TUESDAY_BOOKINGS),
      updatedAt: new Date().toISOString()
    },
    version: 1
  };
}

// In-memory cache for ultra-fast reads
let inMemoryState: BoardroomState | null = null;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // In read-only serverless environments, fallback to in-memory
    }
  }
}

/**
 * Loads the current boardroom state from disk or initializes defaults.
 */
export async function getBoardroomState(): Promise<BoardroomState> {
  if (inMemoryState) {
    return inMemoryState;
  }

  ensureDataDir();

  if (fs.existsSync(STATE_FILE)) {
    try {
      const raw = await fs.promises.readFile(STATE_FILE, 'utf-8');
      inMemoryState = JSON.parse(raw) as BoardroomState;
      return inMemoryState;
    } catch (err) {
      console.warn('[BoardroomStore] Corrupted state file. Initializing defaults.', err);
    }
  }

  inMemoryState = getInitialState();
  await persistStateToDisk(inMemoryState);
  return inMemoryState;
}

/**
 * Atomic write to disk using temp file rename to prevent partial writes.
 */
async function persistStateToDisk(state: BoardroomState): Promise<void> {
  ensureDataDir();
  const tempFile = `${STATE_FILE}.tmp.${Date.now()}`;

  try {
    const json = JSON.stringify(state, null, 2);
    await fs.promises.writeFile(tempFile, json, 'utf-8');
    await fs.promises.rename(tempFile, STATE_FILE);
  } catch (err) {
    // If running in environment without filesystem access, keep in-memory
    console.warn('[BoardroomStore] Disk persistence notice:', err instanceof Error ? err.message : err);
    if (fs.existsSync(tempFile)) {
      try {
        await fs.promises.unlink(tempFile);
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Atomic seat booking transaction.
 * Acquires mutex lock, validates availability, and writes to store.
 */
export async function bookSeatAtomic(
  session: SessionKey,
  seatNumber: number,
  attendee: { name: string; phone: string; passId?: string }
): Promise<{ success: boolean; seat?: BoardroomSeat; error?: string; code?: string }> {
  if (seatNumber < 1 || seatNumber > 25) {
    return { success: false, error: 'Seat number must be between 1 and 25', code: 'INVALID_SEAT' };
  }

  const release = await mutex.acquire();

  try {
    const state = await getBoardroomState();
    const sessionRoster = state[session];

    // Check if seat is already occupied (Race Condition Guard)
    const existing = sessionRoster.bookedSeats[seatNumber];
    if (existing) {
      return {
        success: false,
        error: `Seat #${seatNumber} is already taken by ${existing.name.split(' ')[0]}. Please choose another seat.`,
        code: 'SEAT_TAKEN'
      };
    }

    // Check if phone number already booked for this session (1-seat-per-phone rule)
    const cleanPhone = attendee.phone.replace(/\D/g, '');
    const alreadyBooked = Object.values(sessionRoster.bookedSeats).find(
      s => s.phone.replace(/\D/g, '') === cleanPhone
    );

    if (alreadyBooked) {
      return {
        success: false,
        error: `This phone number has already reserved Seat #${alreadyBooked.seatNumber} for this session.`,
        code: 'DUPLICATE_BOOKING'
      };
    }

    const initial = attendee.name.trim().charAt(0).toUpperCase() || 'M';
    const passId = attendee.passId || `TL-${session.toUpperCase().slice(0, 3)}-${seatNumber}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSeat: BoardroomSeat = {
      seatNumber,
      initial,
      name: attendee.name.trim(),
      phone: attendee.phone,
      passId,
      checkedIn: false,
      reservedAt: new Date().toISOString()
    };

    sessionRoster.bookedSeats[seatNumber] = newSeat;
    sessionRoster.updatedAt = new Date().toISOString();
    state.version += 1;
    inMemoryState = state;

    await persistStateToDisk(state);

    return { success: true, seat: newSeat };
  } finally {
    release();
  }
}

/**
 * Checks in an attendee or releases check-in.
 */
export async function toggleCheckInAtomic(
  session: SessionKey,
  seatNumber: number,
  checkedIn: boolean
): Promise<{ success: boolean; seat?: BoardroomSeat; error?: string }> {
  const release = await mutex.acquire();
  try {
    const state = await getBoardroomState();
    const seat = state[session]?.bookedSeats[seatNumber];

    if (!seat) {
      return { success: false, error: 'Seat is not currently booked' };
    }

    seat.checkedIn = checkedIn;
    state[session].updatedAt = new Date().toISOString();
    inMemoryState = state;

    await persistStateToDisk(state);
    return { success: true, seat };
  } finally {
    release();
  }
}

/**
 * Releases a booked seat immediately (cancellation / moderator action).
 */
export async function releaseSeatAtomic(
  session: SessionKey,
  seatNumber: number
): Promise<{ success: boolean; error?: string }> {
  const release = await mutex.acquire();
  try {
    const state = await getBoardroomState();
    if (!state[session]?.bookedSeats[seatNumber]) {
      return { success: false, error: 'Seat is not currently occupied' };
    }

    delete state[session].bookedSeats[seatNumber];
    state[session].updatedAt = new Date().toISOString();
    inMemoryState = state;

    await persistStateToDisk(state);
    return { success: true };
  } finally {
    release();
  }
}

/**
 * Facilitator Reset Session Engine.
 * Flushes bookings back to empty, archives attendees with timestamps,
 * and saves changes cleanly to disk.
 */
export async function resetSessionAtomic(
  session: SessionKey | 'both',
  resetBy: string
): Promise<{ success: boolean; archived: ArchivedRoster[]; newState: BoardroomState }> {
  const release = await mutex.acquire();

  try {
    const state = await getBoardroomState();
    const archivesToRecord: ArchivedRoster[] = [];
    const sessionsToReset: SessionKey[] = session === 'both' ? ['saturday', 'tuesday'] : [session];

    for (const s of sessionsToReset) {
      const roster = state[s];
      const attendees = Object.values(roster.bookedSeats);

      if (attendees.length > 0) {
        const archiveEntry: ArchivedRoster = {
          archiveId: `ARCHIVE-${s.toUpperCase()}-${Date.now()}`,
          session: s,
          resetAt: new Date().toISOString(),
          resetBy,
          totalSeatsArchived: attendees.length,
          attendees
        };
        archivesToRecord.push(archiveEntry);
      }

      // Flush session back to empty state
      roster.bookedSeats = {};
      roster.updatedAt = new Date().toISOString();
    }

    state.version += 1;
    inMemoryState = state;

    await persistStateToDisk(state);

    // Save archive history
    if (archivesToRecord.length > 0) {
      await recordArchivesToDisk(archivesToRecord);
    }

    return {
      success: true,
      archived: archivesToRecord,
      newState: state
    };
  } finally {
    release();
  }
}

/**
 * Append archives to roster-archives.json
 */
async function recordArchivesToDisk(newArchives: ArchivedRoster[]): Promise<void> {
  ensureDataDir();
  let existing: ArchivedRoster[] = [];

  if (fs.existsSync(ARCHIVE_FILE)) {
    try {
      const raw = await fs.promises.readFile(ARCHIVE_FILE, 'utf-8');
      existing = JSON.parse(raw);
    } catch {
      existing = [];
    }
  }

  const updated = [...existing, ...newArchives];
  try {
    await fs.promises.writeFile(ARCHIVE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[BoardroomStore] Failed to write archive file:', err);
  }
}
