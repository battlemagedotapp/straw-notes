import { noteTitle } from './model';
import type { Note } from './types';
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
export function noteMetadata(note: Note, folder: string) {
  const date = new Date(note.deletedAt ?? note.updatedAt);
  const when = dateGroup(date.toISOString());
  if (note.deletedAt)
    return `Deleted ${when === 'Earlier' ? date.toLocaleDateString() : when.toLocaleLowerCase()}`;
  const audio = note.audio.length
    ? `Audio, ${Math.max(1, Math.round(note.audio.reduce((n, a) => n + a.durationMs, 0) / 60000))} min`
    : '';
  return [
    when === 'Today'
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : when === 'Yesterday'
        ? 'Yesterday'
        : date.toLocaleDateString(),
    audio,
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
