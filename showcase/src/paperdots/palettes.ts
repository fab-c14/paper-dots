import type { RisographPalette } from './types';

export const PALETTES: Record<string, RisographPalette> = {
  risographClassic: {
    name: 'Risograph Classic',
    background: '#FAF7F0',    // Warm unbleached newsprint
    cardBg: '#FFFFFF',
    border: 'rgba(28, 29, 31, 0.1)',
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
    cardBg: '#FDFBF7',
    border: 'rgba(60, 45, 30, 0.12)',
    paperGrain: 'rgba(60, 45, 30, 0.05)',
    primary: '#E65100',       // Orange Coral ink
    secondary: '#2E7D32',     // Forest Green ink
    dark: '#212121',          // Carbon ink
    light: '#FFF9C4',         // Pale ivory highlight
    muted: '#B0BEC5',         // Paper grey
  },
  cyberPaper: {
    name: 'Cyber Halftone',
    background: '#12131A',    // Deep dark recycled chipboard
    cardBg: '#1B1C26',
    border: 'rgba(0, 240, 255, 0.2)',
    paperGrain: 'rgba(255, 255, 255, 0.03)',
    primary: '#00F0FF',       // Cyan laser ink
    secondary: '#FF0055',     // Hot magenta dot
    dark: '#FFFFFF',          // High contrast white text
    light: '#E2F1FF',         // Pale glow
    muted: '#58607A',         // Slate halftone
  },
  matchaPaper: {
    name: 'Matcha & Ink',
    background: '#F2F6F3',    // Rice paper
    cardBg: '#FCFDFC',
    border: 'rgba(45, 106, 79, 0.15)',
    paperGrain: 'rgba(40, 60, 40, 0.04)',
    primary: '#2D6A4F',       // Deep moss ink
    secondary: '#DDA15E',     // Clay ink
    dark: '#1B261F',          // Sumi ink
    light: '#E9F5ED',         // Pale matcha
    muted: '#748C7E',         // Washed lichen
  },
  monochromePress: {
    name: 'Monochrome Letterpress',
    background: '#F8F7F4',    // Heavy cotton paper
    cardBg: '#FFFFFF',
    border: 'rgba(36, 36, 36, 0.12)',
    paperGrain: 'rgba(20, 20, 20, 0.05)',
    primary: '#242424',       // Heavy lead ink
    secondary: '#737373',     // Mid tone halftone
    dark: '#111111',          // Solid black ink
    light: '#EBE9E4',         // Tinted white
    muted: '#A3A3A3',         // Fine stipple
  },
  cyanotype: {
    name: 'Blueprint Cyanotype',
    background: '#0D223A',    // Deep Prussian Sun Print Blue
    cardBg: '#132F50',
    border: 'rgba(125, 211, 252, 0.25)',
    paperGrain: 'rgba(255, 255, 255, 0.04)',
    primary: '#38BDF8',       // Light Cyan
    secondary: '#F472B6',     // Solarized pink
    dark: '#F0F9FF',          // Chalk white text
    light: '#BAE6FD',         // Sky glow
    muted: '#64748B',         // Faded blueprint blue
  },
  kraftPostal: {
    name: 'Kraft & Rubber Stamp',
    background: '#E8D8C3',    // Raw Kraft Paper
    cardBg: '#F2E6D5',
    border: 'rgba(100, 70, 40, 0.2)',
    paperGrain: 'rgba(80, 50, 20, 0.06)',
    primary: '#C5221F',       // Post Office Stamp Red
    secondary: '#1A535C',     // Postal Petrol Teal
    dark: '#2B1E16',          // Dark walnut ink
    light: '#F7EDE2',         // Bleached linen
    muted: '#8C7A6B',         // Raw twine brown
  }
};

export const DEFAULT_PALETTE = PALETTES.risographClassic;
