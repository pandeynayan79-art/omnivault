'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sparkles, 
  BookOpen, 
  Film, 
  Quote as QuoteIcon, 
  Star, 
  ArrowLeft,
  Calendar,
  Lock
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { MediaItem, AtomicNote } from '@/types';

export default function PublicGardenPage() {
  const [publicMedia, setPublicMedia] = useState<MediaItem[]>([]);
  const [publicNotes, setPublicNotes] = useState<AtomicNote[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'books' | 'movies' | 'thoughts'>('all');
  const [selectedNote, setSelectedNote] = useState<AtomicNote | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPublicData() {
      try {
        const [mRes, nRes] = await Promise.all([
          fetch('/api/media?publicOnly=true'),
          fetch('/api/notes?publicOnly=true'),
        ]);
        if (mRes.ok) {
          const mData = await mRes.json();
          setPublicMedia(mData.media || []);
        }
        if (nRes.ok) {
          const nData = await nRes.json();
          setPublicNotes(nData.notes || []);
        }
      } catch (err) {
        console.error('Failed to load public vault:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPublicData();
  }, []);

  return (
    <div className="min-h-screen bg-vault-950 text-slate-100 flex flex-col">
      {/* Public Header */}
      <header className="glass-panel border-b border-vault-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base">
              Ω
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-100">
                  Public Digital Garden
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Shared Vault
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Curated reflections, reads, and cinema logs</p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vault-900 hover:bg-vault-800 border border-vault-700 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Vault Admin</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Intro Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-vault-900 via-vault-900 to-emerald-950/30 border border-vault-800 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            Open Notebook & Media Shelf
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Cultivating ideas across literature, film, and philosophy.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Welcome to my open digital garden. Here is a live, curated catalog of what I’ve consumed and the atomic notes that sprouted from them.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-slate-100 text-slate-900'
                  : 'bg-vault-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Curations ({publicMedia.length + publicNotes.length})
            </button>
            <button
              onClick={() => setActiveFilter('books')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'books'
                  ? 'bg-amber-600 text-white'
                  : 'bg-vault-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Books ({publicMedia.filter(m => m.type === 'book').length})
            </button>
            <button
              onClick={() => setActiveFilter('movies')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'movies'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-vault-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Cinema ({publicMedia.filter(m => m.type === 'movie' || m.type === 'tv').length})
            </button>
            <button
              onClick={() => setActiveFilter('thoughts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'thoughts'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-vault-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Thoughts ({publicNotes.length})
            </button>
          </div>
        </div>

        {/* Media Grid */}
        {(activeFilter === 'all' || activeFilter === 'books' || activeFilter === 'movies') && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Media Logs & Takeaways</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {publicMedia
                .filter(m => {
                  if (activeFilter === 'books') return m.type === 'book' || m.type === 'article';
                  if (activeFilter === 'movies') return m.type === 'movie' || m.type === 'tv';
                  return true;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="cursor-pointer group flex flex-col bg-vault-900 border border-vault-800/80 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-1"
                  >
                    <div className="relative aspect-[2/3] w-full bg-vault-950">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                          {item.type}
                        </div>
                      )}
                      {item.rating && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-amber-400 border border-amber-400/20">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {item.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <h3 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{item.creator}</p>
                      {item.takeaway && (
                        <p className="text-[11px] text-slate-300 italic line-clamp-2 pt-1 border-t border-vault-800 mt-1">
                          “{item.takeaway}”
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Public Atomic Thoughts */}
        {(activeFilter === 'all' || activeFilter === 'thoughts') && (
          <div className="space-y-4 pt-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Atomic Thoughts & Garden Notes</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className="p-5 rounded-2xl bg-vault-900 border border-vault-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:shadow-xl group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {note.title}
                      </h3>
                      <span className="text-[10px] text-slate-500">
                        {note.updatedAt?.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {note.content.replace(/\[\[(.*?)\]\]/g, '$1')}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-vault-800">
                    {note.tags?.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-vault-950 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note Reader Modal */}
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="max-w-2xl w-full bg-vault-900 border border-vault-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-vault-800">
                <h2 className="text-lg font-bold text-slate-100">{selectedNote.title}</h2>
                <button onClick={() => setSelectedNote(null)} className="text-slate-400 hover:text-white text-sm">
                  ✕
                </button>
              </div>
              <div className="prose-vault text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedNote.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Media Reader Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="max-w-2xl w-full bg-vault-900 border border-vault-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-vault-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{selectedMedia.title}</h2>
                  <p className="text-xs text-slate-400">{selectedMedia.creator} • {selectedMedia.releaseYear}</p>
                </div>
                <button onClick={() => setSelectedMedia(null)} className="text-slate-400 hover:text-white text-sm">
                  ✕
                </button>
              </div>
              {selectedMedia.takeaway && (
                <div className="p-3 rounded-xl bg-vault-950 border border-vault-800 text-xs italic text-slate-200">
                  “{selectedMedia.takeaway}”
                </div>
              )}
              {selectedMedia.notes && (
                <div className="prose-vault text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedMedia.notes}
                  </ReactMarkdown>
                </div>
              )}
              {selectedMedia.quotes && selectedMedia.quotes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <QuoteIcon className="w-3.5 h-3.5" /> Quotes
                  </span>
                  {selectedMedia.quotes.map(q => (
                    <div key={q.id} className="p-2.5 rounded-lg bg-vault-950 border border-vault-800 text-xs italic">
                      “{q.quote}” {q.page && <span className="text-amber-400 not-italic">(p. {q.page})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
