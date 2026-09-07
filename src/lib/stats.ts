import { MediaItem, AtomicNote, VaultStats } from '@/types';

export function calculateVaultStats(media: MediaItem[], notes: AtomicNote[], targetYear: number = new Date().getFullYear()): VaultStats {
  const currentYearStr = targetYear.toString();

  // Books finished in target year
  const booksFinishedYear = media.filter(m => 
    (m.type === 'book' || m.type === 'article') && 
    m.status === 'completed' &&
    ((m.dateCompleted && m.dateCompleted.startsWith(currentYearStr)) || (m.dateLogged && m.dateLogged.startsWith(currentYearStr)))
  ).length;

  // Movies watched in target year
  const moviesWatchedYear = media.filter(m => 
    m.type === 'movie' && 
    m.status === 'completed' &&
    ((m.dateCompleted && m.dateCompleted.startsWith(currentYearStr)) || (m.dateLogged && m.dateLogged.startsWith(currentYearStr)))
  ).length;

  // TV shows finished in target year
  const tvFinishedYear = media.filter(m => 
    m.type === 'tv' && 
    m.status === 'completed' &&
    ((m.dateCompleted && m.dateCompleted.startsWith(currentYearStr)) || (m.dateLogged && m.dateLogged.startsWith(currentYearStr)))
  ).length;

  // Quotes count
  const totalQuotes = media.reduce((acc, m) => acc + (m.quotes ? m.quotes.length : 0), 0);

  // Rating metrics
  const ratedItems = media.filter(m => typeof m.rating === 'number' && m.rating > 0);
  const averageRating = ratedItems.length > 0
    ? Number((ratedItems.reduce((acc, m) => acc + (m.rating || 0), 0) / ratedItems.length).toFixed(1))
    : 0;

  const ratingDistribution: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0
  };

  ratedItems.forEach(m => {
    if (m.rating) {
      const rounded = Math.min(10, Math.max(1, Math.round(m.rating)));
      ratingDistribution[rounded] = (ratingDistribution[rounded] || 0) + 1;
    }
  });

  // Top Genres
  const genreCounts: Record<string, number> = {};
  media.forEach(m => {
    (m.genres || []).forEach(g => {
      const genre = g.trim();
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });
  });

  const topGenres = Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Format Breakdown
  const formatBreakdown: Record<string, number> = {};
  media.forEach(m => {
    if (m.format) {
      formatBreakdown[m.format] = (formatBreakdown[m.format] || 0) + 1;
    }
  });

  // Monthly activity for the target year (Jan through Dec)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyActivity = monthNames.map((month, idx) => {
    const monthNumStr = String(idx + 1).padStart(2, '0');
    const prefix = `${currentYearStr}-${monthNumStr}`;

    const books = media.filter(m => 
      (m.type === 'book' || m.type === 'article') && 
      ((m.dateCompleted && m.dateCompleted.startsWith(prefix)) || (m.dateLogged && m.dateLogged.startsWith(prefix)))
    ).length;

    const movies = media.filter(m => 
      (m.type === 'movie' || m.type === 'tv') && 
      ((m.dateCompleted && m.dateCompleted.startsWith(prefix)) || (m.dateLogged && m.dateLogged.startsWith(prefix)))
    ).length;

    const notesCount = notes.filter(n => 
      n.createdAt && n.createdAt.startsWith(prefix)
    ).length;

    return { month, books, movies, notes: notesCount };
  });

  // Favorite items (rated 9.0 or higher)
  const favoriteItems = [...media]
    .filter(m => (m.rating || 0) >= 8.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);

  return {
    totalItems: media.length,
    booksFinishedYear,
    moviesWatchedYear,
    tvFinishedYear,
    totalNotes: notes.length,
    totalQuotes,
    averageRating,
    ratingDistribution,
    topGenres,
    formatBreakdown,
    monthlyActivity,
    favoriteItems,
  };
}
