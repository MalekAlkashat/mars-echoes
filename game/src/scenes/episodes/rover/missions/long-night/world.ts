import * as T from 'three';
import {addAtmosphere} from '../../../../../environments/mars/atmosphere';
import {surfaceMaterial,surfaceTexturesReady} from '../../../../../environments/mars/materials';
import {fracturedRock} from '../../../../../environments/mars/terrain';
import {disposeSceneResources} from '../../../../../environments/mars/resources';
const raw=(x:number,z:number)=>.025*z+.7*Math.exp(-(((x+15)/9)**2))+1.6*Math.exp(-(((x-22)/10)**2))+.16*Math.sin(z*.17+x*.08);
export function height(x:number,z:number){const a=Math.floor(x),b=Math.floor(z),u=x-a,v=z-b;const h00=raw(a,b),h10=raw(a+1,b),h01=raw(a,b+1),h11=raw(a+1,b+1);return u+v<=1?h00+(h10-h00)*u+(h01-h00)*v:h11+(h01-h11)*(1-u)+(h10-h11)*(1-v);}
export async function createNightWorld(signal:AbortSignal){
 await surfaceTexturesReady();signal.throwIfAborted();
 const scene=new T.Scene();scene.background=new T.Color('#d8a384');scene.fog=new T.FogExp2('#d8a384',.006);
 const ground=new T.PlaneGeometry(120,120,120,120);ground.rotateX(-Math.PI/2);
 const pos=ground.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,raw(pos.getX(i),pos.getZ(i)));ground.computeVertexNormals();
 const sand=surfaceMaterial('dust',false);sand.vertexColors=false;sand.color.set('#b99072');
 const floor=new T.Mesh(ground,sand);floor.receiveShadow=true;scene.add(floor);
 const rock=fracturedRock(41,1),mat=surfaceMaterial('rock',false);mat.color.set('#a98a72');
 const stones=new T.InstancedMesh(rock,mat,48),o=new T.Object3D();
 const obstacles:{x:number;z:number;radius:number}[]=[];
 for(let i=0;i<48;i++){const side=i%3===0?1:-1,x=side*(9+(i*7%17)),z=-28+(i*13%56),s=.35+(i%6)*.22;o.position.set(x,height(x,z)-s*.16,z);o.rotation.set(.08,i*2.4,.05);o.scale.set(s*1.8,s*.5,s);o.updateMatrix();stones.setMatrixAt(i,o.matrix);if(s>1)obstacles.push({x,z,radius:s*1.8});}
 stones.receiveShadow=true;stones.castShadow=true;scene.add(stones);
 const atmosphere=addAtmosphere(scene,{skyRadius:240,shadowSize:1024,referenceSky:true});
 const sky=scene.getObjectByName('coherent-storm-atmosphere') as T.Mesh<T.SphereGeometry,T.ShaderMaterial>;
 const lights:T.Light[]=[];scene.traverse(o=>{if(o instanceof T.Light)lights.push(o);});
 const intensities=lights.map(l=>l.intensity),clear=new T.Color('#d8a384'),dark=new T.Color('#281d19'),ceiling=new T.Color('#a97565');
 // Reuse the existing non-shadow fill for readability through local fog. Artistic only.
 const readability=lights.find(light=>light instanceof T.DirectionalLight && light!==atmosphere.sun)!;
 let disposed=false;
 return {scene,obstacles,setup:(r:T.WebGLRenderer)=>atmosphere.setupEnvironment(r),
 tick(time:number,s:number,position:T.Vector3){atmosphere.tick(time);atmosphere.follow(position);scene.fog!.color.copy(clear).lerp(dark,s);(scene.fog as T.FogExp2).density=.006+s*.075;scene.background=scene.fog!.color;sky.material.uniforms.horizon.value.copy(scene.fog!.color);sky.material.uniforms.ceiling.value.copy(ceiling).lerp(dark,s);sky.material.uniforms.sunColor.value.setScalar(1-s*.98);lights.forEach((l,i)=>l.intensity=intensities[i]*(1-s*.94));scene.environmentIntensity=.8*(1-s*.8);readability.intensity=Math.max(readability.intensity,1.1*s*s);},
 dispose(){if(disposed)return;disposed=true;atmosphere.dispose();disposeSceneResources(scene);}
 };
}
