import {
  AdditiveBlending, DataTexture, DoubleSide, FrontSide, LinearFilter, RepeatWrapping,
  RGBAFormat, ShaderMaterial, UniformsLib, UniformsUtils, type Texture,
} from 'three';

export function createFlowNoise(): DataTexture {
  const size = 128, data = new Uint8Array(size * size * 4);
  const hash = (x: number, y: number, period: number) => {
    const n = Math.sin((x % period) * 127.1 + (y % period) * 311.7 + 731) * 43758.5453;
    return n - Math.floor(n);
  };
  const value = (x: number, y: number, period: number) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy, period), b = hash(ix + 1, iy, period);
    const c = hash(ix, iy + 1, period), d = hash(ix + 1, iy + 1, period);
    return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const n = value(x / size * 8, y / size * 8, 8) * .75 + value(x / size * 16, y / size * 16, 16) * .25;
    data[i] = data[i + 1] = data[i + 2] = Math.round(n * 255); data[i + 3] = 255;
  }
  const noise = new DataTexture(data, size, size, RGBAFormat);
  noise.name = 'spirit-flow-noise-128';
  noise.wrapS = noise.wrapT = RepeatWrapping;
  noise.minFilter = noise.magFilter = LinearFilter;
  noise.needsUpdate = true;
  return noise;
}

export function createFlameFields(noise: Texture) {
  return { uTime: { value: 0 }, uMotion: { value: 0 }, uRush: { value: 0 },
    uNoise: { value: noise }, uImpact: { value: 0 }, uPulse: { value: 0 } };
}
export type FlameFields = ReturnType<typeof createFlameFields>;

const flow = `
  uniform sampler2D uNoise;
  uniform float uTime, uMotion, uRush, uPulse;
  float flowNoise(vec2 uv) {
    return texture2D(uNoise, uv * .13).r * .65 + texture2D(uNoise, uv * .31 + .37).r * .35;
  }
`;

export function createFlameMaterial(fields: FlameFields, shell: boolean): ShaderMaterial {
  return new ShaderMaterial({
    name: shell ? 'spirit-blue-flame-envelope' : 'spirit-white-cyan-nucleus',
    uniforms: { ...UniformsUtils.clone(UniformsLib.fog), ...fields, uShell: { value: Number(shell) } },
    transparent: true, depthWrite: false, side: FrontSide, fog: true,
    vertexShader: `
      uniform float uTime, uMotion, uRush, uShell, uImpact, uPulse;
      varying vec2 vUv;
      varying float vFacing, vTail;
      #include <fog_pars_vertex>
      void main() {
        vUv = uv;
        vec3 p = position;
        float back = smoothstep(-.45, 1., p.z);
        float wave = sin(p.z * 9. - uTime * 4.5 + sin(p.y * 6.)) * .5
                   + sin(p.x * 8. + uTime * 3.2) * .5;
        vec3 q = p * mix(.245, .38, uShell);
        q.z *= 1. + uMotion * .25;
        q.y *= 1. - uImpact;
        if (uShell > .5) {
          q.xy *= 1. - pow(back, 1.6) * .7;
          q.z += pow(back, 1.8) * (.04 + uMotion * .65);
          q.x += wave * .025 * back;
          q.y += sin(uTime * 1.5 + p.z * 3.) * .025 * back;
          q.xy *= 1. + wave * .04;
        } else {
          q *= 1. + wave * .045;
          q.x += sin(p.y * 3. + uTime) * .008;
          q.y += sin(p.z * 3. - uTime * 1.2) * .01;
        }
        vTail = back;
        vec4 mvPosition = modelViewMatrix * vec4(q, 1.);
        vFacing = abs(dot(normalize(normalMatrix * normal), normalize(-mvPosition.xyz)));
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      ${flow}
      uniform float uShell;
      varying vec2 vUv;
      varying float vFacing, vTail;
      #include <fog_pars_fragment>
      void main() {
        vec2 uv = vec2(vUv.x * 5. + sin(vUv.y * 8. - uTime) * .3,
                       vUv.y * 2.5 - uTime * (.25 + uRush * .25));
        float turbulence = flowNoise(uv);
        float strand = pow(.5 + .5 * sin(vUv.x * 59. + turbulence * 8. - vUv.y * 13. - uTime * 2.), 14.);
        float facing = pow(vFacing, .7);
        vec3 blue = vec3(.008, .075, .64);
        vec3 cyan = vec3(.045, .63, 1.1);
        vec3 white = vec3(.9, 1.65, 1.8);
        vec3 color;
        float alpha;
        if (uShell > .5) {
          float breakup = smoothstep(.22 + vTail * .12, .67, turbulence);
          alpha = (.2 + strand * .28) * (.55 + breakup * .45) * pow(vFacing, 1.6);
          alpha *= 1. - smoothstep(.8, 1., vTail);
          color = mix(blue, cyan, turbulence) + white * strand * .12;
        } else {
          float heat = pow(facing, 2.2);
          color = mix(blue, cyan, smoothstep(.05, .65, facing));
          float density = .86 + turbulence * .14;
          color = mix(cyan, white, heat * .55);
          alpha = pow(smoothstep(0., .95, vFacing), 1.6) * density * .62;
        }
        alpha *= .82 + .18 * sin(uPulse - vTail * 3.);
        if (alpha < .001) discard;
        gl_FragColor = vec4(color, alpha);
        #include <fog_fragment>
      }
    `,
  });
}

export function createTrailMaterial(fields: FlameFields): ShaderMaterial {
  return new ShaderMaterial({
    name: 'spirit-flowing-world-trail', uniforms: { ...UniformsUtils.clone(UniformsLib.fog), ...fields },
    transparent: true, depthWrite: false, side: DoubleSide, forceSinglePass: true, fog: true,
    vertexShader: `
      attribute float strength;
      varying vec2 vUv;
      varying float vStrength;
      #include <fog_pars_vertex>
      void main() {
        vUv = uv; vStrength = strength;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      ${flow}
      varying vec2 vUv;
      varying float vStrength;
      #include <fog_pars_fragment>
      void main() {
        float n = flowNoise(vec2(vUv.x * 2. + vUv.y * 2., vUv.y * 5. - uTime * .7));
        float across = abs(vUv.x * 2. - 1.);
        float edge = 1. - smoothstep(.28 + n * .4, .95, across);
        float filament = pow(.5 + .5 * sin(vUv.x * 23. + n * 6. - vUv.y * 15. + uTime * 2.), 16.);
        float pulse = .72 + .28 * sin(uPulse - vUv.y * 9.);
        float alpha = edge * vStrength * (.22 + n * .37 + filament * .38) * pulse;
        if (alpha < .008) discard;
        vec3 color = mix(vec3(.015, .12, .68), vec3(.07, .58, 1.1), n);
        color += vec3(.45, 1.05, 1.25) * filament * .7;
        gl_FragColor = vec4(color, alpha);
        #include <fog_fragment>
      }
    `,
  });
}

export function createSoftGlow(ground = false): ShaderMaterial {
  return new ShaderMaterial({
    name: ground ? 'spirit-ground-light' : 'spirit-local-halo',
    uniforms: { uOpacity: { value: ground ? .14 : .2 } },
    transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, forceSinglePass: true,
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uOpacity; varying vec2 vUv;
      void main(){
        float r=length((vUv-.5)*2.);
        float a=exp(-r*r*5.)*(1.-smoothstep(.45,1.,r))*uOpacity;
        gl_FragColor=vec4(vec3(.025,.32,.85),a);
      }`,
  });
}

export function createEmberMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    name: 'spirit-pooled-embers', uniforms: { uPointScale: { value: 32 } },
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    vertexShader: `uniform float uPointScale; attribute float energy; varying float vEnergy;
      void main(){
        vEnergy=energy; vec4 p=modelViewMatrix*vec4(position,1.);
        gl_Position=projectionMatrix*p;
        gl_PointSize=energy>0. ? clamp(uPointScale*energy/max(.1,-p.z),1.,9.) : 0.;
      }`,
    fragmentShader: `varying float vEnergy;
      void main(){
        float r=length((gl_PointCoord-.5)*2.);
        if(r>1.||vEnergy<=0.)discard;
        gl_FragColor=vec4(mix(vec3(.06,.4,1.),vec3(.6,1.2,1.5),1.-r),pow(1.-r,2.)*vEnergy);
      }`,
  });
}
