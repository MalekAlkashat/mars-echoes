/** Scene-owned Meridiani plain: one ground mesh, one sun, a plain sky. No rocks or landmarks (PIA07216 shows none). */
import * as T from 'three';
import { disposeSceneResources } from '../../../../../environments/mars/resources';
import { Ground } from './field';
import { buildGroundGeometry } from './mesh';

/** Sky sample from PIA07216 (study value). Sun placement is a lighting choice, not a recorded time of day. */
const SKY = '#e6b272', HAZE = '#d9aa70';
const SUN_AZIMUTH = 262 * Math.PI / 180, SUN_ELEVATION = 24 * Math.PI / 180;
const SUN_DIRECTION = new T.Vector3(Math.cos(SUN_ELEVATION) * Math.sin(SUN_AZIMUTH), Math.sin(SUN_ELEVATION), -Math.cos(SUN_ELEVATION) * Math.cos(SUN_AZIMUTH));
/** Existing project-authored fine sand (Mission 1 runtime maps); tinted per vertex. */
const SAND = `${import.meta.env.BASE_URL}assets/missions/blueberry-clue/v1/fine-sand-`;

export async function createPurgatoryWorld(signal: AbortSignal) {
  const loader = new T.TextureLoader(), textures: T.Texture[] = [];
  const loaded = await Promise.allSettled(['color.jpg', 'normal.png', 'roughness.jpg'].map(async suffix => {
    const map = await loader.loadAsync(SAND + suffix);
    textures.push(map); map.wrapS = map.wrapT = T.RepeatWrapping; map.anisotropy = 8;
    if (suffix === 'color.jpg') map.colorSpace = T.SRGBColorSpace;
    return map;
  }));
  const failed = loaded.find(result => result.status === 'rejected');
  if (failed || signal.aborted) {
    textures.forEach(texture => texture.dispose());
    throw failed?.status === 'rejected' ? failed.reason : new DOMException('Scene preparation cancelled', 'AbortError');
  }
  const [color, normal, roughness] = loaded.map(result => (result as PromiseFulfilledResult<T.Texture>).value);

  const scene = new T.Scene();
  scene.background = new T.Color(SKY);
  scene.fog = new T.FogExp2(HAZE, 0.0026);
  const ground = new Ground(), mesh = buildGroundGeometry(ground);
  const sand = new T.MeshStandardMaterial({ map: color, normalMap: normal, roughnessMap: roughness, roughness: 1, metalness: 0, vertexColors: true, normalScale: new T.Vector2(0.55, 0.55) });
  const terrain = new T.Mesh(mesh.geometry, sand);
  terrain.name = 'purgatory-ground'; terrain.receiveShadow = true; terrain.castShadow = true;
  scene.add(terrain);

  // Authored entry strips removed at the user's request. Physical wheel burial remains in Ground.

  const sun = new T.DirectionalLight('#fff0d6', 3.1);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 5, far: 80 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.025;
  scene.add(sun, sun.target, new T.HemisphereLight('#e9c896', '#6a4a31', 0.85));
  const focus = new T.Vector3();
  let environment: T.WebGLRenderTarget | undefined;

  return {
    scene, ground, mesh, terrain,
    /** Builds the reflection probe from a plain sky dome, so rover metal sees the same sky as the player. */
    setup(renderer: T.WebGLRenderer) {
      if (environment) return;
      const probe = new T.Scene(), dome = new T.Mesh(new T.SphereGeometry(10, 32, 16), new T.ShaderMaterial({
        side: T.BackSide, uniforms: { sun: { value: SUN_DIRECTION } },
        vertexShader: 'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: 'uniform vec3 sun;varying vec3 direction;void main(){vec3 d=normalize(direction);vec3 c=mix(vec3(.16,.105,.062),vec3(.69,.44,.2),smoothstep(-.12,.1,d.y));c+=vec3(3.4,2.9,2.2)*pow(max(0.,dot(d,sun)),160.);gl_FragColor=vec4(c,1.);}',
      }));
      probe.add(dome);
      const pmrem = new T.PMREMGenerator(renderer);
      environment = pmrem.fromScene(probe, 0.04);
      pmrem.dispose(); dome.geometry.dispose(); dome.material.dispose();
      scene.environment = environment.texture; scene.environmentIntensity = 0.8;
    },
    /** Keeps the bounded shadow volume on the rover; snapped so the shadow map does not swim. */
    follow(x: number, z: number) {
      focus.set(Math.round(x * 4) / 4, 0, Math.round(z * 4) / 4);
      sun.target.position.copy(focus); sun.position.copy(focus).addScaledVector(SUN_DIRECTION, 40);
      sun.target.updateMatrixWorld();
    },
    dispose() {
      textures.forEach(texture => texture.dispose());
      environment?.dispose();
      disposeSceneResources(scene);
    },
  };
}
export type PurgatoryWorld = Awaited<ReturnType<typeof createPurgatoryWorld>>;
