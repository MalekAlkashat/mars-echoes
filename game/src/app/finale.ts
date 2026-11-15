/** Ending presentation is separate from earned chapter/reward state. */
export type FinaleState = {status:'pending'|'complete'; presentation:'slideshow-v2'};
export function newFinale():FinaleState {return {status:'pending',presentation:'slideshow-v2'};}
export function parseFinale(value:unknown):FinaleState|undefined {
  if(!value||typeof value!=='object'||Array.isArray(value))return;
  const v=value as Record<string,unknown>;
  if(v.status!=='pending'&&v.status!=='complete')return;
  if(v.presentation==='slideshow-v2')return {status:v.status,presentation:'slideshow-v2'};
  // Valid former quiz saves retain completion; obsolete answers are discarded.
  if(v.presentation!==undefined||!Array.isArray(v.answers)||v.answers.length>3||
    !v.answers.every(n=>Number.isInteger(n)&&n>=0&&n<=2)||v.status==='complete'&&v.answers.length!==3)return;
  return {status:v.status,presentation:'slideshow-v2'};
}
