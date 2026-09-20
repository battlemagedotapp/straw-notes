import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appReducer, createAppState, newNote, type AppState } from '../src/features/notes/model';
import { audioReducer, initialAudioState } from '../src/features/audio/model';
import { createSeedNotes, folders, transcript } from '../src/fixtures/notes';

const now = '2026-09-20T10:00:00.000Z';
function recorded(): AppState {
  let state = createAppState(createSeedNotes(new Date(now)), folders);
  state = appReducer(state, {
    type: 'audio',
    action: { type: 'start', id: 'capture', title: 'Sunday' },
  });
  return appReducer(state, {
    type: 'audio',
    action: { type: 'tick', deltaMs: 18000, segments: transcript },
  });
}

test('pause freezes recording; resume counts only active time and adds transcript passages', () => {
  let state = recorded().audio;
  state = audioReducer(state, { type: 'toggleCapture' });
  state = audioReducer(state, { type: 'tick', deltaMs: 60000, segments: transcript });
  assert.equal(state.capture?.elapsedMs, 18000);
  assert.equal(state.capture?.segments.length, 3);
  state = audioReducer(state, { type: 'toggleCapture' });
  state = audioReducer(state, { type: 'tick', deltaMs: 6000, segments: transcript });
  assert.equal(state.capture?.elapsedMs, 24000);
  assert.equal(state.capture?.segments.length, 4);
});

test('interruption retains audio, writing and moments until resumed or finished', () => {
  let state = recorded();
  state = appReducer(state, { type: 'audio', action: { type: 'mark', id: 'mark' } });
  state = appReducer(state, {
    type: 'audio',
    action: { type: 'nameMoment', captureId: 'capture', momentId: 'mark', name: '  Sunday  ' },
  });
  state = appReducer(state, { type: 'audio', action: { type: 'interrupt' } });
  state = appReducer(state, {
    type: 'audio',
    action: { type: 'tick', deltaMs: 90000, segments: transcript },
  });
  assert.equal(state.audio.capture?.status, 'interrupted');
  assert.equal(state.audio.capture?.elapsedMs, 18000);
  state = appReducer(state, { type: 'audio', action: { type: 'finish' } });
  assert.equal(state.audio.capture, null);
  assert.equal(state.audio.pending[0]?.moments[0]?.name, 'Sunday');
  assert.equal(state.audio.pending[0]?.moments[0]?.timeMs, 18000);
  assert.equal(state.notes.notes[1]?.body, createSeedNotes()[1]?.body);
});

test('failed destination save keeps capture, chosen note and writing; retry attaches once', () => {
  let state = recorded();
  const original = state.notes.notes.find((n) => n.id === 'morning')!;
  state = appReducer(state, { type: 'audio', action: { type: 'finish' } });
  state = appReducer(state, { type: 'failNextSave' });
  const save = { type: 'attach' as const, captureId: 'capture', noteId: 'morning', updatedAt: now };
  state = appReducer(state, save);
  assert.match(state.audio.saveErrors.capture!, /still here/);
  assert.equal(state.audio.pending.length, 1);
  assert.deepEqual(
    state.notes.notes.find((n) => n.id === 'morning'),
    original,
  );
  state = appReducer(state, save);
  assert.equal(state.audio.pending.length, 0);
  assert.equal(state.audio.saveErrors.capture, undefined);
  const updated = state.notes.notes.find((n) => n.id === 'morning')!;
  assert.equal(updated.body, original.body);
  assert.equal(updated.audio.length, 2);
  assert.deepEqual(appReducer(state, save), state);
});

test('new destination preserves folder and failed save does not create a phantom note', () => {
  let state = appReducer(recorded(), { type: 'audio', action: { type: 'finish' } });
  state = appReducer(state, { type: 'failNextSave' });
  const save = {
    type: 'attach' as const,
    captureId: 'capture',
    noteId: 'new',
    newNote: newNote('new', 'work', now, 'Planning'),
    updatedAt: now,
  };
  state = appReducer(state, save);
  assert.equal(
    state.notes.notes.some((n) => n.id === 'new'),
    false,
  );
  state = appReducer(state, save);
  assert.equal(state.notes.notes[0]?.folderId, 'work');
  assert.equal(state.notes.notes[0]?.audio[0]?.durationMs, 18000);
});

test('starting another recording retains the previous capture and paused playback position', () => {
  let state = audioReducer(initialAudioState, {
    type: 'play',
    audioId: 'song',
    durationMs: 100000,
  });
  state = audioReducer(state, { type: 'tick', deltaMs: 42000, segments: [] });
  state = audioReducer(state, { type: 'start', id: 'first', title: 'First' });
  assert.deepEqual(state.playback, { status: 'idle' });
  assert.equal(state.listeningPositions.song, 42000);
  state = audioReducer(state, { type: 'tick', deltaMs: 1500, segments: transcript });
  state = audioReducer(state, { type: 'start', id: 'second', title: 'Second' });
  assert.equal(state.pending[0]?.elapsedMs, 1500);
  assert.equal(state.capture?.id, 'second');
  assert.equal(state.capture?.elapsedMs, 0);
});

test('playback shares one position, clamps seeks, and cannot run over an active capture', () => {
  let state = audioReducer(initialAudioState, { type: 'play', audioId: 'clip', durationMs: 20000 });
  state = audioReducer(state, {
    type: 'seek',
    audioId: 'clip',
    durationMs: 20000,
    positionMs: 19000,
  });
  state = audioReducer(state, { type: 'tick', deltaMs: 5000, segments: [] });
  assert.deepEqual(state.playback, {
    status: 'paused',
    audioId: 'clip',
    durationMs: 20000,
    positionMs: 20000,
  });
  state = audioReducer(state, { type: 'play', audioId: 'clip', durationMs: 20000 });
  assert.equal(state.playback.status !== 'idle' && state.playback.positionMs, 0);
  state = audioReducer(state, { type: 'seek', audioId: 'clip', durationMs: 20000, positionMs: -1 });
  assert.equal(state.playback.status !== 'idle' && state.playback.positionMs, 0);
  state = audioReducer(state, { type: 'start', id: 'capture', title: 'Capture' });
  assert.deepEqual(
    audioReducer(state, { type: 'play', audioId: 'clip', durationMs: 20000 }),
    state,
  );
});

test('writing during capture leaves the transcript and audio identity unchanged', () => {
  let state = recorded();
  const audio = state.audio;
  state = appReducer(state, {
    type: 'write',
    id: 'morning',
    title: 'Changed',
    body: 'My own words',
    updatedAt: now,
  });
  assert.strictEqual(state.audio, audio);
  assert.equal(state.notes.notes.find((n) => n.id === 'morning')?.body, 'My own words');
  assert.equal(state.notes.notes.find((n) => n.id === 'morning')?.audio[0]?.id, 'morning-audio');
});

test('organization preserves writing, attachments and moments through move, trash and restore', () => {
  let state = recorded();
  const note = state.notes.notes.find((n) => n.id === 'morning')!;
  const capture = state.audio.capture;
  state = appReducer(state, { type: 'pin', ids: ['morning'], pinned: true });
  state = appReducer(state, { type: 'move', ids: ['morning'], folderId: 'work', updatedAt: now });
  state = appReducer(state, { type: 'trash', ids: ['morning'], deletedAt: now });
  assert.strictEqual(state.audio.capture, capture);
  assert.equal(state.notes.notes.find((n) => n.id === 'morning')?.deletedAt, now);
  state = appReducer(state, { type: 'restore', ids: ['morning'] });
  assert.deepEqual(
    state.notes.notes.find((n) => n.id === 'morning'),
    { ...note, pinned: true, folderId: 'work', updatedAt: now },
  );
});

test('permanent deletion protects active notes and trash clears only owned playback', () => {
  let state = createAppState(createSeedNotes(new Date(now)), folders);
  state = appReducer(state, {
    type: 'audio',
    action: { type: 'play', audioId: 'morning-audio', durationMs: 138000 },
  });
  state = appReducer(state, { type: 'trash', ids: ['weekend'], deletedAt: now });
  assert.equal(state.audio.playback.status, 'playing');
  state = appReducer(state, { type: 'deletePermanently', ids: ['weekend', 'morning'] });
  assert.equal(
    state.notes.notes.some((n) => n.id === 'weekend'),
    false,
  );
  assert.ok(state.notes.notes.some((n) => n.id === 'morning'));
  state = appReducer(state, { type: 'trash', ids: ['morning'], deletedAt: now });
  assert.equal(state.audio.playback.status, 'idle');
});

test('closing a player stops the clock, remembers position and does not auto-open after capture', () => {
  let state = audioReducer(initialAudioState, { type: 'play', audioId: 'a', durationMs: 10000 });
  state = audioReducer(state, { type: 'tick', deltaMs: 3500, segments: [] });
  state = audioReducer(state, { type: 'closePlayer', audioId: 'a' });
  assert.equal(state.playback.status, 'idle');
  assert.equal(state.listeningPositions.a, 3500);
  state = audioReducer(state, { type: 'tick', deltaMs: 3000, segments: [] });
  assert.equal(state.listeningPositions.a, 3500);
  state = audioReducer(state, { type: 'start', id: 'capture', title: 'New' });
  state = audioReducer(state, { type: 'discard', captureId: 'capture' });
  assert.equal(state.playback.status, 'idle');
  state = audioReducer(state, { type: 'play', audioId: 'a', durationMs: 10000 });
  assert.equal(state.playback.status !== 'idle' && state.playback.positionMs, 3500);
});

test('discard and save errors target one pending capture; stale finish cannot finish another capture', () => {
  let state = audioReducer(initialAudioState, { type: 'start', id: 'first', title: 'First' });
  state = audioReducer(state, { type: 'start', id: 'second', title: 'Second' });
  const unchanged = audioReducer(state, { type: 'finish', captureId: 'first' });
  assert.strictEqual(unchanged, state);
  state = audioReducer(state, { type: 'finish', captureId: 'second' });
  state = audioReducer(state, { type: 'saveFailed', captureId: 'first' });
  state = audioReducer(state, { type: 'saveFailed', captureId: 'second' });
  state = audioReducer(state, { type: 'discard', captureId: 'first' });
  assert.deepEqual(
    state.pending.map((c) => c.id),
    ['second'],
  );
  assert.equal(state.saveErrors.first, undefined);
  assert.ok(state.saveErrors.second);
  state = audioReducer(state, { type: 'attached', captureId: 'second' });
  assert.deepEqual(state.saveErrors, {});
});
