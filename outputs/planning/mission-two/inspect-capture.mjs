import {chromium} from 'file:///C:/Users/Yooms/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const folder=process.argv[2] || 'review-polish', file=process.argv[3] || 'mission-two-polish.webm';
 const page=await browser.newPage();await page.goto(new URL(`./${folder}/${file}`,import.meta.url).href);
 await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
 const info=await page.locator('video').evaluate(v=>{v.pause();return {durationSeconds:v.duration,width:v.videoWidth,height:v.videoHeight};});
 await fs.writeFile(new URL(`./${folder}/capture-metadata.json`,import.meta.url),JSON.stringify(info,null,2));console.log(JSON.stringify(info));
}finally{await browser.close();}
