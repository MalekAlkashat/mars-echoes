import fs from 'node:fs/promises';
import { FBXLoader } from '../game/node_modules/three/examples/jsm/loaders/FBXLoader.js';
import { GLTFExporter } from '../game/node_modules/three/examples/jsm/exporters/GLTFExporter.js';
import { LoadingManager, Texture, Box3, Vector3, Mesh, Group, MeshStandardMaterial } from '../game/node_modules/three/build/three.module.js';
globalThis.window={URL};
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(buffer=>{this.result=buffer;this.onloadend?.();});}};
const manager=new LoadingManager();manager.addHandler(/.*/,{path:'',setPath(){return this;},load(){return new Texture();}});
const data=await fs.readFile('assets/vendor/user-mars-rocks/source/MarsRocks.fbx');
const source=new FBXLoader(manager).parse(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');source.updateMatrixWorld(true);
const output=new Group();
const selected={ridge:['Mars_rock015',1.8],slab:['Mars_rock014',1.4],block:['Mars_rock005',.8],fragment:['Mars_rock008',.45]};
const manifest=[];
for(const [name,[original,width]] of Object.entries(selected)){
 const node=source.getObjectByName(original);if(!node?.isMesh)throw new Error(`Missing ${original}`);
 const geometry=node.geometry.clone().applyMatrix4(node.matrixWorld);
 geometry.computeBoundingBox();const box=geometry.boundingBox,center=box.getCenter(new Vector3()),size=box.getSize(new Vector3());
 geometry.translate(-center.x,-box.min.y,-center.z);const scale=width/Math.max(size.x,size.z);geometry.scale(scale,scale,scale);
 geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const mesh=new Mesh(geometry,new MeshStandardMaterial({color:0xffffff,roughness:.95}));mesh.name=name;output.add(mesh);
 manifest.push({name,sourceNode:original,triangles:geometry.attributes.position.count/3,size:geometry.boundingBox.getSize(new Vector3()).toArray(),scale});
}
const glb=await new GLTFExporter().parseAsync(output,{binary:true});
const dest='game/public/assets/rocks/user-mars-v1';await fs.mkdir(dest,{recursive:true});
await fs.writeFile(`${dest}/mars-rocks.glb`,new Uint8Array(glb));
await fs.copyFile('assets/vendor/user-mars-rocks/textures/Rock029_1K_Color.jpeg',`${dest}/color.jpeg`);
await fs.copyFile('assets/vendor/user-mars-rocks/textures/Rock029_1K_NormalDX.jpeg',`${dest}/normal-dx.jpeg`);
await fs.writeFile('assets/vendor/user-mars-rocks/conversion.json',JSON.stringify({format:'GLB 2.0',up:'+Y',units:'metres',normalConvention:'DirectX source; runtime normalScale.y = -1',meshes:manifest},null,2));
console.log(JSON.stringify({bytes:glb.byteLength,meshes:manifest},null,2));
