import * as T from 'three';
export const height=(x:number,z:number)=>{
 const d=Math.hypot(x,z);const t=T.MathUtils.clamp((d-8)/9,0,1);return t*t*(3-2*t)*2.1;
};
export const sampleHeight=(x:number,z:number)=>{
 const ix=Math.floor(x*2)/2,iz=Math.floor(z*2)/2,u=(x-ix)*2,v=(z-iz)*2;
 const a=height(ix,iz),b=height(ix+.5,iz),c=height(ix,iz+.5),d=height(ix+.5,iz+.5);
 return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);
};
export function createGroundGeometry(){
 const terrain=new T.PlaneGeometry(100,100,200,200);terrain.rotateX(-Math.PI/2);
 const p=terrain.getAttribute('position'),uv=terrain.getAttribute('uv');
 for(let i=0;i<p.count;i++){p.setY(i,height(p.getX(i),p.getZ(i)));uv.setXY(i,p.getX(i)/.3,p.getZ(i)/.3);}terrain.computeVertexNormals();return terrain;
}
