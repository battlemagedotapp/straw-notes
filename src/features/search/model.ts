import type { Note, Recording } from '../notes/types';
export function searchResources(notes: Note[], recordings: Recording[], query: string) {
  const term = query.trim().toLocaleLowerCase();
  return {
    notes: term
      ? notes.filter(
          (n) =>
            !n.deletedAt && [n.title, n.body].some((t) => t.toLocaleLowerCase().includes(term)),
        )
      : [],
    recordings: term
      ? recordings
          .filter((r) => !r.deletedAt)
          .flatMap((recording) => {
            const match =
              recording.transcriptStatus === 'available'
                ? recording.segments.find((s) => s.text.toLocaleLowerCase().includes(term))
                : undefined;
            return match || recording.title.toLocaleLowerCase().includes(term)
              ? [{ recording, match }]
              : [];
          })
      : [],
  };
}
