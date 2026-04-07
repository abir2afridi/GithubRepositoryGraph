export interface FileTypeInfo {
  icon: string;
  color: string;
  language: string;
  colorVar: string;
  iconUrl?: string;
}

const FILE_TYPES: Record<string, FileTypeInfo> = {
  '.ts': { icon: 'TS', color: 'hsl(210, 80%, 55%)', language: 'TypeScript', colorVar: 'lang-ts', iconUrl: 'https://img.icons8.com/color/48/typescript.png' },
  '.tsx': { icon: 'JSX', color: 'hsl(195, 80%, 55%)', language: 'React TSX', colorVar: 'lang-ts', iconUrl: 'https://img.icons8.com/color/48/react-native.png' },
  '.js': { icon: 'JS', color: 'hsl(48, 90%, 55%)', language: 'JavaScript', colorVar: 'lang-js', iconUrl: 'https://img.icons8.com/color/48/javascript--v1.png' },
  '.jsx': { icon: 'JSX', color: 'hsl(195, 80%, 55%)', language: 'React JSX', colorVar: 'lang-js', iconUrl: 'https://img.icons8.com/color/48/react-native.png' },
  '.mjs': { icon: 'JS', color: 'hsl(48, 90%, 55%)', language: 'JavaScript', colorVar: 'lang-js', iconUrl: 'https://img.icons8.com/color/48/javascript--v1.png' },
  '.cjs': { icon: 'JS', color: 'hsl(48, 90%, 55%)', language: 'JavaScript', colorVar: 'lang-js', iconUrl: 'https://img.icons8.com/color/48/javascript--v1.png' },
  '.html': { icon: 'HTM', color: 'hsl(16, 90%, 55%)', language: 'HTML', colorVar: 'lang-html', iconUrl: 'https://img.icons8.com/color/48/html-5--v1.png' },
  '.htm': { icon: 'HTM', color: 'hsl(16, 90%, 55%)', language: 'HTML', colorVar: 'lang-html', iconUrl: 'https://img.icons8.com/color/48/html-5--v1.png' },
  '.css': { icon: 'CSS', color: 'hsl(210, 90%, 55%)', language: 'CSS', colorVar: 'lang-css', iconUrl: 'https://img.icons8.com/color/48/css3.png' },
  '.scss': { icon: 'CSS', color: 'hsl(330, 70%, 55%)', language: 'SCSS', colorVar: 'lang-css', iconUrl: 'https://img.icons8.com/color/48/sass.png' },
  '.less': { icon: 'CSS', color: 'hsl(210, 60%, 45%)', language: 'LESS', colorVar: 'lang-css', iconUrl: 'https://img.icons8.com/color/48/css3.png' },
  '.json': { icon: '{ }', color: 'hsl(220, 10%, 60%)', language: 'JSON', colorVar: 'lang-json', iconUrl: 'https://img.icons8.com/color/48/json.png' },
  '.py': { icon: 'PY', color: 'hsl(120, 50%, 50%)', language: 'Python', colorVar: 'lang-py', iconUrl: 'https://img.icons8.com/color/48/python--v1.png' },
  '.php': { icon: 'PHP', color: 'hsl(260, 50%, 55%)', language: 'PHP', colorVar: 'lang-php', iconUrl: 'https://img.icons8.com/officel/48/php-logo.png' },
  '.vue': { icon: 'VUE', color: 'hsl(153, 65%, 50%)', language: 'Vue', colorVar: 'lang-vue', iconUrl: 'https://img.icons8.com/color/48/vue-js.png' },
  '.svelte': { icon: 'SVT', color: 'hsl(16, 90%, 55%)', language: 'Svelte', colorVar: 'lang-svelte', iconUrl: 'https://img.icons8.com/color/48/code.png' },
  '.md': { icon: 'MD', color: 'hsl(220, 10%, 70%)', language: 'Markdown', colorVar: 'lang-md', iconUrl: 'https://img.icons8.com/color/48/markdown.png' },
  '.mdx': { icon: 'MD', color: 'hsl(220, 10%, 70%)', language: 'MDX', colorVar: 'lang-md', iconUrl: 'https://img.icons8.com/color/48/markdown.png' },
  '.svg': { icon: 'IMG', color: 'hsl(280, 60%, 55%)', language: 'SVG', colorVar: 'lang-image', iconUrl: 'https://img.icons8.com/color/48/image-file.png' },
  '.png': { icon: 'IMG', color: 'hsl(280, 60%, 55%)', language: 'PNG', colorVar: 'lang-image', iconUrl: 'https://img.icons8.com/color/48/image-file.png' },
  '.jpg': { icon: 'IMG', color: 'hsl(280, 60%, 55%)', language: 'JPEG', colorVar: 'lang-image', iconUrl: 'https://img.icons8.com/color/48/image-file.png' },
  '.jpeg': { icon: 'IMG', color: 'hsl(280, 60%, 55%)', language: 'JPEG', colorVar: 'lang-image', iconUrl: 'https://img.icons8.com/color/48/image-file.png' },
  '.gif': { icon: 'IMG', color: 'hsl(280, 60%, 55%)', language: 'GIF', colorVar: 'lang-image', iconUrl: 'https://img.icons8.com/color/48/image-file.png' },
  '.webp': { icon: 'IMG', color: 'hsl(280, 60%, 55%)', language: 'WebP', colorVar: 'lang-image', iconUrl: 'https://img.icons8.com/color/48/image-file.png' },
  '.yaml': { icon: 'CFG', color: 'hsl(220, 10%, 60%)', language: 'YAML', colorVar: 'lang-json', iconUrl: 'https://img.icons8.com/color/48/settings.png' },
  '.yml': { icon: 'CFG', color: 'hsl(220, 10%, 60%)', language: 'YAML', colorVar: 'lang-json', iconUrl: 'https://img.icons8.com/color/48/settings.png' },
  '.toml': { icon: 'CFG', color: 'hsl(220, 10%, 60%)', language: 'TOML', colorVar: 'lang-json', iconUrl: 'https://img.icons8.com/color/48/settings.png' },
  '.xml': { icon: 'XML', color: 'hsl(16, 60%, 50%)', language: 'XML', colorVar: 'lang-html', iconUrl: 'https://img.icons8.com/color/48/xml.png' },
  '.txt': { icon: 'TXT', color: 'hsl(220, 10%, 60%)', language: 'Text', colorVar: 'lang-other', iconUrl: 'https://img.icons8.com/color/48/txt.png' },
  '.env': { icon: 'ENV', color: 'hsl(48, 60%, 50%)', language: 'Env', colorVar: 'lang-other', iconUrl: 'https://img.icons8.com/color/48/database.png' },
  '.gitignore': { icon: 'GIT', color: 'hsl(220, 10%, 50%)', language: 'Git', colorVar: 'lang-other', iconUrl: 'https://img.icons8.com/color/48/git.png' },
  '.lock': { icon: 'LCK', color: 'hsl(220, 10%, 50%)', language: 'Lock', colorVar: 'lang-other', iconUrl: 'https://img.icons8.com/color/48/padlock.png' },
};

export function getFileTypeInfo(ext: string): FileTypeInfo {
  return FILE_TYPES[ext.toLowerCase()] || { icon: 'DOC', color: 'hsl(220, 10%, 50%)', language: 'Other', colorVar: 'lang-other', iconUrl: 'https://img.icons8.com/color/48/file.png' };
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
