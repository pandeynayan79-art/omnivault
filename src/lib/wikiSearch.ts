import { SearchResultItem, MediaType } from '@/types';

interface WikiSummary {
  title: string;
  description?: string;
  extract?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls?: {
    desktop?: { page?: string };
  };
}

/**
 * Searches Wikipedia across global & Nepali cinema/books with high quality thumbnails and lead synopses.
 */
export async function searchWikipediaUniversal(query: string, mediaType: MediaType): Promise<SearchResultItem[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  const results: SearchResultItem[] = [];
  const suffix = (mediaType === 'book' || mediaType === 'article') ? 'novel book' : 'film movie';
  const searchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(`${cleanQ} ${suffix}`)}&limit=4`;

  try {
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'OmniVault/1.0 (https://omnivault.app; contact@vault.local)',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.pages || !Array.isArray(data.pages)) return [];

    const pageSummaries = await Promise.all(
      data.pages.slice(0, 3).map(async (page: any) => {
        try {
          const sumRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.key)}`,
            {
              headers: {
                'User-Agent': 'OmniVault/1.0 (https://omnivault.app; contact@vault.local)',
                'Accept': 'application/json',
              },
              next: { revalidate: 3600 }
            }
          );
          if (sumRes.ok) {
            return (await sumRes.json()) as WikiSummary;
          }
        } catch (e) {
          // ignore
        }
        return null;
      })
    );

    for (const sum of pageSummaries) {
      if (!sum || !sum.title) continue;

      // Extract release year from description or extract (e.g. "2012 Nepali film", "1964 novel")
      const yearMatch = (sum.description || sum.extract || '').match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
      const releaseYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

      // Extract author or director if present in extract (e.g. "directed by Nischal Basnet", "by Narayan Wagle")
      let creator = 'Renowned Creator';
      const extract = sum.extract || '';
      
      const dirMatch = extract.match(/directed (?:and written )?by ([A-Z][a-z]+(?: [A-Z][a-z\.]+){1,3})/i);
      const authorMatch = extract.match(/(?:novel|book|poem) by (?:Nepali (?:author|poet|writer) )?([A-Z][a-z]+(?: [A-Z][a-z\.]+){1,3})/i);
      const writtenMatch = extract.match(/written by ([A-Z][a-z]+(?: [A-Z][a-z\.]+){1,3})/i);

      if (dirMatch && dirMatch[1]) {
        creator = dirMatch[1].split('.')[0].trim();
      } else if (authorMatch && authorMatch[1]) {
        creator = authorMatch[1].split('.')[0].trim();
      } else if (writtenMatch && writtenMatch[1]) {
        creator = writtenMatch[1].split('.')[0].trim();
      } else if (sum.description) {
        creator = sum.description;
      }

      // Clean title from "(novel)", "(2012 film)", "(film)"
      const cleanTitle = sum.title.replace(/\s*\((?:film|\d{4} film|novel|book|play|miniseries)\)/gi, '');

      // Use authentic thumbnail from Wikipedia API
      const coverImage = sum.thumbnail?.source;

      // Check for genre signals
      const genres: string[] = [];
      const lower = (sum.description + ' ' + extract).toLowerCase();
      if (lower.includes('nepali') || lower.includes('nepalese')) genres.push('Nepali');
      if (lower.includes('drama')) genres.push('Drama');
      if (lower.includes('comedy')) genres.push('Comedy');
      if (lower.includes('crime') || lower.includes('thriller')) genres.push('Thriller');
      if (lower.includes('romance') || lower.includes('romantic')) genres.push('Romance');
      if (lower.includes('sci-fi') || lower.includes('science fiction')) genres.push('Sci-Fi');
      if (lower.includes('poetry') || lower.includes('poem')) genres.push('Poetry');
      if (lower.includes('novel') || lower.includes('fiction')) genres.push('Fiction');

      results.push({
        externalId: `wiki-${encodeURIComponent(sum.title)}`,
        type: mediaType,
        title: cleanTitle,
        creator,
        releaseYear,
        coverImage,
        overview: sum.extract ? sum.extract.slice(0, 240) + '...' : undefined,
        genres: genres.length > 0 ? genres : ['Classics'],
        source: 'wikipedia' as any,
      });
    }
  } catch (err) {
    console.warn('Wikipedia search error:', err);
  }

  return results;
}
