/**
 * TalkLab 2.0 - Community Debate Poll State & Persistence Engine
 * 
 * Features:
 * - Server-side durable persistence (data/poll-state.json)
 * - Atomic Mutex lock for concurrent vote casting
 * - Full Facilitator / Admin editing & reset capabilities
 * - Automatic poll archiving upon reset (data/poll-archives.json)
 */

import fs from 'fs';
import path from 'path';

export interface PollOptionItem {
  id: number;
  text: string;
  votes: number;
}

export interface PollState {
  id: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  options: PollOptionItem[];
  totalVotes: number;
  updatedAt: string;
  version: number;
}

export interface ArchivedPoll {
  archiveId: string;
  archivedAt: string;
  resetBy: string;
  poll: PollState;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const POLL_FILE = path.join(DATA_DIR, 'poll-state.json');
const POLL_ARCHIVE_FILE = path.join(DATA_DIR, 'poll-archives.json');

const DEFAULT_POLL_STATE: PollState = {
  id: 'poll-weekly-debate',
  title: "Vote On Next Weekend's Debate",
  subtitle: "At TalkLab, our community decides what hits the roundtable floor. Cast your live vote below to shape Saturday's headline topic!",
  isActive: true,
  options: [
    { id: 1, text: 'Is social media ruining Gen-Z conversational skills?', votes: 42 },
    { id: 2, text: 'Will AI make human essay writing completely obsolete?', votes: 38 },
    { id: 3, text: 'Should homework be banned by international law?', votes: 55 },
    { id: 4, text: 'Would you rather speak 10 languages or talk to animals?', votes: 49 }
  ],
  totalVotes: 184,
  updatedAt: new Date().toISOString(),
  version: 1
};

class AsyncMutex {
  private queue: Array<() => void> = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    if (!this.locked) {
      this.locked = true;
      return () => this.release();
    }
    return new Promise(resolve => {
      this.queue.push(() => {
        this.locked = true;
        resolve(() => this.release());
      });
    });
  }

  private release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else {
      this.locked = false;
    }
  }
}

const pollMutex = new AsyncMutex();

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStateFromDisk(): PollState {
  ensureDataDir();
  if (!fs.existsSync(POLL_FILE)) {
    writeStateToDisk(DEFAULT_POLL_STATE);
    return DEFAULT_POLL_STATE;
  }
  try {
    const raw = fs.readFileSync(POLL_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.options)) {
      const totalVotes = parsed.options.reduce((sum: number, o: PollOptionItem) => sum + (o.votes || 0), 0);
      return { ...parsed, totalVotes };
    }
    return DEFAULT_POLL_STATE;
  } catch {
    return DEFAULT_POLL_STATE;
  }
}

function writeStateToDisk(state: PollState): void {
  ensureDataDir();
  const tmpFile = `${POLL_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tmpFile, POLL_FILE);
}

function readArchivesFromDisk(): ArchivedPoll[] {
  ensureDataDir();
  if (!fs.existsSync(POLL_ARCHIVE_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(POLL_ARCHIVE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendArchiveToDisk(archive: ArchivedPoll): void {
  ensureDataDir();
  const archives = readArchivesFromDisk();
  archives.unshift(archive);
  const tmpFile = `${POLL_ARCHIVE_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(archives.slice(0, 50), null, 2), 'utf-8');
  fs.renameSync(tmpFile, POLL_ARCHIVE_FILE);
}

/**
 * Public: Get current Poll State
 */
export async function getPollState(): Promise<PollState> {
  const release = await pollMutex.acquire();
  try {
    return readStateFromDisk();
  } finally {
    release();
  }
}

/**
 * Public: Cast a vote for an option
 */
export async function voteOption(
  optionId: number
): Promise<{ success: boolean; poll?: PollState; error?: string }> {
  const release = await pollMutex.acquire();
  try {
    const state = readStateFromDisk();

    if (!state.isActive) {
      return { success: false, error: 'Voting is currently closed for this poll' };
    }

    const target = state.options.find(o => o.id === optionId);
    if (!target) {
      return { success: false, error: 'Invalid poll option ID' };
    }

    target.votes += 1;
    state.totalVotes = state.options.reduce((sum, o) => sum + o.votes, 0);
    state.updatedAt = new Date().toISOString();
    state.version += 1;

    writeStateToDisk(state);
    return { success: true, poll: state };
  } finally {
    release();
  }
}

/**
 * Admin: Update Poll Title, Subtitle, Status, or Option texts/votes
 */
export async function adminUpdatePoll(updates: {
  title?: string;
  subtitle?: string;
  isActive?: boolean;
  options?: Array<{ id: number; text: string; votes?: number }>;
}): Promise<{ success: boolean; poll: PollState }> {
  const release = await pollMutex.acquire();
  try {
    const state = readStateFromDisk();

    if (updates.title !== undefined) {
      state.title = updates.title.trim() || state.title;
    }
    if (updates.subtitle !== undefined) {
      state.subtitle = updates.subtitle.trim() || state.subtitle;
    }
    if (updates.isActive !== undefined) {
      state.isActive = Boolean(updates.isActive);
    }
    if (Array.isArray(updates.options) && updates.options.length > 0) {
      state.options = updates.options.map(opt => ({
        id: opt.id,
        text: opt.text.trim(),
        votes: Math.max(0, Number(opt.votes) || 0)
      }));
    }

    state.totalVotes = state.options.reduce((sum, o) => sum + o.votes, 0);
    state.updatedAt = new Date().toISOString();
    state.version += 1;

    writeStateToDisk(state);
    return { success: true, poll: state };
  } finally {
    release();
  }
}

/**
 * Admin: Reset Poll (clears all votes back to 0 and archives the old results)
 */
export async function adminResetPoll(
  moderatorId: string = 'facilitator_lead'
): Promise<{ success: boolean; poll: PollState; archived: ArchivedPoll }> {
  const release = await pollMutex.acquire();
  try {
    const state = readStateFromDisk();

    // Create Archive record
    const archive: ArchivedPoll = {
      archiveId: `ARCHIVE-POLL-${Date.now()}`,
      archivedAt: new Date().toISOString(),
      resetBy: moderatorId,
      poll: { ...state }
    };
    appendArchiveToDisk(archive);

    // Reset votes to 0
    state.options = state.options.map(opt => ({ ...opt, votes: 0 }));
    state.totalVotes = 0;
    state.updatedAt = new Date().toISOString();
    state.version += 1;

    writeStateToDisk(state);
    return { success: true, poll: state, archived: archive };
  } finally {
    release();
  }
}
