import { noteTitle } from './model';
import type { Note, Recording } from './types';
export type NoteSort = 'recent' | 'oldest' | 'title';
export function sortNotes(notes: Note[], sort: NoteSort) {
  return [...notes].sort((a, b) =>
    sort === 'title'
      ? noteTitle(a).localeCompare(noteTitle(b))
      : sort === 'oldest'
        ? a.updatedAt.localeCompare(b.updatedAt)
        : b.updatedAt.localeCompare(a.updatedAt),
  );
}
export function dateGroup(value: string, now = new Date()) {
  const day = new Date(value).toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return day === now.toDateString()
    ? 'Today'
    : day === yesterday.toDateString()
      ? 'Yesterday'
      : 'Earlier';
}
/** Writing takes precedence; otherwise use the first readable attached transcript in note order. */
export function notePreview(note: Note, recordings: readonly Recording[] = []): string | undefined {
  const writing = note.body
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);
  if (writing) return writing;
  for (const id of note.recordingIds) {
    const audio = recordings.find((item) => item.id === id);
    if (!audio || audio.deletedAt || audio.transcriptStatus !== 'available') continue;
    const passage = audio.segments.map((segment) => segment.text.trim()).find(Boolean);
    if (passage) return passage;
  }
  return undefined;
}

export function noteMetadata(note: Note, folder?: string) {
  const date = new Date(note.deletedAt ?? note.updatedAt);
  const when = dateGroup(date.toISOString());
  if (note.deletedAt)
    return `Deleted ${when === 'Earlier' ? date.toLocaleDateString() : when.toLocaleLowerCase()}`;
  return [
    when === 'Today'
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : when === 'Yesterday'
        ? 'Yesterday'
        : date.toLocaleDateString(),
    folder,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Document metadata omits the audio summary already expressed by the attachment. */
export function documentMetadata(note: Note, folder: string) {
  const date = new Date(note.updatedAt);
  const day = dateGroup(note.updatedAt);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${day === 'Earlier' ? date.toLocaleDateString() : day}, ${time} · ${folder}`;
}
