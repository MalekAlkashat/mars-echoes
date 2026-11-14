import assert from 'node:assert/strict';
import test from 'node:test';
import { Raycaster, Vector3 } from 'three';
import { HUB_TERRAIN, hubHeight, makeHubTerrain } from '../src/environments/mars/hub-terrain.ts';
import { disposeSurfaceTextureCache } from '../src/environments/mars/materials.ts';
import { SpiritController } from '../src/entities/spirit/controller.ts';

for (const quiet of [false, true]) {
const mode = quiet ? 'deposited dust' : 'legacy episode';
const height = (x: number, z: number) => hubHeight(x, z, quiet);

test(`${mode}: hub collision samples agree with the rendered terrain triangles across the playable area`, () => {
  const meshes = makeHubTerrain(quiet);
  try {
    const ground = meshes[0];
    ground.updateMatrixWorld(true);
    const ray = new Raycaster(new Vector3(), new Vector3(0, -1, 0));
    let maximumError = 0;
    for (let i = 0; i < 96; i++) {
      const angle = i * 2.399963229728653;
      const radius = Math.sqrt((i + .5) / 96) * HUB_TERRAIN.playableRadius;
      const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
      ray.ray.origin.set(x, 2000, z);
      const hit = ray.intersectObject(ground, false)[0];
      assert.ok(hit, `no visible ground at ${x},${z}`);
      const error = Math.abs(hit.point.y - height(x, z));
      maximumError = Math.max(maximumError, error);
      assert.ok(error < 2e-6, `contact/mesh mismatch ${error} at ${x},${z}`);
    }
    console.info(`Hub maximum sampled contact/mesh error: ${maximumError} m`);
  } finally {
    for (const mesh of meshes) { mesh.geometry.dispose(); (mesh.material as {dispose():void}).dispose(); }
    disposeSurfaceTextureCache();
  }
});

test(`${mode}: hub vista is stitched, upward facing and stays within the base terrain triangle budget`, () => {
  const meshes = makeHubTerrain(quiet);
  try {
    const [near, far] = meshes.map(mesh => mesh.geometry);
    const nearPositions = near.getAttribute('position');
    const border = new Map<string, number>();
    for (let i = 0; i < nearPositions.count; i++) {
      const x = nearPositions.getX(i), z = nearPositions.getZ(i);
      if (Math.abs(x) === HUB_TERRAIN.halfSize || Math.abs(z) === HUB_TERRAIN.halfSize) {
        border.set(`${x.toFixed(5)},${z.toFixed(5)}`, nearPositions.getY(i));
      }
    }
    const positions = far.getAttribute('position');
    let matches = 0;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z));
      const key = `${x.toFixed(5)},${z.toFixed(5)}`;
      if (!border.has(key)) continue;
      assert.ok(Math.abs(y - border.get(key)!) < 2e-6, `seam at ${key}`);
      matches++;
    }
    assert.equal(matches, border.size, 'every fine perimeter vertex is joined to the vista');
    const index = far.getIndex()!;
    const a = new Vector3(), b = new Vector3(), c = new Vector3();
    for (let i = 0; i < index.count; i += 3) {
      a.fromBufferAttribute(positions, index.getX(i));
      b.fromBufferAttribute(positions, index.getX(i + 1));
      c.fromBufferAttribute(positions, index.getX(i + 2));
      const normal = b.sub(a).cross(c.sub(a));
      assert.ok(normal.y > 0, `reversed or degenerate vista triangle ${i / 3}`);
    }
    const triangles = meshes.reduce((sum, mesh) => sum + mesh.geometry.getIndex()!.count / 3, 0);
    assert.ok(triangles <= (quiet ? 84_000 : 58_880), 'base terrain stays within its explicit triangle budget');
    assert.ok(positions.count < (quiet ? 17_000 : 5_000), 'the distant vista remains coarse');
    console.info(`Hub base terrain: ${triangles} triangles, ${matches} stitched border vertices`);
  } finally {
    for (const mesh of meshes) { mesh.geometry.dispose(); (mesh.material as {dispose():void}).dispose(); }
    disposeSurfaceTextureCache();
  }
});

test(`${mode}: spirit crosses hub troughs and a side loop with grounded movement and a bounded leap`, () => {
  const spirit = new SpiritController();
  spirit.reset(0, 8, height);
  const waypoints = [[-10, 8], [-10, -14], [8, -28], [12, -10], [0, 2.5]];
  let maximumLift = 0, stepCount = 0;
  for (const [x, z] of waypoints) {
    let arrived = false;
    for (let i = 0; i < 1200; i++) {
      const dx = x - spirit.position.x, dz = z - spirit.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < .3) { arrived = true; break; }
      spirit.update(1 / 60, {moveX: dx / distance, moveY: -dz / distance, leapPressed: stepCount === 250}, 0,
        [{x: 0, z: 1, radius: 1.05}], height);
      stepCount++;
      const lift = spirit.position.y - height(spirit.position.x, spirit.position.z) - .28;
      assert.ok(lift >= -1e-8, 'spirit penetrates visible ground');
      assert.ok(lift < .95, 'leap exceeds its established bounded height');
      if (spirit.grounded) assert.ok(Math.abs(lift) < 1e-8);
      maximumLift = Math.max(maximumLift, lift);
      assert.ok(spirit.position.toArray().every(Number.isFinite));
    }
    assert.ok(arrived, `terrain route did not reach ${x},${z}`);
  }
  for (let i = 0; i < 120; i++) spirit.update(1 / 60, {moveX:0,moveY:0,leapPressed:false}, 0, [], height);
  assert.ok(maximumLift > .7, 'test exercises the leap');
  assert.equal(spirit.grounded, true);
});

}

test('deposited dust: the near/far boundary has matching surface, color and lighting normals', () => {
  const meshes = makeHubTerrain(true);
  try {
    const [near, far] = meshes;
    assert.equal(near.material, far.material, 'terrain uses one continuous surface across its LOD boundary');
    assert.ok(near.receiveShadow && far.receiveShadow, 'shadow reception continues across the boundary');
    const border = new Map<string, number[]>();
    for (const [meshIndex, mesh] of meshes.entries()) {
      const positions = mesh.geometry.getAttribute('position');
      const normals = mesh.geometry.getAttribute('normal');
      const colors = mesh.geometry.getAttribute('color');
      let joined = 0;
      for (let i = 0; i < positions.count; i++) {
        const nx = normals.getX(i), ny = normals.getY(i), nz = normals.getZ(i);
        assert.ok([nx, ny, nz].every(Number.isFinite), 'lighting normal must be finite');
        assert.ok(Math.abs(Math.hypot(nx, ny, nz) - 1) < 1e-6, 'lighting normal must be unit length');
        const x = positions.getX(i), z = positions.getZ(i);
        if (Math.abs(x) !== HUB_TERRAIN.halfSize && Math.abs(z) !== HUB_TERRAIN.halfSize) continue;
        const key = `${x.toFixed(5)},${z.toFixed(5)}`;
        const values = [nx, ny, nz, colors.getX(i), colors.getY(i), colors.getZ(i)];
        if (meshIndex === 0) border.set(key, values);
        else if (border.has(key)) {
          const expected = border.get(key)!;
          assert.ok(values.every((value, component) => Math.abs(value - expected[component]) < 1e-6), `lighting/color seam at ${key}`);
          joined++;
        }
      }
      if (meshIndex === 1) assert.equal(joined, border.size, 'every border normal and color is checked');
    }
  } finally {
    const materials = new Set(meshes.map(mesh => mesh.material));
    for (const mesh of meshes) mesh.geometry.dispose();
    for (const material of materials) (material as {dispose(): void}).dispose();
    disposeSurfaceTextureCache();
  }
});
