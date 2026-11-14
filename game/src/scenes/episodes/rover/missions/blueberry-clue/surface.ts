import * as T from 'three';
import {noise} from '../../../../../environments/mars/terrain.ts';
export const height=(x:number,z:number)=>{
 const d=Math.hypot((x+2.5)/1.15,(z+1)/.95);
 const t=T.MathUtils.clamp((d-8)/11,0,1);
 const shoulder=.42*Math.exp(-(((x+6.5+.13*z)/2.8)**2+((z+3)/10)**2));
 const floor=.035*Math.sin(x*.32+z*.17)+.025*Math.sin(z*.45-x*.18);
 const distant=(cx:number,cz:number,sx:number,sz:number,h:number)=>h*Math.exp(-(((x-cx)/sx)**2+((z-cz)/sz)**2));
 const horizon=distant(-42,-42,26,20,4.3)+distant(5,-73,30,22,2.8)+distant(53,-48,27,32,5.2)+distant(-87,-125,50,35,7);
 // The complete playable square remains byte-for-byte the v3 height field.
 return t*t*(3-2*t)*1.8+shoulder+floor+T.MathUtils.smoothstep(Math.hypot(x,z),18,48)*horizon;
};
export const sampleHeight=(x:number,z:number)=>{
 const ix=Math.floor(x*2)/2,iz=Math.floor(z*2)/2,u=(x-ix)*2,v=(z-iz)*2;
 const a=height(ix,iz),b=height(ix+.5,iz),c=height(ix,iz+.5),d=height(ix+.5,iz+.5);
 return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);
};
function shade(terrain:T.BufferGeometry){
 const p=terrain.getAttribute('position'),uv=terrain.getAttribute('uv'),colors=new Float32Array(p.count*3);
 const sand=new T.Color('#e7c3a1'),bed=new T.Color('#f4e4ce'),color=new T.Color();
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i);p.setY(i,height(x,z));if(uv)uv.setXY(i,x/.3,z/.3);
  const apron=Math.exp(-(((x+4.5+.2*z)/4)**2+((z+2)/9)**2));
  color.copy(sand).lerp(bed,apron*.28).multiplyScalar(.94+noise(x*.09+7,z*.09)*.12);
  color.toArray(colors,i*3);
 }
 terrain.setAttribute('color',new T.BufferAttribute(colors,3));
 // Both meshes use the same field derivatives at their shared edge.
 const normals=new Float32Array(p.count*3),normal=new T.Vector3();
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i);
  normal.set(height(x-.5,z)-height(x+.5,z),1,height(x,z-.5)-height(x,z+.5)).normalize().toArray(normals,i*3);
 }
 terrain.setAttribute('normal',new T.BufferAttribute(normals,3));return terrain;
}
export function createGroundGeometry(){
 const terrain=new T.PlaneGeometry(100,100,200,200);terrain.rotateX(-Math.PI/2);
 terrain.setAttribute('baseDustCoverage',new T.BufferAttribute(new Float32Array(terrain.getAttribute('position').count),1));
 return shade(terrain);
}
/** Coarse scenic extension; its first ring shares every near-ground boundary vertex. */
export function createVistaGeometry(){
 const vertices:number[]=[],indices:number[]=[],radii=[50,55,61,68,77,89,104,123,147,180],sideCount=200,perimeter=sideCount*4;
 for(const radius of radii)for(let side=0;side<4;side++)for(let i=0;i<sideCount;i++){
  const t=i/sideCount*2-1;const [x,z]=side===0?[-radius,t*radius]:side===1?[t*radius,radius]:side===2?[radius,-t*radius]:[-t*radius,-radius];
  vertices.push(x,0,z);
 }
 for(let ring=0;ring<radii.length-1;ring++)for(let i=0;i<perimeter;i++){
  const a=ring*perimeter+i,b=ring*perimeter+(i+1)%perimeter,c=a+perimeter,d=b+perimeter;indices.push(a,c,b,b,c,d);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(vertices),3));g.setAttribute('baseDustCoverage',new T.BufferAttribute(new Float32Array(vertices.length/3),1));g.setIndex(indices);return shade(g);
}
