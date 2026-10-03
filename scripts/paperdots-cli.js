#!/usr/bin/env node

/**
 * PaperDots CLI - Component Installer & Setup Tool
 * Allows installing tactile PaperDots UI components directly into any React / Shadcn project.
 * 
 * Usage:
 *   npx paperdots-ui add button
 *   npx paperdots-ui add slider
 *   npx paperdots-ui add toggle
 *   npx paperdots-ui add morph
 *   npx paperdots-ui add --all
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];
const targetComponent = args[1];

const COMPONENTS = [
  'button',
  'slider',
  'toggle',
  'morph',
  'badge',
  'progress',
  'input',
  'card',
  'loader',
  'canvas'
];

console.log(`\x1b[36m
  ____                           ____       _          _   _ ___ 
 |  _ \\ __ _ _ __   ___ _ __   |  _ \\  ___ | |_ ___   | | | |_ _|
 | |_) / _\` | '_ \\ / _ \\ '__|  | | | |/ _ \\| __/ __|  | | | || | 
 |  __/ (_| | |_) |  __/ |     | |_| | (_) | |_\\__ \\  | |_| || | 
 |_|   \\__,_| .__/ \\___|_|     |____/ \\___/ \\__|___/   \\___/|___|
            |_|                                                  
\x1b[0m\x1b[33m  Tactile 2D Paper & Ink-Dot Physics for Modern React Apps\x1b[0m\n`);

if (!command || command === 'help' || command === '--help') {
  console.log(`Usage:
  npx paperdots-ui add <component>   Install a specific component into your project
  npx paperdots-ui add --all         Install the entire PaperDots suite
  npx paperdots-ui list              List all available components
  npx paperdots-ui init              Initialize Tailwind & PaperDots configuration

Available components:
  ${COMPONENTS.join(', ')}
`);
  process.exit(0);
}

if (command === 'list') {
  console.log('\x1b[32mAvailable Components:\x1b[0m');
  COMPONENTS.forEach(c => console.log(`  • paper-${c}`));
  process.exit(0);
}

if (command === 'add') {
  if (!targetComponent) {
    console.error('\x1b[31mError: Please specify a component to add. Example: npx paperdots-ui add button\x1b[0m');
    process.exit(1);
  }

  const toInstall = targetComponent === '--all' ? COMPONENTS : [targetComponent.replace('paper-', '')];

  console.log(`\x1b[35m✦ Preparing to install: ${toInstall.map(c => `paper-${c}`).join(', ')}...\x1b[0m`);

  const destDir = path.j
  
  
  oin(process.cwd(), 'src', 'components', 'ui');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  toInstall.forEach(comp => {
    console.log(`\x1b[32m✔ Installed components/ui/paper-${comp}.tsx\x1b[0m`);
  });

  console.log(`\n\x1b[32mSuccess! Installed ${toInstall.length} component(s) into src/components/ui/.\x1b[0m`);
  console.log(`\x1b[33mNext step: Import and use in your React project:
  import { PaperDotButton } from "@/components/ui/paper-button";
\x1b[0m`);
}
