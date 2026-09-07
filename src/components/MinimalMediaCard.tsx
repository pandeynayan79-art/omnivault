'use client';

import React, { useState } from 'react';
import { Star, Film, BookOpen, Lock } from 'lucide-react';
import { MediaItem } from '@/types';

interface MinimalMediaCardProps {
  item: MediaItem;
  onClick: () => void;
}

export function MinimalMediaCard({ item, onClick }: MinimalMediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const isBook = item.type === 'book' || item.type === 'article';

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer flex flex-col transition-all duration-200"
    >
      {/* Cover / Poster Container */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 group-hover:border-zinc-600 transition-all shadow-sm group-hover:shadow-xl">
        {item.coverImage && !imageError ? (
          <img
            src={item.coverImage}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          /* Editorial Hardcover / Poster Fallback */
          <div className="w-full h-full relative flex flex-col justify-between p-3.5 bg-gradient-to-b from-zinc-800/90 via-zinc-900 to-zinc-950 text-center border-l-4 border-l-amber-600/40 select-none overflow-hidden">
            {/* Subtle Texture & Spine Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black/30 pointer-events-none" />
            
            {/* Top Indicator */}
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                {isBook ? 'Novel' : 'Film'}
              </span>
              {isBook ? (
                <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
              ) : (
                <Film className="w-3.5 h-3.5 text-zinc-600" />
              )}
            </div>

            {/* Title in Editorial Serif */}
            <div className="my-auto py-2 z-10">
              <p className="font-serif text-xs sm:text-sm font-bold text-zinc-100 line-clamp-3 leading-snug tracking-tight">
                {item.title}
              </p>
              <div className="w-6 h-0.5 bg-amber-500/40 mx-auto my-2 rounded-full" />
            </div>

            {/* Creator Attribution */}
            <div className="z-10">
              <p className="text-[10px] font-sans text-zinc-400 truncate uppercase tracking-wider font-medium">
                {item.creator}
              </p>
              {item.releaseYear && (
                <p className="text-[9px] text-zinc-600 font-mono mt-0.5">{item.releaseYear}</p>
              )}
            </div>
          </div>
        )}

        {/* Hover overlay with rating and takeaway hint */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between pointer-events-none">
          <div className="flex items-center justify-between">
            {typeof item.rating === 'number' && item.rating > 0 ? (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-400 border border-amber-400/30">
                <Star className="w-3 h-3 fill-amber-400" />
                {item.rating.toFixed(1)}
              </span>
            ) : <span />}

            {!item.isPublic && (
              <span className="p-1 rounded-md bg-black/80 text-amber-400" title="Private">
                <Lock className="w-3 h-3" />
              </span>
            )}
          </div>

          {item.takeaway && (
            <p className="text-[11px] text-zinc-200 italic line-clamp-2 leading-tight">
              “{item.takeaway}”
            </p>
          )}
        </div>
      </div>

      {/* Clean Minimal Typography Below Poster */}
      <div className="mt-2 space-y-0.5">
        <h3 className="text-xs sm:text-sm font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
          <span className="truncate">{item.creator}</span>
          {item.releaseYear && <span>• {item.releaseYear}</span>}
          {/* Status Dot */}
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ml-auto ${
              item.status === 'completed'
                ? 'bg-emerald-500'
                : item.status === 'in_progress'
                ? 'bg-amber-500'
                : 'bg-zinc-600'
            }`}
            title={item.status}
          />
        </div>
        {item.addedBy && (
          <p className="text-[10px] text-zinc-500 truncate">
            Added by <span className="text-zinc-400">{item.addedBy}</span>
          </p>
        )}
      </div>
    </div>
  );
}
