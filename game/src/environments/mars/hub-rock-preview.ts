import { Box3, BufferAttribute, Material, Mesh, MeshStandardMaterial, Raycaster, Scene, Texture, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { hubHeight } from './hub-terrain';
import { disposeSceneResources } from './resources';

/** One scanned outcrop for visual approval; deliberately not distributed across the hub. */
export async function addHubRockPreview(scene: Scene, obstacles: {x:number;z:number;radius:number;kind?:'rock'}[], isDisposed:()=>boolean, height=hubHeight, sharedStone?: MeshStandardMaterial): Promise<void> {
  const file = sharedStone ? 'boulder-01-shape.glb' : 'boulder-01.glb';
  const {scene:rock} = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}assets/rocks/boulder-01-preview/${file}`);
  if(isDisposed()){disposeSceneResources(rock);return;}
  rock.name='hub-scanned-outcrop-preview';
  rock.scale.setScalar(2);
  rock.rotation.y=-.45;
  rock.updateMatrixWorld(true);
  const bounds=new Box3().setFromObject(rock),center=bounds.getCenter(new Vector3());
  rock.position.set(-18-center.x,0,1-center.z);
  rock.updateMatrixWorld(true);
  // Use the actual rotated lower footprint rather than centre-only grounding.
  let lowestGround=Infinity;
  const point=new Vector3();
  const replacedMaterials = new Set<Material>(), replacedTextures = new Set<Texture>();
  rock.traverse(object=>{
    if(!(object instanceof Mesh))return;
    const positions=object.geometry.getAttribute('position');
    for(let i=0;i<positions.count;i++){
      point.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld);
      if(point.y<bounds.min.y+.35)lowestGround=Math.min(lowestGround,height(point.x,point.z));
    }
    object.castShadow=object.receiveShadow=true;
    for(const material of (Array.isArray(object.material)?object.material:[object.material]) as MeshStandardMaterial[]){
      if (sharedStone) {
        replacedMaterials.add(material);
        Object.values(material).forEach(value => { if (value instanceof Texture) replacedTextures.add(value); });
        continue;
      }
      material.color.set('#fff0db');
      material.roughness=.96;
      material.aoMapIntensity=.55;
      material.normalScale.setScalar(.65);
    }
    if (sharedStone) {
      // The existing rock material expects vertex colors; the scan only supplies normals/UVs.
      if (!object.geometry.hasAttribute('color')) {
        object.geometry.setAttribute('color', new BufferAttribute(new Float32Array(positions.count * 3).fill(1), 3));
      }
      object.material = sharedStone;
    }
  });
  // The imported scan contributes shape; every hub rock uses the same world-space surface.
  replacedTextures.forEach(texture => texture.dispose());
  replacedMaterials.forEach(material => material.dispose());
  rock.position.y=lowestGround-bounds.min.y-.5;
  scene.add(rock);rock.updateMatrixWorld(true);
  // Small occupied-column proxies avoid the old broad exclusion zone.
  const placed=new Box3().setFromObject(rock);
  const ray=new Raycaster(new Vector3(),new Vector3(0,-1,0));
  for(let x=placed.min.x+.18;x<placed.max.x;x+=.4)for(let z=placed.min.z+.18;z<placed.max.z;z+=.4){
    ray.ray.origin.set(x,placed.max.y+1,z);
    const hit=ray.intersectObject(rock,true)[0];
    if(hit&&hit.point.y>height(x,z)+.22)obstacles.push({x,z,radius:.29,kind:'rock'});
  }
  rock.userData.source='https://polyhaven.com/a/boulder_01';
  rock.userData.previewOnly=true;
}
