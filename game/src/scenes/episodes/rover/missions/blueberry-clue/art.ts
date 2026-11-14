import * as T from 'three';
import {specimenGeometry,outcropGeometry,stoneMaterial,addConcretions,CUT_DEPTH} from './geology';
import {createRAT} from './rat';
import {createReconstruction} from './reconstruction';
import {SITE,SLABS,siteObstacles} from './site';
import { disposeSceneResources } from '../../../../../environments/mars/resources';

const base=`${import.meta.env.BASE_URL}assets/missions/blueberry-clue/v1/`;
export const WORK=new T.Vector3(SITE.work[0],0,SITE.work[1]);
export const MACRO=new T.Vector3(30,2,0);
export {sampleHeight} from './surface';
import {createGroundGeometry,sampleHeight} from './surface';
function piece(g:T.BufferGeometry,m:T.Material,parent:T.Object3D,x=0,y=0,z=0){const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;}
export async function createDiscoveryArt(signal:AbortSignal){
 const scene=new T.Scene();scene.background=new T.Color('#b7a18b');scene.fog=new T.Fog('#b7a18b',25,85);
 const textures:T.Texture[]=[];
 const loader=new T.TextureLoader();
 const maps=await Promise.allSettled(['fine-sand'].map(async name=>{
  const result=await Promise.allSettled(['color.jpg','normal.png','roughness.jpg'].map(async suffix=>{
   const map=await loader.loadAsync(base+name+'-'+suffix);textures.push(map);map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;if(suffix==='color.jpg')map.colorSpace=T.SRGBColorSpace;return map;
  }));
  const error=result.find(r=>r.status==='rejected');if(error?.status==='rejected')throw error.reason;
  return result.map(r=>(r as PromiseFulfilledResult<T.Texture>).value);
 }));
 const failure=maps.find(r=>r.status==='rejected');
 if(failure||signal.aborted){textures.forEach(t=>t.dispose());throw failure?.status==='rejected'?failure.reason:new DOMException('Cancelled','AbortError');}
 const detailed=await Promise.allSettled(['color.jpg','normal.jpg','roughness.jpg','ao.jpg'].map(async(name)=>{const t=await loader.loadAsync(`${import.meta.env.BASE_URL}assets/surfaces/rock/${name}`);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(name==='color.jpg')t.colorSpace=T.SRGBColorSpace;textures.push(t);return t;}));
 const failedDetail=detailed.find(r=>r.status==='rejected');
 if(failedDetail||signal.aborted){textures.forEach(t=>t.dispose());throw failedDetail?.status==='rejected'?failedDetail.reason:new DOMException('Cancelled','AbortError');}
 const detail=detailed.map(r=>(r as PromiseFulfilledResult<T.Texture>).value);
 const [sm]=maps.map(r=>(r as PromiseFulfilledResult<T.Texture[]>).value);
 const rock=stoneMaterial(false,detail);
 const sand=new T.MeshStandardMaterial({map:sm[0],normalMap:sm[1],roughnessMap:sm[2],roughness:1,normalScale:new T.Vector2(.25,.25),vertexColors:true});
 const terrain=createGroundGeometry();
 const ground=piece(terrain,sand,scene);ground.name='eagle-authored-basin';ground.castShadow=false;
 const sun=new T.DirectionalLight('#fff0dd',2.7);sun.position.set(-8,12,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-14;sun.shadow.camera.right=14;sun.shadow.camera.top=14;sun.shadow.camera.bottom=-14;sun.shadow.bias=-.0002;sun.shadow.normalBias=.015;scene.add(sun,sun.target);
 const fill=new T.HemisphereLight('#ddd0bb','#66503b',.9);scene.add(fill);
 const outcrop=new T.Group();outcrop.name='eagle-west-exposure';scene.add(outcrop);
 SLABS.forEach((s,i)=>{
  const geometry=outcropGeometry(s.width,s.depth,s.height,i+2),uv=geometry.getAttribute('uv');
  for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)+i*.173,uv.getY(j)+i*.271);
  const m=piece(geometry,rock,outcrop,s.x,sampleHeight(s.x,s.z)-s.burial,s.z);m.name=s.id;m.rotation.y=s.yaw;
 });
 // Thin nonblocking flakes collect beside exposures, not around the basin perimeter.
 const chips=new T.InstancedMesh(new T.DodecahedronGeometry(.1,0).scale(1,.12,.7),rock,168),chipPose=new T.Object3D();
 for(let i=0;i<chips.count;i++){
  const s=SLABS[i%SLABS.length],a=i*2.399,r=.55+(Math.sin(i*71.7)*.5+.5)*1.35;
  const x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r;
  chipPose.position.set(x,sampleHeight(x,z)-.007,z);chipPose.rotation.set(0,a,0);chipPose.scale.setScalar(.55+(i%7)*.13);chipPose.updateMatrix();chips.setMatrixAt(i,chipPose.matrix);
 }chips.receiveShadow=true;outcrop.add(chips);
 const macro=new T.Group();macro.position.copy(MACRO);macro.visible=false;scene.add(macro);
 const sample=piece(specimenGeometry(),rock,macro);sample.name='centimetre-scale-layered-specimen';
 const berries=addConcretions(macro);
 const surround=new T.PlaneGeometry(1.8,1.8);surround.rotateX(-Math.PI/2);surround.setAttribute('color',new T.BufferAttribute(new Float32Array(surround.getAttribute('position').count*3).fill(1),3));const su=surround.getAttribute('uv');for(let i=0;i<su.count;i++)su.setXY(i,su.getX(i)*6,su.getY(i)*6);piece(surround,sand,macro,0,.005,0).castShadow=false;
 for(let i=0;i<13;i++){const a=i*2.4,r=.22+(i%3)*.07;const m=piece(outcropGeometry(.06+(i%3)*.03,.08,.008+(i%4)*.003,i),rock,macro,Math.cos(a)*r,.001,Math.sin(a)*r);m.rotation.set(Math.sin(i)*.1,a,Math.cos(i)*.13);}

 const patchMat=stoneMaterial(true,detail);patchMat.transparent=true;patchMat.opacity=.72;patchMat.depthWrite=false;
 const patch=piece(new T.CircleGeometry(.02275,96),patchMat,macro,-.045,.02503,0);patch.rotation.x=-Math.PI/2;
 const cut=piece(specimenGeometry(true),rock,macro);cut.visible=false;
 const rest=sample.geometry.getAttribute('position'),cutPos=cut.geometry.getAttribute('position'),cutRest=Float32Array.from(cutPos.array);let lastDepth=-1;
 // Fine circular machining marks stay inside the true shallow excavation.
 const scratches=new T.Group();cut.add(scratches);
 const interior=piece(new T.CircleGeometry(.02274,96),stoneMaterial(true),scratches,-.045,.02065,0);interior.rotation.x=-Math.PI/2;interior.castShadow=false;
 const scratchMat=new T.MeshStandardMaterial({color:'#b9a087',roughness:.82,transparent:true,opacity:.3,depthWrite:false});
 for(let i=0;i<18;i++){const ring=piece(new T.TorusGeometry(.002+i*.0011,.000035,3,96,Math.PI*1.85),scratchMat,scratches,-.045,.02070,0);ring.rotation.x=-Math.PI/2;ring.rotation.z=i*.61;ring.castShadow=false;}
 const rat=createRAT();const {tool,head,brush}=rat;tool.position.set(-.045,.07,0);macro.add(tool);
 const dust=new T.Points(new T.BufferGeometry(),new T.PointsMaterial({color:'#cfb392',size:.0007,transparent:true,opacity:.65,depthWrite:false}));
 const points=new Float32Array(80*3);dust.geometry.setAttribute('position',new T.BufferAttribute(points,3));macro.add(dust);
 const reconstruction=createReconstruction(macro,rock,sand,berries);
 const macroLight=new T.DirectionalLight('#fff1dd',3.2);macroLight.position.copy(MACRO).add(new T.Vector3(-.5,1,1.4));macroLight.target=macro;scene.add(macroLight);macroLight.visible=false;macroLight.castShadow=true;macroLight.shadow.mapSize.set(1024,1024);macroLight.shadow.camera.left=-.25;macroLight.shadow.camera.right=.25;macroLight.shadow.camera.top=.25;macroLight.shadow.camera.bottom=-.25;macroLight.shadow.camera.near=.1;macroLight.shadow.camera.far=5;macroLight.shadow.bias=-.00002;macroLight.shadow.normalBias=.0001;
 const rim=new T.DirectionalLight('#e6e1d6',1.5);rim.position.copy(MACRO).add(new T.Vector3(1,.7,-1));rim.target=macro;scene.add(rim);rim.visible=false;
 let env:T.WebGLRenderTarget|undefined;
 return {scene,macro,tool,head,brush,patch,cut,sample,berries,reconstruction,dust,sun,obstacles:siteObstacles(),
  setup(renderer:T.WebGLRenderer){const sky=new T.Scene();const dome=new T.Mesh(new T.SphereGeometry(10,32,16),new T.ShaderMaterial({side:T.BackSide,vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 direction;void main(){vec3 d=normalize(direction);vec3 c=mix(vec3(.12,.085,.055),vec3(.65,.62,.54),smoothstep(-.2,.5,d.y));c+=vec3(4.,3.6,3.)*pow(max(0.,dot(d,normalize(vec3(-1.,1.3,.7)))),130.);gl_FragColor=vec4(c,1.);}'}));sky.add(dome);const pmrem=new T.PMREMGenerator(renderer);env=pmrem.fromScene(sky,.04,.1,100);scene.environment=env.texture;pmrem.dispose();dome.geometry.dispose();dome.material.dispose();},
  abrade(depth:number){if(Math.abs(lastDepth-depth)<.005)return;lastDepth=depth;scratches.position.y=(1-depth)*CUT_DEPTH;for(let i=0;i<cutPos.count;i++)cutPos.setY(i,T.MathUtils.lerp(rest.getY(i),cutRest[i*3+1],depth));cutPos.needsUpdate=true;cut.geometry.computeVertexNormals();},
  showMacro(value:boolean){rim.visible=value;macro.visible=value;macroLight.visible=value;sun.visible=!value;ground.visible=!value;outcrop.visible=!value;scene.children.forEach(o=>{if(o instanceof T.Mesh&&o!==ground)o.visible=!value;});},
  interpret(active:boolean,elapsed:number,reduce:boolean){return reconstruction.update(active,elapsed,reduce);},
  tick(time:number,working:boolean,grinding:boolean,depth=0){rat.animate(time,working,grinding,depth*CUT_DEPTH);dust.visible=working;for(let i=0;i<80;i++){const a=i*2.4,t=(time*.7+i*.012)%1;points[i*3]=-.045+Math.cos(a)*t*.035;points[i*3+1]=.027+Math.sin(t*Math.PI)*.012;points[i*3+2]=Math.sin(a)*t*.035;}dust.geometry.getAttribute('position').needsUpdate=true;},
  dispose(){textures.forEach(t=>t.dispose());env?.dispose();disposeSceneResources(scene);},
 };
}
