'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Navigation, 
  ActiveTab 
} from '@/components/Navigation';
import { MediaSection } from '@/components/MediaSection';
import { MediaDetailModal } from '@/components/MediaDetailModal';
import { QuickLogModal } from '@/components/QuickLogModal';
import { DigitalGarden } from '@/components/DigitalGarden';
import { QuotesShelf } from '@/components/QuotesShelf';
import { StatsDashboard } from '@/components/StatsDashboard';
import { SettingsModal } from '@/components/SettingsModal';
import { AuthModal } from '@/components/AuthModal';
import { MediaItem, AtomicNote, VaultStats, MediaType, User } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [publicFilter, setPublicFilter] = useState<'all' | 'public_only' | 'private_only'>('all');
  const [scope, setScope] = useState<'mine' | 'community'>('mine');
  const [searchQuery, setSearchQuery] = useState('');

  // User & Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [notes, setNotes] = useState<AtomicNote[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogInitialType, setQuickLogInitialType] = useState<MediaType | 'note'>('movie');
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch vault data for given scope
  const loadVaultData = useCallback(async (targetScope?: 'mine' | 'community') => {
    const activeScope = targetScope || scope;
    try {
      const [mediaRes, notesRes, statsRes] = await Promise.all([
        fetch(`/api/media?scope=${activeScope}`),
        fetch(`/api/notes?scope=${activeScope}`),
        fetch(`/api/stats?scope=${activeScope}`),
      ]);

      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMedia(mediaData.media || []);
      }
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData.notes || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || null);
      }
    } catch (err) {
      console.error('Failed to load vault data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  const handleScopeChange = (newScope: 'mine' | 'community') => {
    setScope(newScope);
    loadVaultData(newScope);
  };

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const loggedUser = data.user || null;
        setUser(loggedUser);
        const initialScope = loggedUser ? 'mine' : 'community';
        setScope(initialScope);
        loadVaultData(initialScope);
      } else {
        setUser(null);
        setScope('community');
        loadVaultData('community');
      }
    } catch {
      setUser(null);
      setScope('community');
      loadVaultData('community');
    }
  }, [loadVaultData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setScope('community');
      await loadVaultData('community');
      showToast('Signed out successfully. Viewing Community Garden.');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleShareVault = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Vault link copied to clipboard! Anyone can view and contribute books.');
    }
  };

  // Keyboard shortcut: ⌘K or Ctrl+K opens quick log
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickLogOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Media Actions
  const handleSaveMedia = async (itemData: Partial<MediaItem>) => {
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (res.ok) {
        await loadVaultData();
      }
    } catch (err) {
      console.error('Failed to save media:', err);
    }
  };

  const handleUpdateMedia = async (updated: Partial<MediaItem>) => {
    if (!updated.id) return;
    try {
      const res = await fetch(`/api/media/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedMediaItem(data.media);
        await loadVaultData();
      }
    } catch (err) {
      console.error('Failed to update media:', err);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSelectedMediaItem(null);
        await loadVaultData();
      }
    } catch (err) {
      console.error('Failed to delete media:', err);
    }
  };

  // Note Actions
  const handleSaveNote = async (noteData: Partial<AtomicNote>) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });
      if (res.ok) {
        await loadVaultData();
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadVaultData();
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleOpenQuickLogWithType = (type: MediaType | 'note') => {
    setQuickLogInitialType(type);
    setIsQuickLogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 pb-20 md:pb-12 selection:bg-zinc-800 selection:text-white">
      {/* Minimal Top Header Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        publicFilter={publicFilter}
        setPublicFilter={setPublicFilter}
        scope={scope}
        setScope={handleScopeChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalItemsCount={media.length}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onShareVault={handleShareVault}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Scope Context Banner */}
        {scope === 'community' && (
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-zinc-300">
                You are browsing the <strong className="text-zinc-100 font-semibold">Community Showcase</strong>. Showing public recommendations from members across OmniVault.
              </span>
            </div>
            {user ? (
              <button
                onClick={() => handleScopeChange('mine')}
                className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4 self-start sm:self-auto flex-shrink-0"
              >
                ← Back to My Personal Vault
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4 self-start sm:self-auto flex-shrink-0"
              >
                Sign in to create your own vault →
              </button>
            )}
          </div>
        )}

        {/* Empty Personal Vault Banner */}
        {scope === 'mine' && user && media.length === 0 && !isLoading && (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center font-bold text-sm">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Welcome to your Personal Vault, {user.name}!</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Your personal library is empty. Add your favorite books, movies, and notes using the button below, or explore the community showcase for ideas!
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsQuickLogOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs shadow hover:bg-zinc-100 transition-colors"
              >
                + Log First Item
              </button>
              <button
                onClick={() => handleScopeChange('community')}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
              >
                Browse Community
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-zinc-500 space-y-2">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
            <span className="text-xs">Loading vault...</span>
          </div>
        ) : (
          <>
            {/* MAIN VAULT VIEW: TWO DEDICATED DISTINCT SECTIONS */}
            {activeTab === 'all' && (
              <div className="space-y-12">
                {/* Section 1: Cinema & TV */}
                <MediaSection
                  title="Cinema & TV"
                  icon="film"
                  type="cinema"
                  media={media}
                  onSelectItem={(item) => setSelectedMediaItem(item)}
                  onOpenQuickLog={() => handleOpenQuickLogWithType('movie')}
                  searchQuery={searchQuery}
                  publicFilter={publicFilter}
                />

                {/* Section 2: Reading Shelf */}
                <MediaSection
                  title="Reading Shelf"
                  icon="book"
                  type="books"
                  media={media}
                  onSelectItem={(item) => setSelectedMediaItem(item)}
                  onOpenQuickLog={() => handleOpenQuickLogWithType('book')}
                  searchQuery={searchQuery}
                  publicFilter={publicFilter}
                />
              </div>
            )}

            {/* FOCUSED VIEW: CINEMA & TV ONLY */}
            {activeTab === 'movies' && (
              <MediaSection
                title="Cinema & TV"
                icon="film"
                type="cinema"
                media={media}
                onSelectItem={(item) => setSelectedMediaItem(item)}
                onOpenQuickLog={() => handleOpenQuickLogWithType('movie')}
                searchQuery={searchQuery}
                publicFilter={publicFilter}
              />
            )}

            {/* FOCUSED VIEW: READING SHELF ONLY */}
            {activeTab === 'books' && (
              <MediaSection
                title="Reading Shelf"
                icon="book"
                type="books"
                media={media}
                onSelectItem={(item) => setSelectedMediaItem(item)}
                onOpenQuickLog={() => handleOpenQuickLogWithType('book')}
                searchQuery={searchQuery}
                publicFilter={publicFilter}
              />
            )}

            {/* DIGITAL GARDEN & ATOMIC THOUGHTS */}
            {activeTab === 'garden' && (
              <DigitalGarden
                notes={notes}
                allMedia={media}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
                onSelectMedia={(m) => setSelectedMediaItem(m)}
                publicFilter={publicFilter}
                searchQuery={searchQuery}
              />
            )}

            {/* QUOTES SHELF */}
            {activeTab === 'quotes' && (
              <QuotesShelf
                media={media}
                onSelectMedia={(m) => setSelectedMediaItem(m)}
                searchQuery={searchQuery}
              />
            )}

            {/* STATS DASHBOARD */}
            {activeTab === 'stats' && (
              <StatsDashboard
                stats={stats}
                onSelectMedia={(m) => setSelectedMediaItem(m)}
              />
            )}
          </>
        )}
      </main>

      {/* Quick Log Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onSaveMedia={handleSaveMedia}
        onSaveNote={handleSaveNote}
        initialType={quickLogInitialType}
        allMedia={media}
        user={user}
      />

      {/* Media Detail Modal */}
      <MediaDetailModal
        item={selectedMediaItem}
        onClose={() => setSelectedMediaItem(null)}
        onUpdate={handleUpdateMedia}
        onDelete={handleDeleteMedia}
        allNotes={notes}
        onSelectNote={(noteId) => {
          setActiveTab('garden');
        }}
      />

      {/* Settings & Export/Import Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshData={loadVaultData}
      />

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(authedUser) => {
          setUser(authedUser);
          setScope('mine');
          loadVaultData('mine');
          showToast(`Welcome back, ${authedUser.name}! Viewing your personal vault.`);
        }}
      />

      {/* Minimal Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900/95 border border-zinc-700/80 text-zinc-100 px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2.5 max-w-sm backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
          <span className="font-medium leading-relaxed">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
