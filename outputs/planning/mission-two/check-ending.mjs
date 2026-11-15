import {chromium} from 'file:///C:/Users/Yooms/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chromium',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory');
 await page.waitForFunction(()=>window.__purgatoryReview?.state().phase==='recover');await page.keyboard.down('w');
 await page.waitForFunction(()=>window.__purgatoryReview.state().phase==='end',null,{timeout:60000});await page.keyboard.up('w');
 const end=await page.evaluate(()=>window.__purgatoryReview.state());
 await page.getByRole('button',{name:'Return to Mars',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.sceneId==='mars-hub');
 assert.equal(await page.locator('.pg-sequence').count(),0);assert.equal(await page.locator('.purgatory-panel').count(),0);
 assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('purgatory-active')),false);assert.deepEqual(errors,[]);
 const result={reducedMotion:true,end,endingReturnPassed:true,cleanupPassed:true,errors};
 await fs.writeFile(new URL('./review-polish/ending-return.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
