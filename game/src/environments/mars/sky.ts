import { BackSide, Color, ShaderMaterial, Vector3 } from 'three';

/** Artistic visible sky only: no lights, fog, environment captures or renderer ownership. */
export function createMarsSkyMaterial(reference = false, sunDirection = new Vector3(-0.18, 0.085, -1).normalize()): ShaderMaterial {
  return new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      clearHaze:{value:reference?1:0},
      horizon: { value: new Color(reference?'#edb28c':'#adb1b1') },
      ceiling: { value: new Color(reference?'#b88379':'#53606b') },
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
      uniform float time,clearHaze;
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
        if(clearHaze>.5){
          sky+=sunColor*pow(sunAngle,32.0)*.22;
          sky=mix(sky,sunColor*1.6,smoothstep(.99965,.99992,sunAngle));
          gl_FragColor=vec4(sky,1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          return;
        }

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
}
