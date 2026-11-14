import { BufferGeometry, Group, InstancedMesh, Matrix4, Mesh, SkinnedMesh, type Material } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type Batch = {
  source: Mesh<BufferGeometry, Material>[];
  copies: BufferGeometry[];
};

/** Freeze ordinary, root-owned mesh parts into material batches; animated or special meshes stay intact. */
export function batchStaticModel(root: Group): void {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  const batches = new Map<string, Batch>();
  const transform = new Matrix4();
  root.traverseVisible(object => {
    if (!(object instanceof Mesh) || object instanceof InstancedMesh || object instanceof SkinnedMesh
      || Array.isArray(object.material)) return;
    const geometry: BufferGeometry = object.geometry;
    if (!object.material.visible || !geometry.getAttribute('position')
      || Object.keys(geometry.morphAttributes).length || geometry.drawRange.start !== 0
      || geometry.drawRange.count !== Infinity) return;
    const attributes = Object.entries(geometry.attributes).sort(([a], [b]) => a.localeCompare(b));
    if (attributes.some(([, attribute]) => 'isInterleavedBufferAttribute' in attribute)) return;
    transform.multiplyMatrices(inverse, object.matrixWorld);
    if (transform.determinant() <= 0) return;
    const signature = attributes.map(([name, attribute]) => [
      name, attribute.itemSize, attribute.normalized, attribute.array.constructor.name,
    ]);
    const key = JSON.stringify([object.material.uuid, Boolean(geometry.index), signature,
      object.castShadow, object.receiveShadow, object.renderOrder, object.layers.mask,
      object.frustumCulled, Boolean(object.userData.excludeAO)]);
    let batch = batches.get(key);
    if (!batch) { batch = { source: [], copies: [] }; batches.set(key, batch); }
    batch.source.push(object as Mesh<BufferGeometry, Material>);
    const copy = geometry.clone().applyMatrix4(transform);
    // Cache ownership belongs to the source; transformed copies are owned by this scene.
    copy.userData = {...copy.userData};
    delete copy.userData.sharedAsset;
    copy.clearGroups();
    batch.copies.push(copy);
  });

  const replacements: {batch: Batch; mesh: Mesh<BufferGeometry, Material>}[] = [];
  try {
    for (const batch of batches.values()) {
      if (batch.source.length < 2) continue;
      const geometry = mergeGeometries(batch.copies, false);
      if (!geometry) throw new Error('Static model batch has incompatible geometry.');
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      const first = batch.source[0];
      const mesh = new Mesh(geometry, first.material);
      mesh.name = `static-${first.material.name || 'material'}`;
      mesh.castShadow = first.castShadow;
      mesh.receiveShadow = first.receiveShadow;
      mesh.renderOrder = first.renderOrder;
      mesh.layers.mask = first.layers.mask;
      mesh.frustumCulled = first.frustumCulled;
      if (first.userData.excludeAO) mesh.userData.excludeAO = true;
      replacements.push({batch, mesh});
    }
  } catch (error) {
    for (const {mesh} of replacements) mesh.geometry.dispose();
    throw error;
  } finally {
    for (const batch of batches.values()) for (const copy of batch.copies) copy.dispose();
  }

  const retired = new Set<BufferGeometry>();
  for (const {batch, mesh} of replacements) {
    for (const source of batch.source) {
      for (const child of [...source.children]) root.attach(child);
      source.removeFromParent();
      if (!source.geometry.userData.sharedAsset) retired.add(source.geometry);
    }
    root.add(mesh);
  }
  root.traverse(object => { if (object instanceof Mesh) retired.delete(object.geometry); });
  retired.forEach(geometry => geometry.dispose());
  root.updateMatrixWorld(true);
}
