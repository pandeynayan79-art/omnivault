#!/usr/bin/env node

/**
 * OmniVault One-Click Cloud Data Sync
 * Copies your local media items, notes, and users into your 24/7 Supabase Cloud Database.
 * 
 * Usage:
 *   node scripts/sync-to-supabase.js
 */

const fs = require('fs');
const path = require('path');

// Load environment from .env.local or .env if exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    if (k && v) {
      process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('\n❌ Supabase credentials not found!');
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are set in your environment or .env.local\n');
  process.exit(1);
}

const dbPath = path.join(process.cwd(), 'data', 'vault_db.json');
if (!fs.existsSync(dbPath)) {
  console.error('\n❌ Local data/vault_db.json file not found!\n');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function postRow(table, payload) {
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    console.warn(`⚠️ Warning syncing to ${table}:`, errText);
    return false;
  }
  return true;
}

async function sync() {
  console.log('========================================================');
  console.log('       OmniVault — Syncing Local Data to Supabase       ');
  console.log('========================================================');
  console.log(`Target Cloud DB: ${url}`);

  // 1. Sync Users
  if (db.users && db.users.length > 0) {
    console.log(`\n1. Syncing ${db.users.length} users...`);
    for (const u of db.users) {
      const payload = {
        id: u.id,
        email: u.email.toLowerCase().trim(),
        name: u.name,
        password_hash: u.passwordHash,
        salt: u.salt,
        role: u.role || 'contributor',
        created_at: u.createdAt || new Date().toISOString()
      };
      const ok = await postRow('vault_users', payload);
      if (ok) console.log(`  ✓ Synced user: ${u.name} (${u.email})`);
    }
  }

  // 2. Sync Media Items
  if (db.media && db.media.length > 0) {
    console.log(`\n2. Syncing ${db.media.length} media items...`);
    for (const m of db.media) {
      const payload = {
        id: m.id,
        type: m.type,
        title: m.title,
        creator: m.creator,
        release_year: m.releaseYear,
        cover_image: m.coverImage,
        backdrop_image: m.backdropImage,
        rating: m.rating,
        status: m.status,
        format: m.format,
        genres: m.genres,
        date_logged: m.dateLogged,
        date_completed: m.dateCompleted,
        takeaway: m.takeaway,
        notes: m.notes,
        quotes: m.quotes || [],
        is_public: m.isPublic !== undefined ? m.isPublic : true,
        tags: m.tags || [],
        external_id: m.externalId,
        external_url: m.externalUrl,
        page_count: m.pageCount,
        runtime_minutes: m.runtimeMinutes,
        added_by: m.addedBy || 'Nayan Pandey',
        user_id: m.userId || undefined,
        created_at: m.createdAt || new Date().toISOString(),
        updated_at: m.updatedAt || new Date().toISOString()
      };
      const ok = await postRow('media_items', payload);
      if (ok) console.log(`  ✓ Synced media: [${m.type}] ${m.title}`);
    }
  }

  // 3. Sync Notes
  if (db.notes && db.notes.length > 0) {
    console.log(`\n3. Syncing ${db.notes.length} atomic notes...`);
    for (const n of db.notes) {
      const payload = {
        id: n.id,
        title: n.title,
        content: n.content,
        tags: n.tags || [],
        linked_media_ids: n.linkedMediaIds || [],
        is_public: n.isPublic !== undefined ? n.isPublic : true,
        created_at: n.createdAt || new Date().toISOString(),
        updated_at: n.updatedAt || new Date().toISOString()
      };
      const ok = await postRow('atomic_notes', payload);
      if (ok) console.log(`  ✓ Synced note: ${n.title}`);
    }
  }

  console.log('\n========================================================');
  console.log('🎉 Cloud Sync Complete! Your Vault is live in Supabase.');
  console.log('========================================================\n');
}

sync().catch(console.error);
