/** Copy is separate from geometry; source IDs resolve to the checked production register. */
export const blueberryText = {
  title:'The Blueberry Clue', location:'Eagle Crater · early 2004',
  intro:'Explore a rock. Find a clue to ancient water.',
  disclaimer:'Reconstructed memory · time compressed.',
  scienceNote:'Separate discoveries are brought together for play. Mineral identification came from instruments. Ancient water is an interpretation, not a photograph.',
  phases:{
    approach:{title:'Follow the pale rocks',body:'Drive closer.',action:'Prepare surface · E',label:'Eagle Crater · reconstruction'},
    brush:{title:'Clear the surface',body:'Brush away the dust.',action:'Brushing…',label:'Reconstruction · time compressed'},
    grind:{title:'Look inside',body:'Hold E to grind. Let go to stop.',action:'Hold E to grind',label:'McKittrick · reconstruction'},
    inspect:{title:'Beneath the surface',body:'Fresh rock, hidden beneath the dust.',action:'Visit another rock · E',label:'Magnified reconstruction'},
    compare:{title:'Tiny grains. A new clue.',body:'A different rock. Brushed, not ground.',action:'Look closer · E',label:'Berry Bowl · magnified reconstruction'},
    water:{title:'Long ago…',body:'Water may have left minerals inside the rock.',action:'Skip reconstruction · E',label:'Ancient Mars · interpretation'},
    evidence:{title:'A clue to ancient water',body:'The instruments found hematite — a mineral clue.',action:'Return to Mars · E',label:'Memory discovered'},
  },
  comparison:'See the clue · E',
  factIds:['F-07','F-11','F-34'],
  sources:[
    ['Berry Bowl','https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/'],
    ['McKittrick','https://science.nasa.gov/photojournal/circular-signs-of-the-rock-abrasion-tool/'],
    ['Flatrock','https://www.jpl.nasa.gov/images/pia05521-focus-on-flatrock/'],
    ['Instruments','https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-instruments/'],
    ['Spirit','https://science.nasa.gov/mission/mer-spirit/'],
  ],
};
