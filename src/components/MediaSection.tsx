'use client';

import React, { useState, useMemo } from 'react';
import { Film, BookOpen, Plus } from 'lucide-react';
import { MediaItem, MediaType } from '@/types';
import { MinimalMediaCard } from './MinimalMediaCard';

interface MediaSectionProps {
  title: string;
  icon: 'film' | 'book';
  media: MediaItem[];
  type: 'cinema' | 'books';
  onSelectItem: (item: MediaItem) => void;
  onOpenQuickLog: () => void;
  searchQuery?: string;
  publicFilter: 'all' | 'public_only' | 'private_only';
}

export function MediaSection({
  title,
  icon,
  media,
  type,
  onSelectItem,
  onOpenQuickLog,
  searchQuery = '',
  publicFilter,
}: MediaSectionProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'in_progress' | 'want_to_consume'>('all');

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      // Visibility filter
      if (publicFilter === 'public_only' && !item.isPublic) return false;
      if (publicFilter === 'private_only' && item.isPublic) return false;

      // Type filter
      if (type === 'cinema' && item.type !== 'movie' && item.type !== 'tv') return false;
      if (type === 'books' && item.type !== 'book' && item.type !== 'article') return false;

      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCreator = item.creator.toLowerCase().includes(q);
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchCreator && !matchTags) return false;
      }

      return true;
    });
  }, [media, type, selectedStatus, searchQuery, publicFilter]);

  const IconComponent = icon === 'film' ? Film : BookOpen;
  const statusLabels = type === 'cinema'
    ? { all: 'All', completed: 'Watched', in_progress: 'Watching', want_to_consume: 'Watchlist' }
    : { all: 'All', completed: 'Finished', in_progress: 'Reading', want_to_consume: 'Want to Read' };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <IconComponent className="w-4 h-4 text-zinc-400" />
          <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
            {title}
          </h2>
          <span className="text-xs text-zinc-400 font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
            {filteredMedia.length}
          </span>
        </div>

        {/* Minimal Filters & Add Action */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Status Segmented Pills */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
            {(['all', 'completed', 'in_progress', 'want_to_consume'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedStatus === st
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {statusLabels[st]}
              </button>
            ))}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {filteredMedia.map((item) => (
            <MinimalMediaCard
              key={item.id}
              item={item}
              onClick={() => onSelectItem(item)}
            />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center rounded-xl bg-zinc-900/30 border border-zinc-900 text-zinc-400 text-xs">
          No {type === 'cinema' ? 'movies or series' : 'books or articles'} logged in this view.
        </div>
      )}
    </section>
  );
}
