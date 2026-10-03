import type { RisographPalette } from './types';

export interface SpotInk {
  name: string;
  hex: string;
  category: 'primary' | 'neon' | 'earth' | 'metallic';
}

export const SPOT_INKS: Record<string, SpotInk> = {
  fluorescentPink: { name: 'Fluo Pink', hex: '#FF48B0', category: 'neon' },
  federalBlue: { name: 'Federal Blue', hex: '#0078BF', category: 'primary' },
  sunflower: { name: 'Sunflower Yellow', hex: '#FFE800', category: 'primary' },
  mintSeafoam: { name: 'Mint Seafoam', hex: '#2EC4B6', category: 'primary' },
  scarletRed: { name: 'Scarlet Ink', hex: '#E63946', category: 'primary' },
  violetPurple: { name: 'Purple Violet', hex: '#7209B7', category: 'primary' },
  tealTurquoise: { name: 'Medium Teal', hex: '#00A896', category: 'primary' },
  emeraldGreen: { name: 'Forest Green', hex: '#2D6A4F', category: 'earth' },
  coralOrange: { name: 'Bright Coral', hex: '#FF6B6B', category: 'primary' },
  warmOchre: { name: 'Gold Ochre', hex: '#D4A373', category: 'earth' },
  terracotta: { name: 'Terracotta', hex: '#C05621', category: 'earth' },
  carbonBlack: { name: 'Soy Carbon', hex: '#1C1D1F', category: 'primary' },
};

export const PALETTES: Record<string, RisographPalette> = {
  risographClassic: {
    name: 'Risograph Classic',
    background: '#FAF7F0',    // Warm unbleached newsprint
    cardBg: '#FFFFFF',
    border: 'rgba(28, 29, 31, 0.12)',
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
  pastelZine: {
    name: 'Pastel Risograph',
    background: '#FFF9F5',    // Soft cream cotton paper
    cardBg: '#FFFFFF',
    border: 'rgba(255, 107, 107, 0.18)',
    paperGrain: 'rgba(255, 107, 107, 0.03)',
    primary: '#FF6B6B',       // Coral Pink
    secondary: '#4D96FF',     // Pastel Sky Blue
    dark: '#2B2D42',          // Deep Navy ink
    light: '#FFD93D',         // Buttercup Yellow
    muted: '#C1C8E4',         // Lavender wash
  },
  fluorescentNeon: {
    name: 'Fluorescent Neon',
    background: '#FAFBFD',    // Crisp bleached newsprint
    cardBg: '#FFFFFF',
    border: 'rgba(255, 72, 176, 0.20)',
    paperGrain: 'rgba(40, 40, 60, 0.03)',
    primary: '#FF48B0',       // Hot Fluo Pink
    secondary: '#00B4D8',     // Electric Cyan
    dark: '#111827',          // Ink Black
    light: '#FFE800',         // Acid Yellow
    muted: '#94A3B8',         // Cool grey
  },
  lavenderLilac: {
    name: 'Lavender & Rose',
    background: '#FAF5FF',    // Lilac cotton rag
    cardBg: '#FFFFFF',
    border: 'rgba(124, 58, 237, 0.16)',
    paperGrain: 'rgba(124, 58, 237, 0.03)',
    primary: '#7C3AED',       // Royal Violet
    secondary: '#FB7185',     // Rose Quartz
    dark: '#2E1065',          // Deep purple sumi
    light: '#F5D0FE',         // Pale orchid
    muted: '#C4B5FD',         // Halftone violet
  },
  seafoamCoral: {
    name: 'Seafoam & Coral',
    background: '#F0FDFA',    // Sea salt paper
    cardBg: '#FFFFFF',
    border: 'rgba(15, 118, 110, 0.16)',
    paperGrain: 'rgba(15, 118, 110, 0.03)',
    primary: '#0F766E',       // Deep Seafoam
    secondary: '#F43F5E',     // Living Coral
    dark: '#134E4A',          // Tidal Pine
    light: '#CCFBF1',         // Pale aqua
    muted: '#99F6E4',         // Washed mint
  },
  sunflowerNavy: {
    name: 'Sunflower & Navy',
    background: '#FEFCE8',    // Warm cream silk
    cardBg: '#FFFFFF',
    border: 'rgba(30, 58, 138, 0.16)',
    paperGrain: 'rgba(202, 138, 4, 0.04)',
    primary: '#1E3A8A',       // Prussian Navy
    secondary: '#EAB308',     // Sunflower Yellow
    dark: '#0F172A',          // Deep ink
    light: '#FEF08A',         // Pale yellow
    muted: '#93C5FD',         // Washed blue
  },
  terracottaSun: {
    name: 'Terracotta & Ochre',
    background: '#FFFDF7',    // Sunbleached parchment
    cardBg: '#FFFFFF',
    border: 'rgba(194, 65, 12, 0.16)',
    paperGrain: 'rgba(194, 65, 12, 0.04)',
    primary: '#C2410C',       // Tuscan Terracotta
    secondary: '#D97706',     // Amber Ochre
    dark: '#431407',          // Raw Umber
    light: '#FED7AA',         // Baked clay
    muted: '#FDBA74',         // Sandy wash
  },
  botanicalOchre: {
    name: 'Botanical & Ochre',
    background: '#F8F5EE',    // French milled paper
    cardBg: '#FFFFFF',
    border: 'rgba(100, 110, 80, 0.15)',
    paperGrain: 'rgba(80, 90, 60, 0.04)',
    primary: '#C88A58',       // Warm terracotta ochre
    secondary: '#588157',     // Sage leaf green
    dark: '#283618',          // Deep olive sumi ink
    light: '#E9D8A6',         // Oat milk
    muted: '#A3B18A',         // Pale eucalyptus
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
  nordicLinen: {
    name: 'Nordic Linen Print',
    background: '#F6F8FA',    // Clean unbleached linen
    cardBg: '#FFFFFF',
    border: 'rgba(37, 99, 235, 0.14)',
    paperGrain: 'rgba(30, 40, 60, 0.03)',
    primary: '#2563EB',       // Cobalt Press Blue
    secondary: '#D97706',     // Nordic Amber
    dark: '#0F172A',          // Deep slate ink
    light: '#E0F2FE',         // Pale glacier
    muted: '#94A3B8',         // Cool slate
  },
  kraftPostal: {
    name: 'Kraft & Rubber Stamp',
    background: '#EADBCA',    // Raw Kraft Paper
    cardBg: '#F4E8D9',
    border: 'rgba(100, 70, 40, 0.18)',
    paperGrain: 'rgba(80, 50, 20, 0.05)',
    primary: '#C5221F',       // Post Office Stamp Red
    secondary: '#1A535C',     // Postal Petrol Teal
    dark: '#2B1E16',          // Dark walnut ink
    light: '#F7EDE2',         // Bleached linen
    muted: '#8C7A6B',         // Raw twine brown
  }
};

export const DEFAULT_PALETTE = PALETTES.risographClassic;
