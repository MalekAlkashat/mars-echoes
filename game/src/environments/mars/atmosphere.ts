import {
  BackSide, Color, CubeCamera, DirectionalLight, HalfFloatType, HemisphereLight,
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

export function addAtmosphere(scene: Scene): Atmosphere {
  const sunDirection = new Vector3(-0.18, 0.085, -1).normalize();
  const material = new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      horizon: { value: new Color('#adb1b1') },
      ceiling: { value: new Color('#53606b') },
      underside: { value: new Color('#303d4a') },
      groundBounce: { value: new Color('#5f5145') },
      sunColor: { value: new Color('#f3ead6') },
      sunDirection: { value: sunDirection },
    },
    vertexShader: `
      varying vec3 vSkyDirection;
      void main() {
        vSkyDirection = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vSkyDirection;
      uniform float time;
      uniform vec3 horizon, ceiling, underside, groundBounce, sunColor, sunDirection;
      float skyHash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float skyNoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(skyHash(i), skyHash(i + vec2(1,0)), f.x),
          mix(skyHash(i + vec2(0,1)), skyHash(i + vec2(1,1)), f.x), f.y);
      }
      float clouds(vec2 p) {
        float sum = 0.0, amplitude = 0.5;
        mat2 twist = mat2(0.83, -0.56, 0.56, 0.83);
        for (int i = 0; i < 5; i++) {
          sum += skyNoise(p) * amplitude;
          p = twist * p * 2.03 + 13.2;
          amplitude *= 0.5;
        }
        return sum;
      }
      void main() {
        vec3 direction = normalize(vSkyDirection);
        float elevation = max(direction.y, 0.0);
        float sunAngle = max(dot(direction, sunDirection), 0.0);
        vec3 sky = mix(horizon, ceiling, smoothstep(0.0, 0.72, elevation));
        float sunHaze = pow(sunAngle, 19.0) * exp(-elevation * 4.0);
        sky += sunColor * sunHaze * 0.17;

        vec2 uv = direction.xz / (0.19 + elevation * 0.85);
        uv = uv * vec2(1.3, 2.2) + vec2(time * 0.0013, 0.0);
        float mass = clouds(uv * 1.15);
        float fine = clouds(uv * 3.2 + mass * 1.4);
        float lightSide = clouds(uv * 1.15 + sunDirection.xz * 0.2);
        float thickness = mass * 0.78 + fine * 0.22;
        float cover = smoothstep(0.3, 0.66, thickness);
        float horizonOpening = smoothstep(0.018, 0.14, elevation);
        cover *= mix(0.3, 1.0, horizonOpening);
        vec3 cloudColor = mix(underside, ceiling, smoothstep(0.3, 0.7, lightSide));
        float silverEdge = max(mass - lightSide, 0.0) * 4.0;
        cloudColor += sunColor * silverEdge * pow(sunAngle, 8.0) * 0.25;
        sky = mix(sky, cloudColor, cover * 0.96);

        float disk = smoothstep(0.9997, 0.99994, sunAngle);
        sky = mix(sky, sunColor * 1.45, disk * (1.0 - cover * 0.5));
        sky = mix(sky, groundBounce, 1.0 - smoothstep(-0.35, 0.0, direction.y));
        gl_FragColor = vec4(sky, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const sky = new Mesh(new SphereGeometry(280, 48, 28), material);
  sky.name = 'coherent-storm-atmosphere';
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  const hemisphere = new HemisphereLight('#b1becc', '#836d56', 0.75);
  scene.add(hemisphere);
  const sun = new DirectionalLight('#f3e8d3', 3.0);
  sun.name = 'pale-low-sun';
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
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
    const texel = 44 / 2048;
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
      const cube = new CubeCamera(0.1, 320, cubeTarget);
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
