import { BufferGeometry, InstancedMesh, Light, Material, Object3D, Texture } from 'three';

/** Release a scene's instances while leaving cache-owned source resources alive. */
export function disposeSceneResources(root: Object3D): void {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const collectTexture = (value: unknown) => {
    if (value instanceof Texture && !value.userData.sharedAsset) textures.add(value);
  };
  root.traverse((object) => {
    const renderable = object as Object3D & {
      geometry?: BufferGeometry;
      material?: Material | Material[];
    };
    if (renderable.geometry && !renderable.geometry.userData.sharedAsset) geometries.add(renderable.geometry);
    const list = renderable.material ? (Array.isArray(renderable.material) ? renderable.material : [renderable.material]) : [];
    for (const material of list) {
      if (material.userData.sharedAsset) continue;
      materials.add(material);
      Object.values(material).forEach(collectTexture);
      const uniforms = (material as Material & { uniforms?: Record<string, { value: unknown }> }).uniforms;
      if (uniforms) Object.values(uniforms).forEach(({ value }) => collectTexture(value));
    }
    if (object instanceof InstancedMesh) object.dispose();
    if (object instanceof Light && 'shadow' in object) {
      (object as Light & { shadow: { dispose(): void } }).shadow.dispose();
    }
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
  root.clear();
}
