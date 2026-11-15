import {chromium} from 'file:///C:/Users/Yooms/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
const out=new URL('./review-archive/',import.meta.url);await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:fileURLToPath(out),size:{width:1280,height:800}}});
const page=await context.newPage(),errors=[],failed=[],evidence={};
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push([r.status(),r.url()]);});
const state=()=>page.evaluate(()=>window.__purgatoryReview.state());
const phase=p=>page.waitForFunction(value=>window.__purgatoryReview?.state().phase===value,p,{timeout:60000});
const snap=name=>page.screenshot({path:fileURLToPath(new URL(name+'.png',out))});
try{
 await page.goto('http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory');
 await phase('stuck');const wheelAt=Date.now();await page.waitForTimeout(2400);await snap('wheel-reveal');
 evidence.wheelImage=await page.locator('.pg-wheel-photo img').evaluate(i=>({loaded:i.complete&&i.naturalWidth>0,width:i.naturalWidth,height:i.naturalHeight}));
 assert.equal(evidence.wheelImage.loaded,true);assert.equal(await page.locator('.pg-wheel-photo').innerText().then(t=>t.includes('May 2005')),true);
 await phase('recover');evidence.wheelHoldMs=Date.now()-wheelAt;assert.ok(evidence.wheelHoldMs>3500);await page.waitForTimeout(1300);
 await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.press('Escape');
 const paused=await state();await page.keyboard.up('w');await page.waitForTimeout(300);assert.equal((await state()).position,paused.position);
 await page.getByRole('button',{name:'Resume',exact:true}).click();await page.waitForTimeout(200);assert.equal((await state()).position,paused.position);
 await page.keyboard.down('w');await phase('outro');await page.keyboard.up('w');const freeAt=Date.now();evidence.free=await state();
 await page.waitForTimeout(3900);assert.equal((await state()).phase,'outro');await snap('longer-outro');
 await phase('sand');evidence.outroHoldMs=Date.now()-freeAt;assert.ok(evidence.outroHoldMs>5000);
 await page.waitForTimeout(2700);await snap('sand-push');await phase('archive');
 const archiveAt=Date.now();await page.waitForTimeout(1500);await snap('nasa-archive');
 evidence.archiveImage=await page.locator('.pg-archive-photo img').evaluate(i=>({loaded:i.complete&&i.naturalWidth>0,width:i.naturalWidth,height:i.naturalHeight}));
 assert.equal(evidence.archiveImage.width,1024);assert.match(await page.locator('.pg-archive-photo').innerText(),/11 June 2005.*491/);
 await page.keyboard.press('Escape');const frozen=await state();await page.waitForTimeout(400);assert.equal((await state()).phaseTime,frozen.phaseTime);
 await page.getByRole('button',{name:'Resume',exact:true}).click();evidence.pauseArchive=true;
 await phase('end');evidence.archiveHoldMs=Date.now()-archiveAt;await page.waitForTimeout(1400);await snap('ending');
 evidence.end=await state();assert.equal(evidence.end.free,true);
 await page.setViewportSize({width:960,height:640});await page.waitForTimeout(1300);await snap('ending-laptop');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);await snap('ending-narrow');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 await page.setViewportSize({width:1440,height:900});await page.getByRole('button',{name:'Experience again',exact:true}).click();await phase('replay');evidence.restarted=true;
 await page.keyboard.press('Escape');await page.locator('#leave-button').click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.sceneId==='mars-hub');
 assert.equal(await page.locator('.pg-sequence').count(),0);evidence.cleanup=true;assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);evidence.errors=errors;evidence.failedRequests=failed;
 await fs.writeFile(new URL('checks.json',out),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
}catch(e){await snap('failure');console.log(JSON.stringify({error:String(e),state:await state().catch(()=>null),errors,failed}));throw e;}
finally{await context.close();await browser.close();}
