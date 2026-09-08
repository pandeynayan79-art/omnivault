/**
 * OmniVault Zero-Dependency Cloud Database Client
 * Interacts directly with Supabase PostgREST API using standard global fetch.
 */

import { MediaItem, AtomicNote, User, UserCredentials, Session } from '@/types';

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}

function getHeaders(key: string, prefer?: string): HeadersInit {
  const h: Record<string, string> = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (prefer) {
    h['Prefer'] = prefer;
  }
  return h;
}

// ─────────────────────────────────────────────────────────────
// Mapping Helpers (PostgreSQL snake_case <-> TypeScript camelCase)
// ─────────────────────────────────────────────────────────────

function mapRowToMedia(row: any): MediaItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    creator: row.creator,
    releaseYear: row.release_year ?? undefined,
    coverImage: row.cover_image ?? undefined,
    backdropImage: row.backdrop_image ?? undefined,
    rating: row.rating !== null ? Number(row.rating) : undefined,
    status: row.status,
    format: row.format ?? undefined,
    genres: row.genres || [],
    dateLogged: row.date_logged || row.created_at?.slice(0, 10),
    dateCompleted: row.date_completed ?? undefined,
    takeaway: row.takeaway ?? undefined,
    notes: row.notes ?? undefined,
    quotes: row.quotes || [],
    isPublic: row.is_public ?? true,
    tags: row.tags || [],
    externalId: row.external_id ?? undefined,
    externalUrl: row.external_url ?? undefined,
    pageCount: row.page_count ?? undefined,
    runtimeMinutes: row.runtime_minutes ?? undefined,
    addedBy: row.added_by || undefined,
    userId: row.user_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMediaToRow(item: Partial<MediaItem>): any {
  const row: any = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.type !== undefined) row.type = item.type;
  if (item.title !== undefined) row.title = item.title;
  if (item.creator !== undefined) row.creator = item.creator;
  if (item.releaseYear !== undefined) row.release_year = item.releaseYear;
  if (item.coverImage !== undefined) row.cover_image = item.coverImage;
  if (item.backdropImage !== undefined) row.backdrop_image = item.backdropImage;
  if (item.rating !== undefined) row.rating = item.rating;
  if (item.status !== undefined) row.status = item.status;
  if (item.format !== undefined) row.format = item.format;
  if (item.genres !== undefined) row.genres = item.genres;
  if (item.dateLogged !== undefined) row.date_logged = item.dateLogged;
  if (item.dateCompleted !== undefined) row.date_completed = item.dateCompleted;
  if (item.takeaway !== undefined) row.takeaway = item.takeaway;
  if (item.notes !== undefined) row.notes = item.notes;
  if (item.quotes !== undefined) row.quotes = item.quotes;
  if (item.isPublic !== undefined) row.is_public = item.isPublic;
  if (item.tags !== undefined) row.tags = item.tags;
  if (item.externalId !== undefined) row.external_id = item.externalId;
  if (item.externalUrl !== undefined) row.external_url = item.externalUrl;
  if (item.pageCount !== undefined) row.page_count = item.pageCount;
  if (item.runtimeMinutes !== undefined) row.runtime_minutes = item.runtimeMinutes;
  if (item.addedBy !== undefined) row.added_by = item.addedBy;
  if (item.userId !== undefined) row.user_id = item.userId;
  return row;
}

function mapRowToNote(row: any): AtomicNote {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    authorName: row.author_name || undefined,
    title: row.title,
    content: row.content,
    tags: row.tags || [],
    linkedMediaIds: row.linked_media_ids || [],
    isPublic: row.is_public ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapNoteToRow(note: Partial<AtomicNote>): any {
  const row: any = {};
  if (note.id !== undefined) row.id = note.id;
  if (note.userId !== undefined) row.user_id = note.userId;
  if (note.authorName !== undefined) row.author_name = note.authorName;
  if (note.title !== undefined) row.title = note.title;
  if (note.content !== undefined) row.content = note.content;
  if (note.tags !== undefined) row.tags = note.tags;
  if (note.linkedMediaIds !== undefined) row.linked_media_ids = note.linkedMediaIds;
  if (note.isPublic !== undefined) row.is_public = note.isPublic;
  return row;
}

// ─────────────────────────────────────────────────────────────
// Cloud Database CRUD Operations
// ─────────────────────────────────────────────────────────────

export async function fetchCloudMedia(): Promise<MediaItem[]> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/media_items?select=*&order=created_at.desc`, {
    headers: getHeaders(key),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.statusText}`);
  const rows = await res.json();
  return rows.map(mapRowToMedia);
}

export async function insertCloudMedia(item: Partial<MediaItem>): Promise<MediaItem> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) throw new Error('Supabase is not configured');
  const payload = mapMediaToRow(item);
  const res = await fetch(`${url}/rest/v1/media_items`, {
    method: 'POST',
    headers: getHeaders(key, 'return=representation'),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Insert failed: ${await res.text()}`);
  const inserted = await res.json();
  return mapRowToMedia(inserted[0]);
}

export async function updateCloudMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) throw new Error('Supabase is not configured');
  const payload = {
    ...mapMediaToRow(updates),
    updated_at: new Date().toISOString()
  };
  const res = await fetch(`${url}/rest/v1/media_items?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getHeaders(key, 'return=representation'),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update failed: ${await res.text()}`);
  const updated = await res.json();
  return mapRowToMedia(updated[0]);
}

export async function deleteCloudMedia(id: string): Promise<boolean> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return false;
  const res = await fetch(`${url}/rest/v1/media_items?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders(key),
  });
  return res.ok;
}

export async function fetchCloudNotes(): Promise<AtomicNote[]> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/atomic_notes?select=*&order=created_at.desc`, {
    headers: getHeaders(key),
    cache: 'no-store'
  });
  if (!res.ok) return [];
  const rows = await res.json();
  return rows.map(mapRowToNote);
}

export async function insertCloudNote(note: Partial<AtomicNote>): Promise<AtomicNote> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) throw new Error('Supabase is not configured');
  const payload = mapNoteToRow(note);
  const res = await fetch(`${url}/rest/v1/atomic_notes`, {
    method: 'POST',
    headers: getHeaders(key, 'return=representation'),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Insert note failed: ${await res.text()}`);
  const inserted = await res.json();
  return mapRowToNote(inserted[0]);
}

export async function updateCloudNote(id: string, updates: Partial<AtomicNote>): Promise<AtomicNote> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) throw new Error('Supabase is not configured');
  const payload = {
    ...mapNoteToRow(updates),
    updated_at: new Date().toISOString()
  };
  const res = await fetch(`${url}/rest/v1/atomic_notes?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getHeaders(key, 'return=representation'),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update note failed: ${await res.text()}`);
  const updated = await res.json();
  return mapRowToNote(updated[0]);
}

export async function deleteCloudNote(id: string): Promise<boolean> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return false;
  const res = await fetch(`${url}/rest/v1/atomic_notes?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders(key),
  });
  return res.ok;
}

// ─────────────────────────────────────────────────────────────
// Cloud Auth & Session Operations
// ─────────────────────────────────────────────────────────────

export async function fetchCloudUserByEmail(email: string): Promise<UserCredentials | null> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  const res = await fetch(`${url}/rest/v1/vault_users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=*`, {
    headers: getHeaders(key),
    cache: 'no-store'
  });
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    passwordHash: r.password_hash,
    salt: r.salt,
    role: r.role,
    createdAt: r.created_at,
  };
}

export async function fetchCloudUserById(id: string): Promise<User | null> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  const res = await fetch(`${url}/rest/v1/vault_users?id=eq.${encodeURIComponent(id)}&select=id,email,name,role,created_at`, {
    headers: getHeaders(key),
    cache: 'no-store'
  });
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    createdAt: r.created_at,
  };
}

export async function insertCloudUser(user: UserCredentials): Promise<User> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) throw new Error('Supabase is not configured');
  const payload = {
    id: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name,
    password_hash: user.passwordHash,
    salt: user.salt,
    role: user.role,
    created_at: user.createdAt || new Date().toISOString(),
  };
  const res = await fetch(`${url}/rest/v1/vault_users`, {
    method: 'POST',
    headers: getHeaders(key, 'return=representation'),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create cloud user: ${await res.text()}`);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: payload.created_at,
  };
}

export async function insertCloudSession(session: Session): Promise<void> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return;
  const payload = {
    id: session.token,
    user_id: session.userId,
    created_at: new Date().toISOString(),
    expires_at: session.expiresAt,
  };
  await fetch(`${url}/rest/v1/vault_sessions`, {
    method: 'POST',
    headers: getHeaders(key),
    body: JSON.stringify(payload),
  });
}

export async function fetchCloudSession(token: string): Promise<Session | null> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  const res = await fetch(`${url}/rest/v1/vault_sessions?id=eq.${encodeURIComponent(token)}&select=*`, {
    headers: getHeaders(key),
    cache: 'no-store'
  });
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    token: r.id,
    userId: r.user_id,
    expiresAt: r.expires_at,
  };
}

export async function deleteCloudSession(sessionId: string): Promise<void> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return;
  await fetch(`${url}/rest/v1/vault_sessions?id=eq.${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
    headers: getHeaders(key),
  });
}
