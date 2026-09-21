import type { Folder, Note, Recording, TranscriptSegment } from '@/features/notes/types';

export const folders: Folder[] = [
  { id: 'personal', name: 'Personal' },
  { id: 'work', name: 'Work' },
  { id: 'ideas', name: 'Ideas' },
  { id: 'travel', name: 'Travel' },
  { id: 'recipes', name: 'Recipes' },
  { id: 'books', name: 'Books' },
  { id: 'home', name: 'Home' },
  { id: 'learning', name: 'Learning' },
  { id: 'someday', name: 'Someday' },
  { id: 'archive', name: 'Projects to revisit' },
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
/** Calendar-relative dates keep Today / Yesterday useful, including just after midnight. */
function daysAgo(now: Date, days: number) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const extraNotes: (Pick<Note, 'id' | 'title' | 'body' | 'folderId' | 'recordingIds'> & {
  days: number;
  pinned?: boolean;
  deleted?: boolean;
})[] = [
  {
    id: 'launch',
    title: 'Launch checklist',
    folderId: 'work',
    days: 0,
    pinned: true,
    body: 'Before we share the first version\n\nWalk through the welcome screen. Check the empty library. Make sure every label sounds like something we would say out loud.\n\nAsk three people to try recording an idea, finding it again, and adding it to a note. Write down where they hesitate.',
    recordingIds: ['design-review', 'team-sync'],
  },
  {
    id: 'interview',
    title: 'What we heard in the customer interviews',
    folderId: 'work',
    days: 1,
    body: 'People want to capture a thought before deciding where it belongs.\n\nKeep the first step small. Organizing can happen later. The most useful feedback came from someone trying the app on the train.',
    recordingIds: ['interview-audio'],
  },
  {
    id: 'design-decisions',
    title: 'Design decisions',
    folderId: 'work',
    days: 1,
    body: 'Use the familiar controls. Leave enough room for the content. Revisit the recording title after we have tried it with longer names.',
    recordingIds: ['design-review'],
  },
  {
    id: 'team-followup',
    title: 'Next steps from our team catch-up',
    folderId: 'work',
    days: 2,
    body: 'Maya: review the welcome copy.\nArjun: try the full import journey.\nMe: gather questions for Friday.',
    recordingIds: ['team-sync'],
  },
  {
    id: 'research',
    title: 'Questions for next week',
    folderId: 'work',
    days: 4,
    body: 'Where do people look for a saved recording?\nWhat does “remove” mean to them?\nCan they recover something without asking for help?',
    recordingIds: [],
  },
  {
    id: 'workshop',
    title: 'Workshop notes',
    folderId: 'work',
    days: 7,
    body: 'Start with a small example everyone can try. Leave time for questions at the end.',
    recordingIds: ['workshop-audio'],
  },
  {
    id: 'handoff',
    title: 'A few things to remember before handing the project to someone new',
    folderId: 'work',
    days: 12,
    body: 'Explain the decisions as well as the screens. Include a short walkthrough and the questions that are still open.',
    recordingIds: [],
  },
  {
    id: 'packing',
    title: 'Packing for a quiet weekend away',
    folderId: 'travel',
    days: 1,
    body: 'Light jacket, notebook, charger, walking shoes.\n\nLeave space for a book from the little shop near the station.',
    recordingIds: ['packing-audio'],
  },
  {
    id: 'kyoto',
    title: 'Kyoto — places to wander when we have no plans',
    folderId: 'travel',
    days: 3,
    body: 'Start early by the river. Find somewhere small for breakfast.\n\nKeep one afternoon completely open. If it rains, look for a bookshop and stay for tea.',
    recordingIds: ['kyoto-audio'],
  },
  {
    id: 'train',
    title: 'Train details',
    folderId: 'travel',
    days: 8,
    body: 'Meet at the main entrance at 8:15. Bring breakfast for the journey.',
    recordingIds: [],
  },
  {
    id: 'lentils',
    title: 'Lemon lentil soup',
    folderId: 'recipes',
    days: 2,
    body: 'Soften an onion with cumin. Add red lentils, carrots and stock. Simmer until soft.\n\nFinish with lemon, black pepper and a handful of parsley. Save some for tomorrow.',
    recordingIds: ['recipe-audio'],
  },
  {
    id: 'reading',
    title: 'A sentence I want to keep',
    folderId: 'books',
    days: 5,
    body: 'Pay attention to the ordinary days. They are where most of life happens.',
    recordingIds: [],
  },
  {
    id: 'shelves',
    title: 'Living room shelves',
    folderId: 'home',
    days: 6,
    body: 'Measure the wall beside the window. Try a lower shelf first so the room still feels open.',
    recordingIds: ['shelves-audio'],
  },
  {
    id: 'small-rituals',
    title: 'Small rituals',
    folderId: 'ideas',
    days: 1,
    body: 'A walk before opening the laptop. One page before bed. A slower Sunday.',
    recordingIds: ['morning-audio'],
  },
  {
    id: 'audio-only',
    title: 'An idea on the way home',
    folderId: 'ideas',
    days: 3,
    body: '',
    recordingIds: ['way-home'],
  },
  {
    id: 'birthday',
    title: 'Birthday ideas',
    folderId: 'personal',
    days: 9,
    body: 'A homemade dinner and a playlist. Ask everyone to bring one photo and the story behind it.',
    recordingIds: [],
  },
  {
    id: 'old-plan',
    title: 'An earlier plan for the weekend',
    folderId: 'personal',
    days: 10,
    deleted: true,
    body: 'Keep the morning free and meet for lunch instead.',
    recordingIds: ['old-weekend-audio'],
  },
  {
    id: 'old-draft',
    title: 'First draft of the welcome message',
    folderId: 'work',
    days: 14,
    deleted: true,
    body: 'Capture a thought. Come back to it when you have time.',
    recordingIds: [],
  },
];

const extraRecordings: {
  id: string;
  title: string;
  seconds: number;
  days: number;
  text?: string;
  imported?: boolean;
  deleted?: boolean;
}[] = [
  {
    id: 'design-review',
    title: 'Design review — making the first few minutes feel familiar',
    seconds: 1115,
    days: 0,
    text: 'The first screen should make it easy to start. We can ask about folders later. Keep the labels simple and try the whole journey with someone new.',
  },
  {
    id: 'team-sync',
    title: 'Monday team catch-up',
    seconds: 483,
    days: 0,
    text: 'Let us each pick one thing to finish this week. Maya will review the copy and Arjun will try importing a recording.',
  },
  {
    id: 'coffee-thought',
    title: 'A thought over coffee',
    seconds: 17,
    days: 0,
    text: 'What if we leave Friday afternoon free for finishing the small things?',
  },
  {
    id: 'interview-audio',
    title: 'Customer conversation — saving an idea on the train',
    seconds: 2058,
    days: 1,
    imported: true,
    text: 'I usually record first and decide where it belongs later. Sometimes I want the recording by itself, and sometimes I want to write a few lines beside it.',
  },
  {
    id: 'packing-audio',
    title: 'Before we leave',
    seconds: 46,
    days: 1,
    text: 'Remember the charger, walking shoes and the little notebook. We can buy breakfast at the station.',
  },
  { id: 'rain', title: 'Rain outside the window', seconds: 302, days: 1, imported: true },
  {
    id: 'recipe-audio',
    title: 'How Mum makes lemon lentil soup',
    seconds: 264,
    days: 2,
    text: 'Cook the onion slowly. Add the cumin before the lentils. The lemon goes in right at the end, after you turn off the heat.',
  },
  {
    id: 'kyoto-audio',
    title: 'Kyoto recommendations from a friend',
    seconds: 752,
    days: 3,
    imported: true,
    text: 'Walk along the river early in the morning. There is a small bakery near the bridge. Leave an afternoon for wandering without a map.',
  },
  {
    id: 'way-home',
    title: 'An idea on the way home',
    seconds: 68,
    days: 3,
    text: 'A place to collect the things we notice during the week. Not a checklist. Just a few thoughts to return to.',
  },
  { id: 'melody', title: 'A little melody', seconds: 12, days: 4 },
  {
    id: 'shelves-audio',
    title: 'Measurements for the living room',
    seconds: 95,
    days: 6,
    text: 'The space beside the window is a little narrower than I remembered. Measure it again before choosing the shelves.',
  },
  {
    id: 'workshop-audio',
    title: 'Workshop discussion and questions',
    seconds: 3724,
    days: 7,
    imported: true,
    text: 'Start with an example everyone can try. Then ask what was clear and what needed an explanation. Leave plenty of time for questions.',
  },
  { id: 'garden', title: 'Birds in the garden', seconds: 189, days: 12, imported: true },
  {
    id: 'old-weekend-audio',
    title: 'An earlier weekend plan',
    seconds: 53,
    days: 10,
    deleted: true,
    text: 'Maybe lunch will work better than breakfast. Check with everyone tomorrow.',
  },
  { id: 'accidental', title: 'Pocket recording', seconds: 3, days: 2, deleted: true },
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
      recordingIds: [],
    },
    {
      id: 'morning',
      title: 'Morning walk idea',
      body: 'A slower kind of Sunday\n\nA walk, good coffee, and a notebook. Leave the morning open and see where it takes us.\n\nA few things to try\n\nTake the long way through the park.\nFind a café we haven’t tried.\nWrite down one good idea.',
      folderId: 'personal',
      pinned: false,
      updatedAt: date,
      recordingIds: ['morning-audio'],
    },
    {
      id: 'studio',
      title: 'Studio planning',
      body: 'A few good ideas for what comes next.',
      folderId: 'work',
      pinned: false,
      updatedAt: date,
      recordingIds: [],
    },
    {
      id: 'ideas',
      title: 'Things worth remembering',
      body: 'Make room for the unfinished ideas.',
      folderId: 'personal',
      pinned: false,
      updatedAt: date,
      recordingIds: [],
    },
    ...extraNotes.map(({ days, deleted, ...note }) => ({
      ...note,
      pinned: note.pinned ?? false,
      updatedAt: daysAgo(now, days),
      ...(deleted ? { deletedAt: daysAgo(now, 1) } : {}),
    })),
  ];
}

export function createSeedRecordings(now = new Date()): Recording[] {
  return [
    {
      id: 'morning-audio',
      title: 'Morning walk idea',
      durationMs: 138000,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      origin: 'capture',
      transcriptStatus: 'available',
      segments: transcript,
      moments: [{ id: 'sunday-mark', timeMs: 8000 }],
    },
    ...extraRecordings.map((item): Recording => ({
      id: item.id,
      title: item.title,
      durationMs: item.seconds * 1000,
      createdAt: daysAgo(now, item.days),
      updatedAt: daysAgo(now, item.days),
      origin: item.imported ? 'import' : 'capture',
      transcriptStatus: item.text ? 'available' : 'unavailable',
      segments: item.text
        ? item.text.split(/(?<=\.) /).map((text, index) => ({
            id: item.id + '-passage-' + index,
            startMs: index * 8000,
            text,
          }))
        : [],
      moments: item.text ? [{ id: item.id + '-moment', timeMs: 8000 }] : [],
      ...(item.deleted ? { deletedAt: daysAgo(now, 1) } : {}),
    })),
  ];
}
export const importSamples = [
  {
    id: 'walk',
    title: 'Afternoon walk.m4a',
    durationMs: 92000,
    outcome: 'success' as const,
    segments: transcript,
  },
  {
    id: 'meeting',
    title: 'Meeting ideas.wav',
    durationMs: 180000,
    outcome: 'retry' as const,
    segments: [],
  },
  {
    id: 'unsupported',
    title: 'Archive.zip',
    durationMs: 0,
    outcome: 'unsupported' as const,
    segments: [],
  },
];
