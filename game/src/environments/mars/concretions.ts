import * as T from 'three';

export type ConcretionSite={id:string;x:number;z:number;spreadX:number;spreadZ:number;count:number};
export type ConcretionPlacement={id:string;x:number;y:number;z:number;r:number;sy:number;yaw:number;shade:number};

/** Visual analogue only: authored clusters, not surveyed distributions or measured sizes. */
export function concretionPlacements(sites:readonly ConcretionSite[],height:(x:number,z:number)=>number,seed:number,minRadius:number,maxRadius:number){
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const result:ConcretionPlacement[]=[];
 for(const site of sites)for(let i=0;i<site.count;i++){
  const r=minRadius+(maxRadius-minRadius)*random()**1.4,sy=.82+random()*.18;
  let x=site.x,z=site.z;
  for(let attempt=0;attempt<100;attempt++){
   // Two overlapping lobes with an uneven, feathered edge; no perimeter rings.
   const lobe=random()<.7?-.18:.32;
   x=site.x+((random()+random()-1)*.8+lobe)*site.spreadX;
   z=site.z+(random()+random()-1)*site.spreadZ+(x-site.x)*.22;
   if(result.every(p=>Math.hypot(p.x-x,p.z-z)>p.r+r+.003))break;
  }
  result.push({id:`${site.id}-${i}`,x,y:height(x,z)+r*sy*.58,z,r,sy,yaw:random()*Math.PI*2,shade:.78+random()*.32});
 }
 return result;
}

export function concretionGeometry(macro=false){
 const g=macro?new T.SphereGeometry(1,20,12):new T.IcosahedronGeometry(1,1),p=g.getAttribute('position');
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=1+.045*Math.sin(x*9+y*5)*Math.sin(z*8+y*7);
  p.setXYZ(i,x*r,y*r,z*r);
 }
 if(macro)g.computeVertexNormals();return g;
}
export const concretionMaterial=()=>new T.MeshStandardMaterial({color:'#66625c',roughness:.67,metalness:0});

/** One scene-owned batch. Creation has no session/save/mission argument or frame work. */
export function createConcretionField(name:string,placements:readonly ConcretionPlacement[]){
 const mesh=new T.InstancedMesh(concretionGeometry(),concretionMaterial(),placements.length),pose=new T.Object3D(),color=new T.Color();
 mesh.name=name;mesh.userData.placements=placements;
 placements.forEach((p,i)=>{
  pose.position.set(p.x,p.y,p.z);pose.rotation.set(0,p.yaw,0);pose.scale.set(p.r,p.r*p.sy,p.r);pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);mesh.setColorAt(i,color.setScalar(p.shade));
 });
 mesh.receiveShadow=true;mesh.computeBoundingSphere();return mesh;
}
