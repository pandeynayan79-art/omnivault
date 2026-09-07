import { NextRequest, NextResponse } from 'next/server';
import { SearchResultItem } from '@/types';
import { searchCuratedCatalog, POPULAR_MOVIES_AND_TV } from '@/lib/curatedCatalog';
import { searchWikipediaUniversal } from '@/lib/wikiSearch';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = (searchParams.get('type') as 'movie' | 'tv') || 'movie';

  // Return top popular recommendations if query is empty
  if (!query || query.trim().length === 0) {
    const popular = POPULAR_MOVIES_AND_TV.filter(m => type === 'tv' ? m.type === 'tv' : m.type === 'movie');
    return NextResponse.json({ results: popular.slice(0, 8) });
  }

  const cleanQuery = query.trim();
  const results: SearchResultItem[] = [];

  // Helper to check existing title
  const isDuplicate = (title: string) => {
    const norm = title.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”।।\s]/g, '');
    return results.some(r => {
      const rNorm = r.title.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”।।\s]/g, '');
      return norm.length > 0 ? rNorm === norm : r.title.toLowerCase().trim() === title.toLowerCase().trim();
    });
  };

  // 1. Instant Curated Catalog Match (Nepali & International 0ms hits)
  const curatedMatches = searchCuratedCatalog(cleanQuery, type);
  for (const c of curatedMatches) {
    if (!isDuplicate(c.title)) {
      results.push(c);
    }
  }

  // 2. Query OMDB (IMDb) and Wikipedia in parallel for maximum worldwide & Nepali coverage
  try {
    const omdbType = type === 'tv' ? 'series' : 'movie';
    const omdbKey = process.env.OMDB_API_KEY || 'trilogy';
    const omdbUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(cleanQuery)}&type=${omdbType}&apikey=${omdbKey}`;

    const [omdbPromise, wikiPromise] = await Promise.allSettled([
      fetch(omdbUrl, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 }
      }).then(r => r.json()),
      searchWikipediaUniversal(cleanQuery, type)
    ]);

    // Process OMDB hits
    if (omdbPromise.status === 'fulfilled' && omdbPromise.value?.Search) {
      const topCandidates = omdbPromise.value.Search.slice(0, 4);
      const detailedItems = await Promise.all(
        topCandidates.map(async (item: any) => {
          try {
            const detailRes = await fetch(
              `https://www.omdbapi.com/?i=${item.imdbID}&plot=short&apikey=${omdbKey}`,
              { next: { revalidate: 3600 } }
            );
            if (detailRes.ok) {
              return await detailRes.json();
            }
          } catch (e) {}
          return item;
        })
      );

      for (const detail of detailedItems) {
        if (!detail || !detail.Title) continue;
        if (!isDuplicate(detail.Title)) {
          const rawYear = detail.Year ? parseInt(detail.Year.substring(0, 4), 10) : undefined;
          const genres = detail.Genre && detail.Genre !== 'N/A'
            ? detail.Genre.split(',').map((g: string) => g.trim())
            : [];
          const posterUrl = detail.Poster && detail.Poster !== 'N/A' ? detail.Poster : undefined;

          results.push({
            externalId: `imdb-${detail.imdbID}`,
            type: type === 'tv' ? 'tv' : 'movie',
            title: detail.Title,
            creator: detail.Director && detail.Director !== 'N/A' 
              ? detail.Director 
              : detail.Writer && detail.Writer !== 'N/A' 
              ? detail.Writer 
              : 'Film Studio',
            releaseYear: isNaN(rawYear as number) ? undefined : rawYear,
            coverImage: posterUrl,
            overview: detail.Plot && detail.Plot !== 'N/A' ? detail.Plot : undefined,
            genres,
            runtimeMinutes: detail.Runtime && detail.Runtime !== 'N/A' ? parseInt(detail.Runtime, 10) : undefined,
            source: 'omdb' as any,
          });
        }
      }
    }

    // Process Wikipedia hits (especially powerful for Nepali & non-Hollywood cinema)
    if (wikiPromise.status === 'fulfilled' && Array.isArray(wikiPromise.value)) {
      for (const wikiItem of wikiPromise.value) {
        if (!isDuplicate(wikiItem.title)) {
          results.push(wikiItem);
        }
      }
    }
  } catch (err) {
    console.warn('Movie search aggregation error:', err);
  }

  // 3. Query TVMaze if type is TV and results are low
  if (type === 'tv' && results.length < 3) {
    try {
      const tvmazeRes = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(cleanQuery)}`);
      if (tvmazeRes.ok) {
        const tvData = await tvmazeRes.json();
        if (Array.isArray(tvData)) {
          for (const entry of tvData.slice(0, 3)) {
            const show = entry.show;
            if (!show || isDuplicate(show.name)) continue;
            const releaseYear = show.premiered ? parseInt(show.premiered.substring(0, 4), 10) : undefined;
            const cleanSummary = show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : undefined;

            results.push({
              externalId: `tvmaze-${show.id}`,
              type: 'tv',
              title: show.name,
              creator: (show.network && show.network.name) || (show.webChannel && show.webChannel.name) || 'TV Production',
              releaseYear: isNaN(releaseYear as number) ? undefined : releaseYear,
              coverImage: show.image?.original || show.image?.medium,
              overview: cleanSummary,
              genres: show.genres || [],
              source: 'tvmaze',
            });
          }
        }
      }
    } catch (e) {}
  }

  return NextResponse.json({ results: results.slice(0, 10) });
}
