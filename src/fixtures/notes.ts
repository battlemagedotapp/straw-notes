import type { Folder, Note, TranscriptSegment } from '@/features/notes/types';

export const folders: Folder[] = [
  { id: 'personal', name: 'Personal' },
  { id: 'work', name: 'Work' },
  { id: 'ideas', name: 'Ideas' },
];
export const transcript: TranscriptSegment[] = [
  {
    id: 'opening',
    startMs: 0,
    text: 'I keep thinking about making a little more room in the week. Nothing big. Just something that belongs to us.',
  },
  {
    id: 'sunday',
    startMs: 8000,
    text: 'What if we made Sunday mornings a little slower? A walk, good coffee, and a notebook.',
  },
  {
    id: 'plans',
    startMs: 16000,
    text: 'No plans until noon. Just a little room for whatever comes to mind.',
  },
  {
    id: 'park',
    startMs: 24000,
    text: 'Take the long way through the park. Find a café we haven’t tried. Write down one good idea before we leave.',
  },
];
export function createSeedNotes(now = new Date()): Note[] {
  const date = now.toISOString();
  return [
    {
      id: 'weekend',
      title: 'Weekend checklist',
      body: 'Groceries, a walk, a little time outside.',
      folderId: 'personal',
      pinned: true,
      updatedAt: date,
      audio: [],
    },
    {
      id: 'morning',
      title: 'Morning walk idea',
      body: 'A slower kind of Sunday\n\nA walk, good coffee, and a notebook. Leave the morning open and see where it takes us.\n\nA few things to try\n\nTake the long way through the park.\nFind a café we haven’t tried.\nWrite down one good idea.',
      folderId: 'personal',
      pinned: false,
      updatedAt: date,
      audio: [
        {
          id: 'morning-audio',
          title: 'Morning walk idea',
          durationMs: 138000,
          segments: transcript,
          moments: [{ id: 'sunday-mark', name: 'A slower Sunday', timeMs: 8000 }],
        },
      ],
    },
    {
      id: 'studio',
      title: 'Studio planning',
      body: 'A few good ideas for what comes next.',
      folderId: 'work',
      pinned: false,
      updatedAt: date,
      audio: [],
    },
    {
      id: 'ideas',
      title: 'Things worth remembering',
      body: 'Make room for the unfinished ideas.',
      folderId: 'personal',
      pinned: false,
      updatedAt: date,
      audio: [],
    },
  ];
}
