'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  Film, 
  BookOpen, 
  Sparkles, 
  Star, 
  Loader2, 
  Quote as QuoteIcon, 
  Check, 
  Plus, 
  Lock, 
  Globe, 
  Trash2,
  Tv,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MediaItem, AtomicNote, MediaType, MediaStatus, MediaFormat, SearchResultItem, User } from '@/types';
import { searchCuratedCatalog } from '@/lib/curatedCatalog';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMedia: (item: Partial<MediaItem>) => Promise<void>;
  onSaveNote: (note: Partial<AtomicNote>) => Promise<void>;
  initialType?: MediaType | 'note';
  allMedia?: MediaItem[];
  user?: User | null;
}

export function QuickLogModal({
  isOpen,
  onClose,
  onSaveMedia,
  onSaveNote,
  initialType = 'movie',
  allMedia = [],
  user = null,
}: QuickLogModalProps) {
  const [activeTab, setActiveTab] = useState<'movie' | 'tv' | 'book' | 'article' | 'note'>(initialType);
  const [guestName, setGuestName] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [autofilledNotice, setAutofilledNotice] = useState<string | null>(null);

  // Media Form State
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [releaseYear, setReleaseYear] = useState<number | undefined>();
  const [coverImage, setCoverImage] = useState('');
  const [rating, setRating] = useState<number>(8.5);
  const [status, setStatus] = useState<MediaStatus>('completed');
  const [format, setFormat] = useState<MediaFormat>('streaming');
  const [genres, setGenres] = useState<string[]>([]);
  const [takeaway, setTakeaway] = useState('');
  const [notesMarkdown, setNotesMarkdown] = useState('');
  const [quotesList, setQuotesList] = useState<{ id: string; quote: string; page?: string }[]>([]);
  const [quoteInput, setQuoteInput] = useState('');
  const [quotePageInput, setQuotePageInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [dateCompleted, setDateCompleted] = useState<string>(new Date().toISOString().slice(0, 10));

  // Atomic Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [noteTagInput, setNoteTagInput] = useState('');
  const [noteLinkedMediaId, setNoteLinkedMediaId] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const takeawayRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync tab with initialType if changed
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialType);
      setAutofilledNotice(null);
    }
  }, [isOpen, initialType]);

  // Handle format default based on tab
  useEffect(() => {
    if (activeTab === 'movie') setFormat('streaming');
    if (activeTab === 'tv') setFormat('streaming');
    if (activeTab === 'book') setFormat('kindle');
    if (activeTab === 'article') setFormat('article');
    setSearchResults([]);
    setHasSearched(false);
    setAutofilledNotice(null);
    setSearchQuery('');
  }, [activeTab]);

  // LIVE TO LIVE SEARCH: Instant In-Memory Search + Non-blocking Abortable Background Query
  const handleLiveSearch = (value: string) => {
    setSearchQuery(value);

    if (!value.trim() || activeTab === 'note') {
      setSearchResults([]);
      setHasSearched(false);
      abortControllerRef.current?.abort();
      setIsSearching(false);
      return;
    }

    setHasSearched(true);

    // 1. INSTANT 0ms In-Memory search (Nepali & World Catalog)
    const immediateMatches = searchCuratedCatalog(value, activeTab);
    setSearchResults(immediateMatches);

    // 2. Abort previous pending network fetch so keystrokes NEVER lag!
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Non-blocking quick background search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const endpoint = activeTab === 'book' || activeTab === 'article'
          ? `/api/search/books?q=${encodeURIComponent(value.trim())}`
          : `/api/search/movies?q=${encodeURIComponent(value.trim())}&type=${activeTab}`;

        const res = await fetch(endpoint, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          const remoteResults: SearchResultItem[] = data.results || [];
          
          setSearchResults((prev) => {
            const seen = new Set(prev.map((p) => p.title.toLowerCase().replace(/[^a-z0-9]/g, '')));
            const newItems = remoteResults.filter(
              (r) => !seen.has(r.title.toLowerCase().replace(/[^a-z0-9]/g, ''))
            );
            return [...prev, ...newItems];
          });
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Background search error:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 180);
  };

  if (!isOpen) return null;

  // Auto-fill selected item
  const handleSelectSearchResult = (item: SearchResultItem) => {
    setTitle(item.title);
    setCreator(item.creator);
    setReleaseYear(item.releaseYear);
    if (item.coverImage) setCoverImage(item.coverImage);
    if (item.genres && item.genres.length > 0) setGenres(item.genres);
    if (item.overview && !takeaway) {
      setTakeaway(item.overview.slice(0, 180) + '...');
    }

    setAutofilledNotice(`Auto-filled "${item.title}" (${item.releaseYear || 'N/A'}) by ${item.creator}`);
    setSearchResults([]);
    setSearchQuery('');

    // Smooth scroll down to details
    setTimeout(() => {
      takeawayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      takeawayRef.current?.focus();
    }, 150);
  };

  const handleAddQuote = () => {
    if (!quoteInput.trim()) return;
    setQuotesList([
      ...quotesList,
      {
        id: `q-${Date.now()}`,
        quote: quoteInput.trim(),
        page: quotePageInput.trim() || undefined,
      }
    ]);
    setQuoteInput('');
    setQuotePageInput('');
  };

  const handleRemoveQuote = (id: string) => {
    setQuotesList(quotesList.filter(q => q.id !== id));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleAddNoteTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = noteTagInput.trim().replace(/^#/, '');
      if (clean && !noteTags.includes(clean)) {
        setNoteTags([...noteTags, clean]);
      }
      setNoteTagInput('');
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#34d399', '#6366f1', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }
  };

  const resetForm = () => {
    setTitle('');
    setCreator('');
    setReleaseYear(undefined);
    setCoverImage('');
    setRating(8.5);
    setStatus('completed');
    setGenres([]);
    setTakeaway('');
    setNotesMarkdown('');
    setQuotesList([]);
    setTags([]);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setAutofilledNotice(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags([]);
    setNoteLinkedMediaId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'note') {
        if (!noteTitle.trim() && !noteContent.trim()) return;
        await onSaveNote({
          title: noteTitle.trim() || 'Untitled Thought',
          content: noteContent.trim(),
          tags: noteTags,
          linkedMediaIds: noteLinkedMediaId ? [noteLinkedMediaId] : [],
          isPublic,
        });
      } else {
        const contributorName = user ? user.name : (guestName.trim() || 'Guest Contributor');
        const contributorId = user ? user.id : undefined;

        await onSaveMedia({
          type: activeTab,
          title: title.trim(),
          creator: creator.trim() || 'Unknown',
          releaseYear,
          coverImage: coverImage || undefined,
          rating,
          status,
          format,
          genres,
          dateLogged: new Date().toISOString().slice(0, 10),
          dateCompleted: status === 'completed' ? dateCompleted : undefined,
          takeaway: takeaway.trim() || undefined,
          notes: notesMarkdown.trim() || undefined,
          quotes: quotesList.map(q => ({
            ...q,
            createdAt: new Date().toISOString(),
          })),
          isPublic,
          tags,
          addedBy: contributorName,
          userId: contributorId,
        });
      }

      triggerConfetti();
      resetForm();
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick suggestion chips based on active tab
  const suggestions = activeTab === 'book' || activeTab === 'article'
    ? [
        '🇳🇵 Ejoria',
        '🇳🇵 Saya',
        '🇳🇵 Sallipir',
        '🇳🇵 Aaithan',
        '🇳🇵 Summer Love',
        '🇳🇵 Palpasa Café',
        '🇳🇵 Karnali Blues',
        '🇳🇵 Shirishko Phool',
        '🇳🇵 Seto Dharti',
        'Atomic Habits',
        'Thinking Fast and Slow',
        'Sapiens',
        '1984',
        'Dune'
      ]
    : activeTab === 'tv'
    ? ['Severance', 'Breaking Bad', 'Succession', 'Euphoria', 'Chernobyl', 'Game of Thrones']
    : [
        '🇳🇵 Loot',
        '🇳🇵 Pashupati Prasad',
        '🇳🇵 Kabaddi',
        '🇳🇵 Kalo Pothi',
        '🇳🇵 Shambhala',
        '🇳🇵 Chhakka Panja',
        '🇳🇵 Jaari',
        'Inception',
        'Dune: Part Two',
        'Interstellar',
        'Oppenheimer',
        'Parasite',
        '3 Idiots'
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header with Type Switcher */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950/80">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('movie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'movie' 
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movie</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'tv' 
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Show</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'book' 
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Book</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('note')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'note' 
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Atomic Thought</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {activeTab !== 'note' ? (
            <>
              {/* LIVE TO LIVE Search Box */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Auto-Fill Search</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    Nepali & Global Database
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleLiveSearch(e.target.value)}
                    placeholder={
                      activeTab === 'book' || activeTab === 'article'
                        ? "Type book or author (e.g. Ejoria, Saya, Karnali Blues, Atomic Habits)..."
                        : "Type movie or director (e.g. Loot, Pashupati Prasad, Inception)..."
                    }
                    className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-zinc-900 border border-zinc-700/80 focus:border-zinc-500 rounded-xl text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all"
                  />
                  {isSearching && (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Instant Suggestions */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
                  <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">Try:</span>
                  {suggestions.map((sug) => {
                    const cleanTerm = sug.replace(/^[^\w\s]+/, '').trim();
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleLiveSearch(cleanTerm)}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 whitespace-nowrap transition-colors"
                      >
                        {sug}
                      </button>
                    );
                  })}
                </div>

                {/* Auto-filled Success Alert */}
                {autofilledNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{autofilledNotice}</span>
                  </div>
                )}

                {/* Search Results Display */}
                {searchResults.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800 max-h-56 overflow-y-auto pr-1">
                    <span className="text-[11px] font-bold text-zinc-400">
                      Matches Found ({searchResults.length}) — Click to Auto-Fill:
                    </span>
                    {searchResults.map((item) => (
                      <div
                        key={item.externalId}
                        onClick={() => handleSelectSearchResult(item)}
                        className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all flex items-center gap-3 group"
                      >
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-10 h-14 object-cover rounded shadow-md border border-zinc-800 flex-shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-14 bg-zinc-950 rounded flex items-center justify-center text-zinc-500 flex-shrink-0 border border-zinc-800">
                            {item.type === 'movie' || item.type === 'tv' ? <Film className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {item.creator} {item.releaseYear ? `(${item.releaseYear})` : ''}
                          </p>
                          {item.genres && item.genres.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {item.genres.slice(0, 2).map((g) => (
                                <span key={g} className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-950 text-zinc-400">
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="px-2.5 py-1 text-[11px] font-medium bg-zinc-800 text-zinc-200 group-hover:bg-zinc-100 group-hover:text-zinc-950 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                        >
                          <span>Auto-fill</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {hasSearched && !isSearching && searchResults.length === 0 && (
                  <p className="text-xs text-zinc-400 italic pt-1">
                    No direct matches found. You can enter details manually below!
                  </p>
                )}
              </div>

              {/* Title, Creator, Year Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-zinc-600 font-semibold"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {activeTab === 'book' || activeTab === 'article' ? 'Author' : 'Director / Studio'}
                  </label>
                  <input
                    type="text"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder="Creator"
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={releaseYear || ''}
                    onChange={(e) => setReleaseYear(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    placeholder="2026"
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              {/* Cover Image URL & Preview */}
              <div className="flex gap-3 items-center">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-12 h-16 object-cover rounded-xl border border-zinc-800 shadow-sm flex-shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-12 h-16 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-600 text-xs">
                    Cover
                  </div>
                )}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Cover / Poster Image URL</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Auto-filled or paste image link"
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              {/* Rating & Status & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800/80">
                {/* Rating (1–10) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-300">Rating</label>
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      ★ {rating.toFixed(1)} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MediaStatus)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none"
                  >
                    <option value="completed">Completed / Finished</option>
                    <option value="in_progress">Currently Consuming</option>
                    <option value="want_to_consume">Want to Experience (Wishlist)</option>
                    <option value="abandoned">Abandoned</option>
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as MediaFormat)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none"
                  >
                    {activeTab === 'book' || activeTab === 'article' ? (
                      <>
                        <option value="kindle">Kindle / E-Reader</option>
                        <option value="physical">Physical Book</option>
                        <option value="audiobook">Audiobook</option>
                        <option value="article">Web Article / Essay</option>
                      </>
                    ) : (
                      <>
                        <option value="streaming">Streaming (Netflix, HBO, Apple...)</option>
                        <option value="theater">Cinema / Theater</option>
                        <option value="physical">Blu-ray / Disc</option>
                        <option value="other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* 2-3 Line Personal Takeaway */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Personal Takeaway <span className="text-zinc-500 font-normal">(core impression)</span>
                </label>
                <textarea
                  ref={takeawayRef}
                  rows={2}
                  value={takeaway}
                  onChange={(e) => setTakeaway(e.target.value)}
                  placeholder="What resonated most? The core thesis, emotional punch, or takeaway..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                />
              </div>

              {/* Highlighted Quotes */}
              <div className="p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                    <QuoteIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Highlighted Quotes ({quotesList.length})</span>
                  </div>
                </div>

                {quotesList.length > 0 && (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {quotesList.map((q) => (
                      <div key={q.id} className="flex items-start justify-between gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                        <div className="italic text-zinc-300">
                          “{q.quote}” {q.page && <span className="text-amber-400 font-normal not-italic">(p. {q.page})</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuote(q.id)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quoteInput}
                    onChange={(e) => setQuoteInput(e.target.value)}
                    placeholder="Enter a memorable quote..."
                    className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddQuote(); } }}
                  />
                  <input
                    type="text"
                    value={quotePageInput}
                    onChange={(e) => setQuotePageInput(e.target.value)}
                    placeholder="Pg #"
                    className="w-16 px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuote}
                    className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Tags & Visibility */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                {/* Tags */}
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Tags (press Enter)</label>
                  <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl min-h-[36px]">
                    {tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                        #{t}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((tag) => tag !== t))}
                          className="hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={tags.length === 0 ? "Add tags e.g. nepali, novel, philosophy..." : ""}
                      className="flex-1 min-w-[120px] bg-transparent text-xs text-zinc-200 focus:outline-none px-1"
                    />
                  </div>
                </div>

                {/* Public / Private Toggle */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isPublic 
                        ? 'bg-zinc-900 text-emerald-400 border-emerald-500/30' 
                        : 'bg-zinc-900 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {isPublic ? (
                      <>
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Private</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Atomic Note Mode */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Note Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Lessons from Ejoria, Reflections on Karnali Blues..."
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-zinc-600 font-bold"
                />
              </div>

              {/* Connect to Media Item */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Link Directly to Media Item <span className="text-zinc-500 font-normal">(or type [[Title]])</span>
                </label>
                <select
                  value={noteLinkedMediaId}
                  onChange={(e) => setNoteLinkedMediaId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none"
                >
                  <option value="">None (Independent Thought)</option>
                  {allMedia.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.type === 'movie' ? '🎬' : '📚'} {m.title} ({m.creator})
                    </option>
                  ))}
                </select>
              </div>

              {/* Note Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Content <span className="text-zinc-500 font-normal">(Markdown supported)</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Use <code className="text-emerald-400 bg-zinc-800 px-1 rounded">[[Title]]</code> for wikilinks
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="What clicked today? Connect ideas: e.g. 'In [[Palpasa Café]], Narayan Wagle highlights the fragility of youth during war...'"
                  className="w-full p-3.5 text-xs sm:text-sm font-mono bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Tags (press Enter)</label>
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl min-h-[36px]">
                  {noteTags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                      #{t}
                      <button
                        type="button"
                        onClick={() => setNoteTags(noteTags.filter((tag) => tag !== t))}
                        className="hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={noteTagInput}
                    onChange={(e) => setNoteTagInput(e.target.value)}
                    onKeyDown={handleAddNoteTag}
                    placeholder="Add tags e.g. nepali-books, philosophy..."
                    className="flex-1 min-w-[140px] bg-transparent text-xs text-zinc-200 focus:outline-none px-1"
                  />
                </div>
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isPublic 
                      ? 'bg-zinc-900 text-emerald-400 border-emerald-500/30' 
                      : 'bg-zinc-900 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isPublic ? (
                    <>
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Public Thought (Visible in Garden)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Private Journal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            {user ? (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Contributing as <strong className="text-zinc-200">{user.name}</strong></span>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <span className="text-[11px] text-zinc-400 whitespace-nowrap">Your name:</span>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Contributor name"
                  className="w-full px-2.5 py-1 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Log to Vault</span>
                </>
              )}
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}
