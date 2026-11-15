import {chromium} from 'file:///C:/Users/Yooms/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chromium',headless:true});
const results=[];
try {
 for (const quality of ['balanced','high']) {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  // App settings own quality and can override the query. Set preferences in this isolated test context.
  await page.addInitScript(preset=>localStorage.setItem('mars-echoes.settings.v1',JSON.stringify({graphics:preset,volume:0,muted:true,reducedMotion:false,largeText:false})),quality);
  await page.goto('http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory'+(quality==='high'?'&quality=high':''));
  await page.waitForFunction(()=>window.__purgatoryReview?.state().phase==='recover');
  await page.locator('.pg-toolbox>summary').click();await page.getByText('Inspection cameras · F',{exact:true}).click();await page.getByRole('button',{name:'Right front wheel',exact:true}).click();await page.locator('.pg-toolbox>summary').click();
  await page.waitForTimeout(2000);
  const sample=await page.evaluate(()=>new Promise(resolve=>{
   const canvas=document.querySelector('#scene'),times=[],cpu=[];let frame=canvas.dataset.renderedFrames;
   const tick=now=>{if(frame!==canvas.dataset.renderedFrames){frame=canvas.dataset.renderedFrames;times.push(now);cpu.push(+canvas.dataset.renderCpuMs);}
    if(times.length<180)requestAnimationFrame(tick);else {const intervals=times.slice(1).map((t,i)=>t-times[i]).sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);resolve({measuredFps:(times.length-1)*1000/(times.at(-1)-times[0]),intervalP50:intervals[89],intervalP95:intervals[170],submissionCpuP50:cpu[90],submissionCpuP95:cpu[171],counters:{...canvas.dataset}});}};requestAnimationFrame(tick);
  }));
  assert.equal(+sample.counters.fpsCap,quality==='high'?60:45,'verify the actual preset, not just the URL label');
  results.push({quality,...sample});await page.close();
 }
 await fs.writeFile(new URL(`./${process.argv[2] || 'review-polish'}/profile.json`,import.meta.url),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
} finally {await browser.close();}
