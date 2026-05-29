# Alpenglow for Dummies 🏔️✨

Master the Solana Alpenglow consensus protocol through step-by-step interactive lessons, intuitive ELI5 analogies, animated vector simulators, and a live consensus sandbox. Designed for developers, researchers, and anyone eager to understand high-performance blockchain architectures.

---

## 🚀 Key Features

*   **📚 13 Concept-First Learning Modules**: Breaks down math proofs, data structures, and liveness properties with real-world analogies (e.g., telephone tree relays, online chess tournaments, pizza-ordering paths).
*   **💡 ELI5 & Metaphor Explanations**: Complex math and engineering (Reed-Solomon coding, BLS signature aggregation, Byzantine fault tolerance, slot execution) explained in plain, accessible English.
*   **📊 Sleek Glassmorphic Vector Diagrams**: Interactive SVG diagrams aligned with the Solana & Anchor brand palette, featuring glowing visual paths, transparent layers, and responsive vector connector paths.
*   **⚙️ 5 Interactive Simulators**:
    *   *Rotor Dissemination*: Visualize how block fragments spread across stake-weighted relays.
    *   *Votor voting*: Track Fast Path (voice vote) vs. Slow Path (secret ballot) consensus routes.
    *   *PS-P Sampling*: Watch stratified sampling suppress adversaries in real-time.
    *   *Dynamic Timeouts*: Learn how validator timeouts scale to prevent halts.
    *   *Megaphone Outage Recovery*: Simulates standstill detection, equivocation proof flooding, and slot skips.
*   **⚡ Consensus Sandbox**: Customize slots, validator stake weights, latencies, and packet drops to simulate liveness and safety splits.

---

## 🛠️ Tech Stack

*   **Core**: React 19 (TypeScript) & Vite
*   **Styling**: Tailwind CSS v4
*   **Icons**: Lucide React
*   **Components**: Custom Radix UI & Shadcn components

---

## 📦 Getting Started

### Prerequisites

Make sure you have Node.js (v18 or higher) and npm installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/spellsaif/alpenglow-for-dummies.git
   cd alpenglow-for-dummies
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173` (or the terminal-provided URL).

### Building for Production

To compile and bundle the application for production:
```bash
npm run build
```
The static production assets will be generated in the `dist` directory.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
