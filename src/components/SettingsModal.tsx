'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Database, 
  Check, 
  Key, 
  ExternalLink, 
  Sparkles, 
  AlertCircle,
  Copy
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => Promise<void>;
}

export function SettingsModal({ isOpen, onClose, onRefreshData }: SettingsModalProps) {
  const [tmdbKey, setTmdbKey] = useState('');
  const [readingGoal, setReadingGoal] = useState<number>(25);
  const [movieGoal, setMovieGoal] = useState<number>(50);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings) {
            setTmdbKey(data.settings.tmdbApiKey || '');
            setReadingGoal(data.settings.yearlyReadingGoal || 25);
            setMovieGoal(data.settings.yearlyMovieGoal || 50);
          }
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdbApiKey: tmdbKey.trim() || undefined,
          yearlyReadingGoal: Number(readingGoal),
          yearlyMovieGoal: Number(movieGoal),
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      await onRefreshData();
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/export';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      if (res.ok) {
        setImportStatus('Backup restored successfully!');
        await onRefreshData();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Failed to restore backup: invalid format.');
      }
    } catch (err) {
      setImportStatus('Error parsing JSON backup file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-vault-900 border border-vault-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-vault-800 flex items-center justify-between bg-vault-950/80">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Vault Settings & Cloud Migration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-vault-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-xs sm:text-sm">
          {/* TMDB API Key Setting */}
          <div className="p-4 rounded-xl bg-vault-950 border border-vault-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>The Movie Database (TMDB) API Key</span>
              </label>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Optional
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Zero-config search via iTunes & TVMaze works out-of-the-box. Add a TMDB key if you want direct TMDB catalog IDs and poster backdrops.
            </p>
            <input
              type="password"
              value={tmdbKey}
              onChange={(e) => setTmdbKey(e.target.value)}
              placeholder="Paste TMDB v3 API Key (optional)..."
              className="w-full px-3 py-2 text-xs bg-vault-900 border border-vault-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Yearly Goals Setting */}
          <div className="p-4 rounded-xl bg-vault-950 border border-vault-800 space-y-3">
            <h3 className="font-bold text-slate-200">Yearly Targets & Goals</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Books Goal ({new Date().getFullYear()})</label>
                <input
                  type="number"
                  value={readingGoal}
                  onChange={(e) => setReadingGoal(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-vault-900 border border-vault-700 rounded-xl text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Movie/TV Goal ({new Date().getFullYear()})</label>
                <input
                  type="number"
                  value={movieGoal}
                  onChange={(e) => setMovieGoal(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-vault-900 border border-vault-700 rounded-xl text-slate-100 font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>

          {/* Backup & Portability Section */}
          <div className="p-4 rounded-xl bg-vault-950 border border-vault-800 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-slate-200">Data Ownership & Portability</h3>
            </div>
            <p className="text-slate-400 text-xs">
              Your vault is stored locally. You can download a complete JSON backup at any time or restore a previous snapshot.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleDownloadBackup}
                className="flex-1 py-2 px-3 bg-vault-900 hover:bg-vault-800 text-slate-200 border border-vault-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Backup</span>
              </button>

              <label className="flex-1 py-2 px-3 bg-vault-900 hover:bg-vault-800 text-slate-200 border border-vault-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Restore JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30 text-center">
                {importStatus}
              </p>
            )}
          </div>

          {/* Supabase & Vercel Deployment Guide */}
          <div className="p-4 rounded-xl bg-vault-950 border border-vault-800 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-slate-200">Supabase & Vercel Deployment</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              To host your garden publicly online, push this repository to GitHub and import it on Vercel. The included <code className="text-emerald-400 bg-vault-900 px-1 py-0.5 rounded">supabase_schema.sql</code> file provides full PostgreSQL schema and RLS policies for instant Supabase integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
