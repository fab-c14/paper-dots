# Contributing to PaperDots UI 🎨

Thank you for your interest in contributing to **PaperDots UI (`PaperDots.js`)**!

PaperDots UI was born out of a Hacktoberfest 2026 challenge (*"Build for a Friend"*) for Julian, a risograph printmaker and indie zine creator who dreamed of a tactile web interface made of living ink on paper instead of sterile corporate SaaS boxes.

We are 100% open-source, and **contributions from everyone are warmly welcome!** Whether you want to add a new tactile component, write a new physical kinetic archetype, contribute Risograph ink palettes, improve the open AI compiler, or fix a typo, your help makes PaperDots better.

---

## 🌟 Ways You Can Contribute

1. **New Kinetic Archetypes & Shaders**:
   - Invent tactile canvas physics behaviors (e.g. sand ripple, letterpress emboss, magnetic fluid, pendulum).
   - Implement them in `showcase/src/paperdots/components/PaperDotUniversal.tsx`.
2. **New Risograph Spot Inks & Paper Palettes**:
   - Add authentic printmaker soy/rice bran ink hexes to `SPOT_INKS` or new paper textures to `PALETTES`.
3. **AI Compiler Prompts & Tinker Dataset**:
   - Contribute new natural language prompt-to-DSL pairs in `tinker/paperdots_tinker_train.jsonl` or `tinker/generate_dataset.py`.
4. **Shadcn Registry Components**:
   - Expand our Shadcn-compatible component registry schemas in `showcase/public/r/`.
5. **Documentation & Examples**:
   - Improve guides, add interactive zine demos, or share your own PaperDots creations.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **npm** or **pnpm**
- **Python**: 3.10+ (for running the local Tinker AI compiler server)

### 1. Clone the Repository
```bash
git clone https://github.com/fab-c14/paper-dots.git
cd paper-dots
```

### 2. Install Frontend Dependencies
```bash
cd showcase
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the interactive showcase and live component suite.

### 3. (Optional) Run the AI Compiler Backend
```bash
# In a separate terminal from repository root
cd tinker
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
python serve.py
```
The local Tinker inference bridge runs on `http://127.0.0.1:8000`.

---

## 🔒 Security & Environment Variables

- **Never commit `.env` or sensitive API keys**.
- The repository `.gitignore` is pre-configured to strictly ignore `.env`, `.env.*`, and API tokens.
- An example environment file is provided at `tinker/.env.example`.
- If you notice any exposed credentials or security vulnerabilities, please open an issue or report it privately.

---

## 📋 Git Workflow & Pull Requests

1. **Fork the repository** on GitHub.
2. **Create a topic branch**:
   ```bash
   git checkout -b feat/my-new-kinetic-archetype
   ```
3. **Make your changes**:
   - Follow existing code conventions (TypeScript, Tailwind CSS, lightweight HTML5 Canvas physics).
   - Ensure the light tactile aesthetic is preserved: **zero dark SaaS themes** — keep everything textured, tactile, and paper-inspired!
4. **Test your build**:
   ```bash
   cd showcase
   npm run build
   ```
   Ensure TypeScript type-checking passes without errors.
5. **Commit with descriptive messages**:
   ```bash
   git commit -m "feat(components): add letterpress embossing kinetic archetype"
   ```
6. **Push to your fork and submit a Pull Request**:
   - Describe what problem your PR solves or what feature it introduces.
   - Attach a screenshot or GIF if you added visual or kinetic behaviors!

---

## 🤝 Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all contributors, regardless of experience level, gender identity, background, or identity. Please be respectful, constructive, and kind.

---

## 💬 Questions & Community

- Open an **Issue** on GitHub for bug reports or feature requests.
- Start a **Discussion** on DEV or GitHub to talk about risograph printmaking, generative physics, or open-source AI.

*Happy Hacktoberfest & happy creating!* 🎃✨
