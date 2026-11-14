import * as T from 'three';

// Metres. One stable relief field drives the specimen, seated grains and abrasion.
export const CUT_X=-.045, CUT_RADIUS=.02275, CUT_DEPTH=.0044, SURFACE=.025;
const fract=(n:number)=>n-Math.floor(n);
const hash=(x:number,z:number)=>fract(Math.sin(x*127.1+z*311.7)*43758.5453);
function noise(x:number,z:number){
 const ix=Math.floor(x),iz=Math.floor(z),u=x-ix,v=z-iz,a=u*u*(3-2*u),b=v*v*(3-2*v);
 return T.MathUtils.lerp(T.MathUtils.lerp(hash(ix,iz),hash(ix+1,iz),a),T.MathUtils.lerp(hash(ix,iz+1),hash(ix+1,iz+1),a),b);
}
export function rockHeight(x:number,z:number){
 const relief=(noise(x*80,z*80)-.5)*.0017+(noise(x*320,z*320)-.5)*.0005;
 const bedding=Math.sin(z*720+x*95+noise(x*55,z*55)*2)*.00012;
 const flat=1-T.MathUtils.smoothstep(Math.hypot(x-CUT_X,z),.023,.036);
 return SURFACE+(relief+bedding)*(1-flat);
}
const boundary=[[-.14,-.07],[-.10,-.108],[.076,-.103],[.136,-.064],[.128,.047],[.088,.101],[-.074,.098],[-.137,.055]];
function edgeRadius(a:number,cx:number){
 const dx=Math.cos(a),dz=Math.sin(a);let result=1;
 for(let i=0;i<boundary.length;i++){
  const p=boundary[i],q=boundary[(i+1)%boundary.length],ex=q[0]-p[0],ez=q[1]-p[1],det=dx*ez-dz*ex;
  if(Math.abs(det)<1e-8)continue;
  const t=((p[0]-cx)*ez-p[1]*ex)/det,u=((p[0]-cx)*dz-p[1]*dx)/det;
  if(t>0&&u>=0&&u<=1)result=Math.min(result,t);
 }return result*(1+(noise(dx*17+4,dz*17)-.5)*.055);
}
/** Identical outline and vertex topology before/after cutting; only the local cavity changes. */
export function specimenGeometry(cut=false,detail=true){
 const segments=detail?128:32,rings=detail?34:18,positions:number[]=[],uv:number[]=[],ids:number[]=[];
 const append=(x:number,y:number,z:number)=>{positions.push(x,y,z);uv.push(x/.3,z/.3);};
 for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){
  const a=i/segments*Math.PI*2,edge=edgeRadius(a,CUT_X);
  const r=j<=12?CUT_RADIUS*j/12:j===13?CUT_RADIUS: T.MathUtils.lerp(CUT_RADIUS+.0003,edge,(j-14)/(rings-14));
  const x=CUT_X+Math.cos(a)*r,z=Math.sin(a)*r;
  const y=cut&&j<=12?SURFACE-CUT_DEPTH:rockHeight(x,z);
  append(x,y,z);
  if(j<rings&&i<segments){const k=j*(segments+1)+i;ids.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}
 }
 // An uninterrupted eroded side wall, with fine relief rather than separated sheets.
 const start=positions.length/3,levels=detail?12:5;
 for(let j=0;j<=levels;j++)for(let i=0;i<=segments;i++){
  const a=i/segments*Math.PI*2,r=edgeRadius(a,CUT_X),x=CUT_X+Math.cos(a)*r,z=Math.sin(a)*r;
  const y=rockHeight(x,z)*(1-j/levels)-.002*j/levels;
  const erosion=j===0?0:(.0015*noise(i*.18,j*.7)+.001*Math.sin(j*.8+i*.17))*Math.min(j,2)/2;
  append(x-Math.cos(a)*erosion,y,z-Math.sin(a)*erosion);uv[uv.length-2]=i/segments*.8;uv[uv.length-1]=y/.3;
  if(j<levels&&i<segments){const k=start+j*(segments+1)+i;ids.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('uv1',new T.Float32BufferAttribute(uv,2));g.setIndex(ids);g.computeVertexNormals();return g;
}

export function outcropGeometry(width:number,depth:number,thickness:number,seed:number){
 const g=specimenGeometry(false,false);const p=g.getAttribute('position');
 for(let i=0;i<p.count;i++){
  const x=p.getX(i)*width/.28,z=p.getZ(i)*depth/.21;
  p.setXYZ(i,x+(noise(z*8+seed,x*11)-.5)*width*.12,p.getY(i)*thickness/SURFACE+(noise(x*9+seed,z*9)-.5)*thickness*.42,z+(noise(x*9-seed,z*7)-.5)*depth*.12);
 }g.computeVertexNormals();return g;
}

const field=`
varying vec3 rockP;
float rh(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float rn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(rh(i),rh(i+vec3(1,0,0)),f.x),mix(rh(i+vec3(0,1,0)),rh(i+vec3(1,1,0)),f.x),f.y),mix(mix(rh(i+vec3(0,0,1)),rh(i+vec3(1,0,1)),f.x),mix(rh(i+vec3(0,1,1)),rh(i+vec3(1,1,1)),f.x),f.y),f.z);}
`;
/** Shader detail stays in object metres and uses the ordinary physically lit material. */
export function stoneMaterial(interior=false,maps?:T.Texture[]){
 const m=new T.MeshStandardMaterial({color:interior?'#b59b80':'#a27b59',roughness:.94,metalness:0,map:maps?.[0],normalMap:maps?.[1],normalScale:new T.Vector2(interior?.2:.65,interior?.2:.65),roughnessMap:maps?.[2],aoMap:maps?.[3],aoMapIntensity:.65});
 m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 rockP;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nrockP=position;');
  s.fragmentShader=field+s.fragmentShader;
  if(maps)s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 diffuseColor.rgb=diffuse*(.62+sqrt(dot(sampledDiffuseColor.rgb,vec3(.2126,.7152,.0722)))*1.1);`);
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float footprint=max(length(dFdx(rockP)),length(dFdy(rockP)));
   float grainFade=1.-smoothstep(.0003,.0016,footprint);
   float grain=rn(rockP*1800.);
   float pores=smoothstep(.67,.86,rn(rockP*1400.));
   float strata=sin((rockP.y+rockP.z*.10+rn(rockP*90.)*.00065)*4200.);
   float crack=0.;
   float body=rn(rockP*110.);
   float fresh=${interior?'1.':'0.'};
   diffuseColor.rgb*=mix(.93,1.05,body)*(1.-pores*.15*grainFade)*(1.-crack*.58*(1.-fresh));
   diffuseColor.rgb*=1.+strata*.025*(1.-fresh)+((grain-.5)*.16)*grainFade;
   float relief=(grain-.5)*.000035*grainFade-pores*.00006*grainFade+strata*.000012-crack*.0005*(1.-fresh);
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec3 q0=dFdx(-vViewPosition),q1=dFdy(-vViewPosition);
   vec3 a=cross(q1,normal),b=cross(normal,q0);float det=dot(q0,a);
   normal=normalize(abs(det)*normal-sign(det)*(dFdx(relief)*a+dFdy(relief)*b));
  `);
 };
 m.customProgramCacheKey=()=>`eagle-stone-v2-${interior}`;return m;
}

export function addConcretions(parent:T.Group){
 const material=new T.MeshStandardMaterial({color:'#66625c',roughness:.67,metalness:0});
 const geometry=new T.SphereGeometry(1,20,12),p=geometry.getAttribute('position');
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=1+.045*Math.sin(x*9+y*5)*Math.sin(z*8+y*7);p.setXYZ(i,x*r,y*r,z*r);}geometry.computeVertexNormals();
 const berries=new T.InstancedMesh(geometry,material,150),matrix=new T.Object3D();
 const placed:{x:number;z:number;r:number}[]=[];let seed=82;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<150;i++){
  const r=.0015+random()*.001;let x=0,z=0;
  for(let attempt=0;attempt<100;attempt++){
   x=i<80?.055+(random()-.5)*.055:(random()-.5)*.23;z=i<80?.025+(random()-.5)*.06:(random()-.5)*.16;
   if(Math.hypot(x-CUT_X,z)>.030&&placed.every(v=>Math.hypot(x-v.x,z-v.z)>r+v.r+.0002))break;
  }
  placed.push({x,z,r});matrix.position.set(x,rockHeight(x,z)+r*(i%6===0?.10:.65),z);matrix.scale.set(r,r*(.8+random()*.2),r);matrix.rotation.set(random()*3,random()*3,random()*3);matrix.updateMatrix();berries.setMatrixAt(i,matrix.matrix);
  berries.setColorAt(i,new T.Color().setScalar(.72+random()*.45));
 }berries.castShadow=berries.receiveShadow=true;parent.add(berries);return berries;
}
