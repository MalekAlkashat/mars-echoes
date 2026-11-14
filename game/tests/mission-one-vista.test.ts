import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
import {createGroundGeometry,createVistaGeometry,height} from '../src/scenes/episodes/rover/missions/blueberry-clue/surface.ts';

test('Mission 1 distant terrain joins every near edge with upward-facing, bounded geometry',()=>{
 const near=createGroundGeometry(),far=createVistaGeometry();
 try{
  const p=near.getAttribute('position'),q=far.getAttribute('position'),pn=near.getAttribute('normal'),qn=far.getAttribute('normal'),border=new Map<string,number>();
  for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i))===50||Math.abs(p.getZ(i))===50)border.set(`${p.getX(i).toFixed(5)},${p.getZ(i).toFixed(5)}`,i);
  let count=0;
  for(let i=0;i<q.count;i++){
   const x=q.getX(i),z=q.getZ(i),y=q.getY(i);assert.ok(Number.isFinite(y));
   const key=`${x.toFixed(5)},${z.toFixed(5)}`;if(border.has(key)){
    const j=border.get(key)!;assert.ok(Math.abs(y-p.getY(j))<2e-6);
    assert.deepEqual([qn.getX(i),qn.getY(i),qn.getZ(i)],[pn.getX(j),pn.getY(j),pn.getZ(j)]);count++;
   }
  }
  assert.equal(count,border.size);assert.equal(count,800);
  const index=far.getIndex()!,a=new Vector3(),b=new Vector3(),c=new Vector3();
  for(let i=0;i<index.count;i+=3){a.fromBufferAttribute(q,index.getX(i));b.fromBufferAttribute(q,index.getX(i+1));c.fromBufferAttribute(q,index.getX(i+2));assert.ok(b.sub(a).cross(c.sub(a)).y>0)}
  assert.equal(index.count/3,14400);
 }finally{near.dispose();far.dispose()}
});

test('scenic shoulders do not regrade any v3 playable height sample',()=>{
 // Frozen pre-polish heightfield: changing it requires an explicit route/contact redesign.
 const baseline=(x:number,z:number)=>{
  const d=Math.hypot((x+2.5)/1.15,(z+1)/.95),t=Math.max(0,Math.min(1,(d-8)/11));
  return t*t*(3-2*t)*1.8+.42*Math.exp(-(((x+6.5+.13*z)/2.8)**2+((z+3)/10)**2))+.035*Math.sin(x*.32+z*.17)+.025*Math.sin(z*.45-x*.18);
 };
 for(let x=-11.5;x<=11.5;x+=.25)for(let z=-11.5;z<=11.5;z+=.25)assert.ok(Math.abs(height(x,z)-baseline(x,z))<1e-12);
});
