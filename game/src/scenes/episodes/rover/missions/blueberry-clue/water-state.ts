const smooth=(a:number,b:number,t:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
/** Explanatory timeline, not a geochemical model. All outputs reset on every exit. */
export function reconstructionFrame(active:boolean,elapsed:number,reduced=false){
 if(!active)return {wetness:0,front:-.012,stage:'dry'};
 if(reduced)return {wetness:.85,front:.044,stage:'overview'};
 const t=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
 return {
  wetness:smooth(.6,1.6,t)*(1-smooth(8.2,11.4,t)),
  front:-.012+.057*smooth(.8,5.3,t),
  stage:t<4.5?'pores':t<8.3?'minerals':'exposure',
 };
}
