"""
Thinking Machines - Tinker Fine-Tuning Dataset Generator for PaperDots UI
Generates comprehensive instruction-tuning pairs for compiling natural language UI
descriptions into declarative PaperDots physics DSL JSON, covering all standard and novel archetypes.
"""

import json
import random
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(OUTPUT_DIR, "paperdots_tinker_train.jsonl")

COMPONENTS = [
    "button", "slider", "toggle", "checkbox", "radio", "loader", "morph",
    "card", "canvas", "badge", "progress", "input", "tabs", "rating", "dial",
    "equalizer", "radar", "keypad", "compass", "orbit", "ripple-pool", "tachometer"
]

PALETTES = [
    "risographClassic", "warmZine", "pastelZine", "matchaPaper",
    "monochromePress", "botanicalOchre", "nordicLinen", "kraftPostal"
]

SHAPES = ["circle", "heart", "star", "play", "pause", "check", "arrow"]
DOT_SHAPES = ["circle", "square", "diamond"]

SPOT_INKS = [
    ("#FF48B0", "fluorescent pink"),
    ("#0078BF", "federal blue"),
    ("#FFD800", "sunflower amber"),
    ("#00A95C", "mint seafoam"),
    ("#F15060", "scarlet crimson"),
    ("#765BA7", "violet purple"),
    ("#00805A", "emerald green"),
    ("#BB6B00", "terracotta clay"),
    ("#00838A", "teal aqua"),
    ("#8E6F3E", "bronze gold"),
    ("#1C1D1F", "soy black")
]

ANIMATIONS = [
    "glow-fade", "wave-sweep", "smooth-pulse", "radar-sweep", "equalizer-bounce",
    "harmonic-wave", "matrix-rain", "cylinder-roll", "slingshot-snap", "elastic-string",
    "magnetic-tick", "domino-cascade", "beacon-pulse", "shimmer-wave", "typewriter-recoil"
]

HOVER_BEHAVIORS = ["glow-fade", "bloom", "color-shift", "scale", "shimmer"]
CLICK_BEHAVIORS = ["hydraulic-pop", "ripple", "elastic-snap", "burst", "toggle"]

CURATED_PROMPTS = [
    # Novel Kinetic Archetypes
    ("A 360-degree radar sweep scanner with emerald dots that turns amber on hover with blooming dots", "radar", "botanicalOchre", "circle", "circle", "Radar Sweep", 0.22, 0.80, "radar-sweep", "#00805A", "#FFD800", "bloom", "hydraulic-pop", 240, 240),
    ("An interactive nautical compass gyroscope with magnetic needle tracking cursor", "compass", "risographClassic", "circle", "circle", "Magnetic Gyroscope", 0.24, 0.78, "glow-fade", "#0078BF", "#FF48B0", "bloom", "hydraulic-pop", 240, 240),
    ("A planetary Keplerian solar system with cosmic orbits and gravitational cursor pull", "orbit", "nordicLinen", "circle", "circle", "Gravity Solar System", 0.22, 0.80, "glow-fade", "#765BA7", "#FFD800", "color-shift", "hydraulic-pop", 260, 260),
    ("A capillary fluid ripple pool that disperses harmonic ink rings on cursor touch", "ripple-pool", "pastelZine", "circle", "circle", "Capillary Surface", 0.24, 0.76, "wave-sweep", "#00838A", "#FF48B0", "bloom", "ripple", 300, 180),
    ("A high-rev engine RPM tachometer gauge with crimson redline arc that revs on hover", "tachometer", "monochromePress", "circle", "circle", "RPM Tachometer", 0.26, 0.75, "glow-fade", "#1C1D1F", "#F15060", "bloom", "hydraulic-pop", 240, 200),
    ("An acoustic equalizer visualizer with bouncing emerald bars and rustle paper audio", "equalizer", "botanicalOchre", "circle", "square", "EQ Visualizer", 0.25, 0.76, "equalizer-bounce", "#00805A", "#FFD800", "scale", "hydraulic-pop", 300, 150),
    ("A continuous sinusoidal waveform oscilloscope with cyan ink and paper grain", "waveform", "matchaPaper", "circle", "circle", "Soundwave Oscilloscope", 0.22, 0.82, "harmonic-wave", "#00A95C", "#0078BF", "glow-fade", "hydraulic-pop", 320, 140),
    ("A cascading digital matrix rain with paper jitter and 0.28 bouncy stiffness", "matrix", "monochromePress", "square", "square", "Matrix Rain", 0.28, 0.72, "matrix-rain", "#00805A", "#FFD800", "color-shift", "burst", 280, 160),
    ("A cardiac rhythm heartbeat monitor with crimson ink and smooth pulse with zero burst", "heartbeat", "warmZine", "heart", "circle", "Cardiac Monitor", 0.20, 0.82, "smooth-pulse", "#F15060", "#FF48B0", "bloom", "hydraulic-pop", 320, 130),
    ("A harmonic pendulum metronome with smooth gravity swing and letterpress ink", "pendulum", "monochromePress", "circle", "circle", "Harmonic Pendulum", 0.22, 0.80, "glow-fade", "#1C1D1F", "#0078BF", "scale", "hydraulic-pop", 220, 200),
    ("A 3x4 tactile keypad matrix with stippled number keys that clicks with mechanical pop", "keypad", "risographClassic", "circle", "square", "Tactile Keypad", 0.24, 0.80, "glow-fade", "#0078BF", "#FF48B0", "bloom", "hydraulic-pop", 200, 250),

    # Standard UI Controls with Hover Color and Behavior
    ("A glowing neon cyber button labeled 'Stamp Proof' with glow-fade hover and hot pink ink", "button", "pastelZine", "circle", "square", "Stamp Proof", 0.22, 0.80, "glow-fade", "#FF48B0", "#FFD800", "glow-fade", "hydraulic-pop", 180, 52),
    ("A tactile stippled checkbox labeled 'Auto-Print' that shifts to cobalt ink on hover", "checkbox", "risographClassic", "check", "square", "Auto-Print", 0.24, 0.78, "glow-fade", "#00805A", "#0078BF", "color-shift", "toggle", 180, 38),
    ("A circular tactile radio option labeled 'High Density' with expanding bullseye center", "radio", "warmZine", "circle", "circle", "High Density", 0.25, 0.76, "glow-fade", "#BB6B00", "#FF48B0", "bloom", "toggle", 180, 38),
    ("A smooth paper toggle that glides like a rolling cylinder with zero pop", "toggle", "botanicalOchre", "circle", "circle", "Risograph Mode", 0.20, 0.82, "cylinder-roll", "#00805A", "#FFD800", "bloom", "toggle", 76, 38),
    ("A sequential circular loader where equal-sized dots swell in a traveling wave", "loader", "matchaPaper", "circle", "circle", "Printing...", 0.18, 0.82, "smooth-pulse", "#00A95C", "#0078BF", "bloom", "hydraulic-pop", 100, 100),
    ("An interactive morph shape that glides between play and pause on hover", "morph", "warmZine", "play", "circle", "Play Zine", 0.24, 0.78, "glow-fade", "#FF48B0", "#0078BF", "bloom", "hydraulic-pop", 120, 120),
    ("An elastic string slider with magnetic notches for adjusting zine ink flow", "slider", "warmZine", "circle", "square", "Ink Flow", 0.26, 0.76, "elastic-string", "#BB6B00", "#FFD800", "color-shift", "hydraulic-pop", 240, 48),
    ("A live edition badge with pulsing emerald indicator and stippled pill border", "badge", "botanicalOchre", "circle", "circle", "Edition 01: Live", 0.20, 0.82, "beacon-pulse", "#00805A", "#FFD800", "bloom", "hydraulic-pop", 140, 34),
    ("A typewriter recoil text input field for searching risograph print archives", "input", "botanicalOchre", "circle", "square", "Search Zines...", 0.22, 0.80, "typewriter-recoil", "#1C1D1F", "#0078BF", "glow-fade", "hydraulic-pop", 280, 46),
    ("A 5-star rating component with blooming ink dots and harmonic audio chime", "rating", "warmZine", "star", "circle", "5 Stars", 0.25, 0.78, "smooth-pulse", "#FFD800", "#FF48B0", "bloom", "hydraulic-pop", 180, 36),
    ("A rotary potentiometer dial labeled 'Cutoff' with magnetic detent ticks", "dial", "monochromePress", "circle", "circle", "Cutoff", 0.28, 0.76, "glow-fade", "#1C1D1F", "#00805A", "bloom", "hydraulic-pop", 110, 110),
]

def make_dsl(comp_type, palette, shape, dot_shape, label, stiffness, damping, anim, ink_col, hover_col, hover_beh, click_beh, w, h):
    return {
        "id": f"comp-{random.randint(1000, 9999)}",
        "componentType": comp_type,
        "label": label,
        "paletteKey": palette,
        "shape": shape,
        "dotShape": dot_shape,
        "burstIntensity": "none" if "none" in click_beh or comp_type in ["toggle", "heartbeat"] else "gentle",
        "animationType": anim,
        "inkColor": ink_col,
        "hoverColor": hover_col,
        "hoverBehavior": hover_beh,
        "clickBehavior": click_beh,
        "physics": {
            "stiffness": stiffness,
            "damping": damping,
            "mass": 1.0,
            "jitter": round(random.uniform(0.04, 0.15), 2),
            "scatterForce": 0 if comp_type in ["toggle", "checkbox", "heartbeat"] else 10
        },
        "dimensions": {
            "width": w,
            "height": h
        },
        "dotStyling": {
            "baseRadius": 3.0 if comp_type in ["morph", "badge", "rating"] else 2.4,
            "spacing": 7,
            "inkBleed": True,
            "paperGrainIntensity": 0.05
        },
        "description": f"Generative {comp_type} with {dot_shape} dots, {anim} kinetic animation, {ink_col} ink, and tactile physics."
    }

def generate_entry(prompt, dsl):
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

    # 1. Add All Curated High-Fidelity Prompts
    for item in CURATED_PROMPTS:
        prompt, comp, pal, sh, dsh, lbl, stiff, damp, anim, ink, hov_col, hov_beh, clk_beh, w, h = item
        dsl = make_dsl(comp, pal, sh, dsh, lbl, stiff, damp, anim, ink, hov_col, hov_beh, clk_beh, w, h)
        entries.append(generate_entry(prompt, dsl))

    # 2. Synthetic Variations across All 22 Component Types
    for comp in COMPONENTS:
        for _ in range(12):
            pal = random.choice(PALETTES)
            sh = random.choice(SHAPES)
            dsh = random.choice(DOT_SHAPES)
            ink_hex, ink_name = random.choice(SPOT_INKS)
            hov_hex, hov_name = random.choice([x for x in SPOT_INKS if x[0] != ink_hex])
            anim = random.choice(ANIMATIONS)
            hov_beh = random.choice(HOVER_BEHAVIORS)
            clk_beh = random.choice(CLICK_BEHAVIORS)

            stiff = round(random.uniform(0.18, 0.32), 2)
            damp = round(random.uniform(0.72, 0.85), 2)

            w = 240 if comp in ["compass", "tachometer", "radar"] else 260 if comp in ["orbit", "slider", "progress"] else 300 if comp in ["equalizer", "ripple-pool", "card"] else 320 if comp in ["waveform", "heartbeat", "tabs"] else 180 if comp in ["button", "checkbox", "radio", "rating"] else 110 if comp in ["loader", "morph", "dial"] else 76 if comp == "toggle" else 200
            h = 240 if comp in ["compass", "radar"] else 260 if comp == "orbit" else 200 if comp in ["tachometer", "pendulum"] else 180 if comp in ["ripple-pool", "card"] else 150 if comp == "equalizer" else 140 if comp in ["waveform", "matrix"] else 130 if comp == "heartbeat" else 110 if comp in ["loader", "morph", "dial"] else 52 if comp == "button" else 48 if comp == "slider" else 38 if comp in ["toggle", "checkbox", "radio"] else 36 if comp in ["rating", "progress", "badge"] else 250

            lbl = f"{comp.replace('-', ' ').title()}"

            adj = random.choice(["tactile", "bouncy", "stippled", "organic", "minimal", "kinetic", "letterpress", "vibrant"])
            prompt = f"A {adj} {comp} with {ink_name} dots that {hov_beh}s to {hov_name} on hover with {anim} animation."

            dsl = make_dsl(comp, pal, sh, dsh, lbl, stiff, damp, anim, ink_hex, hov_hex, hov_beh, clk_beh, w, h)
            entries.append(generate_entry(prompt, dsl))

    with open(DATASET_PATH, "w", encoding="utf-8") as f:
        for entry in entries:
            f.write(json.dumps(entry) + "\n")

    print(f"Generated {len(entries)} rich training samples saved to: {DATASET_PATH}")

if __name__ == "__main__":
    main()
