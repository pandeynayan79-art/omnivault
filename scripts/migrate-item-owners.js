#!/usr/bin/env node

/**
 * Migration Script: Assign unassigned media items and notes to Owner (Nayan Pandey)
 */

const fs = require('fs');
const path = require('path');

// Load environment from .env.local
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

const OWNER_ID = 'u-owner';
const OWNER_NAME = 'Nayan Pandey';

async function migrateSupabase() {
  if (!url || !key) {
    console.log('No Supabase credentials found in .env.local. Skipping Supabase migration.');
    return;
  }

  console.log('Connecting to Supabase at:', url);
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  };

  try {
    const usersRes = await fetch(`${url}/rest/v1/vault_users?select=id,email,name`, { headers });
    const users = await usersRes.json();
    console.log('Existing users in Supabase:', users);
    let owner = Array.isArray(users) ? users.find(u => u.email.toLowerCase() === 'paneynayan79@gmail.com') : null;
    const ownerId = owner ? owner.id : OWNER_ID;
    console.log(`Using owner ID: ${ownerId}`);

    // Update media items where user_id is null
    const patchRes = await fetch(`${url}/rest/v1/media_items?user_id=is.null`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: ownerId,
        added_by: OWNER_NAME
      })
    });

    if (patchRes.ok) {
      const patched = await patchRes.json();
      console.log(`✓ Updated ${patched.length} unassigned media items in Supabase to owner (${ownerId})`);
    } else {
      console.warn('Failed to patch unassigned media items:', await patchRes.text());
    }

    // Update atomic notes where user_id is null
    const patchNotesRes = await fetch(`${url}/rest/v1/atomic_notes?user_id=is.null`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: ownerId
      })
    });

    if (patchNotesRes.ok) {
      const patchedNotes = await patchNotesRes.json();
      console.log(`✓ Updated ${patchedNotes.length} unassigned atomic notes in Supabase to owner (${ownerId})`);
    } else {
      console.warn('Failed to patch unassigned notes:', await patchNotesRes.text());
    }

  } catch (err) {
    console.error('Error during Supabase migration:', err);
  }
}

function migrateLocalDb() {
  const dbPath = path.join(process.cwd(), 'data', 'vault_db.json');
  if (!fs.existsSync(dbPath)) return;

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let updatedCount = 0;

  if (db.media) {
    db.media = db.media.map(item => {
      if (!item.userId) {
        updatedCount++;
        return {
          ...item,
          userId: OWNER_ID,
          addedBy: item.addedBy || OWNER_NAME
        };
      }
      return item;
    });
  }

  if (db.notes) {
    db.notes = db.notes.map(note => {
      if (!note.userId) {
        return {
          ...note,
          userId: OWNER_ID
        };
      }
      return note;
    });
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`✓ Updated ${updatedCount} media items in local data/vault_db.json`);
}

async function run() {
  console.log('--- Starting Owner Assignment Migration ---');
  migrateLocalDb();
  await migrateSupabase();
  console.log('--- Migration Completed ---');
}

run();
