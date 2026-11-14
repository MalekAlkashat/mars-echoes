import * as T from 'three';
import {reconstructionFrame} from './water-state.ts';

/** One fixed specimen, one wetting field across its rock and adjacent sediment. */
export function createReconstruction(parent:T.Group,rock:T.MeshStandardMaterial,sand:T.MeshStandardMaterial,berries:T.InstancedMesh){
 const amount={value:0},front={value:-.012};
 for(const material of [rock,sand]){
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
  material.onBeforeCompile=(shader,renderer)=>{
   compile.call(material,shader,renderer);
   shader.uniforms.m1WetAmount=amount;shader.uniforms.m1WetFront=front;shader.uniforms.m1WetOrigin={value:parent.position};
   shader.vertexShader='varying vec3 m1WetP;uniform vec3 m1WetOrigin;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
    vec4 m1Position=vec4(transformed,1.);
    #ifdef USE_INSTANCING
     m1Position=instanceMatrix*m1Position;
    #endif
    m1WetP=(modelMatrix*m1Position).xyz-m1WetOrigin;
   `);
   shader.fragmentShader=`varying vec3 m1WetP;uniform float m1WetAmount;uniform float m1WetFront;
    float m1Hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float m1Noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(m1Hash(i),m1Hash(i+vec2(1,0)),f.x),mix(m1Hash(i+vec2(0,1)),m1Hash(i+vec2(1,1)),f.x),f.y);}
   `+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float m1Wet=0.;
    if(m1WetAmount>.0001){
     float poreBoundary=m1WetP.y+m1WetP.x*.04+(m1Noise(m1WetP.xz*90.)-.5)*.006+(m1Noise(m1WetP.xz*270.)-.5)*.0015;
     float apron=1.-smoothstep(.155,.235,length(m1WetP.xz*vec2(1.,1.2))+(m1Noise(m1WetP.xz*45.)-.5)*.035);
     m1Wet=m1WetAmount*apron*(1.-smoothstep(m1WetFront-.004,m1WetFront+.004,poreBoundary));
    }
    diffuseColor.rgb*=mix(1.,.49,m1Wet);
   `);
   shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    roughnessFactor=mix(roughnessFactor,max(.38,roughnessFactor*.56),m1Wet);
   `);
  };
  material.customProgramCacheKey=()=>key()+'|anchored-wetness-v3';
 }
 const mineral=new T.MeshStandardMaterial({color:'#625d53',roughness:.88,transparent:true,opacity:0,depthWrite:false});
 const embedded=new T.InstancedMesh(berries.geometry,mineral,36),matrix=new T.Matrix4();
 for(let i=0;i<embedded.count;i++){berries.getMatrixAt(i*4,matrix);matrix.elements[13]-=.0016;embedded.setMatrixAt(i,matrix);}
 embedded.name='inferred-embedded-concretions';embedded.receiveShadow=true;embedded.visible=false;parent.add(embedded);
 const grainMaterial=berries.material as T.MeshStandardMaterial;grainMaterial.transparent=true;
 let state=reconstructionFrame(false,0);
 return {
  embedded,
  update(active:boolean,elapsed:number,reduced:boolean){
   state=reconstructionFrame(active,elapsed,reduced);amount.value=state.wetness;front.value=state.front;
   embedded.visible=active&&state.embedded>.001;mineral.opacity=state.embedded;
   grainMaterial.opacity=state.exposed;berries.castShadow=state.exposed>.95;
   return state;
  },
  debug(){return {...state};},
 };
}
