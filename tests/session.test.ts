import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  appReducer,
  createAppState,
  newNote,
  type AppState,
  type AppAction,
} from '../src/features/notes/model';
import { audioReducer, initialAudioState } from '../src/features/audio/model';
import { createSeedNotes, createSeedRecordings, folders, transcript } from '../src/fixtures/notes';

const now = '2026-09-20T10:00:00.000Z';
const seed = () =>
  createAppState(createSeedNotes(new Date(now)), folders, createSeedRecordings(new Date(now)));
function reduce(state: AppState, ...actions: AppAction[]) {
  return actions.reduce(appReducer, state);
}
function captured(noteId?: string) {
  return reduce(
    seed(),
    { type: 'audio', action: { type: 'start', id: 'capture', title: 'Sunday', noteId } },
    { type: 'audio', action: { type: 'tick', deltaMs: 18000, segments: transcript } },
  );
}
const finish: AppAction = { type: 'finishCapture', captureId: 'capture', now };
function attach(noteId: string, operationId = noteId): AppAction {
  return { type: 'linkRecordings', operationId, recordingIds: ['capture'], noteId, now };
}

test('capture pause, interruption and resume count active time only', () => {
  let state = captured();
  state = reduce(
    state,
    { type: 'audio', action: { type: 'toggleCapture', captureId: 'capture' } },
    { type: 'audio', action: { type: 'tick', deltaMs: 90000, segments: transcript } },
  );
  assert.equal(state.audio.capture?.elapsedMs, 18000);
  state = reduce(
    state,
    { type: 'audio', action: { type: 'toggleCapture', captureId: 'capture' } },
    { type: 'audio', action: { type: 'interrupt' } },
  );
  assert.equal(state.audio.capture?.status, 'interrupted');
  state = reduce(
    state,
    { type: 'audio', action: { type: 'toggleCapture', captureId: 'capture' } },
    { type: 'audio', action: { type: 'tick', deltaMs: 6000, segments: transcript } },
  );
  assert.equal(state.audio.capture?.elapsedMs, 24000);
});

test('finish saves standalone once; empty and stale captures cannot be saved', () => {
  const state = appReducer(captured(), finish);
  assert.equal(state.audio.capture, null);
  assert.equal(state.recordings.filter((r) => r.id === 'capture').length, 1);
  assert.ok(state.notes.notes.every((n) => !n.recordingIds.includes('capture')));
  assert.strictEqual(appReducer(state, finish), state);
  const next = appReducer(state, {
    type: 'audio',
    action: { type: 'start', id: 'next', title: 'Next' },
  });
  assert.strictEqual(appReducer(next, finish), next);
  assert.strictEqual(
    audioReducer(next.audio, { type: 'toggleCapture', captureId: 'capture' }),
    next.audio,
  );
  assert.strictEqual(
    audioReducer(next.audio, { type: 'mark', captureId: 'capture', id: 'stale' }),
    next.audio,
  );
  assert.strictEqual(appReducer(next, { type: 'finishCapture', captureId: 'next', now }), next);
});

test('failed save retains capture, moments and association; retry preserves identity', () => {
  let state = reduce(
    captured('morning'),
    { type: 'audio', action: { type: 'mark', captureId: 'capture', id: 'moment' } },
    { type: 'setFailure', operationId: 'save:capture' },
    finish,
  );
  assert.equal(state.audio.capture?.status, 'paused');
  assert.ok(state.audio.capture?.saveError);
  assert.ok(!state.recordings.some((r) => r.id === 'capture'));
  state = appReducer(state, finish);
  assert.equal(state.audio.capture, null);
  assert.equal(state.recordings.find((r) => r.id === 'capture')?.moments[0]?.timeMs, 18000);
  assert.ok(state.notes.notes.find((n) => n.id === 'morning')?.recordingIds.includes('capture'));
  assert.equal(state.recordings.find((r) => r.id === 'capture')?.durationMs, 18000);
});

test('write for capture creates one note; discard does not remove writing', () => {
  const note = newNote('written', 'personal', now);
  let state = reduce(
    captured(),
    { type: 'writeForCapture', captureId: 'capture', note },
    { type: 'writeForCapture', captureId: 'capture', note: newNote('duplicate', 'personal', now) },
    {
      type: 'write',
      id: 'written',
      title: 'My words',
      body: 'Independent writing',
      updatedAt: now,
    },
  );
  assert.equal(state.audio.capture?.noteId, 'written');
  assert.ok(!state.notes.notes.some((n) => n.id === 'duplicate'));
  assert.deepEqual(state.audio.capture?.segments, transcript.slice(0, 3));
  state = appReducer(state, { type: 'audio', action: { type: 'discard', captureId: 'capture' } });
  assert.equal(state.notes.notes.find((n) => n.id === 'written')?.body, 'Independent writing');
});

test('missing or failed auto-link never loses saved audio or resurrects a note', () => {
  let state = reduce(
    captured('morning'),
    { type: 'trash', ids: ['morning'], deletedAt: now },
    finish,
  );
  assert.ok(state.recordings.some((r) => r.id === 'capture'));
  assert.equal(state.notes.notes.find((n) => n.id === 'morning')?.deletedAt, now);
  assert.equal(state.operations['capture-link:capture']?.status, 'error');
  state = appReducer(state, attach('studio', 'capture-link:capture'));
  assert.equal(state.operations['capture-link:capture']?.status, 'success');
  let failed = reduce(
    captured('morning'),
    { type: 'setFailure', operationId: 'capture-link:capture' },
    finish,
  );
  assert.equal(failed.audio.capture, null);
  failed = appReducer(failed, attach('morning', 'capture-link:capture'));
  assert.equal(failed.recordings.filter((r) => r.id === 'capture').length, 1);
});

test('shared references are ordered, duplicate safe and do not copy recording data', () => {
  let state = reduce(captured(), finish, attach('morning'), attach('studio'));
  state = appReducer(state, {
    type: 'linkRecordings',
    operationId: 'again',
    recordingIds: ['capture', 'capture'],
    noteId: 'morning',
    now,
  });
  assert.deepEqual(state.notes.notes.find((n) => n.id === 'morning')?.recordingIds, [
    'morning-audio',
    'capture',
  ]);
  assert.equal(state.recordings.filter((r) => r.id === 'capture').length, 1);
  state = appReducer(state, { type: 'renameRecording', id: 'capture', title: 'Renamed', now });
  assert.equal(state.recordings.find((r) => r.id === 'capture')?.title, 'Renamed');
  assert.strictEqual(appReducer(state, attach('studio')), state);
});

test('batch linking is atomic; failed new-note creation leaves no phantom note', () => {
  const state = appReducer(captured(), finish);
  const action: AppAction = {
    type: 'linkRecordings',
    operationId: 'new',
    recordingIds: ['capture', 'missing'],
    noteId: 'new',
    newNote: newNote('new', 'work', now),
    now,
  };
  let next = appReducer(state, action);
  assert.ok(!next.notes.notes.some((n) => n.id === 'new'));
  assert.equal(next.operations.new?.status, 'error');
  next = appReducer(next, { ...action, recordingIds: ['capture'] });
  assert.deepEqual(next.notes.notes.find((n) => n.id === 'new')?.recordingIds, ['capture']);
  assert.equal(next.notes.notes.find((n) => n.id === 'new')?.folderId, 'work');
  const invalid = appReducer(state, {
    ...action,
    recordingIds: ['capture'],
    newNote: newNote('new', 'missing', now),
  });
  assert.ok(!invalid.notes.notes.some((n) => n.id === 'new'));
});

test('note unlink, trash and permanent deletion leave recording and playback alive', () => {
  let state = reduce(
    captured(),
    finish,
    attach('morning'),
    { type: 'audio', action: { type: 'play', audioId: 'capture', durationMs: 18000 } },
    { type: 'unlinkRecording', recordingId: 'capture', noteId: 'morning', now },
    { type: 'trash', ids: ['morning'], deletedAt: now },
    { type: 'deletePermanently', ids: ['morning', 'studio'] },
  );
  assert.equal(state.audio.playback.status, 'playing');
  assert.ok(state.recordings.some((r) => r.id === 'capture'));
  assert.ok(state.notes.notes.some((n) => n.id === 'studio'));
  assert.ok(!state.notes.notes.some((n) => n.id === 'morning'));
});

test('recording trash preserves references; restore reconnects without autoplay; purge cleans all references', () => {
  let state = reduce(
    captured(),
    finish,
    attach('morning'),
    attach('studio'),
    { type: 'audio', action: { type: 'play', audioId: 'capture', durationMs: 18000 } },
    { type: 'audio', action: { type: 'tick', deltaMs: 2000, segments: [] } },
    { type: 'trashRecordings', ids: ['capture'], now },
  );
  assert.equal(state.audio.playback.status, 'idle');
  assert.ok(state.notes.notes.find((n) => n.id === 'studio')?.recordingIds.includes('capture'));
  state = appReducer(state, { type: 'restoreRecordings', ids: ['capture'] });
  assert.equal(state.audio.playback.status, 'idle');
  assert.ok(!state.recordings.find((r) => r.id === 'capture')?.deletedAt);
  state = reduce(
    state,
    { type: 'trash', ids: ['studio'], deletedAt: now },
    { type: 'trashRecordings', ids: ['capture'], now },
    { type: 'deleteRecordingsPermanently', ids: ['capture', 'morning-audio'] },
  );
  assert.ok(state.notes.notes.every((n) => !n.recordingIds.includes('capture')));
  assert.equal(state.audio.listeningPositions.capture, undefined);
  assert.ok(state.recordings.some((r) => r.id === 'morning-audio'));
});

test('save-and-play is atomic on save failure; capture cannot be replaced by another start', () => {
  let state = captured();
  assert.strictEqual(
    appReducer(state, { type: 'audio', action: { type: 'start', id: 'second', title: 'Second' } })
      .audio,
    state.audio,
  );
  state = reduce(
    state,
    { type: 'setFailure', operationId: 'save:capture' },
    { ...finish, playAfterId: 'morning-audio' },
  );
  assert.equal(state.audio.playback.status, 'idle');
  assert.ok(state.audio.capture);
  state = appReducer(state, { ...finish, playAfterId: 'morning-audio' });
  assert.equal(state.audio.capture, null);
  assert.equal(state.audio.playback.status, 'playing');
});

test('partial import retry is idempotent and does not affect capture or playback', () => {
  const state = captured();
  const sample = {
    ...createSeedRecordings(new Date(now))[0]!,
    id: 'imported',
    origin: 'import' as const,
  };
  let next = reduce(
    state,
    { type: 'importRecording', operationId: 'a', recording: sample },
    {
      type: 'importRecording',
      operationId: 'b',
      recording: { ...sample, id: 'retry' },
      error: 'Try again',
    },
  );
  assert.strictEqual(next.audio, state.audio);
  assert.equal(next.recordings.filter((r) => ['imported', 'retry'].includes(r.id)).length, 1);
  next = reduce(
    next,
    { type: 'importRecording', operationId: 'b', recording: { ...sample, id: 'retry' } },
    { type: 'importRecording', operationId: 'a', recording: sample },
  );
  assert.equal(next.recordings.filter((r) => ['imported', 'retry'].includes(r.id)).length, 2);
});

test('playback clamps seeks, remembers positions, replays at end and never auto-resumes after capture', () => {
  let state = audioReducer(initialAudioState, { type: 'play', audioId: 'a', durationMs: 10000 });
  state = audioReducer(state, { type: 'rate', rate: 2 });
  state = audioReducer(state, { type: 'tick', deltaMs: 6000, segments: [] });
  assert.deepEqual(state.playback, {
    status: 'paused',
    audioId: 'a',
    durationMs: 10000,
    positionMs: 10000,
  });
  state = audioReducer(state, { type: 'play', audioId: 'a', durationMs: 10000 });
  assert.equal(state.playback.status !== 'idle' && state.playback.positionMs, 0);
  state = audioReducer(state, { type: 'seek', audioId: 'a', durationMs: 10000, positionMs: 3000 });
  state = audioReducer(state, { type: 'start', id: 'c', title: 'New' });
  assert.equal(state.listeningPositions.a, 3000);
  assert.equal(state.playback.status, 'idle');
  state = audioReducer(state, { type: 'discard', captureId: 'c' });
  assert.equal(state.playback.status, 'idle');
});

test('folder deletion preserves note references and moves active/deleted notes to default', () => {
  let state = reduce(
    seed(),
    { type: 'move', ids: ['morning'], folderId: 'work', updatedAt: now },
    { type: 'trash', ids: ['morning'], deletedAt: now },
    { type: 'deleteFolder', id: 'work' },
  );
  assert.equal(state.notes.notes.find((n) => n.id === 'morning')?.folderId, 'personal');
  assert.deepEqual(state.notes.notes.find((n) => n.id === 'morning')?.recordingIds, [
    'morning-audio',
  ]);
  state = appReducer(state, { type: 'deleteFolder', id: 'personal' });
  assert.ok(state.notes.folders.some((f) => f.id === 'personal'));
});

test('dismissing a player keeps its position and stale dismissal cannot close another player', () => {
  let state = audioReducer(initialAudioState, {
    type: 'seek',
    audioId: 'a',
    durationMs: 10000,
    positionMs: 4000,
  });
  state = audioReducer(state, { type: 'closePlayer', audioId: 'a' });
  assert.equal(state.playback.status, 'idle');
  assert.equal(state.listeningPositions.a, 4000);
  state = audioReducer(state, { type: 'play', audioId: 'a', durationMs: 10000 });
  assert.equal(state.playback.status !== 'idle' && state.playback.positionMs, 4000);
  state = audioReducer(state, { type: 'play', audioId: 'b', durationMs: 20000 });
  assert.equal(audioReducer(state, { type: 'closePlayer', audioId: 'a' }), state);
});
