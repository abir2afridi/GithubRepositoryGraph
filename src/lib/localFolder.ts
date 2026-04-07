import { FileNode } from '@/store/useStore';
import { getExtension, getLanguageFromExt, isBinaryExtension } from './fileIcons';
import { parseGitignore } from './parser';

export async function processLocalFolder(
  files: FileList,
  onProgress: (msg: string, pct: number) => void
): Promise<{ files: FileNode[]; gitignorePatterns: string[] }> {
  const fileArray = Array.from(files);
  let gitignorePatterns: string[] = [];

  // Find .gitignore first
  const gitignoreFile = fileArray.find(f => f.name === '.gitignore');
  if (gitignoreFile) {
    const content = await readFileText(gitignoreFile);
    gitignorePatterns = parseGitignore(content);
  }

  const result: FileNode[] = [];
  const total = fileArray.length;

  for (let i = 0; i < total; i++) {
    const file = fileArray[i];
    const path = (file as any).webkitRelativePath || file.name;
    // Strip the root folder name
    const relativePath = path.includes('/') ? path.substring(path.indexOf('/') + 1) : path;

    if (i % 20 === 0) {
      const pct = Math.round((i / total) * 100);
      onProgress(`Processing: ${relativePath}`, pct);
    }

    // Skip common ignored dirs
    if (/node_modules|\.git\/|__pycache__|\.next|dist\/|build\/|\.cache/.test(relativePath)) continue;

    // Check gitignore
    const isGitignored = gitignorePatterns.some(p => {
      const pattern = p.replace(/\*/g, '.*').replace(/\//g, '\\/');
      try { return new RegExp(pattern).test(relativePath); } catch { return false; }
    });

    const ext = getExtension(file.name);
    const binary = isBinaryExtension(ext);

    let content = '';
    if (!binary && file.size < 500000) { // Skip files > 500KB
      try { content = await readFileText(file); } catch { /* skip */ }
    }

    result.push({
      path: relativePath,
      name: file.name,
      content,
      size: file.size,
      extension: ext,
      language: getLanguageFromExt(ext),
      lineCount: content ? content.split('\n').length : 0,
      isEntryPoint: false,
      isBinary: binary,
      isGitignored,
    });
  }

  return { files: result, gitignorePatterns };
}

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
