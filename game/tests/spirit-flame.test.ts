import assert from 'node:assert/strict';
import test from 'node:test';
import { BufferGeometry, Material, PerspectiveCamera, Vector3 } from 'three';
import { createSpiritAppearance } from '../src/entities/spirit/appearance.ts';
import { TrailHistory, TRAIL_CAPACITY, type TrailPoint } from '../src/entities/spirit/trail-history.ts';

const point = (): TrailPoint => ({ position: new Vector3(), age: 0, life: 0, width: 0, strength: 0 });

test('resolved velocity directly increases pulse frequency and trail reach', () => {
  const camera = new PerspectiveCamera(48, 16 / 9, .1, 100);
  camera.position.set(4, 3, 6); camera.lookAt(0, .63, 0); camera.updateMatrixWorld();
  const results = [0, 2, 4.2, 7.5].map(speed => {
    const spirit = createSpiritAppearance();
    const state = { position: new Vector3(0, .28, 0), actualVelocity: new Vector3(speed, 0, 0), heading: -Math.PI / 2, grounded: true };
    spirit.reset(state);
    for (let i = 0; i < 90; i++) {
      state.position.x += speed / 60;
      spirit.update(1 / 60, state, camera, () => 0, 1.25, 720);
    }
    const result = spirit.debug(); spirit.dispose(); return result;
  });
  assert.equal(results[0].pulseHz, .65); assert.equal(results[3].pulseHz, 3);
  for (let i = 1; i < results.length; i++) {
    assert.ok(Number(results[i].pulseHz) > Number(results[i - 1].pulseHz));
    assert.ok(Number(results[i].trailSpan) > Number(results[i - 1].trailSpan));
  }
});

test('trail sampling agrees across frame rates and retains a corner in world coordinates', () => {
  const histories = [30, 60, 120].map(rate => {
    const h = new TrailHistory(), p = new Vector3(); h.reset(p);
    for (let i = 1; i <= rate; i++) {
      const t = i / rate;
      p.set(t <= .5 ? t * 6 : 3, .63, t <= .5 ? 0 : (t - .5) * 6);
      h.update(1 / rate, p, 1, .3, .65);
    }
    return h;
  });
  for (let i = 0; i < 59; i++) {
    const a = point(), b = point(); histories[0].read(i, a); histories[2].read(i, b);
    assert.ok(a.position.distanceTo(b.position) < 1e-5);
  }
  const corner = point(); histories[0].read(30, corner);
  assert.ok(Math.abs(corner.position.x - 3) < 1e-5 && Math.abs(corner.position.z) < 1e-5);
});

test('trail capacity, pause and teleport reset prevent stretched or unbounded history', () => {
  const h = new TrailHistory(), p = new Vector3(); h.reset(p);
  for (let i = 0; i < 600; i++) { p.x += .1; h.update(1 / 60, p, 1, .3, .65); }
  assert.equal(h.count, TRAIL_CAPACITY);
  const before = h.time; h.update(0, p, 1, .3, .65); h.update(Number.NaN, p, 1, .3, .65);
  assert.equal(h.time, before);
  p.set(500, 2, 300); h.update(1 / 60, p, 1, .3, .65);
  assert.equal(h.count, 1);
  const sample = point(); h.read(0, sample);
  assert.ok(sample.position.distanceTo(p) < 1e-5);
});

test('nearly camera-aligned movement keeps adjacent trail edges continuous', () => {
  const spirit = createSpiritAppearance(), camera = new PerspectiveCamera(48, 16 / 9, .1, 100);
  const state = { position: new Vector3(0, .28, 0), actualVelocity: new Vector3(0, 0, -4.2), heading: 0, grounded: true };
  spirit.reset(state);
  for (let frame = 0; frame < 120; frame++) {
    state.position.set(Math.sin(frame * .4) * .002, .28, -frame * .07);
    camera.position.set(0, .63, state.position.z + 5);
    camera.lookAt(state.position.x, .63, state.position.z); camera.updateMatrixWorld();
    spirit.update(1 / 60, state, camera, () => 0, 1.25, 720);
    const wake = spirit.root.getObjectByName('spirit-world-space-wake') as import('three').Mesh;
    const vertices = wake.geometry.attributes.position, strength = wake.geometry.attributes.strength;
    let previous: Vector3 | undefined;
    for (let row = 0; row < 64; row++) {
      if (strength.getX(row * 2) < .02) continue;
      const edge = new Vector3().fromBufferAttribute(vertices, row * 2 + 1)
        .sub(new Vector3().fromBufferAttribute(vertices, row * 2)).normalize();
      assert.ok(Number.isFinite(edge.x + edge.y + edge.z));
      if (previous) assert.ok(previous.dot(edge) > .5);
      previous = edge;
    }
  }
  spirit.dispose();
});

test('a reversal dissolves the old wake ahead of the soul while retaining the new stroke', () => {
  const spirit=createSpiritAppearance(),camera=new PerspectiveCamera(48,16/9,.1,100);
  camera.position.set(0,3,6);camera.lookAt(0,.63,0);camera.updateMatrixWorld();
  const state={position:new Vector3(0,.28,0),actualVelocity:new Vector3(7.5,0,0),heading:-Math.PI/2,grounded:true};
  spirit.reset(state);
  for(let i=0;i<120;i++){state.position.x+=.125;spirit.update(1/60,state,camera,()=>0,1.25,720);}
  state.actualVelocity.x=-7.5;state.heading=Math.PI/2;
  for(let i=0;i<18;i++){state.position.x-=.125;spirit.update(1/60,state,camera,()=>0,1.25,720);}
  const wake=spirit.root.getObjectByName('spirit-world-space-wake') as import('three').Mesh;
  const p=wake.geometry.attributes.position,s=wake.geometry.attributes.strength;
  let checked=0,retained=0;
  for(let i=0;i<64;i++){
    const x=(p.getX(i*2)+p.getX(i*2+1))*.5;
    if(x<state.position.x-1.1){assert.ok(s.getX(i*2)<.025);checked++;}
    if(x>state.position.x+.2&&s.getX(i*2)>.05)retained++;
  }
  assert.ok(checked>0&&retained>0);spirit.dispose();
});

test('the production flame stays within its geometry budget and cleans every owned resource once', () => {
  const spirit = createSpiritAppearance();
  const geometries = new Set<BufferGeometry>(), materials = new Set<Material>();
  let calls = 0, triangles = 0, disposals = 0;
  spirit.root.traverse(o => {
    const mesh = o as typeof o & { geometry?: BufferGeometry; material?: Material };
    if (!mesh.geometry || !mesh.material) return;
    calls++; geometries.add(mesh.geometry); materials.add(mesh.material);
    triangles += (mesh.geometry.index?.count ?? 0) / 3;
    assert.equal(o.userData.excludeAO, true);
  });
  assert.equal(calls, 6); assert.ok(triangles < 5000);
  geometries.forEach(g => g.addEventListener('dispose', () => disposals++));
  materials.forEach(m => m.addEventListener('dispose', () => disposals++));
  spirit.dispose(); spirit.dispose();
  assert.equal(disposals, geometries.size + materials.size);
  assert.equal(spirit.root.children.length, 0);
});

test('wake fades after stopping, pause freezes its state, and reset clears transient effects', () => {
  const spirit = createSpiritAppearance(), camera = new PerspectiveCamera(48, 16 / 9, .1, 100);
  camera.position.set(4, 3, 6); camera.lookAt(0, .63, 0); camera.updateMatrixWorld();
  const state = { position: new Vector3(0, .28, 0), actualVelocity: new Vector3(0, 0, -7.5), heading: 0, grounded: true };
  spirit.reset(state);
  for (let i = 0; i < 120; i++) {
    state.position.z -= 7.5 / 60;
    spirit.update(1 / 60, state, camera, () => 0, 1.25, 720);
  }
  assert.ok(Number(spirit.debug().trailSpan) > 4);
  const before = spirit.debug(); spirit.update(0, state, camera, () => 0, 1.25, 720);
  assert.deepEqual(spirit.debug(), before);
  state.actualVelocity.set(0, 0, 0);
  for (let i = 0; i < 100; i++) spirit.update(1 / 60, state, camera, () => 0, 1.25, 720);
  assert.equal(spirit.debug().trailSpan, 0);
  state.position.set(20, .28, 20); spirit.reset(state);
  assert.equal(spirit.debug().trailSamples, 0);
  assert.equal(spirit.debug().spiritEmbers, 0);
  assert.equal(spirit.debug().spiritRush, 0);
  spirit.dispose();
});
