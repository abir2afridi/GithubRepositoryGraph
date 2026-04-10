import React, { useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '@/store/useStore';
import { getFileTypeInfo } from '@/lib/fileIcons';
import { computeComplexity, detectOrphans, extractCodeNotes, detectTestFiles, detectConfigFiles } from '@/lib/analysis';
import { 
  ArrowLeft, 
  ArrowRight, 
  X, 
  BarChart, 
  ChevronRight, 
  Package, 
  Box, 
  Ruler,
  ChevronDown,
  Activity,
  Ghost,
  MessageSquareWarning,
  Tag
} from 'lucide-react';

const LANG_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
  '.html': 'html', '.htm': 'html', '.css': 'css', '.scss': 'scss', '.less': 'less',
  '.json': 'json', '.md': 'markdown', '.mdx': 'markdown', '.py': 'python',
  '.php': 'php', '.xml': 'xml', '.yaml': 'yaml', '.yml': 'yaml', '.vue': 'html',
  '.svelte': 'html', '.svg': 'xml', '.toml': 'ini', '.txt': 'plaintext',
};

export function CodeViewPanel() {
  const { project, codeViewOpen, codeViewFile, closeCodeView, navigateCode,
          codeHistory, codeHistoryIndex, openCodeView, theme } = useStore();

  const file = useMemo(() => {
    if (!codeViewOpen || !codeViewFile || !project) return null;
    return project.files.find(f => f.path === codeViewFile) || null;
  }, [codeViewOpen, codeViewFile, project]);

  const outgoing = useMemo(() => project?.dependencies.filter(d => d.source === codeViewFile) ?? [], [project, codeViewFile]);
  const incoming = useMemo(() => project?.dependencies.filter(d => d.target === codeViewFile && d.resolved) ?? [], [project, codeViewFile]);

  const [showImports, setShowImports] = React.useState(true);
  const [showNotes, setShowNotes] = React.useState(true);

  // Advanced file metrics
  const complexityLevel = useMemo(() => {
    if (!file || file.isBinary) return null;
    const res = computeComplexity([file]);
    return res.length > 0 ? res[0] : null;
  }, [file]);

  const isOrphan = useMemo(() => {
    if (!project || !file) return false;
    return detectOrphans([file], project.dependencies, project.entryPoints).includes(file.path);
  }, [project, file]);

  const codeNotes = useMemo(() => {
    if (!file || file.isBinary) return [];
    return extractCodeNotes([file]);
  }, [file]);

  const fileArchetype = useMemo(() => {
    if (!file) return 'UNKNOWN';
    if (file.isBinary) return 'BINARY PAYLOAD';
    if (detectTestFiles([file]).length > 0) return 'TEST SUITE';
    if (detectConfigFiles([file]).length > 0) return 'CONFIGURATION';
    if (project?.entryPoints.includes(file.path)) return 'ENTRY POINT';
    return 'SOURCE MODULE';
  }, [file, project]);

  // Chain from root to this file
  const chainPath = useMemo(() => {
    if (!project?.fileOrder || !codeViewFile) return [];
    const order = project.fileOrder.get(codeViewFile);
    if (!order) return [];

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
    <div className="h-full bg-card border-l border-border flex flex-col pointer-events-auto" style={{ width: 560 }}>
      {/* Top bar */}
      <div className="flex items-center gap-1.5 px-4 py-4 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
        <button onClick={() => navigateCode('back')} disabled={codeHistoryIndex <= 0}
          className="p-1.5 rounded-md hover:bg-secondary disabled:opacity-20 transition-all active:scale-95 text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={() => navigateCode('forward')} disabled={codeHistoryIndex >= codeHistory.length - 1}
          className="p-1.5 rounded-md hover:bg-secondary disabled:opacity-20 transition-all active:scale-95 text-foreground">
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <div className="flex-1 min-w-0 mx-3">
          <div className="flex items-center gap-0.5 text-sm font-mono truncate text-foreground/70 tracking-tight">
            {codeViewFile!.split('/').map((part, i, arr) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-border mx-1.5 opacity-50">/</span>}
                <span className={i === arr.length - 1 ? 'text-primary font-black text-base' : 'hover:text-foreground cursor-default transition-colors'}>{part}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <span className="px-3 py-1.5 rounded text-[11px] font-black font-mono flex-shrink-0 flex items-center gap-1.5 border"
          style={{ borderColor: `hsl(var(--${info.colorVar}) / 0.5)`, color: `hsl(var(--${info.colorVar}))` }}>
          {info.iconUrl && <img src={info.iconUrl} alt={info.language} className="w-3.5 h-3.5 object-contain" />}
          <span className="uppercase">{info.language}</span>
        </span>
        <button onClick={closeCodeView} className="p-1.5 rounded-md hover:bg-destructive hover:text-destructive-foreground text-foreground/60 transition-all active:scale-95 ml-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* File info bar + Extended Metrics */}
      <div className="flex flex-col border-b border-indigo-500/20 bg-indigo-500/5 flex-shrink-0">
         <div className="flex items-center gap-4 px-4 py-3 text-xs font-black uppercase tracking-wider flex-wrap text-foreground border-b border-indigo-500/20">
           {fileOrder && <span className="text-primary bg-primary/10 px-2 py-0.5 border border-primary/20 rounded-sm">ORDER::{fileOrder}</span>}
           <span className="text-foreground/90">{file.name}</span>
           <span className="text-foreground/40">•</span>
           <span className="text-foreground/80 font-mono">{formatSize(file.size)}</span>
           <span className="text-foreground/40">•</span>
           <span className="text-foreground/80 font-mono">{file.lineCount} LINES</span>
           <div className="flex-1" />
           <div className="flex items-center gap-2 bg-background px-3 py-1.5 border border-border/60 rounded flex-shrink-0 shadow-sm text-xs font-mono">
             <span className="text-foreground/60">ARCHETYPE:</span>
             <span className={`px-1 rounded ${
               fileArchetype === 'TEST SUITE' ? 'bg-success/20 text-success' : 
               fileArchetype === 'CONFIGURATION' ? 'bg-warn/20 text-warn' : 
               fileArchetype === 'ENTRY POINT' ? 'bg-accent/20 text-accent' : 
               'text-primary font-black'
             }`}>{fileArchetype}</span>
           </div>
         </div>
         
         <div className="flex items-center gap-5 px-4 py-3 bg-slate-500/5 border-b border-slate-500/20">
            {complexityLevel && (
               <div className="flex items-center gap-2" title="Code Complexity Score">
                  <Activity className={`w-4 h-4 ${complexityLevel.level === 'Critical' ? 'text-destructive' : complexityLevel.level === 'High' ? 'text-warn' : 'text-primary'}`} />
                  <span className={`text-xs font-mono font-black uppercase tracking-wider ${complexityLevel.level === 'Critical' ? 'text-destructive' : 'text-foreground/80'}`}>
                     CX::{complexityLevel.score} <span className="opacity-60 font-semibold ml-1">[{complexityLevel.level}]</span>
                  </span>
               </div>
            )}
            {isOrphan && (
               <div className="flex items-center gap-2 bg-warn/10 border border-warn/20 px-2 py-1 rounded-sm" title="This file is actively present but unlinked in the dependency graph">
                  <Ghost className="w-4 h-4 text-warn" />
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-warn">Orphan_State</span>
               </div>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-primary font-mono text-sm font-black">↓ {outgoing.length} OUT</span>
              <span className="text-accent font-mono text-sm font-black">↑ {incoming.length} IN</span>
            </div>
         </div>

         <div className="flex flex-col gap-1.5 px-4 py-2.5 bg-secondary/5 border-b border-border/20 text-[10px] font-mono tracking-widest text-foreground/70 shadow-inner">
            <div className="flex items-center justify-between">
               <span className="opacity-60">COMPUTATIONAL_WEIGHT:</span>
               <span className="font-bold text-foreground text-right">{Math.round((file.size / project.files.reduce((a,b)=>a+b.size,0)) * 10000) / 100}% OF ROOT</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="opacity-60">CENTRALITY_INDEX:</span>
               <span className="font-bold text-foreground text-right">{((incoming.length + outgoing.length) / Math.max(1, project.dependencies.length) * 100).toFixed(2)}% NODE IMPACT</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="opacity-60">IS_BINARY:</span>
               <span className={`font-bold text-right ${file.isBinary ? 'text-warn' : 'text-success'}`}>{file.isBinary ? 'TRUE' : 'FALSE'}</span>
            </div>
         </div>
      </div>

      <div className="flex-shrink-0 overflow-y-auto max-h-[50vh] scrollbar-thin flex flex-col">
        {/* Chain position */}
        {chainPath.length > 1 && (
          <div className="px-4 py-3 border-b border-fuchsia-500/20 bg-fuchsia-500/5 flex items-center gap-1.5 overflow-x-auto scrollbar-thin flex-shrink-0">
            <BarChart className="w-4 h-4 text-fuchsia-500/40 mr-1 rotate-90 flex-shrink-0" />
            {chainPath.map((p, i) => {
              const order = project.fileOrder?.get(p);
              const name = p.split('/').pop();
              return (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-foreground/30 mx-0.5 flex-shrink-0" />}
                  <button onClick={() => openCodeView(p)}
                    className={`text-xs font-black font-mono px-2 py-1.5 rounded-sm border transition-all flex-shrink-0 shadow-sm ${
                      p === codeViewFile 
                        ? 'text-primary border-primary/50 bg-primary/10' 
                        : 'text-foreground/70 border-transparent hover:border-border hover:bg-secondary hover:text-foreground'
                    }`}>
                    {order && <span className="text-[10px] mr-1.5 opacity-50">#{order}</span>}{name}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Code Notes (TODOs, FIXMEs) */}
        {codeNotes.length > 0 && (
          <div className="border-b border-amber-500/20 flex-shrink-0">
            <button onClick={() => setShowNotes(!showNotes)}
              className="w-full text-left px-5 py-3 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500 bg-amber-500/10 font-black flex items-center gap-2 hover:bg-amber-500/20 transition-colors">
              {showNotes ? <ChevronDown className="w-4 h-4 text-amber-500" /> : <ChevronRight className="w-4 h-4 text-amber-500" />}
              <MessageSquareWarning className="w-4 h-4 text-amber-500" />
              Source Analysis Notes ({codeNotes.length})
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${showNotes ? 'max-h-[250px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="overflow-y-auto max-h-[250px] scrollbar-thin bg-amber-500/5 divide-y divide-amber-500/10">
                {codeNotes.map((note, i) => (
                  <div key={i} className="px-6 py-3 hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-black font-mono tracking-wider ${
                        note.type === 'TODO' ? 'bg-primary/20 text-primary border border-primary/30' :
                        note.type === 'FIXME' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                        note.type === 'HACK' ? 'bg-warn/20 text-warn border border-warn/30' :
                        'bg-foreground/10 text-foreground/80'
                      }`}>{note.type}</span>
                      <span className="text-xs font-mono text-foreground/50 ml-auto font-semibold">L::{note.line}</span>
                    </div>
                    <code className="text-sm text-foreground/90 font-mono block pl-3 border-l-2 border-border/40 whitespace-pre-wrap break-all leading-relaxed">{note.text}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Import details (collapsible) */}
        {(outgoing.length > 0 || incoming.length > 0) && (
          <div className="border-b border-emerald-500/20 flex-shrink-0">
            <button onClick={() => setShowImports(!showImports)}
              className="w-full text-left px-5 py-3 text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-500 bg-emerald-500/10 font-black flex items-center gap-2 hover:bg-emerald-500/20 transition-colors">
              {showImports ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-emerald-500" />}
              <Tag className="w-4 h-4 text-emerald-500" />
              I/O Protocol Details
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${showImports ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`} style={{ contentVisibility: showImports ? 'visible' : 'hidden' }}>
              <div className="overflow-y-auto max-h-[500px] scrollbar-thin bg-emerald-500/5">
                {outgoing.length > 0 && (
                  <div className="mb-2">
                    <div className="px-5 py-2.5 text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 tracking-widest border-y border-emerald-500/20 sticky top-0 z-10 shadow-sm backdrop-blur-md">↓ {outgoing.length} External Imports (What this file uses)</div>
                    <div className="divide-y divide-border/10">
                      {outgoing.map((dep, i) => (
                        <div key={i} className="px-5 py-3 hover:bg-secondary/10 transition-colors">
                          <div className="flex justify-between items-start mb-1.5">
                            <button onClick={() => { if (dep.resolved) openCodeView(dep.target); }}
                              className={`flex items-center gap-2.5 hover:text-primary transition-colors text-left ${!dep.resolved ? 'opacity-40' : 'cursor-pointer text-foreground font-semibold'}`}>
                              <div className={`w-1.5 h-4 rounded-full flex-shrink-0 ${dep.resolved ? 'bg-primary shadow-[0_0_5px_rgba(var(--primary),0.5)]' : dep.isExternal ? 'bg-warn' : 'bg-destructive'}`} />
                              <span className="truncate flex-1 tracking-tight text-sm font-mono">{dep.isExternal ? dep.target : dep.target.split('/').pop()}</span>
                              <span title="NPM Package">{dep.isExternal && <Package className="w-4 h-4 text-warn" />}</span>
                            </button>
                            <span className="text-xs text-foreground/60 px-2 py-0.5 bg-background border border-border/40 rounded uppercase tracking-wider whitespace-nowrap font-semibold">{dep.type} • L{dep.line}</span>
                          </div>
                          {dep.raw && (
                            <div className="pl-4 mt-2 border-l-2 border-primary/20 ml-1.5">
                              <span className="text-[11px] text-primary/70 uppercase font-black block mb-1 tracking-widest">Import Statement:</span>
                              <div className="text-sm text-foreground/90 bg-background/80 border border-border/30 px-3 py-2 rounded font-mono whitespace-pre-wrap break-all inline-block max-w-full leading-relaxed">
                                {dep.raw}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {incoming.length > 0 && (
                  <div>
                    <div className="px-5 py-2.5 text-xs font-black uppercase text-teal-700 dark:text-teal-400 bg-teal-500/10 tracking-widest border-y border-teal-500/20 sticky top-0 z-10 shadow-sm backdrop-blur-md">↑ {incoming.length} Consumers (Who uses this file)</div>
                    <div className="divide-y divide-border/10">
                      {incoming.map((dep, i) => (
                        <div key={i} className="px-5 py-3 hover:bg-secondary/10 transition-colors">
                          <div className="flex justify-between items-start mb-1.5">
                            <button onClick={() => openCodeView(dep.source)}
                              className="flex items-center gap-2.5 hover:text-primary transition-colors cursor-pointer text-foreground font-semibold text-left">
                              <div className="w-1.5 h-4 rounded-full flex-shrink-0 bg-accent shadow-[0_0_5px_rgba(var(--accent),0.5)]" />
                              <span className="truncate flex-1 tracking-tight text-sm font-mono">{dep.source.split('/').pop()}</span>
                              <ChevronRight className="w-4 h-4 ml-1 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </button>
                            <span className="text-xs text-foreground/60 px-2 py-0.5 bg-background border border-border/40 rounded uppercase tracking-wider whitespace-nowrap font-semibold">CONSUMER • L{dep.line}</span>
                          </div>
                          {dep.raw && (
                            <div className="pl-4 mt-2 border-l-2 border-accent/30 ml-1.5">
                              <span className="text-[11px] text-accent/70 uppercase font-black block mb-1 tracking-widest">How they import this:</span>
                              <div className="text-sm text-foreground/90 bg-background/80 border border-border/30 px-3 py-2 rounded font-mono whitespace-pre-wrap break-all inline-block max-w-full leading-relaxed">
                                {dep.raw}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden bg-background">
        {file.isBinary ? (
          <div className="flex flex-col items-center justify-center h-full text-foreground/60 gap-4">
            <Box className="w-16 h-16 text-primary opacity-30 drop-shadow-[0_0_15px_rgba(var(--primary),0.2)]" />
            <div className="text-center">
                <span className="text-sm font-black uppercase tracking-[0.2em] block text-foreground">Payload::Binary</span>
                <span className="text-xs opacity-60 font-mono mt-1 block">{file.name} • {formatSize(file.size)}</span>
            </div>
          </div>
        ) : file.size > 1000000 ? (
          <div className="flex flex-col items-center justify-center h-full text-foreground/60 gap-4">
            <Ruler className="w-16 h-16 text-destructive opacity-30 drop-shadow-[0_0_15px_rgba(var(--destructive),0.2)]" />
            <div className="text-center">
                <span className="text-sm font-black uppercase tracking-[0.2em] block text-destructive">Buffer::Overflow</span>
                <span className="text-xs opacity-60 font-mono mt-1 block text-foreground">Stream exceeds 1MB limitation ({formatSize(file.size)})</span>
            </div>
          </div>
        ) : (
          <Editor
            height="100%" language={monacoLang} value={file.content} theme={theme === 'light' || theme === 'pastel' ? 'vs' : 'vs-dark'}
            options={{
              readOnly: true, minimap: { enabled: false }, fontSize: 14,
              fontFamily: 'JetBrains Mono, "Fira Code", monospace', lineNumbers: 'on',
              scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 16, bottom: 16 },
              renderLineHighlight: 'none', overviewRulerBorder: false,
              lineDecorationsWidth: 24, folding: true, smoothScrolling: true,
              glyphMargin: true,
              cursorBlinking: 'smooth',
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
