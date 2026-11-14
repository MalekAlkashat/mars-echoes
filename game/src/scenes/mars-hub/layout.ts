import type { Object3D } from 'three';
import { ROVER_MEMORY } from '../../content/equipment';
import { createOpportunityRover } from '../../entities/rover/opportunity';
import { Vehicle } from '../../entities/rover/controller';
import { createHubEnvironment } from '../../environments/mars/hub';
import { batchStaticModel } from '../../environments/mars/static-model';

export function createHubWorld(assets: Record<string, Object3D>) {
  const world = createHubEnvironment({variedOutcrops:true,quietGround:true});
  const rover = createOpportunityRover(assets.opportunity);
  const wreck = rover.root;
  const [x, z] = ROVER_MEMORY.position;
  wreck.name = ROVER_MEMORY.wreckId;
  const contact = new Vehicle(rover.contactConfig,world.bounds);
  contact.reset(x,z,0); contact.settle(.25,world.height);
  wreck.position.copy(contact.position);
  wreck.rotation.set(contact.pitch,0,contact.roll);
  rover.setSuspension(contact.wheelOffsets);
  batchStaticModel(wreck);
  world.scene.add(wreck);
  world.obstacles.push({ x, z, radius: ROVER_MEMORY.collisionRadius });
  return { ...world, wreck };
}
