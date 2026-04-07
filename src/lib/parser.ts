import { Dependency, FileNode } from '@/store/useStore';

const PYTHON_STDLIB = new Set([
  'os', 'sys', 'math', 'json', 're', 'io', 'time', 'datetime', 'random',
  'collections', 'itertools', 'functools', 'typing', 'pathlib', 'abc',
  'logging', 'unittest', 'subprocess', 'threading', 'multiprocessing',
  'socket', 'http', 'urllib', 'hashlib', 'base64', 'csv', 'sqlite3',
  'pickle', 'copy', 'string', 'textwrap', 'struct', 'enum', 'dataclasses',
  'contextlib', 'argparse', 'shutil', 'glob', 'tempfile', 'xml', 'html',
]);

export function parseFileDependencies(file: FileNode, allFiles: FileNode[]): Dependency[] {
  if (file.isBinary || !file.content) return [];
  const deps: Dependency[] = [];
  const ext = file.extension.toLowerCase();
  const lines = file.content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte'].includes(ext)) {
      // ES import
      const esMatch = trimmed.match(/^import\s+(?:(?:[\w*{}\s,]+)\s+from\s+)?['"]([^'"]+)['"]/);
      if (esMatch) deps.push(makeDep(file.path, esMatch[1], 'import', lineNum, trimmed, allFiles));

      // export from
      const exportMatch = trimmed.match(/^export\s+(?:{[^}]*}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/);
      if (exportMatch) deps.push(makeDep(file.path, exportMatch[1], 'import', lineNum, trimmed, allFiles));

      // require
      const reqMatch = trimmed.match(/(?:require|import)\s*\(\s*['"]([^'"]+)['"]\s*\)/);
      if (reqMatch && !esMatch) deps.push(makeDep(file.path, reqMatch[1], 'require', lineNum, trimmed, allFiles));
    }

    if (['.html', '.htm'].includes(ext)) {
      const srcMatch = trimmed.match(/<(?:script|img|source|video|audio)\s[^>]*src=['"]([^'"]+)['"]/i);
      if (srcMatch) deps.push(makeDep(file.path, srcMatch[1], 'html', lineNum, trimmed, allFiles));
      const hrefMatch = trimmed.match(/<link\s[^>]*href=['"]([^'"]+)['"]/i);
      if (hrefMatch) deps.push(makeDep(file.path, hrefMatch[1], 'html', lineNum, trimmed, allFiles));
    }

    if (['.css', '.scss', '.less'].includes(ext)) {
      const cssImport = trimmed.match(/^@(?:import|use|forward)\s+['"]([^'"]+)['"]/);
      if (cssImport) deps.push(makeDep(file.path, cssImport[1], 'css', lineNum, trimmed, allFiles));
      const urlMatch = trimmed.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
      if (urlMatch && !urlMatch[1].startsWith('data:')) deps.push(makeDep(file.path, urlMatch[1], 'css', lineNum, trimmed, allFiles));
    }

    if (ext === '.py') {
      const fromImport = trimmed.match(/^from\s+(\S+)\s+import/);
      if (fromImport) {
        const mod = fromImport[1];
        if (!PYTHON_STDLIB.has(mod.split('.')[0]) && (mod.startsWith('.') || !mod.includes('.'))) {
          deps.push(makeDep(file.path, mod, 'python', lineNum, trimmed, allFiles));
        }
      }
      const pyImport = trimmed.match(/^import\s+(\S+)/);
      if (pyImport && !fromImport) {
        const mod = pyImport[1];
        if (!PYTHON_STDLIB.has(mod.split('.')[0])) {
          deps.push(makeDep(file.path, mod, 'python', lineNum, trimmed, allFiles));
        }
      }
    }

    if (ext === '.php') {
      const phpMatch = trimmed.match(/(?:require_once|require|include_once|include)\s*\(?\s*['"]([^'"]+)['"]\s*\)?/);
      if (phpMatch) deps.push(makeDep(file.path, phpMatch[1], 'php', lineNum, trimmed, allFiles));
    }

    // Go imports
    if (ext === '.go') {
      const goMatch = trimmed.match(/^\s*"\.\/([^"]+)"/);
      if (goMatch) deps.push(makeDep(file.path, './' + goMatch[1], 'import', lineNum, trimmed, allFiles));
    }

    // Rust modules
    if (ext === '.rs') {
      const modMatch = trimmed.match(/^(?:pub\s+)?mod\s+(\w+)\s*;/);
      if (modMatch) deps.push(makeDep(file.path, './' + modMatch[1], 'import', lineNum, trimmed, allFiles));
      const useMatch = trimmed.match(/^use\s+crate::(\w+)/);
      if (useMatch) deps.push(makeDep(file.path, './' + useMatch[1], 'import', lineNum, trimmed, allFiles));
    }
  });

  return deps;
}

function makeDep(
  source: string, rawTarget: string, type: Dependency['type'],
  line: number, raw: string, allFiles: FileNode[]
): Dependency {
  const isExternal = !rawTarget.startsWith('.') && !rawTarget.startsWith('/') && !rawTarget.startsWith('@/');
  const resolved = isExternal ? false : resolveTarget(source, rawTarget, allFiles) !== null;

  return {
    source,
    target: isExternal ? rawTarget : (resolveTarget(source, rawTarget, allFiles) || rawTarget),
    type,
    line,
    raw: raw.trim(),
    resolved: isExternal ? false : resolved,
    isExternal,
  };
}

function resolveTarget(source: string, target: string, allFiles: FileNode[]): string | null {
  const sourceDir = source.substring(0, source.lastIndexOf('/'));
  let resolved = target;

  if (target.startsWith('@/') || target.startsWith('~/')) {
    resolved = 'src/' + target.slice(2);
  } else if (target.startsWith('./') || target.startsWith('../')) {
    const parts = sourceDir.split('/');
    const targetParts = target.split('/');
    for (const part of targetParts) {
      if (part === '.') continue;
      if (part === '..') parts.pop();
      else parts.push(part);
    }
    resolved = parts.join('/');
  }

  // Try exact match, then with extensions
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.scss', '.json', '.vue', '.svelte', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
  for (const ext of extensions) {
    const candidate = resolved + ext;
    if (allFiles.some(f => f.path === candidate)) return candidate;
  }
  return null;
}

export function detectEntryPoints(files: FileNode[]): string[] {
  const entryNames = ['index.html', 'index.tsx', 'index.ts', 'index.js', 'index.jsx',
    'main.tsx', 'main.ts', 'main.js', 'App.tsx', 'App.ts', 'App.js',
    'app.py', 'main.py', 'index.php', 'app.php'];
  const entries: string[] = [];
  for (const name of entryNames) {
    const found = files.filter(f => f.name === name);
    entries.push(...found.map(f => f.path));
  }
  return [...new Set(entries)];
}

export function parseGitignore(content: string): string[] {
  return content.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
}

export function detectTechStack(packageJson: any): string[] {
  if (!packageJson) return [];
  const all = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const stack: string[] = [];
  const detect: Record<string, string> = {
    'react': '⚛ React', 'vue': '💚 Vue', 'svelte': '🧡 Svelte', 'angular': '🔴 Angular',
    'typescript': '🔷 TypeScript', 'vite': '⚡ Vite', 'webpack': '📦 Webpack',
    'tailwindcss': '🎨 Tailwind', 'next': '▲ Next.js', 'nuxt': '💚 Nuxt',
    'express': '🟢 Express', 'fastify': '⚡ Fastify', 'zustand': '🐻 Zustand',
    'redux': '💜 Redux', 'react-router': '🔀 React Router', 'react-router-dom': '🔀 React Router',
    'axios': '📡 Axios', 'prisma': '🔺 Prisma', 'jest': '🃏 Jest', 'vitest': '⚡ Vitest',
    'eslint': '📏 ESLint', 'prettier': '✨ Prettier',
  };
  for (const [pkg, label] of Object.entries(detect)) {
    if (all[pkg]) stack.push(label);
  }
  return stack;
}
