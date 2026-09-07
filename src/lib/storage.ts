import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MediaItem, AtomicNote, User, UserCredentials, Session } from '@/types';
import {
  isSupabaseConfigured,
  fetchCloudMedia,
  insertCloudMedia,
  updateCloudMedia,
  deleteCloudMedia,
  fetchCloudNotes,
  insertCloudNote,
  updateCloudNote,
  deleteCloudNote,
  fetchCloudUserByEmail,
  fetchCloudUserById,
  insertCloudUser,
  fetchCloudSession,
  insertCloudSession,
  deleteCloudSession
} from './supabaseRest';

interface VaultDatabase {
  media: MediaItem[];
  notes: AtomicNote[];
  users?: UserCredentials[];
  sessions?: Session[];
  settings: {
    tmdbApiKey?: string;
    userName?: string;
    theme?: 'dark' | 'light' | 'system';
    yearlyReadingGoal?: number;
    yearlyMovieGoal?: number;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'vault_db.json');

const INITIAL_DATA: VaultDatabase = {
  settings: {
    userName: 'Vault Explorer',
    yearlyReadingGoal: 25,
    yearlyMovieGoal: 50,
  },
  media: [
    {
      id: 'm-1',
      type: 'movie',
      title: 'Dune: Part Two',
      creator: 'Denis Villeneuve',
      releaseYear: 2024,
      coverImage: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      rating: 9.5,
      status: 'completed',
      format: 'theater',
      genres: ['Sci-Fi', 'Adventure'],
      dateLogged: '2026-02-15',
      dateCompleted: '2026-02-15',
      takeaway: 'A masterclass in epic audiovisual scale. Zimmer’s sound design and Greig Fraser’s cinematography make Arrakis feel alive and menacing.',
      notes: 'Paul Atreides’ tragic journey towards religious fanaticism was handled with terrifying nuance. The shift from reluctant leader to messianic warlord highlights Frank Herbert’s cautionary theme about charismatic leaders.',
      quotes: [
        {
          id: 'q-1',
          quote: 'May thy knife chip and shatter.',
          context: 'Feyd-Rautha duel',
          createdAt: '2026-02-15T20:00:00.000Z',
        }
      ],
      isPublic: true,
      tags: ['scifi', 'cinema', 'epic', 'villeneuve'],
      createdAt: '2026-02-15T22:00:00.000Z',
      updatedAt: '2026-02-15T22:00:00.000Z',
    },
    {
      id: 'm-2',
      type: 'movie',
      title: 'Inception',
      creator: 'Christopher Nolan',
      releaseYear: 2010,
      coverImage: 'https://image.tmdb.org/t/p/w500/o2280dE4tTf0z1B1V43f8uH4PZ6.jpg',
      rating: 9.0,
      status: 'completed',
      format: 'streaming',
      genres: ['Action', 'Sci-Fi', 'Thriller'],
      dateLogged: '2026-01-20',
      dateCompleted: '2026-01-20',
      takeaway: 'One of the tightest original high-concept blockbusters of the 21st century. The emotional anchor (grief over Mal) prevents it from being a cold puzzle box.',
      notes: 'Dreams within dreams structure remains brilliant. Hans Zimmer’s brass horns still give chills during the folding Paris sequence.',
      quotes: [
        {
          id: 'q-2',
          quote: 'An idea is like a virus. Resilient. Highly contagious.',
          context: 'Cobb explaining inception',
          createdAt: '2026-01-20T20:00:00.000Z',
        }
      ],
      isPublic: true,
      tags: ['nolan', 'scifi', 'cinema', 'mindbending'],
      createdAt: '2026-01-20T22:00:00.000Z',
      updatedAt: '2026-01-20T22:00:00.000Z',
    },
    {
      id: 'm-3',
      type: 'book',
      title: 'Karnali Blues (कर्णाली ब्लुज)',
      creator: 'Buddhisagar (बुद्धिसागर)',
      releaseYear: 2010,
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80',
      rating: 9.5,
      status: 'completed',
      format: 'physical',
      genres: ['Nepali Literature', 'Fiction', 'Coming of Age'],
      dateLogged: '2026-02-01',
      dateCompleted: '2026-02-10',
      takeaway: 'A deeply moving exploration of father-son relationships set against the rugged backdrop of Western Nepal (Kalikot and Matera). Raw, emotional, and unforgettable.',
      notes: 'Buddhisagar’s prose turns everyday Nepali rural life into lyrical poetry. The portrayal of the father’s quiet sacrifices resonates long after turning the final page.',
      quotes: [
        {
          id: 'q-3',
          quote: 'आमा माया हुन्, बा कर्तव्य हुन्। माया देखिन्छ, कर्तव्य भोगिन्छ।',
          context: 'Reflecting on paternal devotion',
          createdAt: '2026-02-05T15:00:00.000Z',
        }
      ],
      isPublic: true,
      tags: ['nepali', 'buddhisagar', 'literature', 'emotional'],
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-02-10T18:00:00.000Z',
    },
    {
      id: 'm-4',
      type: 'book',
      title: 'Palpasa Café (पल्पसा क्याफे)',
      creator: 'Narayan Wagle (नारायण वाग्ले)',
      releaseYear: 2005,
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
      rating: 9.0,
      status: 'completed',
      format: 'physical',
      genres: ['Nepali Literature', 'Historical Fiction', 'War & Peace'],
      dateLogged: '2026-01-10',
      dateCompleted: '2026-01-18',
      takeaway: 'An essential anti-war masterpiece portraying Nepal’s civil conflict through the sensitive lens of an artist named Drishya.',
      notes: 'Won the Madan Puraskar for good reason. It humanized the devastation of the insurgency era while preserving tender notes of human vulnerability and art.',
      quotes: [
        {
          id: 'q-4',
          quote: 'कलाले मानिसलाई बाँच्न सिकाउँछ, युद्धले मर्न।',
          context: 'Drishya pondering his canvas',
          createdAt: '2026-01-15T12:00:00.000Z',
        }
      ],
      isPublic: true,
      tags: ['nepali', 'madan-puraskar', 'literature', 'classic'],
      createdAt: '2026-01-10T14:00:00.000Z',
      updatedAt: '2026-01-18T16:00:00.000Z',
    },
    {
      id: 'm-5',
      type: 'book',
      title: 'Atomic Habits',
      creator: 'James Clear',
      releaseYear: 2018,
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80',
      rating: 9.2,
      status: 'completed',
      format: 'kindle',
      genres: ['Self-Help', 'Psychology', 'Productivity'],
      dateLogged: '2026-01-05',
      dateCompleted: '2026-01-12',
      takeaway: 'You do not rise to the level of your goals. You fall to the level of your systems. Make habits obvious, attractive, easy, and satisfying.',
      notes: 'The 1% daily compounding rule makes immense sense. Identity-based habits (becoming the type of person who reads/exercises) stick much better than outcome-driven goals.',
      quotes: [
        {
          id: 'q-5',
          quote: 'Every action you take is a vote for the type of person you wish to become.',
          page: '38',
          createdAt: '2026-01-08T09:00:00.000Z',
        }
      ],
      isPublic: true,
      tags: ['habits', 'productivity', 'psychology'],
      createdAt: '2026-01-05T08:00:00.000Z',
      updatedAt: '2026-01-12T19:00:00.000Z',
    },
  ],
  notes: [
    {
      id: 'n-1',
      title: 'Charismatic Authority & The Paul Atreides Dilemma',
      content: `# Charismatic Leaders as Traps\n\nFrank Herbert's primary warning in Dune is that charismatic leaders should come with a warning label: "May be hazardous to your health."\n\nWhen we surrender critical thinking to an infallible messiah, fanaticism fills the vacuum. Connected to [[Dune: Part Two]].\n\n#philosophy #dune #leadership`,
      tags: ['philosophy', 'dune', 'leadership'],
      linkedMediaIds: ['m-1'],
      isPublic: true,
      createdAt: '2026-02-16T10:00:00.000Z',
      updatedAt: '2026-02-16T10:00:00.000Z',
    },
    {
      id: 'n-2',
      title: 'The Architecture of Grief in Nolan’s Cinema',
      content: `# Memory and Mourning in [[Inception]]\n\nCobb is not trapped by the complexity of dreams; he is trapped by the guilt of planting the idea that killed Mal.\n\nNotice how the totem is not even his own—it belonged to Mal. His real anchor was never physics; it was regret.\n\n#cinema #nolan #inception`,
      tags: ['cinema', 'nolan', 'inception'],
      linkedMediaIds: ['m-2'],
      isPublic: true,
      createdAt: '2026-01-21T11:00:00.000Z',
      updatedAt: '2026-01-21T11:00:00.000Z',
    },
    {
      id: 'n-3',
      title: 'Paternal Silence in Western Nepali Fiction',
      content: `# The Unspoken Debt in [[Karnali Blues (कर्णाली ब्लुज)]]\n\nIn South Asian literature, fathers rarely articulate tenderness through words. Instead, love is encoded in quiet endurance—buying second-hand exercise books, walking miles in cheap sandals, enduring humiliation to shield children.\n\nBuddhisagar captures this with devastating accuracy.\n\n#nepali #literature #parenting`,
      tags: ['nepali', 'literature', 'parenting'],
      linkedMediaIds: ['m-3'],
      isPublic: true,
      createdAt: '2026-02-11T14:00:00.000Z',
      updatedAt: '2026-02-11T14:00:00.000Z',
    },
  ]
};

// ─────────────────────────────────────────────────────────────
// Cryptography & Auth Helpers
// ─────────────────────────────────────────────────────────────

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return check === hash;
}

function sanitizeUser(user: UserCredentials): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// ─────────────────────────────────────────────────────────────
// Local Filesystem Operations (Offline & Dev Fallback)
// ─────────────────────────────────────────────────────────────

function ensureDataFile(): VaultDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let db: VaultDatabase;
    if (!fs.existsSync(DB_FILE)) {
      db = { ...INITIAL_DATA };
    } else {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw) as VaultDatabase;
    }

    if (!db.users) db.users = [];
    if (!db.sessions) db.sessions = [];

    // Seed owner account locally if missing
    const ownerEmail = 'paneynayan79@gmail.com';
    const existingOwner = db.users.find(u => u.email.toLowerCase() === ownerEmail.toLowerCase());
    if (!existingOwner) {
      const { hash, salt } = hashPassword('11223344');
      db.users.push({
        id: 'u-owner',
        email: ownerEmail,
        name: 'Nayan Pandey',
        passwordHash: hash,
        salt: salt,
        role: 'owner',
        createdAt: new Date().toISOString()
      });
      saveDb(db);
    }

    return db;
  } catch (err) {
    console.error('Error reading vault DB, fallback to initial data:', err);
    return INITIAL_DATA;
  }
}

function saveDb(data: VaultDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving vault DB:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// Hybrid Media Item Operations
// ─────────────────────────────────────────────────────────────

export async function getAllMedia(): Promise<MediaItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const cloudItems = await fetchCloudMedia();
      if (cloudItems.length > 0) return cloudItems;
    } catch (err) {
      console.warn('Supabase fetchCloudMedia error, falling back to local:', err);
    }
  }
  const db = ensureDataFile();
  return db.media.sort((a, b) => new Date(b.dateLogged || b.createdAt).getTime() - new Date(a.dateLogged || a.createdAt).getTime());
}

export async function getMediaById(id: string): Promise<MediaItem | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const items = await fetchCloudMedia();
      const match = items.find(m => m.id === id);
      if (match) return match;
    } catch (err) {
      console.warn('Supabase getMediaById error, falling back to local:', err);
    }
  }
  const db = ensureDataFile();
  return db.media.find(m => m.id === id);
}

export async function saveMediaItem(item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<MediaItem> {
  if (isSupabaseConfigured()) {
    try {
      if (item.id) {
        return await updateCloudMedia(item.id, item);
      } else {
        return await insertCloudMedia(item);
      }
    } catch (err) {
      console.warn('Supabase saveMediaItem error, falling back to local save:', err);
    }
  }

  // Local file save
  const db = ensureDataFile();
  const now = new Date().toISOString();

  if (item.id) {
    const index = db.media.findIndex(m => m.id === item.id);
    if (index !== -1) {
      const updated: MediaItem = {
        ...db.media[index],
        ...item,
        id: item.id,
        updatedAt: now,
      };
      db.media[index] = updated;
      saveDb(db);
      return updated;
    }
  }

  const newItem: MediaItem = {
    ...item,
    id: item.id || `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
    quotes: item.quotes || [],
    genres: item.genres || [],
    tags: item.tags || [],
  };

  db.media.unshift(newItem);
  saveDb(db);
  return newItem;
}

export async function deleteMediaItem(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      return await deleteCloudMedia(id);
    } catch (err) {
      console.warn('Supabase deleteMediaItem error, falling back to local:', err);
    }
  }
  const db = ensureDataFile();
  const initialLength = db.media.length;
  db.media = db.media.filter(m => m.id !== id);
  if (db.media.length !== initialLength) {
    saveDb(db);
    return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// Hybrid Atomic Notes Operations
// ─────────────────────────────────────────────────────────────

export async function getAllNotes(): Promise<AtomicNote[]> {
  if (isSupabaseConfigured()) {
    try {
      const notes = await fetchCloudNotes();
      if (notes.length > 0) return notes;
    } catch (err) {
      console.warn('Supabase fetchCloudNotes error, falling back to local:', err);
    }
  }
  const db = ensureDataFile();
  return db.notes.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
}

export async function getNoteById(id: string): Promise<AtomicNote | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const notes = await fetchCloudNotes();
      const match = notes.find(n => n.id === id);
      if (match) return match;
    } catch (err) {
      console.warn('Supabase getNoteById error, falling back to local:', err);
    }
  }
  const db = ensureDataFile();
  return db.notes.find(n => n.id === id);
}

export async function saveNote(note: Partial<AtomicNote> & { id?: string }): Promise<AtomicNote> {
  if (isSupabaseConfigured()) {
    try {
      if (note.id) {
        return await updateCloudNote(note.id, note);
      } else {
        return await insertCloudNote(note);
      }
    } catch (err) {
      console.warn('Supabase saveNote error, falling back to local save:', err);
    }
  }

  const db = ensureDataFile();
  const now = new Date().toISOString();

  if (note.id) {
    const index = db.notes.findIndex(n => n.id === note.id);
    if (index !== -1) {
      const updated: AtomicNote = {
        ...db.notes[index],
        ...note,
        id: note.id,
        updatedAt: now,
      };
      db.notes[index] = updated;
      saveDb(db);
      return updated;
    }
  }

  const newNote: AtomicNote = {
    id: note.id || `n-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: note.title || 'Untitled Note',
    content: note.content || '',
    tags: note.tags || [],
    linkedMediaIds: note.linkedMediaIds || [],
    isPublic: note.isPublic !== undefined ? note.isPublic : true,
    createdAt: now,
    updatedAt: now,
  };

  db.notes.unshift(newNote);
  saveDb(db);
  return newNote;
}

export async function deleteNote(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      return await deleteCloudNote(id);
    } catch (err) {
      console.warn('Supabase deleteNote error, falling back to local:', err);
    }
  }
  const db = ensureDataFile();
  const initialLength = db.notes.length;
  db.notes = db.notes.filter(n => n.id !== id);
  if (db.notes.length !== initialLength) {
    saveDb(db);
    return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// User Settings Operations
// ─────────────────────────────────────────────────────────────

export async function getSettings(): Promise<VaultDatabase['settings']> {
  const db = ensureDataFile();
  return db.settings || INITIAL_DATA.settings;
}

export async function updateSettings(settings: Partial<VaultDatabase['settings']>): Promise<VaultDatabase['settings']> {
  const db = ensureDataFile();
  db.settings = {
    ...db.settings,
    ...settings,
  };
  saveDb(db);
  return db.settings;
}

export async function getFullVaultDump(): Promise<VaultDatabase> {
  return ensureDataFile();
}

export async function restoreVaultDump(dump: VaultDatabase): Promise<boolean> {
  try {
    if (!dump || !Array.isArray(dump.media) || !Array.isArray(dump.notes)) {
      return false;
    }
    saveDb(dump);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Hybrid Authentication & Session Management
// ─────────────────────────────────────────────────────────────

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const cleanEmail = email.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    try {
      const cloudUser = await fetchCloudUserByEmail(cleanEmail);
      if (cloudUser) {
        const isValid = verifyPassword(password, cloudUser.passwordHash, cloudUser.salt);
        if (isValid) return sanitizeUser(cloudUser);
      }
    } catch (err) {
      console.warn('Supabase auth error, falling back to local user store:', err);
    }
  }

  const db = ensureDataFile();
  const user = (db.users || []).find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) return null;
  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) return null;
  return sanitizeUser(user);
}

export async function registerUser(email: string, password: string, name: string, role: 'owner' | 'contributor' | 'guest' = 'contributor'): Promise<User> {
  const cleanEmail = email.toLowerCase().trim();
  const { hash, salt } = hashPassword(password);
  const newUser: UserCredentials = {
    id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    name: name.trim() || cleanEmail.split('@')[0],
    passwordHash: hash,
    salt: salt,
    role,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const existing = await fetchCloudUserByEmail(cleanEmail);
      if (existing) {
        throw new Error('User already exists with this email.');
      }
      return await insertCloudUser(newUser);
    } catch (err: any) {
      console.warn('Supabase register error:', err);
      throw err;
    }
  }

  const db = ensureDataFile();
  if (!db.users) db.users = [];
  if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('User already exists with this email.');
  }

  db.users.push(newUser);
  saveDb(db);
  return sanitizeUser(newUser);
}

export async function createSession(userId: string): Promise<Session> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const session: Session = { token, userId, expiresAt };

  if (isSupabaseConfigured()) {
    try {
      await insertCloudSession(session);
    } catch (err) {
      console.warn('Supabase session save error:', err);
    }
  }

  const db = ensureDataFile();
  if (!db.sessions) db.sessions = [];
  const now = new Date().toISOString();
  db.sessions = db.sessions.filter(s => s.expiresAt > now);
  db.sessions.push(session);
  saveDb(db);
  return session;
}

export async function getSessionUser(token: string): Promise<User | null> {
  if (!token) return null;

  if (isSupabaseConfigured()) {
    try {
      const cloudSession = await fetchCloudSession(token);
      if (cloudSession && new Date(cloudSession.expiresAt).getTime() > Date.now()) {
        const cloudUser = await fetchCloudUserById(cloudSession.userId);
        if (cloudUser) return cloudUser;
      }
    } catch (err) {
      console.warn('Supabase getSessionUser error:', err);
    }
  }

  const db = ensureDataFile();
  const session = (db.sessions || []).find(s => s.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    db.sessions = (db.sessions || []).filter(s => s.token !== token);
    saveDb(db);
    return null;
  }
  const user = (db.users || []).find(u => u.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

export async function deleteSession(token: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await deleteCloudSession(token);
    } catch (err) {
      console.warn('Supabase deleteSession error:', err);
    }
  }

  const db = ensureDataFile();
  db.sessions = (db.sessions || []).filter(s => s.token !== token);
  saveDb(db);
}

export async function getUserById(id: string): Promise<User | null> {
  if (isSupabaseConfigured()) {
    try {
      const cloudUser = await fetchCloudUserById(id);
      if (cloudUser) return cloudUser;
    } catch (err) {
      console.warn('Supabase getUserById error:', err);
    }
  }

  const db = ensureDataFile();
  const user = (db.users || []).find(u => u.id === id);
  return user ? sanitizeUser(user) : null;
}
