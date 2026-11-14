import * as T from 'three';
import { disposeSceneResources } from '../../../../../environments/mars/resources';

const base=`${import.meta.env.BASE_URL}assets/missions/blueberry-clue/v1/`;
export const WORK=new T.Vector3(0,0,-1.5);
export const MACRO=new T.Vector3(30,2,0);
export {sampleHeight} from './surface';
import {createGroundGeometry,sampleHeight} from './surface';
function slabGeometry(width:number,depth:number,thickness:number,seed:number){
 const vertices:number[]=[],uv:number[]=[],indices:number[]=[];const segments=32,layers=12;
 for(let j=0;j<=layers;j++)for(let i=0;i<segments;i++){
  const a=i/segments*Math.PI*2;const edge=1+.07*Math.sin(a*5+seed)+.035*Math.cos(a*11-seed);
  const lip=1+.025*Math.sin(j*2.7+seed)+.018*Math.sin(j*1.3+a*2);
  const x=Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.65)*width*.5*edge*lip,z=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.65)*depth*.5*edge*lip;
  const y=j/layers*thickness+Math.min(.002,thickness*.035)*Math.sin(a*4+seed);
  vertices.push(x,y,z);uv.push((a/Math.PI*2)*width/.3,j/layers*thickness/.3);
  if(j<layers){const k=j*segments+i,n=j*segments+(i+1)%segments;indices.push(k,n,k+segments,n,n+segments,k+segments);}
 }
 const center=vertices.length/3;vertices.push(0,thickness,0);uv.push(0,0);
 const rim=vertices.length/3;
 for(let i=0;i<segments;i++){const k=(layers*segments+i)*3;vertices.push(vertices[k],vertices[k+1],vertices[k+2]);uv.push(vertices[k]/.3,vertices[k+2]/.3);}
 for(let i=0;i<segments;i++)indices.push(center,rim+(i+1)%segments,rim+i);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
function piece(g:T.BufferGeometry,m:T.Material,parent:T.Object3D,x=0,y=0,z=0){const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;}
export async function createDiscoveryArt(signal:AbortSignal){
 const scene=new T.Scene();scene.background=new T.Color('#b7a18b');scene.fog=new T.Fog('#b7a18b',25,85);
 const textures:T.Texture[]=[];
 const loader=new T.TextureLoader();
 const maps=await Promise.allSettled(['laminated-rock','fine-sand'].map(async name=>{
  const result=await Promise.allSettled(['color.jpg','normal.png','roughness.jpg'].map(async suffix=>{
   const map=await loader.loadAsync(base+name+'-'+suffix);textures.push(map);map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;if(suffix==='color.jpg')map.colorSpace=T.SRGBColorSpace;return map;
  }));
  const error=result.find(r=>r.status==='rejected');if(error?.status==='rejected')throw error.reason;
  return result.map(r=>(r as PromiseFulfilledResult<T.Texture>).value);
 }));
 const failure=maps.find(r=>r.status==='rejected');
 if(failure||signal.aborted){textures.forEach(t=>t.dispose());throw failure?.status==='rejected'?failure.reason:new DOMException('Cancelled','AbortError');}
 const [rm,sm]=maps.map(r=>(r as PromiseFulfilledResult<T.Texture[]>).value);
 const rock=new T.MeshStandardMaterial({map:rm[0],normalMap:rm[1],roughnessMap:rm[2],roughness:.96,normalScale:new T.Vector2(.55,.55)});
 const sand=new T.MeshStandardMaterial({map:sm[0],normalMap:sm[1],roughnessMap:sm[2],roughness:1,normalScale:new T.Vector2(.25,.25)});
 const terrain=createGroundGeometry();
 const ground=piece(terrain,sand,scene);ground.name='eagle-authored-basin';ground.castShadow=false;
 const sun=new T.DirectionalLight('#fff0dd',2.7);sun.position.set(-8,12,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-14;sun.shadow.camera.right=14;sun.shadow.camera.top=14;sun.shadow.camera.bottom=-14;sun.shadow.bias=-.0002;sun.shadow.normalBias=.015;scene.add(sun,sun.target);
 scene.add(new T.HemisphereLight('#ddd0bb','#6b4d34',2));
 const outcrop=new T.Group();outcrop.position.set(0,0,-3.8);scene.add(outcrop);
 for(let i=0;i<8;i++){
  const x=(i%4-1.5)*.7,z=Math.floor(i/4)*.6;
  const m=piece(slabGeometry(.85,.8,.14+(i%3)*.04,i+2),rock,outcrop,x,.01,z);m.rotation.set(.03*Math.sin(i),i*.33,.025*Math.cos(i));
 }
 // A low broken outcrop arc frames the approach; no generic rounded hero boulders.
 for(let i=0;i<36;i++){const a=i*.19;const x=Math.sin(a)*11,z=Math.cos(a)*11;const m=piece(slabGeometry(.6+(i%4)*.18,.6,.12,i),rock,scene,x,sampleHeight(x,z)-.02,z);m.rotation.y=a;m.castShadow=i%3===0;}
 const macro=new T.Group();macro.position.copy(MACRO);macro.visible=false;scene.add(macro);
 const sample=piece(slabGeometry(.24,.19,.025,7),rock,macro);sample.name='centimetre-scale-layered-specimen';
 const berries=new T.InstancedMesh(new T.SphereGeometry(1,12,8),new T.MeshStandardMaterial({color:'#625f56',roughness:.78}),120);
 const transform=new T.Object3D();let seed=82;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<120;i++){
  let x=(random()-.5)*.19,z=(random()-.5)*.14;
  if(i<70){x=.055+(random()-.5)*.035;z=.025+(random()-.5)*.045;}
  if(Math.hypot(x+.045,z)<.025){x+=.065;z+=.025;}
  const radius=.0015+random()*.001;transform.position.set(x,.025+radius*.65,z);transform.scale.set(radius,radius*.9,radius);transform.updateMatrix();berries.setMatrixAt(i,transform.matrix);
 }berries.castShadow=true;berries.receiveShadow=true;macro.add(berries);
 const patchMat=new T.MeshStandardMaterial({color:'#e0d6bf',roughness:1,map:rm[0]});
 const patch=piece(new T.CircleGeometry(.02275,64),patchMat,macro,-.045,.026,0);patch.rotation.x=-Math.PI/2;
 // The cut specimen has a real hole; the recessed floor supplies the 4.4 mm depth.
 const outline=new T.Shape();outline.moveTo(-.12,-.095);outline.lineTo(.12,-.095);outline.lineTo(.12,.095);outline.lineTo(-.12,.095);outline.closePath();
 const aperture=new T.Path();aperture.absarc(-.045,0,.02275,0,Math.PI*2,true);outline.holes.push(aperture);
 const cut=piece(new T.ExtrudeGeometry(outline,{depth:.025,bevelEnabled:false,curveSegments:48}),rock,macro);cut.rotation.x=-Math.PI/2;cut.visible=false;

 const tool=new T.Group();tool.position.set(-.045,.15,0);macro.add(tool);
 const metal=new T.MeshStandardMaterial({color:'#9ca0a1',metalness:.85,roughness:.3});
 const dark=new T.MeshStandardMaterial({color:'#343735',metalness:.5,roughness:.65});
 const foil=new T.MeshStandardMaterial({color:'#a78332',metalness:.8,roughness:.43});
 piece(new T.CylinderGeometry(.025,.026,.038,40),metal,tool,0,.032,0);
 piece(new T.CylinderGeometry(.029,.029,.004,48),metal,tool,0,.012,0);
 piece(new T.CylinderGeometry(.021,.021,.009,48),dark,tool,0,.005,0);
 const head=new T.Group();tool.add(head);
 for(const x of [-.011,.011])piece(new T.BoxGeometry(.009,.003,.012),metal,head,x,0,0);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;piece(new T.CylinderGeometry(.0018,.0018,.003,6),dark,tool,Math.cos(a)*.024,.015,Math.sin(a)*.024);}
 const collar=piece(new T.TorusGeometry(.034,.0018,8,48),metal,tool,0,.009,0);collar.rotation.x=Math.PI/2;
 for(const x of [-.032,.032])piece(new T.BoxGeometry(.004,.048,.005),metal,tool,x,.035,0);
 piece(new T.CylinderGeometry(.018,.018,.043,32),foil,tool,.016,.071,0);
 for(let i=0;i<9;i++){const ring=piece(new T.TorusGeometry(.0185,.0007,5,32),dark,tool,.016,.052+i*.004,0);ring.rotation.x=Math.PI/2;}
 piece(new T.BoxGeometry(.025,.025,.023),metal,tool,-.019,.065,0);
 for(let i=0;i<4;i++){const z=(i%2-.5)*.019,y=.058+Math.floor(i/2)*.016;const bolt=piece(new T.CylinderGeometry(.0015,.0015,.002,6),dark,tool,-.032,y,z);bolt.rotation.z=Math.PI/2;}
 for(const x of [-.027,.027]){piece(new T.BoxGeometry(.004,.028,.013),metal,tool,x,.032,0);const bolt=piece(new T.CylinderGeometry(.002,.002,.005,8),dark,tool,x,.025,.008);bolt.rotation.x=Math.PI/2;}
 for(let i=0;i<3;i++){const curve=new T.CatmullRomCurve3([new T.Vector3(-.02,.07,-.012+i*.002),new T.Vector3(-.031,.09,-.016+i*.002),new T.Vector3(.003,.094,-.015+i*.002)]);piece(new T.TubeGeometry(curve,16,.00065,5,false),dark,tool);}

 const brush=new T.Group();tool.add(brush);
 for(let i=0;i<48;i++){const a=i/48*Math.PI*2;piece(new T.CylinderGeometry(.00025,.00015,.008,3),dark,brush,Math.cos(a)*.02,-.003,Math.sin(a)*.02);}
 const dust=new T.Points(new T.BufferGeometry(),new T.PointsMaterial({color:'#cfb392',size:.0007,transparent:true,opacity:.65,depthWrite:false}));
 const points=new Float32Array(80*3);dust.geometry.setAttribute('position',new T.BufferAttribute(points,3));macro.add(dust);
 const water=piece(new T.PlaneGeometry(.27,.22,24,24),new T.MeshStandardMaterial({color:'#698b91',transparent:true,opacity:.28,roughness:.25,depthWrite:false,side:T.DoubleSide}),macro,0,.031,0);water.rotation.x=-Math.PI/2;water.visible=false;
 const sediment=new T.Group();macro.add(sediment);sediment.visible=false;
 for(let i=0;i<5;i++){
  const material=new T.MeshStandardMaterial({color:i%2?'#a99577':'#b7a589',roughness:.93,map:rm[0]});
  piece(new T.BoxGeometry(.24,.006,.19),material,sediment,0,-.025+i*.009,0);
 }
 const flow=new T.Points(new T.BufferGeometry(),new T.PointsMaterial({color:'#b6d4d2',size:.0016,transparent:true,opacity:.65,depthWrite:false}));
 const flowPoints=new Float32Array(120*3);flow.geometry.setAttribute('position',new T.BufferAttribute(flowPoints,3));sediment.add(flow);
 const mineralMaterial=new T.MeshStandardMaterial({color:'#69655a',roughness:.85,transparent:true,opacity:0});
 const deposits=new T.InstancedMesh(new T.SphereGeometry(1,12,8),mineralMaterial,32);sediment.add(deposits);
 for(let i=0;i<32;i++){transform.position.set((random()-.5)*.22,-.02+random()*.038,.095);const r=.0015+random()*.001;transform.scale.setScalar(r);transform.updateMatrix();deposits.setMatrixAt(i,transform.matrix);}
 const macroLight=new T.DirectionalLight('#fff1da',2.5);macroLight.position.copy(MACRO).add(new T.Vector3(-1,2,1));macroLight.target=macro;scene.add(macroLight);macroLight.visible=false;macroLight.castShadow=true;macroLight.shadow.mapSize.set(1024,1024);macroLight.shadow.camera.left=-.25;macroLight.shadow.camera.right=.25;macroLight.shadow.camera.top=.25;macroLight.shadow.camera.bottom=-.25;macroLight.shadow.camera.near=.1;macroLight.shadow.camera.far=5;macroLight.shadow.bias=-.00002;macroLight.shadow.normalBias=.0001;
 let env:T.WebGLRenderTarget|undefined;
 return {scene,macro,tool,head,brush,patch,cut,sample,berries,water,sediment,dust,sun,
  setup(renderer:T.WebGLRenderer){const sky=new T.Scene();sky.background=new T.Color('#c2b3a0');const pmrem=new T.PMREMGenerator(renderer);env=pmrem.fromScene(sky,.04,.1,100);scene.environment=env.texture;pmrem.dispose();},
  showMacro(value:boolean){macro.visible=value;macroLight.visible=value;sun.visible=!value;ground.visible=!value;outcrop.visible=!value;scene.children.forEach(o=>{if(o instanceof T.Mesh&&o!==ground)o.visible=!value;});},
  interpret(elapsed:number,reduce:boolean){
   const t=reduce?7:elapsed;mineralMaterial.opacity=T.MathUtils.clamp((t-3)/4,0,1);
   water.position.y=.034+Math.sin(t*.4)*.003;
   (water.material as T.MeshStandardMaterial).opacity=.15+.15*Math.sin(Math.min(t/12,1)*Math.PI);
   sediment.children.forEach((o,i)=>{if(o instanceof T.Mesh&&!(o instanceof T.InstancedMesh))o.position.y=-.025+i*.009+(reduce?0:Math.max(0,3-t)*.003*i);});
   for(let i=0;i<120;i++){flowPoints[i*3]=((i*.017+t*.013)%.24)-.12;flowPoints[i*3+1]=-.02+(i%5)*.009;flowPoints[i*3+2]=Math.sin(i*17.2)*.09;}
   flow.geometry.getAttribute('position').needsUpdate=true;
  },
  tick(time:number,working:boolean,grinding:boolean){head.rotation.y=grinding?time*18:0;dust.visible=working;for(let i=0;i<80;i++){const a=i*2.4,t=(time*.7+i*.012)%1;points[i*3]=-.045+Math.cos(a)*t*.035;points[i*3+1]=.027+Math.sin(t*Math.PI)*.012;points[i*3+2]=Math.sin(a)*t*.035;}dust.geometry.getAttribute('position').needsUpdate=true;},
  dispose(){env?.dispose();disposeSceneResources(scene);},
 };
}
