import * as T from 'three';
export const height=(x:number,z:number)=>{
 const d=Math.hypot((x+2.5)/1.15,(z+1)/.95);
 const t=T.MathUtils.clamp((d-8)/11,0,1);
 const shoulder=.42*Math.exp(-(((x+6.5+.13*z)/2.8)**2+((z+3)/10)**2));
 const floor=.035*Math.sin(x*.32+z*.17)+.025*Math.sin(z*.45-x*.18);
 return t*t*(3-2*t)*1.8+shoulder+floor;
};
export const sampleHeight=(x:number,z:number)=>{
 const ix=Math.floor(x*2)/2,iz=Math.floor(z*2)/2,u=(x-ix)*2,v=(z-iz)*2;
 const a=height(ix,iz),b=height(ix+.5,iz),c=height(ix,iz+.5),d=height(ix+.5,iz+.5);
 return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);
};
export function createGroundGeometry(){
 const terrain=new T.PlaneGeometry(100,100,200,200);terrain.rotateX(-Math.PI/2);
 const p=terrain.getAttribute('position'),uv=terrain.getAttribute('uv'),colors=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i);p.setY(i,height(x,z));uv.setXY(i,x/.3,z/.3);
  const apron=Math.exp(-(((x+4.5+.2*z)/4)**2+((z+2)/9)**2));
  const variation=.96-.10*apron+Math.sin(x*.61+Math.sin(z*.4))*Math.cos(z*.37)*.025;
  colors.set([variation,variation*.99,variation*.97],i*3);
 }terrain.setAttribute('color',new T.BufferAttribute(colors,3));terrain.computeVertexNormals();return terrain;
}
