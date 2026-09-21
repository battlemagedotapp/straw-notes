export interface Folder {
  id: string;
  name: string;
}
export interface TranscriptSegment {
  id: string;
  startMs: number;
  text: string;
}
export interface Moment {
  id: string;
  timeMs: number;
}
export interface Recording {
  id: string;
  title: string;
  durationMs: number;
  createdAt: string;
  updatedAt: string;
  origin: 'capture' | 'import';
  transcriptStatus: 'available' | 'unavailable';
  deletedAt?: string;
  segments: TranscriptSegment[];
  moments: Moment[];
}
export interface Note {
  id: string;
  title: string;
  body: string;
  folderId: string;
  pinned: boolean;
  updatedAt: string;
  deletedAt?: string;
  recordingIds: string[];
}
