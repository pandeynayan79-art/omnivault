# OmniVault — Personal Digital Vault & Garden

A personal digital vault and "digital garden" designed for low-friction logging and visual curation of what you watch, read, and think.

Built with **Next.js 14**, **Tailwind CSS**, and **Lucide Icons**.

---

## ✨ Features

### 🎬 1. Media Log (Movies & TV)
- **Zero-Config Search & Auto-Fill**: Auto-pulls posters, release year, director, genres, and synopsis instantly using **iTunes Search API** and **TVMaze API** (zero API keys required) or optional **TMDB API** key.
- **Ratings & Formats**: 1–10 star scoring with dual display, format tags (Streaming, Theater, Blu-ray), and status tracking (Completed, Watching, Wishlist).
- **Personal Takeaways**: 2–3 line impression summaries that capture the essence of what you experienced.
- **Extended Markdown Reviews**: Full in-depth reflection and review space.

### 📚 2. Reading Shelf (Books & Articles)
- **Book Metadata Auto-Fill**: Instant search across **Google Books API** and **Open Library API** for cover art, authors, page counts, and genres.
- **Format Support**: Kindle / E-Reader, Physical Book, Audiobook, Web Article / Essay.
- **Quotes Collection**: Save memorable quotes with page numbers, locations, and source attributions.

### 🧠 3. Atomic Notes & Digital Garden
- **Bidirectional Linking Engine**:
  - Type `[[Book or Movie Title]]` or `[[Another Note]]` anywhere in your thoughts to create live wiki-links.
  - Automatic Backlinks: Opening any book or movie shows all notes that reference it!
  - `#hashtags` support with interactive tag filtering.
- **Markdown Live Preview**: Full GitHub Flavored Markdown support (bold, italics, bullet points, blockquotes, code blocks).

### 📊 4. Yearly / Monthly Stats Dashboard
- **Yearly Progress Bars**: Visual counters for reading goals (e.g., "18 / 25 books read in 2026") and movies watched.
- **Monthly Consumption Pacing**: Interactive monthly bar chart showing books, movies, and thoughts logged per month.
- **Rating Score Distribution**: Histogram breakdown of your rating habits.
- **Genre & Format Diversity**: Visual breakdown of your top explored genres and reading formats.
- **Masterpieces Showcase**: Fast access to all your 8.5+ rated media.

### ⚡ 5. Mobile-First & Quick Entry
- **Sub-5-Second Mobile Capture**: Floating Action Button (`+ Log`) on mobile and keyboard shortcut (`⌘K` / `Ctrl+K`) on desktop.
- **Live Autocomplete**: Select a search result and the form populates automatically.
- **Celebratory Animations**: Confetti particles on successful logging!

### 🌐 6. Public vs. Private Visibility
- Per-item toggle: `is_public: true/false`.
- **Public Garden View (`/public`)**: A shareable portfolio showcasing only public notes, books, and movies to friends without revealing private thoughts or edit controls.

### 💾 7. Data Ownership & Cloud Deployment
- **Local Persistence**: Stores everything locally in `data/vault_db.json`.
- **1-Click Full Backup & Restore**: Download complete JSON dump or upload a previous backup.
- **Supabase PostgreSQL Schema**: Includes `supabase_schema.sql` with Row Level Security (RLS) policies for deploying to Supabase and Vercel.

---

## 🚀 Getting Started

### 1. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Keyboard Shortcuts
- `⌘K` or `Ctrl+K`: Open Quick Log Modal from anywhere.

### 3. Deploying to Vercel & Supabase
1. Push your repository to GitHub.
2. In Supabase, open the SQL Editor and paste the contents of `supabase_schema.sql`.
3. Deploy to Vercel with one click.
