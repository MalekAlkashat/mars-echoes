/** Authored Eagle-inspired exposure. Metres; not a surveyed crater reconstruction. */
export const SITE={spawn:[4,7] as const,heading:.4,work:[0,-1.5] as const,boundary:11};
export type Slab={id:string;x:number;z:number;width:number;depth:number;height:number;yaw:number;burial:number};
const beds=[
 [-7.5,3.5,2.4,1.6,.24,.5],[-6.1,2.4,2.1,1.8,.20,.1],[-5.7,.1,2.7,1.5,.19,-.2],
 [-4.9,-1.8,2.3,1.7,.16,.25],[-7.0,-2.1,2.4,1.6,.23,.06],[-6,-4.2,2.8,2,.26,-.3],
 [-3.8,-4.7,2.4,1.6,.20,-.15],[-1.8,-4.7,1.7,1.3,.12,.15],[.1,-4.8,2.3,1.6,.13,.04],
 [1.6,-5.6,1.3,1.3,.12,.3],[-2,-6.3,2.6,1.6,.21,-.3],[-4.5,-6.8,2.4,1.6,.26,.4],
 [-7.8,-5.6,2.1,1.6,.18,-.1],[-8.4,-.5,1.6,2.3,.17,.2],[-8.6,4.8,1.1,.8,.09,-.6],
 [4.2,-7.9,2.0,1.3,.15,-.4],[5.6,-7.2,2.1,1.6,.19,.1],[6.6,-8.6,1.5,1.2,.12,.55],
 [7.6,-5.7,1.3,.9,.1,.3],[-3.6,-9,1.6,1.1,.12,-.8],[-6.8,6.7,1.4,.8,.09,-.5],
];
export const SLABS:readonly Slab[]=beds.map(([x,z,width,depth,height,yaw],i)=>({id:`eagle-bed-${i}`,x,z,width,depth,height,yaw,burial:height*(.22+(i%4)*.09)}));
// Conservative bounds include the existing eroded mesh's 12% lateral deformation.
export const slabRadius=(s:Slab)=>Math.hypot(s.width,s.depth)*.62;
export const siteObstacles=()=>SLABS.map(s=>({x:s.x,z:s.z,radius:slabRadius(s)}));
