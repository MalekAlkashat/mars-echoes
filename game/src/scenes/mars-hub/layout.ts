import type { Object3D } from 'three';
import { ROVER_MEMORY } from '../../content/equipment';
import { createRover } from '../../entities/rover/model';
import { createMarsEnvironment } from '../../environments/mars/dressing';

export function createHubWorld(assets: Record<string, Object3D>) {
  const world = createMarsEnvironment(assets, () => createRover(assets.rover, true).root);
  const wreck = createRover(assets.rover, true).root;
  const [x, z] = ROVER_MEMORY.position;
  wreck.name = ROVER_MEMORY.wreckId;
  wreck.position.set(x, world.height(x, z), z);
  world.scene.add(wreck);
  world.obstacles.push({ x, z, radius: ROVER_MEMORY.collisionRadius });
  return { ...world, wreck };
}
