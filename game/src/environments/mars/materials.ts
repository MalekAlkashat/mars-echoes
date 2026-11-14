import {
  Color, DataTexture, MeshStandardMaterial, NoColorSpace, RepeatWrapping,
  RGBAFormat, SRGBColorSpace, Texture, TextureLoader,
} from 'three';

type SurfaceRole = 'regolith' | 'rock';
type SurfaceFile = 'color' | 'normal' | 'roughness' | 'ao';
const textures = new Map<string, { texture: Texture; ready: Promise<void> }>();

export function surfaceTexturesReady(): Promise<void> {
  return Promise.all([...textures.values()].map(entry => entry.ready)).then(() => undefined);
}

export function disposeSurfaceTextureCache(): void {
  textures.forEach(entry => entry.texture.dispose());
  textures.clear();
}

function solidTexture(r: number, g: number, b: number): DataTexture {
  const texture = new DataTexture(new Uint8Array([r, g, b, 255]), 1, 1, RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

function surfaceTexture(role: SurfaceRole, file: SurfaceFile): Texture {
  const key = `${role}/${file}`;
  const cached = textures.get(key);
  if (cached) return cached.texture;
  const fallback = file === 'normal' ? [128, 128, 255] : file === 'ao' ? [255, 255, 255]
    : file === 'roughness' ? [215, 215, 215] : [178, 167, 149];
  if (typeof document === 'undefined') {
    const texture = solidTexture(...fallback as [number, number, number]);
    texture.colorSpace = file === 'color' ? SRGBColorSpace : NoColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.userData.sharedAsset = true;
    textures.set(key, { texture, ready: Promise.resolve() });
    return texture;
  }
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const ready = new Promise<void>((success, failure) => { resolve = success; reject = failure; });
  const texture = new TextureLoader().load(`${import.meta.env.BASE_URL}assets/surfaces/${key}.jpg`,
    () => resolve(), undefined, () => {
      if (textures.get(key)?.texture === texture) textures.delete(key);
      texture.dispose();
      reject(new Error(`Could not load ${key}.jpg`));
    });
  texture.colorSpace = file === 'color' ? SRGBColorSpace : NoColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  texture.userData.sharedAsset = true;
  textures.set(key, { texture, ready });
  return texture;
}

export function surfaceMaterial(role: SurfaceRole): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    name: `${role}-triplanar-pbr`,
    color: role === 'regolith' ? '#e98740' : '#b79073',
    roughness: role === 'regolith' ? 0.95 : 0.89,
    metalness: 0,
    vertexColors: true,
  });
  const uniforms = {
    surfaceColor: { value: surfaceTexture(role, 'color') },
    surfaceNormal: { value: surfaceTexture(role, 'normal') },
    surfaceRoughness: { value: surfaceTexture(role, 'roughness') },
    surfaceAO: { value: surfaceTexture(role, 'ao') },
    surfaceScale: { value: role === 'regolith' ? 0.68 : 0.39 },
    surfaceNormalStrength: { value: role === 'regolith' ? 0.88 : 1.15 },
    surfaceDust: { value: role === 'regolith' ? 0.08 : 0.2 },
    surfaceAlbedoReference: { value: role === 'regolith' ? 0.3 : 0.4 },
  };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `varying vec3 vSurfacePosition;
      varying vec3 vSurfaceNormal;\n${shader.vertexShader}`;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <defaultnormal_vertex>',
      `#include <defaultnormal_vertex>
       vSurfaceNormal = inverseTransformDirection(transformedNormal, viewMatrix);`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
       vec4 surfaceWorld = vec4(transformed, 1.0);
       #ifdef USE_INSTANCING
         surfaceWorld = instanceMatrix * surfaceWorld;
       #endif
       vSurfacePosition = (modelMatrix * surfaceWorld).xyz;`,
    );
    shader.fragmentShader = `
      varying vec3 vSurfacePosition;
      varying vec3 vSurfaceNormal;
      uniform sampler2D surfaceColor, surfaceNormal, surfaceRoughness, surfaceAO;
      uniform float surfaceScale, surfaceNormalStrength, surfaceDust, surfaceAlbedoReference;
      float surfaceHash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float surfaceNoise(vec2 p) {
        vec2 cell = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(surfaceHash(cell), surfaceHash(cell + vec2(1,0)), f.x),
          mix(surfaceHash(cell + vec2(0,1)), surfaceHash(cell + vec2(1,1)), f.x), f.y);
      }
      vec3 surfaceWeights() {
        vec3 weights = pow(abs(normalize(vSurfaceNormal)), vec3(4.0));
        return weights / max(dot(weights, vec3(1.0)), 0.0001);
      }
      vec3 surfaceSample(sampler2D image, vec3 p, vec3 weights) {
        return texture2D(image, p.zy).rgb * weights.x
          + texture2D(image, p.xz).rgb * weights.y
          + texture2D(image, p.xy).rgb * weights.z;
      }
      ${shader.fragmentShader}
    `;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <aomap_fragment>',
      `#include <aomap_fragment>
       float mineralAO = surfaceSample(surfaceAO, surfaceP, surfaceBlend).r;
       reflectedLight.indirectDiffuse *= mix(0.65, 1.0, mineralAO);
       reflectedLight.indirectSpecular *= mix(0.75, 1.0, mineralAO);`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
       vec3 surfaceP = vSurfacePosition * surfaceScale;
       vec3 surfaceBlend = surfaceWeights();
       vec3 mineral = surfaceSample(surfaceColor, surfaceP, surfaceBlend);
       float mineralLuma = dot(mineral, vec3(0.2126, 0.7152, 0.0722));
       float mineralDetail = clamp(mineralLuma / surfaceAlbedoReference, 0.55, 1.55);
       float macroVariation = surfaceNoise(vSurfacePosition.xz * 0.11)
         * 0.7 + surfaceNoise(vSurfacePosition.xz * 0.037 + 18.0) * 0.3;
       diffuseColor.rgb *= mix(1.0, mineralDetail, 0.7)
         * (0.88 + macroVariation * 0.24);
       float depositedDust = smoothstep(0.45, 0.95, normalize(vSurfaceNormal).y)
         * surfaceDust * surfaceNoise(vSurfacePosition.xz * 0.72);
       diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.25, 1.12, 0.91), depositedDust);`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
       float mineralRoughness = surfaceSample(surfaceRoughness, surfaceP, surfaceBlend).g;
       roughnessFactor = clamp(roughness * (0.58 + mineralRoughness * 0.51), 0.53, 1.0);`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      `#include <normal_fragment_maps>
       vec3 rockNX = texture2D(surfaceNormal, surfaceP.zy).xyz * 2.0 - 1.0;
       vec3 rockNY = texture2D(surfaceNormal, surfaceP.xz).xyz * 2.0 - 1.0;
       vec3 rockNZ = texture2D(surfaceNormal, surfaceP.xy).xyz * 2.0 - 1.0;
       vec3 worldDetail = vec3(0.0, rockNX.y, rockNX.x) * surfaceBlend.x
         + vec3(rockNY.x, 0.0, rockNY.y) * surfaceBlend.y
         + vec3(rockNZ.x, rockNZ.y, 0.0) * surfaceBlend.z;
       float detailFade = 1.0 - smoothstep(32.0, 110.0, length(vViewPosition));
       vec3 worldSurfaceNormal = normalize(vSurfaceNormal + worldDetail
         * surfaceNormalStrength * mix(0.3, 1.0, detailFade));
       normal = normalize(mat3(viewMatrix) * worldSurfaceNormal);`,
    );
  };
  material.customProgramCacheKey = () => `triplanar-mineral-${role}-v3`;
  material.userData.surfaceRole = role;
  return material;
}

export function rockVertexColor(value: number): Color {
  return new Color().setRGB(value * 1.02, value, value * 0.96);
}
