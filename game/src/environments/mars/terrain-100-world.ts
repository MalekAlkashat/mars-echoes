import { Box3, BufferAttribute, BufferGeometry, Color, FogExp2, InstancedMesh, Mesh, Object3D, Scene, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RockSurface } from '../../core/rock-surface';
import { addAtmosphere } from './atmosphere';
import type { MarsEnvironment } from './dressing';
import { disposeSceneResources } from './resources';
import { setRockGroundPlanes } from './hub-rock-dust';
import { surfaceMaterial, surfaceTexturesReady } from './materials';
import { makeTerrain100, terrain100Height as height, terrainFields, TERRAIN_100 } from './terrain-100';

type Shape='ridge'|'slab'|'block'|'fragment';
type Piece={shape:Shape;x:number;z:number;scale:number;yaw:number;solid:boolean;burial?:number};
const anchors:readonly Piece[]=[
  {shape:'block',x:-8,z:29,scale:1.1,yaw:2.1,solid:true},
  {shape:'slab',x:-13,z:18,scale:1.6,yaw:-.7,solid:true},
  {shape:'fragment',x:11,z:27,scale:1.1,yaw:.8,solid:true},
  {shape:'slab',x:-13,z:-1,scale:1.7,yaw:.5,solid:true},
  {shape:'block',x:14,z:-12,scale:1.1,yaw:-1.3,solid:true},
  {shape:'ridge',x:-29,z:21,scale:2.5,yaw:.4,solid:true},
  {shape:'slab',x:-33,z:4,scale:3.1,yaw:-.5,solid:true},
  {shape:'block',x:-26,z:-17,scale:1.9,yaw:1.1,solid:true},
  {shape:'ridge',x:-35,z:-31,scale:2.4,yaw:-.8,solid:true},
  {shape:'slab',x:26,z:14,scale:3.4,yaw:.2,solid:true},
  {shape:'ridge',x:29,z:-5,scale:3,yaw:-.3,solid:true},
  {shape:'block',x:20,z:-25,scale:1.65,yaw:1.5,solid:true},
  {shape:'slab',x:37,z:-32,scale:2.2,yaw:.75,solid:true},
  {shape:'block',x:-12,z:15,scale:.75,yaw:.6,solid:true},
  {shape:'fragment',x:13,z:-8,scale:.8,yaw:1.3,solid:true},
  // Adjacent embedded slabs join the headland into a broken bedrock edge.
  {shape:'slab',x:23.5,z:15.5,scale:2.3,yaw:.05,solid:true},
  {shape:'ridge',x:28.8,z:12,scale:2.2,yaw:.36,solid:true},
  {shape:'slab',x:31,z:-7,scale:2.1,yaw:-.45,solid:true},
  {shape:'fragment',x:26,z:-8,scale:1.1,yaw:.7,solid:true},
  {shape:'slab',x:-31,z:7,scale:1.8,yaw:-.2,solid:true},
];

export function createTerrain100World():MarsEnvironment {
  const scene=new Scene();scene.name='reference100-authored-Mars-basin';
  scene.background=new Color('#d5ad92');scene.fog=new FogExp2('#d5ad92',.0013);
  scene.add(...makeTerrain100());
  const atmosphere=addAtmosphere(scene,{skyRadius:1200,shadowSize:1024,referenceSky:true});
  const obstacles:MarsEnvironment['obstacles']=[];
  const roverSurface=new RockSurface(height);
  let disposed=false,seed=TERRAIN_100.seed as number;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const pieces:Piece[]=[...anchors];
  // Interlocking, partly buried segments trace two discontinuous exposed margins.
  // Deliberate gaps preserve the sandy aprons and the west overlook approach.
  for(const [side,sections] of [[1,[-27,-23,-18,-13,-8,1,5,9,14,19]],[-1,[-30,-25,-20,-5,0,5,24,29]]] as const){
    sections.forEach((z,i)=>{
      const x=side===1?19+Math.abs(z-1)*.10+(random()-.5)*2:-23-Math.abs(z+10)*.08+(random()-.5)*2;
      pieces.push({shape:i%3===0?'ridge':'slab',x,z,scale:1.55+random()*.75,
        yaw:side*.4+(random()-.5)*.7,solid:true,burial:.42});
      for(let j=0;j<5;j++)pieces.push({shape:j%3===0?'block':'fragment',
        x:x-side*(1+random()*3.5),z:z+(random()-.5)*5,scale:.12+random()*.32,
        yaw:random()*6.283,solid:false,burial:.24});
    });
  }
  // Sediment sorting: coarse fragments gather near exposed shelves, fine grains away from the clear routes.
  for(let i=0;i<1800;i++){
    const x=random()*96-48,z=random()*96-48,f=terrainFields(x,z);
    if(random()>(f.channel>.72?.018:.07+f.exposure*.55))continue;
    const shape:Shape=random()>.65?'block':'fragment';
    pieces.push({shape,x,z,scale:.035+random()**2*.27,yaw:random()*6.283,solid:false});
  }
  const ready=new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}assets/rocks/hub-kit-v1/rock-kit.glb`).then(({scene:source})=>{
    if(disposed){disposeSceneResources(source);return;}
    const kit={} as Record<Shape,BufferGeometry>;
    source.updateMatrixWorld(true);
    source.traverse(object=>{
      if(!(object instanceof Mesh)||!['ridge','slab','block','fragment'].includes(object.name))return;
      const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
      geometry.setAttribute('color',new BufferAttribute(new Float32Array(geometry.getAttribute('position').count*3).fill(1),3));
      geometry.computeBoundingBox();kit[object.name as Shape]=geometry;
    });
    disposeSceneResources(source);
    if(Object.keys(kit).length!==4){Object.values(kit).forEach(g=>g.dispose());throw new Error('Reference terrain rock kit incomplete.');}
    const stone=surfaceMaterial('rock',false,{terrainDust:true});stone.color.set('#b69b80');
    const stoneCompile=stone.onBeforeCompile;
    stone.onBeforeCompile=(shader,renderer)=>{
      stoneCompile.call(stone,shader,renderer);
      shader.uniforms.surfaceGroundTint.value.set('#cc9468').multiply(new Color('#edc7a0'));
      shader.uniforms.surfaceNormalStrength.value=.8;
    };
    stone.customProgramCacheKey=()=> 'reference100-bedrock-v2';
    const transform=new Object3D(),box=new Box3();
    for(const shape of ['ridge','slab','block','fragment'] as const){
      const group=pieces.filter(p=>p.shape===shape),positions:{x:number;z:number}[]=[];
      const batch=new InstancedMesh(kit[shape],stone,group.length);
      group.forEach((p,i)=>{
        const bounds=kit[shape].boundingBox!;
        const width=(bounds.max.x-bounds.min.x)*p.scale,depth=(bounds.max.z-bounds.min.z)*p.scale;
        let base=height(p.x,p.z);
        for(const dx of [-.4,0,.4])for(const dz of [-.4,0,.4])base=Math.min(base,height(p.x+dx*width,p.z+dz*depth));
        transform.position.set(p.x,base-bounds.min.y*p.scale-p.scale*(p.burial??(p.solid?.24:.12)),p.z);
        transform.rotation.set(0,p.yaw,0);transform.scale.setScalar(p.scale);transform.updateMatrix();
        batch.setMatrixAt(i,transform.matrix);positions.push({x:p.x,z:p.z});
        if(p.solid){
          box.copy(bounds).applyMatrix4(transform.matrix);
          const cx=(box.min.x+box.max.x)*.5,cz=(box.min.z+box.max.z)*.5;
          obstacles.push({x:cx,z:cz,radius:Math.max(box.max.x-box.min.x,box.max.z-box.min.z)*.48,kind:'rock'});
        }
      });
      setRockGroundPlanes(kit[shape],positions,height);
      batch.name=`reference100-${shape}-instances`;batch.receiveShadow=true;
      // Tiny debris receives nearby shadows but does not generate another full terrain-sized shadow pass.
      batch.castShadow=shape!=='fragment';batch.computeBoundingSphere();scene.add(batch);
    }
    scene.userData.layout.rockInstances=pieces.length;
    roverSurface.bake(scene);
    return surfaceTexturesReady();
  });
  const spawn=new Vector3(TERRAIN_100.spawn[0],height(...TERRAIN_100.spawn),TERRAIN_100.spawn[1]);
  scene.userData.layout={units:'metres',up:'+Y',forward:'-Z',width:100,depth:100,seed:TERRAIN_100.seed,
    spawn:spawn.toArray(),rover:TERRAIN_100.rover,mainRoute:TERRAIN_100.mainRoute,sideRoute:TERRAIN_100.sideRoute,
    terrain:'reference100-v1',decorativeWrecks:0};
  return {scene,height,obstacles,spawn,bounds:TERRAIN_100,roverSurface,
    ready:Promise.all([ready,surfaceTexturesReady()]).then(()=>undefined),
    setupEnvironment:atmosphere.setupEnvironment,follow:atmosphere.follow,tick(time){atmosphere.tick(time);},
    dispose(){if(disposed)return;disposed=true;roverSurface.clear();atmosphere.dispose();disposeSceneResources(scene);},
  };
}
