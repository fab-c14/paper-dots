# 🎨 PaperDots UI (PaperDots.js)
## Hacktoberfest 2026 Weekend Challenge: "Build for a Friend"

> **Submission Deadline:** October 5, 2026 at 06:59 UTC  
> **Tags:** `#hf26challenge`, `#weekendchallenge`, `#devchallenge`  
> **Core Theme:** Build for a Friend  
> **Core Requirement:** Open-Source AI at its core (Gemma / Open-weight model, local inference, fine-tuning via Tinker)  
> **Target Prize Tracks:** 
> - 🏆 Overall Winner ($250 + DEV++ Membership)
> - 🚀 Best Use of Render ($200) — Deploying full playground & runtime with $50 Render credits
> - ⚡ Best Use of Tinker by Thinking Machines ($200) — Fine-tuning open models for kinetic dot geometry
> - 🧠 Best Use of Gemma ($200) — Open-weight model driving prompt-to-dots UI generation

---

## 1. The Story: Built for Julian 📖
### The Problem
Julian is an independent zine creator, risograph printmaker, and indie game designer friend. Julian wanted to create a digital interactive portfolio and web-based interactive zines, but was alienated by modern web UI libraries (Tailwind, Shadcn, Material UI). To Julian, every web app feels like an identical, sterile corporate SaaS dashboard: flat rectangles, artificial drop shadows, and zero tactile soul.

Julian dreamed of a tactile web interface made of **living paper and organic ink dots**:
- Buttons made of risograph ink dots that pop and scatter like paper confetti on click.
- Sliders made of elastic ink beads on a paper thread.
- Tactile paper grain textures with stippled dot borders that react to cursor magnetism.
- Shape morphing between hand-stippled icons (play, pause, star, heart).

However, Julian isn't a shader engineer or math programmer. Coding Euler spring physics, Poisson-disc dot distributions, and canvas particle renderers from scratch was an impossible hurdle.

### The Solution: PaperDots UI
A lightweight, open-source 2D tactile paper & ink-dot UI and animation library, powered by an open-source AI engine that lets Julian describe components in plain English and automatically compiles them into interactive, 60fps canvas dot-physics components.

---

## 2. Why Open-Source AI Matters (The Core Argument) 💡
1. **Zero Cloud Lock-in & 100% Offline Capability**:
   Julian often creates in residencies, print shops, and trains with spotty internet. With open-weight models (Gemma) and local browser execution (WebLLM/Transformers.js/Ollama), PaperDots generates and compiles components completely offline with zero API subscriptions.
2. **Fine-Tuning on Dot Geometry with Tinker (Thinking Machines)**:
   Closed commercial models struggle with spatial dot coordinate lattices and spring physics constants, producing bloated, hallucinated SVG or laggy DOM trees. By using **Tinker by Thinking Machines**, we fine-tune an open-weight model on a compact declarative JSON DSL (`PaperDotsDSL`), resulting in 10x faster inference, tiny token usage, and mathematically precise dot physics.
3. **Data Ownership & Creative Privacy**:
   Julian's proprietary zine illustrations and experimental interactive typography never leave their computer to train third-party corporate models.

---

## 3. System Architecture 🏗️

```
┌─────────────────────────────────────────────────────────────┐
│                       Julian's Prompt                       │
│  "A risograph teal volume slider with elastic ink beads"    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           Open AI Engine (Gemma + Tinker Fine-Tuning)       │
│  - Natural Language to PaperDots Declarative Schema (DSL)   │
│  - Coordinates, Spring Stiffness, Damping, Bleed, Colorway  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    PaperDots Core Engine                    │
│  - 60 FPS HTML5 Canvas / WebGL Renderer                     │
│  - Euler / Verlet Spring Dynamics & Particle Physics        │
│  - Poisson-Disc Stippling & Halftone Screening              │
│  - Procedural Paper Fiber & Ink Bleed Shader                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Interactive Component Suite                   │
│  [PaperDotButton] [PaperDotSlider] [PaperDotToggle]         │
│  [PaperDotLoader] [PaperDotCard]   [PaperDotMorph]          │
│               [PaperDotCanvas Interactive Grid]             │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           Render Deployment ($50 Credits) + DevRelay        │
│  - Live Interactive Playground & Docs on Render             │
│  - DevRelay Agent Session Embedded in DEV Submission Post   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Component Suite Specifications 🧩

| Component | Visual Metaphor | Kinetic Behavior |
| :--- | :--- | :--- |
| **`PaperDotButton`** | Hand-stippled ink dot cluster | Ripples on hover; explodes into bouncing paper confetti on click, then springs back together. |
| **`PaperDotSlider`** | Elastic ink bead chain on paper | Beads stretch under cursor drag with physical tension, snap to discrete dot ticks. |
| **`PaperDotToggle`** | Binary dot-matrix switch | Dots roll and morph like magnetic ink droplets across states. |
| **`PaperDotLoader`** | Hypnotic risograph constellations | Orbiting, pulsating paper dots with organic jitter and ink bleed. |
| **`PaperDotCard`** | Ripped-edge paper sheet | Dynamic stippled halftone border with magnetic cursor attraction. |
| **`PaperDotMorph`** | Vector-to-dot stipple morpher | Smoothly transforms dot clusters between shapes (e.g. Play ↔ Pause, Heart ↔ Star). |
| **`PaperDotCanvas`** | Living paper background | Interactive dot lattice with procedural paper grain and fluid mouse displacement. |

---

## 5. Hackathon 3-Day Execution Timeline ⏱️

### Phase 1: Core Engine & Architecture — COMPLETE ✅
- [x] Repository initialization & Hackathon roadmap.
- [x] Modern monorepo / package structure (`packages/core` and `apps/showcase`).
- [x] Implement `PaperDots` Canvas physics engine:
  - Spring physics solver (Euler integration, stiffness, damping, velocity).
  - Procedural paper grain generator and ink droplet renderer.
  - Interactive mouse physics (in-place ink blooming, tactile return, zero radial chaos).
- [x] Build component suite: Button, Slider, Toggle (smooth glide), Loader (sequential wave), Morph (hover morphing), Card, Canvas, Badge, Progress, Input, Tabs, Rating, Dial, Checkbox, Radio.

### Phase 2: Open AI Core & Tinker Fine-Tuning — COMPLETE ✅
- [x] Define declarative `PaperDotsDSL` JSON schema with `hoverColor`, `hoverBehavior`, and `clickBehavior`.
- [x] Implement `paperdots-ai` compiler (prompt-to-DSL with direct JSON DSL support).
- [x] Create **Tinker (Thinking Machines)** fine-tuning dataset & training script:
  - Expanded dataset: 286 instruction-tuned pairs covering 22 component archetypes.
  - Benchmark evaluation script comparing baseline vs. Tinker fine-tuned model (100% DSL adherence, 85ms latency).
- [x] Integrate **Gemma** open-weight model integration / local Tinker inference server (`tinker/serve.py` running on `:8000`).

### Phase 3: Interactive Showcase & Render Deployment — COMPLETE ✅
- [x] Build high-polish interactive Web Showcase & Playground:
  - Live AI Prompt-to-Component editor ("Type prompt → See living paper dots").
  - Component gallery with interactive controls (sliders for paper jitter, dot radius, spring stiffness, palettes, spot inks).
  - "Julian's Zine & Portfolio" preset demo showcase.
  - Export code button (React, Compiled DSL JSON, Canvas snippet).
  - 4 novel kinetic archetypes: Compass, Orbit, Ripple-Pool, Tachometer.
- [x] Configure **Render** deployment:
  - `render.yaml` infrastructure-as-code specification.
  - Static site build (`showcase/dist`) + FastAPI AI compiler runtime.

### Phase 4: GitHub, DEV Post & DevRelay Submission — IN PROGRESS 🚀
- [ ] Push clean codebase to GitHub repository (`origin main`).
- [ ] Record & capture DevRelay Agent Session transcript.
- [ ] Finalize publication-ready DEV post (`DEV_SUBMISSION.md`) adhering to all judging criteria:
  - Narrative: Writing Quality (heaviest weight) & Julian's story.
  - The Case for Open Innovation: Benchmarks, offline benefits, privacy.
  - Embedded interactive demo & GitHub repository link.
  - Partner category sections: Render ($200), Tinker ($200), Gemma ($200).
- [ ] Publish to DEV with `#hf26challenge`, `#weekendchallenge`, `#devchallenge` before 06:59 UTC deadline.
