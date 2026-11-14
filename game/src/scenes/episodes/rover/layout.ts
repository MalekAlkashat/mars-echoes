import { Box3, Color, Group, Object3D, Vector3 } from 'three';
import {
  createMarsEnvironment, prepareDressingMesh, type MarsEnvironment,
} from '../../../environments/mars/dressing';

export interface RoverWorld extends MarsEnvironment {
  donor: Group;
  donorPosition: Vector3;
  relayPosition: Vector3;
}

function fittedModel(source: Object3D, length: number, tint?: Color): Group {
  const group = new Group();
  const clone = source.clone(true);
  const box = new Box3().setFromObject(clone);
  const size = box.getSize(new Vector3());
  const factor = length / Math.max(size.x, size.y, size.z, 0.001);
  const center = box.getCenter(new Vector3());
  clone.position.sub(new Vector3(center.x, box.min.y, center.z));
  group.add(clone);
  group.scale.setScalar(factor);
  prepareDressingMesh(group, tint);
  return group;
}

/** Episode-specific mission hardware; the shared Mars environment has no donor or relay. */
export function createRoverWorld(assets: Record<string, Object3D>, makeWreck: () => Group): RoverWorld {
  const world = createMarsEnvironment(assets, makeWreck);
  const place = (object: Object3D, x: number, z: number, yaw: number, burial = 0) => {
    object.position.set(x, world.height(x, z) - burial, z);
    object.rotation.y = yaw;
    world.scene.add(object);
  };
  const addObstacle = (object: Object3D, reduction = 1) => {
    const box = new Box3().setFromObject(object);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    if (Math.hypot(center.x, center.z) > 67) return;
    world.obstacles.push({ x: center.x, z: center.z, radius: Math.hypot(size.x, size.z) * 0.46 * reduction });
  };

  const donorPosition = new Vector3(0, world.height(0, -5), -5);
  const donor = makeWreck();
  donor.name = 'inactive-optical-module-donor';
  prepareDressingMesh(donor);
  place(donor, 0, -5, Math.PI);
  world.obstacles.push({ x: 0, z: -5, radius: 1.05 });

  const relayPosition = new Vector3(0, world.height(0, -24), -24);
  if (assets.satellitedish) {
    const relay = fittedModel(assets.satellitedish, 2.6, new Color('#8b8e89'));
    relay.name = 'silent-mission-relay';
    place(relay, 0, -24, Math.PI * 0.15);
    world.obstacles.push({ x: 0, z: -24, radius: 1.1 });
  }
  if (assets['machine-generator']) {
    const generator = fittedModel(assets['machine-generator'], 1.7, new Color('#6e726e'));
    generator.name = 'disconnected-relay-generator';
    place(generator, 7.6, -26.5, -0.3, 0.25);
    addObstacle(generator);
  }
  if (assets.structure) {
    const frame = fittedModel(assets.structure, 2.4, new Color('#73736b'));
    frame.name = 'partly-buried-broken-service-frame';
    frame.rotation.z = -0.48;
    place(frame, -12.5, -29, 0.6, 0.7);
    addObstacle(frame);
  }
  Object.assign(world.scene.userData.layout, { donor: donorPosition.toArray(), relay: relayPosition.toArray() });
  return { ...world, donor, donorPosition, relayPosition };
}
