import {
  Color, DataTexture, MeshStandardMaterial, NoColorSpace, RepeatWrapping,
  RGBAFormat, SRGBColorSpace, Texture, TextureLoader,
} from 'three';

type SurfaceRole = 'regolith' | 'rock' | 'dust';
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

export function surfaceMaterial(role: SurfaceRole, distant = false, options: {terrainDust?: boolean} = {}): MeshStandardMaterial {
  const ground = role !== 'rock';
  const rockDust = role === 'rock' && options.terrainDust;
  const groundDust = role === 'dust' && options.terrainDust;
  const material = new MeshStandardMaterial({
    name: `${role}-triplanar-pbr`,
    color: groundDust ? '#c28352' : ground ? '#e98740' : '#b79073',
    roughness: ground ? 0.95 : 0.89,
    metalness: 0,
    vertexColors: true,
  });
  // Distant terrain gets its scale from geometry and haze, not twelve triplanar texture reads.
  if (distant) return material;
  const uniforms = {
    surfaceColor: { value: surfaceTexture(role, 'color') },
    surfaceNormal: { value: surfaceTexture(role, 'normal') },
    surfaceRoughness: { value: surfaceTexture(role, 'roughness') },
    surfaceAO: { value: surfaceTexture(role, 'ao') },
    surfaceScale: { value: role === 'dust' ? 0.45 : role === 'regolith' ? 0.68 : 0.39 },
    surfaceNormalStrength: { value: groundDust ? 0.38 : role === 'dust' ? 0.65 : role === 'regolith' ? 0.88 : 1.15 },
    surfaceDust: { value: ground ? 0.08 : 0.2 },
    surfaceAlbedoReference: { value: ground ? 0.3 : 0.4 },
    surfaceGroundTint: { value: new Color('#e98740').multiply(new Color('#e7c3a1')).multiplyScalar(.78) },
  };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `varying vec3 vSurfacePosition;
      ${rockDust ? 'attribute vec3 rockGroundPlane; varying float vRockGround;' : ''}
      ${groundDust ? 'attribute float baseDustCoverage; varying float vBaseDustCoverage;' : ''}
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
       vSurfacePosition = (modelMatrix * surfaceWorld).xyz;
       ${rockDust ? 'vRockGround = rockGroundPlane.x + dot(rockGroundPlane.yz, vSurfacePosition.xz);' : ''}
       ${groundDust ? 'vBaseDustCoverage = baseDustCoverage;' : ''}`,
    );
    shader.fragmentShader = `
      varying vec3 vSurfacePosition;
      varying vec3 vSurfaceNormal;
      ${rockDust ? 'varying float vRockGround;' : ''}
      ${groundDust ? 'varying float vBaseDustCoverage;' : ''}
      uniform vec3 surfaceGroundTint;
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
        ${groundDust ? `// Shared stochastic offsets for albedo, normals, roughness and AO.
        if(distance(vSurfacePosition,cameraPosition)>180.0)return vec3(.5);
        // Three triangle-corner samples replace the three old triplanar reads.
        vec2 grid=p.xz*.28;
        vec2 cell=floor(grid), f=fract(grid);
        float upper=step(1.0,f.x+f.y);
        vec2 a=cell+vec2(upper), b=cell+vec2(1.0,0.0), c=cell+vec2(0.0,1.0);
        vec3 blend=upper<.5?vec3(1.0-f.x-f.y,f.x,f.y):vec3(f.x+f.y-1.0,1.0-f.y,1.0-f.x);
        blend=blend*blend*(3.0-2.0*blend);blend/=max(dot(blend,vec3(1.0)),.0001);
        vec2 oa=vec2(surfaceHash(a),surfaceHash(a+71.0))*19.0;
        vec2 ob=vec2(surfaceHash(b),surfaceHash(b+71.0))*19.0;
        vec2 oc=vec2(surfaceHash(c),surfaceHash(c+71.0))*19.0;
        return texture2D(image,p.xz+oa).rgb*blend.x+texture2D(image,p.xz+ob).rgb*blend.y+texture2D(image,p.xz+oc).rgb*blend.z;` : ''}
        ${groundDust ? '' : `
        return texture2D(image, p.zy).rgb * weights.x
          + texture2D(image, p.xz).rgb * weights.y
          + texture2D(image, p.xy).rgb * weights.z;`}
      }
      ${shader.fragmentShader}
    `;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <aomap_fragment>',
      `#include <aomap_fragment>
       float mineralAO = surfaceSample(surfaceAO, surfaceP, surfaceBlend).r;
       reflectedLight.indirectDiffuse *= mix(1.0,mix(${role === 'dust' ? '0.9' : '0.65'},1.0,mineralAO),${groundDust ? 'terrainDetailRange' : '1.0'});
       reflectedLight.indirectSpecular *= mix(1.0,mix(0.75,1.0,mineralAO),${groundDust ? 'terrainDetailRange' : '1.0'});`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
       vec3 surfaceP = vSurfacePosition * surfaceScale;
       ${role === 'dust' ? `// All maps share a continuous warp; texture-read count stays unchanged.
       surfaceP.xz += vec2(surfaceNoise(vSurfacePosition.xz * .16),
         surfaceNoise(vSurfacePosition.xz * .16 + 37.0)) * .65;` : ''}
       vec3 surfaceBlend = surfaceWeights();
       ${groundDust ? 'float terrainDetailRange=1.0-smoothstep(55.0,180.0,length(vViewPosition));' : ''}
       vec3 mineral = surfaceSample(surfaceColor, surfaceP, surfaceBlend);
       float mineralLuma = dot(mineral, vec3(0.2126, 0.7152, 0.0722));
       float mineralDetail = clamp(mineralLuma / surfaceAlbedoReference, 0.55, 1.55);
       float macroVariation = surfaceNoise(vSurfacePosition.xz * 0.11)
         * 0.7 + surfaceNoise(vSurfacePosition.xz * 0.037 + 18.0) * 0.3;
       ${groundDust ? `macroVariation=mix(.2+surfaceNoise(vSurfacePosition.xz*.012+31.0)*.6,
         macroVariation,terrainDetailRange);` : ''}
       diffuseColor.rgb *= mix(1.0, mineralDetail, ${groundDust ? '.65*terrainDetailRange' : role === 'dust' ? '0.65' : '0.7'})
         * (${groundDust ? '0.85 + macroVariation * 0.28' : role === 'dust' ? '0.94 + macroVariation * 0.12' : '0.88 + macroVariation * 0.24'});
       ${groundDust ? `float hardpan=smoothstep(.38,.73,macroVariation);
       diffuseColor.rgb*=mix(vec3(.82,.79,.75),vec3(1.07,1.02,.94),hardpan);
       // Resolvable centimetre aggregate between the larger instanced gravel chips.
       vec2 aggregateUV=vSurfacePosition.xz*8.0;
       vec2 aggregateCell=floor(aggregateUV),aggregateLocal=fract(aggregateUV);
       vec2 aggregateCenter=.22+vec2(surfaceHash(aggregateCell+19.0),surfaceHash(aggregateCell+53.0))*.56;
       vec2 aggregateDelta=aggregateLocal-aggregateCenter;
       float aggregateAngle=surfaceHash(aggregateCell+113.0)*6.283185;
       mat2 aggregateRotation=mat2(cos(aggregateAngle),-sin(aggregateAngle),sin(aggregateAngle),cos(aggregateAngle));
       vec2 aggregateShape=aggregateRotation*aggregateDelta;
       aggregateShape.y*=.7+surfaceHash(aggregateCell+147.0)*1.3;
       float aggregateRadius=.07+pow(surfaceHash(aggregateCell+91.0),1.6)*.24;
       float aggregateR=length(aggregateShape)/aggregateRadius;
       float aggregateResolve=1.0-smoothstep(.30,.85,max(length(dFdx(aggregateUV)),length(dFdy(aggregateUV))));
       float aggregateDensity=.12+surfaceNoise(vSurfacePosition.xz*.24+83.0)*.72;
       float aggregatePresent=step(1.0-aggregateDensity,surfaceHash(aggregateCell+7.0));
       float aggregateMask=(1.0-smoothstep(.72,1.0,aggregateR))*aggregateResolve*aggregatePresent;
       float aggregateCore=1.0-smoothstep(.12,.85,aggregateR);
       vec3 aggregateTint=mix(vec3(.44,.43,.41),vec3(.92,.86,.75),aggregateCore);
       diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*aggregateTint,aggregateMask*.78);
       vec2 aggregateSlope=aggregateDelta/aggregateRadius*(1.0-smoothstep(.3,1.0,aggregateR))*aggregateMask*.8;` : ''}
       float depositedDust = smoothstep(0.45, 0.95, normalize(vSurfaceNormal).y)
         * surfaceDust * surfaceNoise(vSurfacePosition.xz * 0.72);
       diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.25, 1.12, 0.91), depositedDust);
       float surfaceDustCoverage = 0.0;
       ${rockDust ? `float contactHeight = max(0.0, vSurfacePosition.y - vRockGround);
       float contactDust = 1.0 - smoothstep(.03, .45, contactHeight + (macroVariation-.5)*.16);
       surfaceDustCoverage = max(contactDust*.62, depositedDust*.65);
       diffuseColor.rgb = mix(diffuseColor.rgb, surfaceGroundTint * (.94 + macroVariation*.12), surfaceDustCoverage);` : ''}
       ${groundDust ? `surfaceDustCoverage = clamp(vBaseDustCoverage,0.0,1.0);
       diffuseColor.rgb *= mix(1.0,1.05,surfaceDustCoverage);` : ''}`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
       float mineralRoughness = surfaceSample(surfaceRoughness, surfaceP, surfaceBlend).g;
       roughnessFactor = clamp(roughness * (0.58 + mineralRoughness * 0.51), 0.53, 1.0);
       ${groundDust ? 'roughnessFactor=mix(roughness,roughnessFactor,terrainDetailRange);' : ''}
       ${options.terrainDust ? 'roughnessFactor = mix(roughnessFactor,.98,surfaceDustCoverage);' : ''}`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      `#include <normal_fragment_maps>
       ${groundDust ? `vec3 rockNX=vec3(0.0), rockNZ=vec3(0.0);
       vec3 rockNY=surfaceSample(surfaceNormal,surfaceP,surfaceBlend)*2.0-1.0;` : `vec3 rockNX = texture2D(surfaceNormal, surfaceP.zy).xyz * 2.0 - 1.0;
       vec3 rockNY = texture2D(surfaceNormal, surfaceP.xz).xyz * 2.0 - 1.0;
       vec3 rockNZ = texture2D(surfaceNormal, surfaceP.xy).xyz * 2.0 - 1.0;`}
       vec3 worldDetail = vec3(0.0, rockNX.y, rockNX.x) * surfaceBlend.x
         + vec3(rockNY.x, 0.0, rockNY.y) * surfaceBlend.y
         + vec3(rockNZ.x, rockNZ.y, 0.0) * surfaceBlend.z;
       ${role === 'dust' ? `float footprint = max(length(dFdx(surfaceP)), length(dFdy(surfaceP)));
       float detailFade = (1.0 - smoothstep(18.0, 65.0, length(vViewPosition)))
         * (1.0 - smoothstep(.03, .2, footprint));`
         : 'float detailFade = 1.0 - smoothstep(32.0, 110.0, length(vViewPosition));'}
       vec3 worldSurfaceNormal = normalize(vSurfaceNormal + worldDetail
         * surfaceNormalStrength * ${role === 'dust' ? 'detailFade' : 'mix(0.3, 1.0, detailFade)'}
         ${options.terrainDust ? `* mix(1.0,${rockDust ? '.45' : '.75'},surfaceDustCoverage)` : ''}
         ${groundDust ? '+vec3(aggregateSlope.x,0.0,aggregateSlope.y)' : ''});
       normal = normalize(mat3(viewMatrix) * worldSurfaceNormal);`,
    );
  };
  material.customProgramCacheKey = () => `triplanar-mineral-${role}-${Boolean(options.terrainDust)}-v8`;
  material.userData.surfaceRole = role;
  return material;
}

export function rockVertexColor(value: number): Color {
  return new Color().setRGB(value * 1.02, value, value * 0.96);
}
