import { NextRequest, NextResponse } from 'next/server';
import { SearchResultItem } from '@/types';
import { searchCuratedCatalog, POPULAR_BOOKS } from '@/lib/curatedCatalog';
import { searchWikipediaUniversal } from '@/lib/wikiSearch';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // Return rich popular recommendations if query is empty
  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: POPULAR_BOOKS.slice(0, 36) });
  }

  const cleanQuery = query.trim();
  const results: SearchResultItem[] = [];

  const isDuplicate = (title: string) => {
    const norm = title.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”।।\s]/g, '');
    return results.some(r => {
      const rNorm = r.title.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”।।\s]/g, '');
      return norm.length > 0 ? rNorm === norm : r.title.toLowerCase().trim() === title.toLowerCase().trim();
    });
  };

  // 1. Instant Curated Catalog Match (Nepali literature & international bestsellers)
  const curatedMatches = searchCuratedCatalog(cleanQuery, 'book');
  for (const c of curatedMatches) {
    if (!isDuplicate(c.title)) {
      results.push(c);
    }
  }

  // 2. Query Wikipedia Universal Search (Excels at Nepali literature & global books)
  try {
    const wikiItems = await searchWikipediaUniversal(cleanQuery, 'book');
    for (const item of wikiItems) {
      if (!isDuplicate(item.title)) {
        results.push(item);
      }
    }
  } catch (err) {
    console.warn('Wikipedia book search error:', err);
  }

  // 3. Query Open Library Search with 7s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQuery)}&limit=14&fields=key,title,author_name,first_publish_year,cover_i,subject,first_sentence,number_of_pages_median`;
    
    const olRes = await fetch(olUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    });
    clearTimeout(timeoutId);

    if (olRes.ok) {
      const olData = await olRes.json();
      if (olData.docs && Array.isArray(olData.docs)) {
        for (const doc of olData.docs) {
          if (!doc.title || isDuplicate(doc.title)) continue;

          const coverImage = doc.cover_i 
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
            : undefined;

          let overviewText: string | undefined = undefined;
          if (doc.first_sentence) {
            overviewText = Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence;
          }

          results.push({
            externalId: `ol-${doc.key}`,
            type: 'book',
            title: doc.title,
            creator: (doc.author_name && doc.author_name.slice(0, 2).join(', ')) || 'Unknown Author',
            releaseYear: doc.first_publish_year,
            coverImage,
            overview: overviewText,
            genres: (doc.subject && doc.subject.slice(0, 3)) || ['Literature'],
            pageCount: doc.number_of_pages_median,
            source: 'openlibrary',
          });
        }
      }
    }
  } catch (err) {
    // Open Library timeout or network failure gracefully caught
  }

  return NextResponse.json({ results: results.slice(0, 24) });
}
