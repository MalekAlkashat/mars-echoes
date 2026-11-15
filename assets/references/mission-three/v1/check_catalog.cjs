const {chromium}=require('C:/Users/Yooms/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url');
const pack=__dirname;
(async()=>{
 const browser=await chromium.launch({headless:true});
 const result={date:'2026-11-15',checks:[],errors:[],failed:[],externalRequests:[]};
 try{
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
   const ctx=await browser.newContext({viewport});
   const page=await ctx.newPage();
   page.on('pageerror',e=>result.errors.push(e.message));
   page.on('requestfailed',r=>result.failed.push(r.url()));
   page.on('request',r=>{if(/^https?:/.test(r.url()))result.externalRequests.push(r.url())});
   await page.goto(pathToFileURL(path.join(pack,'index.html')).href);
   const images=page.locator('article img');
   for(let i=0;i<await images.count();i++){await images.nth(i).scrollIntoViewIfNeeded();await images.nth(i).evaluate(img=>img.decode());}
   const view=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.querySelectorAll('article img')].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),localLinks:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>!/^https?:/.test(h))}));
   assert.equal(view.overflow,false);assert.equal(view.images.length,9);assert.ok(view.images.every(i=>i.loaded));
   for(const href of view.localLinks){assert.ok(fs.existsSync(path.resolve(pack,href)),href);}
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:path.join(pack,'previews',viewport.width>500?'catalog-desktop.png':'catalog-mobile.png')});
   result.checks.push({viewport,...view});
   await ctx.close();
  }
  assert.equal(result.errors.length,0);assert.equal(result.failed.length,0);assert.equal(result.externalRequests.length,0);
  result.passed=true;
 }catch(e){result.passed=false;result.failure=e.message;throw e;}
 finally{fs.writeFileSync(path.join(pack,'catalog-qa.json'),JSON.stringify(result,null,2)+'\n');await browser.close();console.log(JSON.stringify({passed:result.passed,viewports:result.checks.map(c=>c.viewport),errors:result.errors,failed:result.failed,externalRequests:result.externalRequests}));}
})().catch(e=>{console.error(e);process.exit(1)});

