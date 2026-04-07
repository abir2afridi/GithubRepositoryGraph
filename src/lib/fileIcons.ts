export interface FileTypeInfo {
  icon: string;
  color: string;
  language: string;
  colorVar: string;
}

const FILE_TYPES: Record<string, FileTypeInfo> = {
  '.ts': { icon: 'TS', color: 'hsl(210, 80%, 55%)', language: 'TypeScript', colorVar: 'lang-ts' },
  '.tsx': { icon: '⚛', color: 'hsl(195, 80%, 55%)', language: 'React TSX', colorVar: 'lang-ts' },
  '.js': { icon: 'JS', color: 'hsl(48, 90%, 55%)', language: 'JavaScript', colorVar: 'lang-js' },
  '.jsx': { icon: '⚛', color: 'hsl(195, 80%, 55%)', language: 'React JSX', colorVar: 'lang-js' },
  '.mjs': { icon: 'JS', color: 'hsl(48, 90%, 55%)', language: 'JavaScript', colorVar: 'lang-js' },
  '.cjs': { icon: 'JS', color: 'hsl(48, 90%, 55%)', language: 'JavaScript', colorVar: 'lang-js' },
  '.html': { icon: '🌐', color: 'hsl(16, 90%, 55%)', language: 'HTML', colorVar: 'lang-html' },
  '.htm': { icon: '🌐', color: 'hsl(16, 90%, 55%)', language: 'HTML', colorVar: 'lang-html' },
  '.css': { icon: '🎨', color: 'hsl(210, 90%, 55%)', language: 'CSS', colorVar: 'lang-css' },
  '.scss': { icon: '🎨', color: 'hsl(330, 70%, 55%)', language: 'SCSS', colorVar: 'lang-css' },
  '.less': { icon: '🎨', color: 'hsl(210, 60%, 45%)', language: 'LESS', colorVar: 'lang-css' },
  '.json': { icon: '{ }', color: 'hsl(220, 10%, 60%)', language: 'JSON', colorVar: 'lang-json' },
  '.py': { icon: '🐍', color: 'hsl(120, 50%, 50%)', language: 'Python', colorVar: 'lang-py' },
  '.php': { icon: 'PHP', color: 'hsl(260, 50%, 55%)', language: 'PHP', colorVar: 'lang-php' },
  '.vue': { icon: 'V', color: 'hsl(153, 65%, 50%)', language: 'Vue', colorVar: 'lang-vue' },
  '.svelte': { icon: 'S', color: 'hsl(16, 90%, 55%)', language: 'Svelte', colorVar: 'lang-svelte' },
  '.md': { icon: '📄', color: 'hsl(220, 10%, 70%)', language: 'Markdown', colorVar: 'lang-md' },
  '.mdx': { icon: '📄', color: 'hsl(220, 10%, 70%)', language: 'MDX', colorVar: 'lang-md' },
  '.svg': { icon: '🖼', color: 'hsl(280, 60%, 55%)', language: 'SVG', colorVar: 'lang-image' },
  '.png': { icon: '🖼', color: 'hsl(280, 60%, 55%)', language: 'PNG', colorVar: 'lang-image' },
  '.jpg': { icon: '🖼', color: 'hsl(280, 60%, 55%)', language: 'JPEG', colorVar: 'lang-image' },
  '.jpeg': { icon: '🖼', color: 'hsl(280, 60%, 55%)', language: 'JPEG', colorVar: 'lang-image' },
  '.gif': { icon: '🖼', color: 'hsl(280, 60%, 55%)', language: 'GIF', colorVar: 'lang-image' },
  '.webp': { icon: '🖼', color: 'hsl(280, 60%, 55%)', language: 'WebP', colorVar: 'lang-image' },
  '.yaml': { icon: '⚙', color: 'hsl(220, 10%, 60%)', language: 'YAML', colorVar: 'lang-json' },
  '.yml': { icon: '⚙', color: 'hsl(220, 10%, 60%)', language: 'YAML', colorVar: 'lang-json' },
  '.toml': { icon: '⚙', color: 'hsl(220, 10%, 60%)', language: 'TOML', colorVar: 'lang-json' },
  '.xml': { icon: '⚙', color: 'hsl(16, 60%, 50%)', language: 'XML', colorVar: 'lang-html' },
  '.txt': { icon: '📝', color: 'hsl(220, 10%, 60%)', language: 'Text', colorVar: 'lang-other' },
  '.env': { icon: '🔒', color: 'hsl(48, 60%, 50%)', language: 'Env', colorVar: 'lang-other' },
  '.gitignore': { icon: '🚫', color: 'hsl(220, 10%, 50%)', language: 'Git', colorVar: 'lang-other' },
  '.lock': { icon: '🔒', color: 'hsl(220, 10%, 50%)', language: 'Lock', colorVar: 'lang-other' },
};

export function getFileTypeInfo(ext: string): FileTypeInfo {
  return FILE_TYPES[ext.toLowerCase()] || { icon: '📄', color: 'hsl(220, 10%, 50%)', language: 'Other', colorVar: 'lang-other' };
}

export function getExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return '.' + parts[parts.length - 1].toLowerCase();
}

export function getLanguageFromExt(ext: string): string {
  return getFileTypeInfo(ext).language;
}

export function isBinaryExtension(ext: string): boolean {
  const binary = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp', '.tiff',
    '.mp3', '.mp4', '.wav', '.avi', '.mov', '.mkv', '.flac',
    '.zip', '.tar', '.gz', '.rar', '.7z',
    '.exe', '.dll', '.so', '.dylib', '.bin',
    '.ttf', '.otf', '.woff', '.woff2', '.eot',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.sqlite', '.db'];
  return binary.includes(ext.toLowerCase());
}
