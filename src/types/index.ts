export type MediaType = 'movie' | 'tv' | 'book' | 'article';

export type MediaStatus = 'want_to_consume' | 'in_progress' | 'completed' | 'abandoned';

export type MediaFormat = 
  | 'physical' 
  | 'kindle' 
  | 'audiobook' 
  | 'article' 
  | 'theater' 
  | 'streaming' 
  | 'other';

export interface Quote {
  id: string;
  quote: string;
  page?: string;
  location?: string;
  context?: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  creator: string; // Director for film/tv, Author for books/articles
  releaseYear?: number;
  coverImage?: string;
  backdropImage?: string;
  rating?: number; // 1 to 10 (or 1 to 5 multiplied by 2)
  status: MediaStatus;
  format?: MediaFormat;
  genres: string[];
  dateLogged: string; // ISO date string
  dateCompleted?: string; // ISO date string
  takeaway?: string; // 2-3 line quick takeaway
  notes?: string; // Extended markdown review or reflections
  quotes: Quote[];
  isPublic: boolean;
  tags: string[];
  externalId?: string; // TMDB ID, Google Books ID, OpenLibrary key, etc.
  externalUrl?: string;
  pageCount?: number;
  runtimeMinutes?: number;
  addedBy?: string; // Name or email of contributor
  userId?: string; // Associated user ID
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'contributor' | 'guest';
  createdAt: string;
}

export interface UserCredentials {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  avatar?: string;
  role: 'owner' | 'contributor' | 'guest';
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface AtomicNote {
  id: string;
  userId?: string;
  authorName?: string;
  title: string;
  content: string; // Markdown text
  tags: string[];
  linkedMediaIds: string[]; // Explicit IDs or parsed from [[wikilinks]]
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResultItem {
  externalId: string;
  type: MediaType;
  title: string;
  creator: string;
  releaseYear?: number;
  coverImage?: string;
  backdropImage?: string;
  overview?: string;
  genres: string[];
  pageCount?: number;
  runtimeMinutes?: number;
  source: 'openlibrary' | 'googlebooks' | 'tmdb' | 'itunes' | 'tvmaze';
}

export interface VaultStats {
  totalItems: number;
  booksFinishedYear: number;
  moviesWatchedYear: number;
  tvFinishedYear: number;
  totalNotes: number;
  totalQuotes: number;
  averageRating: number;
  ratingDistribution: Record<number, number>; // 1-10 -> count
  topGenres: { genre: string; count: number }[];
  formatBreakdown: Record<string, number>;
  monthlyActivity: { month: string; books: number; movies: number; notes: number }[];
  favoriteItems: MediaItem[];
}
