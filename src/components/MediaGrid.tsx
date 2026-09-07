'use client';

import React, { useState, useMemo } from 'react';
import { 
  Film, 
  BookOpen, 
  Tv, 
  FileText, 
  Star, 
  Quote as QuoteIcon, 
  Sparkles, 
  Plus, 
  Filter, 
  ArrowUpDown,
  Lock,
  Globe
} from 'lucide-react';
import { MediaItem, MediaType, MediaStatus, AtomicNote } from '@/types';
import { getBacklinksForMedia } from '@/lib/linking';

interface MediaGridProps {
  media: MediaItem[];
  allNotes: AtomicNote[];
  onSelectItem: (item: MediaItem) => void;
  onOpenQuickLog: () => void;
  publicFilter: 'all' | 'public_only' | 'private_only';
  searchQuery: string;
  defaultTypeFilter?: 'all' | 'movie' | 'tv' | 'book' | 'article';
}

export function MediaGrid({
  media,
  allNotes,
  onSelectItem,
  onOpenQuickLog,
  publicFilter,
  searchQuery,
  defaultTypeFilter = 'all',
}: MediaGridProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'tv' | 'book' | 'article'>(defaultTypeFilter);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'year' | 'title'>('date');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Compute genres available
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    media.forEach(m => (m.genres || []).forEach(g => set.add(g)));
    return Array.from(set);
  }, [media]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return media.filter(item => {
      // Visibility
      if (publicFilter === 'public_only' && !item.isPublic) return false;
      if (publicFilter === 'private_only' && item.isPublic) return false;

      // Type
      if (selectedType !== 'all') {
        if (selectedType === 'movie' && item.type !== 'movie') return false;
        if (selectedType === 'tv' && item.type !== 'tv') return false;
        if (selectedType === 'book' && item.type !== 'book') return false;
        if (selectedType === 'article' && item.type !== 'article') return false;
      }

      // Status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

      // Genre
      if (selectedGenre !== 'all' && !item.genres?.includes(selectedGenre)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchCreator = item.creator.toLowerCase().includes(query);
        const matchTags = item.tags?.some(t => t.toLowerCase().includes(query));
        const matchTakeaway = item.takeaway?.toLowerCase().includes(query);
        if (!matchTitle && !matchCreator && !matchTags && !matchTakeaway) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'year') {
        return (b.releaseYear || 0) - (a.releaseYear || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // Default: date logged or created
      return new Date(b.dateLogged || b.createdAt).getTime() - new Date(a.dateLogged || a.createdAt).getTime();
    });
  }, [media, publicFilter, selectedType, selectedStatus, selectedGenre, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Type Filters, Status, Sort */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-vault-900/60 p-3 sm:p-4 rounded-2xl border border-vault-800/80">
        {/* Type pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedType === 'all'
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'bg-vault-800/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Shelf ({media.length})
          </button>
          <button
            onClick={() => setSelectedType('movie')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedType === 'movie'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-vault-800/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3 h-3" /> Movies
          </button>
          <button
            onClick={() => setSelectedType('tv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedType === 'tv'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-vault-800/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3 h-3" /> TV
          </button>
          <button
            onClick={() => setSelectedType('book')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedType === 'book'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-vault-800/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3 h-3" /> Books
          </button>
          <button
            onClick={() => setSelectedType('article')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedType === 'article'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-vault-800/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3 h-3" /> Articles
          </button>
        </div>

        {/* Status, Genre & Sorting Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-vault-950 border border-vault-700/80 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="want_to_consume">Wishlist</option>
            <option value="abandoned">Abandoned</option>
          </select>

          {/* Genre Filter */}
          {allGenres.length > 0 && (
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="text-xs bg-vault-950 border border-vault-700/80 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500 hidden sm:block"
            >
              <option value="all">All Genres</option>
              {allGenres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}

          {/* Sort */}
          <div className="flex items-center gap-1 bg-vault-950 border border-vault-700/80 rounded-xl px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent text-slate-300 focus:outline-none"
            >
              <option value="date" className="bg-vault-950">Recent</option>
              <option value="rating" className="bg-vault-950">Rating</option>
              <option value="year" className="bg-vault-950">Year</option>
              <option value="title" className="bg-vault-950">Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Media Cards Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => {
            const connectedNotes = getBacklinksForMedia(item, allNotes);
            const quotesCount = item.quotes?.length || 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group relative flex flex-col bg-vault-900/90 border border-vault-800/80 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {/* Poster Cover Art Container */}
                <div className="relative aspect-[2/3] w-full bg-vault-950 overflow-hidden">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-500 bg-gradient-to-b from-vault-900 to-vault-950">
                      {item.type === 'movie' || item.type === 'tv' ? (
                        <Film className="w-8 h-8 mb-2 text-indigo-400/50" />
                      ) : (
                        <BookOpen className="w-8 h-8 mb-2 text-amber-400/50" />
                      )}
                      <span className="text-xs font-semibold text-slate-400 line-clamp-2">{item.title}</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top Badges (Rating & Visibility) */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    {/* Rating Pill */}
                    {typeof item.rating === 'number' && item.rating > 0 ? (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-amber-400 border border-amber-400/30 shadow-md">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {item.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span />
                    )}

                    {/* Public/Private icon */}
                    <span className="p-1 rounded-full bg-black/60 backdrop-blur-md text-slate-300">
                      {item.isPublic ? (
                        <Globe className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-amber-400" />
                      )}
                    </span>
                  </div>

                  {/* Bottom Image Overlay Badges (Status & Format) */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] pointer-events-none">
                    <span className={`px-2 py-0.5 rounded-md font-semibold backdrop-blur-md uppercase tracking-wider ${
                      item.status === 'completed'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'in_progress'
                        ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30'
                        : 'bg-vault-900/80 text-slate-300 border border-vault-700/50'
                    }`}>
                      {item.status === 'completed' ? 'Done' : item.status === 'in_progress' ? 'Active' : 'Wishlist'}
                    </span>

                    {item.format && (
                      <span className="px-1.5 py-0.5 rounded bg-black/60 text-slate-300 font-medium capitalize">
                        {item.format}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Info Content */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.creator} {item.releaseYear ? `(${item.releaseYear})` : ''}
                    </p>
                  </div>

                  {/* 2-3 Line Takeaway Preview */}
                  {item.takeaway && (
                    <p className="text-[11px] text-slate-300 italic line-clamp-2 leading-relaxed bg-vault-950/50 p-1.5 rounded-lg border border-vault-800/50">
                      “{item.takeaway}”
                    </p>
                  )}

                  {/* Footer Stats (Quotes & Connected Notes) */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-vault-800/50">
                    <div className="flex items-center gap-2">
                      {quotesCount > 0 && (
                        <span className="flex items-center gap-0.5 text-amber-400/90 font-medium" title={`${quotesCount} quotes`}>
                          <QuoteIcon className="w-3 h-3" />
                          {quotesCount}
                        </span>
                      )}
                      {connectedNotes.length > 0 && (
                        <span className="flex items-center gap-0.5 text-emerald-400/90 font-medium" title={`${connectedNotes.length} connected atomic notes`}>
                          <Sparkles className="w-3 h-3" />
                          {connectedNotes.length}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500">
                      {item.dateCompleted || item.dateLogged}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-vault-900/40 border border-vault-800/80 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-vault-800 flex items-center justify-center text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">No media items found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No items match your active filter or search query. Try changing the filters or log a new book or movie.
            </p>
          </div>
          <button
            onClick={onOpenQuickLog}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Quick Log Item
          </button>
        </div>
      )}
    </div>
  );
}
