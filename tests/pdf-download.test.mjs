import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPdfDownload } from '../app/pdf-download.ts';

test('one click generates and downloads; concurrent clicks cannot generate twice', async () => {
  let finish;
  let generated = 0;
  const downloaded = [], loading = [];
  const run = createPdfDownload(() => { generated++; return new Promise(resolve => { finish = resolve; }); }, url => downloaded.push(url));
  const first = run('book-a', value => loading.push(value));
  await run('book-a', () => assert.fail('second click changed loading'));
  assert.equal(generated, 1);
  assert.deepEqual(loading, [true]);
  finish('pdf-a'); await first;
  assert.deepEqual(downloaded, ['pdf-a']);
  assert.deepEqual(loading, [true, false]);
});

test('blocked automatic download retains PDF for direct retry; changed book regenerates', async () => {
  let generated = 0, attempts = 0;
  const run = createPdfDownload(async () => `pdf-${++generated}`, () => { if (++attempts === 1) throw Error('blocked'); });
  await assert.rejects(run('book-a', () => {}), /blocked/);
  await run('book-a', () => assert.fail('cached retry must not regenerate'));
  assert.equal(generated, 1); assert.equal(attempts, 2);
  await run('book-b', () => {});
  assert.equal(generated, 2);
});

test('generation error releases loading and allows retry', async () => {
  let attempts = 0;
  const loading = [];
  const run = createPdfDownload(async () => { if (++attempts === 1) throw Error('failed'); return 'pdf'; }, () => {});
  await assert.rejects(run('book', value => loading.push(value)));
  assert.deepEqual(loading, [true, false]);
  await run('book', () => {}); assert.equal(attempts, 2);
});
