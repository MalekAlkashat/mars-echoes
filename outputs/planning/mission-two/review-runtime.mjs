import { chromium } from 'file:///C:/Users/Yooms/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const tag = process.argv[2] || 'baseline';
const out = new URL(`./review-${tag}/`, import.meta.url);
await fs.mkdir(out, {recursive:true});
const browser = await chromium.launch({channel:'chromium',headless:true, args:['--enable-webgl','--ignore-gpu-blocklist']});
console.log('Browser launched');
const page = await browser.newPage({viewport:{width:1440,height:900}});
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory');
console.log('Page loaded');
try { await page.waitForFunction(()=>window.__purgatoryReview,null,{timeout:60000}); }
catch(e) { console.log(JSON.stringify({errors,body:await page.locator('body').innerText()})); await page.screenshot({path:fileURLToPath(new URL('load-failed.png',out))}); await browser.close(); throw e; }
await page.getByRole('button',{name:/Begin planning|Begin driving/}).click();
console.log('Scene started');
await page.waitForTimeout(1500);
const state=()=>page.evaluate(()=>window.__purgatoryReview.state());
const start=await state();
await page.keyboard.down('w'); await page.waitForTimeout(2000); await page.keyboard.up('w');
await page.waitForTimeout(100); const afterW=await state();
await page.screenshot({path:fileURLToPath(new URL('practice.png',out))});
const timings=await page.evaluate(()=>new Promise(resolve=>{
 const samples=[]; let last=performance.now();
 const tick=now=>{samples.push(now-last);last=now;if(samples.length<180)requestAnimationFrame(tick);else resolve(samples);};requestAnimationFrame(tick);
}));
await page.getByRole('button',{name:'Run the sol 446 drive'}).click();
const t=Date.now(); await page.waitForFunction(()=>window.__purgatoryReview.state().phase==='recover',null,{timeout:45000});
const replayMs=Date.now()-t, recover=await state();
await page.screenshot({path:fileURLToPath(new URL('recover.png',out))});
const sorted=timings.slice().sort((a,b)=>a-b);
const result={tag,start,afterW,replayMs,recover,frame:{meanMs:timings.reduce((a,b)=>a+b)/timings.length,p50:sorted[90],p95:sorted[171]},errors,datasets:await page.locator('#scene').evaluate(e=>({...e.dataset}))};
await fs.writeFile(new URL('runtime.json',out),JSON.stringify(result,null,2));
console.log(JSON.stringify(result)); await browser.close();
