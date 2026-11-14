import * as T from 'three';
import {surfaceMaterial,surfaceTexturesReady} from '../../../../../environments/mars/materials';
import {addAtmosphere} from '../../../../../environments/mars/atmosphere';
import {bakeRockBaseDust,setRockGroundPlanes,type DustFootprint} from '../../../../../environments/mars/hub-rock-dust';
import {SLABS} from './site';
import {createGroundGeometry,createVistaGeometry,sampleHeight} from './surface';
import {fieldRockGeometry,placeFieldRock} from './field-rocks';
import {concretionPlacements,createConcretionField} from '../../../../../environments/mars/concretions';

/** Scene-local assembly of existing approved material/atmosphere helpers. */
export function createLandscape(){
 const group=new T.Group();group.name='eagle-landscape';
 const sand=surfaceMaterial('dust',false,{terrainDust:true});sand.color.set('#d59462');
 const ground=new T.Mesh(createGroundGeometry(),sand);ground.name='eagle-authored-basin';ground.receiveShadow=true;group.add(ground);
 // The filtered world-space material continues across the join without a tint step.
 const vista=new T.Mesh(createVistaGeometry(),sand);vista.name='eagle-low-distant-shoulders';group.add(vista);
 const stone=surfaceMaterial('rock',false,{terrainDust:true});stone.color.set('#d0b296');
 // Same PBR identity and filtering as the hub; quieter detail on this thinner pale exposure.
 const compile=stone.onBeforeCompile;
 stone.onBeforeCompile=(shader,renderer)=>{compile.call(stone,shader,renderer);shader.uniforms.surfaceNormalStrength.value=.38;shader.uniforms.surfaceScale.value=.5;(shader.uniforms.surfaceGroundTint.value as T.Color).copy(sand.color).multiply(new T.Color('#e7c3a1')).multiplyScalar(.78);};
 const footprints:DustFootprint[]=[];
 for(let variant=0;variant<6;variant++){
  const geometry=fieldRockGeometry(variant),members=SLABS.map((s,i)=>({s,i})).filter(({i})=>i%6===variant);
  const batch=new T.InstancedMesh(geometry,stone,members.length),poses=members.map(({s,i})=>placeFieldRock(s,i,geometry,sampleHeight));
  batch.name=`eagle-stratified-bed-${variant}`;batch.castShadow=batch.receiveShadow=true;
  poses.forEach((pose,i)=>{
   batch.setMatrixAt(i,pose.matrix);
   const points:T.Vector2[]=[],bounds=new T.Box3(),p=geometry.getAttribute('position'),v=new T.Vector3();
   for(let k=0;k<p.count;k++){v.fromBufferAttribute(p,k).applyMatrix4(pose.matrix);bounds.expandByPoint(v);if(p.getY(k)<.001)points.push(new T.Vector2(v.x,v.z))}
   footprints.push({bounds,points});
  });
  setRockGroundPlanes(geometry,poses.map(p=>p.position),sampleHeight);batch.computeBoundingSphere();group.add(batch);
 }
 // Thin broken flakes stay beside exposures; the approach remains quiet and open.
 const chipsGeometry=fieldRockGeometry(4,true),chips=new T.InstancedMesh(chipsGeometry,stone,126),pose=new T.Object3D(),locations:{x:number;z:number}[]=[];
 for(let i=0;i<chips.count;i++){
  const s=SLABS[i%SLABS.length],a=i*2.399,r=.7+(Math.sin(i*71.7)*.5+.5)*1.25,x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r;
  const size=.09+(i%7)*.028;pose.position.set(x,sampleHeight(x,z)-.012,z);pose.rotation.set(0,a,0);pose.scale.set(size,.025+(i%4)*.007,size*(.65+(i%3)*.18));pose.updateMatrix();chips.setMatrixAt(i,pose.matrix);locations.push({x,z});
 }
 setRockGroundPlanes(chipsGeometry,locations,sampleHeight);chips.receiveShadow=true;chips.name='eagle-fracture-flakes';chips.computeBoundingSphere();group.add(chips);
 bakeRockBaseDust(ground,footprints);
 const concretions=createConcretionField('eagle-ground-concretions',concretionPlacements([
  {id:'eagle-arrival',x:3.3,z:6.1,spreadX:.8,spreadZ:.65,count:48},
  {id:'eagle-apron',x:1.7,z:3.2,spreadX:1,spreadZ:.6,count:48},
  {id:'eagle-west-pocket',x:-1.4,z:1.9,spreadX:.7,spreadZ:.5,count:48},
  {id:'eagle-work-east',x:1.6,z:-.6,spreadX:.7,spreadZ:.55,count:48},
  {id:'eagle-bed-edge',x:-2.7,z:-2.6,spreadX:.8,spreadZ:.5,count:48},
 ],sampleHeight,7283,.007,.012));group.add(concretions);
 // Keep the established macro probe and lighting separate from the driving atmosphere.
 const lighting=new T.Scene(),atmosphere=addAtmosphere(lighting,{skyRadius:220,shadowSize:1024});
 // Scene-owned sky direction is shared by its disk/probe and the factory's sun placement.
 // Raise this memory's sun enough to read the low beds inside the compact basin.
 const sky=lighting.getObjectByName('coherent-storm-atmosphere') as T.Mesh<T.BufferGeometry,T.ShaderMaterial>;
 (sky.material.uniforms.sunDirection.value as T.Vector3).set(-.5,.34,-1).normalize();
 atmosphere.follow(new T.Vector3(0,0,3));
 atmosphere.sun.shadow.camera.left=-16;atmosphere.sun.shadow.camera.right=16;atmosphere.sun.shadow.camera.top=18;atmosphere.sun.shadow.camera.bottom=-18;
 group.add(...[...lighting.children]);
 return {group,sun:atmosphere.sun,ground,concretions,ready:surfaceTexturesReady(),
  setup(renderer:T.WebGLRenderer){atmosphere.setupEnvironment(renderer);},
  environment(){return lighting.environment;},
  dispose(){atmosphere.dispose();},
 };
}
