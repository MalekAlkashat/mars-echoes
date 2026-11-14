import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Reference reconstruction: Myrick et al., 2004, Figures 1–3. Not flight CAD. */
export function createRAT(){
 const tool=new T.Group(),feed=new T.Group(),head=new T.Group(),paddle=new T.Group(),brush=new T.Group();tool.add(feed);feed.add(head);head.add(paddle,brush);
 const silver=new T.MeshStandardMaterial({color:'#b9bdba',metalness:.86,roughness:.28});
 const edge=new T.MeshStandardMaterial({color:'#d2d2c6',metalness:.72,roughness:.34});
 const dark=new T.MeshStandardMaterial({color:'#3b3b35',metalness:.5,roughness:.42});
 const resin=new T.MeshStandardMaterial({color:'#4a382a',metalness:0,roughness:.9});
 const gold=new T.MeshStandardMaterial({color:'#ad7a24',metalness:.8,roughness:.46,flatShading:true,side:T.DoubleSide});
 const add=(g:T.BufferGeometry,m:T.Material,p:T.Object3D,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;};
 const cylinder=(r:number,h:number,p:T.Object3D,x:number,y:number,z:number,m:T.Material=silver)=>add(new T.CylinderGeometry(r,r,h,64),m,p,x,y,z);
 const box=(w:number,h:number,d:number,p:T.Object3D,x:number,y:number,z:number,m:T.Material=silver)=>add(new RoundedBoxGeometry(w,h,d,2,Math.min(w,h,d)*.10),m,p,x,y,z);
 const bolt=(p:T.Object3D,x:number,y:number,z:number)=>{cylinder(.00135,.0012,p,x,y,z,dark);box(.0018,.0002,.0003,p,x,y+.00065,z,edge);};
 // Rear motor can, stepped bell housing and flange. Casing remains stationary.
 cylinder(.022,.065,tool,0,.091,0);cylinder(.024,.004,tool,0,.124,0);
 cylinder(.027,.005,feed,0,.055,0);add(new T.CylinderGeometry(.025,.031,.035,64),silver,feed,0,.036,0);
 cylinder(.032,.004,feed,0,.017,0);cylinder(.029,.005,head,0,.012,0,edge);
 for(let j=0;j<3;j++){cylinder(.0252+j*.001,.0014,feed,0,.048-j*.004,0,dark);}
 for(let i=0;i<10;i++){const a=i*Math.PI/5;bolt(feed,Math.cos(a)*.028,.0193,Math.sin(a)*.028);}
 for(const x of [-.016,.016])bolt(tool,x,.1263,0);
 // The two butterfly wings brace on spherical feet outside the cutting diameter.
 for(const side of [-1,1]){
  const arc=new T.Shape();for(let i=0;i<=32;i++){const a=i/32*Math.PI;const x=Math.cos(a)*.039,z=Math.sin(a)*.039*side;if(i===0)arc.moveTo(x,z);else arc.lineTo(x,z);}
  for(let i=32;i>=0;i--){const a=i/32*Math.PI;arc.lineTo(Math.cos(a)*.035,Math.sin(a)*.035*side);}arc.closePath();
  const wing=add(new T.ExtrudeGeometry(arc,{depth:.002,bevelEnabled:true,bevelSize:.0004,bevelThickness:.0003,bevelSegments:1,steps:1}),edge,tool,0,.005,0);wing.rotation.x=-Math.PI/2;
  add(new T.SphereGeometry(.0035,16,10),silver,tool,0,.0035,side*.037);
  box(.005,.035,.006,tool,side*.036,.025,0,edge);
  const pivot=cylinder(.004,.006,tool,side*.036,.018,0,dark);pivot.rotation.z=Math.PI/2;
  for(let i=0;i<6;i++){const a=(i+1)/7*Math.PI;bolt(tool,Math.cos(a)*.037,.008,Math.sin(a)*.037*side);}
  box(.006,.007,.01,tool,side*.033,.039,0,dark);
 }
 // Four face magnets; fast paddle spin + slower orbital carrier are distinct.
 for(let i=0;i<4;i++){const a=(i+.2)*Math.PI/2;cylinder(.0032,.0008,head,Math.cos(a)*.023,.0085,Math.sin(a)*.023,dark);}
 paddle.position.x=.01111;brush.position.x=-.01111;
 cylinder(.004,.005,paddle,0,.005,0,dark);box(.02337,.003,.00635,paddle,0,.002,0);
 for(const x of [-.0108,.0108])box(.0015,.0026,.00635,paddle,x,.0013,0,resin);
 cylinder(.007,.002,brush,0,.003,0,dark);
 const bristles=new T.InstancedMesh(new T.CylinderGeometry(.00012,.00008,.004,3),edge,80),matrix=new T.Object3D();
 for(let i=0;i<80;i++){const a=i*2.399,r=Math.sqrt((i+.5)/80)*.007;matrix.position.set(Math.cos(a)*r,.002,Math.sin(a)*r);matrix.rotation.z=Math.sin(i)*.13;matrix.updateMatrix();bristles.setMatrixAt(i,matrix.matrix);}brush.add(bristles);
 // Asymmetric insulation/cable guard and attachment bracket, as seen in assembly photos.
 const foil=new T.CylinderGeometry(.021,.022,.042,18,8,true,Math.PI*.2,Math.PI*1.25),fp=foil.getAttribute('position');
 for(let i=0;i<fp.count;i++){const y=fp.getY(i),x=fp.getX(i),z=fp.getZ(i),wrinkle=1+.07*Math.sin(i*13.7)+.045*Math.sin(y*700);fp.setXYZ(i,x*wrinkle,y,z*wrinkle);}foil.computeVertexNormals();add(foil,gold,tool,-.013,.083,-.014);
 box(.021,.050,.003,tool,-.025,.084,-.025,edge);
 box(.017,.013,.017,tool,.016,.116,-.01,dark);
 for(let i=0;i<4;i++){
  const points=[new T.Vector3(-.025+i*.0014,.047,-.012),new T.Vector3(-.037+i*.0014,.072,-.022),new T.Vector3(-.029+i*.0014,.103,-.028),new T.Vector3(.014,.119,-.019+i*.0014)];
  add(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.00065,6,false),i===0?gold:dark,tool);
 }
 return {tool,head,brush,feed,paddle,
  animate(time:number,working:boolean,grinding:boolean,depth:number){head.rotation.y=working?time*2.4:head.rotation.y;paddle.rotation.y=grinding?time*48:paddle.rotation.y;brush.rotation.y=working?-time*42:brush.rotation.y;feed.position.y=-depth;},
 };
}
