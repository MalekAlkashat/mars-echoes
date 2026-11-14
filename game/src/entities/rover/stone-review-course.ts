import { BoxGeometry, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import type { MarsEnvironment } from '../../environments/mars/dressing';

/** Development-only fixtures on the real world, controller and renderer. */
export function addStoneReviewCourse(world:MarsEnvironment):void {
  const stone=new MeshStandardMaterial({color:'#b59372',roughness:1});
  for(const [name,distance,height,width,depth] of [
    ['low',4,.085,1.8,1.5],['tall',8,.6,1.8,1],
  ] as const){
    const x=world.spawn.x,z=world.spawn.z-distance;
    const mesh=new Mesh(new BoxGeometry(width,height,depth),stone);
    mesh.name=`rock-physics-review-${name}`;
    mesh.position.set(x,world.height(x,z)+height/2,z);
    const dx=(world.height(x+.2,z)-world.height(x-.2,z))/.4;
    const dz=(world.height(x,z+.2)-world.height(x,z-.2))/.4;
    mesh.quaternion.setFromUnitVectors(new Vector3(0,1,0),new Vector3(-dx,1,-dz).normalize());
    mesh.castShadow=mesh.receiveShadow=true;
    world.scene.add(mesh);
  }
}
