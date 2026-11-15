import type { MissionPhase } from '../../../../../app/contracts.ts';

export type PassagePart = string | { emphasis: string };
export const isDiscoveryPassage = (phase: MissionPhase): boolean =>
  ['inspect', 'compare', 'water', 'evidence'].includes(phase);

/** Authored emphasis preserves the original qualifications and phase ordering. */
export function discoveryWords(phase: MissionPhase, comparison: number): readonly PassagePart[] | undefined {
  if (phase === 'inspect') return ['Fresh rock, hidden beneath the ', {emphasis:'dust'}, '.'];
  if (phase === 'compare') return comparison === 1
    ? ['Fewer ', {emphasis:'grains'}, ' here. What changed?']
    : ['A different rock. ', {emphasis:'Brushed'}, ', not ground.'];
  if (phase === 'water') return ['Water ', {emphasis:'may have'}, ' left minerals inside the rock.'];
  if (phase === 'evidence') return ['The instruments found ', {emphasis:'hematite'}, ' \u2014 a mineral clue.'];
}

export const archiveWords: readonly PassagePart[] = [
  'Instruments identified ', {emphasis:'hematite'}, ' in the grains. Together with the rock evidence, this helped scientists interpret a wetter ancient Mars.'
];
export const archiveHeading: readonly PassagePart[] = ['A clue to ', {emphasis:'ancient water'}, '.'];

const signatures = new WeakMap<HTMLElement, string>();
/** Text nodes only; avoids HTML parsing and preserves nodes between frames. */
export function renderWords(node: HTMLElement, parts: readonly PassagePart[]): void {
  const signature = JSON.stringify(parts);
  if (signatures.get(node) === signature && node.textContent === parts.map(part => typeof part === 'string' ? part : part.emphasis).join('')) return;
  const children = parts.map(part => {
    if (typeof part === 'string') return document.createTextNode(part);
    const emphasis = document.createElement('em');
    emphasis.className = 'discovery-emphasis'; emphasis.textContent = part.emphasis;
    return emphasis;
  });
  node.replaceChildren(...children); signatures.set(node, signature);
}
