import { Box3, Group, Vector3, Texture, type Object3D, Mesh, MeshStandardMaterial } from 'three';
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

async function loadAssets(onProgress: (loaded: number, total: number) => void): Promise<Assets> {
  const loader = new GLTFLoader();
  let loaded = 0;
  const entries = await Promise.allSettled(Object.entries(names).map(async ([name, path]) => {
    const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}assets/kenney/${path}.glb`);
    const bounds = new Box3().setFromObject(gltf.scene);
    const center = bounds.getCenter(new Vector3());
    gltf.scene.position.sub(new Vector3(center.x, bounds.min.y, center.z));
    gltf.scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.castShadow = child.receiveShadow = true;
      child.geometry.userData.sharedAsset = true;
      const list = Array.isArray(child.material) ? child.material : [child.material];
      const materials = list.map((original) => {
        const material = original.clone() as MeshStandardMaterial;
        material.metalness = name.startsWith('rock') || name === 'cliff-rock' ? 0 : 0.35;
        material.roughness = 0.85;
        for (const value of Object.values(material)) {
          if (value instanceof Texture) value.userData.sharedAsset = true;
        }
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
  const ready = Object.fromEntries(entries.filter(result => result.status === 'fulfilled').map(result => result.value));
  const failed = entries.find(result => result.status === 'rejected');
  if (failed) { disposeAssets(ready); throw failed.reason; }
  return ready;
}

function disposeAssets(assets: Assets): void {
  const resources = new Set<{dispose():void}>();
  for (const root of Object.values(assets)) root.traverse(child => {
    if (!(child instanceof Mesh)) return;
    resources.add(child.geometry);
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      resources.add(material);
      for (const value of Object.values(material)) if (value instanceof Texture) resources.add(value);
    }
  });
  resources.forEach(resource => resource.dispose());
}

export class AssetCache {
  private pending?: Promise<Assets>;
  private disposed = false;
  load(): Promise<Assets> {
    if (this.disposed) return Promise.reject(new Error('Asset cache has been disposed.'));
    if (!this.pending) this.pending = loadAssets(() => {}).then(assets => {
      if (this.disposed) { disposeAssets(assets); throw new Error('Asset preparation cancelled.'); }
      return assets;
    }).catch(error => { this.pending = undefined; throw error; });
    return this.pending;
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.pending?.then(disposeAssets, () => {});
  }
}
