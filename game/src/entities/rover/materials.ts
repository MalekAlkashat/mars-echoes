import * as THREE from 'three';
function hash(x: number, y: number): number {
    let n = Math.imul(x + 641, 374761393) ^ Math.imul(y + 919, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
function texture(data: Uint8Array, size: number, color = false): THREE.DataTexture {
    const map = new THREE.DataTexture(data, size, size);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.magFilter = THREE.LinearFilter;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.generateMipmaps = true;
    map.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    map.anisotropy = 4;
    map.needsUpdate = true;
    map.userData.sharedAsset = true;
    return map;
}
let finishMaps: {
    paint: THREE.DataTexture;
    surface: THREE.DataTexture;
    normal: THREE.DataTexture;
    rubber: THREE.DataTexture;
} | undefined;

export function disposeRoverMaterialCache(): void {
    if (!finishMaps) return;
    Object.values(finishMaps).forEach(map => map.dispose());
    finishMaps = undefined;
}
function maps(): NonNullable<typeof finishMaps> {
    if (finishMaps)
        return finishMaps;
    const size = 256;
    const albedo = new Uint8Array(size * size * 4);
    const surface = new Uint8Array(size * size * 4);
    const normal = new Uint8Array(size * size * 4);
    const rubber = new Uint8Array(size * size * 4);
    const heights = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            const fine = hash(x, y);
            const patch = hash(Math.floor(x / 13), Math.floor(y / 17));
            const edge = Math.min(x, y, size - 1 - x, size - 1 - y);
            const chip = edge < 2 + patch * 5 && fine > 0.25;
            const scratch = x % 61 === Math.floor(y / 43) && patch > 0.46;
            const stain = Math.max(0, Math.sin(x * 0.034 + 1.5) * Math.cos(y * 0.023 - 0.7)) * 0.07;
            const value = chip ? 65 + fine * 28 : scratch ? 134 : 224 - stain * 160 + fine * 5;
            albedo.set([value, value - (chip ? 0 : 2), value - (chip ? 0 : 9), 255], i);
            surface.set([255, chip ? 137 : 212 + fine * 15, chip ? 170 : 12, 255], i);
            heights[y * size + x] = chip ? -0.5 : scratch ? -0.18 : (fine - 0.5) * 0.035;
            const rubberValue = 77 + patch * 12 + fine * 4;
            rubber.set([rubberValue + 6, rubberValue + 3, rubberValue, 255], i);
        }
    }
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const at = (a: number, b: number) => heights[((b + size) % size) * size + (a + size) % size];
            const dx = (at(x - 1, y) - at(x + 1, y)) * 0.6;
            const dy = (at(x, y - 1) - at(x, y + 1)) * 0.6;
            const n = new THREE.Vector3(dx, dy, 1).normalize();
            normal.set([(n.x * 0.5 + 0.5) * 255, (n.y * 0.5 + 0.5) * 255, n.z * 255, 255], (y * size + x) * 4);
        }
    }
    finishMaps = { paint: texture(albedo, size, true), surface: texture(surface, size), normal: texture(normal, size), rubber: texture(rubber, size, true) };
    return finishMaps;
}
export function createRoverMaterials(wreck: boolean) {
    const m = maps();
    const paint = new THREE.MeshStandardMaterial({
        name: 'faded-ceramic-paint', color: wreck ? 0xb4b2a8 : 0xf8f5e9,
        map: m.paint, roughnessMap: m.surface, metalnessMap: m.surface,
        normalMap: m.normal, normalScale: new THREE.Vector2(0.24, 0.24), metalness: 1, roughness: 1,
    });
    const paintDark = paint.clone();
    paintDark.color.multiplyScalar(0.73);
    const steel = new THREE.MeshStandardMaterial({ name: 'worn-alloy', color: 0x898982, roughness: 0.44, metalness: 0.86, normalMap: m.normal, normalScale: new THREE.Vector2(0.09, 0.09) });
    const edge = new THREE.MeshStandardMaterial({ name: 'dusty-edge-metal', color: 0x666960, roughness: 0.68, metalness: 0.65 });
    const frame = new THREE.MeshStandardMaterial({ name: 'graphite-frame', color: 0x363c3b, roughness: 0.73, metalness: 0.67 });
    const rubber = new THREE.MeshStandardMaterial({ name: 'mineral-dusted-rubber', color: 0x7f8583, map: m.rubber, roughness: 0.97, metalness: 0, normalMap: m.normal, normalScale: new THREE.Vector2(0.18, 0.18) });
    const dust = new THREE.MeshStandardMaterial({ name: 'embedded-mineral-dust', color: 0x716858, roughness: 1, metalness: 0.02 });
    const glass = new THREE.MeshPhysicalMaterial({
        name: 'coated-optical-glass', color: wreck ? 0x20272b : 0x536278,
        roughness: wreck ? 0.3 : 0.045, metalness: 0.07, clearcoat: 1,
        clearcoatRoughness: 0.025, ior: 1.52, iridescence: wreck ? 0 : 0.3,
        iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 320], envMapIntensity: 1.7,
    });
    const cavity = new THREE.MeshStandardMaterial({ name: 'unlit-instrument-cavity', color: 0x0c1011, roughness: 0.95, metalness: 0.05 });
    const gold = new THREE.MeshStandardMaterial({ name: 'electrical-contacts', color: 0xa88b50, roughness: 0.55, metalness: 0.78 });
    return { paint, paintDark, steel, edge, frame, rubber, dust, glass, cavity, gold };
}
