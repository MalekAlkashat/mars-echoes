import { BufferAttribute, BufferGeometry, Color, MathUtils, Mesh, PlaneGeometry } from 'three';
import { noise } from './terrain.ts';
import { surfaceMaterial } from './materials.ts';

export const HUB_TERRAIN = { halfSize: 80, cellSize: 1, vistaRadius: 1000, playableRadius: 63.5 } as const;

function mound(x: number, z: number, cx: number, cz: number, sx: number, sz: number): number {
  return Math.exp(-(((x - cx) / sx) ** 2) - (((z - cz) / sz) ** 2));
}

function erodedRelief(x:number,z:number):number {
  const warpX=x+(noise(x*.034+83,z*.034)-.5)*9;
  const warpZ=z+(noise(x*.034,z*.034+47)-.5)*9;
  const sideMask=MathUtils.smoothstep(Math.abs(x),6,16);
  const weathered=(noise(warpX*.095+31,warpZ*.095)-.5)*.6
    +(noise(warpX*.21,warpZ*.21+16)-.5)*.10;
  const bowlDistance=Math.hypot((x-28)*1.05,z+1);
  const sideBowl=.46*Math.exp(-(((bowlDistance-8.5)/2.2)**2))
    -.38*Math.exp(-((bowlDistance/6.7)**4));
  const landingMask=MathUtils.smoothstep(Math.min(Math.hypot(x,z-8),Math.hypot(x,z+25)),1,3);
  const looseGround=(noise(warpX*.34+19,warpZ*.34)-.5)*.20
    +(noise(warpX*.68,warpZ*.68+41)-.5)*.07;
  return (weathered+sideBowl)*sideMask+looseGround*landingMask;
}

function landform(x: number, z: number, quiet = false): number {
  const radius = Math.hypot(x, z);
  const shoulder = 5.6 * mound(x, z, -32, -6, 17, 38)
    + 3.8 * mound(x, z, 42, -32, 26, 35)
    + 10 * mound(x, z, -74, 34, 44, 56);
  const basin = -3.2 * mound(x, z, 9, -37, 38, 35);
  // Remove valley-wide corrugation only in the hub; preserve the legacy episode profile.
  const ripple = quiet ? 0 : Math.sin(z * .88 + x * .19) * .035
    * MathUtils.smoothstep(Math.abs(x), 5, 19);
  const saddle = 1.1 * mound(x, z, 0, -7, 13, 7);
  // Close, asymmetric valley shoulders frame the player without lifting the approach lane.
  const closeHills=quiet ? (4.6*mound(x,z,-16,-1,10,17)
    + 3.9*mound(x,z,17,-13,10,15)
    + 1.7*mound(x,z,23,13,12,9))
    * MathUtils.smoothstep(Math.abs(x),4,11)
    * (.92+noise(x*.13+7,z*.13+29)*.16) : 0;
  // Local eroded hardpan and one shallow side basin: no valley-wide periodic bands.
  // The route retains its broad landform, with small irregular soil relief underfoot.
  const erosion=quiet?erodedRelief(x,z):0;
  const near = .012 * z + shoulder + basin + saddle + closeHills + ripple
    + (noise(x * .045 + 18, z * .045) - .5) * .34+erosion;
  const craterDistance = Math.hypot(x - 60, (z + 230) * .8);
  const farRim = 80 * Math.exp(-(((craterDistance - 620) / 90) ** 2));
  const rimVariation = .68 + noise(x * .009 + 9, z * .009) * .65;
  const far = -18 + farRim * rimVariation
    + (noise(x * .006, z * .007) - .5) * 11;
  return MathUtils.lerp(near, far, MathUtils.smoothstep(radius, 100, 330));
}

/** The same triangles supply visible ground and collision/contact heights. */
export function hubHeight(x: number, z: number, quiet = false): number {
  if (Math.abs(x) > HUB_TERRAIN.halfSize || Math.abs(z) > HUB_TERRAIN.halfSize) return landform(x, z, quiet);
  const x0 = Math.floor(x), z0 = Math.floor(z);
  const tx = x - x0, tz = z - z0;
  const a = landform(x0, z0, quiet), b = landform(x0 + 1, z0, quiet);
  const c = landform(x0, z0 + 1, quiet), d = landform(x0 + 1, z0 + 1, quiet);
  return tx + tz <= 1 ? a + tx * (b - a) + tz * (c - a)
    : d + (1 - tx) * (c - d) + (1 - tz) * (b - d);
}

function shade(geometry: BufferGeometry, quiet: boolean): void {
  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const normals = new Float32Array(positions.count * 3);
  const sand = new Color('#e7c3a1'), bedrock = new Color('#f4e4ce');
  const color = new Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getZ(i);
    positions.setY(i, hubHeight(x, z, quiet));
    const exposure = MathUtils.smoothstep(noise(x * .06 + 3, z * .06), .4, .78);
    // Quiet terrain's color comes from one continuous world-space shader at every LOD.
    // Coarsely interpolated vertex colors otherwise expose the square ring topology.
    if(quiet)color.setRGB(1,1,1);
    else color.copy(sand).lerp(bedrock, exposure * .7).multiplyScalar(.9 + noise(x * .018, z * .018) * .18);
    color.toArray(colors, i * 3);
    if(quiet){
      // Resolve nearby soil detail, then average across a distant vertex footprint.
      const step=MathUtils.lerp(1,12,MathUtils.smoothstep(Math.hypot(x,z),95,230));
      const nx=landform(x-step,z,true)-landform(x+step,z,true);
      const nz=landform(x,z-step,true)-landform(x,z+step,true);
      const ny=2*step,length=Math.hypot(nx,ny,nz);
      normals.set([nx/length,ny/length,nz/length],i*3);
    }
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  if(quiet)geometry.setAttribute('normal',new BufferAttribute(normals,3));
  else geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

export function makeHubTerrain(quiet = false): Mesh[] {
  const near = new PlaneGeometry(160, 160, 160, 160);
  near.rotateX(-Math.PI / 2);
  shade(near, quiet);
  if (quiet) near.setAttribute('baseDustCoverage',new BufferAttribute(new Float32Array(near.getAttribute('position').count),1));
  const ground = new Mesh(near, surfaceMaterial(quiet ? 'dust' : 'regolith',false,{terrainDust:quiet}));
  ground.name = 'hub-traversable-troughs';
  ground.receiveShadow = true;

  // Square rings share every fine-grid boundary vertex; no overlapping terrain or cracks.
  const vertices: number[] = [], indices: number[] = [];
  const rings = quiet
    ? [80,84,92,104,124,144,170,200,235,275,320,365,410,455,500,545,590,635,680,725,770,815,860,905,950,1000]
    : [80,120,180,260,400,640,1000];
  const perSide = 160, perimeter = perSide * 4;
  for (const radius of rings) for (let side = 0; side < 4; side++) {
    for (let i = 0; i < perSide; i++) {
      const t = i / perSide * 2 - 1;
      const [x, z] = side === 0 ? [-radius, t * radius]
        : side === 1 ? [t * radius, radius]
        : side === 2 ? [radius, -t * radius] : [-t * radius, -radius];
      vertices.push(x, 0, z);
    }
  }
  for (let ring = 0; ring < rings.length - 1; ring++) for (let i = 0; i < perimeter; i++) {
    const a = ring * perimeter + i, b = ring * perimeter + (i + 1) % perimeter;
    const c = a + perimeter, d = b + perimeter;
    indices.push(a, c, b, b, c, d);
  }
  const far = new BufferGeometry();
  far.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  far.setIndex(indices);
  shade(far, quiet);
  if(quiet)far.setAttribute('baseDustCoverage',new BufferAttribute(new Float32Array(far.getAttribute('position').count),1));
  // Shared material, vertex color and normals remove the near/far square color boundary.
  const vista = new Mesh(far, quiet ? ground.material : surfaceMaterial('regolith', true));
  vista.name = 'hub-coarse-crater-vista';
  vista.receiveShadow=quiet;
  return [ground, vista];
}
