import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { BufferAttribute, BufferGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { createOpportunityRover } from '../src/entities/rover/opportunity.ts';
import { Vehicle } from '../src/entities/rover/controller.ts';

const modelUrl = new URL('../public/assets/opportunity/opportunity-v1.glb', import.meta.url);
const metadata = JSON.parse(readFileSync(new URL('../public/assets/opportunity/rig-metadata.json', import.meta.url), 'utf8'));

// Read the actual exported positions, normals, indices and node centres without loading
// image textures or introducing a browser renderer into the mechanical tests.
function assetFixture(): Group {
  const file = readFileSync(modelUrl);
  assert.equal(file.readUInt32LE(0), 0x46546c67);
  const jsonLength = file.readUInt32LE(12);
  const gltf = JSON.parse(file.subarray(20, 20 + jsonLength).toString());
  const binary = file.subarray(28 + jsonLength);
  const attribute = (index: number): BufferAttribute => {
    const accessor = gltf.accessors[index], view = gltf.bufferViews[accessor.bufferView];
    assert.ok(!view.byteStride, 'the supplied runtime asset must have contiguous mechanical attributes');
    const sizes: Record<string, number> = {SCALAR:1, VEC2:2, VEC3:3, VEC4:4};
    const constructors: Record<number, typeof Float32Array | typeof Uint32Array | typeof Uint16Array> = {
      5126:Float32Array, 5125:Uint32Array, 5123:Uint16Array,
    };
    const ArrayType = constructors[accessor.componentType];
    assert.ok(ArrayType, `unsupported supplied accessor type ${accessor.componentType}`);
    const count = accessor.count * sizes[accessor.type];
    const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    const values = new ArrayType(binary.buffer, binary.byteOffset + start, count).slice();
    return new BufferAttribute(values, sizes[accessor.type]);
  };
  const root = new Group(), material = new MeshStandardMaterial();
  for (const node of gltf.nodes.filter((node: {mesh?:number}) => node.mesh !== undefined)) {
    const primitive = gltf.meshes[node.mesh].primitives[0];
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', attribute(primitive.attributes.POSITION));
    geometry.setAttribute('normal', attribute(primitive.attributes.NORMAL));
    geometry.setIndex(attribute(primitive.indices));
    geometry.userData.sharedAsset = true;
    const mesh = new Mesh(geometry, material);
    mesh.name = node.name;
    mesh.userData = {...node.extras};
    if (node.translation) mesh.position.fromArray(node.translation);
    root.add(mesh);
  }
  return root;
}

test('actual Opportunity wheel pivots remain at the measured axles during steering and spin', () => {
  const rig = createOpportunityRover(assetFixture());
  assert.equal(rig.wheels.length, 6);
  rig.setSuspension([], .31);
  const before = rig.wheels.map(wheel => wheel.getWorldPosition(new Vector3()));
  const prior = rig.contactConfig.wheelPoints.map(point => point.clone());
  const next = prior.map((point, index) => {
    const yaw = rig.carriers[index].rotation.y;
    return point.clone().add(new Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)));
  });
  rig.roll(prior, next, 0, true);
  rig.root.updateMatrixWorld(true);
  rig.wheels.forEach((wheel, index) => {
    const measured = new Vector3().fromArray(metadata.wheels[index].center);
    assert.ok(before[index].distanceTo(measured) < 1e-8);
    assert.ok(wheel.getWorldPosition(new Vector3()).distanceTo(measured) < 1e-8,
      `wheel ${index} orbited its axle while spinning`);
    assert.ok(Math.abs(wheel.rotation.x + 1 / metadata.wheels[index].radius) < 1e-9,
      `wheel ${index} did not rotate one metre at its own radius`);
  });
  assert.equal(rig.carriers[1].rotation.y, 0);
  assert.equal(rig.carriers[4].rotation.y, 0);
  assert.equal(rig.carriers[2].rotation.y, -.31);
});

test('Opportunity wheel travel reverses, idle does not spin, and reset clears mechanical state', () => {
  const rig = createOpportunityRover(assetFixture());
  const previous = rig.contactConfig.wheelPoints.map(point => point.clone());
  const forward = previous.map(point => point.clone().add(new Vector3(0, 0, -1)));
  rig.roll(previous, forward, 0, true);
  const angles = rig.wheels.map(wheel => wheel.rotation.x);
  rig.roll(previous, forward, 0, false);
  assert.deepEqual(rig.wheels.map(wheel => wheel.rotation.x), angles);
  rig.roll(forward, previous, 0, true);
  assert.ok(rig.wheels.every(wheel => Math.abs(wheel.rotation.x) < 1e-10));
  rig.setSuspension([.04, -.03, .02, -.02, .01, -.04], .2);
  rig.roll(previous, forward, 0, true);
  rig.reset();
  rig.carriers.forEach((carrier, index) => {
    assert.ok(carrier.position.distanceTo(rig.contactConfig.wheelPoints[index]) < 1e-10);
    assert.ok(Math.abs(carrier.rotation.y) < 1e-10);
    assert.equal(rig.wheels[index].rotation.x, 0);
  });
});

test('measured Opportunity axles follow the terrain contact solver on a slope', () => {
  const rig = createOpportunityRover(assetFixture());
  const vehicle = new Vehicle(rig.contactConfig);
  const height = (x:number, z:number) => .07 * x + .1 * z;
  vehicle.reset(2, -3, .48);
  for (let i = 0; i < 240; i++) vehicle.settle(1 / 120, height);
  rig.root.position.copy(vehicle.position);
  rig.root.rotation.set(vehicle.pitch, vehicle.heading, vehicle.roll);
  rig.setSuspension(vehicle.wheelOffsets);
  rig.root.updateMatrixWorld(true);
  assert.ok(vehicle.grounded.every(Boolean));
  rig.wheels.forEach((wheel, index) => {
    const center = wheel.getWorldPosition(new Vector3());
    const gap = center.y - rig.radii[index] - height(center.x, center.z);
    assert.ok(Math.abs(gap) < .001, `actual model wheel ${index} has terrain gap ${gap}`);
    assert.ok(Math.abs(vehicle.wheelOffsets[index]) <= rig.contactConfig.suspensionTravel + 1e-9);
  });
});

test('suspension deformation preserves the cached source geometry and returns to its rest shape', () => {
  const template = assetFixture();
  const source = template.getObjectByName('suspension-body') as Mesh;
  const rest = new Float32Array(source.geometry.getAttribute('position').array);
  const rig = createOpportunityRover(template);
  const live = rig.root.getObjectByName('suspension-body') as Mesh;
  assert.notEqual(live.geometry, source.geometry);
  assert.equal(source.geometry.userData.sharedAsset, true);
  assert.equal(live.geometry.userData.sharedAsset, false);
  rig.setSuspension([.05,.05,.05,.05,.05,.05]);
  const positions = live.geometry.getAttribute('position');
  let moved = 0, fixed = 0;
  for (let index = 0; index < positions.count; index++) {
    const delta = positions.getY(index) - rest[index * 3 + 1];
    assert.ok(delta >= -1e-7 && delta <= .050001);
    if (Math.abs(delta) > .001) moved++;
    if (Math.abs(rest[index*3]) < .28 || rest[index*3+1] > .43) {
      assert.equal(positions.getY(index), rest[index*3+1]); fixed++;
    }
  }
  assert.ok(moved > 0 && fixed > 0, 'actual suspension must have moving endpoints and fixed anchors');
  assert.deepEqual(new Float32Array(source.geometry.getAttribute('position').array), rest);
  rig.reset();
  assert.deepEqual(new Float32Array(positions.array), rest);
});
