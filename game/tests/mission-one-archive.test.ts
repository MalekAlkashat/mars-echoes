import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { MissionPhase } from '../src/app/contracts.ts';
import { archiveCue } from '../src/scenes/episodes/rover/missions/blueberry-clue/archive-cues.ts';
import { NASA_ARCHIVE } from '../src/scenes/episodes/rover/missions/blueberry-clue/archive-data.ts';

test('archive images never imply photographic evidence during tool operation or ancient-water reconstruction', () => {
  const phases: MissionPhase[] = ['approach', 'brush', 'grind', 'inspect', 'compare', 'water'];
  for (const phase of phases) for (const elapsed of [0, .5, 2, 12, 100]) {
    assert.equal(archiveCue(phase, elapsed, 0, 0), undefined, `${phase} at ${elapsed}s`);
  }
});

test('only the berries appear, centered after the reconstruction; no timed return to a side panel', () => {
  assert.equal(archiveCue('evidence', .35, 2, 0), undefined);
  assert.equal(archiveCue('evidence', 3, 2, .1), undefined);
  for (const elapsed of [1, 3, 6, 100]) {
    const cue = archiveCue('evidence', elapsed, 2, 0)!;
    assert.equal(cue.image, 'comparison');
    assert.equal(cue.hero, true);
    assert.equal(cue.closing, true);
    assert.match(cue.note, /clue to ancient water/i);
  }
});

test('scene-time reveal is bounded, monotonic and repeatable across pause and restored phases', () => {
  for (const phase of ['evidence'] as const) {
    let previous = 0;
    for (const elapsed of [0, .25, .5, .75, 1, 1.25, 1.5, 2, 3, 100]) {
      const cue = archiveCue(phase, elapsed, 0, 0);
      const reveal = cue?.reveal ?? 0;
      assert.ok(Number.isFinite(reveal) && reveal >= 0 && reveal <= 1);
      assert.ok(reveal >= previous, `${phase} should dissolve in without flickering`);
      assert.deepEqual(archiveCue(phase, elapsed, 0, 0), cue, 'same paused scene time produces the same view');
      previous = reveal;
    }
    assert.equal(previous, 1, 'late/restored stable phases display fully');
    assert.equal(archiveCue(phase, 0, 0, 0), undefined, 'restart does not retain a previous reveal');
  }
  for (const elapsed of [-1, NaN, Infinity, -Infinity]) {
    assert.equal(archiveCue('evidence', elapsed, 0, 0), undefined);
  }
  const editable = archiveCue('evidence', 3, 0, 0)!;
  editable.reveal = -100;
  assert.equal(archiveCue('evidence', 3, 0, 0)!.image, 'comparison', 'callers cannot mutate future cue state');
  assert.equal(archiveCue('evidence', 3, 0, 0)!.reveal, 1);
});

function jpegDimensions(bytes: Buffer): number[] {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'JPEG start marker');
  let offset = 2;
  while (offset < bytes.length) {
    assert.equal(bytes[offset++], 0xff);
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    const length = bytes.readUInt16BE(offset);
    assert.ok(length >= 2 && offset + length <= bytes.length, 'valid JPEG segment');
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return [bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3)];
    }
    offset += length;
  }
  throw new Error('JPEG has no supported frame dimensions');
}

test('runtime photographs remain byte-identical to credited NASA references with truthful dimensions', () => {
  const runtime = new URL('../public/assets/missions/blueberry-clue/v1/', import.meta.url);
  const records = JSON.parse(readFileSync(new URL('source-records.json', runtime), 'utf8'));
  const originals = JSON.parse(readFileSync(new URL('../../assets/references/mission-one/v1/manifest.json', import.meta.url), 'utf8'));
  for (const image of Object.values(NASA_ARCHIVE)) {
    const record = records.files.find((entry: { imageId: string }) => entry.imageId === image.id);
    assert.ok(record, `source receipt for ${image.id}`);
    const original = originals.find((entry: { imageId: string }) => entry.imageId === image.id);
    assert.ok(original);
    const bytes = readFileSync(new URL(image.file, runtime));
    const hash = createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash, record.sha256);
    assert.equal(hash, original.sha256, 'the retained reference is the independent integrity authority');
    assert.equal(bytes.length, record.bytes);
    assert.deepEqual(jpegDimensions(bytes), [image.width, image.height]);
    assert.deepEqual(record.dimensions, [image.width, image.height]);
    assert.equal(image.credit, record.credit);
    assert.equal(image.page, record.page);
    assert.equal(image.file, record.runtimeFile);
  }
  assert.match(NASA_ARCHIVE.abrasion.capture, /grinding event/i, 'event date is not asserted as photo acquisition date');
  assert.match(NASA_ARCHIVE.comparison.context, /brushed, not ground/i);
});
