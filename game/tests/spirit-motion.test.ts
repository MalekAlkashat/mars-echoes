import assert from 'node:assert/strict';
import test from 'node:test';
import { SpiritController } from '../src/entities/spirit/controller.ts';

const still = { moveX: 0, moveY: 0, leapPressed: false };
const forward = { ...still, moveY: 1 };
const flat = () => 0;

test('spirit movement stays camera-relative and diagonal travel has no speed boost', () => {
  const north = new SpiritController(), west = new SpiritController(), diagonal = new SpiritController();
  for (const controller of [north, west, diagonal]) controller.reset(0, 8, flat);
  for (let i = 0; i < 120; i++) {
    north.update(1 / 60, forward, 0, [], flat);
    west.update(1 / 60, forward, Math.PI / 2, [], flat);
    diagonal.update(1 / 60, { ...forward, moveX: 1 }, 0, [], flat);
  }
  assert.ok(north.position.z < 1 && Math.abs(north.position.x) < 1e-8);
  assert.ok(west.position.x < -7 && Math.abs(west.position.z - 8) < 1e-8);
  const straightTravel = Math.hypot(north.position.x, north.position.z - 8);
  const diagonalTravel = Math.hypot(diagonal.position.x, diagonal.position.z - 8);
  assert.ok(Math.abs(straightTravel - diagonalTravel) < 1e-7);
});

test('spirit path agrees at 30, 60 and 120 Hz on sloped terrain', () => {
  const height = (x: number, z: number) => x * .07 + z * .11;
  const paths = [30, 60, 120].map(rate => {
    const controller = new SpiritController();
    controller.reset(0, 8, height);
    for (let i = 0; i < rate * 3; i++) controller.update(1 / rate, forward, .35, [], height);
    assert.ok(Math.abs(controller.position.y - height(controller.position.x, controller.position.z) - .28) < 1e-8);
    return controller.position;
  });
  assert.ok(paths[0].distanceTo(paths[2]) < .02);
  assert.ok(paths[1].distanceTo(paths[2]) < .02);
});

test('solid collision remains active during a leap and permits backing away', () => {
  const controller = new SpiritController();
  const obstacles = [{ x: 0, z: 1, radius: 1.05 }];
  controller.reset(0, 8, flat);
  for (let i = 0; i < 240; i++) controller.update(1 / 60, { ...forward, leapPressed: i === 72 }, 0, obstacles, flat);
  assert.ok(controller.position.z >= 2.33 - 1e-8);
  assert.ok(controller.position.z < 2.4);
  const blocked = controller.position.z;
  for (let i = 0; i < 60; i++) controller.update(1 / 60, { ...still, moveY: -1 }, 0, obstacles, flat);
  assert.ok(controller.position.z > blocked + 3);
});

test('a leap is bounded, lands without sinking, and does not repeat on its own', () => {
  const controller = new SpiritController();
  controller.reset(0, 8, flat);
  let peak = controller.position.y;
  for (let i = 0; i < 180; i++) {
    controller.update(1 / 60, { ...still, leapPressed: i === 0 }, 0, [], flat);
    peak = Math.max(peak, controller.position.y);
    assert.ok(controller.position.y >= .28 - 1e-8);
  }
  assert.ok(peak > 1.05 && peak < 1.2);
  assert.equal(controller.grounded, true);
  assert.equal(controller.position.y, .28);
});

test('pause, invalid time, reset and map boundary stay finite and deterministic', () => {
  const controller = new SpiritController();
  controller.reset(0, 8, flat);
  const initial = controller.position.clone();
  controller.update(0, { ...forward, leapPressed: true }, 0, [], flat);
  controller.update(Number.NaN, forward, 0, [], flat);
  assert.deepEqual(controller.position.toArray(), initial.toArray());
  for (let i = 0; i < 1500; i++) controller.update(1 / 60, forward, 0, [], flat);
  assert.ok(Math.hypot(controller.position.x, controller.position.z) <= 63.5 + 1e-7);
  controller.reset(2, 3, (x, z) => x + z, .5);
  assert.deepEqual(controller.position.toArray(), [2, 5.28, 3]);
  assert.equal(controller.heading, .5);
  assert.equal(controller.velocity.length(), 0);
  assert.equal(controller.grounded, true);
});
