import { BufferAttribute, BufferGeometry, Color, Mesh, PlaneGeometry } from 'three';
import { noise } from './terrain.ts';
import { surfaceMaterial } from './materials.ts';

export const TERRAIN_100 = {
  minX:-50,maxX:50,minZ:-50,maxZ:50,cellSize:.5,seed:1511,
  spawn:[0,36] as const, rover:[0,-25] as const,
  mainRoute:[[0,36],[5,22],[-3,5],[0,-12],[0,-25],[10,-39]] as const,
  sideRoute:[[0,36],[-14,24],[-17,7],[-14,-10],[-10,-25],[0,-25]] as const,
};
const smooth = (a:number,b:number,x:number) => {const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const gaussian = (x:number,z:number,cx:number,cz:number,sx:number,sz:number) => Math.exp(-(((x-cx)/sx)**2+((z-cz)/sz)**2));

function routeDistance(x:number,z:number):number {
  let distance=Infinity;
  const points=TERRAIN_100.mainRoute;
  for(let i=1;i<points.length;i++){
    const [ax,az]=points[i-1],[bx,bz]=points[i];
    const t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(z-az)*(bz-az))/((bx-ax)**2+(bz-az)**2)));
    distance=Math.min(distance,Math.hypot(x-ax-t*(bx-ax),z-az-t*(bz-az)));
  }
  return distance;
}

/** Named, shared geological causes for shape, sediment, colour and placement. */
export function terrainFields(x:number,z:number) {
  const warpedX=x+(noise(x*.043+11,z*.041)-.5)*3.5;
  const warpedZ=z+(noise(x*.035,z*.037+8)-.5)*2.5;
  const leftDistance=Math.hypot((warpedX+34)/24,(warpedZ+15)/33);
  const rightDistance=Math.hypot((warpedX-36)/25,(warpedZ-2)/36);
  const westShelf=3.6*(1-smooth(.3,1.2,leftDistance));
  const headland=7.2*(1-smooth(.28,1.2,rightDistance));
  const backShelf=2.4*gaussian(x,z,-31,36,20,17);
  const saddle=.8*gaussian(x,z,-7,13,15,11);
  const channel=Math.exp(-((routeDistance(x,z)/9.5)**2));
  const basin=1.1*gaussian(x,z,2,-17,27,34);
  const exposure=Math.max(1-smooth(.65,1.1,leftDistance),1-smooth(.6,1.15,rightDistance));
  const shelfBreakup=(noise(warpedX*.13+7,warpedZ*.16+4)-.5)*.65*exposure*(1-channel*.8);
  const weathering=(noise(warpedX*.21+31,warpedZ*.19)-.5)*.22*exposure;
  const sandPatch=gaussian(x,z,-5,-3,17,26)*(1-exposure);
  const drift=(noise(warpedX*.55,warpedZ*.12+18)-.5)*.035*sandPatch;
  // Broken lips belong to the outer shoulders; the side route stays on a smooth apron.
  const westLip=(1-smooth(.62,.73,leftDistance))*smooth(-24,-29,x);
  const eastLip=(1-smooth(.68,.78,rightDistance))*smooth(16,23,x);
  const ledge=(westLip*.6+eastLip*1.05)*(0.7+noise(x*.17+5,z*.14)*.3);
  const height=.012*z-.008*x+westShelf+headland+backShelf+saddle-.6*channel-basin+shelfBreakup+weathering+drift+ledge;
  return {height,exposure,channel,sandPatch,ledge};
}

const cells=200,stride=cells+1;
const heights=new Float32Array(stride*stride);
for(let z=0;z<=cells;z++)for(let x=0;x<=cells;x++) heights[z*stride+x]=terrainFields(x*.5-50,z*.5-50).height;

/** Triangle interpolation exactly matches the visible 0.5 m contact grid. */
export function terrain100Height(x:number,z:number):number {
  const gx=Math.max(0,Math.min(cells,(x+50)*2)),gz=Math.max(0,Math.min(cells,(z+50)*2));
  const ix=Math.min(cells-1,Math.floor(gx)),iz=Math.min(cells-1,Math.floor(gz));
  const u=gx-ix,v=gz-iz,a=heights[iz*stride+ix],b=heights[iz*stride+ix+1];
  const c=heights[(iz+1)*stride+ix],d=heights[(iz+1)*stride+ix+1];
  return u+v<=1?a+u*(b-a)+v*(c-a):d+(1-u)*(c-d)+(1-v)*(b-d);
}

function distantHeight(x:number,z:number):number {
  const distance=Math.max(Math.abs(x),Math.abs(z));
  const local=terrainFields(x,z).height;
  const ridge=23*gaussian(x,z,-190,-290,160,60)+38*gaussian(x,z,180,-430,260,85)
    +24*gaussian(x,z,-470,-170,120,260)+15*gaussian(x,z,410,90,120,210);
  const mid=8*gaussian(x,z,-65,-106,48,19)+12*gaussian(x,z,72,-142,65,25)
    +5*gaussian(x,z,8,-205,115,21);
  const far=-2+mid+ridge*(.82+noise(x*.025,z*.02)*.18);
  return local+(far-local)*smooth(50,165,distance);
}

function shade(geometry:BufferGeometry,far=false){
  const positions=geometry.getAttribute('position'),colors=new Float32Array(positions.count*3),fields=new Float32Array(positions.count*2);
  const sand=new Color('#edc7a0'),rock=new Color('#b7a18b'),color=new Color();
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i),f=terrainFields(x,z);
    positions.setY(i,far?distantHeight(x,z):terrain100Height(x,z));
    color.copy(sand).lerp(rock,f.exposure*.8).multiplyScalar(.92+noise(x*.07+4,z*.07)*.12);
    color.toArray(colors,i*3);fields[i*2]=f.exposure;fields[i*2+1]=f.sandPatch;
  }
  geometry.setAttribute('geology',new BufferAttribute(fields,2));geometry.setAttribute('color',new BufferAttribute(colors,3));geometry.computeVertexNormals();geometry.computeBoundingSphere();
}

export function makeTerrain100():Mesh[]{
  const geometry=new PlaneGeometry(100,100,cells,cells);geometry.rotateX(-Math.PI/2);shade(geometry);
  const material=surfaceMaterial('regolith');material.color.set('#cc9468');
  const compile=material.onBeforeCompile;
  material.onBeforeCompile=(shader,renderer)=>{
    compile.call(material,shader,renderer);
    // Low, irregular detail; no field-wide sinusoidal corrugation or repeated large albedo features.
    shader.vertexShader='attribute vec2 geology; varying vec2 vGeology;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGeology=geology;');
    shader.fragmentShader='varying vec2 vGeology;\n'+shader.fragmentShader;
    shader.uniforms.surfaceNormalStrength.value=.38;
    shader.uniforms.surfaceScale.value=.37;
    shader.fragmentShader=shader.fragmentShader.replace('vec3 surfaceP = vSurfacePosition * surfaceScale;',
      `vec3 surfaceP = vSurfacePosition * surfaceScale;
       surfaceP.xz += vec2(surfaceNoise(surfaceP.xz*.19),surfaceNoise(surfaceP.xz*.17+vec2(17.,7.)))*1.4;`);
    shader.fragmentShader=shader.fragmentShader.replace('float surfaceDustCoverage = 0.0;',`
       float surfaceDustCoverage = 1.0-vGeology.x;
       float ripplePhase=dot(vSurfacePosition.xz,vec2(.75,1.0))*16.0
         +surfaceNoise(vSurfacePosition.xz*.33)*5.0;
       float rippleFilter=1.0-smoothstep(.4,1.8,fwidth(ripplePhase));
       float ripple=vGeology.y*cos(ripplePhase)*rippleFilter;
       diffuseColor.rgb *= 1.0+ripple*.025;
    `);
    shader.fragmentShader=shader.fragmentShader.replace('vec3 worldSurfaceNormal = normalize(vSurfaceNormal + worldDetail',
      `worldDetail *= mix(.48,1.0,vGeology.x);
       worldDetail += vec3(.75,0.0,1.0)*ripple*.11;
       vec3 worldSurfaceNormal = normalize(vSurfaceNormal + worldDetail`);
    shader.fragmentShader=shader.fragmentShader.replace('roughnessFactor = clamp(roughness * (0.58 + mineralRoughness * 0.51), 0.53, 1.0);',
      'roughnessFactor = mix(.97,clamp(roughness*(.65+mineralRoughness*.4),.7,1.0),vGeology.x);');
  };
  material.customProgramCacheKey=()=> 'reference100-sediment-v2';
  const ground=new Mesh(geometry,material);ground.name='reference100-contact-ground';ground.receiveShadow=true;
  const vertices:number[]=[],indices:number[]=[];
  const rings=[50,85,140,240,400,700],perSide=cells,count=perSide*4;
  for(const r of rings)for(let side=0;side<4;side++)for(let i=0;i<perSide;i++){
    const t=i/perSide*2-1;
    const [x,z]=side===0?[-r,t*r]:side===1?[t*r,r]:side===2?[r,-t*r]:[-t*r,-r];vertices.push(x,0,z);
  }
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<count;i++){
    const a=j*count+i,b=j*count+(i+1)%count,c=a+count,d=b+count;indices.push(a,c,b,b,c,d);
  }
  const farGeometry=new BufferGeometry();farGeometry.setAttribute('position',new BufferAttribute(new Float32Array(vertices),3));farGeometry.setIndex(indices);shade(farGeometry,true);
  const farMaterial=surfaceMaterial('regolith',true);farMaterial.color.set('#c38b64');
  const far=new Mesh(farGeometry,farMaterial);far.name='reference100-unplayable-horizon';
  return [ground,far];
}
