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

COMPONENTS = ["button", "slider", "toggle", "loader", "morph", "card", "canvas", "badge", "progress", "input", "tabs", "rating", "dial"]
PALETTES = ["risographClassic", "warmZine", "pastelZine", "matchaPaper", "monochromePress", "botanicalOchre"]
SHAPES = ["circle", "heart", "star", "play", "pause", "check", "arrow"]

SAMPLE_PROMPTS = [
    ("A tactile risograph teal button labeled 'Publish Zine' that pops with gentle spring return", "button", "risographClassic", "circle", "Publish Zine", 0.22, 0.78, 0),
    ("An elastic volume slider with clay ink beads for Julian's interactive music zine", "slider", "warmZine", "circle", "Volume", 0.28, 0.75, 0),
    ("A glowing neon cyan heart toggle that snaps with fast spring bounce", "toggle", "pastelZine", "heart", "Like", 0.32, 0.70, 0),
    ("A hypnotic slow-pulsing loader with matcha green paper dots", "loader", "matchaPaper", "circle", "Brewing...", 0.10, 0.88, 0),
    ("A letterpress lead black star icon that morphs with smooth harmonic pulse", "morph", "monochromePress", "star", "", 0.16, 0.82, 0),
    ("An interactive canvas grid with rice paper texture and gentle water ripple physics", "canvas", "matchaPaper", "circle", "", 0.12, 0.85, 0),
    ("A ripped paper card container with stippled halftone borders for an art gallery piece", "card", "risographClassic", "circle", "Artwork No. 4", 0.18, 0.82, 0),
    ("A tactile play button with coral ink dots that glides with snakey kinetic animation", "button", "warmZine", "play", "Play Story", 0.24, 0.76, 0),
    ("A high-tension spring slider for controlling ink bleed density", "slider", "risographClassic", "circle", "Ink Bleed", 0.35, 0.68, 0),
    ("A minimal soy black pause toggle for audio playback", "toggle", "monochromePress", "pause", "Audio", 0.25, 0.78, 0),
    ("A tactile 3-segment tabs bar with crawling dot indicator for section navigation", "tabs", "risographClassic", "circle", "Overview / Press / Halftones", 0.24, 0.80, 0),
    ("A 5-star rating component with bloom expand ink dots and harmonic audio chime", "rating", "warmZine", "star", "5 Stars", 0.25, 0.78, 0),
    ("A rotary potentiometer dial labeled 'Cutoff' with magnetic detents and mechanical tick clicks", "dial", "monochromePress", "circle", "Cutoff", 0.28, 0.76, 0),
    ("A domino cascade progress bar with capillary ink bleed transfer", "progress", "risographClassic", "circle", "Ink Transfer", 0.20, 0.82, 0),
    ("A typewriter recoil text input field for searching risograph print archives", "input", "botanicalOchre", "circle", "Search Zines...", 0.22, 0.80, 0),
]

def generate_entry(prompt, comp_type, palette, shape, label, stiffness, damping, scatter):
    width = 320 if comp_type == "tabs" else 180 if comp_type == "rating" else 110 if comp_type in ["loader", "morph", "dial"] else 260 if comp_type in ["slider", "progress", "input"] else 76 if comp_type == "toggle" else 300 if comp_type == "card" else 500 if comp_type == "canvas" else 180
    height = 44 if comp_type == "tabs" else 36 if comp_type == "rating" else 110 if comp_type in ["loader", "morph", "dial"] else 48 if comp_type in ["slider", "progress", "input"] else 38 if comp_type == "toggle" else 180 if comp_type == "card" else 320 if comp_type == "canvas" else 54
    dot_radius = 2.8 if comp_type in ["morph", "rating"] else 2.2
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
