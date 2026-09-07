'use client';

import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Trash2, 
  Edit3, 
  Check, 
  Quote as QuoteIcon, 
  Sparkles, 
  Globe, 
  Lock, 
  Plus, 
  ExternalLink,
  Calendar,
  User,
  Film,
  BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MediaItem, AtomicNote, Quote, MediaStatus } from '@/types';
import { getBacklinksForMedia } from '@/lib/linking';

interface MediaDetailModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onUpdate: (updated: Partial<MediaItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  allNotes: AtomicNote[];
  onSelectNote?: (noteId: string) => void;
}

export function MediaDetailModal({
  item,
  onClose,
  onUpdate,
  onDelete,
  allNotes,
  onSelectNote,
}: MediaDetailModalProps) {
  const [isEditingTakeaway, setIsEditingTakeaway] = useState(false);
  const [editTakeawayText, setEditTakeawayText] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotesMarkdown, setEditNotesMarkdown] = useState('');

  // New quote state
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuotePage, setNewQuotePage] = useState('');
  const [showAddQuote, setShowAddQuote] = useState(false);

  if (!item) return null;

  // Calculate connected atomic notes referencing this media
  const connectedNotes = getBacklinksForMedia(item, allNotes);

  const handleStartEditTakeaway = () => {
    setEditTakeawayText(item.takeaway || '');
    setIsEditingTakeaway(true);
  };

  const handleSaveTakeaway = async () => {
    await onUpdate({ id: item.id, takeaway: editTakeawayText.trim() });
    setIsEditingTakeaway(false);
  };

  const handleStartEditNotes = () => {
    setEditNotesMarkdown(item.notes || '');
    setIsEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    await onUpdate({ id: item.id, notes: editNotesMarkdown.trim() });
    setIsEditingNotes(false);
  };

  const handleAddQuote = async () => {
    if (!newQuoteText.trim()) return;
    const newQuote: Quote = {
      id: `q-${Date.now()}`,
      quote: newQuoteText.trim(),
      page: newQuotePage.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    const updatedQuotes = [...(item.quotes || []), newQuote];
    await onUpdate({ id: item.id, quotes: updatedQuotes });
    setNewQuoteText('');
    setNewQuotePage('');
    setShowAddQuote(false);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    const updatedQuotes = (item.quotes || []).filter(q => q.id !== quoteId);
    await onUpdate({ id: item.id, quotes: updatedQuotes });
  };

  const handleTogglePublic = async () => {
    await onUpdate({ id: item.id, isPublic: !item.isPublic });
  };

  const handleStatusChange = async (newStatus: MediaStatus) => {
    await onUpdate({ 
      id: item.id, 
      status: newStatus,
      dateCompleted: newStatus === 'completed' ? new Date().toISOString().slice(0, 10) : item.dateCompleted
    });
  };

  const handleRatingChange = async (newRating: number) => {
    await onUpdate({ id: item.id, rating: newRating });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-vault-900 border border-vault-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 border-b border-vault-800 flex items-center justify-between bg-vault-950/80">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-vault-800 text-slate-300 border border-vault-700">
              {item.type}
            </span>
            {item.format && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-vault-800/60 text-slate-400">
                {item.format}
              </span>
            )}
            <button
              onClick={handleTogglePublic}
              className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md border transition-all ${
                item.isPublic 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
              }`}
            >
              {item.isPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
              <span>{item.isPublic ? 'Public' : 'Private'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm(`Delete "${item.title}" from your vault?`)) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-vault-800 rounded-lg transition-colors"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-vault-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* Main Visual Header (Cover + Info) */}
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Poster / Cover Art */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              {item.coverImage ? (
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-32 sm:w-40 h-48 sm:h-60 object-cover rounded-xl shadow-xl border border-vault-700/60"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-32 sm:w-40 h-48 sm:h-60 rounded-xl bg-vault-950 border border-vault-800 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                  {item.type === 'movie' || item.type === 'tv' ? (
                    <Film className="w-8 h-8 mb-2" />
                  ) : (
                    <BookOpen className="w-8 h-8 mb-2" />
                  )}
                  <span className="text-xs">No Cover Image</span>
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight leading-tight">
                  {item.title}
                </h1>
                <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.creator}</span>
                  {item.releaseYear && <span>• {item.releaseYear}</span>}
                </p>
              </div>

              {/* Rating Control */}
              <div className="p-2.5 bg-vault-950/70 rounded-xl border border-vault-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-slate-100">
                    {item.rating ? item.rating.toFixed(1) : 'Unrated'}
                  </span>
                  <span className="text-xs text-slate-500">/ 10</span>
                </div>
                <div className="flex items-center gap-1">
                  {[6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleRatingChange(score)}
                      className={`text-xs px-2 py-0.5 rounded font-bold transition-all ${
                        Math.round(item.rating || 0) === score
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-vault-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(e.target.value as MediaStatus)}
                  className="text-xs bg-vault-950 border border-vault-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="completed">Completed / Finished</option>
                  <option value="in_progress">Currently Consuming</option>
                  <option value="want_to_consume">Want to Experience</option>
                  <option value="abandoned">Abandoned</option>
                </select>
                {item.dateCompleted && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 ml-auto">
                    <Calendar className="w-3 h-3" />
                    <span>{item.dateCompleted}</span>
                  </span>
                )}
              </div>

              {/* Genres & Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.genres?.map(g => (
                  <span key={g} className="text-[11px] px-2 py-0.5 rounded-md bg-vault-800 text-slate-300">
                    {g}
                  </span>
                ))}
                {item.tags?.map(t => (
                  <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Personal Takeaway Section */}
          <div className="p-4 rounded-xl bg-vault-950/80 border border-vault-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Personal Takeaway (Key Impression)
              </span>
              {!isEditingTakeaway && (
                <button
                  onClick={handleStartEditTakeaway}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            {isEditingTakeaway ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={editTakeawayText}
                  onChange={(e) => setEditTakeawayText(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm bg-vault-900 border border-vault-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingTakeaway(false)}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTakeaway}
                    className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                {item.takeaway ? `“${item.takeaway}”` : <span className="text-slate-600 not-italic">No takeaway written yet. Add one to capture your impression!</span>}
              </p>
            )}
          </div>

          {/* Highlighted Quotes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QuoteIcon className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Highlighted Quotes ({item.quotes?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setShowAddQuote(!showAddQuote)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Quote
              </button>
            </div>

            {/* Add quote input */}
            {showAddQuote && (
              <div className="p-3 bg-vault-950 rounded-xl border border-amber-500/40 space-y-2">
                <input
                  type="text"
                  value={newQuoteText}
                  onChange={(e) => setNewQuoteText(e.target.value)}
                  placeholder="Enter a memorable quote..."
                  className="w-full px-3 py-1.5 text-xs bg-vault-900 border border-vault-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400"
                />
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={newQuotePage}
                    onChange={(e) => setNewQuotePage(e.target.value)}
                    placeholder="Page # or location"
                    className="w-32 px-3 py-1 text-xs bg-vault-900 border border-vault-700 rounded-lg text-slate-100"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddQuote(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddQuote}
                      className="px-3 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg"
                    >
                      Save Quote
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quotes list */}
            {item.quotes && item.quotes.length > 0 ? (
              <div className="space-y-2">
                {item.quotes.map((q) => (
                  <div key={q.id} className="p-3 rounded-xl bg-vault-950/60 border border-vault-800/80 flex items-start justify-between gap-3 group">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-slate-200 font-serif italic">
                        “{q.quote}”
                      </p>
                      {q.page && (
                        <p className="text-[11px] text-amber-400 font-sans">
                          Page {q.page} {q.context ? `• ${q.context}` : ''}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteQuote(q.id)}
                      className="text-slate-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete quote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 italic">No quotes added yet.</p>
            )}
          </div>

          {/* Connected Notes & Backlinks (Bidirectional Linking) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Connected Notes & Garden Backlinks ({connectedNotes.length})
              </h3>
            </div>

            {connectedNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {connectedNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      if (onSelectNote) {
                        onSelectNote(note.id);
                        onClose();
                      }
                    }}
                    className="p-3 rounded-xl bg-vault-950/80 border border-vault-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-[1.01] group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                        {note.title}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {note.updatedAt?.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {note.content.replace(/\[\[(.*?)\]\]/g, '$1')}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags?.map(t => (
                        <span key={t} className="text-[10px] text-slate-500">#{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-vault-950/40 rounded-xl border border-vault-800/50 text-xs text-slate-500">
                No atomic notes mention this title yet. You can reference it in any note using <code className="text-emerald-400 bg-vault-900 px-1 py-0.5 rounded">[[{item.title}]]</code> to link them!
              </div>
            )}
          </div>

          {/* In-depth Review / Notes (Markdown) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Extended Reflections & Review (Markdown)
              </span>
              {!isEditingNotes && (
                <button
                  onClick={handleStartEditNotes}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit Review
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={editNotesMarkdown}
                  onChange={(e) => setEditNotesMarkdown(e.target.value)}
                  className="w-full p-3 font-mono text-xs sm:text-sm bg-vault-950 border border-vault-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Reflections
                  </button>
                </div>
              </div>
            ) : item.notes ? (
              <div className="p-4 rounded-xl bg-vault-950/60 border border-vault-800/80 prose-vault text-xs sm:text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {item.notes}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-xs text-slate-600 italic">No extended notes written yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
