export type GraphicsQuality = 'low' | 'balanced' | 'high';
export type Preferences = { graphics: GraphicsQuality; volume: number; muted: boolean; reducedMotion: boolean; largeText: boolean };
export const PREFERENCES_KEY = 'mars-echoes.settings.v1';
export const defaultPreferences: Preferences = { graphics: 'balanced', volume: .8, muted: false, reducedMotion: false, largeText: false };

export function readPreferences(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? 'null');
    if (!value || typeof value !== 'object') return {...defaultPreferences};
    return {
      graphics: ['low','balanced','high'].includes(value.graphics) ? value.graphics : 'balanced',
      volume: typeof value.volume === 'number' && Number.isFinite(value.volume) ? Math.max(0,Math.min(1,value.volume)) : .8,
      muted: value.muted === true, reducedMotion: value.reducedMotion === true, largeText: value.largeText === true,
    };
  } catch { return {...defaultPreferences}; }
}
export function writePreferences(value: Preferences): boolean {
  try { localStorage.setItem(PREFERENCES_KEY,JSON.stringify(value)); return true; } catch { return false; }
}
