import { defineConfig } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export default defineConfig({
  plugins:[{
    name:'local-motion-review',
    configureServer(server) {
      server.middlewares.use('/__review_capture',async(request,response)=> {
        if(request.method!=='POST'){response.statusCode=405;response.end();return;}
        const chunks:Buffer[]=[];
        let length=0;
        try {
          for await(const chunk of request) {
            length+=chunk.length;
            if(length>25_000_000){response.statusCode=413;response.end();return;}
            chunks.push(chunk);
          }
          const hub = new URL(request.url ?? '/', 'http://localhost').searchParams.get('scene') === 'mars-hub';
          const opportunity = new URL(request.url ?? '/', 'http://localhost').searchParams.get('scene') === 'opportunity';
          const directory=fileURLToPath(new URL(opportunity ? '../outputs/review/opportunity-v1/' : hub ? '../outputs/review/mars-hub-v1/' : '../outputs/review/visual-pass-v2/',import.meta.url));
          await mkdir(directory,{recursive:true});
          const extension=request.headers['content-type']?.includes('mp4')?'mp4':'webm';
          await writeFile(join(directory,`${opportunity ? 'opportunity-motion' : hub ? 'hub-motion' : 'rover-motion-v2'}.${extension}`),Buffer.concat(chunks));
          response.setHeader('Content-Type','application/json');response.end(JSON.stringify({saved:true}));
        }catch{response.statusCode=500;response.end(JSON.stringify({saved:false}));}
      });
    },
  }],
});
