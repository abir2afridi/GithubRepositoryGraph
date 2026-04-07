import { ProjectData, RepoMeta } from '@/store/useStore';
import { parseFileDependencies, detectEntryPoints, parseGitignore, detectTechStack } from '@/lib/parser';
import { parseGitHubUrl, fetchRepo } from '@/lib/github';
import { processLocalFolder } from '@/lib/localFolder';
import { getDemoFiles } from '@/lib/demoProject';

export async function loadFromGitHub(
  url: string,
  onProgress: (msg: string, pct: number) => void
): Promise<ProjectData> {
  const parsed = parseGitHubUrl(url);
  if ('error' in parsed) throw new Error(parsed.error);

  const { owner, repo, branch } = parsed;
  const result = await fetchRepo(owner, repo, branch, onProgress);

  return buildProject(result.files, repo, result.description, result.branch, 'github', [], result.repoMeta);
}

export async function loadFromFolder(
  files: FileList,
  onProgress: (msg: string, pct: number) => void
): Promise<ProjectData> {
  const firstPath = (files[0] as any)?.webkitRelativePath || '';
  const folderName = firstPath.split('/')[0] || 'Local Project';
  
  const result = await processLocalFolder(files, onProgress);
  return buildProject(result.files, folderName, '', '', 'local', result.gitignorePatterns);
}

export function loadDemo(): ProjectData {
  const files = getDemoFiles();
  return buildProject(files, 'demo-app', 'A sample React app for demonstration', 'main', 'local');
}

function buildProject(
  files: import('@/store/useStore').FileNode[],
  name: string, description: string, branch: string,
  source: 'github' | 'local',
  gitignorePatterns: string[] = [],
  repoMeta?: RepoMeta
): ProjectData {
  const entryPoints = detectEntryPoints(files);
  files.forEach(f => { f.isEntryPoint = entryPoints.includes(f.path); });

  const deps = files.flatMap(f => parseFileDependencies(f, files));

  const gitignoreFile = files.find(f => f.name === '.gitignore');
  if (gitignoreFile && gitignorePatterns.length === 0) {
    gitignorePatterns = parseGitignore(gitignoreFile.content);
  }

  const pkgFile = files.find(f => f.name === 'package.json');
  let packageJson = null;
  let techStack: string[] = [];
  if (pkgFile?.content) {
    try {
      packageJson = JSON.parse(pkgFile.content);
      techStack = detectTechStack(packageJson);
    } catch { /* invalid json */ }
  }

  // Compute file order via BFS from entry points
  const fileOrder = computeFileOrder(files, deps, entryPoints);

  return {
    name, description, branch, source,
    files, dependencies: deps, gitignorePatterns,
    packageJson, techStack, entryPoints, repoMeta, fileOrder,
  };
}

function computeFileOrder(
  files: import('@/store/useStore').FileNode[],
  deps: import('@/store/useStore').Dependency[],
  entryPoints: string[]
): Map<string, number> {
  const order = new Map<string, number>();
  const queue = [...entryPoints];
  let num = 1;
  queue.forEach(p => { if (!order.has(p)) order.set(p, num++); });

  let i = 0;
  while (i < queue.length) {
    const current = queue[i++];
    const outgoing = deps.filter(d => d.source === current && d.resolved && !d.isExternal);
    for (const dep of outgoing) {
      if (!order.has(dep.target)) {
        order.set(dep.target, num++);
        queue.push(dep.target);
      }
    }
  }

  // Assign remaining files
  files.forEach(f => {
    if (!order.has(f.path)) order.set(f.path, num++);
  });

  return order;
}

// Circular dependency detection
export function detectCircularDeps(deps: import('@/store/useStore').Dependency[]): string[][] {
  const graph = new Map<string, string[]>();
  deps.filter(d => d.resolved && !d.isExternal).forEach(d => {
    if (!graph.has(d.source)) graph.set(d.source, []);
    graph.get(d.source)!.push(d.target);
  });

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string) {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        cycles.push([...path.slice(cycleStart), node]);
      }
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const next of graph.get(node) || []) {
      dfs(next);
    }
    path.pop();
    stack.delete(node);
  }

  for (const node of graph.keys()) {
    dfs(node);
  }

  return cycles;
}

// Recent sessions
const RECENT_KEY = 'repograph_recent';
export function addRecentSession(name: string, source: string) {
  const recent = getRecentSessions();
  const entry = { name, source, time: Date.now() };
  const filtered = recent.filter(r => r.name !== name);
  filtered.unshift(entry);
  localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 3)));
}

export function getRecentSessions(): { name: string; source: string; time: number }[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch { return []; }
}
