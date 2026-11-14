import urllib.request, json, hashlib
from pathlib import Path
from PIL import Image
root=Path('assets/references/mission-one/v1')
items=[
('eagle-panorama','https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia05/pia05755/PIA05755.jpg','https://science.nasa.gov/photojournal/opportunity-captures-lion-king-panorama/','PIA05755','Sols 58 and 60; published 2004-04-14','Approximate true color','NASA/JPL/Cornell'),
('berry-bowl','https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/3/5/35718_Sol048B-PIA05634.jpg','https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/','PIA05634','Sol 48; published 2004-03-25','Approximate true color','NASA/JPL-Caltech/Cornell'),
('last-chance','https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/3/8/38237_PIA18885_1MM039ILF05PER44P2933M222M1.jpg','https://science.nasa.gov/resource/clues-to-wet-history-in-texture-of-a-martian-rock/','PIA18885','Sol 39, 2004-03-03; published 2014-11-18','Monochrome microscopic image; not palette authority','NASA/JPL-Caltech/Cornell Univ./USGS'),
('flatrock','https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA05521.jpg','https://www.jpl.nasa.gov/images/pia05521-focus-on-flatrock/','PIA05521','Sol 44; published 2004-03-09','Color interpretation not stated; use for geometry only','NASA/JPL/Cornell'),
('mckittrick','https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia05/pia05459/PIA05459.jpg','https://science.nasa.gov/photojournal/circular-signs-of-the-rock-abrasion-tool/','PIA05459','Grinding sol 30, 2004-02-23; image acquisition not separately asserted','Monochrome hazard-camera view; geometry/context only','NASA/JPL'),
('rat-hardware','https://science.nasa.gov/wp-content/uploads/2024/03/rat-2.jpg','https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-instruments/','NASA science instruments RAT photograph','Acquisition date not stated','Hardware photo; no Mars environment color inference','NASA/JPL-Caltech')]
manifest=[]
for key,url,page,image_id,date,color,credit in items:
    p=root/(key+'.jpg')
    if not p.exists():
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req,timeout=35) as r: data=r.read()
        from io import BytesIO
        with Image.open(BytesIO(data)) as im: im.verify()
        p.write_bytes(data)
    with Image.open(p) as im: size=list(im.size)
    manifest.append(dict(id=key,file=p.name,url=url,page=page,imageId=image_id,observation=date,colorInterpretation=color,credit=credit,downloaded='2026-11-14',bytes=p.stat().st_size,dimensions=size,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),role='reference only; not a calibrated texture',rights='NASA media guidance; retain listed institutional credits; not blanket CC0'))
    print(key,size,p.stat().st_size)
(root/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
