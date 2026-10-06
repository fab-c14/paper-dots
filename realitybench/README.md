# RealityBench 🛡️
### Benchmarking AI-Generated Software Beyond the Happy Path

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Playwright](https://img.shields.io/badge/tested%20with-Playwright-green.svg)](https://playwright.dev/)
[![Kaggle Benchmarks](https://img.shields.io/badge/Kaggle-Benchmarks%20SDK-20BEFF.svg)](https://github.com/Kaggle/kaggle-benchmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Core Research Question:** When AI coding models generate software that works in a normal demonstration, how well does that software survive realistic failures, unexpected inputs, and non-ideal user behavior?

---

## 🔬 Core Hypothesis: The Reality Gap

AI coding models have become remarkably adept at generating functional code for textbook happy paths. However, real-world software engineering is defined by how applications degrade under stress.

RealityBench tests generated web software across two distinct regimes:

1. **Regime A: Demo Score (40% Weight)**  
   Evaluates functionality under expected, ideal conditions:
   - Functional Correctness (25%)
   - Expected Interactions (15%)

2. **Regime B: Reality Score (60% Weight)**  
   Evaluates resilience under controlled perturbations:
   - Failure Recovery (20%): HTTP 500/timeout handling and preserving unsaved state.
   - State Robustness (15%): Back navigation, cancellation, and dependent dropdown resets.
   - Input Robustness (10%): Handling negative quantities, whitespace strings, and invalid formats.
   - Accessibility (7%): Proper `<label>` associations and ARIA markup.
   - Responsive Behavior (5%): Mobile viewport layout without horizontal scroll overflow.
   - Interaction Safety (3%): Rapid double-click debouncing.

$$\mathbf{Reality\ Gap} = \mathbf{Demo\ Score} - \mathbf{Reality\ Score}$$

---

## 🎯 The 12-Task Suite

| # | Task | Name | Category Focus |
| :-: | :--- | :--- | :--- |
| **01** | `realitybench-login` | Authentication & Login | Lockout countdown, credential validation, 401 error recovery |
| **02** | `realitybench-search` | Search & Autocomplete | Keystroke debouncing, empty results, 500 retry, keyboard navigation |
| **03** | `realitybench-checkout` | Order Checkout | Cart preservation on 500, double-submit debounce, coupon bounds |
| **04** | `realitybench-file-upload` | File Upload | File type rejection (.exe), 5MB size limits, failure retry |
| **05** | `realitybench-crud-dashboard` | Task CRUD Dashboard | Mutation rollback on 500, whitespace rejection, deletion confirmation |
| **06** | `realitybench-booking` | Appointment Booking | Past-date rejection, slot conflict 409 recovery, form preservation |
| **07** | `realitybench-chat` | Live Chat Component | Empty message rejection, in-thread 500 feedback, Enter key submit |
| **08** | `realitybench-product-page` | Product Detail Page | Out-of-stock disabling, broken image fallback, negative qty bounds |
| **09** | `realitybench-admin-table` | Admin Data Table | Null field resilience, pagination bounds, table headers markup |
| **10** | `realitybench-settings` | User Settings Panel | Dirty state tracking, discard restoration, HTTP 500 edit preservation |
| **11** | `realitybench-api-form` | Dependent API Form | Cascading dropdowns, parent switch state reset, 500 recovery |
| **12** | `realitybench-workflow` | Multi-Step Workflow Wizard | Step progression validation, Back navigation data retention, Step 3 500 retry |

---

## 📊 Benchmark Results

| Target | Avg Demo Score | Avg Reality Score | Reality Gap ($\Delta$) |
| :--- | :---: | :---: | :---: |
| **Naive Baseline** | **98.96%** | **33.33%** | **+65.62%** |
| **Qwen 2.5 Coder (1.5B)** | **81.77%** | **75.42%** | **+6.35%** |
| **Gemma 2 (2B)** | **80.21%** | **72.22%** | **+7.99%** |
| **Robust Baseline** | **100.00%** | **100.00%** | **0.00%** |

---

## 🚀 Quickstart & Execution

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/realitybench/realitybench.git
cd realitybench

# Install Python requirements
pip install -r requirements.txt

# Install Playwright browser binaries
playwright install chromium
```

### 2. Run the Full Suite

```bash
# Runs baselines and locally available Ollama models
python benchmark/run_full_benchmark.py
```

### 3. Generate Analysis & Charts

```bash
python analysis/generate_full_report.py
```

Charts are automatically generated in `analysis/charts/`:
- `full_suite_demo_vs_reality.png`
- `task_reality_gap_ranking.png`
- `category_failure_breakdown.png`

---

## 🛠️ Official Kaggle Benchmarks SDK Usage

Every task in RealityBench is registered as an official task with `@kbench.task`:

```python
import kaggle_benchmarks as kbench
from benchmark.tasks.registry import ALL_TASKS

# Run all tasks against a model
for task in ALL_TASKS:
    task.kbench_task.run(kbench.llm)
```

---

## 📄 License

MIT License. Built for the **Kaggle Benchmarking Challenge** in partnership with **DEV**.
