import { Box3, BufferAttribute, BufferGeometry, InstancedBufferAttribute, MathUtils, Mesh, Vector2 } from 'three';
import { noise } from './terrain.ts';

/** Local ground planes are baked once per instance; no terrain lookups in the frame loop. */
export function setRockGroundPlanes(geometry: BufferGeometry, positions: readonly {x:number;z:number}[],
  height: (x:number,z:number)=>number): void {
  const planes = new Float32Array(positions.length*3);
  positions.forEach(({x,z},i)=>{
    const dx=(height(x+1,z)-height(x-1,z))/2;
    const dz=(height(x,z+1)-height(x,z-1))/2;
    planes.set([height(x,z)-dx*x-dz*z,dx,dz],i*3);
  });
  geometry.setAttribute('rockGroundPlane',new InstancedBufferAttribute(planes,3));
}

export type DustFootprint = {bounds: Box3; points: Vector2[]};

/** Soft deposits follow the sampled rock outlines on the existing one-metre ground grid. */
export function bakeRockBaseDust(ground: Mesh | undefined, footprints: readonly DustFootprint[]): void {
  if (!ground) return;
  const positions=ground.geometry.getAttribute('position');
  const coverage=new Float32Array(positions.count);
  for(let i=0;i<positions.count;i++) {
    const x=positions.getX(i),z=positions.getZ(i);
    let distanceSquared=Infinity;
    for(const {bounds,points} of footprints) {
      if(x<bounds.min.x-1.2||x>bounds.max.x+1.2||z<bounds.min.z-1.2||z>bounds.max.z+1.2)continue;
      for(const point of points)distanceSquared=Math.min(distanceSquared,(x-point.x)**2+(z-point.y)**2);
    }
    if(distanceSquared>1.44)continue;
    const edge=.85+noise(x*.8+14,z*.8)*.35;
    coverage[i]=1-MathUtils.smoothstep(Math.sqrt(distanceSquared),.12,edge);
  }
  ground.geometry.setAttribute('baseDustCoverage',new BufferAttribute(coverage,1));
}
