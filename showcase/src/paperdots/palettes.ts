import type { RisographPalette } from './types';

export const PALETTES: Record<string, RisographPalette> = {
  risographClassic: {
    name: 'Risograph Classic',
    background: '#FAF7F0',    // Warm unbleached newsprint
    paperGrain: 'rgba(50, 40, 30, 0.04)',
    primary: '#0078BF',       // Risograph Federal Blue
    secondary: '#FF48B0',     // Risograph Fluorescent Pink
    dark: '#1C1D1F',          // Soy Black
    light: '#FFE800',         // Sunflower Yellow
    muted: '#8A9BA8',         // Medium Blue halftone
  },
  warmZine: {
    name: 'Warm Zine Press',
    background: '#F5EFE6',    // Warm tactile parchment
    paperGrain: 'rgba(60, 45, 30, 0.05)',
    primary: '#E65100',       // Orange Coral ink
    secondary: '#2E7D32',     // Forest Green ink
    dark: '#212121',          // Carbon ink
    light: '#FFF9C4',         // Pale ivory highlight
    muted: '#B0BEC5',         // Paper grey
  },
  cyberPaper: {
    name: 'Cyber Halftone',
    background: '#1A1A24',    // Dark recycled chipboard
    paperGrain: 'rgba(255, 255, 255, 0.03)',
    primary: '#00F0FF',       // Cyan laser ink
    secondary: '#FF0055',     // Hot magenta dot
    dark: '#0D0E15',          // Deep carbon
    light: '#E2F1FF',         // Pale glow
    muted: '#58607A',         // Slate halftone
  },
  matchaPaper: {
    name: 'Matcha & Ink',
    background: '#F4F7F4',    // Rice paper
    paperGrain: 'rgba(40, 60, 40, 0.04)',
    primary: '#2D6A4F',       // Deep moss ink
    secondary: '#DDA15E',     // Clay ink
    dark: '#1B261F',          // Sumi ink
    light: '#E9F5ED',         // Pale matcha
    muted: '#748C7E',         // Washed lichen
  },
  monochromePress: {
    name: 'Monochrome Letterpress',
    background: '#F9F8F6',    // Heavy cotton paper
    paperGrain: 'rgba(20, 20, 20, 0.05)',
    primary: '#242424',       // Heavy lead ink
    secondary: '#666666',     // Mid tone halftone
    dark: '#111111',          // Solid black ink
    light: '#EBE9E4',         // Tinted white
    muted: '#9E9E9E',         // Fine stipple
  }
};

export const DEFAULT_PALETTE = PALETTES.risographClassic;
