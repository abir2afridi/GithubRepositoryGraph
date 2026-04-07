import React, { useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '@/store/useStore';
import { getFileTypeInfo } from '@/lib/fileIcons';

const LANG_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
  '.html': 'html', '.htm': 'html', '.css': 'css', '.scss': 'scss', '.less': 'less',
  '.json': 'json', '.md': 'markdown', '.mdx': 'markdown', '.py': 'python',
  '.php': 'php', '.xml': 'xml', '.yaml': 'yaml', '.yml': 'yaml', '.vue': 'html',
  '.svelte': 'html', '.svg': 'xml', '.toml': 'ini', '.txt': 'plaintext',
};

export function CodeViewPanel() {
  const { project, codeViewOpen, codeViewFile, closeCodeView, navigateCode,
          codeHistory, codeHistoryIndex, openCodeView } = useStore();

  const file = useMemo(() => {
    if (!codeViewOpen || !codeViewFile || !project) return null;
    return project.files.find(f => f.path === codeViewFile) || null;
  }, [codeViewOpen, codeViewFile, project]);

  const outgoing = useMemo(() => project?.dependencies.filter(d => d.source === codeViewFile) ?? [], [project, codeViewFile]);
  const incoming = useMemo(() => project?.dependencies.filter(d => d.target === codeViewFile && d.resolved) ?? [], [project, codeViewFile]);

  const [showImports, setShowImports] = React.useState(true);

  // Chain from root to this file
  const chainPath = useMemo(() => {
    if (!project?.fileOrder || !codeViewFile) return [];
    const order = project.fileOrder.get(codeViewFile);
    if (!order) return [];

    // BFS backwards to find path from entry to this file
    const parentMap = new Map<string, string>();
    const visited = new Set<string>();
    const entries = project.entryPoints;
    const queue = [...entries];
    entries.forEach(e => visited.add(e));

    let found = false;
    while (queue.length > 0 && !found) {
      const current = queue.shift()!;
      if (current === codeViewFile) { found = true; break; }
      const children = project.dependencies.filter(d => d.source === current && d.resolved && !d.isExternal);
      for (const dep of children) {
        if (!visited.has(dep.target)) {
          visited.add(dep.target);
          parentMap.set(dep.target, current);
          queue.push(dep.target);
        }
      }
    }

    if (!found) return [codeViewFile];
    const path = [codeViewFile];
    let cur = codeViewFile;
    while (parentMap.has(cur)) { cur = parentMap.get(cur)!; path.unshift(cur); }
    return path;
  }, [project, codeViewFile]);

  if (!file || !codeViewOpen || !project) return null;

  const info = getFileTypeInfo(file.extension);
  const monacoLang = LANG_MAP[file.extension] || 'plaintext';
  const fileOrder = project.fileOrder?.get(file.path);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <div className="h-full bg-card border-l border-border flex flex-col" style={{ width: 520 }}>
      {/* Top bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-surface-elevated flex-shrink-0">
        <button onClick={() => navigateCode('back')} disabled={codeHistoryIndex <= 0}
          className="p-1.5 rounded-md hover:bg-secondary disabled:opacity-20 text-xs transition-all active:scale-90">←</button>
        <button onClick={() => navigateCode('forward')} disabled={codeHistoryIndex >= codeHistory.length - 1}
          className="p-1.5 rounded-md hover:bg-secondary disabled:opacity-20 text-xs transition-all active:scale-90">→</button>
        
        <div className="flex-1 min-w-0 mx-1">
          <div className="flex items-center gap-0.5 text-xs font-mono truncate text-muted-foreground/60">
            {codeViewFile!.split('/').map((part, i, arr) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-border/60 mx-0.5">/</span>}
                <span className={i === arr.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground/80 cursor-default'}>{part}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium flex-shrink-0"
          style={{ backgroundColor: info.color + '15', color: info.color }}>{info.language}</span>
        <button onClick={closeCodeView} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-90 ml-1">✕</button>
      </div>

      {/* File info bar */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border/60 bg-secondary/20 text-xs flex-shrink-0 flex-wrap">
        {fileOrder && <span className="text-primary font-mono font-bold">#{fileOrder}</span>}
        <span className="font-medium text-foreground/80">{file.name}</span>
        <span className="text-muted-foreground/40">•</span>
        <span className="text-muted-foreground/50 font-mono">{formatSize(file.size)}</span>
        <span className="text-muted-foreground/40">•</span>
        <span className="text-muted-foreground/50 font-mono">{file.lineCount} lines</span>
        <div className="flex-1" />
        <span className="text-primary font-mono font-semibold">↓{outgoing.length}</span>
        <span className="text-accent font-mono font-semibold">↑{incoming.length}</span>
      </div>

      {/* Chain position */}
      {chainPath.length > 1 && (
        <div className="px-3 py-1.5 border-b border-border/40 bg-secondary/10 flex items-center gap-1 overflow-x-auto scrollbar-thin flex-shrink-0">
          <span className="text-[10px] text-muted-foreground/40 mr-1">📊</span>
          {chainPath.map((p, i) => {
            const order = project.fileOrder?.get(p);
            const name = p.split('/').pop();
            return (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-[10px] text-muted-foreground/30 mx-0.5">→</span>}
                <button onClick={() => openCodeView(p)}
                  className={`text-[10px] font-mono px-1 py-0.5 rounded hover:bg-secondary/50 transition-colors flex-shrink-0 ${p === codeViewFile ? 'text-primary font-semibold bg-primary/10' : 'text-muted-foreground/60'}`}>
                  {order && <span className="text-[9px] mr-0.5">#{order}</span>}{name}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Import details (collapsible) */}
      {(outgoing.length > 0 || incoming.length > 0) && (
        <div className="border-b border-border/60 flex-shrink-0">
          <button onClick={() => setShowImports(!showImports)}
            className="w-full text-left px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50 bg-secondary/15 font-semibold flex items-center gap-2 hover:text-muted-foreground transition-colors">
            <span className={`transition-transform ${showImports ? 'rotate-90' : ''}`}>▶</span>
            Import Details
          </button>
          {showImports && (
            <div className="max-h-44 overflow-y-auto scrollbar-thin">
              {outgoing.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] text-muted-foreground/40 bg-secondary/10">↓ {outgoing.length} imports</div>
                  {outgoing.map((dep, i) => (
                    <button key={i} onClick={() => { if (dep.resolved) openCodeView(dep.target); }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-secondary/30 border-b border-border/20 transition-colors ${!dep.resolved ? 'opacity-40' : 'cursor-pointer'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dep.resolved ? 'bg-primary' : dep.isExternal ? 'bg-warn' : 'bg-destructive'}`} />
                      <span className="font-mono truncate flex-1 text-foreground/80">{dep.target.split('/').pop() || dep.target}</span>
                      <span className="text-[10px] text-muted-foreground/40 font-mono">L{dep.line}</span>
                      {dep.resolved && <span className="text-[10px] text-primary font-medium">→</span>}
                      {dep.isExternal && <span className="text-[10px]">📦</span>}
                    </button>
                  ))}
                </div>
              )}
              {incoming.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] text-muted-foreground/40 bg-secondary/10">↑ Used by {incoming.length} files</div>
                  {incoming.map((dep, i) => (
                    <button key={i} onClick={() => openCodeView(dep.source)}
                      className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-secondary/30 border-b border-border/20 transition-colors cursor-pointer">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-accent" />
                      <span className="font-mono truncate flex-1 text-foreground/80">{dep.source.split('/').pop()}</span>
                      <span className="text-[10px] text-muted-foreground/40 font-mono">L{dep.line}</span>
                      <span className="text-[10px] text-accent font-medium">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {file.isBinary ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-2">
            <span className="text-2xl">📦</span>
            <span className="text-sm font-medium">Binary file — no preview available</span>
            <span className="text-[11px] text-muted-foreground/30 font-mono">{file.name} • {formatSize(file.size)} • {file.extension}</span>
          </div>
        ) : file.size > 1000000 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-2">
            <span className="text-2xl">📏</span>
            <span className="text-sm font-medium">File too large to preview ({formatSize(file.size)})</span>
          </div>
        ) : (
          <Editor
            height="100%" language={monacoLang} value={file.content} theme="vs-dark"
            options={{
              readOnly: true, minimap: { enabled: false }, fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace', lineNumbers: 'on',
              scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12, bottom: 12 },
              renderLineHighlight: 'none', overviewRulerBorder: false,
              lineDecorationsWidth: 24, folding: true, smoothScrolling: true,
            }}
            onMount={(editor) => {
              const decorations = outgoing.map(dep => ({
                range: { startLineNumber: dep.line, startColumn: 1, endLineNumber: dep.line, endColumn: 1 },
                options: {
                  isWholeLine: true,
                  linesDecorationsClassName: 'dep-line-decoration',
                  glyphMarginClassName: 'dep-glyph',
                },
              }));
              editor.createDecorationsCollection(decorations);
            }}
          />
        )}
      </div>
    </div>
  );
}
