# H-Fest 2026 Workspace 🚀

Welcome to the **H-Fest 2026** workspace. This repository hosts two professional open-source projects built for **Hacktoberfest 2026** and the **Kaggle Benchmarking Challenge**:

---

## 📦 Projects Overview

### 1. [PaperDots](file:///./paperdots)
*Tactile Paper Physics UI & Component System for Web and React.*
- **Focus:** Micro-haptics, dot-matrix physics simulation, and tactile web interfaces.
- **Location:** [`./paperdots`](file:///./paperdots)
- **Features:** 12+ tactile components (PaperButton, PaperDial, PaperSlider, PaperMorph), shadcn/ui registry compatibility, Paper Compute AI theme compiler.

### 2. [RealityBench](file:///./realitybench)
*Benchmarking AI-Generated Software Beyond the Happy Path.*
- **Focus:** Evaluating AI coding models on real-world edge cases, perturbations, state preservation, and API failure recovery.
- **Location:** [`./realitybench`](file:///./realitybench)
- **Features:** 12 deterministic headless Playwright tasks, official `kaggle-benchmarks` SDK integration, Rich CLI (`realitybench tasks`, `realitybench report`), and empirical research figures.

---

## 🛠️ Quick Navigation

- To work on **PaperDots**:
  ```bash
  cd paperdots/showcase
  npm install
  npm run dev
  ```

- To run **RealityBench**:
  ```bash
  cd realitybench
  pip install -r requirements.txt
  playwright install chromium
  python cli.py report
  ```
