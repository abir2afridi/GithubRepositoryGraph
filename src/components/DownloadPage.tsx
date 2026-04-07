import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function DownloadPage() {
  const { project } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [downloading, setDownloading] = useState(true);

  const fileName = searchParams.get('file') || (project?.repoMeta ? `${project.repoMeta.repoName}-${project.branch || project.repoMeta.defaultBranch}.zip` : 'download.zip');
  const meta = project?.repoMeta;
  const size = meta ? `~${meta.size >= 1024 ? (meta.size / 1024).toFixed(1) + ' MB' : meta.size + ' KB'}` : '';

  useEffect(() => {
    if (!meta || !project) return;
    const branch = project.branch || meta.defaultBranch;
    const url = `https://github.com/${meta.fullName}/archive/refs/heads/${branch}.zip`;
    
    const timer = setTimeout(() => {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      setDownloading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [meta, project, fileName]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/20 space-y-6 text-center"
        style={{ animation: 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        
        <div className="text-3xl font-display font-extrabold text-gradient tracking-tight">RepoGraph</div>

        {meta && (
          <div className="flex items-center justify-center gap-3">
            <img src={meta.ownerAvatar} alt={meta.owner} className="w-8 h-8 rounded-full ring-1 ring-border" />
            <span className="font-mono text-sm text-foreground/80">{meta.fullName}</span>
          </div>
        )}

        <div className="bg-secondary/40 rounded-xl p-4 space-y-2">
          <div className="text-lg">📦</div>
          <div className="font-mono text-sm text-foreground/90">{fileName}</div>
          {size && <div className="text-xs text-muted-foreground/60">Size: {size}</div>}
        </div>

        {downloading ? (
          <div className="space-y-2">
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-shimmer" style={{ width: '80%' }} />
            </div>
            <p className="text-xs text-muted-foreground/60">Preparing download...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-success font-medium">✅ Download started</p>
            <p className="text-xs text-muted-foreground/50">
              Didn't start? {meta && (
                <a href={`https://github.com/${meta.fullName}/archive/refs/heads/${project?.branch || meta.defaultBranch}.zip`}
                  className="text-primary hover:underline">Click here to download manually</a>
              )}
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-center pt-2">
          <button onClick={() => navigate('/')}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium transition-all active:scale-95">
            ← Return to Graph
          </button>
          <button onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold transition-all active:scale-95 hover:brightness-110">
            Load another repo
          </button>
        </div>
      </div>
    </div>
  );
}
