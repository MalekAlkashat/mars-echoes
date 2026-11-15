import {chromium} from 'file:///C:/Users/Yooms/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/assets/missions/purgatory/v1/PIA07999-looking-back.jpg',route=>route.abort());
 await page.goto('http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory');
 await page.waitForFunction(()=>window.__purgatoryReview?.state().phase==='recover');await page.keyboard.down('w');
 await page.waitForFunction(()=>window.__purgatoryReview.state().phase==='archive',null,{timeout:60000});await page.keyboard.up('w');
 assert.equal(await page.locator('.pg-archive-photo').evaluate(e=>e.classList.contains('pg-photo-unavailable')),true);
 assert.match(await page.locator('.pg-archive-photo').innerText(),/NASA image unavailable/);assert.equal(await page.locator('.pg-archive-photo img').isVisible(),false);
 await page.waitForFunction(()=>window.__purgatoryReview.state().phase==='end');
 await page.getByRole('button',{name:'Return to Mars',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.sceneId==='mars-hub');
 assert.equal(await page.locator('.pg-sequence').count(),0);assert.deepEqual(errors,[]);
 const result={reducedMotion:true,intentionalImageFailure:true,honestUnavailableLabel:true,endingReturn:true,cleanup:true,errors};
 await fs.writeFile(new URL('./review-archive/fallback.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
