import type { MapSnapshot } from '../app/contracts.ts';

type Bounds=MapSnapshot['bounds'];
type Point=readonly [number,number];

/** North-up local cartography: east is +X, south is +Z. Values are not clipped. */
export function projectToMap(position:Point,bounds:Bounds):{x:number;y:number}{
  const width=bounds.maxX-bounds.minX,depth=bounds.maxZ-bounds.minZ;
  if(![...position,bounds.minX,bounds.maxX,bounds.minZ,bounds.maxZ].every(Number.isFinite)||width<=0||depth<=0)
    throw new RangeError('Map coordinates need finite positions and increasing bounds');
  return {x:(position[0]-bounds.minX)/width,y:(position[1]-bounds.minZ)/depth};
}

export function mapDistance(a:Point,b:Point):number {
  return Math.hypot(a[0]-b[0],a[1]-b[1]);
}

/** A north-pointing CSS arrow rotates counterclockwise for positive world heading. */
export function mapHeading(heading:number):number { return -heading*180/Math.PI; }
