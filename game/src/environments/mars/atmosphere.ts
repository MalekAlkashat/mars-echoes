import { createMarsSkyMaterial } from './sky';
import {
  CubeCamera, DirectionalLight, HalfFloatType, HemisphereLight,
  LinearMipmapLinearFilter, Mesh, PMREMGenerator, Scene, ShaderMaterial,
  SphereGeometry, Vector3, WebGLCubeRenderTarget, WebGLRenderer, WebGLRenderTarget,
} from 'three';

export type Atmosphere = {
  sun: DirectionalLight;
  tick(time: number): void;
  follow(position: Vector3): void;
  setupEnvironment(renderer: WebGLRenderer): void;
  dispose(): void;
};

export function addAtmosphere(scene: Scene, options: {skyRadius?: number; shadowSize?: number;referenceSky?:boolean} = {}): Atmosphere {
  const skyRadius = options.skyRadius ?? 280;
  const shadowSize = options.shadowSize ?? 2048;
  const reference=Boolean(options.referenceSky);
  const sunDirection = reference?new Vector3(.55,.32,-1).normalize():new Vector3(-0.18, 0.085, -1).normalize();
  const material = createMarsSkyMaterial(reference, sunDirection);
  const sky = new Mesh(new SphereGeometry(skyRadius, 48, 28), material);
  sky.name = 'coherent-storm-atmosphere';
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  const hemisphere = new HemisphereLight(reference?'#d8c0ad':'#b1becc', reference?'#936348':'#836d56', reference?.65:.75);
  scene.add(hemisphere);
  const sun = new DirectionalLight(reference?'#ffe4c3':'#f3e8d3', reference?2.6:3.0);
  sun.name = 'pale-low-sun';
  sun.castShadow = true;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  Object.assign(sun.shadow.camera, {
    left: -22, right: 22, top: 27, bottom: -27, near: 1, far: 165,
  });
  sun.shadow.bias = -0.0001;
  sun.shadow.normalBias = 0.028;
  sun.shadow.radius = 2.4;
  scene.add(sun, sun.target);
  const fill = new DirectionalLight('#a2b5c9', 0.34);
  fill.position.set(26, 32, 22);
  scene.add(fill);

  const anchor = new Vector3();
  let environmentTarget: WebGLRenderTarget | undefined;
  let disposed = false;
  const follow = (position: Vector3) => {
    const texel = 44 / shadowSize;
    anchor.set(
      Math.round(position.x / texel) * texel,
      0,
      Math.round((position.z - 9) / texel) * texel,
    );
    sun.target.position.copy(anchor);
    sun.position.copy(anchor).addScaledVector(sunDirection, 112);
    sky.position.set(position.x * 0.8, 0, position.z * 0.8);
  };
  follow(new Vector3(0, 0, 3));

  return {
    sun,
    follow,
    tick(time) { material.uniforms.time.value = time; },
    setupEnvironment(renderer) {
      if (disposed) return;
      const capture = new Scene();
      const captureSky = new Mesh(sky.geometry, material.clone());
      (captureSky.material as ShaderMaterial).uniforms.time.value = 0;
      capture.add(captureSky);
      const cubeTarget = new WebGLCubeRenderTarget(128, {
        type: HalfFloatType, generateMipmaps: true, minFilter: LinearMipmapLinearFilter,
      });
      const cube = new CubeCamera(0.1, skyRadius + 40, cubeTarget);
      const generator = new PMREMGenerator(renderer);
      try {
        cube.update(renderer, capture);
        const next = generator.fromCubemap(cubeTarget.texture);
        environmentTarget?.dispose();
        environmentTarget = next;
        scene.environment = next.texture;
        scene.environmentIntensity = 0.82;
      } finally {
        generator.dispose();
        cubeTarget.dispose();
        captureSky.material.dispose();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      scene.environment = null;
      environmentTarget?.dispose();
      environmentTarget = undefined;
    },
  };
}
