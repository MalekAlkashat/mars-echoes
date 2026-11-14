export type WorldBounds = {minX:number;maxX:number;minZ:number;maxZ:number};

export function boundPosition(x:number,z:number,radius:number,bounds:WorldBounds):[number,number] {
  return [Math.max(bounds.minX+radius,Math.min(bounds.maxX-radius,x)),
    Math.max(bounds.minZ+radius,Math.min(bounds.maxZ-radius,z))];
}
