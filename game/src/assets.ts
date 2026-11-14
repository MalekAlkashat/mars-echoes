import { Box3, Group, Vector3, type Object3D, Mesh, MeshStandardMaterial } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type Assets = Record<string, Object3D>;

const names = {
  rover: 'space-kit/rover',
  structure: 'space-kit/structure',
  'machine-generator': 'space-kit/machine-generator',
  satellitedish: 'space-kit/satellitedish',
  'rock-largea': 'nature-kit/rock-largea',
  'rock-largeb': 'nature-kit/rock-largeb',
  'rock-talla': 'nature-kit/rock-talla',
  'cliff-rock': 'nature-kit/cliff-rock',
};

export async function loadAssets(onProgress: (loaded: number, total: number) => void): Promise<Assets> {
  const loader = new GLTFLoader();
  let loaded = 0;
  const entries = await Promise.all(Object.entries(names).map(async ([name, path]) => {
    const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}assets/kenney/${path}.glb`);
    const bounds = new Box3().setFromObject(gltf.scene);
    const center = bounds.getCenter(new Vector3());
    gltf.scene.position.sub(new Vector3(center.x, bounds.min.y, center.z));
    gltf.scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.castShadow = child.receiveShadow = true;
      const list = Array.isArray(child.material) ? child.material : [child.material];
      const materials = list.map((original) => {
        const material = original.clone() as MeshStandardMaterial;
        material.metalness = name.startsWith('rock') || name === 'cliff-rock' ? 0 : 0.35;
        material.roughness = 0.85;
        return material;
      });
      child.material = Array.isArray(child.material) ? materials : materials[0];
    });
    const normalized = new Group();
    normalized.add(gltf.scene);
    normalized.name = name;
    onProgress(++loaded, Object.keys(names).length);
    return [name, normalized] as const;
  }));
  return Object.fromEntries(entries);
}
