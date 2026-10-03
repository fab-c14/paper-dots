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
const https = require('https');

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
  'canvas',
  'checkbox',
  'radio',
  'dial',
  'rating',
  'tabs'
];

console.log(`\x1b[36m
  ____                           ____       _          _   _ ___ 
 |  _ \\ __ _ _ __   ___ _ __   |  _ \\  ___ | |_ ___   | | | |_ _|
 | |_) / _\` | '_ \\ / _ \\ '__|  | | | |/ _ \\| __/ __|  | | | || | 
 |  __/ (_| | |_) |  __/ |     | |_| | (_) | |_\\__ \\  | |_| || | 
 |_|   \\__,_| .__/ \\___|_|     |____/ \\___/ \\__|___/   \\___/|___|
            |_|                                                  
\x1b[0m\x1b[33m  Tactile 2D Paper & Ink-Dot Physics for Modern React Apps\x1b[0m\n`);

if (!command || command === 'help' || command === '--help' || command === '-h') {
  console.log(`Usage:
  npx paperdots-ui add <component>   Install a specific component into your project
  npx paperdots-ui add --all         Install the entire PaperDots suite
  npx paperdots-ui list              List all available components
  npx paperdots-ui init              Initialize directory structure & helper utilities

Available components:
  ${COMPONENTS.join(', ')}

Examples:
  npx paperdots-ui add button
  npx paperdots-ui add slider
  npx paperdots-ui add --all
`);
  process.exit(0);
}

if (command === 'list') {
  console.log('\x1b[32mAvailable Components:\x1b[0m');
  COMPONENTS.forEach(c => console.log(`  • paper-${c}`));
  console.log('\nInstall any component with: \x1b[33mnpx paperdots-ui add <name>\x1b[0m');
  process.exit(0);
}

if (command === 'init') {
  const destDir = getDestinationDir();
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  ensureUtilsHelper(destDir);
  console.log(`\x1b[32m✔ Initialized PaperDots directory at ${destDir}\x1b[0m`);
  console.log('\x1b[33mReady! Now run: npx paperdots-ui add button\x1b[0m\n');
  process.exit(0);
}

if (command === 'add') {
  if (!targetComponent) {
    console.error('\x1b[31mError: Please specify a component to add. Example: npx paperdots-ui add button\x1b[0m');
    process.exit(1);
  }

  const rawName = targetComponent.toLowerCase().replace(/^paper-/, '');
  const toInstall = targetComponent === '--all' ? COMPONENTS : [rawName];

  const invalid = toInstall.filter(c => !COMPONENTS.includes(c));
  if (invalid.length > 0 && targetComponent !== '--all') {
    console.error(`\x1b[31mError: Unknown component "${invalid[0]}".\x1b[0m`);
    console.log(`Available components: ${COMPONENTS.join(', ')}`);
    process.exit(1);
  }

  console.log(`\x1b[35m✦ Preparing to install: ${toInstall.map(c => `paper-${c}`).join(', ')}...\x1b[0m`);

  const destDir = getDestinationDir();
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  ensureUtilsHelper(destDir);

  let installedCount = 0;

  for (const comp of toInstall) {
    const targetFile = path.join(destDir, `paper-${comp}.tsx`);
    const content = getComponentSource(comp);

    fs.writeFileSync(targetFile, content, 'utf8');
    const relPath = path.relative(process.cwd(), targetFile);
    console.log(`\x1b[32m✔ Installed ${relPath}\x1b[0m`);
    installedCount++;
  }

  console.log(`\n\x1b[32mSuccess! Installed ${installedCount} component(s) into ${path.relative(process.cwd(), destDir)}.\x1b[0m`);
  console.log(`\x1b[33mUsage Example:
  import { Button } from "@/components/ui/paper-button";

  export default function MyZine() {
    return (
      <Button variant="paper-kinetic" dotShape="square" animationType="hydraulic-pop">
        Publish Zine
      </Button>
    );
  }
\x1b[0m`);
  process.exit(0);
}

console.error(`\x1b[31mError: Unknown command "${command}". Run "npx paperdots-ui help" for usage.\x1b[0m`);
process.exit(1);

// Helper Functions
function getDestinationDir() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'src', 'components', 'ui'))) {
    return path.join(cwd, 'src', 'components', 'ui');
  }
  if (fs.existsSync(path.join(cwd, 'src'))) {
    return path.join(cwd, 'src', 'components', 'ui');
  }
  if (fs.existsSync(path.join(cwd, 'components', 'ui'))) {
    return path.join(cwd, 'components', 'ui');
  }
  return path.join(cwd, 'src', 'components', 'ui');
}

function ensureUtilsHelper(destDir) {
  // Ensure cn helper exists either in lib/utils.ts or destDir/utils.ts
  const libUtils = path.join(process.cwd(), 'src', 'lib', 'utils.ts');
  const rootLibUtils = path.join(process.cwd(), 'lib', 'utils.ts');
  const localUtils = path.join(destDir, 'utils.ts');

  if (!fs.existsSync(libUtils) && !fs.existsSync(rootLibUtils) && !fs.existsSync(localUtils)) {
    const utilsDir = fs.existsSync(path.join(process.cwd(), 'src')) 
      ? path.join(process.cwd(), 'src', 'lib') 
      : path.join(process.cwd(), 'lib');
    
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
    }
    const cnCode = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
    fs.writeFileSync(path.join(utilsDir, 'utils.ts'), cnCode, 'utf8');
  }
}

function getComponentSource(comp) {
  // 1. Try local repository source files if available
  const localCandidates = [
    path.join(__dirname, '..', 'showcase', 'src', 'paperdots', 'shadcn', `paper-${comp}.tsx`),
    path.join(__dirname, '..', 'showcase', 'src', 'paperdots', 'shadcn', comp === 'toggle' ? 'paper-switch.tsx' : `paper-${comp}.tsx`),
    path.join(__dirname, '..', 'src', 'components', 'ui', `paper-${comp}.tsx`),
    path.join(process.cwd(), 'showcase', 'src', 'paperdots', 'shadcn', `paper-${comp}.tsx`),
  ];

  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      try {
        const text = fs.readFileSync(candidate, 'utf8');
        if (text && text.trim().length > 50) return text;
      } catch {}
    }
  }

  // 2. Try registry JSON
  const registryCandidates = [
    path.join(__dirname, '..', 'showcase', 'public', 'r', `paper-${comp}.json`),
    path.join(process.cwd(), 'showcase', 'public', 'r', `paper-${comp}.json`),
  ];

  for (const reg of registryCandidates) {
    if (fs.existsSync(reg)) {
      try {
        const json = JSON.parse(fs.readFileSync(reg, 'utf8'));
        if (json.files && json.files[0] && json.files[0].content) {
          return json.files[0].content;
        }
      } catch {}
    }
  }

  // 3. Fallback self-contained templates
  return generateFallbackTemplate(comp);
}

function generateFallbackTemplate(comp) {
  const cap = comp.charAt(0).toUpperCase() + comp.slice(1);
  return `import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

export interface Paper${cap}Props extends React.HTMLAttributes<HTMLDivElement> {
  dotShape?: "circle" | "square" | "diamond";
  inkColor?: string;
  animationType?: string;
  burstIntensity?: "none" | "gentle" | "confetti";
}

/**
 * PaperDots UI - Paper ${cap}
 * Tactile 2D paper & risograph dot-physics component.
 */
export const Paper${cap} = React.forwardRef<HTMLDivElement, Paper${cap}Props>(
  ({ className = "", dotShape = "square", inkColor = "#0078BF", animationType = "glow-fade", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={"inline-flex items-center justify-center p-3 rounded-xl font-mono font-bold transition-all " + className}
        style={{
          border: "2px solid " + inkColor,
          backgroundColor: "#FAF7F0",
          color: inkColor,
        }}
        {...props}
      >
        <span className="mr-2 opacity-80">{dotShape === "square" ? "■" : "●"}</span>
        {children || "Paper${cap}"}
      </div>
    );
  }
);

Paper${cap}.displayName = "Paper${cap}";
`;
}
