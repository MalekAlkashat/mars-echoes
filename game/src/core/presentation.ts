import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class ContactAO extends GTAOPass {
  override setSize(width:number,height:number):void {super.setSize(Math.max(1,Math.round(width*.55)),Math.max(1,Math.round(height*.55)));}
  override render(renderer:THREE.WebGLRenderer,write:THREE.WebGLRenderTarget,read:THREE.WebGLRenderTarget):void {
    const hidden:THREE.Object3D[]=[];
    this.scene.traverseVisible(object=>{if(object.userData.excludeAO){hidden.push(object);object.visible=false;}});
    try{super.render(renderer,write,read,0,false);}finally{hidden.forEach(object=>{object.visible=true;});}
  }
}

export function createRenderer(canvas:HTMLCanvasElement):THREE.WebGLRenderer {
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.2:1.5));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  return renderer;
}

export function createPresentation(renderer:THREE.WebGLRenderer,scene:THREE.Scene,camera:THREE.PerspectiveCamera) {
  const buffer=new THREE.WebGLRenderTarget(innerWidth,innerHeight,{type:THREE.HalfFloatType,samples:2});
  const composer=new EffectComposer(renderer,buffer);
  const renderPass = new RenderPass(scene,camera);
  composer.addPass(renderPass);
  const ao=new ContactAO(scene,camera);
  ao.blendIntensity=.52;
  ao.updateGtaoMaterial({radius:.32,thickness:.18,distanceExponent:1.5,distanceFallOff:1.1,scale:1,samples:12,screenSpaceRadius:false});
  ao.updatePdMaterial({radius:4,samples:8,rings:2,lumaPhi:8,depthPhi:4,normalPhi:3});
  composer.addPass(ao);
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.14,.4,1.35);
  composer.addPass(bloom);
  const film=new ShaderPass({
    uniforms:{tDiffuse:{value:null},time:{value:0},degraded:{value:0}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform sampler2D tDiffuse;uniform float time,degraded;varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){vec2 uv=vUv;uv.x+=degraded*sin(uv.y*83.+time*16.)*.0014;
        vec3 c=texture2D(tDiffuse,uv).rgb;
        float luminance=dot(c,vec3(.2126,.7152,.0722));
        c*=mix(vec3(.94,.985,1.045),vec3(1.025,1.,.97),smoothstep(.05,.8,luminance));
        c=mix(vec3(luminance),c,.98);
        float vignette=1.-.17*pow(length((uv-.5)*1.3),1.8);c*=vignette;
        c+=(hash(gl_FragCoord.xy+floor(time*24.)*231.)-.5)*.004;
        float grey=dot(c,vec3(.2126,.7152,.0722));c=mix(c,vec3(grey)*vec3(.95,1.,1.02),degraded*.65);
        c*=1.-degraded*.10*sin(uv.y*1200.);gl_FragColor=vec4(max(c,0.),1.);}`,
  });
  composer.addPass(film);
  composer.addPass(new OutputPass());
  return {composer,film,ao,
    bind(scene:THREE.Scene,camera:THREE.PerspectiveCamera){
      renderPass.scene=scene;renderPass.camera=camera;ao.scene=scene;ao.camera=camera;
      film.uniforms.degraded.value=0;
    },
    resize(){composer.setSize(innerWidth,innerHeight);},
    dispose(){composer.passes.forEach(pass=>pass.dispose());composer.dispose();},
  };
}
