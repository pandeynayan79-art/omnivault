'use client';

import React from 'react';
import { 
  Film, 
  BookOpen, 
  Sparkles, 
  Quote as QuoteIcon, 
  BarChart3, 
  Plus, 
  Search, 
  Settings, 
  Globe, 
  Lock,
  Layers,
  Share2,
  LogIn,
  LogOut
} from 'lucide-react';
import { User } from '@/types';

export type ActiveTab = 'all' | 'movies' | 'books' | 'garden' | 'quotes' | 'stats';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickLog: () => void;
  onOpenSettings: () => void;
  publicFilter: 'all' | 'public_only' | 'private_only';
  setPublicFilter: (filter: 'all' | 'public_only' | 'private_only') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalItemsCount: number;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onShareVault: () => void;
}

export function Navigation({
  activeTab,
  setActiveTab,
  onOpenQuickLog,
  onOpenSettings,
  publicFilter,
  setPublicFilter,
  searchQuery,
  setSearchQuery,
  totalItemsCount,
  user,
  onOpenAuth,
  onLogout,
  onShareVault,
}: NavigationProps) {
  const navItems = [
    { id: 'all' as ActiveTab, label: 'Vault' },
    { id: 'movies' as ActiveTab, label: 'Cinema & TV' },
    { id: 'books' as ActiveTab, label: 'Reading Shelf' },
    { id: 'garden' as ActiveTab, label: 'Garden' },
    { id: 'quotes' as ActiveTab, label: 'Quotes' },
    { id: 'stats' as ActiveTab, label: 'Stats' },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('all')}
            className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
            <span className="font-semibold text-sm tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              OmniVault
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-xs relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search... ⌘K"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-700 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Visibility Segmented Control */}
            <div className="hidden lg:flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
              <button
                onClick={() => setPublicFilter('all')}
                className={`px-2 py-0.5 rounded-md text-[11px] transition-colors ${
                  publicFilter === 'all'
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPublicFilter('public_only')}
                className={`px-2 py-0.5 rounded-md text-[11px] transition-colors flex items-center gap-1 ${
                  publicFilter === 'public_only'
                    ? 'bg-zinc-800 text-emerald-400 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </button>
              <button
                onClick={() => setPublicFilter('private_only')}
                className={`px-2 py-0.5 rounded-md text-[11px] transition-colors flex items-center gap-1 ${
                  publicFilter === 'private_only'
                    ? 'bg-zinc-800 text-amber-400 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </button>
            </div>

            {/* Share Vault Link */}
            <button
              onClick={onShareVault}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
              title="Share your digital garden"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share</span>
            </button>

            {/* Quick Log Button */}
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>

            {/* User Profile / Sign In */}
            {user ? (
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg pl-2 pr-1.5 py-1">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                  {(user.name || user.email).slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-zinc-200 hidden md:inline max-w-[90px] truncate">
                  {user.name}
                </span>
                <button
                  onClick={onLogout}
                  className="text-zinc-500 hover:text-rose-400 p-0.5 rounded hover:bg-zinc-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Settings Gear */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors"
              title="Settings & Backup"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 px-3 py-2">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('all')}
            className={`p-1.5 text-xs flex flex-col items-center gap-1 ${
              activeTab === 'all' ? 'text-zinc-100 font-semibold' : 'text-zinc-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px]">Vault</span>
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`p-1.5 text-xs flex flex-col items-center gap-1 ${
              activeTab === 'movies' ? 'text-zinc-100 font-semibold' : 'text-zinc-400'
            }`}
          >
            <Film className="w-4 h-4" />
            <span className="text-[10px]">Cinema</span>
          </button>
          <button
            onClick={onOpenQuickLog}
            className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center -mt-4 shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`p-1.5 text-xs flex flex-col items-center gap-1 ${
              activeTab === 'books' ? 'text-zinc-100 font-semibold' : 'text-zinc-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px]">Books</span>
          </button>
          <button
            onClick={() => setActiveTab('garden')}
            className={`p-1.5 text-xs flex flex-col items-center gap-1 ${
              activeTab === 'garden' ? 'text-zinc-100 font-semibold' : 'text-zinc-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px]">Notes</span>
          </button>
        </div>
      </div>
    </>
  );
}
