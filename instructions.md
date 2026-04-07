Build a full-featured, production-ready web application called "RepoGraph"
— a Code Dependency Visualizer & Repository Explorer.
NO login, NO real database. 100% browser-based.
Quality bar: Figma + Linear + Vercel + GitHub combined.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 1 — INPUT MODES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODE A — GITHUB URL

- Paste any public GitHub repo URL
- Auto-extract: owner, repo, branch, subfolder
- Supported formats:
      ✅ <https://github.com/owner/repo>
      ✅ <https://github.com/owner/repo/tree/branch>
      ✅ <https://github.com/owner/repo/tree/branch/subfolder>
- If branch missing → try "main" then "master" then ask user
- Fetch file tree: GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1
- Fetch file content lazily (only when opened in code view)
- Fetch repo metadata: GET /repos/{owner}/{repo}
- After URL pasted → repo link + owner appear in HEADER immediately
- BRANCH SELECTOR dropdown in header: switch branches without
    re-entering URL. List branches from GET /repos/{owner}/{repo}/branches
- TAG / RELEASE selector: view repo at a specific tag/release
    from GET /repos/{owner}/{repo}/tags
- MONOREPO DETECTION: if package.json has "workspaces" field
    or repo has multiple package.json files → detect sub-packages
    and show them as grouped cluster nodes in graph
- SUBMODULE SUPPORT: detect .gitmodules, show submodules as
    special external cluster nodes with link to their repo

MODE B — LOCAL FOLDER UPLOAD (100% offline)

- Drag & drop OR browse folder
- <input webkitdirectory> + FileReader API
- Zero server, zero internet needed
- Real-time progress: "Reading file 47 of 312..."
- Auto-skip binary files in parsing but still list in sidebar
- Large folder warning (500+ files) with progress bar
- FILE SYSTEM ACCESS API (if browser supports it):
    watch for file changes → auto-refresh graph when file saved
    Show "🔄 File changed: Button.tsx — click to refresh" toast
- Multi-select files/folders to load only part of project

MODE C — PASTE CODE SNIPPET (bonus)

- Small code editor input where user can paste a snippet
- Parse imports from just that snippet
- Show a mini-graph of what it would connect to
- Good for quick one-off checks

RECENTLY LOADED (localStorage, no DB):

- Last 10 repos/folders shown on landing page
- Click to re-load instantly
- Each entry shows: owner/repo, language badges, file count,
    last loaded date, [Remove] button
- "Clear history" option

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 2 — URL VALIDATION & ERROR HANDLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Validate instantly on paste (before fetch):
  ❌ Not GitHub URL → "Please paste a GitHub repository URL"
  ❌ Single file URL → "That's a file link. Use repo root URL."
  ❌ Gist → "Gists not supported. Use a repository URL."
  ❌ PR/Issue URL → "That's a PR/issue link, not a repo."

After fetch errors:
  ❌ 403 Private repo →
     ⚠️ LARGE AMBER WARNING CARD:
     "This repository is private.
      RepoGraph only supports public repositories.
      • Make repo public on GitHub Settings, then retry
      • Upload your project folder directly (offline)
      • Use a different public repo URL"
     [Try Folder Upload →] quick action button inside card

  ❌ 404 Not found → "Repository not found. Check the URL."
  ❌ Rate limit (60 req/hr unauthenticated) →
     "GitHub rate limit reached.
      Resets in: [MM:SS live countdown timer]
      Or use folder upload — no limit."
  ❌ Empty repo → "No files found. Check branch name."
  ❌ Network offline →
     "No internet. Folder upload works fully offline ↓"
  ❌ File > 1MB → "File too large to preview (X MB)"
  ❌ Binary file → "Binary file — no preview available"
     Show: name, size, type, path as info card instead
  ❌ Gitignore collision →
     Warning badge on import line: "Target is in .gitignore"
  ❌ Circular dependency → Red edge highlight + sidebar warning
  ❌ Submodule file → "File lives in a Git submodule" with link

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 3 — DEPENDENCY PARSING ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run ALL parsing in a Web Worker. UI never freezes.

Languages & patterns:

JavaScript / TypeScript / React / Vue / Svelte:
  import X from './file'
  import { X, Y } from '../utils'
  import type { T } from './types'
  require('./something')
  import('./lazy')
  export { X } from './re-export'

HTML:
  <link href="style.css">
  <script src="app.js">
  <img src="./image.png">
  <a href="./page.html">

CSS / SCSS / LESS / Sass:
  @import './variables'
  @use './mixins'
  @forward './helpers'

Python:
  from utils import helper  (local only, skip stdlib)
  import localmodule

PHP:
  require_once './file.php'
  include './template.php'

Go:
  import "./localpackage"

Rust:
  mod localmodule;
  use crate::module;

For every dependency record:

- Source file + line number
- Target file (resolved relative path)
- Import type: named | default | namespace | side-effect | dynamic
- Exactly what is imported: e.g. { useState, useEffect }
- Where it's used: which lines in source file use the import
- Resolved? (target exists) | External? | Unresolved?

SPECIAL FILE PARSING (beyond imports):
  package.json →
    Read name, version, description, scripts, dependencies,
    devDependencies, peerDependencies
  requirements.txt → list all Python packages
  .env / .env.example →
    List all environment variable keys (NOT values — privacy)
    Show in sidebar: "ENV Variables: X declared"
  tsconfig.json →
    Read path aliases (@/ → src/) and apply to import resolution
    so aliased imports resolve correctly in graph
  README.md →
    Render as formatted markdown in a dedicated panel
  Dockerfile → parse FROM, COPY, ADD, EXPOSE
  .github/workflows/*.yml → detect CI/CD pipelines, list them

SPECIAL DETECTIONS:
  🔴 Circular dependency: A → B → C → A
     Detect with DFS, highlight entire cycle in red
  ⚫ Orphan/Dead files: files with 0 imports AND 0 used-by
     (not entry points) — shown grayed out with "⚫ Orphan" badge
  ⚠️ Duplicate detection: files with identical content
     (compare hash) → badge "⚠️ Duplicate of X"
  📝 TODO/FIXME extraction: scan all files for TODO, FIXME,
     HACK, NOTE, XXX comments → list in sidebar "Code Notes" section
  🧪 Test file detection: files matching *.test.*, *.spec.*,
     __tests__/** → marked with 🧪 badge, separate group in sidebar
  ⚙️ Config file detection: webpack.config, vite.config,
     tailwind.config, etc. → marked with ⚙️ badge
  📏 Complexity scoring: count branches (if/else/switch/ternary/loop)
     per file → assign complexity score Low/Medium/High/Critical
     Color node border by complexity:
     Low=green, Medium=yellow, High=orange, Critical=red

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 4 — HEADER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Height: ~52px, sticky, always visible.

LEFT:
  [RepoGraph logo + wordmark]

CENTER (when repo loaded):
  [owner-avatar 24px] [owner / repo-name] [↗ GitHub link]
  Badges: ⭐ 1.2k  🍴 234  👁️ 89  🐛 12 issues
  [branch-selector dropdown] [tag-selector dropdown]
  Pasted URL shown as subtle chip: "github.com/owner/repo"

RIGHT:
  [🔍 Search]  [⬇ Download]  [📤 Export]  [🖥️ Present]
  [🌙/☀️ theme]  [⌨️ shortcuts]

If local folder:
  [📁 folder-name] [branch/tag selectors hidden]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 5 — LEFT SIDEBAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Resizable width (drag divider). Collapsible.
Scrollable. Has multiple collapsible sections with headers.

──────────────────────────────
 5A. REPO SUMMARY CARD
──────────────────────────────
  Owner avatar (large) + username (clickable)
  Repo full name (bold, large)
  Description text
  Homepage URL (if set)
  Topics as colored badge pills
  [⭐ Star on GitHub] button (opens github.com)
  Stats row: Stars | Forks | Watchers | Issues | Size
  License | Created date | Last updated
  [View on GitHub ↗]  [Open Repo Info Page]
  (GitHub mode only)

──────────────────────────────
 5B. PROJECT STATISTICS
──────────────────────────────
  Total files: X
  Total folders: X
  Total lines of code: X
  Total dependencies: X
  Entry points: X (click to list them)
  Unresolved imports: X (red if > 0)
  Circular dependencies: X (red if > 0)
  External packages used: X
  Orphan/dead files: X (amber if > 0)
  Test files: X
  Config files: X
  TODO comments: X  FIXME: X

──────────────────────────────
 5C. LANGUAGE BREAKDOWN
──────────────────────────────
  Horizontal stacked color bar
  Table:
  ┌─────────────┬───────┬──────┬─────────┐
  │ Language    │ Files │ Lines│   %     │
  ├─────────────┼───────┼──────┼─────────┤
  │ 🟡 JS       │  12   │ 840  │ 40.0%   │
  │ 🔵 TS       │   8   │ 620  │ 26.7%   │
  │ 🟠 HTML     │   5   │ 310  │ 16.7%   │
  │ 🔵 CSS      │   5   │ 240  │ 16.7%   │
  └─────────────┴───────┴──────┴─────────┘

──────────────────────────────
 5D. FILE TYPE BREAKDOWN
──────────────────────────────
  ┌──────────┬───────┬──────────┐
  │ Ext.     │ Count │ Total KB │
  ├──────────┼───────┼──────────┤
  │ .tsx     │  10   │  48 KB   │
  │ .ts      │   8   │  32 KB   │
  │ .css     │   5   │  12 KB   │
  │ .json    │   2   │   4 KB   │
  └──────────┴───────┴──────────┘

──────────────────────────────
 5E. FOLDER STRUCTURE TREE
──────────────────────────────
  Full VS Code-style collapsible tree:
  📁 src/              (14 files)
    📁 components/     (6 files)
      📄 #3 Button.tsx     2.1 KB
      📄 #4 Modal.tsx      3.4 KB
    📁 utils/          (3 files)
      📄 #5 helpers.ts     1.2 KB
    📄 #1 main.tsx         0.8 KB ⚡
    📄 #2 App.tsx          4.2 KB
  📁 public/           (2 files)
    📄 index.html          1.1 KB ⚡
  📄 package.json          0.6 KB ⚙️
  📄 .gitignore            0.2 KB
  📄 README.md             3.1 KB

- Each file has: icon | #number | name | size | badges
- Badges: ⚡ entry | 🧪 test | ⚙️ config | ⚫ orphan
    ⚠️ circular | 📝 has TODOs | ⚠️ duplicate
- Click file → open in code view
- Click folder → collapse/expand
- Right-click file → context menu:
      Open in Code View
      Locate in Graph (pan to node)
      Copy Path
      Copy Full URL
      Download as ZIP
      Show all that import this
      Show all this imports
- Folder shows badge count of files inside
- Sort options: Name A-Z | Name Z-A | Size ↑↓
    | Most imports | Most used | Alphabetical

──────────────────────────────
 5F. GITIGNORE VIEWER
──────────────────────────────
  Title: "📄 .gitignore — X patterns"
  ┌──────────────────┬───────────────────────────────┐
  │ Pattern          │ What it ignores               │
  ├──────────────────┼───────────────────────────────┤
  │ node_modules/    │ npm dependency folder          │
  │ .env             │ Environment secrets            │
  │ dist/            │ Production build output        │
  │ .DS_Store        │ macOS system metadata file     │
  │ *.log            │ All log files (any name)       │
  │ coverage/        │ Test coverage reports          │
  └──────────────────┴───────────────────────────────┘
  Total count: "X files/patterns ignored"
  Note shown: "These exist locally but are not in the repo"
  Warning if any import in code points to gitignored path

──────────────────────────────
 5G. ENTRY POINTS
──────────────────────────────
  ⚡ index.html           (HTML root)
  ⚡ src/main.tsx         (React root)
  Click any → pan graph to node + open code view

──────────────────────────────
 5H. EXTERNAL PACKAGES
──────────────────────────────
  Tabs: [dependencies] [devDependencies] [peerDependencies]
  ┌────────────────┬──────────┬──────────┬───────────┐
  │ Package        │ Version  │ Used in  │ Category  │
  ├────────────────┼──────────┼──────────┼───────────┤
  │ react          │ ^18.2.0  │ 8 files  │ UI        │
  │ react-flow     │ ^11.0.0  │ 2 files  │ Graph     │
  │ zustand        │ ^4.0.0   │ 3 files  │ State     │
  └────────────────┴──────────┴──────────┴───────────┘
  Click package name → open npmjs.com in new tab

──────────────────────────────
 5I. PACKAGE.JSON SCRIPTS
──────────────────────────────
  If package.json found, list all scripts:
  ┌────────────┬──────────────────────────────┐
  │ Script     │ Command                      │
  ├────────────┼──────────────────────────────┤
  │ dev        │ vite                         │
  │ build      │ tsc && vite build            │
  │ preview    │ vite preview                 │
  │ test       │ vitest                       │
  └────────────┴──────────────────────────────┘

──────────────────────────────
 5J. ENV VARIABLES
──────────────────────────────
  If .env or .env.example found:
  List variable names ONLY (never values — privacy):
  ● VITE_API_URL
  ● VITE_SUPABASE_KEY
  ● DATABASE_URL
  Note: "Values hidden for security"

──────────────────────────────
 5K. TODO / FIXME NOTES
──────────────────────────────
  All TODO/FIXME/HACK/NOTE comments across all files:
  ┌──────────────────────────────────────────────────────┐
  │ 📝 TODO   utils/helpers.ts:14   "Refactor this"      │
  │ 🔴 FIXME  App.tsx:89            "Memory leak here"   │
  │ ⚠️ HACK   api/client.ts:33      "Temp workaround"    │
  └──────────────────────────────────────────────────────┘
  Click any → open that file in code view at that line

──────────────────────────────
 5L. COMPLEXITY REPORT
──────────────────────────────
  Files ranked by complexity score:
  🔴 Critical  src/api/client.ts       score: 94
  🟠 High      src/utils/parser.ts     score: 71
  🟡 Medium    src/App.tsx             score: 45
  🟢 Low       src/Button.tsx          score: 12
  Click any → open code view + highlight complex lines

──────────────────────────────
 5M. README VIEWER
──────────────────────────────
  If README.md found: render it as formatted markdown
  (headers, bold, code blocks, lists, links)
  Inline in sidebar or opens as full panel
  [View Full README] button → full-page markdown viewer

──────────────────────────────
 5N. CI/CD PIPELINES
──────────────────────────────
  If .github/workflows/ found:
  List workflow files with names and trigger events:
  ⚙️ ci.yml — triggers: push, pull_request
  ⚙️ deploy.yml — triggers: push to main
  Click any → open file in code view

──────────────────────────────
 5O. CIRCULAR DEPENDENCIES
──────────────────────────────
  ⚠️ 2 circular dependencies found:
  🔴 App.tsx → utils.ts → App.tsx
  🔴 hooks/useData.ts → api.ts → hooks/useData.ts
  Click any → graph highlights the cycle in red,
  pans to show it centered

──────────────────────────────
 5P. ORPHAN / DEAD FILES
──────────────────────────────
  ⚫ 3 files have no connections:
  ⚫ src/oldComponent.tsx  (never imported, imports nothing)
  ⚫ utils/deprecated.ts
  Click any → pan to node in graph + open code view

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 6 — MAIN GRAPH VIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Engine: React Flow (reactflow.dev)
Custom node components. Custom edge components.

FILE NODES show:

- File type icon (colored inline SVG per extension):
      .html/.htm   → 🟠 orange globe
      .css         → 🔵 blue paint bucket
      .scss/.sass  → 🩷 pink Sass diamond
      .less        → 🔵 dark blue Less icon
      .js          → 🟡 yellow "JS" badge
      .mjs/.cjs    → 🟡 yellow JS (module variant)
      .ts          → 🔵 blue "TS" badge
      .jsx         → 🩵 cyan ⚛ React
      .tsx         → 🩵 cyan ⚛ + "TSX"
      .vue         → 🟢 green Vue ▲
      .svelte      → 🟠 orange Svelte
      .py          → 🟢 green snake 🐍
      .php         → 🟣 indigo "PHP"
      .go          → 🩵 cyan gopher
      .rs          → 🟠 orange ⚙️ Rust
      .json        → ⚪ gray { }
      .yaml/.yml   → ⚪ gray YAML
      .toml        → ⚪ gray TOML
      .md          → ⚪ white document 📄
      .env         → 🟡 yellow 🔑 key
      .png/.jpg    → 🟣 purple 🖼️
      .svg         → 🟣 purple vector icon
      .mp4/.webm   → 🔵 blue 🎬
      .lock        → 🔒 gray lock (no parse)
      .sh/.bash    → 🟢 green terminal $
      .dockerfile  → 🔵 blue 🐳 Docker whale
      .gitignore   → ⚪ gray git icon
      package.json → 🟢 green 📦 npm

- File name (bold)
- Folder path (small, dimmed): src/components/
- #3 chain number badge (order from root)
- File size badge
- ⚡ entry badge | 🧪 test | ⚙️ config | ⚫ orphan
- ↓2 imports badge (how many this imports)
- ↑1 used-by badge (how many import this)
- Complexity border color:
      🟢 Low | 🟡 Medium | 🟠 High | 🔴 Critical

  NODE HOVER (tooltip popup on hover):
    First 5 lines of code as preview (syntax highlighted)
    File size | Line count | Last modified (if available)
    ↓ imports X files: [list filenames]
    ↑ used by X files: [list filenames]
    [Double-click to open]

EDGE TYPES (colored by relationship):
  import/require → purple
  html link/script → orange
  css @import → blue
  dynamic import → purple dashed
  re-export → purple dotted
  unknown → gray

GRAPH INTERACTIONS:
  Drag node → connections never break
  Scroll → zoom
  Click canvas + drag → pan
  Single click node → select, highlight connections,
    dim unrelated to 30%
  Double-click node → open CODE VIEW
  Right-click node → context menu:
    Open in Code View
    Locate in File Tree (sidebar highlights)
    Focus: show only this node's chain
    Highlight Dependencies
    Highlight Dependents
    Show full chain from root (#1 → ... → this)
    Pin/Unpin node (pinned nodes don't move on auto-layout)
    Copy Path | Copy Full URL
    Download this file as ZIP
    Collapse to folder group

  Mini-map: bottom-right, clickable to pan graph
  Fit to screen button
  Auto-layout button (re-arrange)
  Ctrl+Z / Ctrl+Y: undo/redo node movements

COLOR BY MODE (dropdown in toolbar):
  🎨 Color by: File Type (default)
  🎨 Color by: Folder (all files in same folder = same hue)
  🎨 Color by: Dependency Depth (deeper = darker)
  🎨 Color by: Connection Count (more connections = brighter)
  🎨 Color by: Complexity Score (green → red)
  🎨 Color by: File Size (small=light, large=bright)

FILTER BAR (above graph):
  Filter nodes by:
  [All] [JS/TS] [CSS] [HTML] [Config] [Tests] [Orphans]
  [Has TODOs] [Circular] [Entry Points] [External]
  Unselected file types get dimmed but not removed

DEPTH FILTER slider:
  "Show dependencies up to N levels deep from entry point"
  Slider: 1 → 2 → 3 → All
  Nodes beyond selected depth fade out

FOLDER GROUPING MODE (toggle):
  Group files by folder as collapsible cluster nodes
  📁 components/ (6 files) [expand]
  When collapsed: one big node representing the folder
  When expanded: individual file nodes inside a rounded border
  Edges between folders shown as thick grouped edges

NODE SEARCH (Ctrl+F):
  Floating search bar over graph
  Type → matching nodes pulse + highlight in yellow
  If multiple matches: [← 1/3 →] cycle through them
  Camera smoothly pans to each match

BOOKMARKS:
  Right-click node → "Bookmark this file"
  Bookmarked nodes get a ⭐ icon
  Bookmarks panel in sidebar shows all bookmarked files
  Persisted in localStorage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 7 — GRAPH LAYOUT ALGORITHMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STANDARD LAYOUTS:
  Force-directed (default) — organic spread, physics simulation
  Hierarchical top-down — entry at top, deps cascade down as tree
  Hierarchical left-right — entry at left, cascade rightward
  Circular — all nodes on circle, entry at top
  Grid — uniform rows/columns, alphabetical
  Radial — entry at center, rings expand outward by depth

PRESET SHAPE LAYOUTS:
  (arrange all nodes into recognizable visual silhouette)
  (connections always maintained, edges follow nodes)
  (animated transition when switching — nodes glide smoothly)
  (user can still drag nodes after; "Reset Shape" button snaps back)

  🧍 Human Figure
    Nodes form stick-figure / human silhouette
    Entry point = head (top center)
    Main imports = torso/body
    Sub-imports = arms (left/right branches)
    Leaf nodes = hands and feet
    Calculate using parametric human body outline curves
    distributed evenly by connection count

  ✈️ Fighter Jet / Plane
    Nodes form top-down aircraft silhouette
    Entry = nose (front tip)
    Core deps = fuselage (long center body)
    Side branches = swept-back wings
    Deepest deps = tail fins
    Sub-deps = engine nacelles under wings

  🐱 Cat Face / Animal
    Nodes form cat face + body from above
    Entry = nose/center face
    Main deps = cheeks (wide nodes)
    Leaf nodes = whisker tips (radiating outward)
    Two top clusters = ears (triangle shapes)
    Small circular ring = collar

  🌳 Tree with Leaves
    Nodes form natural organic tree silhouette
    Root file = trunk base (bottom center, large node)
    Main modules = thick primary branches (forking upward)
    Sub-modules = secondary branches
    Leaf files (no further imports) = rendered as small
      rounded leaf shapes at branch tips
    Animation: leaves gently sway when hovering
    Crown of tree fills based on number of files

  💎 Diamond / Crystal Lattice
    Nodes in diamond/gem shape arrangement
    Multiple facet rows, entry at top point

  🌀 Golden Spiral
    Nodes arranged in Archimedean/Fibonacci spiral
    Entry at center, wrapping outward

  🔷 Hexagonal Grid
    Nodes in honeycomb hex-grid pattern
    Connected nodes placed in adjacent hexes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 8 — CODE VIEW PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monaco Editor (@monaco-editor/react)
Slides in from right. Resizable. Fullscreen toggle.

SPLIT VIEW MODE:
  Button to split panel into two side-by-side code editors
  Navigate different files in each pane independently
  Useful to compare two related files simultaneously

PANEL HEADER:
  [←] [→] history nav | breadcrumb trail (clickable)
  [Split View] [Fullscreen] [Close ✕] [Download ↓] [Copy path]

FILE INFO BAR:
  #3 | Button.tsx | TypeScript React | 2.4 KB | 47 lines
  📁 src/components/ | Complexity: 🟢 Low (score: 12)

CHAIN POSITION BAR:
  "Chain: main.tsx #1 → App.tsx #2 → Button.tsx #3"
  Each file in chain is clickable → navigate to it
  Visual chain: [#1]──[#2]──[#3◉] (current highlighted)

IMPORT DETAILS TABLE (collapsible):
  "↓ 2 Imports — what this file brings in:"
  ┌───┬────────────────────┬─────────────────────┬────────────────────────────────┐
  │ # │ Imported From      │ What is Imported     │ Used on Lines / Purpose        │
  ├───┼────────────────────┼─────────────────────┼────────────────────────────────┤
  │ 1 │ ./styles.css       │ (side-effect only)   │ Applies component styles       │
  │ 2 │ ../utils/helpers   │ { formatDate,        │ Line 12: format display date   │
  │   │                    │   truncate }         │ Line 18: truncate long strings │
  │   │                    │                      │ Line 24: format again          │
  └───┴────────────────────┴─────────────────────┴────────────────────────────────┘
  Click filename → navigate to that file

  "↑ Used by 1 file — who imports this file:"
  ┌───┬──────────────────────────┬──────────────────────┬────────────────────────┐
  │ # │ File That Imports This   │ What They Import      │ Where (line)          │
  ├───┼──────────────────────────┼──────────────────────┼────────────────────────┤
  │ 1 │ src/App.tsx              │ default as Button     │ Line 5                │
  └───┴──────────────────────────┴──────────────────────┴────────────────────────┘
  Click → navigate to App.tsx, scroll to line 5, highlight import line

LINE-LEVEL DEPENDENCY TRACKING (Monaco decorations):
  Every import line:

- Colored left-gutter dot (color = edge type color)
- Hover → rich inline tooltip:
      ┌──────────────────────────────────────────┐
      │ 🔗 → ../utils/helpers.ts                 │
      │ Imports: { formatDate, truncate }         │
      │ Used on lines: 12, 18, 24                │
      │ [Follow Location →]  [View in Graph ⊙]   │
      └──────────────────────────────────────────┘
- Click [Follow Location →]:
      Open target file
      Scroll to relevant line
      Pulse highlight animation
      Toast: "📍 Button.tsx → helpers.ts"
      Push to nav history

- Click [View in Graph ⊙]:
      Code panel shrinks / graph pans to edge between
      the two nodes and highlights it

  Unresolved imports tooltip:
      "⚠️ Not found in repo — external package or gitignored"

NAVIGATION HISTORY:
  Max 30 items. Back ← Forward → buttons.
  Full breadcrumb: fileA.js → fileB.ts → utils.js
  Clicking any item jumps directly to it

CODE ACTIONS (top-right of code panel):
  [📋 Copy code]  [📋 Copy path]  [⬇ Download file]
  [🔍 Find in code] (Ctrl+F within Monaco)
  [📊 Show in Graph] (pan graph to this node)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 9 — REPO INFO PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dedicated page/route. Link from header or sidebar.

HERO:
  Owner avatar (large) + username (clickable → github.com/owner)
  Repo full name (large, bold)
  Description
  Homepage URL
  Topics as colored badge pills
  [⭐ Star on GitHub ↗] button

STATS GRID (card layout):
  ⭐ Stars  🍴 Forks  👁️ Watchers  🐛 Open Issues
  📦 Size   📅 Created  🔄 Updated  🌿 Branch
  📜 License  🔀 Fork? (if yes → link to parent repo)

LANGUAGE BREAKDOWN:
  Stacked horizontal bar (fetched from /languages API)
  Table: Language | Color | Files | Lines | %

DOWNLOAD SECTION:
  [⬇ Download Full Repo as ZIP] button
  Shows: "~4.2 MB" estimated size
  Clicking → navigates to internal /download page

CONTRIBUTOR INFO (if accessible via API):
  Top contributors list with avatars + commit counts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 10 — UI CUSTOMIZATION PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TAB 1 — CONNECTIONS (Edge Styles):
  Visual style previews (mini animated preview per option):

  Bezier Curve — smooth S-curve [default]
  Straight Line — direct path
  Elbow/Step — right-angle bends

  ⛓️ Chain Links — actual interlocking chain link SVG
    drawn along path. Each link is a rounded rectangle
    with two semicircle ends. Links connect to each other.
    Slowly animate (gentle shimmer/movement).
    Color of chain = selected edge color.

  Animated Dots — small circles flow along path
    (like data packets traveling between nodes)

  Electric / Lightning — jagged animated line
    with glow/bloom color effect at kinks

  Dashed Marching Ants — classic dashed line
    with animated dash-offset (ants marching)

  Fiber Optic — glowing thin line with
    bright moving light pulse along it

  Color settings:
    Per-type color pickers:
      import/require edge color
      HTML link/script edge color
      CSS @import edge color
      dynamic import color
      unknown edge color
    Rainbow mode toggle (each edge unique hue)
    Gradient edge toggle (source → target blend)
    Edge opacity slider: 20%–100%
    Edge thickness slider: 1px–8px
    Arrow head: Arrow | Dot | Diamond | None
    Edge label: show/hide import type label on edges

TAB 2 — NODES:
  Shape: Card | Pill | Hexagon | Circle | Minimal
  Size slider: XSmall → Small → Medium → Large → XLarge
  Show/hide toggles:
    File size | Folder path | Chain # badge
    Import count ↓ | Used-by count ↑
    Complexity border color | Badge icons
  Shadow: None | Soft | Strong | Neon glow | Drop
  Border: None | Subtle | Bold | Glow | Gradient
  Corner radius slider
  Icon size slider

TAB 3 — THEME:
  ⚠️ IMPORTANT FOR AI: There are TWO SEPARATE theme controls.
  Do NOT confuse them. They are completely independent:

  CONTROL A — App UI Theme (sidebar, header, panels, text):
    🌙 Dark UI (default)
    ☀️ Light UI

  CONTROL B — Graph Canvas Theme
    (ONLY affects the graph canvas area — nodes, edges, background)
    (Does NOT affect sidebar/header/panels)

    🌑 Dark Canvas — dark bg, colored nodes, purple edges
    ☀️ Light Canvas — white bg, light nodes, clean minimal
    ⚡ Neon Canvas — pitch black, neon glowing edges, dark nodes
    📐 Blueprint Canvas — dark navy bg, white/cyan lines,
       engineering drawing look, grid overlay
    🌸 Pastel Canvas — soft cream bg, muted colors, gentle style
    🔥 Heatmap Canvas — edges glow intensity by connection count

  Both controls are visible simultaneously. Example:
    Dark UI + Neon Canvas = dark sidebar, neon graph ✅
    Light UI + Blueprint Canvas = light sidebar, blueprint graph ✅

TAB 4 — BACKGROUND (Graph Canvas only):
  Dot grid (default) | Line grid | Solid |
  Subtle noise texture | Blueprint paper |
  Hexagon grid | Circuit board pattern |
  Starfield (dark themes) | Graph paper

TAB 5 — ANIMATION:
  Edge animation speed: Off | Slow | Medium | Fast | Turbo
  Node hover effect: Glow | Lift | Scale | Shake | None
  Layout transition: Instant | Smooth | Bouncy | Elastic
  Reduce motion toggle (for accessibility)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 11 — GUIDE / LEGEND PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Toggled by "?" button. Styled as interactive in-app manual.

PART A — SYMBOLS:
  ⚡ Entry Point — root/main file
  #1 #2 #3 — chain order from entry point
  → Edge — file A imports file B
  ⛓️ Chain edge — dependency chain visual style
  ◉ Selected — currently focused node
  ◌ Dimmed — not related to selection
  🔴 Gutter dot — this code line links to another file
  [Follow →] — jump to connected file + line
  📦 External — third-party package
  ⚠️ Unresolved — imported file not found
  🔒 Gitignored — excluded from repository
  ⚫ Orphan — file with no connections
  🧪 Test file — test/spec file
  ⚙️ Config — configuration file
  ↓2 — this file imports 2 files
  ↑3 — this file is imported by 3 files
  🔴 Circular — part of circular dependency
  ⚠️ Duplicate — same content as another file

PART B — FILE ICONS:
  Full grid: every icon + extension + color + what it is
  Beginners can identify any file type at a glance

PART C — HOW CHAIN NUMBERS WORK:
  Clear visual explanation with mini example:
  "#1 is your entry point (where your app starts).
   Every file it directly imports becomes #2, #3...
   Files those import become #4, #5...
   Higher number = further from app start.
   This shows the ORDER your project loads."
  Mini inline diagram showing #1→#2→#3 chain

PART D — KEYBOARD SHORTCUTS TABLE:
  Ctrl+F — search/find file in graph
  Ctrl+Shift+F — fit all nodes to screen
  Ctrl+E — open export modal
  Ctrl+Z / Ctrl+Y — undo/redo node moves
  Ctrl+B — toggle sidebar
  Escape — deselect / close panels
  ← → — navigate code history (in code panel)
  G — open guide/legend
  P — presentation mode
  Space — pan mode (hold)

- / - — zoom in / zoom out

PART E — HOW IMPORTS WORK (for beginners):
  Plain English explanation with examples:
  "When a file says import X from './other', it means
   'I need something from that other file to work.'
   RepoGraph draws a line between them to show this."
  Show examples for JS, CSS, HTML visually.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 12 — SPECIAL GRAPH MODES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NODE FOCUS MODE:
  Right-click → "Focus on this file"
  Shows ONLY: selected node + direct imports + direct dependents
  Everything else hidden with smooth fade
  [Exit Focus Mode] button top-center restores full graph

CHAIN TRACE MODE:
  Right-click → "Trace full chain from root to here"
  Highlights ONLY the path from #1 entry to this node
  All other nodes and edges dim to 15%
  Shows: #1 → #2 → #4 → #7 (current) in glowing chain

DEPENDENCY DEPTH MODE:
  Slider: show only N levels deep from selected node
  N=1: show only direct connections
  N=2: show connections of connections
  etc.

PRESENTATION MODE (P key or header button):
  Full-screen graph, no UI chrome (no sidebar, no panels)
  Graph fills entire viewport
  Subtle watermark: "RepoGraph" bottom-right
  ESC to exit
  Perfect for screen sharing / walkthroughs

STATS OVERLAY MODE:
  Toggle button: show stats badges floating on graph
  Each node shows its complexity score as floating badge
  Each edge shows import count floating label
  Overall: "Most connected: App.tsx (12 connections)"

DEPENDENCY MATRIX VIEW:
  Alternative to graph — show dependencies as a grid:
  Rows = source files | Columns = target files
  Cell = colored dot if dependency exists
  Hover cell = show exact import details
  Good for seeing all dependencies at a glance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 13 — DOWNLOAD SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use JSZip library for creating ZIPs in browser.

ACCESS POINTS:
  Header [⬇ Download] button → full repo
  Sidebar file right-click → single file ZIP
  Code panel [⬇] button → current file ZIP
  Repo Info page → full download section
  Multi-select files in sidebar → batch ZIP

/download PAGE (internal route):
  ┌──────────────────────────────────────────────┐
  │  [RepoGraph logo]                            │
  │                                              │
  │  Downloading from:                           │
  │  [owner-avatar] owner / repo-name            │
  │                                              │
  │  📦 repo-name-main.zip                       │
  │  Estimated size: ~4.2 MB                     │
  │                                              │
  │  [████████████░░░░] Preparing...             │
  │                                              │
  │  Download will start automatically.          │
  │  If not: [Click here to download manually]   │
  │                                              │
  │  Also available:                             │
  │  [Download as ZIP]                           │
  │  [Download specific files →]                 │
  │                                              │
  │  [← Return to Graph]  [Load another repo]   │
  └──────────────────────────────────────────────┘

For full repo (GitHub mode):
  → Redirect to: github.com/{owner}/{repo}/archive/{branch}.zip
  → Show size from repo metadata

For single/specific files (any mode):
  → Build ZIP in browser using JSZip
  → Show exact file size before download
  → Filename: filename.ext.zip or batch-files.zip

For local folder mode:
  → Re-zip selected files from memory using JSZip
  → Multi-select files in sidebar tree for batch download

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 14 — EXPORT OPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modal opened by Ctrl+E or toolbar button.

1. PNG Image
   Current view OR fit-all modes
   Resolution: 1x | 2x | 3x
   With/without background
   Library: html-to-image

2. PDF
   Page 1: Graph visualization
   Page 2: File list + dependency table
   Page 3: Language stats + sidebar summary
   Library: jsPDF

3. SVG
   Vector format, infinitely scalable
   Embeddable in docs and presentations

4. JSON (Graph Data)
   Full nodes + edges + metadata + positions
   Re-importable to restore session

5. Markdown Report
   Auto-generated structured analysis:

   # Project Analysis: repo-name

   ## Overview: X files, Y dependencies

   ## File Tree

   ## Language Breakdown

   ## Dependency Map (text-based)

   ## Entry Points

   ## External Packages

   ## TODO List

   ## Complexity Report

6. CSV (Dependency Table)
   Rows: source_file, target_file, line_number,
         import_type, what_imported
   For import into Excel / Google Sheets

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 15 — LANDING SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Shown when no repo is loaded. Beautiful, welcoming.

Hero: Large heading + short tagline
  "RepoGraph — See your codebase, not just your code."

Two input cards side by side:
  ┌────────────────────────┐  ┌────────────────────────┐
  │  🔗 GitHub URL         │  │  📁 Local Folder        │
  │                        │  │                        │
  │  [paste URL here    ]  │  │  [drag & drop or       │
  │  [Load Repo →]         │  │   click to browse]     │
  │                        │  │                        │
  │  Works with public     │  │  100% offline.         │
  │  GitHub repos          │  │  No internet needed.   │
  └────────────────────────┘  └────────────────────────┘

[✨ Try Demo] button → loads hardcoded sample React project
  (~10 files, showcasing ALL features)

Recently Loaded section:
  Last 10 repos as clickable cards
  Each shows: avatar, owner/repo, language badges,
  file count, date loaded, [Remove ✕]

3-step visual explainer:
  1️⃣ Paste a GitHub URL or upload your folder
  2️⃣ RepoGraph maps every file and connection
  3️⃣ Explore, navigate, understand, export

Feature highlights row (icons + short descriptions):
  ⚛ Any language | 🔍 Follow imports | ⛓️ Visual chains
  📊 Sidebar stats | 🌳 Shape layouts | 📤 Export all

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 16 — ONBOARDING TOUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

First time a user loads a repo → show optional guided tour.
Spotlight overlay highlighting each UI area in sequence:

Step 1: "This is your graph. Each box = one file."
Step 2: "Lines show which files import each other."
Step 3: "Click a node to highlight its connections."
Step 4: "Double-click to read the file's code."
Step 5: "This sidebar shows all project details."
Step 6: "Customize the look with the 🎨 panel."
Step 7: "Export your graph anytime with 📤."

Skip/dismiss option. Don't show again checkbox.
"Restart Tour" option in help/guide panel.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 17 — PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Web Worker for ALL file parsing (zero UI freeze)
Lazy file content loading (fetch/read only on open)
200+ files: LOD (level-of-detail) rendering

- Far/small nodes: simplified colored dot
- Full detail only when zoomed in
Debounce layout recalculation (300ms)
Virtual scroll in sidebar for huge repos (1000+ files)
Cancel in-flight GitHub requests on URL change
requestAnimationFrame for all graph animations
IndexedDB for caching parsed results of recently
  visited repos (avoid re-parsing same repo twice)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 18 — TOAST NOTIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top-right. Auto-dismiss 4s. Stackable. Swipe to dismiss.

Types and examples:
  ✅ Success (green): "Loaded 47 files, 123 dependencies found"
  📍 Navigate (blue): "Following: Button.tsx → helpers.ts (line 14)"
  ⚠️ Warning (amber): "3 unresolved imports found — see sidebar"
  🔴 Error (red): "Private repo — access denied"
  ⏱️ Info (gray): "Rate limit resets in 4:32"
  🔄 Update (blue): "File changed: Button.tsx — click to refresh"
  📦 Download (purple): "Download starting: repo.zip (~4.2 MB)"
  ⚠️ Circular (red): "Circular dependency: App.tsx ↔ utils.ts"
  ⚫ Orphan (gray): "3 orphan files found — see sidebar"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 19 — ACCESSIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full keyboard navigation (Tab through all elements)
Proper aria-labels on every button/input/region
Focus rings visible at all times
Skip-to-main-content link (screen readers)
Color blind safe: use shape + label not color alone
Respects prefers-reduced-motion (disable all animations)
Respects prefers-color-scheme (auto dark/light)
Minimum text contrast ratio: 4.5:1 (WCAG AA)
All icons have descriptive aria-label
Graph nodes keyboard navigable with arrow keys

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 20 — MOBILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Banner: "RepoGraph works best on desktop (1024px+)"
Show: sidebar + file tree fully functional
Code viewer works fine (Monaco responsive)
Graph: simplified static layout (no drag, no pan)
Download and export work fine on mobile
Touch-friendly buttons (min 44px tap targets)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 21 — TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend:    React 18 + TypeScript + Vite
Styling:     Tailwind CSS + CSS custom properties
             JetBrains Mono (code) + Syne (UI headings)
Graph:       React Flow (reactflow.dev)
             Custom node + edge components per type
             Custom chain link SVG edge component
Code View:   Monaco Editor (@monaco-editor/react)
             Programmatic gutter decorations
             Custom hover providers
             Inline diff (for future compare mode)
Icons:       Inline SVG icon map (no external library)
Export:      html-to-image (PNG/SVG) + jsPDF (PDF)
ZIP:         JSZip (client-side ZIP creation)
State:       Zustand (global, no boilerplate)
Routing:     React Router v6 (/download + /repo-info routes)
Parsing:     Custom regex engine in Web Worker (worker.ts)
             Path alias resolution (tsconfig paths)
Caching:     IndexedDB (cache parsed repo data)
Storage:     localStorage (recent repos, bookmarks,
             customization preferences, tour dismissed)
GitHub API:  Native fetch() only, no SDK
Markdown:    react-markdown (README rendering)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 22 — FUTURE ARCHITECTURE
(Do NOT build now — keep code extensible for these)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Supabase auth + user accounts
Private GitHub repo via OAuth token
Save and share graph via unique URL
Annotate/comment nodes (team notes)
Repo version diff (compare two branches/commits)
AI explanation of each file's role
Team collaboration with live cursors on graph
Git commit history per file (blame view)
VS Code extension version of RepoGraph
NPM package: repograph-cli for terminal analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION 23 — QUALITY & DESIGN STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VISUAL QUALITY:
  Figma + Linear + Vercel + GitHub combined quality
  Premium dev-tool aesthetic throughout
  Every pixel intentional. No default browser styles.
  Micro-animations on every interaction
  Skeleton loading screens (not spinners alone)
  Empty states for every panel (never blank)
  Loading states everywhere

BEGINNER FRIENDLINESS:
  Any non-developer should understand the graph
  within 60 seconds of loading a repo
  Plain English explanations everywhere in Guide
  Tooltips on every icon and technical term
  Onboarding tour for first-time users
  Demo mode shows a pre-loaded example instantly

DEVELOPER EXPERIENCE:
  Every button works — zero placeholder/dummy UI
  No console errors in production build
  All async operations cancellable
  Graceful degradation for all edge cases
  Every error has a friendly message + next action

CODE ARCHITECTURE:
  Clean component separation for future features
  All parsing logic isolated in worker.ts
  All GitHub API calls isolated in github.ts
  Theme system via CSS custom properties only
  Zustand stores clearly separated by domain:
    repoStore, graphStore, uiStore, codeStore
