// Development-only capture of the actual canvas, without a second scene or animation path.
export function installRecorder(canvas: HTMLCanvasElement, endpoint = '/__review_capture'): void {
  const record = document.createElement('button');
  record.textContent = 'Record motion check';
  Object.assign(record.style, {position:'fixed',top:'120px',right:'32px',zIndex:'20'});
  document.body.append(record);
  record.onclick = () => {
    const mimeType = ['video/webm;codecs=vp9','video/webm','video/mp4'].find(type => MediaRecorder.isTypeSupported(type));
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, mimeType ? {mimeType} : undefined);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      const blob=new Blob(chunks,{type:recorder.mimeType});
      const saved=await fetch(endpoint,{method:'POST',headers:{'Content-Type':recorder.mimeType},body:blob}).then(response=>response.ok).catch(()=>false);
      if(saved){record.textContent='Motion check saved';stream.getTracks().forEach(track=>track.stop());return;}
      const link = document.createElement('a');
      link.textContent = 'Save motion check';
      link.href = URL.createObjectURL(blob);
      link.download = `rover-motion.${recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
      Object.assign(link.style, {position:'fixed',top:'120px',right:'32px',zIndex:'20',background:'#1c2021',color:'#f3eee4',padding:'16px'});
      record.replaceWith(link);
      stream.getTracks().forEach(track => track.stop());
    };
    recorder.start();
    record.textContent = 'Recording motion…';
    record.disabled = true;
    canvas.focus();
    setTimeout(() => recorder.stop(), 8000);
  };
}
