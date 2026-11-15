import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Ground, baseHeight, rippleHeight, softness, ellipseValue, TRENCH_CAP } from '../src/scenes/episodes/rover/missions/purgatory/field.ts';
import { buildGroundGeometry } from '../src/scenes/episodes/rover/missions/purgatory/mesh.ts';
import { Driver, MAX_QUEUE, TUNING, predictPath, wheelPositions, type Command } from '../src/scenes/episodes/rover/missions/purgatory/drive.ts';
import { LEVELS, RIPPLES, ROVER, SITE } from '../src/scenes/episodes/rover/missions/purgatory/site.ts';
import { RecoveryAssist } from '../src/scenes/episodes/rover/missions/purgatory/recovery-assist.ts';
import { SliceCameras } from '../src/scenes/episodes/rover/missions/purgatory/cameras.ts';
import { NASA_ARCHIVE } from '../src/scenes/episodes/rover/missions/purgatory/archive.ts';

const drive = (metres: number): Command => ({ kind: 'drive', metres });
const turn = (radians: number): Command => ({ kind: 'turn', radians });
const run = (driver: Driver, hz = 60) => { let t = 0; while (driver.busy && t < 900) { driver.step(1 / hz); t += 1 / hz; } return t; };
const mired = () => { const ground = new Ground(), driver = new Driver(ground); driver.reset(SITE.observe); driver.startReplay(); run(driver); return { ground, driver }; };

test('Purgatory site constants match the reviewed level plan', () => {
  const plan = JSON.parse(readFileSync(new URL('../../outputs/planning/mission-two/level-plan.json', import.meta.url), 'utf8'));
  const marker = (id: string) => plan.markers.find((m: { id: string }) => m.id === id);
  const zone = (id: string) => plan.zones.find((z: { id: string }) => z.id === id);
  assert.deepEqual([SITE.observe.x, SITE.observe.z], marker('M-observe').position);
  assert.deepEqual([SITE.stuck.x, SITE.stuck.z, SITE.stuck.heading], [...marker('M-stuck').position, marker('M-stuck').heading]);
  assert.deepEqual([SITE.escape.x, SITE.escape.z], marker('M-escape').position);
  assert.equal(SITE.deepLimitZ, marker('M-deep-limit').position[1]);
  assert.deepEqual(LEVELS.map(l => [l.id, l.cell, ...l.rect]), plan.mesh.levels.map((l: { id: string; cell: number; rect: number[] }) => [l.id, l.cell, ...l.rect]));
  assert.deepEqual(RIPPLES.map(r => [r.id, r.cx, r.cz, r.azimuthDeg, r.length, r.width, r.height]),
    plan.ripples.map((r: { id: string; centre: number[]; azimuthDeg: number; length: number; width: number; height: number }) => [r.id, ...r.centre, r.azimuthDeg, r.length, r.width, r.height]));
  const soft = zone('Z-soft').ellipse;
  assert.deepEqual([SITE.soft.cx, SITE.soft.cz, SITE.soft.across, SITE.soft.along, SITE.soft.azimuthDeg], [...soft.centre, soft.radiusAcross, soft.radiusAlong, soft.azimuthDeg]);
  assert.deepEqual([...SITE.envelope], zone('Z-envelope').rect);
});

test('hero ripple keeps the sourced reference size and restrained relief (PG-03)', () => {
  const hero = RIPPLES.find(r => r.id === 'H-purgatory')!, a = hero.azimuthDeg * Math.PI / 180;
  // Transect across the ripple body 4 m south of its nose.
  const cx = hero.cx - Math.sin(a) * 2.8, cz = hero.cz - Math.cos(a) * 2.8;
  let peak = 0, first = Infinity, last = -Infinity;
  for (let d = -2; d <= 2; d += 0.005) {
    const h = rippleHeight(hero, cx + Math.cos(a) * d, cz - Math.sin(a) * d);
    peak = Math.max(peak, h);
    if (h > 0.002) { first = Math.min(first, d); last = Math.max(last, d); }
  }
  assert.ok(Math.abs(peak - 0.33) <= 0.03, `hero height ${peak}`);
  assert.ok(Math.abs(last - first - 2.5) <= 0.15, `hero width ${last - first}`);
  // Nothing in the authored square stands more than 0.45 m above the smooth plain around it.
  let tallest = 0;
  for (let x = -30; x <= 30; x += 0.5) for (let z = -34; z <= 26; z += 0.5) {
    const around = (baseHeight(x - 4, z) + baseHeight(x + 4, z) + baseHeight(x, z - 4) + baseHeight(x, z + 4)) / 4;
    tallest = Math.max(tallest, baseHeight(x, z) - around);
  }
  assert.ok(tallest <= 0.45, `tallest local relief ${tallest}`);
});

test('ground mesh is watertight, within budget, and agrees with wheel contact', () => {
  const ground = new Ground(), mesh = buildGroundGeometry(ground);
  assert.ok(mesh.triangles <= 58_880, `${mesh.triangles} triangles`);
  const index = mesh.geometry.getIndex()!, position = mesh.geometry.getAttribute('position'), edges = new Map<string, number>();
  for (let i = 0; i < index.count; i += 3) for (let e = 0; e < 3; e++) {
    const a = index.getX(i + e), b = index.getX(i + (e + 1) % 3), key = a < b ? `${a}_${b}` : `${b}_${a}`;
    edges.set(key, (edges.get(key) ?? 0) + 1);
  }
  const counts = [...edges.values()];
  // Every edge is shared by exactly two triangles except the outer rim of the horizon ring: no cracks, no T-junctions.
  assert.equal(counts.filter(n => n === 1).length, 480);
  assert.equal(counts.filter(n => n > 2).length, 0);
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i), b = index.getX(i + 1), c = index.getX(i + 2);
    const ux = position.getX(b) - position.getX(a), uz = position.getZ(b) - position.getZ(a), vx = position.getX(c) - position.getX(a), vz = position.getZ(c) - position.getZ(a);
    assert.ok(uz * vx - ux * vz > 0, 'triangle faces up');
  }
  // Contact samples reproduce every mesh vertex of the authored square, on every level.
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), z = position.getZ(i);
    if (Math.abs(x) > 30 || z < -34 || z > 26) continue;
    assert.ok(Math.abs(ground.sample(x, z) - position.getY(i)) < 1e-4, `vertex ${i} at ${x},${z}`);
  }
  // ...and every triangle interior, including the fan cells beside a finer level.
  let worst = 0;
  for (let i = 0; i < index.count; i += 3) {
    const [a, b, c] = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
    const x = (position.getX(a) + position.getX(b) + position.getX(c)) / 3, z = (position.getZ(a) + position.getZ(b) + position.getZ(c)) / 3;
    if (Math.abs(x) > 30 || z < -34 || z > 26) continue;
    worst = Math.max(worst, Math.abs(ground.sample(x, z) - (position.getY(a) + position.getY(b) + position.getY(c)) / 3));
  }
  assert.ok(worst < 1e-4, `largest visible-versus-contact gap ${worst}`);
});

test('trench pressing is bounded, leaves the seam closed, and updates the mesh', () => {
  const ground = new Ground(), mesh = buildGroundGeometry(ground), position = mesh.geometry.getAttribute('position');
  const before = ground.sample(0.3125, 2.1875);
  for (let i = 0; i < 500; i++) ground.stamp(0.3125, 2.1875, 5);
  assert.ok(Math.abs(before - ground.sample(0.3125, 2.1875) - TRENCH_CAP) < 0.008, 'pressed to the cap, within the clod offset');
  const [x0, z0, x1, z1] = ground.trench.level.rect;
  for (const [x, z] of [[x0, 2], [x1, 2], [0, z0], [0, z1]] as const) { ground.stamp(x, z, 0.16); assert.equal(ground.sinkAt(x, z), 0); }
  assert.equal(mesh.refresh(), true);
  assert.equal(mesh.refresh(), false);
  let lowest = Infinity;
  for (let i = 0; i < position.count; i++) if (Math.hypot(position.getX(i) - 0.3125, position.getZ(i) - 2.1875) < 0.01) lowest = Math.min(lowest, position.getY(i));
  assert.ok(Math.abs(lowest - ground.sample(0.3125, 2.1875)) < 1e-5, 'visible trench floor equals the contact height');
  ground.reset(); mesh.refresh();
  assert.ok(Math.abs(ground.sample(0.3125, 2.1875) - before) < 1e-6);
});

test('firm ground: the rover moves as far as its wheels turn', () => {
  const ground = new Ground(), driver = new Driver(ground);
  driver.reset(SITE.observe);
  assert.equal(driver.send([drive(-2), turn(Math.PI / 12), drive(0.5)]), true);
  assert.equal(driver.send([drive(1)]), false, 'a second plan cannot start while one runs');
  run(driver);
  assert.ok(Math.abs(driver.reports[0].movedMetres - 2) < 1e-6 && Math.abs(driver.reports[0].wheelMetres - 2) < 1e-6);
  assert.ok(Math.abs(driver.reports[1].turnedRadians - Math.PI / 12) < 1e-6);
  assert.equal(driver.meanSink(), 0);
  assert.equal(driver.send(Array(MAX_QUEUE + 1).fill(drive(0.5))), false);
});

test('replay ends mired at the planned pose with all six wheels in to about hub depth (PG-04, PG-07)', () => {
  for (const hz of [30, 60, 120]) {
    const ground = new Ground(), driver = new Driver(ground);
    driver.reset(SITE.observe); driver.startReplay(); run(driver, hz);
    const s = driver.state;
    assert.ok(Math.hypot(s.x - SITE.stuck.x, s.z - SITE.stuck.z) < 1e-6 && Math.abs(s.heading - SITE.stuck.heading) < 1e-6, `${hz} Hz`);
    for (const [x, z] of wheelPositions(s)) {
      assert.ok(ellipseValue(SITE.soft, x, z) < 1, 'wheel inside the soft footprint');
      const sink = ground.sinkAt(x, z);
      assert.ok(sink > 0.10 && sink <= ROVER.wheelRadius, `sink ${sink} at ${hz} Hz`);
    }
    assert.ok(driver.lastPlan.wheelMetres > driver.lastPlan.movedMetres * 1.5, 'wheels turned much farther than the rover moved');
  }
});

test('recovery: short moves free the rover; big moves waste travel and dig in, but stay recoverable', () => {
  const small = [drive(0.5), drive(0.5), drive(0.5)], big = [drive(2), drive(2), drive(2)];
  const plansToFree = (strategy: (n: number) => Command[]) => {
    const { driver } = mired();
    let plans = 0;
    while (!driver.free() && plans < 40) { driver.send(driver.softnessUnder() > 0 ? strategy(plans) : big); run(driver); plans++; }
    return { plans, free: driver.free() };
  };
  const cautious = plansToFree(() => small), reckless = plansToFree(() => big), revised = plansToFree(n => (n < 2 ? big : small));
  assert.ok(cautious.free && cautious.plans >= 4 && cautious.plans <= 8, `cautious ${cautious.plans}`);
  assert.ok(reckless.free && reckless.plans > cautious.plans, `reckless ${reckless.plans}`);
  assert.ok(revised.free && revised.plans > cautious.plans && revised.plans < reckless.plans, `revised ${revised.plans}`);
  const a = mired(); a.driver.send(small); run(a.driver);
  const b = mired(); b.driver.send(big); run(b.driver);
  assert.ok(a.driver.lastPlan.movedMetres > b.driver.lastPlan.movedMetres * 2, 'a short plan gains more ground than a big one');
  assert.ok(b.driver.meanSink() > a.driver.meanSink() && b.driver.meanSink() <= TRENCH_CAP + 1e-6);
});

test('setbacks are bounded: the rover cannot be driven past the deep limit or out of the envelope', () => {
  const { driver } = mired();
  for (let i = 0; i < 60 && driver.reports.at(-1)?.stopped !== 'deep-limit'; i++) { driver.send([drive(-2), drive(-2), drive(-2)]); run(driver); }
  assert.ok(driver.state.z <= SITE.deepLimitZ + 1e-6);
  assert.equal(driver.reports.at(-1)!.stopped, 'deep-limit');
  assert.ok(driver.meanSink() <= TRENCH_CAP + 1e-6);
  const firm = new Driver(new Ground());
  firm.reset(SITE.observe);
  for (let i = 0; i < 12; i++) { firm.send([drive(2), drive(2), drive(2)]); run(firm); }
  assert.equal(firm.reports.at(-1)!.stopped, 'envelope');
  assert.equal(predictPath(SITE.observe, [drive(2)]).inside, true);
  assert.equal(predictPath(SITE.observe, [turn(Math.PI / 2), drive(2), drive(2), drive(2)]).inside, false);
});

test('interrupting a plan leaves a clean boundary and softness matches the footprint', () => {
  const { driver } = mired();
  driver.send([drive(2), drive(2)]);
  for (let i = 0; i < 30; i++) driver.step(1 / 60);
  driver.interrupt();
  assert.equal(driver.busy, false);
  assert.equal(driver.reports.at(-1)!.stopped, 'interrupted');
  assert.equal(driver.state.wheelSpeed, 0);
  assert.equal(driver.send([drive(0.5)]), true);
  assert.equal(softness(SITE.soft.cx, SITE.soft.cz), 1);
  assert.equal(softness(SITE.escape.x, SITE.escape.z), 0);
});

test('direct driving responds in both directions, steers, brakes on release and is frame-rate independent', () => {
  const distances: number[] = [];
  for (const hz of [30, 60, 120]) {
    const driver = new Driver(new Ground()); driver.reset(SITE.observe);
    for (let i = 0; i < hz * 2; i++) driver.manual(1 / hz, 1, 0);
    distances.push(SITE.observe.z - driver.state.z);
    assert.ok(distances.at(-1)! > 4 && distances.at(-1)! <= 5, `${hz} Hz: ${distances.at(-1)}`);
    const z = driver.state.z; driver.manual(1 / hz, 0, 0);
    assert.equal(driver.state.wheelSpeed, 0); assert.equal(driver.state.z, z);
    for (let i = 0; i < hz; i++) driver.manual(1 / hz, -1, 0);
    assert.ok(driver.state.z > z, 'S reverses');
    driver.manual(1 / hz, 0, 1); assert.ok(driver.state.heading > 0, 'left turn matches normal rover sign');
    driver.manual(1 / hz, 0, -1); assert.ok(Math.abs(driver.state.heading) < 1e-6);
  }
  assert.ok(Math.max(...distances) - Math.min(...distances) < 0.04);
});

test('manual input cannot override a running plan or bypass the soil and footprint bounds', () => {
  const driver = new Driver(new Ground()); driver.reset(SITE.observe); driver.send([drive(-2)]);
  driver.manual(0.05, 1, 1);
  assert.deepEqual([driver.state.x, driver.state.z, driver.state.heading], [0, SITE.observe.z, 0]);
  driver.interrupt(); assert.equal(driver.busy, false);
  for (let i = 0; i < 900; i++) driver.manual(1 / 60, 1, 0);
  assert.ok(driver.state.z >= SITE.envelope[1] + ROVER.frontExtent - 1e-6);
  const edge = { x: SITE.envelope[2] - ROVER.halfWidth - 0.005, z: -10, heading: 0 };
  assert.equal(predictPath(edge, [turn(Math.PI / 2)]).inside, false, 'a pivot must check all body corners');
  driver.reset(edge); driver.send([turn(Math.PI / 2)]); run(driver);
  assert.equal(driver.reports.at(-1)?.stopped, 'envelope');
  const a = mired(); const startZ = a.driver.state.z;
  for (let i = 0; i < 120; i++) a.driver.manual(1 / 60, 1, 0);
  assert.ok(startZ - a.driver.state.z < 1, 'holding full throttle still slips in mired sand');
  assert.ok(a.driver.meanSink() <= TRENCH_CAP + 1e-6);
  for (let i = 0; i < 1800; i++) a.driver.manual(1 / 60, -1, 0);
  assert.ok(a.driver.state.z <= SITE.deepLimitZ);
});

test('time compression keeps replay and precise plans responsive without changing their distances', () => {
  const driver = new Driver(new Ground()); driver.reset(SITE.observe);
  driver.startReplay(); const replaySeconds = run(driver);
  assert.ok(replaySeconds >= 4 && replaySeconds <= 6, `replay ${replaySeconds}s`);
  driver.reset(SITE.observe); driver.send([drive(2)]); const planSeconds = run(driver);
  assert.ok(planSeconds < 1.6); assert.equal(driver.lastPlan.movedMetres, 2);
  assert.equal(TUNING.manualForward, 2.5);
});

test('one held forward input recovers with metered attempts, preserves slip and stops on release', () => {
  const times: number[] = [];
  for (const hz of [30, 60, 120]) {
    const {driver} = mired(), assist = new RecoveryAssist(); assist.reset(driver.state.wheelAngle);
    let seconds = 0, rests = 0, wheel = driver.state.wheelAngle;
    while (!driver.free() && seconds < 45) {
      const forward = assist.forward(1 / hz, 1, driver.state.wheelAngle, ROVER.wheelRadius, driver.softnessUnder() > 0);
      if (!forward) rests++;
      driver.manual(1 / hz, forward, 0); seconds += 1 / hz;
    }
    assert.equal(driver.free(), true, `held recovery at ${hz} Hz in ${seconds}s`);
    assert.ok(rests > 0, 'assist inserted deliberate rests instead of treating a hold as many long commands');
    assert.ok(Math.abs(driver.state.wheelAngle - wheel) * ROVER.wheelRadius > 7, 'the wheels still slip');
    const stoppedZ = driver.state.z;
    driver.manual(1 / hz, assist.forward(1 / hz, 0, driver.state.wheelAngle, ROVER.wheelRadius, false), 0);
    assert.equal(driver.state.z, stoppedZ); assert.equal(driver.state.wheelSpeed, 0);
    times.push(seconds);
  }
  assert.ok(Math.max(...times) - Math.min(...times) < 2, `recovery times ${times}`);
});

test('camera handoffs blend position, rotation and lens without a one-frame cut or ground penetration', () => {
  Object.assign(globalThis, {innerWidth:1440, innerHeight:900});
  const rig = new SliceCameras(), height = () => 0;
  const pose = {x:0.3, y:0.17, z:2.2, heading:0.1, pitch:0, travelSign:1};
  rig.update(0, pose, height, false, 'intro', 0.5);
  for (const shot of ['stuck', undefined, 'outro', 'sand'] as const) {
    const start = rig.camera.position.clone(), rotation = rig.camera.quaternion.clone();
    rig.update(1 / 60, pose, height, false, shot, 0.5);
    assert.ok(rig.camera.position.distanceTo(start) < 0.01, 'first handoff frame remains near its source');
    assert.ok(rig.camera.quaternion.angleTo(rotation) < 0.01, 'orientation does not cut');
    for (let i = 0; i < 90; i++) {
      const previous = rig.camera.position.clone(); rig.update(1 / 60, pose, height, false, shot, 0.5);
      assert.ok(rig.camera.position.distanceTo(previous) < 0.3);
      assert.ok(rig.camera.position.y >= 0.18 && Number.isFinite(rig.camera.fov));
    }
  }
  rig.reset();rig.update(0, pose, height, true, 'intro', 0);
  const still = rig.camera.position.clone();rig.update(1, pose, height, true, 'intro', 1);
  assert.ok(rig.camera.position.distanceTo(still) < 1e-6, 'reduced-motion intro suppresses the dolly');
});

test('NASA runtime images match verified source originals, with correct capture context and credit', () => {
  const manifest = JSON.parse(readFileSync(new URL('../../assets/references/mission-two/v1/manifest.json', import.meta.url), 'utf8'));
  for (const image of Object.values(NASA_ARCHIVE)) {
    const source = manifest.resources.find((r: {id: string}) => r.id === image.id);
    const bytes = readFileSync(new URL(`../public/assets/missions/purgatory/v1/${image.file}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, 'no silent substitution or generative edit');
    assert.equal(image.credit, source.credit); assert.ok(image.page.startsWith('https://'));
    assert.ok(bytes.length < 150_000, 'bounded static image transfer');
  }
  assert.match(NASA_ARCHIVE.lookback.capture, /11 June 2005.*491/);
  assert.match(NASA_ARCHIVE.wheel.capture, /May 2005/, 'a later recovery image is not mislabeled as the April 26 encounter');
});
