import {chromium} from 'file:///C:/Users/Yooms/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';import {fileURLToPath} from 'node:url';
const out=new URL('./review-polish/',import.meta.url);
const browser=await chromium.launch({channel:'chromium',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:fileURLToPath(out),size:{width:1280,height:800}}});
try{
 const page=await context.newPage();const video=page.video();
 await page.goto('http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory');
 await page.waitForFunction(()=>window.__purgatoryReview?.state().phase==='recover');
 await page.waitForTimeout(1300);await page.keyboard.down('w');
 await page.waitForFunction(()=>window.__purgatoryReview.state().phase==='end',null,{timeout:60000});await page.keyboard.up('w');
 await page.waitForTimeout(2500);await page.close();
 await fs.copyFile(await video.path(),new URL('mission-two-polish.webm',out));
 console.log('Saved normal-speed gameplay capture: review-polish/mission-two-polish.webm');
}finally{await context.close();await browser.close();}
