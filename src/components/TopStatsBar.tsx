import React from 'react';
import { useStore } from '@/store/useStore';
import { getFileTypeInfo } from '@/lib/fileIcons';
import { useNavigate } from 'react-router-dom';

export function TopStatsBar() {
  const { project, setSelectedNode, toggleRepoInfo, toggleExport, toggleSearch, togglePresentation, theme, setTheme } = useStore();
  const navigate = useNavigate();
  if (!project) return null;

  const meta = project.repoMeta;
  const unresolvedCount = project.dependencies.filter(d => !d.resolved && !d.isExternal).length;
  const langs = [...new Set(project.files.filter(f => !f.isBinary).map(f => f.language))].slice(0, 6);

  const formatNum = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  };

  const nextTheme = () => {
    const themes: typeof theme[] = ['dark', 'light', 'neon', 'blueprint', 'pastel', 'blood', 'forest'];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  return (
    <div className="h-11 bg-card/90 backdrop-blur-sm border-b border-border flex items-center px-4 gap-3 text-xs z-30 flex-shrink-0">
      {/* Left: Logo */}
      <span className="font-display font-extrabold text-sm text-gradient tracking-tight mr-1">RepoGraph</span>
      <div className="w-px h-5 bg-border" />

      {/* Repo info */}
      {meta ? (
        <button onClick={toggleRepoInfo} className="flex items-center gap-2 hover:bg-secondary/50 rounded-lg px-2 py-1 transition-all active:scale-[0.98]">
          <img src={meta.ownerAvatar} alt={meta.owner} className="w-5 h-5 rounded-full ring-1 ring-border" />
          <span className="font-mono text-foreground/90 font-medium">{meta.fullName}</span>
          <span className="text-muted-foreground/40">↗</span>
        </button>
      ) : (
        <span className="font-display font-bold text-foreground tracking-tight flex items-center gap-1.5">
          📁 {project.name}
        </span>
      )}

      {/* GitHub badges */}
      {meta && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="flex items-center gap-0.5" title="Stars">⭐ {formatNum(meta.stars)}</span>
          <span className="flex items-center gap-0.5" title="Forks">🍴 {formatNum(meta.forks)}</span>
          <span className="flex items-center gap-0.5" title="Open Issues">🐛 {formatNum(meta.openIssues)}</span>
        </div>
      )}

      <div className="w-px h-5 bg-border" />

      {/* Stats */}
      <div className="flex items-center gap-3 text-muted-foreground">
        <span><span className="text-foreground font-mono font-semibold">{project.files.length}</span> files</span>
        <span><span className="text-foreground font-mono font-semibold">{project.dependencies.length}</span> deps</span>
        <span><span className="text-foreground font-mono font-semibold">{project.entryPoints.length}</span> entry</span>
      </div>

      <div className="flex-1" />

      {/* Language badges */}
      <div className="flex gap-1 mr-2">
        {langs.map((l, i) => {
          const ext = project.files.find(f => f.language === l)?.extension || '';
          const info = getFileTypeInfo(ext);
          return (
            <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              style={{ backgroundColor: info.color + '15', color: info.color }}>
              {l}
            </span>
          );
        })}
      </div>

      {unresolvedCount > 0 && (
        <button className="px-2 py-0.5 bg-destructive/10 text-destructive rounded text-[10px] font-medium hover:bg-destructive/20 active:scale-95 transition-all">
          ⚠️ {unresolvedCount}
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <button onClick={toggleSearch} title="Search (Ctrl+F)" className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">🔍</button>
        {meta && (
          <button onClick={() => navigate('/download')} title="Download ZIP"
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-all text-xs">⬇</button>
        )}
        <button onClick={toggleExport} title="Export (Ctrl+E)" className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">📤</button>
        <button onClick={togglePresentation} title="Present (P)" className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">🖥️</button>
        <button onClick={nextTheme} title="Theme" className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
          {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🎨'}
        </button>
      </div>

      <span className="px-2 py-0.5 bg-secondary rounded text-[10px] font-medium">
        {project.source === 'github' ? '🐙 GitHub' : '📁 Local'}
      </span>
    </div>
  );
}
