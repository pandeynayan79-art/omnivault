import { MediaItem, AtomicNote } from '@/types';

export interface BacklinkResult {
  sourceType: 'note' | 'media';
  id: string;
  title: string;
  preview: string;
  date: string;
}

/**
 * Extracts [[wikilinks]] from text: e.g. "Inspired by [[Atomic Habits]]" -> ["Atomic Habits"]
 */
export function extractWikiLinks(content: string): string[] {
  if (!content) return [];
  const regex = /\[\[(.*?)\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const link = match[1].trim();
    if (link && !links.includes(link)) {
      links.push(link);
    }
  }
  return links;
}

/**
 * Extracts #tags from text: e.g. "#productivity #habits" -> ["productivity", "habits"]
 */
export function extractTags(content: string): string[] {
  if (!content) return [];
  const regex = /(?:^|\s)#([a-zA-Z0-9_\-]+)/g;
  const tags: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
    }
  }
  return tags;
}

/**
 * Finds all atomic notes that link to a specific MediaItem
 * (either by explicit linkedMediaIds OR by [[Title]] in note content)
 */
export function getBacklinksForMedia(mediaItem: MediaItem, allNotes: AtomicNote[]): AtomicNote[] {
  const targetTitleLower = mediaItem.title.toLowerCase().trim();

  return allNotes.filter(note => {
    // Check explicit media IDs
    if (note.linkedMediaIds && note.linkedMediaIds.includes(mediaItem.id)) {
      return true;
    }
    // Check wikilinks
    const wikiLinks = extractWikiLinks(note.content);
    return wikiLinks.some(link => link.toLowerCase().trim() === targetTitleLower);
  });
}

/**
 * Resolves wikilinks in a note to actual media items or other notes
 */
export function resolveLinksInNote(
  note: AtomicNote,
  allMedia: MediaItem[],
  allNotes: AtomicNote[]
): { media: MediaItem[]; otherNotes: AtomicNote[] } {
  const wikiLinks = extractWikiLinks(note.content).map(l => l.toLowerCase());
  
  // Find media matched by title or ID
  const matchedMedia = allMedia.filter(m => 
    (note.linkedMediaIds && note.linkedMediaIds.includes(m.id)) ||
    wikiLinks.includes(m.title.toLowerCase())
  );

  // Find other notes matched by title
  const otherNotes = allNotes.filter(n => 
    n.id !== note.id && wikiLinks.includes(n.title.toLowerCase())
  );

  return { media: matchedMedia, otherNotes };
}

/**
 * Computes all interconnected tags across vault
 */
export function getAllTags(media: MediaItem[], notes: AtomicNote[]): { tag: string; count: number }[] {
  const tagCounts: Record<string, number> = {};

  media.forEach(m => {
    (m.tags || []).forEach(t => {
      const normalized = t.toLowerCase().trim();
      if (normalized) {
        tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
      }
    });
  });

  notes.forEach(n => {
    const noteTags = [...(n.tags || []), ...extractTags(n.content)];
    new Set(noteTags).forEach(t => {
      const normalized = t.toLowerCase().trim();
      if (normalized) {
        tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
      }
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
