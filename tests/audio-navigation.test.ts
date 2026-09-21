import assert from 'node:assert/strict';
import test from 'node:test';
import { workspaceRoutes } from '../src/features/audio/navigation';

test('switching audio removes the previous workspace and child sheet but preserves caller state', () => {
  const caller = { name: '(tabs)', key: 'tabs', state: { selected: 'folders' } };
  const routes = [caller, { name: 'capture', key: 'c' }, { name: 'moment', key: 'm' }];
  const next = { name: 'transcript/[id]', key: 'r', params: { id: 'r' } };
  const result = workspaceRoutes(routes, next);
  assert.deepEqual(result, [caller, next]);
  assert.equal(result[0], caller);
  assert.deepEqual(workspaceRoutes(result, next), result);
});
