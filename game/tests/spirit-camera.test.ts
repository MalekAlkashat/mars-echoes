import assert from 'node:assert/strict';
import test from 'node:test';
import { Vector3 } from 'three';
import { SpiritCamera } from '../src/entities/spirit/camera.ts';

Object.assign(globalThis, { innerWidth: 1280, innerHeight: 720,
  window: { matchMedia: () => ({ matches: false }) } });

test('speed camera widens smoothly, respects collision, and restores its neutral lens', () => {
  const rig = new SpiritCamera(), p = new Vector3(0, .28, 0);
  rig.update(0, p, () => 0, []);
  for (let i = 0; i < 120; i++) { p.x += 7.5 / 60; rig.update(1 / 60, p, () => 0, [], 7.5); }
  assert.ok(rig.camera.fov > 57.9 && rig.camera.fov <= 58);
  const cameraRight = new Vector3(1, 0, 0).applyQuaternion(rig.camera.quaternion);
  const horizonRight = new Vector3().crossVectors(rig.camera.getWorldDirection(new Vector3()), new Vector3(0, 1, 0)).normalize();
  assert.ok(cameraRight.dot(horizonRight) > Math.cos(.016));
  for (let i = 0; i < 180; i++) rig.update(1 / 60, p, () => 0, [{ x: p.x, z: 3, radius: .8 }], 0);
  assert.ok(rig.camera.position.z < 3);
  assert.ok(rig.camera.fov < 48.02);
  rig.reset(); rig.update(0, new Vector3(10, .28, 10), () => 0, []);
  assert.equal(rig.camera.fov, 48);
  assert.ok(Math.abs(rig.camera.position.x - 10) < .001);
});

test('reduced motion preserves orbit while suppressing speed lens and banking', () => {
  const original = window.matchMedia;
  window.matchMedia = (() => ({ matches: true })) as typeof window.matchMedia;
  const rig = new SpiritCamera(), p = new Vector3(0, .28, 0);
  window.matchMedia = original;
  rig.orbit(30, 20, 0);
  for (let i = 0; i < 60; i++) { p.x += .1; rig.update(1 / 60, p, () => 0, [], 7.5); }
  assert.equal(rig.camera.fov, 48);
  const actualRight = new Vector3(1, 0, 0).applyQuaternion(rig.camera.quaternion);
  const levelRight = new Vector3().crossVectors(rig.camera.getWorldDirection(new Vector3()), new Vector3(0, 1, 0)).normalize();
  assert.ok(actualRight.dot(levelRight) > 1 - 1e-8);
  assert.notEqual(rig.yaw, 0);
});
