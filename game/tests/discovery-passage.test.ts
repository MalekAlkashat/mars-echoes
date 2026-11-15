import test from 'node:test';
import assert from 'node:assert/strict';
import { isDiscoveryPassage, discoveryWords, archiveWords } from '../src/scenes/episodes/rover/missions/blueberry-clue/passage.ts';
import { blueberryText } from '../src/content/blueberry-clue.ts';
const plain = (parts: readonly (string | {emphasis:string})[]) => parts.map(p=>typeof p==='string'?p:p.emphasis).join('');
test('objectives do not become scientific passages before observations are exposed',()=>{
 for(const phase of ['approach','brush','grind'] as const){assert.equal(isDiscoveryPassage(phase),false);assert.equal(discoveryWords(phase,0),undefined);}
 for(const phase of ['inspect','compare','water','evidence'] as const)assert.equal(isDiscoveryPassage(phase),true);
});
test('emphasis preserves existing scientific wording and qualified interpretation',()=>{
 for(const phase of ['inspect','compare','water','evidence'] as const)assert.equal(plain(discoveryWords(phase,0)!),blueberryText.phases[phase].body);
 assert.equal(plain(discoveryWords('compare',1)!), 'Fewer grains here. What changed?');
 assert.match(plain(archiveWords),/^Instruments identified hematite/);
});
