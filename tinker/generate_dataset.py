"""
Thinking Machines - Tinker Fine-Tuning Dataset Generator for PaperDots UI
Generates high-quality instruction-tuning pairs for compiling natural language UI
descriptions into declarative PaperDots physics DSL JSON.
"""

import json
import random
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(OUTPUT_DIR, "paperdots_tinker_train.jsonl")

COMPONENTS = ["button", "slider", "toggle", "loader", "morph", "card", "canvas"]
PALETTES = ["risographClassic", "warmZine", "cyberPaper", "matchaPaper", "monochromePress"]
SHAPES = ["circle", "heart", "star", "play", "pause", "check", "arrow"]

SAMPLE_PROMPTS = [
    ("A tactile risograph teal button labeled 'Publish Zine' that bursts into confetti when clicked", "button", "risographClassic", "circle", "Publish Zine", 0.22, 0.78, 24),
    ("An elastic volume slider with clay ink beads for Julian's interactive music zine", "slider", "warmZine", "circle", "Volume", 0.28, 0.75, 18),
    ("A glowing neon cyan heart toggle that snaps with fast spring bounce", "toggle", "cyberPaper", "heart", "Like", 0.32, 0.70, 20),
    ("A hypnotic slow-pulsing loader with matcha green paper dots", "loader", "matchaPaper", "circle", "Brewing...", 0.10, 0.88, 12),
    ("A letterpress lead black star icon that morphs with heavy jitter", "morph", "monochromePress", "star", "", 0.16, 0.82, 16),
    ("An interactive canvas grid with rice paper texture and gentle water ripple physics", "canvas", "matchaPaper", "circle", "", 0.12, 0.85, 14),
    ("A ripped paper card container with stippled halftone borders for an art gallery piece", "card", "risographClassic", "circle", "Artwork No. 4", 0.18, 0.82, 16),
    ("A tactile play button with coral ink dots that disperses on click", "button", "warmZine", "play", "Play Story", 0.24, 0.76, 26),
    ("A high-tension spring slider for controlling ink bleed density", "slider", "risographClassic", "circle", "Ink Bleed", 0.35, 0.68, 22),
    ("A minimal soy black pause toggle for audio playback", "toggle", "monochromePress", "pause", "Audio", 0.25, 0.78, 18),
    ("A celebratory confetti button labeled 'Roll Credits' in fluorescent pink", "button", "risographClassic", "circle", "Roll Credits", 0.30, 0.72, 30),
    ("A dark cyberpunk stippled card for displaying digital game stats", "card", "cyberPaper", "circle", "Level 42", 0.20, 0.80, 18),
]

def generate_entry(prompt, comp_type, palette, shape, label, stiffness, damping, scatter):
    width = 180 if comp_type == "button" else 260 if comp_type == "slider" else 76 if comp_type == "toggle" else 110 if comp_type == "loader" else 120 if comp_type == "morph" else 300 if comp_type == "card" else 500
    height = 54 if comp_type == "button" else 48 if comp_type == "slider" else 38 if comp_type == "toggle" else 110 if comp_type == "loader" else 120 if comp_type == "morph" else 180 if comp_type == "card" else 320
    dot_radius = 2.8 if comp_type == "morph" else 2.2
    dot_spacing = 22 if comp_type == "canvas" else 7

    dsl = {
        "id": f"comp-{random.randint(1000, 9999)}",
        "componentType": comp_type,
        "label": label,
        "paletteKey": palette,
        "shape": shape,
        "physics": {
            "stiffness": stiffness,
            "damping": damping,
            "mass": 1.0,
            "jitter": round(random.uniform(0.1, 0.3), 2),
            "scatterForce": scatter
        },
        "dimensions": {
            "width": width,
            "height": height
        },
        "dotStyling": {
            "baseRadius": dot_radius,
            "spacing": dot_spacing,
            "inkBleed": True,
            "paperGrainIntensity": 0.05
        },
        "description": f"Generative {comp_type} with {palette} risograph ink and tactile spring physics."
    }

    return {
        "messages": [
            {
                "role": "system",
                "content": "You are PaperDots-AI, an expert generative compiler that transforms natural language UI requests into declarative 2D paper-dot physics components adhering strictly to the PaperDots JSON schema."
            },
            {
                "role": "user",
                "content": prompt
            },
            {
                "role": "assistant",
                "content": json.dumps(dsl, separators=(',', ':'))
            }
        ]
    }

def main():
    entries = []
    # Add curated prompts
    for p in SAMPLE_PROMPTS:
        entries.append(generate_entry(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7]))

    # Generate synthetic variations
    adjectives = ["tactile", "bouncy", "gentle", "high-tension", "organic", "minimal", "vibrant", "moody", "risograph"]
    actions = ["Read Chapter", "Next Page", "Flip Zine", "Save Canvas", "Shuffle Dots", "Explore", "Ink Drop"]

    for _ in range(120):
        comp = random.choice(COMPONENTS)
        pal = random.choice(PALETTES)
        sh = random.choice(SHAPES)
        adj = random.choice(adjectives)
        lbl = random.choice(actions) if comp in ["button", "card"] else ""
        stiff = round(random.uniform(0.10, 0.35), 2)
        damp = round(random.uniform(0.70, 0.88), 2)
        scat = random.randint(14, 30)

        prompt = f"Create a {adj} {comp} using the {pal} palette with {sh} elements and responsive tactile springs."
        entries.append(generate_entry(prompt, comp, pal, sh, lbl, stiff, damp, scat))

    with open(DATASET_PATH, "w", encoding="utf-8") as f:
        for entry in entries:
            f.write(json.dumps(entry) + "\n")

    print(f"Generated {len(entries)} training samples saved to: {DATASET_PATH}")

if __name__ == "__main__":
    main()
