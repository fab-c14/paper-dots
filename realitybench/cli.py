"""
RealityBench CLI
Rich-powered terminal interface for RealityBench:
- Live colorful execution tables
- Beautiful summary scoreboard
- Task catalog inspection
- Empirical failure analysis
"""

import sys
import os
import json
import typer
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.columns import Columns
from rich import box

# Ensure realitybench is on path
current_dir = os.path.dirname(os.path.abspath(__file__))
bench_root = os.path.abspath(current_dir)
if bench_root not in sys.path:
    sys.path.insert(0, bench_root)

from benchmark.tasks.registry import ALL_TASKS, TASK_MAP
from benchmark.run_full_benchmark import run_full_suite, RESULTS_DIR

console = Console()
app = typer.Typer(
    help="RealityBench: Benchmarking AI-Generated Software Beyond the Happy Path",
    rich_markup_mode="rich"
)


def print_banner():
    banner = Text()
    banner.append("  REALITY", style="bold red")
    banner.append("BENCH  ", style="bold white on red")
    banner.append("— Benchmarking AI-Generated Software Beyond the Happy Path\n", style="bold cyan")
    banner.append("  [100% Deterministic Assertions • Headless Playwright DOM Harness • Kaggle Benchmarks SDK]", style="dim italic")
    console.print(Panel(banner, border_style="red", box=box.ROUNDED))


@app.command("tasks")
def list_tasks():
    """List all 12 registered benchmark tasks."""
    print_banner()
    table = Table(
        title="[bold yellow]Registered RealityBench Tasks (12 Total)[/bold yellow]",
        box=box.ROUNDED,
        border_style="bright_blue",
        header_style="bold magenta",
        show_lines=True
    )
    table.add_column("#", justify="center", style="bold cyan", width=4)
    table.add_column("Task ID", style="bold white", width=28)
    table.add_column("Task Name", style="bold green", width=26)
    table.add_column("Software Engineering Focus", style="dim white")

    for t in ALL_TASKS:
        table.add_row(
            f"{t.task_number:02d}",
            t.task_id,
            t.name,
            t.category_focus
        )

    console.print(table)


@app.command("inspect")
def inspect_task(task_id: str = typer.Argument(..., help="Task ID (e.g. realitybench-login)")):
    """Inspect the prompt, rubric, and focus of a specific task."""
    print_banner()
    task = TASK_MAP.get(task_id)
    if not task:
        console.print(f"[bold red]Error:[/bold red] Task '{task_id}' not found. Run [cyan]realitybench tasks[/cyan] to see available tasks.")
        raise typer.Exit(1)

    info_text = Text()
    info_text.append(f"Task Name: ", style="bold cyan")
    info_text.append(f"{task.name}\n", style="bold white")
    info_text.append(f"Task ID:   ", style="bold cyan")
    info_text.append(f"{task.task_id}\n", style="white")
    info_text.append(f"Category:  ", style="bold cyan")
    info_text.append(f"{task.category_focus}\n\n", style="yellow")
    info_text.append("Realistic Product Specification / Model Prompt:\n", style="bold green underline")
    info_text.append(task.prompt, style="dim white")

    console.print(Panel(info_text, title=f"[bold green]Task {task.task_number:02d}: {task.name}[/bold green]", border_style="green", box=box.ROUNDED))


@app.command("report")
def show_report():
    """Display the latest empirical evaluation report and scoreboard."""
    print_banner()
    res_path = os.path.join(RESULTS_DIR, "full_benchmark_results.json")
    if not os.path.exists(res_path):
        console.print("[bold red]No benchmark results found.[/bold red] Run [cyan]realitybench run[/cyan] first.")
        raise typer.Exit(1)

    with open(res_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    summaries = data.get("target_summaries", {})
    if not summaries:
        console.print("[bold yellow]No target summaries in results file.[/bold yellow]")
        raise typer.Exit(1)

    # Scoreboard Table
    table = Table(
        title="[bold bright_white]RealityBench: Empirical Scoreboard[/bold bright_white]",
        box=box.HEAVY_EDGE,
        border_style="bright_cyan",
        header_style="bold yellow",
        show_lines=True
    )
    table.add_column("Evaluation Target", style="bold white", width=24)
    table.add_column("Demo Score\n(Happy Path)", justify="center", style="bold blue", width=16)
    table.add_column("Reality Score\n(Perturbations)", justify="center", style="bold green", width=18)
    table.add_column("Reality Gap\n(Demo - Reality)", justify="center", style="bold red", width=18)
    table.add_column("Robustness Rating", justify="center", width=20)

    for target, s in summaries.items():
        demo = s["avg_demo_score"] * 100
        reality = s["avg_reality_score"] * 100
        gap = s["avg_reality_gap"] * 100

        if gap <= 5.0:
            rating = "[bold green][*****] Production Ready[/bold green]"
        elif gap <= 15.0:
            rating = "[bold blue][****] Resilient[/bold blue]"
        elif gap <= 30.0:
            rating = "[bold yellow][***] Moderate Fragility[/bold yellow]"
        else:
            rating = "[bold red][*] High Fragility Trap[/bold red]"

        table.add_row(
            target,
            f"{demo:.2f}%",
            f"{reality:.2f}%",
            f"[bold]{gap:+.2f}%[/bold]",
            rating
        )

    console.print(table)
    console.print(f"\n[dim italic]Timestamp: {data.get('timestamp')} • Tasks Evaluated: {data.get('task_count', 12)}[/dim italic]\n")


@app.command("run")
def execute_benchmark(
    target: Optional[str] = typer.Option(
        None, "--target", "-t",
        help="Evaluation target: 'naive-baseline', 'robust-baseline', model name, or 'all'"
    )
):
    """Run RealityBench evaluation across tasks and display colorful results."""
    print_banner()
    if target and target != "all":
        targets = [target]
    else:
        targets = ["naive-baseline", "robust-baseline"]

    console.print(f"[bold green]Starting evaluation for targets:[/bold green] {targets}\n")
    results = run_full_suite(targets)
    console.print("[bold green][OK] Benchmark run completed successfully![/bold green]\n")
    show_report()


if __name__ == "__main__":
    app()
