import React, { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { getFileTypeInfo } from '@/lib/fileIcons';
import { detectCircularDeps } from '@/lib/projectLoader';
import { extractCodeNotes, computeComplexity, detectOrphans, detectTestFiles, detectConfigFiles, detectCIPipelines, extractEnvKeys } from '@/lib/analysis';

export function IntelligencePanel() {
  const { project, sidebarOpen, openCodeView, setSelectedNode, toggleRepoInfo } = useStore();
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'connections'>('name');
  const [fileFilter, setFileFilter] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>('overview');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

  const textFiles = useMemo(() => project?.files.filter(f => !f.isBinary) ?? [], [project]);
  const totalSize = useMemo(() => project?.files.reduce((a, f) => a + f.size, 0) ?? 0, [project]);
  const totalLines = useMemo(() => textFiles.reduce((a, f) => a + f.lineCount, 0), [textFiles]);
  const unresolvedDeps = useMemo(() => project?.dependencies.filter(d => !d.resolved && !d.isExternal) ?? [], [project]);
  const externalDeps = useMemo(() => project?.dependencies.filter(d => d.isExternal) ?? [], [project]);

  const connectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    project?.dependencies.forEach(d => {
      counts.set(d.source, (counts.get(d.source) || 0) + 1);
      if (d.resolved) counts.set(d.target, (counts.get(d.target) || 0) + 1);
    });
    return counts;
  }, [project]);

  const importCounts = useMemo(() => {
    const counts = new Map<string, number>();
    project?.dependencies.filter(d => d.resolved && !d.isExternal).forEach(d => {
      counts.set(d.target, (counts.get(d.target) || 0) + 1);
    });
    return counts;
  }, [project]);

  const langBreakdown = useMemo(() => {
    const counts = new Map<string, { count: number; size: number; lines: number; ext: string }>();
    textFiles.forEach(f => {
      const info = getFileTypeInfo(f.extension);
      const key = info.language;
      const prev = counts.get(key) || { count: 0, size: 0, lines: 0, ext: f.extension };
      counts.set(key, { count: prev.count + 1, size: prev.size + f.size, lines: prev.lines + f.lineCount, ext: prev.ext });
    });
    return [...counts.entries()].sort((a, b) => b[1].size - a[1].size);
  }, [textFiles]);

  const extStats = useMemo(() => {
    const counts = new Map<string, { count: number; size: number }>();
    project?.files.forEach(f => {
      const ext = f.extension || '(none)';
      const prev = counts.get(ext) || { count: 0, size: 0 };
      counts.set(ext, { count: prev.count + 1, size: prev.size + f.size });
    });
    return [...counts.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [project]);

  const topConnected = useMemo(() => {
    return [...connectionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [connectionCounts]);

  const circularDeps = useMemo(() => {
    if (!project) return [];
    return detectCircularDeps(project.dependencies).slice(0, 5);
  }, [project]);

  // New analysis data
  const codeNotes = useMemo(() => project ? extractCodeNotes(project.files) : [], [project]);
  const complexityReport = useMemo(() => project ? computeComplexity(project.files).slice(0, 10) : [], [project]);
  const orphanFiles = useMemo(() => project ? detectOrphans(project.files, project.dependencies, project.entryPoints) : [], [project]);
  const testFiles = useMemo(() => project ? detectTestFiles(project.files) : [], [project]);
  const configFiles = useMemo(() => project ? detectConfigFiles(project.files) : [], [project]);
  const ciPipelines = useMemo(() => project ? detectCIPipelines(project.files) : [], [project]);
  const envKeys = useMemo(() => project ? extractEnvKeys(project.files) : [], [project]);

  const sortedFiles = useMemo(() => {
    let files = textFiles.filter(f => !fileFilter || f.path.toLowerCase().includes(fileFilter.toLowerCase()));
    switch (sortBy) {
      case 'size': return files.sort((a, b) => b.size - a.size);
      case 'connections': return files.sort((a, b) => (connectionCounts.get(b.path) || 0) - (connectionCounts.get(a.path) || 0));
      default: return files.sort((a, b) => a.path.localeCompare(b.path));
    }
  }, [textFiles, fileFilter, sortBy, connectionCounts]);

  // Folder tree
  const folderTree = useMemo(() => {
    if (!project) return null;
    interface TreeNode { name: string; path: string; children: TreeNode[]; file?: typeof project.files[0] }
    const root: TreeNode = { name: '', path: '', children: [] };
    project.files.forEach(f => {
      const parts = f.path.split('/');
      let current = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const folderPath = parts.slice(0, i + 1).join('/');
        let child = current.children.find(c => c.name === parts[i] && !c.file);
        if (!child) {
          child = { name: parts[i], path: folderPath, children: [] };
          current.children.push(child);
        }
        current = child;
      }
      current.children.push({ name: f.name, path: f.path, children: [], file: f });
    });
    const sortTree = (node: TreeNode) => {
      node.children.sort((a, b) => {
        if (a.file && !b.file) return 1;
        if (!a.file && b.file) return -1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    };
    sortTree(root);
    return root;
  }, [project]);

  const externalPackages = useMemo(() => {
    if (!project?.packageJson) return { deps: [] as [string, string][], devDeps: [] as [string, string][], usageCount: new Map<string, number>() };
    const usageCount = new Map<string, number>();
    externalDeps.forEach(d => {
      const pkg = d.target.split('/')[0];
      usageCount.set(pkg, (usageCount.get(pkg) || 0) + 1);
    });
    const deps = Object.entries(project.packageJson.dependencies || {}) as [string, string][];
    const devDeps = Object.entries(project.packageJson.devDependencies || {}) as [string, string][];
    return { deps, devDeps, usageCount };
  }, [project, externalDeps]);

  if (!project || !sidebarOpen) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const totalTextSize = textFiles.reduce((a, f) => a + f.size, 0);
  const meta = project.repoMeta;
  const folderCount = new Set(project.files.map(f => f.path.substring(0, f.path.lastIndexOf('/'))).filter(Boolean)).size;

  const toggle = (id: string) => setActiveSection(activeSection === id ? null : id);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderTree = (node: { name: string; path: string; children: any[]; file?: any }, depth = 0) => {
    if (node.file) {
      const info = getFileTypeInfo(node.file.extension);
      const order = project.fileOrder?.get(node.file.path);
      const isOrphan = orphanFiles.includes(node.file.path);
      const isTest = testFiles.includes(node.file.path);
      const isConfig = configFiles.includes(node.file.path);
      return (
        <button key={node.path} onClick={() => setSelectedNode(node.path)} onDoubleClick={() => openCodeView(node.path)}
          className="w-full text-left flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-secondary/40 transition-colors text-[11px]"
          style={{ paddingLeft: depth * 14 + 4 }}>
          <span style={{ color: info.color }} className="text-[10px] w-4 text-center flex-shrink-0">{info.icon}</span>
          <span className={`truncate flex-1 ${isOrphan ? 'text-muted-foreground/40' : 'text-foreground/80'}`}>{node.name}</span>
          {order && <span className="text-[9px] text-muted-foreground/40 font-mono">#{order}</span>}
          {node.file.isEntryPoint && <span className="text-[9px]">⚡</span>}
          {isTest && <span className="text-[9px]">🧪</span>}
          {isConfig && <span className="text-[9px]">⚙️</span>}
          {isOrphan && <span className="text-[9px]">⚫</span>}
        </button>
      );
    }
    const isExpanded = expandedFolders.has(node.path);
    const fileCount = countFilesRecursive(node);
    return (
      <div key={node.path}>
        <button onClick={() => toggleFolder(node.path)}
          className="w-full text-left flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-secondary/40 transition-colors text-[11px] font-medium"
          style={{ paddingLeft: depth * 14 + 4 }}>
          <span className="text-[10px] w-4 text-center flex-shrink-0">{isExpanded ? '📂' : '📁'}</span>
          <span className="truncate flex-1 text-foreground/80">{node.name}</span>
          <span className="text-[9px] text-muted-foreground/30 font-mono">{fileCount}</span>
        </button>
        {isExpanded && node.children.map((child: any) => renderTree(child, depth + 1))}
      </div>
    );
  };

  const countFilesRecursive = (node: any): number => {
    return node.children.reduce((sum: number, child: any) => {
      if (child.file) return sum + 1;
      return sum + countFilesRecursive(child);
    }, 0);
  };

  const Section = ({ id, title, badge, children }: { id: string; title: string; badge?: string | number; children: React.ReactNode }) => (
    <div className="border-b border-border/60 last:border-0">
      <button onClick={() => toggle(id)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-[10px] font-display font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors">
        <span className="flex items-center gap-2">
          {title}
          {badge !== undefined && <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-mono">{badge}</span>}
        </span>
        <span className={`text-[10px] transition-transform duration-200 ${activeSection === id ? 'rotate-90' : ''}`}>▶</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${activeSection === id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-3">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-card border-r border-border overflow-y-auto scrollbar-thin flex-shrink-0" style={{ width: 320 }} data-sidebar>
      {/* Header */}
      <div className="p-4 border-b border-border">
        {meta ? (
          <div className="flex items-center gap-3">
            <img src={meta.ownerAvatar} alt={meta.owner} className="w-9 h-9 rounded-full ring-1 ring-border" />
            <div className="min-w-0 flex-1">
              <button onClick={toggleRepoInfo} className="font-display font-bold text-sm truncate tracking-tight text-foreground hover:text-primary transition-colors block">
                {meta.repoName}
              </button>
              <a href={`https://github.com/${meta.owner}`} target="_blank" rel="noopener noreferrer"
                className="text-[11px] text-muted-foreground/50 font-mono hover:text-primary transition-colors">{meta.owner}</a>
            </div>
          </div>
        ) : (
          <h2 className="font-display font-bold text-base truncate tracking-tight">{project.name}</h2>
        )}
        {project.description && <p className="text-[11px] text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed">{project.description}</p>}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">{project.source === 'github' ? '🐙 GitHub' : '📁 Local'}</span>
          {project.branch && <span className="px-2 py-0.5 bg-secondary rounded text-[10px] text-muted-foreground">🔀 {project.branch}</span>}
          {meta && <span className="px-2 py-0.5 bg-secondary rounded text-[10px] text-muted-foreground">⭐ {meta.stars}</span>}
          {meta && <span className="px-2 py-0.5 bg-secondary rounded text-[10px] text-muted-foreground">🍴 {meta.forks}</span>}
        </div>
        {meta && (
          <button onClick={toggleRepoInfo} className="mt-2 text-[11px] text-primary hover:underline">View full repo info →</button>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-1.5 p-3 border-b border-border">
        {[
          { icon: '📁', label: 'Files', value: project.files.length },
          { icon: '🔗', label: 'Deps', value: project.dependencies.length },
          { icon: '⚡', label: 'Entry', value: project.entryPoints.length },
          { icon: '⚠️', label: 'Unresolved', value: unresolvedDeps.length },
          { icon: '📦', label: 'Packages', value: new Set(externalDeps.map(d => d.target.split('/')[0])).size },
          { icon: '📂', label: 'Folders', value: folderCount },
          { icon: '🔄', label: 'Circular', value: circularDeps.length },
          { icon: '⚫', label: 'Orphans', value: orphanFiles.length },
          { icon: '🧪', label: 'Tests', value: testFiles.length },
        ].map((stat, i) => (
          <div key={i} className={`bg-secondary/40 rounded-lg p-2 text-center hover:bg-secondary/60 transition-colors ${
            (stat.label === 'Unresolved' || stat.label === 'Circular') && stat.value > 0 ? 'ring-1 ring-destructive/20' : ''
          }`}>
            <div className="text-[10px] mb-0.5">{stat.icon}</div>
            <div className={`text-sm font-bold font-mono ${
              (stat.label === 'Unresolved' || stat.label === 'Circular') && stat.value > 0 ? 'text-destructive' : 'text-foreground'
            }`}>{stat.value}</div>
            <div className="text-[10px] text-muted-foreground/60">{stat.label}</div>
          </div>
        ))}
      </div>

      <Section id="overview" title="📊 Languages" badge={langBreakdown.length}>
        <div className="space-y-2.5">
          <div className="h-2.5 rounded-full overflow-hidden flex bg-secondary/30">
            {langBreakdown.map(([, data], i) => {
              const pct = (data.size / Math.max(1, totalTextSize)) * 100;
              const info = getFileTypeInfo(data.ext);
              return (
                <div key={i} style={{ width: `${pct}%`, backgroundColor: info.color }}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                  title={`${getFileTypeInfo(data.ext).language}: ${pct.toFixed(1)}%`} />
              );
            })}
          </div>
          {langBreakdown.map(([lang, data], i) => {
            const info = getFileTypeInfo(data.ext);
            const pct = (data.size / Math.max(1, totalTextSize)) * 100;
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                <span className="flex-1 truncate text-foreground/80">{lang}</span>
                <span className="text-muted-foreground/60 font-mono text-[11px]">{data.count}</span>
                <span className="text-muted-foreground/40 font-mono text-[11px]">{data.lines.toLocaleString()}L</span>
                <span className="text-muted-foreground font-mono text-[11px] w-10 text-right font-medium">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="filetypes" title="📄 File Types" badge={extStats.length}>
        <div className="space-y-0.5">
          {extStats.map(([ext, data], i) => {
            const info = getFileTypeInfo(ext);
            return (
              <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-1 rounded hover:bg-secondary/40 transition-colors">
                <span className="text-[10px] w-5 text-center" style={{ color: info.color }}>{info.icon}</span>
                <span className="font-mono flex-1 text-foreground/80">{ext || '(none)'}</span>
                <span className="text-muted-foreground/60 font-mono">{data.count}</span>
                <span className="text-muted-foreground font-mono w-14 text-right text-[11px]">{formatSize(data.size)}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="tree" title="🗂️ Folder Tree">
        <div className="max-h-72 overflow-y-auto scrollbar-thin">
          {folderTree && folderTree.children.map(child => renderTree(child, 0))}
        </div>
      </Section>

      <Section id="files" title="📂 File Browser" badge={sortedFiles.length}>
        <div className="space-y-2">
          <input value={fileFilter} onChange={e => setFileFilter(e.target.value)}
            placeholder="Filter files..." className="w-full px-2.5 py-1.5 text-xs bg-secondary/50 border border-border/60 rounded-lg font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/30" />
          <div className="flex gap-0.5 bg-secondary/30 rounded-lg p-0.5">
            {(['name', 'size', 'connections'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`flex-1 px-2 py-1 text-[10px] rounded-md font-medium transition-all ${sortBy === s ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-thin space-y-0.5">
            {sortedFiles.map(f => {
              const info = getFileTypeInfo(f.extension);
              const order = project.fileOrder?.get(f.path);
              const imports = project.dependencies.filter(d => d.source === f.path).length;
              const usedBy = importCounts.get(f.path) || 0;
              return (
                <button key={f.path} onClick={() => setSelectedNode(f.path)} onDoubleClick={() => openCodeView(f.path)}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-secondary/50 active:scale-[0.99] flex items-center gap-2 text-xs transition-all">
                  <span style={{ color: info.color }} className="text-[10px] w-4 text-center">{info.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground/90 flex items-center gap-1">
                      {f.isEntryPoint && <span className="text-warn text-[10px]">⚡</span>}
                      {f.name}
                    </div>
                    <div className="truncate text-[10px] text-muted-foreground/50 flex items-center gap-2">
                      <span>{f.path.substring(0, f.path.lastIndexOf('/'))}</span>
                      {order && <span className="text-primary/60">#{order}</span>}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground/40 font-mono text-right flex-shrink-0">
                    <div>↓{imports} ↑{usedBy}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section id="entry" title="⚡ Entry Points" badge={project.entryPoints.length}>
        <div className="space-y-1">
          {project.entryPoints.map((ep, i) => (
            <button key={i} onClick={() => { setSelectedNode(ep); openCodeView(ep); }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-secondary/50 text-xs flex items-center gap-2 transition-colors">
              <span className="text-warn text-[10px]">⚡</span>
              <span className="font-mono truncate text-foreground/80">{ep}</span>
              <span className="text-[9px] text-primary font-mono">#{project.fileOrder?.get(ep) || '?'}</span>
            </button>
          ))}
          {project.entryPoints.length === 0 && <span className="text-xs text-muted-foreground/50 italic">None detected</span>}
        </div>
      </Section>

      <Section id="deps" title="🔗 Dependencies" badge={topConnected.length}>
        <div className="space-y-3">
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-2 font-medium">Most Connected</h4>
            {topConnected.map(([path, count], i) => (
              <button key={i} onClick={() => setSelectedNode(path)}
                className="w-full flex items-center gap-2 text-xs py-1.5 px-1 rounded hover:bg-secondary/40 transition-colors">
                <span className="w-4 h-4 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                <span className="truncate flex-1 font-mono text-foreground/80">{path.split('/').pop()}</span>
                <span className="text-muted-foreground/60 font-mono text-[11px]">{count}</span>
              </button>
            ))}
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-2 font-medium">Most Imported</h4>
            {[...importCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, count], i) => (
              <button key={i} onClick={() => setSelectedNode(path)}
                className="w-full flex items-center gap-2 text-xs py-1.5 px-1 rounded hover:bg-secondary/40 transition-colors">
                <span className="w-4 h-4 rounded bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                <span className="truncate flex-1 font-mono text-foreground/80">{path.split('/').pop()}</span>
                <span className="text-muted-foreground/60 font-mono text-[11px]">↑{count}</span>
              </button>
            ))}
          </div>

          {circularDeps.length > 0 && (
            <div className="bg-destructive/[0.06] border border-destructive/20 rounded-lg p-2.5">
              <h4 className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1.5 flex items-center gap-1">⚠️ Circular Dependencies</h4>
              {circularDeps.map((cycle, i) => (
                <div key={i} className="text-[11px] font-mono text-destructive/80 truncate">{cycle.map(c => c.split('/').pop()).join(' → ')}</div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* TODO/FIXME Notes */}
      {codeNotes.length > 0 && (
        <Section id="todos" title="📝 Code Notes" badge={codeNotes.length}>
          <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-thin">
            {codeNotes.slice(0, 20).map((note, i) => (
              <button key={i} onClick={() => openCodeView(note.file)}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-secondary/40 text-[11px] flex items-start gap-2 transition-colors">
                <span className={`flex-shrink-0 font-bold ${
                  note.type === 'FIXME' ? 'text-destructive' : note.type === 'HACK' ? 'text-warn' : 'text-primary'
                }`}>{note.type === 'FIXME' ? '🔴' : note.type === 'HACK' ? '⚠️' : '📝'}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-foreground/70 truncate">{note.text}</div>
                  <div className="text-[10px] text-muted-foreground/40">{note.file.split('/').pop()}:{note.line}</div>
                </div>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Complexity Report */}
      {complexityReport.length > 0 && (
        <Section id="complexity" title="⚡ Complexity" badge={complexityReport.filter(c => c.level === 'High' || c.level === 'Critical').length}>
          <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-thin">
            {complexityReport.map((c, i) => (
              <button key={i} onClick={() => openCodeView(c.file)}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-secondary/40 text-[11px] flex items-center gap-2 transition-colors">
                <span className={`text-[10px] font-bold w-5 text-center ${
                  c.level === 'Critical' ? 'text-destructive' : c.level === 'High' ? 'text-warn' : c.level === 'Medium' ? 'text-warn/60' : 'text-success'
                }`}>{c.level === 'Critical' ? '🔴' : c.level === 'High' ? '🟠' : c.level === 'Medium' ? '🟡' : '🟢'}</span>
                <span className="truncate flex-1 font-mono text-foreground/80">{c.file.split('/').pop()}</span>
                <span className="text-muted-foreground/50 font-mono text-[10px]">{c.score}</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Orphan Files */}
      {orphanFiles.length > 0 && (
        <Section id="orphans" title="⚫ Orphan Files" badge={orphanFiles.length}>
          <div className="space-y-0.5 max-h-40 overflow-y-auto scrollbar-thin">
            <p className="text-[10px] text-muted-foreground/40 mb-2">Files with no imports and not imported by anyone</p>
            {orphanFiles.map((path, i) => (
              <button key={i} onClick={() => { setSelectedNode(path); openCodeView(path); }}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-secondary/40 text-[11px] flex items-center gap-2 transition-colors">
                <span className="text-[10px]">⚫</span>
                <span className="truncate font-mono text-muted-foreground/60">{path}</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* ENV Variables */}
      {envKeys.length > 0 && (
        <Section id="env" title="🔑 ENV Variables" badge={envKeys.reduce((s, e) => s + e.keys.length, 0)}>
          <div className="space-y-2">
            {envKeys.map((env, i) => (
              <div key={i}>
                <div className="text-[10px] text-muted-foreground/50 font-mono mb-1">{env.file}</div>
                {env.keys.map((key, j) => (
                  <div key={j} className="text-[11px] font-mono text-foreground/70 py-0.5 px-1">● {key}</div>
                ))}
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground/30 italic">Values hidden for security</p>
          </div>
        </Section>
      )}

      {/* CI/CD Pipelines */}
      {ciPipelines.length > 0 && (
        <Section id="cicd" title="⚙️ CI/CD Pipelines" badge={ciPipelines.length}>
          <div className="space-y-1">
            {ciPipelines.map((pipeline, i) => (
              <button key={i} onClick={() => openCodeView(pipeline.file)}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-secondary/40 text-[11px] flex items-start gap-2 transition-colors">
                <span className="text-[10px]">⚙️</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground/80">{pipeline.name}</div>
                  <div className="text-[10px] text-muted-foreground/40">
                    triggers: {pipeline.triggers.join(', ') || 'unknown'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section id="gitignore" title="📄 .gitignore">
        {project.gitignorePatterns.length > 0 ? (
          <div className="space-y-2">
            <div className="text-[10px] text-muted-foreground/50 mb-2">{project.gitignorePatterns.length} patterns found</div>
            <div className="space-y-0.5 max-h-40 overflow-y-auto scrollbar-thin">
              {project.gitignorePatterns.map((p, i) => {
                const type = p.endsWith('/') ? 'Directory' : p.includes('*') ? 'Wildcard' : p.startsWith('.') ? 'Hidden file' : 'File';
                return (
                  <div key={i} className="flex items-center gap-2 text-[11px] py-1 px-1 rounded hover:bg-secondary/30">
                    <span className="font-mono text-foreground/70 flex-1 truncate">{p}</span>
                    <span className="text-muted-foreground/40 text-[10px]">{type}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground/30 italic">Files exist locally but not in the repository</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50 italic">No .gitignore file detected</span>
        )}
      </Section>

      <Section id="packages" title="📦 External Packages" badge={externalPackages.deps.length}>
        {externalPackages.deps.length > 0 ? (
          <div className="space-y-3">
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1.5 font-medium">Dependencies</h4>
              <div className="space-y-0.5 max-h-40 overflow-y-auto scrollbar-thin">
                {externalPackages.deps.map(([name, ver], i) => {
                  const usage = externalPackages.usageCount?.get(name) || 0;
                  return (
                    <a key={i} href={`https://www.npmjs.com/package/${name}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] py-1 px-1 rounded hover:bg-secondary/30">
                      <span className="font-mono text-foreground/70 flex-1 truncate hover:text-primary transition-colors">{name}</span>
                      <span className="text-muted-foreground/40 text-[10px] font-mono">{ver}</span>
                      {usage > 0 && <span className="text-primary/60 text-[10px] font-mono">{usage}×</span>}
                    </a>
                  );
                })}
              </div>
            </div>
            {externalPackages.devDeps.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1.5 font-medium">Dev Dependencies</h4>
                <div className="space-y-0.5 max-h-32 overflow-y-auto scrollbar-thin">
                  {externalPackages.devDeps.map(([name, ver], i) => (
                    <a key={i} href={`https://www.npmjs.com/package/${name}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] py-1 px-1 rounded hover:bg-secondary/30">
                      <span className="font-mono text-foreground/70 flex-1 truncate hover:text-primary transition-colors">{name}</span>
                      <span className="text-muted-foreground/40 text-[10px] font-mono">{ver}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50 italic">No package.json found</span>
        )}
      </Section>

      <Section id="techstack" title="🛠 Tech Stack" badge={project.techStack.length}>
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech, i) => (
            <span key={i} className="px-2.5 py-1 bg-secondary/60 rounded-md text-xs font-medium text-foreground/80">{tech}</span>
          ))}
          {project.techStack.length === 0 && <span className="text-xs text-muted-foreground/50 italic">No package.json found</span>}
        </div>
        {project.packageJson?.scripts && (
          <div className="mt-3 space-y-1">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Scripts</h4>
            {Object.entries(project.packageJson.scripts).slice(0, 8).map(([name, cmd]) => (
              <div key={name} className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-primary/80 font-semibold">{name}</span>
                <span className="text-muted-foreground/50 truncate">{cmd as string}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="p-4 border-t border-border/40">
        <div className="text-[10px] text-muted-foreground/40 text-center font-mono">
          {totalLines.toLocaleString()} lines • {formatSize(totalSize)}
        </div>
      </div>
    </div>
  );
}
