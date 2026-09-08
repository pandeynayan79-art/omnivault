#!/usr/bin/env node

/**
 * Privatizes Nayan's personal items (is_public: false)
 * and seeds clean public demo entries for visitors and other users.
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
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

const DEMO_MEDIA = [
  {
    id: 'demo-m-1',
    user_id: 'demo',
    added_by: 'OmniVault Curated',
    type: 'movie',
    title: 'Inception',
    creator: 'Christopher Nolan',
    release_year: 2010,
    cover_image: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    rating: 9.5,
    status: 'completed',
    format: 'streaming',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    date_logged: '2026-01-15',
    date_completed: '2026-01-15',
    takeaway: 'A masterclass in cinematic structure exploring dreams within dreams, emotional grief, and subconscious architecture.',
    notes: 'Nolan balances emotional weight with high-concept puzzle design. The spinning top ending remains one of cinema’s most effective metaphors.',
    is_public: true,
    tags: ['sci-fi', 'nolan', 'masterpiece']
  },
  {
    id: 'demo-m-2',
    user_id: 'demo',
    added_by: 'OmniVault Curated',
    type: 'movie',
    title: 'Interstellar',
    creator: 'Christopher Nolan',
    release_year: 2014,
    cover_image: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    rating: 9.0,
    status: 'completed',
    format: 'streaming',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    date_logged: '2026-01-20',
    date_completed: '2026-01-20',
    takeaway: 'When Earth faces ecological collapse, an astronaut embarks on a journey through a wormhole to find humanity a future home.',
    notes: 'Hans Zimmer’s organ-heavy score elevates the interstellar voyage into an overwhelming spiritual meditation on time and love.',
    is_public: true,
    tags: ['sci-fi', 'space', 'cinematography']
  },
  {
    id: 'demo-m-3',
    user_id: 'demo',
    added_by: 'OmniVault Curated',
    type: 'movie',
    title: 'The Shawshank Redemption',
    creator: 'Frank Darabont',
    release_year: 1994,
    cover_image: 'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2NDExXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    rating: 9.5,
    status: 'completed',
    format: 'streaming',
    genres: ['Drama'],
    date_logged: '2026-02-01',
    date_completed: '2026-02-01',
    takeaway: 'Hope is a good thing, maybe the best of things, and no good thing ever dies. A profound study of resilience and friendship.',
    notes: 'Timeless storytelling with exceptional performances by Tim Robbins and Morgan Freeman.',
    is_public: true,
    tags: ['classic', 'drama', 'inspirational']
  },
  {
    id: 'demo-m-4',
    user_id: 'demo',
    added_by: 'OmniVault Curated',
    type: 'movie',
    title: 'Spirited Away (千と千尋の神隠し)',
    creator: 'Hayao Miyazaki',
    release_year: 2001,
    cover_image: 'https://m.media-amazon.com/images/M/MV5BNTEyNmEwOWUtYzkyOC00ZTQ4LTllZmUtMjk0Y2NiNmVlYWFhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    rating: 9.5,
    status: 'completed',
    format: 'streaming',
    genres: ['Animation', 'Adventure', 'Fantasy'],
    date_logged: '2026-02-05',
    date_completed: '2026-02-05',
    takeaway: 'A breathtaking coming-of-age fantasy exploring childhood memory, courage, and environmental stewardship.',
    notes: 'Studio Ghibli at its peak. Every hand-drawn frame overflows with wonder and texture.',
    is_public: true,
    tags: ['ghibli', 'animation', 'fantasy']
  },
  {
    id: 'demo-m-5',
    user_id: 'demo',
    added_by: 'OmniVault Curated',
    type: 'movie',
    title: 'Pashupati Prasad',
    creator: 'Dipendra K. Khanal',
    release_year: 2016,
    cover_image: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Pashupati_Prasad_poster.jpg',
    rating: 9.0,
    status: 'completed',
    format: 'streaming',
    genres: ['Social Drama', 'Satire', 'Nepali Cinema'],
    date_logged: '2026-02-10',
    date_completed: '2026-02-10',
    takeaway: 'A poignant and satirical portrait of economic hardship, social struggle, and human dignity on the banks of Bagmati river.',
    notes: 'Khagendra Lamichhane delivers an iconic performance that redefined modern realist Nepali cinema.',
    is_public: true,
    tags: ['nepali', 'social-drama', 'classic']
  },
  {
    id: 'demo-b-1',
    user_id: 'demo',
    added_by: 'OmniVault Curated',
    type: 'book',
    title: 'Atomic Habits',
    creator: 'James Clear',
    release_year: 2018,
    cover_image: 'https://covers.openlibrary.org/b/id/12539702-L.jpg',
    rating: 9.0,
    status: 'completed',
    format: 'kindle',
    genres: ['Self-Help', 'Productivity', 'Psychology'],
    date_logged: '2026-01-10',
    date_completed: '2026-01-20',
    takeaway: 'You do not rise to the level of your goals. You fall to the level of your systems. Tiny 1% compound improvements create massive results.',
    notes: 'The four laws of behavior change (make it obvious, attractive, easy, and satisfying) provide an actionable blueprint for continuous personal growth.',
    is_public: true,
    tags: ['habits', 'productivity', 'systems']
  },
  {
    id: 'demo-b-2',
    user_id: 'demo',
    added_by: 'OmniVault Curated',
    type: 'book',
    title: 'Karnali Blues (कर्णाली ब्लुज)',
    creator: 'Buddhisagar (बुद्धिसागर)',
    release_year: 2010,
    cover_image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80',
    rating: 9.5,
    status: 'completed',
    format: 'physical',
    genres: ['Nepali Literature', 'Fiction', 'Coming of Age'],
    date_logged: '2026-01-18',
    date_completed: '2026-01-28',
    takeaway: 'A deeply moving story of father-son love, quiet sacrifice, and growing up in Western Nepal. Pure lyrical poetry in prose.',
    notes: 'Buddhisagar transforms rural Nepali existence into tender literature that resonates universally.',
    is_public: true,
    tags: ['nepali', 'buddhisagar', 'literature']
  },
  {
    id: 'demo-b-3',
    user_id: 'demo',
    added_by: 'OmniVault Curated',
    type: 'book',
    title: 'Palpasa Café (पल्पसा क्याफे)',
    creator: 'Narayan Wagle (नारायण वाग्ले)',
    release_year: 2005,
    cover_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
    rating: 9.0,
    status: 'completed',
    format: 'physical',
    genres: ['Nepali Literature', 'Historical Fiction', 'Madan Puraskar'],
    date_logged: '2026-02-02',
    date_completed: '2026-02-12',
    takeaway: 'An essential anti-war masterpiece portraying Nepal’s conflict through the sensitive lens of an artist named Drishya.',
    notes: 'Captures the tragedy of the civil war while celebrating art, connection, and peace.',
    is_public: true,
    tags: ['nepali', 'madan-puraskar', 'classic']
  },
  {
    id: 'demo-b-4',
    user_id: 'demo',
    added_by: 'OmniVault Curated',
    type: 'book',
    title: 'Shirishko Phool (The Blue Mimosa)',
    creator: 'Parijat (पारिजात)',
    release_year: 1964,
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Shirish_ko_Phool.jpg',
    rating: 8.5,
    status: 'completed',
    format: 'physical',
    genres: ['Nepali Literature', 'Existentialism', 'Classics'],
    date_logged: '2026-02-14',
    date_completed: '2026-02-22',
    takeaway: 'A trailblazing modernist novel examining alienation, war weariness, and existential void in post-war Kathmandu.',
    notes: 'Parijat’s radical philosophical prose won the Madan Puraskar and established her as a titan of South Asian literature.',
    is_public: true,
    tags: ['nepali', 'existentialism', 'parijat']
  },
  {
    id: 'demo-b-5',
    user_id: 'demo',
    added_by: 'OmniVault Curated',
    type: 'book',
    title: '1984',
    creator: 'George Orwell',
    release_year: 1949,
    cover_image: 'https://covers.openlibrary.org/b/id/8575742-L.jpg',
    rating: 9.5,
    status: 'completed',
    format: 'kindle',
    genres: ['Dystopian', 'Political Fiction', 'Classics'],
    date_logged: '2026-02-24',
    date_completed: '2026-03-02',
    takeaway: 'A haunting prophecy about state surveillance, censorship, doublespeak, and the struggle for personal autonomy.',
    notes: 'Who controls the past controls the future: who controls the present controls the past.',
    is_public: true,
    tags: ['dystopian', 'orwell', 'classics']
  }
];

const DEMO_NOTES = [
  {
    id: 'demo-n-1',
    user_id: 'demo',
    title: 'The Compounding Math of Daily 1% Improvements',
    content: `# Small Systems Compound Into Exponential Outcomes\n\nIn [[Atomic Habits]], James Clear demonstrates that improving by 1% each day makes you **37 times better** by the end of one year.\n\n$$\\text{Outcome} = (1.01)^{365} \\approx 37.78$$\n\nConversely, deteriorating by 1% daily drops your trajectory toward zero:\n\n$$(0.99)^{365} \\approx 0.03$$\n\nFocus on input habits, frictionless triggers, and identity shifts rather than obsession over outcomes.\n\n#habits #systems #productivity`,
    tags: ['habits', 'systems', 'productivity'],
    linked_media_ids: ['demo-b-1'],
    is_public: true
  },
  {
    id: 'demo-n-2',
    user_id: 'demo',
    title: 'Paternal Silence & Duty in Karnali Blues',
    content: `# The Unspoken Language of Sacrifice\n\nIn [[Karnali Blues (कर्णाली ब्लुज)]], fathers rarely articulate tenderness through words. Instead, love is encoded in quiet endurance—buying exercise books, walking miles in cheap sandals, enduring humiliation to shield children.\n\nBuddhisagar captures this with tender psychological accuracy.\n\n#nepali #literature #parenting`,
    tags: ['nepali', 'literature', 'parenting'],
    linked_media_ids: ['demo-b-2'],
    is_public: true
  }
];

async function updateSupabase() {
  if (!url || !key) {
    console.log('Skipping Supabase update (no credentials).');
    return;
  }

  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  };

  console.log('1. Setting Nayan\'s personal items to private (is_public: false) in Supabase...');
  const patchOwnerRes = await fetch(`${url}/rest/v1/media_items?user_id=eq.u-owner`, {
    method: 'PATCH',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify({ is_public: false })
  });

  if (patchOwnerRes.ok) {
    const patched = await patchOwnerRes.json();
    console.log(`  ✓ Privatized ${patched.length} personal items for owner (u-owner).`);
  } else {
    console.warn('Failed to privatize owner items:', await patchOwnerRes.text());
  }

  // Also privatize owner notes
  await fetch(`${url}/rest/v1/atomic_notes?user_id=eq.u-owner`, {
    method: 'PATCH',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify({ is_public: false })
  });
  console.log('  ✓ Privatized owner atomic notes.');

  // 2. Insert Demo Media Items
  console.log('2. Inserting clean curated Demo entries into Supabase...');
  for (const item of DEMO_MEDIA) {
    const res = await fetch(`${url}/rest/v1/media_items`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(item)
    });
    if (res.ok) {
      console.log(`  ✓ Seeded demo item: ${item.title}`);
    } else {
      console.warn(`  ⚠️ Failed to seed demo item ${item.title}:`, await res.text());
    }
  }

  // 3. Insert Demo Notes
  console.log('3. Inserting clean Demo notes into Supabase...');
  for (const note of DEMO_NOTES) {
    const res = await fetch(`${url}/rest/v1/atomic_notes`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(note)
    });
    if (res.ok) {
      console.log(`  ✓ Seeded demo note: ${note.title}`);
    }
  }
}

function updateLocalDb() {
  const dbPath = path.join(process.cwd(), 'data', 'vault_db.json');
  if (!fs.existsSync(dbPath)) return;

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 1. Privatize owner items
  if (db.media) {
    db.media = db.media.map(item => {
      if (item.userId === 'u-owner' || item.addedBy === 'Nayan Pandey') {
        return { ...item, isPublic: false };
      }
      return item;
    });

    // 2. Add demo items if not present
    for (const dm of DEMO_MEDIA) {
      if (!db.media.some(m => m.id === dm.id)) {
        db.media.push({
          id: dm.id,
          userId: dm.user_id,
          addedBy: dm.added_by,
          type: dm.type,
          title: dm.title,
          creator: dm.creator,
          releaseYear: dm.release_year,
          coverImage: dm.cover_image,
          rating: dm.rating,
          status: dm.status,
          format: dm.format,
          genres: dm.genres,
          dateLogged: dm.date_logged,
          dateCompleted: dm.date_completed,
          takeaway: dm.takeaway,
          notes: dm.notes,
          quotes: [],
          isPublic: true,
          tags: dm.tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  if (db.notes) {
    db.notes = db.notes.map(note => {
      if (note.userId === 'u-owner') {
        return { ...note, isPublic: false };
      }
      return note;
    });

    for (const dn of DEMO_NOTES) {
      if (!db.notes.some(n => n.id === dn.id)) {
        db.notes.push({
          id: dn.id,
          userId: dn.user_id,
          title: dn.title,
          content: dn.content,
          tags: dn.tags,
          linkedMediaIds: dn.linked_media_ids,
          isPublic: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log('✓ Updated local data/vault_db.json');
}

async function run() {
  console.log('=== Privatizing Owner Data & Setting Up Demo Showcase ===');
  updateLocalDb();
  await updateSupabase();
  console.log('=== Finished Successfully ===');
}

run();
