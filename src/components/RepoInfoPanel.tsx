import React from 'react';
import { useStore } from '@/store/useStore';

export function RepoInfoPanel() {
  const { project, repoInfoOpen, toggleRepoInfo } = useStore();

  if (!repoInfoOpen || !project?.repoMeta) return null;
  const meta = project.repoMeta;

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatSize = (kb: number) => {
    if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB';
    return kb + ' KB';
  };

  const totalLang = meta.languages ? Object.values(meta.languages).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={toggleRepoInfo}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 w-[560px] max-h-[85vh] overflow-y-auto scrollbar-thin"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>

        {/* Hero */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <img src={meta.ownerAvatar} alt={meta.owner} className="w-14 h-14 rounded-full ring-2 ring-border" />
            <div className="flex-1 min-w-0">
              <a href={`https://github.com/${meta.owner}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono">
                {meta.owner}
              </a>
              <h2 className="font-display font-bold text-xl tracking-tight text-foreground">{meta.repoName}</h2>
              {meta.description && <p className="text-sm text-muted-foreground/70 mt-1 leading-relaxed">{meta.description}</p>}
            </div>
            <button onClick={toggleRepoInfo} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all self-start">✕</button>
          </div>

          {/* Topics */}
          {meta.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {meta.topics.map((t, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[11px] font-medium">{t}</span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <a href={meta.htmlUrl} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5">
              🐙 View on GitHub ↗
            </a>
            {meta.homepage && (
              <a href={meta.homepage} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5">
                🌐 Homepage ↗
              </a>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 p-4">
          {[
            { icon: '⭐', label: 'Stars', value: meta.stars.toLocaleString() },
            { icon: '🍴', label: 'Forks', value: meta.forks.toLocaleString() },
            { icon: '👁️', label: 'Watchers', value: meta.watchers.toLocaleString() },
            { icon: '🐛', label: 'Open Issues', value: meta.openIssues.toLocaleString() },
            { icon: '📦', label: 'Size', value: formatSize(meta.size) },
            { icon: '📅', label: 'Created', value: formatDate(meta.createdAt) },
            { icon: '🔄', label: 'Updated', value: formatDate(meta.updatedAt) },
            { icon: '🌿', label: 'Branch', value: meta.defaultBranch },
            { icon: '📜', label: 'License', value: meta.license },
          ].map((s, i) => (
            <div key={i} className="bg-secondary/40 rounded-lg p-3 text-center hover:bg-secondary/60 transition-colors">
              <div className="text-xs mb-0.5">{s.icon}</div>
              <div className="text-sm font-bold font-mono text-foreground">{s.value}</div>
              <div className="text-[10px] text-muted-foreground/60">{s.label}</div>
            </div>
          ))}
        </div>

        {meta.isFork && meta.parentFullName && (
          <div className="mx-4 mb-3 px-3 py-2 bg-warn/[0.06] border border-warn/20 rounded-lg text-xs text-muted-foreground">
            🔀 Forked from <a href={`https://github.com/${meta.parentFullName}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono">{meta.parentFullName}</a>
          </div>
        )}

        {/* Language breakdown */}
        {meta.languages && totalLang > 0 && (
          <div className="p-4 border-t border-border">
            <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold mb-3">Language Breakdown</h3>
            <div className="h-3 rounded-full overflow-hidden flex bg-secondary/30 mb-3">
              {Object.entries(meta.languages).map(([lang, bytes], i) => {
                const pct = (bytes / totalLang) * 100;
                const colors: Record<string, string> = {
                  TypeScript: 'hsl(210, 80%, 55%)', JavaScript: 'hsl(48, 90%, 55%)',
                  Python: 'hsl(120, 50%, 50%)', HTML: 'hsl(16, 90%, 55%)',
                  CSS: 'hsl(210, 90%, 55%)', SCSS: 'hsl(330, 70%, 55%)',
                  Vue: 'hsl(153, 65%, 50%)', Shell: 'hsl(120, 30%, 50%)',
                  Ruby: 'hsl(0, 70%, 50%)', Go: 'hsl(195, 60%, 55%)',
                  Rust: 'hsl(20, 70%, 50%)', Java: 'hsl(15, 80%, 50%)',
                };
                return (
                  <div key={i} style={{ width: `${pct}%`, backgroundColor: colors[lang] || 'hsl(220, 10%, 50%)' }}
                    className="h-full first:rounded-l-full last:rounded-r-full" title={`${lang}: ${pct.toFixed(1)}%`} />
                );
              })}
            </div>
            <div className="space-y-1.5">
              {Object.entries(meta.languages).map(([lang, bytes], i) => {
                const pct = (bytes / totalLang) * 100;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="flex-1 text-foreground/80">{lang}</span>
                    <span className="text-muted-foreground font-mono text-[11px] w-12 text-right">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Download */}
        <div className="p-4 border-t border-border">
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold mb-3">Download</h3>
          <a href={`https://github.com/${meta.fullName}/archive/refs/heads/${project.branch || meta.defaultBranch}.zip`}
            className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-xl text-sm font-medium text-foreground transition-all active:scale-[0.99]">
            <span>📦</span>
            <div className="flex-1">
              <div>Download as ZIP</div>
              <div className="text-[10px] text-muted-foreground/50">~{formatSize(meta.size)} • {meta.defaultBranch} branch</div>
            </div>
            <span className="text-primary">⬇</span>
          </a>
        </div>
      </div>
    </div>
  );
}
