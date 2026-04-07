# REPOGRAPH :: Surgical Codebase Mapping Engine

![RepoGraph Banner](https://img.shields.io/badge/UI-Cyberpunk%20Brutalist-black?style=for-the-badge&logo=react&logoColor=primary)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20Vite%20%7C%20Tailwind-blue?style=for-the-badge)

**REPOGRAPH** is a state-of-the-art codebase visualization and mapping engine wrapped in a high-tech, **Cyberpunk Brutalist** aesthetic. It analyzes file dependencies, structures, and relationships, turning plain code repositories into interactive, high-contrast dependency graphs.

Whether you are mapping a massive public GitHub repository or running a 100% secure local ecosystem ingestion, RepoGraph plots complex architectures instantly.

---

## ⚡ Features

- **🌐 Remote Payload Sync:** Pull the architecture of any public GitHub repository directly into the application and visualize its dependencies.
- **📂 Local System Ingestion:** Drag and drop your local project directory for a structural map. Fully client-side processing with **zero data egress** (100% Secure).
- **🕸️ Interactive Dependency Graph:** A deeply interconnected visualization of codebase dependencies, powered by interactive force-directed mapping.
- **👁️ Surgical Code View:** Instantly dive into any node and investigate the underlying raw code using the built-in syntax-highlighted inspector.
- **🌗 Tactical Illumination:** Switch between Light Mode and deep Obsidian Dark Mode interfaces to suit your hacking environment.
- **🛡️ Cyberpunk Brutalist UI:** Built with sharp edges, neon primary accents, glassmorphic overlays, and precise typography.

---

## 🚀 Quickstart Protocol

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/abir2afridi/GithubRepositoryGraph.git
   cd GithubRepositoryGraph
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Initialize Local Server:**

   ```bash
   npm run dev
   ```

4. **Access UI Interface:**
   Open [http://localhost:5173](http://localhost:5173) in your secure browser.

---

## 🎛️ Usage Guide

1. **GitHub Ingestion:** On the main screen, paste the URL of any public GitHub project (`e.g., facebook/react`) to map its structure.
2. **Local Folder Drop:** Click or drag-and-drop a local folder into the provided dropzone. This skips API limits and ensures code privacy.
3. **Graph Tools:**
   - Use the **Intelligence Panel** to filter nodes or search for specific files.
   - Right-click anywhere or click specific nodes for a context menu navigation.
   - Double click a node to open the **Target Node: Code Inspector** and inspect the raw file contents.
4. **Theme Toggling:** Hit the moon/sun icon on the top right to switch between `dark` and `light` execution modes.

---

## 💻 Tech Stack

- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (configured with dark/light mode CSS variables and brutalist utility classes)
- **State Management:** Zustand
- **Icons:** Lucide React

---

## 🔒 Security Statement

When utilizing **Local System Ingestion**, all processing occurs directly in the browser's Document Object Model. No internal code files are uploaded, transmitted, or saved to any external databases.

---

_`"Mapping the architecture of tomorrow, today."`_ — REPOGRAPH ENGINE V3
