/** Copy is separate from geometry; source IDs resolve to the checked production register. */
export const blueberryText = {
  title:'The Blueberry Clue', location:'Eagle Crater · early 2004',
  intro:'Follow the pale outcrop. Prepare a rock surface, then compare the tiny grains that helped reveal an ancient wet Mars.',
  disclaimer:'Compact reconstruction. Separate observations and instrument operations are compressed for play.',
  phases:{
    approach:{title:'Approach the pale outcrop',body:'Drive into the working area. Stop near the layered rock.',action:'Prepare surface · E',label:'Eagle Crater · reconstructed working area'},
    brush:{title:'Clear the surface',body:'The brush clears loose dust before the close inspection.',action:'Brushing…',label:'Instrument reconstruction · time compressed'},
    grind:{title:'Expose the rock beneath',body:'Hold E for three seconds. Releasing cancels the hold.',action:'Hold E to grind',label:'McKittrick-inspired abrasion · 45.5 mm wide · time compressed'},
    inspect:{title:'Look beneath the weathered surface',body:'A shallow cut exposes the interior. Hard spherules could obstruct the tool, as documented separately at Flatrock.',action:'Compare a different target · E',label:'Exposed interior · reconstructed macro view'},
    compare:{title:'Berry Bowl: a separate observation',body:'Compare the spherule-rich cluster with a brushed, relatively berry-free patch. No grinding was needed here.',action:'Examine cluster · E',label:'Magnified reconstruction · grains about 4 mm across'},
    water:{title:'An interpretation of ancient conditions',body:'Long ago, water could move through pores and deposit minerals within rock. Later erosion exposed resistant grains. This inferred history is compressed for illustration; it is not present-day water or a geochemical simulation.',action:'Skip reconstruction · E',label:'Inferred ancient conditions · geological time compressed'},
    evidence:{title:'The grains carry a clue',body:'Instrument measurements identified hematite-rich spherules, supporting an ancient-water interpretation. Spirit carried the same Rock Abrasion Tool and made the first grind on Mars.',action:'Return to Mars · E',label:'Discovery complete · Journal records this memory on return'},
  },
  comparison:'Compare brushed surface · E',
  factIds:['F-07','F-11','F-34'],
  sources:[
    ['Berry Bowl','https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/'],
    ['McKittrick','https://science.nasa.gov/photojournal/circular-signs-of-the-rock-abrasion-tool/'],
    ['Flatrock','https://www.jpl.nasa.gov/images/pia05521-focus-on-flatrock/'],
    ['Instruments','https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-instruments/'],
    ['Spirit','https://science.nasa.gov/mission/mer-spirit/'],
  ],
};
