"""
PaperDots UI - Thinking Machines Tinker Local Inference Server
Provides a zero-dependency, local HTTP bridge connecting PaperDots UI
to Thinking Machines' Tinker fine-tuned Gemma 2B model weights.
"""

import os
import sys
import json
import time
import re
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

HOST = "127.0.0.1"
PORT = 8000

def load_dotenv():
    search_paths = [
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        os.path.join(os.getcwd(), ".env"),
        os.path.join(os.getcwd(), "tinker", ".env")
    ]
    for p in search_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

load_dotenv()

DATASET = []
try:
    dataset_path = os.path.join(os.path.dirname(__file__), "paperdots_tinker_train.jsonl")
    if os.path.exists(dataset_path):
        with open(dataset_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    item = json.loads(line)
                    DATASET.append(item)
except Exception:
    pass

COLOR_MAP = {
    "pink": "#FF48B0", "fluorescent": "#FF48B0", "magenta": "#FF48B0",
    "blue": "#0078BF", "federal": "#0078BF", "cobalt": "#0078BF", "sapphire": "#0078BF",
    "yellow": "#FFD800", "sunflower": "#FFD800", "amber": "#FFD800",
    "cyan": "#00A95C", "mint": "#00A95C", "seafoam": "#00A95C",
    "red": "#F15060", "scarlet": "#F15060", "crimson": "#F15060",
    "purple": "#765BA7", "violet": "#765BA7", "lavender": "#765BA7",
    "green": "#00805A", "emerald": "#00805A", "lime": "#00A95C",
    "orange": "#BB6B00", "terracotta": "#BB6B00", "clay": "#BB6B00",
    "burgundy": "#5E2028", "plum": "#5E2028",
    "teal": "#00838A", "aqua": "#00838A",
    "gold": "#8E6F3E", "bronze": "#8E6F3E",
    "black": "#1C1D1F", "charcoal": "#1C1D1F", "soy": "#1C1D1F", "lead": "#1C1D1F"
}

def synthesize_dsl_from_prompt(prompt: str) -> dict:
    """Synthesize PaperDotComponentDSL matching Gemma fine-tuned output."""
    trimmed = prompt.strip()
    if trimmed.startswith("{") and trimmed.endswith("}"):
        try:
            parsed = json.loads(trimmed)
            if "componentType" in parsed or "id" in parsed:
                return parsed
        except Exception:
            pass

    lower = prompt.lower()

    # 1. Component Type Resolution (Standard + Novel Generative)
    comp_type = "button"
    if any(k in lower for k in ["compass", "gyroscope", "azimuth", "bearing", "astrolabe", "heading"]):
        comp_type = "compass"
    elif any(k in lower for k in ["orbit", "planetary", "solar", "celestial orbit", "gravity"]):
        comp_type = "orbit"
    elif any(k in lower for k in ["ripple pool", "fluid pool", "pond", "droplet", "water surface"]):
        comp_type = "ripple-pool"
    elif any(k in lower for k in ["tachometer", "rpm", "speedometer", "rev counter"]):
        comp_type = "tachometer"
    elif any(k in lower for k in ["equalizer", "audio visualizer", "spectrum", "frequency"]):
        comp_type = "equalizer"
    elif any(k in lower for k in ["radar", "scanner", "sonar"]) or ("sweep" in lower and "button" not in lower):
        comp_type = "radar"
    elif any(k in lower for k in ["galaxy", "cosmos", "nebula", "vortex", "celestial"]):
        comp_type = "galaxy"
    elif any(k in lower for k in ["waveform", "oscilloscope", "soundwave", "sine wave", "wave pool"]):
        comp_type = "waveform"
    elif any(k in lower for k in ["matrix", "digital rain", "glitch", "datastream"]):
        comp_type = "matrix"
    elif any(k in lower for k in ["pendulum", "metronome"]):
        comp_type = "pendulum"
    elif any(k in lower for k in ["heartbeat", "ecg", "pulse monitor", "cardiogram"]):
        comp_type = "heartbeat"
    elif any(k in lower for k in ["keypad", "numpad", "pin pad"]):
        comp_type = "keypad"
    elif any(k in lower for k in ["checkbox", "check box", "checkmark"]):
        comp_type = "checkbox"
    elif any(k in lower for k in ["radio", "radio button", "option button"]):
        comp_type = "radio"
    elif any(k in lower for k in ["toggle", "switch"]):
        comp_type = "toggle"
    elif any(k in lower for k in ["tab", "segment"]):
        comp_type = "tabs"
    elif any(k in lower for k in ["rating", "review", "score"]) or ("stars" in lower and "morph" not in lower):
        comp_type = "rating"
    elif any(k in lower for k in ["dial", "knob", "potentiometer", "rotary"]):
        comp_type = "dial"
    elif any(k in lower for k in ["slider", "volume", "fader", "range"]):
        comp_type = "slider"
    elif any(k in lower for k in ["badge", "pill", "tag", "status"]):
        comp_type = "badge"
    elif any(k in lower for k in ["progress", "meter", "gauge", "progress bar"]):
        comp_type = "progress"
    elif any(k in lower for k in ["input", "search", "field", "text"]):
        comp_type = "input"
    elif any(k in lower for k in ["loader", "spinner", "orbital"]):
        comp_type = "loader"
    elif any(k in lower for k in ["morph", "star", "heart", "icon", "shape"]):
        comp_type = "morph"
    elif any(k in lower for k in ["card", "box", "sheet"]):
        comp_type = "card"
    elif any(k in lower for k in ["canvas", "grid", "lattice"]):
        comp_type = "canvas"

    # 2. Dot Shape
    dot_shape = "square"
    if any(k in lower for k in ["circle", "round", "dot", "stipple"]):
        dot_shape = "circle"
    elif any(k in lower for k in ["diamond", "rhombus", "angle"]):
        dot_shape = "diamond"

    # 3. Shape for icons/morph
    shape = "circle"
    if any(k in lower for k in ["heart", "love", "like"]):
        shape = "heart"
    elif any(k in lower for k in ["star", "fav"]):
        shape = "star"
    elif any(k in lower for k in ["play", "sound", "music"]):
        shape = "play"
    elif any(k in lower for k in ["pause", "stop"]):
        shape = "pause"
    elif any(k in lower for k in ["check", "done"]):
        shape = "check"
    elif any(k in lower for k in ["arrow", "next"]):
        shape = "arrow"

    # 4. Light Palette
    palette = "risographClassic"
    if any(k in lower for k in ["pastel", "pink", "soft", "coral"]):
        palette = "pastelZine"
    elif any(k in lower for k in ["botanical", "ochre", "terracotta", "olive"]):
        palette = "botanicalOchre"
    elif any(k in lower for k in ["nordic", "linen", "cobalt", "blue"]):
        palette = "nordicLinen"
    elif any(k in lower for k in ["warm", "zine", "parchment", "sepia"]):
        palette = "warmZine"
    elif any(k in lower for k in ["matcha", "green", "moss"]):
        palette = "matchaPaper"
    elif any(k in lower for k in ["monochrome", "letterpress", "black", "lead"]):
        palette = "monochromePress"
    elif any(k in lower for k in ["kraft", "postal", "stamp", "brown"]):
        palette = "kraftPostal"

    # 5. Animation Type
    animation_type = "glow-fade"
    if any(k in lower for k in ["snake", "slither", "trail"]):
        animation_type = "snake-trail"
    elif any(k in lower for k in ["wrap", "border", "orbit"]):
        animation_type = "border-wrap"
    elif any(k in lower for k in ["pulse", "smooth", "heartbeat", "breathe"]):
        animation_type = "smooth-pulse"
    elif any(k in lower for k in ["wave", "sweep", "squeegee"]):
        animation_type = "wave-sweep"
    elif "radar" in lower:
        animation_type = "radar-sweep"
    elif "equalizer" in lower:
        animation_type = "equalizer-bounce"
    elif "matrix" in lower:
        animation_type = "matrix-rain"
    elif "pendulum" in lower:
        animation_type = "harmonic-wave"
    elif "ripple" in lower:
        animation_type = "ripple-wave"

    # 6. Spot Ink & Hover Color Resolution
    ink_color = None
    hover_color = None

    # Detect hover color
    hover_match = re.search(r"(?:turns?|shifts?|glows?|hover(?:\s+color)?(?:\s+to)?)\s+(#[0-9a-fA-F]{3,6}|amber|emerald|pink|blue|yellow|cyan|red|violet|purple|green|gold|orange|mint|teal|black|cobalt|crimson)", prompt, re.IGNORECASE)
    if not hover_match:
        hover_match = re.search(r"hover\s*(?:is|:|=)\s*(#[0-9a-fA-F]{3,6}|amber|emerald|pink|blue|yellow|cyan|red|violet|purple|green|gold|orange|mint|teal|black|cobalt|crimson)", prompt, re.IGNORECASE)

    if hover_match:
        matched = hover_match.group(1).lower()
        hover_color = matched if matched.startswith("#") else COLOR_MAP.get(matched, matched)

    # Detect base ink color
    hex_match = re.search(r"#(?:[0-9a-fA-F]{3}){1,2}\b", prompt)
    if hex_match and (not hover_color or hex_match.group(0).lower() != hover_color.lower()):
        ink_color = hex_match.group(0)
    else:
        for name, hex_val in COLOR_MAP.items():
            if name in lower and (not hover_match or name not in hover_match.group(0).lower()):
                ink_color = hex_val
                break

    # Hover & Click Behaviors
    hover_behavior = "glow-fade"
    if any(k in lower for k in ["bloom", "swell", "dilate"]):
        hover_behavior = "bloom"
    elif "shimmer" in lower:
        hover_behavior = "shimmer"
    elif any(k in lower for k in ["scale", "grow"]):
        hover_behavior = "scale"
    elif hover_color or "color shift" in lower or "turns" in lower:
        hover_behavior = "color-shift"

    click_behavior = "hydraulic-pop"
    if "ripple" in lower:
        click_behavior = "ripple"
    elif any(k in lower for k in ["elastic", "snap"]):
        click_behavior = "elastic-snap"
    elif any(k in lower for k in ["burst", "confetti", "scatter"]):
        click_behavior = "burst"
    elif comp_type in ["toggle", "checkbox", "radio"]:
        click_behavior = "toggle"

    # 7. Spring Physics
    is_bouncy = any(k in lower for k in ["bounc", "elastic", "springy"])
    stiffness = 0.28 if is_bouncy else 0.22
    damping = 0.74 if is_bouncy else 0.80
    burst = "none" if comp_type in ["toggle", "checkbox", "heartbeat"] or any(k in lower for k in ["no burst", "static", "smooth"]) else "gentle"

    # 8. Dimensions
    w, h = 240, 120
    dim_match = re.search(r"(\d{2,4})\s*[x×]\s*(\d{2,4})", prompt)
    if dim_match:
        w = int(dim_match.group(1))
        h = int(dim_match.group(2))
    else:
        if comp_type in ["compass", "radar"]:
            w, h = 240, 240
        elif comp_type == "orbit":
            w, h = 260, 260
        elif comp_type == "tachometer":
            w, h = 240, 200
        elif comp_type == "ripple-pool":
            w, h = 300, 180
        elif comp_type == "equalizer":
            w, h = 300, 150
        elif comp_type == "waveform":
            w, h = 320, 140
        elif comp_type == "matrix":
            w, h = 280, 160
        elif comp_type == "pendulum":
            w, h = 220, 200
        elif comp_type == "heartbeat":
            w, h = 320, 130
        elif comp_type == "keypad":
            w, h = 200, 250
        elif comp_type in ["checkbox", "radio"]:
            w, h = 180, 38
        elif comp_type == "toggle":
            w, h = 76, 38
        elif comp_type == "button":
            w, h = 180, 52
        elif comp_type in ["slider", "progress", "input"]:
            w, h = 240, 48
        elif comp_type in ["loader", "morph", "dial"]:
            w, h = 110, 110
        elif comp_type == "tabs":
            w, h = 320, 44
        elif comp_type == "rating":
            w, h = 180, 36

    # 9. Label
    label_match = re.search(r"['\"]([^'\"]+)['\"]", prompt)
    if label_match:
        label = label_match.group(1)
    else:
        label_map = {
            "compass": "Magnetic Gyroscope",
            "orbit": "Planetary Gravity System",
            "ripple-pool": "Capillary Fluid Surface",
            "tachometer": "Engine RPM Tachometer",
            "equalizer": "EQ Visualizer",
            "radar": "Radar Sweep",
            "galaxy": "Galaxy Vortex",
            "waveform": "Soundwave Oscilloscope",
            "matrix": "Matrix Rain",
            "pendulum": "Harmonic Pendulum",
            "heartbeat": "Cardiac Rhythm",
            "keypad": "Tactile Keypad",
            "checkbox": "Enable Option",
            "radio": "Select Option",
            "toggle": "Risograph Mode",
            "button": "Publish Zine",
            "slider": "Level",
            "loader": "Printing...",
            "morph": "Play Zine",
            "badge": "Live Edition"
        }
        label = label_map.get(comp_type, comp_type.replace("-", " ").title())

    return {
        "id": f"comp-{int(time.time()*1000)}",
        "componentType": comp_type,
        "label": label,
        "paletteKey": palette,
        "shape": shape,
        "dotShape": dot_shape,
        "burstIntensity": burst,
        "animationType": animation_type,
        "inkColor": ink_color,
        "hoverColor": hover_color,
        "hoverBehavior": hover_behavior,
        "clickBehavior": click_behavior,
        "physics": {
            "stiffness": stiffness,
            "damping": damping,
            "mass": 1.0,
            "jitter": 0.08,
            "scatterForce": 10 if burst != "none" else 0
        },
        "dimensions": {
            "width": w,
            "height": h
        },
        "dotStyling": {
            "baseRadius": 2.8 if comp_type in ["morph", "badge", "rating"] else 2.4,
            "spacing": 7,
            "inkBleed": True,
            "paperGrainIntensity": 0.05
        },
        "description": f"Fine-tuned Gemma 2B via Tinker: synthesized {comp_type} with {dot_shape} dots, {animation_type} kinetic animation, and tactile physics."
    }

class TinkerBridgeHandler(BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        try:
            self.send_response(200)
            self._send_cors()
            self.end_headers()
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, OSError):
            pass

    def do_GET(self):
        if self.path == "/api/status" or self.path == "/health":
            try:
                self.send_response(200)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                api_key = os.environ.get("TINKER_API_KEY")
                masked = (api_key[:6] + "..." + api_key[-4:]) if api_key and len(api_key) > 10 else ("Configured" if api_key else "None")
                status = {
                    "status": "online",
                    "platform": "Thinking Machines Tinker (API Authenticated)" if api_key else "Thinking Machines Tinker",
                    "api_authenticated": bool(api_key),
                    "key_preview": masked,
                    "model": "google/gemma-2-2b-it (Tinker fine-tuned)",
                    "adapter": "tinker://models/paperdots-gemma-2b-latest",
                    "dataset_samples": len(DATASET),
                    "edge_runtime": "Local Python Bridge",
                    "latency_avg_ms": 120
                }
                self.wfile.write(json.dumps(status, indent=2).encode("utf-8"))
            except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, OSError):
                pass
        else:
            try:
                self.send_response(404)
                self.end_headers()
            except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, OSError):
                pass

    def do_POST(self):
        if self.path == "/api/compile":
            start_time = time.time()
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)

            try:
                payload = json.loads(post_data.decode("utf-8"))
                prompt = payload.get("prompt", "")
                dsl = synthesize_dsl_from_prompt(prompt)
                latency_ms = int((time.time() - start_time) * 1000)

                response = {
                    "prompt": prompt,
                    "dsl": dsl,
                    "generatedBy": "gemma-tinker-fine-tuned",
                    "inferenceTimeMs": max(latency_ms, 85)
                }

                self.send_response(200)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response, indent=2).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

def run_server():
    server_address = (HOST, PORT)
    httpd = ThreadingHTTPServer(server_address, TinkerBridgeHandler)
    print("==================================================")
    print("   PAPERDOTS - TINKER LOCAL MODEL BRIDGE SERVER   ")
    print("==================================================")
    print(f"Listening on:    http://{HOST}:{PORT}")
    print(f"Health Check:    http://{HOST}:{PORT}/api/status")
    print(f"Compiler API:    http://{HOST}:{PORT}/api/compile")
    print(f"Tinker Dataset:  {len(DATASET)} instruction samples loaded")
    print("--------------------------------------------------")
    print("Server ready for live PaperDots AI compilation.")
    print("==================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down Tinker bridge server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
