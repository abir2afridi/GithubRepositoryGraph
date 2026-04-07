import { FileNode, Dependency } from '@/store/useStore';

// TODO/FIXME/HACK/NOTE extraction
export interface CodeNote {
  type: 'TODO' | 'FIXME' | 'HACK' | 'NOTE' | 'XXX';
  text: string;
  file: string;
  line: number;
}

export function extractCodeNotes(files: FileNode[]): CodeNote[] {
  const notes: CodeNote[] = [];
  const pattern = /\b(TODO|FIXME|HACK|NOTE|XXX)\b[:\s]*(.+)/i;
  
  for (const file of files) {
    if (file.isBinary || !file.content) continue;
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(pattern);
      if (match) {
        notes.push({
          type: match[1].toUpperCase() as CodeNote['type'],
          text: match[2].trim().slice(0, 100),
          file: file.path,
          line: i + 1,
        });
      }
    }
  }
  return notes;
}

// Complexity scoring
export interface ComplexityResult {
  file: string;
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Critical';
}

export function computeComplexity(files: FileNode[]): ComplexityResult[] {
  const results: ComplexityResult[] = [];
  const branchPatterns = /\b(if|else|switch|case|for|while|do|catch|throw|ternary|\?.*:)/g;
  
  for (const file of files) {
    if (file.isBinary || !file.content) continue;
    const ext = file.extension.toLowerCase();
    if (!['.ts', '.tsx', '.js', '.jsx', '.py', '.php', '.vue', '.svelte'].includes(ext)) continue;
    
    const content = file.content;
    const matches = content.match(branchPatterns);
    const branchCount = matches ? matches.length : 0;
    const ternaryCount = (content.match(/\?[^?]*:/g) || []).length;
    const callbackDepth = (content.match(/=>\s*{/g) || []).length;
    
    const score = Math.min(100, branchCount * 3 + ternaryCount * 2 + callbackDepth + Math.floor(file.lineCount / 20));
    const level: ComplexityResult['level'] = score >= 80 ? 'Critical' : score >= 50 ? 'High' : score >= 25 ? 'Medium' : 'Low';
    
    results.push({ file: file.path, score, level });
  }
  
  return results.sort((a, b) => b.score - a.score);
}

// Orphan / dead file detection
export function detectOrphans(files: FileNode[], deps: Dependency[], entryPoints: string[]): string[] {
  const hasImports = new Set<string>();
  const isImported = new Set<string>();
  
  deps.forEach(d => {
    if (!d.isExternal) {
      hasImports.add(d.source);
      if (d.resolved) isImported.add(d.target);
    }
  });
  
  return files
    .filter(f => !f.isBinary && !entryPoints.includes(f.path) && !hasImports.has(f.path) && !isImported.has(f.path))
    .map(f => f.path);
}

// Test file detection
export function detectTestFiles(files: FileNode[]): string[] {
  return files
    .filter(f => /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(f.name) || f.path.includes('__tests__/'))
    .map(f => f.path);
}

// Config file detection
export function detectConfigFiles(files: FileNode[]): string[] {
  const configPatterns = [
    /^(vite|webpack|rollup|babel|jest|vitest|tailwind|postcss|tsconfig|prettier|eslint)\.config/i,
    /^\.eslintrc/, /^\.prettierrc/, /^\.babelrc/, /^Dockerfile/i, /^docker-compose/i,
    /^Makefile$/i, /^\.editorconfig$/i,
  ];
  return files
    .filter(f => configPatterns.some(p => p.test(f.name)))
    .map(f => f.path);
}

// CI/CD pipeline detection
export interface CIPipeline {
  file: string;
  name: string;
  triggers: string[];
}

export function detectCIPipelines(files: FileNode[]): CIPipeline[] {
  const pipelines: CIPipeline[] = [];
  
  for (const file of files) {
    if (!file.path.startsWith('.github/workflows/') || !file.content) continue;
    const nameMatch = file.content.match(/^name:\s*(.+)/m);
    const triggers: string[] = [];
    const onMatch = file.content.match(/^on:\s*(.+)/m);
    if (onMatch) {
      triggers.push(...onMatch[1].split(/[,\s]+/).filter(Boolean));
    }
    // Also look for on: block style
    const onBlock = file.content.match(/^on:\s*\n((?:\s+.+\n?)+)/m);
    if (onBlock) {
      const blockTriggers = onBlock[1].match(/^\s+(\w+):/gm);
      if (blockTriggers) {
        triggers.push(...blockTriggers.map(t => t.trim().replace(':', '')));
      }
    }
    
    pipelines.push({
      file: file.path,
      name: nameMatch?.[1] || file.name,
      triggers: [...new Set(triggers)].filter(t => t.length > 0),
    });
  }
  
  return pipelines;
}

// ENV variable extraction (keys only, never values)
export function extractEnvKeys(files: FileNode[]): { file: string; keys: string[] }[] {
  const results: { file: string; keys: string[] }[] = [];
  
  for (const file of files) {
    if (!file.name.startsWith('.env') || !file.content) continue;
    const keys = file.content
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(l => l.split('=')[0].trim())
      .filter(Boolean);
    
    if (keys.length > 0) {
      results.push({ file: file.path, keys });
    }
  }
  
  return results;
}

// Duplicate file detection (simple content hash comparison)
export function detectDuplicates(files: FileNode[]): Map<string, string[]> {
  const hashMap = new Map<string, string[]>();
  
  for (const file of files) {
    if (file.isBinary || !file.content || file.content.length < 50) continue;
    // Simple hash: first 200 + last 200 chars + length
    const key = `${file.content.length}:${file.content.slice(0, 200)}:${file.content.slice(-200)}`;
    if (!hashMap.has(key)) hashMap.set(key, []);
    hashMap.get(key)!.push(file.path);
  }
  
  const dupes = new Map<string, string[]>();
  hashMap.forEach((paths, _key) => {
    if (paths.length > 1) {
      paths.forEach(p => dupes.set(p, paths.filter(x => x !== p)));
    }
  });
  
  return dupes;
}
