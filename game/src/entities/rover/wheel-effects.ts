import * as THREE from 'three';

const PARTICLES = 360;
const MARKS = 768;
type Puff = { position: THREE.Vector3; velocity: THREE.Vector3; age: number; life: number; size: number };

export class WheelEffects {
  private puffs: Puff[] = Array.from({length:PARTICLES}, () => ({position:new THREE.Vector3(),velocity:new THREE.Vector3(),age:10,life:1,size:0}));
  private dustPositions = new Float32Array(PARTICLES * 3);
  private dustSizes = new Float32Array(PARTICLES);
  private dustOpacity = new Float32Array(PARTICLES);
  private dust: THREE.Points;
  private tracks: THREE.InstancedMesh;
  private birth = new THREE.InstancedBufferAttribute(new Float32Array(MARKS).fill(-1000), 1);
  private trackTime = {value:0};
  private lastTrack: (THREE.Vector3 | null)[] = Array(6).fill(null);
  private markCursor = 0;
  private puffCursor = 0;
  private emitTime = 0;
  private randomState = 47;
  private matrix = new THREE.Matrix4();
  private transform = new THREE.Object3D();

  constructor(scene: THREE.Scene, private height: (x:number,z:number)=>number) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.dustPositions,3));
    geometry.setAttribute('puffSize', new THREE.BufferAttribute(this.dustSizes,1));
    geometry.setAttribute('puffOpacity', new THREE.BufferAttribute(this.dustOpacity,1));
    const material = new THREE.ShaderMaterial({
      uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{sizeScale:{value:700},dustColor:{value:new THREE.Color('#d7a77e')}}]),
      vertexShader:`attribute float puffSize; attribute float puffOpacity; uniform float sizeScale;
        varying float vOpacity;
        #include <fog_pars_vertex>
        void main(){vOpacity=puffOpacity;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
          gl_PointSize=clamp(puffSize*sizeScale/max(.1,-mvPosition.z),1.,90.);
          #include <fog_vertex>
        }`,
      fragmentShader:`uniform vec3 dustColor;varying float vOpacity;
        #include <fog_pars_fragment>
        void main(){vec2 p=gl_PointCoord-.5;float radius=length(p*vec2(1.,.88));
          float a=exp(-radius*radius*15.)*smoothstep(.5,.31,radius)*vOpacity;
          if(a<.002)discard;gl_FragColor=vec4(dustColor,a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
      transparent:true,depthWrite:false,fog:true,
    });
    this.dust = new THREE.Points(geometry,material);
    this.dust.name = 'wheel-contact-mineral-dust';
    this.dust.frustumCulled = false;
    this.dust.userData.excludeAO = true;
    scene.add(this.dust);

    const stamp = document.createElement('canvas');
    stamp.width = 128;stamp.height = 256;
    const context = stamp.getContext('2d')!;
    context.fillStyle = '#ffffff';
    for(let row=0;row<2;row++) {
      const y=row*128+36;
      context.beginPath();context.moveTo(10,y+6);context.lineTo(57,y+17);context.lineTo(57,y+26);context.lineTo(10,y+15);context.closePath();context.fill();
      context.beginPath();context.moveTo(71,y+17);context.lineTo(118,y+6);context.lineTo(118,y+15);context.lineTo(71,y+26);context.closePath();context.fill();
    }
    const texture = new THREE.CanvasTexture(stamp);
    const treadGeometry = new THREE.PlaneGeometry(1,1);
    treadGeometry.setAttribute('markBirth',this.birth);
    const treadMaterial = new THREE.MeshStandardMaterial({color:0x70401e,alphaMap:texture,transparent:true,opacity:0.25,roughness:1,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
    treadMaterial.onBeforeCompile = shader => {
      shader.uniforms.trailTime = this.trackTime;
      shader.vertexShader = `attribute float markBirth; varying float vMarkAge; uniform float trailTime;\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMarkAge=trailTime-markBirth;');
      shader.fragmentShader = `varying float vMarkAge;\n${shader.fragmentShader}`;
      shader.fragmentShader = shader.fragmentShader.replace('#include <alphamap_fragment>','#include <alphamap_fragment>\ndiffuseColor.a*=1.-smoothstep(65.,90.,vMarkAge);');
    };
    treadMaterial.customProgramCacheKey=()=> 'rover-contact-track-v2';
    this.tracks = new THREE.InstancedMesh(treadGeometry,treadMaterial,MARKS);
    this.tracks.name = 'wheel-contact-tread-impressions';
    this.tracks.frustumCulled = false;
    this.tracks.receiveShadow = true;
    this.tracks.userData.excludeAO = true;
    scene.add(this.tracks);
    this.reset();
  }

  setView(fov:number, pixelHeight:number):void {
    (this.dust.material as THREE.ShaderMaterial).uniforms.sizeScale.value=pixelHeight/(2*Math.tan(THREE.MathUtils.degToRad(fov*.5)));
  }

  reset():void {
    for(const puff of this.puffs)puff.age=10;
    this.dustOpacity.fill(0);
    this.lastTrack.fill(null);this.markCursor=0;this.puffCursor=0;this.emitTime=0;this.randomState=47;
    this.birth.array.fill(-1000);this.birth.needsUpdate=true;
    this.matrix.makeScale(0,0,0);
    for(let i=0;i<MARKS;i++)this.tracks.setMatrixAt(i,this.matrix);
    this.tracks.instanceMatrix.needsUpdate=true;
  }

  private random():number {
    this.randomState=(Math.imul(this.randomState,1664525)+1013904223)>>>0;
    return this.randomState/4294967296;
  }

  update(dt:number,time:number,contacts:readonly THREE.Vector3[],speed:number,heading:number,grounded:readonly boolean[]):void {
    this.trackTime.value=time;
    const moving=Math.abs(speed)>.08;
    this.emitTime+=dt;
    if(moving && this.emitTime>.055) {
      this.emitTime=0;
      contacts.forEach((contact,index)=> {
        if(!grounded[index])return;
        const puff=this.puffs[this.puffCursor++%PARTICLES];
        puff.position.copy(contact);puff.position.y+=.025;
        puff.position.x+=(this.random()-.5)*.1;
        puff.position.z+=(this.random()-.5)*.1;
        puff.velocity.set(Math.sin(heading)*speed*.12+(this.random()-.5)*.14+.08,.06+this.random()*.13,Math.cos(heading)*speed*.12+(this.random()-.5)*.1);
        puff.age=0;puff.life=1.1+this.random()*.8;puff.size=.12+this.random()*.13;
      });
    }
    for(let i=0;i<PARTICLES;i++) {
      const puff=this.puffs[i];puff.age+=dt;
      if(puff.age>=puff.life){this.dustOpacity[i]=0;continue;}
      puff.position.addScaledVector(puff.velocity,dt);
      puff.velocity.multiplyScalar(Math.exp(-dt*.8));puff.velocity.y-=dt*.025;
      const t=puff.age/puff.life;
      puff.position.toArray(this.dustPositions,i*3);
      this.dustSizes[i]=puff.size*(.3+t*2.5);
      this.dustOpacity[i]=Math.sin(Math.PI*t)*.115;
    }
    for(const name of ['position','puffSize','puffOpacity'])(this.dust.geometry.getAttribute(name) as THREE.BufferAttribute).needsUpdate=true;

    for(const index of [2,5]) {
      const contact=contacts[index];
      if(!contact || !grounded[index] || !moving){this.lastTrack[index]=null;continue;}
      const previous=this.lastTrack[index];
      if(!previous){this.lastTrack[index]=contact.clone();continue;}
      const length=contact.distanceTo(previous);
      if(length<.14)continue;
      if(length>1){this.lastTrack[index]=contact.clone();continue;}
      const middle=previous.clone().add(contact).multiplyScalar(.5);
      const e=.08;
      const normal=new THREE.Vector3(this.height(middle.x-e,middle.z)-this.height(middle.x+e,middle.z),e*2,this.height(middle.x,middle.z-e)-this.height(middle.x,middle.z+e)).normalize();
      const tangent=contact.clone().sub(previous).normalize();
      const side=tangent.clone().cross(normal).normalize();
      tangent.copy(normal).cross(side).normalize();
      this.matrix.makeBasis(side,tangent,normal);
      this.transform.quaternion.setFromRotationMatrix(this.matrix);
      this.transform.position.copy(middle);this.transform.position.y=this.height(middle.x,middle.z)+.012;
      this.transform.scale.set(.19,length*1.05,1);this.transform.updateMatrix();
      const slot=this.markCursor++%MARKS;
      this.tracks.setMatrixAt(slot,this.transform.matrix);
      this.birth.setX(slot,time);
      this.lastTrack[index]=contact.clone();
    }
    this.tracks.instanceMatrix.needsUpdate=true;
    this.birth.needsUpdate=true;
  }
}
