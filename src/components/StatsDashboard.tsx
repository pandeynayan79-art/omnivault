'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  Film, 
  Sparkles, 
  Quote as QuoteIcon, 
  Star, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Layers
} from 'lucide-react';
import { VaultStats, MediaItem } from '@/types';

interface StatsDashboardProps {
  stats: VaultStats | null;
  onSelectMedia: (item: MediaItem) => void;
  yearlyReadingGoal?: number;
  yearlyMovieGoal?: number;
}

export function StatsDashboard({
  stats,
  onSelectMedia,
  yearlyReadingGoal = 25,
  yearlyMovieGoal = 50,
}: StatsDashboardProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  if (!stats) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        Loading analytics...
      </div>
    );
  }

  const readingProgress = Math.min(100, Math.round((stats.booksFinishedYear / yearlyReadingGoal) * 100));
  const movieProgress = Math.min(100, Math.round((stats.moviesWatchedYear / yearlyMovieGoal) * 100));

  // Max count in monthly activity for bar scaling
  const maxMonthlyCount = Math.max(
    ...stats.monthlyActivity.map((m) => Math.max(m.books, m.movies, m.notes)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-vault-900/60 p-4 sm:p-5 rounded-2xl border border-vault-800/80">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>Vault Intelligence & Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Insights into your consumption habits, reading velocity, and taste exploration for {currentYear}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-vault-950 px-3 py-1.5 rounded-xl border border-vault-800 font-semibold">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Year: {currentYear}</span>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Books Read Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-vault-900/80 border border-amber-500/20 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Books Read</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {stats.booksFinishedYear}
            </span>
            <span className="text-xs text-slate-500">/ {yearlyReadingGoal} goal</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-vault-950 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-amber-400/80 font-medium mt-1 block">
            {readingProgress}% of yearly target completed
          </span>
        </div>

        {/* Movies Watched Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-vault-900/80 border border-indigo-500/20 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Cinema & TV Logged</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {stats.moviesWatchedYear + stats.tvFinishedYear}
            </span>
            <span className="text-xs text-slate-500">in {currentYear}</span>
          </div>
          <div className="w-full bg-vault-950 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${movieProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-indigo-400/80 font-medium mt-1 block">
            {movieProgress}% of yearly target completed
          </span>
        </div>

        {/* Atomic Thoughts Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-vault-900/80 border border-emerald-500/20 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Atomic Thoughts</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {stats.totalNotes}
            </span>
            <span className="text-xs text-slate-500">garden nodes</span>
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Interconnected ideas
          </p>
        </div>

        {/* Avg Rating & Quotes Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-vault-900/80 border border-rose-500/20 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Average Rating</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Star className="w-4 h-4 fill-rose-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {stats.averageRating}
            </span>
            <span className="text-xs text-slate-500">/ 10 ({stats.totalQuotes} quotes)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Across {stats.totalItems} logged experiences
          </p>
        </div>
      </div>

      {/* Charts Grid: Monthly Activity + Rating Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Monthly Activity Breakdown Bar Chart */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-vault-900/80 border border-vault-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Monthly Consumption & Thinking Pace</h3>
              <p className="text-[11px] text-slate-400">Logs across {currentYear}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Books
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span> Movies/TV
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Notes
              </span>
            </div>
          </div>

          {/* Bar Columns Container */}
          <div className="grid grid-cols-12 gap-2 h-44 items-end pt-4 px-2 border-b border-vault-800">
            {stats.monthlyActivity.map((m) => {
              const bookHeight = Math.round((m.books / maxMonthlyCount) * 110);
              const movieHeight = Math.round((m.movies / maxMonthlyCount) * 110);
              const noteHeight = Math.round((m.notes / maxMonthlyCount) * 110);

              return (
                <div key={m.month} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-0.5 h-36">
                    {/* Books bar */}
                    <div
                      className="w-2 bg-amber-500 rounded-t transition-all group-hover:opacity-80"
                      style={{ height: `${Math.max(bookHeight, m.books > 0 ? 6 : 0)}px` }}
                      title={`${m.month}: ${m.books} books`}
                    />
                    {/* Movies bar */}
                    <div
                      className="w-2 bg-indigo-500 rounded-t transition-all group-hover:opacity-80"
                      style={{ height: `${Math.max(movieHeight, m.movies > 0 ? 6 : 0)}px` }}
                      title={`${m.month}: ${m.movies} movies`}
                    />
                    {/* Notes bar */}
                    <div
                      className="w-2 bg-emerald-500 rounded-t transition-all group-hover:opacity-80"
                      style={{ height: `${Math.max(noteHeight, m.notes > 0 ? 6 : 0)}px` }}
                      title={`${m.month}: ${m.notes} notes`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors font-medium">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rating Score Distribution Histogram */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-vault-900/80 border border-vault-800/80 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Rating Distribution</h3>
            <p className="text-[11px] text-slate-400">Scores from 1 to 10</p>
          </div>

          <div className="space-y-2 pt-1">
            {[10, 9, 8, 7, 6, 5].map((score) => {
              const count = stats.ratingDistribution[score] || 0;
              const maxCount = Math.max(...Object.values(stats.ratingDistribution), 1);
              const pct = Math.round((count / maxCount) * 100);

              return (
                <div key={score} className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-bold text-slate-400 text-right">{score} ★</span>
                  <div className="flex-1 bg-vault-950 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-slate-500 text-right font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Formats Breakdown & Top Genres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Genres Explored */}
        <div className="p-5 rounded-2xl bg-vault-900/80 border border-vault-800/80 space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Top Genres Explored</h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {stats.topGenres.map((g) => (
              <div
                key={g.genre}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-vault-950 border border-vault-800 text-xs"
              >
                <span className="font-semibold text-slate-200">{g.genre}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-vault-800 text-emerald-400 text-[10px] font-bold">
                  {g.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reading & Media Formats */}
        <div className="p-5 rounded-2xl bg-vault-900/80 border border-vault-800/80 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Format Diversity</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {Object.entries(stats.formatBreakdown).map(([format, count]) => (
              <div
                key={format}
                className="p-3 rounded-xl bg-vault-950 border border-vault-800 text-center"
              >
                <p className="text-xs font-bold text-slate-300 capitalize">{format}</p>
                <p className="text-lg font-extrabold text-indigo-400 mt-0.5">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hall of Fame: Favorite Rated Items */}
      {stats.favoriteItems.length > 0 && (
        <div className="p-5 rounded-2xl bg-vault-900/80 border border-vault-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">Highest Rated Masterpieces (★ 8.5+)</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {stats.favoriteItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className="cursor-pointer group flex flex-col items-center text-center space-y-1.5"
              >
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover rounded-xl border border-vault-700 group-hover:border-amber-400 group-hover:scale-105 transition-all shadow-md"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-vault-950 rounded-xl border border-vault-800 flex items-center justify-center text-slate-500 text-xs">
                    {item.type}
                  </div>
                )}
                <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1 w-full">
                  {item.title}
                </p>
                <span className="text-[10px] font-extrabold text-amber-400 px-1.5 py-0.2 rounded-full bg-amber-400/10 border border-amber-400/20">
                  ★ {item.rating?.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
