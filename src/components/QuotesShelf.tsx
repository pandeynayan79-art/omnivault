'use client';

import React, { useState, useMemo } from 'react';
import { 
  Quote as QuoteIcon, 
  Search, 
  Copy, 
  Check, 
  BookOpen, 
  Film, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { MediaItem, Quote } from '@/types';

interface QuotesShelfProps {
  media: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  searchQuery: string;
}

interface EnrichedQuote {
  quoteId: string;
  quoteText: string;
  page?: string;
  context?: string;
  createdAt: string;
  mediaItem: MediaItem;
}

export function QuotesShelf({ media, onSelectMedia, searchQuery }: QuotesShelfProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [internalSearch, setInternalSearch] = useState('');

  // Collect all quotes with their media item context
  const allEnrichedQuotes: EnrichedQuote[] = useMemo(() => {
    const list: EnrichedQuote[] = [];
    media.forEach((item) => {
      (item.quotes || []).forEach((q) => {
        list.push({
          quoteId: q.id,
          quoteText: q.quote,
          page: q.page,
          context: q.context,
          createdAt: q.createdAt,
          mediaItem: item,
        });
      });
    });
    // Sort recent first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [media]);

  const filteredQuotes = useMemo(() => {
    const query = (searchQuery || internalSearch).toLowerCase().trim();
    if (!query) return allEnrichedQuotes;

    return allEnrichedQuotes.filter(
      (q) =>
        q.quoteText.toLowerCase().includes(query) ||
        q.mediaItem.title.toLowerCase().includes(query) ||
        q.mediaItem.creator.toLowerCase().includes(query) ||
        (q.context && q.context.toLowerCase().includes(query))
    );
  }, [allEnrichedQuotes, searchQuery, internalSearch]);

  const handleCopyQuote = (q: EnrichedQuote) => {
    const text = `> "${q.quoteText}"\n> — ${q.mediaItem.creator}, *${q.mediaItem.title}*${q.page ? ` (p. ${q.page})` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.quoteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-vault-900/60 p-4 sm:p-5 rounded-2xl border border-vault-800/80">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <QuoteIcon className="w-5 h-5 text-amber-400" />
            <span>Highlighted Quotes Sanctuary</span>
          </h2>
          <p className="text-xs text-slate-400">
            {allEnrichedQuotes.length} memorable lines and passages captured from your reading and watch logs
          </p>
        </div>

        {/* Local Quote Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            placeholder="Filter quote texts..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-vault-950 border border-vault-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Quotes Cards Masonry/Grid */}
      {filteredQuotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotes.map((q) => (
            <div
              key={q.quoteId}
              className="flex flex-col justify-between p-5 rounded-2xl bg-vault-900/80 border border-vault-800/80 hover:border-amber-400/40 transition-all hover:shadow-xl hover:shadow-amber-500/5 group"
            >
              {/* Quote Body */}
              <div className="space-y-3">
                <QuoteIcon className="w-6 h-6 text-amber-400/40 group-hover:text-amber-400 transition-colors" />
                <p className="font-serif text-sm sm:text-base text-slate-100 italic leading-relaxed">
                  “{q.quoteText}”
                </p>
                {q.page && (
                  <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-vault-950 text-amber-400 border border-amber-400/20">
                    Page {q.page}
                  </span>
                )}
                {q.context && (
                  <span className="inline-block text-[11px] text-slate-400 ml-2">
                    • {q.context}
                  </span>
                )}
              </div>

              {/* Attribution Footer */}
              <div className="pt-4 mt-4 border-t border-vault-800/60 flex items-center justify-between gap-3">
                <button
                  onClick={() => onSelectMedia(q.mediaItem)}
                  className="flex items-center gap-2.5 text-left group-hover:opacity-100 transition-opacity"
                >
                  {q.mediaItem.coverImage ? (
                    <img
                      src={q.mediaItem.coverImage}
                      alt={q.mediaItem.title}
                      className="w-7 h-10 object-cover rounded shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-10 rounded bg-vault-800 flex items-center justify-center flex-shrink-0 text-slate-400">
                      {q.mediaItem.type === 'movie' ? <Film className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {q.mediaItem.title}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">
                      {q.mediaItem.creator}
                    </p>
                  </div>
                </button>

                {/* Copy quote markdown button */}
                <button
                  onClick={() => handleCopyQuote(q)}
                  className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-vault-800 rounded-lg transition-colors flex-shrink-0"
                  title="Copy as Markdown Quote"
                >
                  {copiedId === q.quoteId ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-vault-900/40 border border-vault-800 text-slate-500 text-xs">
          No highlighted quotes found. Open any book or movie to add quotes, or use the Quick Log button.
        </div>
      )}
    </div>
  );
}
