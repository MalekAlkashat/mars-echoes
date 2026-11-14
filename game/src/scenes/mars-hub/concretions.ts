import {concretionPlacements,createConcretionField,type ConcretionSite} from '../../environments/mars/concretions.ts';

// The first two groups are in the fresh navigation view, before any memory is entered.
export const HUB_CONCRETION_SITES:readonly ConcretionSite[]=[
 {id:'hub-foreground-east',x:1.5,z:8.8,spreadX:1.2,spreadZ:.65,count:90},
 {id:'hub-foreground-west',x:-1.4,z:6.1,spreadX:1.1,spreadZ:.8,count:90},
 {id:'hub-trough-west',x:-1.5,z:1,spreadX:1.3,spreadZ:1,count:80},
 {id:'hub-trough-east',x:2.1,z:-6.4,spreadX:1.4,spreadZ:.75,count:80},
 {id:'hub-low-pocket',x:-2.1,z:-13,spreadX:1.4,spreadZ:.85,count:80},
 {id:'hub-memory-approach',x:1.6,z:-19.4,spreadX:1.2,spreadZ:1,count:80},
 {id:'hub-rover-west',x:-2.5,z:-24.2,spreadX:1.1,spreadZ:.9,count:70},
 {id:'hub-rover-east',x:2.8,z:-26,spreadX:1.2,spreadZ:.75,count:70},
];
export const hubConcretionPlacements=(height:(x:number,z:number)=>number)=>concretionPlacements(HUB_CONCRETION_SITES,height,94127,.008,.018);
export const createHubConcretions=(height:(x:number,z:number)=>number)=>createConcretionField('hub-concretions',hubConcretionPlacements(height));
