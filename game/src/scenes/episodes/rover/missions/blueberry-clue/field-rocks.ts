import * as T from 'three';
import {noise} from '../../../../../environments/mars/terrain.ts';
import type {Slab} from './site.ts';

// Angular fracture families, in normalized metres. No sampled/scanned Mars geometry.
const outlines=[
 [[-.48,-.26],[-.29,-.47],[.28,-.42],[.49,-.12],[.41,.34],[.08,.48],[-.37,.37]],
 [[-.46,-.37],[.12,-.48],[.46,-.24],[.35,.03],[.49,.34],[-.09,.45],[-.43,.16]],
 [[-.49,-.12],[-.33,-.46],[.22,-.36],[.48,-.04],[.27,.46],[-.28,.41]],
 [[-.44,-.41],[-.03,-.47],[.41,-.31],[.47,.16],[.16,.28],[-.11,.47],[-.47,.26]],
 [[-.48,-.27],[-.15,-.45],[.23,-.46],[.46,-.17],[.35,.41],[.02,.32],[-.3,.46]],
 [[-.39,-.44],[.32,-.38],[.48,.01],[.22,.43],[-.17,.48],[-.47,.1]],
];
/** Six cheap layered silhouettes for metre-scale dressing; macro specimen stays separate. */
export function fieldRockGeometry(variant:number,fragment=false){
 const corners=outlines[variant%outlines.length],edge:number[][]=[];
 // Broken fracture edges retain broad planes, with local chips rather than rounded blobs.
 const subdivisions=fragment?1:4;
 for(let i=0;i<corners.length;i++)for(let j=0;j<subdivisions;j++){
  const a=corners[i],b=corners[(i+1)%corners.length],t=j/subdivisions,dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
  const chip=j===0?0:(noise(i*3+j,variant+2)-.55)*.07;
  edge.push([(a[0]+dx*t-dz/length*chip)*1.05,(a[1]+dz*t+dx/length*chip)*1.05]);
 }
 const n=edge.length,positions:number[]=[],indices:number[]=[],colors:number[]=[];
 const put=(x:number,y:number,z:number,c:number)=>{positions.push(x,y,z);colors.push(c*1.02,c,c*.97)};
 const top=(x:number,z:number,r:number)=>.98+x*.12+z*.08+(noise(x*5+variant,z*5)-.5)*.18+(noise(x*19+variant,z*19)-.5)*.05-T.MathUtils.smoothstep(r,.7,1)*(.15+noise(x*13+variant,z*13)*.12);
 // Broad bedding surface, softly bevelled at fractured edges; relief is a few centimetres.
 put(0,top(0,0,0),0,1);
 const rings=fragment?2:8;
 for(let j=1;j<=rings;j++)for(let i=0;i<n;i++){
  const r=j/rings,x=edge[i][0]*r,z=edge[i][1]*r;
  put(x,top(x,z,r),z,.93+noise(x*5+variant,z*5)*.12);
  if(j===1)indices.push(0,1+(i+1)%n,1+i);
  else{const a=1+(j-2)*n+i,b=1+(j-2)*n+(i+1)%n,c=a+n,d=b+n;indices.push(a,b,c,b,d,c)}
 }
 const start=positions.length/3,levels=fragment?2:6;
 for(let j=0;j<=levels;j++)for(let i=0;i<=n;i++){
  const [x,z]=edge[i%n],t=j/levels;
  const erosion=noise(x*11+variant,z*11+j*.7);
  const ledge=j===0?1:1-.075*t-.065*erosion+.018*Math.sin(j*2.2+x*7+variant);
  const layer=top(x,z,1)*(1-t)+(j>0&&j<levels?(erosion-.5)*.1:0);
  put(x*ledge,layer,z*ledge,.88+noise(i*.4+variant,j*.55)*.12);
  if(j<levels&&i<n){const a=start+j*(n+1)+i;indices.push(a,a+1,a+n+1,a+1,a+n+2,a+n+1)}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(positions),3));g.setAttribute('color',new T.BufferAttribute(new Float32Array(colors),3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();return g;
}
export function placeFieldRock(s:Slab,index:number,geometry:T.BufferGeometry,height:(x:number,z:number)=>number){
 const pose=new T.Object3D(),up=new T.Vector3(0,1,0),point=new T.Vector3();
 const dx=(height(s.x+.6,s.z)-height(s.x-.6,s.z))/1.2,dz=(height(s.x,s.z+.6)-height(s.x,s.z-.6))/1.2;
 pose.quaternion.setFromUnitVectors(up,new T.Vector3(-dx,1,-dz).normalize());pose.quaternion.multiply(new T.Quaternion().setFromAxisAngle(up,s.yaw));
 pose.scale.set(s.width,s.height*(1.05+(index%3)*.12),s.depth);pose.position.set(s.x,0,s.z);pose.updateMatrix();
 const p=geometry.getAttribute('position');let base=Infinity;
 for(let i=0;i<p.count;i++)if(p.getY(i)<.001){point.fromBufferAttribute(p,i).applyMatrix4(pose.matrix);base=Math.min(base,height(point.x,point.z)-point.y)}
 pose.position.y=base-Math.max(.025,s.burial*.8);pose.updateMatrix();return pose;
}
