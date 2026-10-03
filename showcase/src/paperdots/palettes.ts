import type { RisographPalette } from './types';

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
