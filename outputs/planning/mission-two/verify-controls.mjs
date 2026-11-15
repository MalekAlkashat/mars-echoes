import { chromium } from 'file:///C:/Users/Yooms/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const out=new URL('./review-controls/',import.meta.url); await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:fileURLToPath(out),size:{width:1440,height:900}}});
const page=await context.newPage(), errors=[], failed=[], evidence={};
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push([r.status(),r.url()]);});
const state=()=>page.evaluate(()=>window.__purgatoryReview.state());
const hold=async(key,ms)=>{await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);await page.waitForTimeout(120);};
const snap=async name=>page.screenshot({path:fileURLToPath(new URL(name+'.png',out))});
try {
 await page.goto('http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory');
 await page.getByRole('button',{name:'Begin driving'}).click(); await page.waitForTimeout(600);
 evidence.start=await state(); await snap('practice');
 await hold('w',700); evidence.w=await state(); assert.ok(+evidence.w.odoMoved>0.5);
 await hold('s',700); evidence.s=await state(); assert.notEqual(evidence.w.position,evidence.s.position);
 await hold('a',300); evidence.a=await state(); assert.ok(+evidence.a.heading>0.2);
 await hold('d',300); evidence.d=await state(); assert.ok(Math.abs(+evidence.d.heading)<0.06);
 const stationary=(await state()).position; await page.waitForTimeout(500);assert.equal((await state()).position,stationary);
 await page.locator('.pg-planner summary').click();await page.getByRole('button',{name:'Reverse 2 m',exact:true}).click();
 await page.keyboard.press('e');await page.waitForTimeout(150);assert.equal((await state()).busy,true);
 await hold('w',200);evidence.takeover=await state();assert.equal(evidence.takeover.busy,false);assert.equal(evidence.takeover.queued,0);
 await page.keyboard.down('w');await page.waitForTimeout(150);await page.keyboard.press('Escape');
 const paused=(await state()).position;await page.waitForTimeout(300);await page.keyboard.up('w');assert.equal((await state()).position,paused);
 await page.getByRole('button',{name:'Resume',exact:true}).click();await page.waitForTimeout(250);assert.equal((await state()).position,paused);
 evidence.pauseClearsHeld=true;
 await page.getByRole('button',{name:'Run the sol 446 drive'}).click();
 await page.waitForFunction(()=>window.__purgatoryReview.state().phase==='replay');
 const replayStart=await state();await hold('w',200);evidence.replayIgnoresManual=(await state()).control==='replay';assert.equal(evidence.replayIgnoresManual,true);
 await page.waitForFunction(()=>window.__purgatoryReview.state().phase==='recover');evidence.mired=await state();await snap('mired');
 // Direct input must take over the inspection camera and keep the sand simulation.
 await hold('w',450);evidence.manualRecovery=await state();assert.equal(evidence.manualRecovery.cameraMode,'chase');assert.ok(+evidence.manualRecovery.softnessUnder>0);
 let plans=0;const recoveryStart=Date.now();
 while((await state()).phase!=='free' && plans<12){
  for(let i=0;i<3;i++)await page.getByRole('button',{name:'Forward 0.5 m',exact:true}).click();
  await page.keyboard.press('e');await page.waitForFunction(()=>window.__purgatoryReview.state().busy);
  await page.waitForFunction(()=>!window.__purgatoryReview.state().busy);plans++;
 }
 evidence.recovery={plans,realTimeMs:Date.now()-recoveryStart,state:await state()};assert.equal(evidence.recovery.state.phase,'free');
 await page.waitForTimeout(200);await page.locator('.pg-planner summary').click();await snap('free');
 await page.keyboard.press('Escape');await page.locator('#restart-button').click();await page.waitForTimeout(300);
 evidence.restart=await state();assert.equal(evidence.restart.phase,'practice');assert.equal(evidence.restart.position,'0.000,-7.600');assert.equal(evidence.restart.meanSink,'0.000');
 evidence.resourcesAfter=await page.locator('#scene').evaluate(el=>({...el.dataset}));
 await page.setViewportSize({width:960,height:640});await page.waitForTimeout(250);await snap('laptop');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);await snap('narrow');
 evidence.narrow=await page.locator('.purgatory-panel').evaluate(el=>({width:el.clientWidth,scroll:document.documentElement.scrollWidth,viewport:innerWidth,bottom:el.getBoundingClientRect().bottom}));
 assert.equal(evidence.narrow.scroll,evidence.narrow.viewport);
 await page.setViewportSize({width:1440,height:900});
 await page.keyboard.press('Escape');await page.locator('#leave-button').click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.sceneId==='mars-hub');
 evidence.returnToHub=await page.locator('#scene').evaluate(el=>({...el.dataset}));assert.equal(await page.locator('.purgatory-panel').count(),0);
 evidence.errors=errors;evidence.failedRequests=failed;assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 await fs.writeFile(new URL('checks.json',out),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
} catch(error){await snap('failure');console.log(JSON.stringify({error:String(error),state:await state().catch(()=>null),errors,failed}));throw error;}
finally {await context.close();await browser.close();}
