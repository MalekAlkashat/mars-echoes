import {MathUtils,Matrix4,Quaternion,Vector3,type PerspectiveCamera} from 'three';

export const RETURN_REVEAL_SECONDS=3.4;

/** A scene-owned shot. The controller/bookmark and the silent machine never move. */
export class ReturnShot {
  private readonly end:Vector3;
  private readonly endQ:Quaternion;
  private readonly center:Vector3;
  private readonly target:Vector3;
  private readonly position=new Vector3();
  private readonly orientation=new Quaternion();
  private readonly matrix=new Matrix4();
  private readonly radius:number;
  private readonly angle:number;
  private readonly lens:{fov:number;zoom:number;near:number;far:number;view:PerspectiveCamera['view']};
  private readonly camera:PerspectiveCamera;
  private readonly height:(x:number,z:number)=>number;
  constructor(camera:PerspectiveCamera,spirit:Vector3,wreck:Vector3,height:(x:number,z:number)=>number){
    this.camera=camera;this.height=height;
    this.end=camera.position.clone();this.endQ=camera.quaternion.clone();
    this.center=spirit.clone();this.target=spirit.clone().lerp(wreck,.42);this.target.y=spirit.y+.38;
    this.radius=Math.hypot(this.end.x-spirit.x,this.end.z-spirit.z);
    this.angle=Math.atan2(this.end.x-spirit.x,this.end.z-spirit.z);
    this.lens={fov:camera.fov,zoom:camera.zoom,near:camera.near,far:camera.far,view:camera.view?{...camera.view}:null};
  }
  apply(seconds:number,reduced:boolean,narrow:boolean){
    // Reduced motion keeps the same two subjects, then makes one deliberate cut.
    const t=reduced?(seconds<2.7?0:1):MathUtils.smootherstep(seconds,.75,3.2);
    const a=this.angle+1.05*(1-t),r=MathUtils.lerp(Math.max(narrow?11.8:6.2,this.radius),this.radius,t);
    this.position.set(this.center.x+Math.sin(a)*r,MathUtils.lerp(this.center.y+2.15,this.end.y,t),this.center.z+Math.cos(a)*r);
    this.position.y=Math.max(this.position.y,this.height(this.position.x,this.position.z)+.4);
    this.matrix.lookAt(this.position,this.target,this.camera.up);this.orientation.setFromRotationMatrix(this.matrix);
    this.camera.position.copy(t===1?this.end:this.position);
    this.camera.quaternion.slerpQuaternions(this.orientation,this.endQ,t);
    this.camera.fov=MathUtils.lerp(narrow?48:44,this.lens.fov,t);this.camera.zoom=this.lens.zoom;
    this.camera.near=this.lens.near;this.camera.far=this.lens.far;
    this.camera.clearViewOffset();
    const v=this.lens.view;
    if(v?.enabled)this.camera.setViewOffset(v.fullWidth,v.fullHeight,v.offsetX,v.offsetY,v.width,v.height);
    if(narrow&&t<1)this.camera.setViewOffset(1000*this.camera.aspect,1000,0,110*(1-t),1000*this.camera.aspect,1000);
    this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  }
}
