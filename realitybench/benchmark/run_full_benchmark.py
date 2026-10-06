"""
RealityBench Full Suite Runner
Executes evaluation across all 12 tasks in the benchmark suite for:
- Naive Baseline
- Robust Baseline
- Active Ollama LLM Models (qwen2.5-coder:1.5b, gemma2:2b)
Saves results to results/full_benchmark_results.json.
"""

import sys
import os
import json
import time
import requests
from typing import Dict, Any, List

# Ensure realitybench package is on path
current_dir = os.path.dirname(os.path.abspath(__file__))
bench_root = os.path.abspath(os.path.join(current_dir, ".."))
if bench_root not in sys.path:
    sys.path.insert(0, bench_root)

from benchmark.tasks.registry import ALL_TASKS, TaskDefinition
from benchmark.graders.browser_runner import extract_html_code
from benchmark.graders.scoring import EvaluationReport


OLLAMA_API_URL = "http://localhost:11434/api/generate"
RESULTS_DIR = os.path.join(bench_root, "results")
GEN_CODE_DIR = os.path.join(RESULTS_DIR, "generated_code")


def ensure_directories():
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(GEN_CODE_DIR, exist_ok=True)


def get_available_ollama_models() -> List[str]:
    """Checks which models are currently available in local Ollama."""
    try:
        res = requests.get("http://localhost:11434/api/tags", timeout=3)
        if res.status_code == 200:
            data = res.json()
            return [m["name"] for m in data.get("models", [])]
    except Exception:
        pass
    return []


def generate_llm_code(model_name: str, task: TaskDefinition) -> str:
    """Prompts Ollama for the task implementation or returns cached code."""
    model_slug = model_name.replace(":", "_").replace("/", "_")
    model_dir = os.path.join(GEN_CODE_DIR, model_slug)
    os.makedirs(model_dir, exist_ok=True)
    cache_path = os.path.join(model_dir, f"{task.task_id}.html")

    # If already cached, reuse
    if os.path.exists(cache_path):
        print(f"    [Cache] Reusing generated code from {cache_path}")
        with open(cache_path, "r", encoding="utf-8") as f:
            return f.read()

    print(f"    [Ollama] Prompting {model_name} for {task.name}...")
    system_prompt = (
        "You are an expert web software engineer. Write clean, self-contained HTML, CSS, "
        "and JavaScript implementing the requested UI component according to the prompt. "
        "Return ONLY the self-contained HTML document inside ```html ... ``` code block."
    )
    payload = {
        "model": model_name,
        "prompt": f"{system_prompt}\n\nTask:\n{task.prompt}",
        "stream": False,
        "options": {
            "temperature": 0.2,
            "num_predict": 2048,
        }
    }

    try:
        resp = requests.post(OLLAMA_API_URL, json=payload, timeout=120)
        resp.raise_for_status()
        raw_text = resp.json().get("response", "")
        code = extract_html_code(raw_text)
        with open(cache_path, "w", encoding="utf-8") as f:
            f.write(code)
        return code
    except Exception as e:
        print(f"    [Error] LLM Generation failed: {e}")
        return ""


def evaluate_task_for_target(task: TaskDefinition, target_name: str) -> EvaluationReport:
    """Evaluates a single task for a target (baseline or LLM)."""
    if target_name == "naive-baseline":
        code = task.naive_code
    elif target_name == "robust-baseline":
        code = task.robust_code
    else:
        code = generate_llm_code(target_name, task)

    if not code:
        # Return empty failure report
        return EvaluationReport(task_name=task.task_id)

    return task.grader(code)


def run_full_suite(models_to_evaluate: List[str] = None):
    ensure_directories()

    available_models = get_available_ollama_models()
    print("=================================================================")
    print("             REALITYBENCH: FULL 12-TASK BENCHMARK SUITE          ")
    print("=================================================================")
    print(f"Total Tasks registered: {len(ALL_TASKS)}")
    print(f"Available local Ollama models: {available_models}")

    default_targets = ["naive-baseline", "robust-baseline"]
    # Add fast verified models if present in Ollama
    for candidate in ["qwen2.5-coder:1.5b", "gemma2:2b"]:
        if any(candidate in m for m in available_models):
            default_targets.append(candidate)

    targets = models_to_evaluate or default_targets
    print(f"Evaluation targets: {targets}\n")

    full_results = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "task_count": len(ALL_TASKS),
        "targets": targets,
        "evaluations": {},
        "target_summaries": {}
    }

    for target in targets:
        print(f"\n>>> Running Evaluation for Target: {target}")
        full_results["evaluations"][target] = {}
        total_demo = 0.0
        total_reality = 0.0
        total_gap = 0.0

        for task in ALL_TASKS:
            print(f"  [Task {task.task_number:02d}/12] {task.name} ({task.task_id})...", end=" ", flush=True)
            report = evaluate_task_for_target(task, target)
            full_results["evaluations"][target][task.task_id] = report.to_dict()

            total_demo += report.demo_score
            total_reality += report.reality_score
            total_gap += report.reality_gap

            print(f"Demo: {report.demo_score*100:.1f}%, Reality: {report.reality_score*100:.1f}%, Gap: {report.reality_gap*100:.1f}%")

        n = len(ALL_TASKS)
        avg_demo = total_demo / n
        avg_reality = total_reality / n
        avg_gap = total_gap / n

        full_results["target_summaries"][target] = {
            "avg_demo_score": round(avg_demo, 4),
            "avg_reality_score": round(avg_reality, 4),
            "avg_reality_gap": round(avg_gap, 4),
        }
        print(f"  --> TARGET SUMMARY [{target}]: Avg Demo={avg_demo*100:.2f}%, Avg Reality={avg_reality*100:.2f}%, Avg Reality Gap={avg_gap*100:.2f}%\n")

    # Save complete dataset
    out_path = os.path.join(RESULTS_DIR, "full_benchmark_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(full_results, f, indent=2)

    print("=================================================================")
    print("                     BENCHMARK SUITE COMPLETE                    ")
    print("=================================================================")
    print(f"Results saved to: {out_path}\n")

    # Print summary table
    print(f"{'Target':<24} | {'Demo Score':<12} | {'Reality Score':<14} | {'Reality Gap':<12}")
    print("-" * 70)
    for target, summary in full_results["target_summaries"].items():
        print(f"{target:<24} | {summary['avg_demo_score']*100:>10.2f}% | {summary['avg_reality_score']*100:>12.2f}% | {summary['avg_reality_gap']*100:>10.2f}%")
    print("=================================================================\n")

    return full_results


if __name__ == "__main__":
    run_full_suite()
