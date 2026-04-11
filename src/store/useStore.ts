import { create } from 'zustand';

export interface FileNode {
  path: string;
  name: string;
  content: string;
  size: number;
  extension: string;
  language: string;
  lineCount: number;
  isEntryPoint: boolean;
  isBinary: boolean;
  isGitignored: boolean;
}

export interface Dependency {
  source: string;
  target: string;
  type: 'import' | 'require' | 'html' | 'css' | 'dynamic' | 'python' | 'php';
  line: number;
  raw: string;
  resolved: boolean;
  isExternal: boolean;
}

export interface RepoMeta {
  owner: string;
  ownerAvatar: string;
  repoName: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  license: string;
  topics: string[];
  language: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  defaultBranch: string;
  isFork: boolean;
  parentFullName?: string;
  homepage: string;
  htmlUrl: string;
  languages?: Record<string, number>;
}

export interface ProjectData {
  name: string;
  description: string;
  branch: string;
  source: 'github' | 'local';
  files: FileNode[];
  dependencies: Dependency[];
  gitignorePatterns: string[];
  packageJson: Record<string, unknown> | null;
  techStack: string[];
  entryPoints: string[];
  repoMeta?: RepoMeta;
  fileOrder?: Map<string, number>;
}

export type ThemeId = 'dark' | 'light' | 'neon' | 'blueprint' | 'pastel' | 'blood' | 'forest' | 'sunset' | 'electric' | 'midnight' | 'matrix' | 'cyber' | 'drift' | 'arctic' | 'desert' | 'lava' | 'void';
export type LayoutId = 'force' | 'hierarchy' | 'circular' | 'grid' | 'radial';
export type ShapeId = 'auto' | 'human' | 'jet' | 'cat' | 'tree' | 'star' | 'heart' | 'wave' | 'circle' | 'diamond' | 'honeycomb' | 'pyramid' | 'spiral';
export type EdgeStyle = 'bezier' | 'straight' | 'step' | 'animated-dots' | 'chain';
export type NodeShape = 'card' | 'pill' | 'hexagon' | 'minimal' | 'circular';
export type BgPattern = 'dots' | 'lines' | 'cross' | 'solid' | 'hex' | 'none';

interface AppState {
  project: ProjectData | null;
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number;
  error: string | null;

  theme: ThemeId;
  layout: LayoutId;
  shape: ShapeId;
  edgeStyle: EdgeStyle;
  nodeShape: NodeShape;
  bgPattern: BgPattern;
  edgeOpacity: number;
  edgeThickness: number;
  animationSpeed: 'off' | 'slow' | 'medium' | 'fast';
  sidebarOpen: boolean;
  codeViewOpen: boolean;
  codeViewFile: string | null;
  customizationOpen: boolean;
  guideOpen: boolean;
  exportOpen: boolean;
  selectedNode: string | null;
  searchQuery: string;
  searchOpen: boolean;
  repoInfoOpen: boolean;
  intelligenceTab: 'arch' | 'security';
  securityPanelOpen: boolean; // Deprecated but kept for compatibility or temporary use
  presentationMode: boolean;
  contextMenu: { x: number; y: number; nodePath: string } | null;

  codeHistory: string[];
  codeHistoryIndex: number;

  setProject: (p: ProjectData | null) => void;
  setLoading: (loading: boolean, message?: string, progress?: number) => void;
  setError: (error: string | null) => void;
  setTheme: (t: ThemeId) => void;
  setLayout: (l: LayoutId) => void;
  setShape: (s: ShapeId) => void;
  setEdgeStyle: (e: EdgeStyle) => void;
  setNodeShape: (n: NodeShape) => void;
  setBgPattern: (b: BgPattern) => void;
  setEdgeOpacity: (o: number) => void;
  setEdgeThickness: (t: number) => void;
  setAnimationSpeed: (s: 'off' | 'slow' | 'medium' | 'fast') => void;
  toggleSidebar: () => void;
  openCodeView: (filePath: string, line?: number) => void;
  closeCodeView: () => void;
  navigateCode: (direction: 'back' | 'forward') => void;
  toggleCustomization: () => void;
  toggleGuide: () => void;
  toggleExport: () => void;
  toggleRepoInfo: () => void;
  setIntelligenceTab: (tab: 'arch' | 'security') => void;
  toggleSecurityPanel: () => void;
  togglePresentation: () => void;
  setContextMenu: (menu: { x: number; y: number; nodePath: string } | null) => void;
  setSelectedNode: (n: string | null) => void;
  setSearchQuery: (q: string) => void;
  toggleSearch: () => void;
  highlightedLine: number | null;
  setHighlightedLine: (line: number | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  project: null,
  isLoading: false,
  loadingMessage: '',
  loadingProgress: 0,
  error: null,

  theme: 'dark',
  layout: 'force',
  shape: 'auto',
  edgeStyle: 'bezier',
  nodeShape: 'card',
  bgPattern: 'dots',
  edgeOpacity: 80,
  edgeThickness: 2,
  animationSpeed: 'medium',
  sidebarOpen: true,
  codeViewOpen: false,
  codeViewFile: null,
  customizationOpen: false,
  guideOpen: false,
  exportOpen: false,
  selectedNode: null,
  searchQuery: '',
  searchOpen: false,
  repoInfoOpen: false,
  intelligenceTab: 'arch',
  securityPanelOpen: false,
  presentationMode: false,
  contextMenu: null,
  codeHistory: [],
  codeHistoryIndex: -1,
  highlightedLine: null,

  setProject: (p) => set({ project: p, error: null, securityPanelOpen: false, highlightedLine: null }),
  setLoading: (loading, message = '', progress = 0) => set({ isLoading: loading, loadingMessage: message, loadingProgress: progress }),
  setError: (error) => set({ error, isLoading: false }),
  setTheme: (theme) => {
    const root = document.documentElement;
    // Remove all theme classes first
    root.classList.forEach(cls => {
      if (cls.startsWith('theme-')) root.classList.remove(cls);
    });
    
    // Set new theme
    if (theme !== 'dark') {
      root.classList.add(`theme-${theme}`);
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    
    set({ theme });
  },
  setLayout: (layout) => set({ layout }),
  setShape: (shape) => set({ shape }),
  setEdgeStyle: (edgeStyle) => set({ edgeStyle }),
  setNodeShape: (nodeShape) => set({ nodeShape }),
  setBgPattern: (bgPattern) => set({ bgPattern }),
  setEdgeOpacity: (edgeOpacity) => set({ edgeOpacity }),
  setEdgeThickness: (edgeThickness) => set({ edgeThickness }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openCodeView: (filePath, line) => {
    const state = get();
    const newHistory = state.codeHistory.slice(0, state.codeHistoryIndex + 1);
    newHistory.push(filePath);
    set({ 
      codeViewOpen: true, 
      codeViewFile: filePath, 
      codeHistory: newHistory, 
      codeHistoryIndex: newHistory.length - 1,
      highlightedLine: line || null
    });
  },
  closeCodeView: () => set({ codeViewOpen: false, codeViewFile: null, highlightedLine: null }),
  navigateCode: (direction) => {
    const state = get();
    const newIndex = direction === 'back' ? state.codeHistoryIndex - 1 : state.codeHistoryIndex + 1;
    if (newIndex >= 0 && newIndex < state.codeHistory.length) {
      set({ codeHistoryIndex: newIndex, codeViewFile: state.codeHistory[newIndex], highlightedLine: null });
    }
  },
  toggleCustomization: () => set((s) => ({ customizationOpen: !s.customizationOpen })),
  toggleGuide: () => set((s) => ({ guideOpen: !s.guideOpen })),
  toggleExport: () => set((s) => ({ exportOpen: !s.exportOpen })),
  toggleRepoInfo: () => set((s) => ({ repoInfoOpen: !s.repoInfoOpen })),
  setIntelligenceTab: (tab) => set({ intelligenceTab: tab, sidebarOpen: true }),
  toggleSecurityPanel: () => set((s) => ({ 
    intelligenceTab: s.intelligenceTab === 'security' && s.sidebarOpen ? 'arch' : 'security',
    sidebarOpen: true 
  })),
  togglePresentation: () => set((s) => ({ presentationMode: !s.presentationMode })),
  setContextMenu: (contextMenu) => set({ contextMenu }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  setHighlightedLine: (highlightedLine) => set({ highlightedLine }),
}));
