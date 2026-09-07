'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Tag as TagIcon, 
  Edit3, 
  Trash2, 
  Globe, 
  Lock, 
  Check, 
  Film, 
  BookOpen, 
  ExternalLink,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AtomicNote, MediaItem } from '@/types';
import { extractWikiLinks, extractTags, resolveLinksInNote } from '@/lib/linking';

interface DigitalGardenProps {
  notes: AtomicNote[];
  allMedia: MediaItem[];
  onSaveNote: (note: Partial<AtomicNote>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onSelectMedia: (media: MediaItem) => void;
  publicFilter: 'all' | 'public_only' | 'private_only';
  searchQuery: string;
}

export function DigitalGarden({
  notes,
  allMedia,
  onSaveNote,
  onDeleteNote,
  onSelectMedia,
  publicFilter,
  searchQuery,
}: DigitalGardenProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  
  // Editor state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Compute all unique tags from notes
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => {
      (n.tags || []).forEach(t => set.add(t.toLowerCase()));
      extractTags(n.content).forEach(t => set.add(t));
    });
    return Array.from(set);
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      // Visibility
      if (publicFilter === 'public_only' && !n.isPublic) return false;
      if (publicFilter === 'private_only' && n.isPublic) return false;

      // Tag filter
      if (selectedTag !== 'all') {
        const hasTag = (n.tags || []).some(t => t.toLowerCase() === selectedTag) ||
                       extractTags(n.content).includes(selectedTag);
        if (!hasTag) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchTags = (n.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchTags) return false;
      }

      return true;
    });
  }, [notes, publicFilter, selectedTag, searchQuery]);

  // Selected note object
  const activeNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || filteredNotes[0] || null;
  }, [notes, selectedNoteId, filteredNotes]);

  // Connected links in active note
  const resolved = useMemo(() => {
    if (!activeNote) return { media: [], otherNotes: [] };
    return resolveLinksInNote(activeNote, allMedia, notes);
  }, [activeNote, allMedia, notes]);

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setEditTitle('');
    setEditContent('');
    setEditTags([]);
    setEditIsPublic(true);
    setIsEditing(true);
  };

  const handleStartEdit = (note: AtomicNote) => {
    setIsCreatingNew(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags || []);
    setEditIsPublic(note.isPublic);
    setIsEditing(true);
  };

  const handleSaveEditor = async () => {
    if (!editTitle.trim() && !editContent.trim()) return;

    const wikilinks = extractWikiLinks(editContent);
    // Find media IDs that match wikilinks
    const matchedMediaIds = allMedia
      .filter(m => wikilinks.some(link => link.toLowerCase() === m.title.toLowerCase()))
      .map(m => m.id);

    const notePayload: Partial<AtomicNote> = {
      title: editTitle.trim() || 'Untitled Thought',
      content: editContent,
      tags: editTags,
      linkedMediaIds: matchedMediaIds,
      isPublic: editIsPublic,
    };

    if (!isCreatingNew && activeNote) {
      notePayload.id = activeNote.id;
    }

    await onSaveNote(notePayload);
    setIsEditing(false);
    setIsCreatingNew(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = editTagInput.trim().replace(/^#/, '').toLowerCase();
      if (clean && !editTags.includes(clean)) {
        setEditTags([...editTags, clean]);
      }
      setEditTagInput('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Tag Chips */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-vault-900/60 p-4 rounded-2xl border border-vault-800/80">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Digital Garden & Atomic Notes</span>
          </h2>
          <p className="text-xs text-slate-400">
            Bidirectional thought connections, reading takeaways, and fleeting insights
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> New Thought
        </button>
      </div>

      {/* Tag Filter Bar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTag === 'all'
                ? 'bg-slate-200 text-slate-900 font-bold'
                : 'bg-vault-900 text-slate-400 hover:text-slate-200 border border-vault-800'
            }`}
          >
            All Notes ({notes.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-vault-900 text-slate-400 hover:text-slate-200 border border-vault-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Two-Column Garden Layout (Notes List + Main Note Reader/Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column: Note Index List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              const wikilinks = extractWikiLinks(note.content);

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setIsEditing(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-vault-850 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-vault-900/80 border-vault-800/80 hover:border-vault-700 hover:bg-vault-850/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold truncate transition-colors ${
                      isSelected ? 'text-emerald-400' : 'text-slate-200 group-hover:text-slate-100'
                    }`}>
                      {note.title}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {note.isPublic ? (
                        <Globe className="w-3 h-3 text-emerald-400/80" />
                      ) : (
                        <Lock className="w-3 h-3 text-amber-400/80" />
                      )}
                      <span className="text-[10px] text-slate-500">
                        {note.updatedAt?.slice(0, 10)}
                      </span>
                    </div>
                  </div>

                  {/* Snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {note.content.replace(/\[\[(.*?)\]\]/g, '$1')}
                  </p>

                  {/* Connected wikilinks indicator */}
                  <div className="flex flex-wrap items-center gap-1 mt-2.5 pt-2 border-t border-vault-800/60">
                    {wikilinks.map(w => (
                      <span key={w} className="text-[10px] px-1.5 py-0.2 rounded bg-vault-950 text-emerald-300 font-mono border border-emerald-500/20">
                        [[{w}]]
                      </span>
                    ))}
                    {note.tags?.map(t => (
                      <span key={t} className="text-[10px] text-slate-500">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center rounded-2xl bg-vault-900/40 border border-vault-800 text-slate-500 text-xs">
              No notes match your filters.
            </div>
          )}
        </div>

        {/* Right Column: Note Reader or Live Editor */}
        <div className="lg:col-span-7 flex flex-col bg-vault-900/90 rounded-2xl border border-vault-800 overflow-hidden shadow-xl min-h-[500px]">
          {isEditing ? (
            /* Note Editor */
            <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-vault-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isCreatingNew ? 'Create Atomic Thought' : 'Edit Note'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIsPublic(!editIsPublic)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      editIsPublic 
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' 
                        : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {editIsPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                    <span>{editIsPublic ? 'Public' : 'Private'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsCreatingNew(false);
                    }}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditor}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1 shadow-md shadow-emerald-600/20"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Note
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note Title / Concept..."
                  className="w-full text-base sm:text-lg font-bold bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none border-b border-vault-800 pb-2"
                />
              </div>

              {/* Tag Editor */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-vault-950 border border-vault-800 rounded-xl">
                {editTags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-vault-800 text-slate-300">
                    #{t}
                    <button
                      type="button"
                      onClick={() => setEditTags(editTags.filter(tag => tag !== t))}
                      className="hover:text-rose-400 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add #tags (press Enter)..."
                  className="flex-1 min-w-[140px] bg-transparent text-xs text-slate-200 focus:outline-none px-1"
                />
              </div>

              {/* Textarea */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Markdown formatting supported</span>
                  <span>Type <code className="text-emerald-400 bg-vault-950 px-1 rounded">[[Title]]</code> to link books or movies</span>
                </div>
                <textarea
                  rows={14}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Start writing your thoughts... Connect ideas across movies and books: e.g. 'In [[Atomic Habits]], James Clear discusses how systems trump willpower...'"
                  className="w-full flex-1 p-3.5 text-xs sm:text-sm font-mono bg-vault-950 border border-vault-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            </div>
          ) : activeNote ? (
            /* Note Reader */
            <div className="p-4 sm:p-6 space-y-5 flex-1 flex flex-col">
              {/* Note Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-vault-800">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                    activeNote.isPublic 
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' 
                      : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                  }`}>
                    {activeNote.isPublic ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                    <span>{activeNote.isPublic ? 'Public Garden' : 'Private Vault'}</span>
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{activeNote.updatedAt?.slice(0, 10)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(activeNote)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-vault-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete thought "${activeNote.title}"?`)) {
                        onDeleteNote(activeNote.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-vault-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Tags */}
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                  {activeNote.title}
                </h1>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {activeNote.tags?.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-vault-800 text-slate-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connected Media Shelf (Bidirectional Links) */}
              {resolved.media.length > 0 && (
                <div className="p-3 rounded-xl bg-vault-950/70 border border-emerald-500/30 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Connected Vault Media ({resolved.media.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {resolved.media.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => onSelectMedia(m)}
                        className="flex items-center gap-2 p-1.5 pr-3 rounded-lg bg-vault-900 border border-vault-700 hover:border-emerald-500/60 transition-all text-left group"
                      >
                        {m.coverImage ? (
                          <img src={m.coverImage} alt={m.title} className="w-6 h-8 object-cover rounded shadow-sm" />
                        ) : (
                          <div className="w-6 h-8 rounded bg-vault-800 flex items-center justify-center text-slate-400 text-xs">
                            {m.type === 'movie' ? '🎬' : '📚'}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate max-w-[140px]">
                            {m.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {m.creator}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Note Content Markdown */}
              <div className="prose-vault flex-1 overflow-y-auto pr-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeNote.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Sparkles className="w-10 h-10 mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">No note selected</p>
              <p className="text-xs text-slate-500 mt-1">Select a thought from the list or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
