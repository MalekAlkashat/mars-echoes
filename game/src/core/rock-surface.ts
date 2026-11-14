import { InstancedMesh, Matrix4, Mesh, Object3D, Vector3 } from 'three';

/** Static, setup-baked top surfaces. No render-mesh raycasts run during driving. */
export class RockSurface {
  private readonly columns = new Map<number, number>();
  readonly cellSize = .04;
  readonly terrain:(x:number,z:number)=>number;
  constructor(terrain: (x:number,z:number)=>number) {this.terrain=terrain;}
  get cells(): number { return this.columns.size; }
  private key(x:number,z:number): number { return (x+32768)*65536+z+32768; }

  height = (x:number,z:number):number => {
    const base=this.terrain(x,z), h=this.columns.get(this.key(Math.floor(x/this.cellSize),Math.floor(z/this.cellSize)));
    return h===undefined?base:Math.max(base,h);
  };

  add(mesh: Mesh, matrix = mesh.matrixWorld):void {
    const p=mesh.geometry.getAttribute('position'), indices=mesh.geometry.index;
    if(!p)return;
    const a=new Vector3(),b=new Vector3(),c=new Vector3();
    const count=indices?.count??p.count, cell=this.cellSize;
    for(let i=0;i<count;i+=3){
      a.fromBufferAttribute(p,indices?indices.getX(i):i).applyMatrix4(matrix);
      b.fromBufferAttribute(p,indices?indices.getX(i+1):i+1).applyMatrix4(matrix);
      c.fromBufferAttribute(p,indices?indices.getX(i+2):i+2).applyMatrix4(matrix);
      const det=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);
      if(Math.abs(det)<1e-10)continue;
      const minX=Math.floor(Math.min(a.x,b.x,c.x)/cell),maxX=Math.floor(Math.max(a.x,b.x,c.x)/cell);
      const minZ=Math.floor(Math.min(a.z,b.z,c.z)/cell),maxZ=Math.floor(Math.max(a.z,b.z,c.z)/cell);
      for(let ix=minX;ix<=maxX;ix++)for(let iz=minZ;iz<=maxZ;iz++){
        const x=(ix+.5)*cell,z=(iz+.5)*cell;
        const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/det;
        const v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/det;
        if(u<-.00001||v<-.00001||u+v>1.00001)continue;
        const h=u*a.y+v*b.y+(1-u-v)*c.y;
        if(h<=this.terrain(x,z))continue;
        const key=this.key(ix,iz);
        if(h>(this.columns.get(key)??-Infinity))this.columns.set(key,h);
      }
    }
  }

  bake(scene:Object3D):void {
    this.columns.clear();scene.updateMatrixWorld(true);
    const matrix=new Matrix4(),instance=new Matrix4();
    scene.traverse(object=>{
      if(!(object instanceof Mesh))return;
      let owner:Object3D|null=object;
      while(owner&&!/^(hub-layered-bedrock-|hub-outcrops-|hub-instanced-scattered-bedrock|hub-scanned-outcrop-preview|reference100-.*-instances|rock-physics-review-)/.test(owner.name))owner=owner.parent;
      if(!owner)return;
      if(object instanceof InstancedMesh){
        for(let i=0;i<object.count;i++){object.getMatrixAt(i,instance);matrix.multiplyMatrices(object.matrixWorld,instance);this.add(object,matrix);}
      }else this.add(object);
    });
  }
  clear():void { this.columns.clear(); }
}
