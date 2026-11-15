import { chromium } from 'file:///C:/Users/Yooms/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const out=new URL('./review-polish/',import.meta.url);await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:fileURLToPath(out),size:{width:1440,height:900}}});
const page=await context.newPage(), errors=[],failed=[],evidence={};
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push([r.status(),r.url()]);});
const state=()=>page.evaluate(()=>window.__purgatoryReview.state());
const snap=async name=>page.screenshot({path:fileURLToPath(new URL(name+'.png',out))});
const phase=async value=>page.waitForFunction(p=>window.__purgatoryReview?.state().phase===p,value,{timeout:60000});
const hold=async(key,ms)=>{await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);await page.waitForTimeout(100);};
try {
 const loadedAt=Date.now();await page.goto('http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory');
 await phase('replay');evidence.automaticStart=await state();assert.equal(await page.locator('#intro').isVisible(),false);
 await page.waitForTimeout(800);await snap('intro');
 await phase('stuck');evidence.stuck=await state();await page.waitForTimeout(1100);await snap('stuck');
 await phase('recover');await page.waitForTimeout(1400);evidence.recover=await state();await snap('recover');
 evidence.loadToRecoveryMs=Date.now()-loadedAt;
 assert.equal(evidence.recover.tracksVisible,false);
 await page.waitForTimeout(1500);evidence.recoveryCounters=await page.locator('#scene').evaluate(el=>({...el.dataset}));
 await hold('a',220);const left=await state();await hold('d',220);const right=await state();assert.ok(+left.heading>+right.heading);
 await hold('s',180);evidence.reverse=await state();
 await page.keyboard.down('w');await page.waitForTimeout(700);await page.keyboard.press('Escape');
 const paused=await state();await page.keyboard.up('w');await page.waitForTimeout(400);assert.equal((await state()).position,paused.position);
 await page.getByRole('button',{name:'Resume',exact:true}).click();await page.waitForTimeout(250);assert.equal((await state()).position,paused.position);evidence.pauseClearsHeld=true;
 await page.keyboard.press('f');await page.waitForTimeout(1300);await snap('inspection');await page.keyboard.press('f');await page.waitForTimeout(1700);
 evidence.matchedInspectionCounters=await page.locator('#scene').evaluate(el=>({...el.dataset}));
 // Return to chase through the actual visible tools before the held-input recovery.
 await page.locator('.pg-toolbox>summary').click();await page.getByText('Inspection cameras · F',{exact:true}).click();await page.getByRole('button',{name:'Chase',exact:true}).click();await page.locator('.pg-toolbox>summary').click();
 const start=Date.now();await page.keyboard.down('w');await page.waitForTimeout(1800);await snap('easing');
 await phase('outro');await page.keyboard.up('w');evidence.heldRecoveryMs=Date.now()-start;evidence.outro=await state();
 await page.waitForTimeout(1800);await snap('outro');await phase('end');await page.waitForTimeout(500);await snap('ending');evidence.end=await state();
 assert.equal(evidence.end.free,true);assert.equal(await page.getByRole('button',{name:'Return to Mars',exact:true}).isVisible(),true);
 const endPosition=evidence.end.position;await hold('w',300);assert.equal((await state()).position,endPosition);
 await page.setViewportSize({width:960,height:640});await page.waitForTimeout(300);await snap('ending-laptop');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);await snap('ending-narrow');
 evidence.narrow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.equal(evidence.narrow.width,evidence.narrow.scroll);
 await page.setViewportSize({width:1440,height:900});await page.getByRole('button',{name:'Experience again',exact:true}).click();await phase('replay');evidence.restart=await state();assert.equal(evidence.restart.tracksVisible,false);
 await phase('recover');await page.waitForTimeout(1400);evidence.afterRestart=await page.locator('#scene').evaluate(el=>({...el.dataset}));
 // Optional planner still works; direct input still takes ownership.
 await page.locator('.pg-toolbox>summary').click();await page.locator('.pg-planner>summary').click();await page.getByRole('button',{name:'Forward 2 m',exact:true}).click();await page.keyboard.press('e');
 await page.waitForFunction(()=>window.__purgatoryReview.state().busy);await hold('w',180);assert.equal((await state()).busy,false);evidence.takeover=true;
 await page.keyboard.press('Escape');await page.locator('#leave-button').click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.sceneId==='mars-hub');
 assert.equal(await page.locator('.pg-sequence').count(),0);assert.equal(await page.locator('.purgatory-panel').count(),0);evidence.cleanedUp=true;
 evidence.errors=errors;evidence.failedRequests=failed;assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 await fs.writeFile(new URL('checks.json',out),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
} catch(error){await snap('failure');console.log(JSON.stringify({error:String(error),state:await state().catch(()=>null),errors,failed}));throw error;}
finally{await context.close();await browser.close();}
