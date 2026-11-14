import assert from 'node:assert/strict';
import test from 'node:test';
import { Euler, Quaternion, Vector3 } from 'three';
import { Vehicle } from '../src/entities/rover/controller.ts';
import { RoverGrounding, type RoverContactConfig } from '../src/entities/rover/grounding.ts';

// Deliberately offset and non-legacy geometry exercises imported-model adaptation;
// these values are test fixtures, not measurements of the supplied Opportunity asset.
function fixture(): RoverContactConfig {
  return {
    wheelRadius: .13, suspensionTravel: .1, collisionRadius: 1.18,
    wheelPoints: [-1, 1].flatMap(side => [-.9, .08, .72].map(z => new Vector3(side * .84, .38, z))),
  };
}

test('configured wheel centres and radius settle onto flat and sloped ground without legacy offsets', () => {
  const config = fixture();
  const rover = new Vehicle(config);
  config.wheelPoints[0].set(99, 99, 99);
  assert.equal(rover.config.wheelPoints[0].x, -.84, 'a caller must not mutate an active vehicle by changing its input geometry');
  const flat = () => 0;
  rover.reset(0, 0, 0); rover.settle(0, flat);
  assert.ok(Math.abs(rover.position.y - (.13 - .38)) < 1e-8);
  assert.ok(rover.grounded.every(Boolean));

  const height = (x: number, z: number) => 1.3 + x * .09 - z * .12;
  rover.reset(2, 1, .47);
  for (let i = 0; i < 240; i++) rover.settle(1 / 120, height);
  const orientation = new Quaternion().setFromEuler(new Euler(rover.pitch, rover.heading, rover.roll, 'YXZ'));
  for (const [index, point] of rover.config.wheelPoints.entries()) {
    const world = point.clone(); world.y += rover.wheelOffsets[index];
    world.applyQuaternion(orientation).add(rover.position);
    const gap = world.y - rover.config.wheelRadius - height(world.x, world.z);
    assert.ok(Math.abs(gap) < .001, `configured wheel ${index} contact gap ${gap}`);
  }
  assert.ok(rover.grounded.every(Boolean));
  assert.ok(rover.wheelOffsets.every(offset => Math.abs(offset) <= .1));
});

test('configured chassis footprint stops at obstacles and boundaries without blocked tire accumulation', () => {
  const rover = new Vehicle(fixture()), flat = () => 0;
  const obstacles = [{x: 0, z: -4, radius: .8}];
  rover.reset(0, 0, 0);
  for (let i = 0; i < 600; i++) rover.update(1 / 120, {forward: 1, turn: 0}, obstacles, flat);
  assert.ok(rover.position.z >= -4 + .8 + 1.18 - .0005);
  assert.ok(rover.position.z <= -4 + .8 + 1.18 + .005);
  const distance = rover.movedDistance, paths = [...rover.wheelTravel];
  for (let i = 0; i < 120; i++) rover.update(1 / 120, {forward: 1, turn: 0}, obstacles, flat);
  assert.ok(rover.movedDistance - distance < .003);
  assert.ok(rover.wheelTravel.every((path, index) => path - paths[index] < .003));
  rover.reset(0, 0, 0);
  for (let i = 0; i < 4000; i++) rover.update(1 / 120, {forward: 1, turn: 0}, [], flat);
  assert.ok(Math.hypot(rover.position.x, rover.position.z) <= 64 - 1.18 + 1e-8);
});

test('invalid imported-model contact geometry fails before motion can introduce NaN state', () => {
  assert.throws(() => new RoverGrounding({...fixture(), wheelRadius: 0}), /positive radii/);
  assert.throws(() => new Vehicle({...fixture(), wheelPoints: [new Vector3()]}), /six finite wheel/);
  assert.throws(() => new Vehicle({...fixture(), suspensionTravel: Number.NaN}), /bounded suspension/);
  assert.throws(() => new Vehicle({...fixture(), wheelPoints: Array.from({length: 6}, () => new Vector3())}), /support plane/);
});
