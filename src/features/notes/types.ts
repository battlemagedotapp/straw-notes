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
  name: string;
}
export interface AudioAttachment {
  id: string;
  title: string;
  durationMs: number;
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
  audio: AudioAttachment[];
}
