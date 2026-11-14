import { Box3, BufferAttribute, BufferGeometry, Color, InstancedMesh, Mesh, MeshStandardMaterial, Object3D, Quaternion, Raycaster, Scene, SRGBColorSpace, Texture, TextureLoader, Vector3 } from 'three';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { populateHubOutcrops, type RockKit } from './hub-outcrops.ts';
import { setRockGroundPlanes } from './hub-rock-dust.ts';
import { disposeSceneResources } from './resources.ts';
import { noise } from './terrain.ts';

type Solid={x:number;z:number;radius:number};
type Scatter={x:number;z:number;size:number;yaw:number};
const shapes=['ridge','slab','block','fragment'] as const;
type SizedScatter=Scatter&{diameter:number};

/** Keep the spawn, memory entrance and their central approach clear of large stones. */
function approachClearance(x:number,z:number):number {
  return Math.min(Math.abs(x)-5,Math.hypot(x,z-8)-2.5,Math.hypot(x,z+25)-4);
}

function scatterSizes(scatter:readonly Scatter[]):SizedScatter[] {
  return scatter.filter((_,i)=>i%2===0).map((spec,i)=>{
    const variation=noise(spec.x*.73+29,spec.z*.73-17);
    const tier=i%13;
    // Preserve small stones instead of enlarging every instance by the same amount.
    let diameter=tier===0?1.75+variation*.5:tier<4?.78+variation*.45
      :.30+Math.sqrt(Math.min(1,Math.max(0,spec.size)))*.36;
    if(approachClearance(spec.x,spec.z)<diameter*.7)diameter=Math.min(diameter,.38);
    return {...spec,diameter};
  });
}

/** Sample occupied columns so wide/irregular boulders do not get invisible circular walls. */
function addScatterCollision(mesh:Mesh,obstacles:Solid[],height:(x:number,z:number)=>number):void {
  const bounds=new Box3().setFromObject(mesh),ray=new Raycaster(new Vector3(),new Vector3(0,-1,0));
  const spacing=.30;
  for(let x=bounds.min.x+.08;x<bounds.max.x;x+=spacing)for(let z=bounds.min.z+.08;z<bounds.max.z;z+=spacing){
    ray.ray.origin.set(x,bounds.max.y+1,z);
    const hit=ray.intersectObject(mesh,false)[0];
    if(hit&&hit.point.y>height(x,z)+.22)obstacles.push({x,z,radius:.215});
  }
}

/** Eight-face chips use support vertices and UVs from the supplied fragment, not a new rock asset. */
function gravelChip(source:BufferGeometry,variant:number):BufferGeometry {
  const positions=source.getAttribute('position'),uvs=source.getAttribute('uv');
  const angle=variant*.71,c=Math.cos(angle),s=Math.sin(angle);
  const directions=[[1,.08,0],[-1,.05,0],[0,1,0],[0,-1,0],[0,.10,1],[0,.10,-1]];
  const selected:number[]=[],vertices:Vector3[]=[];
  for(const [x,y,z] of directions){
    const direction=new Vector3(x*c-z*s,y,x*s+z*c);
    let best=0,score=-Infinity;
    for(let i=0;i<positions.count;i++){
      const next=positions.getX(i)*direction.x+positions.getY(i)*direction.y+positions.getZ(i)*direction.z;
      if(next>score){score=next;best=i;}
    }
    if(!selected.includes(best)){selected.push(best);vertices.push(new Vector3().fromBufferAttribute(positions,best));}
  }
  const geometry=new ConvexGeometry(vertices),result=geometry.getAttribute('position');
  const transferredUV=new Float32Array(result.count*2);
  for(let i=0;i<result.count;i++){
    const point=new Vector3().fromBufferAttribute(result,i);
    const sourceIndex=selected[vertices.reduce((best,next,j)=>point.distanceToSquared(next)<point.distanceToSquared(vertices[best])?j:best,0)];
    transferredUV.set([uvs.getX(sourceIndex),uvs.getY(sourceIndex)],i*2);
  }
  geometry.setAttribute('uv',new BufferAttribute(transferredUV,2));
  geometry.setAttribute('color',new BufferAttribute(new Float32Array(result.count*3).fill(1),3));
  geometry.computeBoundingBox();
  const bounds=geometry.boundingBox!,size=bounds.getSize(new Vector3()),width=Math.max(size.x,size.z);
  geometry.translate(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
  geometry.scale(1/width,1/width,1/width);
  return geometry;
}

function populateGravel(scene:Scene,height:(x:number,z:number)=>number,source:BufferGeometry,material:MeshStandardMaterial){
  let seed=420319;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const deposits:Array<Array<Scatter&{tone:number}>>=Array.from({length:4},()=>[]);
  // Jittered cells eliminate rows; broad patch noise leaves sandy gaps between stony deposits.
  for(let gx=-68;gx<68;gx+=.9)for(let gz=-68;gz<68;gz+=.9){
    const x=gx+(random()-.5)*.86,z=gz+(random()-.5)*.86;
    if(Math.hypot(x,z)>68)continue;
    const density=.15+noise(x*.12+31,z*.12-8)*.70;
    if(random()>density||Math.hypot(x,z-8)<.85||Math.hypot(x,z+25)<1.65)continue;
    deposits[(x<0?0:1)+(z<0?0:2)].push({x,z,size:.03+random()**1.55*.15,
      yaw:random()*Math.PI*2,tone:.62+random()*.48});
  }
  const pose=new Object3D(),up=new Vector3(0,1,0),slope=new Vector3(),rotation=new Quaternion(),color=new Color();
  let count=0,triangles=0,minimum=Infinity,maximum=0;
  deposits.forEach((pieces,index)=>{
    const geometry=gravelChip(source,index%2);
    setRockGroundPlanes(geometry,pieces,height);
    const batch=new InstancedMesh(geometry,material,pieces.length);
    batch.name=`supplied-mars-gravel-${index}`;
    pieces.forEach((spec,i)=>{
      const dx=(height(spec.x+.2,spec.z)-height(spec.x-.2,spec.z))/.4;
      const dz=(height(spec.x,spec.z+.2)-height(spec.x,spec.z-.2))/.4;
      pose.quaternion.setFromUnitVectors(up,slope.set(-dx,1,-dz).normalize());
      pose.quaternion.multiply(rotation.setFromAxisAngle(up,spec.yaw));
      pose.scale.set(spec.size,spec.size*(.55+noise(spec.x+7,spec.z+19)*.5),spec.size*(.65+noise(spec.x+29,spec.z)*.4));
      pose.position.set(spec.x,height(spec.x,spec.z)-spec.size*.10,spec.z);pose.updateMatrix();
      batch.setMatrixAt(i,pose.matrix);batch.setColorAt(i,color.setRGB(spec.tone,spec.tone*.96,spec.tone*.89));
      minimum=Math.min(minimum,spec.size);maximum=Math.max(maximum,spec.size);
    });
    batch.castShadow=false;batch.receiveShadow=true;batch.computeBoundingSphere();scene.add(batch);
    count+=pieces.length;triangles+=geometry.getAttribute('position').count/3*pieces.length;
  });
  return {count,batches:deposits.length,triangles,minDiameter:minimum,maxDiameter:maximum};
}

/** Source UVs and the supplied DirectX normal map are retained; contact dust joins the ground. */
export function suppliedRockMaterial(color:Texture,normal:Texture):MeshStandardMaterial {
  color.colorSpace=SRGBColorSpace;color.anisotropy=normal.anisotropy=4;
  const material=new MeshStandardMaterial({name:'user-mars-rocks-uv-pbr',map:color,normalMap:normal,
    color:'#e2c7ad',roughness:.97,metalness:0});
  material.normalScale.set(.65,-.65);
  material.onBeforeCompile=shader=>{
    shader.uniforms.marsDustTint={value:new Color('#b76e36')};
    shader.vertexShader=`attribute vec3 rockGroundPlane;varying vec3 vMarsRockPosition;varying float vMarsGround;\n${shader.vertexShader}`;
    shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
      vec4 rockWorld=vec4(transformed,1.0);
      #ifdef USE_INSTANCING
        rockWorld=instanceMatrix*rockWorld;
      #endif
      vMarsRockPosition=(modelMatrix*rockWorld).xyz;
      vMarsGround=rockGroundPlane.x+dot(rockGroundPlane.yz,vMarsRockPosition.xz);`);
    shader.fragmentShader=`uniform vec3 marsDustTint;varying vec3 vMarsRockPosition;varying float vMarsGround;\n${shader.fragmentShader}`;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float contactDust=1.0-smoothstep(.015,.32,max(0.0,vMarsRockPosition.y-vMarsGround));
      diffuseColor.rgb=mix(diffuseColor.rgb,marsDustTint,contactDust*.55);`);
  };
  material.customProgramCacheKey=()=> 'user-mars-rock-contact-v1';
  return material;
}

/** Graded loose stones and patchy gravel retain the six authored landmark sites. */
export function populateSuppliedRocks(scene:Scene,obstacles:Solid[],height:(x:number,z:number)=>number,
  kit:RockKit,material:MeshStandardMaterial,scatter:readonly Scatter[]):void {
  populateHubOutcrops(scene,obstacles,height,material,kit);
  const placements=scatterSizes(scatter);
  const pose=new Object3D(),up=new Vector3(0,1,0),slope=new Vector3(),point=new Vector3(),rotation=new Quaternion();
  shapes.forEach((shape,index)=>{
    const pieces=placements.filter((_,i)=>i%shapes.length===index);
    const geometry=kit[shape].clone();geometry.computeBoundingBox();
    const size=geometry.boundingBox!.getSize(new Vector3());
    geometry.scale(1/Math.max(size.x,size.z),1/Math.max(size.x,size.z),1/Math.max(size.x,size.z));
    setRockGroundPlanes(geometry,pieces,height);
    const batch=new InstancedMesh(geometry,material,pieces.length);
    batch.name=`supplied-mars-scatter-${shape}`;
    pieces.forEach((spec,i)=>{
      const diameter=spec.diameter;
      const dx=(height(spec.x+.3,spec.z)-height(spec.x-.3,spec.z))/.6;
      const dz=(height(spec.x,spec.z+.3)-height(spec.x,spec.z-.3))/.6;
      pose.quaternion.setFromUnitVectors(up,slope.set(-dx,1,-dz).normalize());
      pose.quaternion.multiply(rotation.setFromAxisAngle(up,spec.yaw));
      pose.scale.setScalar(diameter);pose.position.set(spec.x,0,spec.z);pose.updateMatrix();
      const vertices=geometry.getAttribute('position'),floor=geometry.boundingBox!.min.y;
      let base=Infinity;
      for(let v=0;v<vertices.count;v++){
        if(vertices.getY(v)>floor+.005)continue;
        point.fromBufferAttribute(vertices,v).applyMatrix4(pose.matrix);
        base=Math.min(base,height(point.x,point.z)-point.y);
      }
      pose.position.y=base-diameter*.09;pose.updateMatrix();
      batch.setMatrixAt(i,pose.matrix);
      if(diameter>.42&&Math.hypot(spec.x,spec.z)<65){
        const collider=new Mesh(geometry,material);collider.matrix.copy(pose.matrix);collider.matrixAutoUpdate=false;
        collider.updateMatrixWorld(true);addScatterCollision(collider,obstacles,height);
      }
    });
    batch.castShadow=true;batch.receiveShadow=true;batch.computeBoundingSphere();scene.add(batch);
  });
  const gravel=populateGravel(scene,height,kit.fragment,material);
  const sizes=placements.map(piece=>piece.diameter);
  scene.userData.suppliedRocks={source:'user-mars-v1',landmarks:6,fragments:8,scatter:placements.length,batches:8+gravel.batches,
    sizes:{diameters:sizes,halfMetre:sizes.filter(size=>size>=.4&&size<=.7).length,boulders:sizes.filter(size=>size>=1.7).length},gravel};
}

export async function addSuppliedMarsRocks(scene:Scene,obstacles:Solid[],height:(x:number,z:number)=>number,
  scatter:readonly Scatter[],isDisposed:()=>boolean):Promise<void>{
  const base=`${import.meta.env.BASE_URL}assets/rocks/user-mars-v1/`;
  const settled=await Promise.allSettled([new GLTFLoader().loadAsync(`${base}mars-rocks.glb`),
    new TextureLoader().loadAsync(`${base}color.jpeg`),new TextureLoader().loadAsync(`${base}normal-dx.jpeg`)]);
  const [modelResult,colorResult,normalResult]=settled;
  if(isDisposed()||settled.some(result=>result.status==='rejected')){
    if(modelResult.status==='fulfilled')disposeSceneResources(modelResult.value.scene);
    if(colorResult.status==='fulfilled')colorResult.value.dispose();if(normalResult.status==='fulfilled')normalResult.value.dispose();
    const failure=settled.find(result=>result.status==='rejected');if(failure?.status==='rejected')throw failure.reason;return;
  }
  if(modelResult.status!=='fulfilled'||colorResult.status!=='fulfilled'||normalResult.status!=='fulfilled')return;
  const source=modelResult.value.scene,kit={} as RockKit;
  source.updateMatrixWorld(true);
  source.traverse(object=>{
    if(!(object instanceof Mesh)||!shapes.includes(object.name as typeof shapes[number]))return;
    const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
    geometry.setAttribute('color',new BufferAttribute(new Float32Array(geometry.attributes.position.count*3).fill(1),3));
    kit[object.name as keyof RockKit]=geometry;
  });
  disposeSceneResources(source);
  const material=suppliedRockMaterial(colorResult.value,normalResult.value);
  try {
    if(Object.keys(kit).length!==4)throw new Error('Supplied Mars rock kit is incomplete');
    populateSuppliedRocks(scene,obstacles,height,kit,material,scatter);
  }catch(error){Object.values(kit).forEach(g=>g.dispose());material.map?.dispose();material.normalMap?.dispose();material.dispose();throw error;}
}
