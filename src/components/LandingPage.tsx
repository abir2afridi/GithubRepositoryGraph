import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { loadFromGitHub, loadFromFolder, loadDemo, addRecentSession, getRecentSessions } from '@/lib/projectLoader';
import { toast } from 'sonner';

// Floating particle component for ambient background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-[0.04]"
          style={{
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: `hsl(${220 + Math.random() * 80}, 70%, 60%)`,
            animation: `particle-drift ${12 + Math.random() * 20}s ease-in-out infinite`,
            animationDelay: `${-Math.random() * 20}s`,
          }}
        />
      ))}
    </div>
  );
}

export function LandingPage() {
  const { setProject, setLoading, setError, isLoading, loadingMessage, loadingProgress } = useStore();
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [rateLimitReset, setRateLimitReset] = useState<number | null>(null);
  const [showPrivateWarning, setShowPrivateWarning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recent = getRecentSessions();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleLoad = useCallback(async () => {
    if (!url.trim()) return;
    setUrlError('');
    setShowPrivateWarning(false);
    setLoading(true, 'Starting...', 0);
    try {
      const project = await loadFromGitHub(url, (msg, pct) => setLoading(true, msg, pct));
      addRecentSession(project.name, 'github');
      setProject(project);
      setLoading(false);
      toast.success(`Loaded ${project.files.length} files, ${project.dependencies.length} dependencies found`);
    } catch (e: any) {
      setLoading(false);
      const msg = e.message || '';
      if (msg === 'PRIVATE') {
        setShowPrivateWarning(true);
      } else if (msg.startsWith('RATE_LIMIT:')) {
        setRateLimitReset(parseInt(msg.split(':')[1]));
      } else if (msg === 'NOT_FOUND') {
        setUrlError('Repository not found. Check the URL and try again.');
      } else if (msg === 'EMPTY') {
        setUrlError('This repository has no files yet.');
      } else if (msg === 'NO_BRANCH') {
        setUrlError('No branch detected. Try specifying: github.com/owner/repo/tree/branch-name');
      } else {
        setUrlError(msg);
      }
    }
  }, [url, setProject, setLoading, setError]);

  const handleFolderUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoading(true, 'Reading files...', 0);
    try {
      const project = await loadFromFolder(files, (msg, pct) => setLoading(true, msg, pct));
      addRecentSession(project.name, 'local');
      setProject(project);
      setLoading(false);
      toast.success(`Loaded ${project.files.length} files, ${project.dependencies.length} dependencies found`);
    } catch (e: any) {
      setLoading(false);
      toast.error('Failed to process folder: ' + e.message);
    }
  }, [setProject, setLoading]);

  const handleDemo = useCallback(() => {
    const project = loadDemo();
    setProject(project);
    toast.success('Demo project loaded — explore the graph!');
  }, [setProject]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLoad();
  };

  const stagger = (i: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
    filter: mounted ? 'blur(0px)' : 'blur(4px)',
    transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 100}ms`,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 graph-bg-dots opacity-20" />
      <FloatingParticles />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-xl w-full space-y-7">
        {/* Logo + tagline */}
        <div className="text-center space-y-3" style={stagger(0)}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/[0.08] border border-primary/[0.12] text-primary text-xs font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Code Dependency Visualizer
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-gradient leading-[1.05] tracking-tight">
            RepoGraph
          </h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
            Paste a GitHub URL or drop a folder to explore your codebase as an interactive graph.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-3" style={stagger(1)}>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-mono text-muted-foreground truncate">{loadingMessage}</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-right text-[10px] text-muted-foreground font-mono">{loadingProgress}%</div>
          </div>
        )}

        {/* Private repo warning */}
        {showPrivateWarning && (
          <div className="bg-warn/[0.06] border border-warn/20 rounded-xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">⚠️</span>
              <div className="space-y-2 flex-1">
                <h3 className="font-display font-bold text-warn text-sm">Private or Locked Repository</h3>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  RepoGraph only supports public repositories. Make your repo public on GitHub, or upload your project folder directly.
                </p>
                <button
                  onClick={() => { setShowPrivateWarning(false); fileInputRef.current?.click(); }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:brightness-110 active:scale-[0.97] transition-all"
                >
                  Try Folder Upload →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rate limit */}
        {rateLimitReset && <RateLimitTimer reset={rateLimitReset} onExpired={() => setRateLimitReset(null)} onFolderClick={() => fileInputRef.current?.click()} />}

        {/* URL Input */}
        {!isLoading && (
          <div className="space-y-2" style={stagger(1)}>
            <div className="flex gap-2">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setUrlError(''); setShowPrivateWarning(false); }}
                  onKeyDown={handleKeyDown}
                  placeholder="github.com/owner/repo"
                  className="w-full h-12 px-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 font-mono text-sm transition-all"
                />
                {url && (
                  <button
                    onClick={() => setUrl('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={handleLoad}
                disabled={!url.trim()}
                className="h-12 px-7 bg-primary text-primary-foreground rounded-xl font-display font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-primary/20"
              >
                Analyze
              </button>
            </div>
            {urlError && (
              <p className="text-destructive text-xs whitespace-pre-line pl-1 flex items-start gap-1.5">
                <span className="mt-0.5">⚠</span>
                {urlError}
              </p>
            )}
          </div>
        )}

        {/* Divider */}
        {!isLoading && (
          <div className="flex items-center gap-3" style={stagger(2)}>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {/* Drag & drop */}
        {!isLoading && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFolderUpload(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`group border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
              dragOver
                ? 'border-primary bg-primary/[0.04] scale-[1.01]'
                : 'border-border/60 hover:border-muted-foreground/40 hover:bg-card/30'
            }`}
            style={stagger(3)}
          >
            <div className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110">📂</div>
            <p className="text-sm font-medium text-foreground/80 mb-0.5">
              {dragOver ? 'Drop your folder here' : 'Drag & drop a project folder'}
            </p>
            <p className="text-xs text-muted-foreground/60">Click to browse • 100% offline • No upload</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              {...{ webkitdirectory: '', directory: '' } as any}
              onChange={e => handleFolderUpload(e.target.files)}
            />
          </div>
        )}

        {/* Demo + recent */}
        {!isLoading && (
          <div className="flex flex-col items-center gap-4" style={stagger(4)}>
            <button
              onClick={handleDemo}
              className="group px-5 py-2.5 bg-card border border-border rounded-xl font-medium text-sm text-foreground/80 hover:border-primary/30 hover:text-foreground hover:bg-card/80 active:scale-[0.97] transition-all flex items-center gap-2"
            >
              <span className="transition-transform group-hover:rotate-12">✨</span>
              Try Demo Project
            </button>

            {recent.length > 0 && (
              <div className="text-center space-y-2">
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">Recent</p>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {recent.map((r, i) => (
                    <span key={i} className="px-2.5 py-1 bg-card border border-border/50 rounded-lg text-[11px] text-muted-foreground">
                      {r.source === 'github' ? '🐙' : '📁'} {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Steps */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-3 pt-2" style={stagger(5)}>
            {[
              { icon: '📋', title: 'Paste or Drop', desc: 'GitHub URL or local folder' },
              { icon: '🔍', title: 'Auto-Parse', desc: 'All imports & dependencies' },
              { icon: '🗺️', title: 'Explore', desc: 'Interactive graph + code view' },
            ].map((step, i) => (
              <div key={i} className="text-center space-y-1.5 p-3 rounded-xl bg-card/30 border border-border/30">
                <div className="text-lg">{step.icon}</div>
                <h3 className="font-display font-semibold text-xs text-foreground/80">{step.title}</h3>
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RateLimitTimer({ reset, onExpired, onFolderClick }: { reset: number; onExpired: () => void; onFolderClick: () => void }) {
  const [remaining, setRemaining] = React.useState('');
  React.useEffect(() => {
    const interval = setInterval(() => {
      const diff = reset - Date.now();
      if (diff <= 0) { onExpired(); clearInterval(interval); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [reset, onExpired]);

  return (
    <div className="bg-warn/[0.06] border border-warn/20 rounded-xl p-5 space-y-2">
      <h3 className="font-display font-bold text-warn text-sm flex items-center gap-2">⏱️ Rate Limit Reached</h3>
      <p className="text-xs text-foreground/70">Try again in: <span className="font-mono font-bold text-warn">{remaining}</span></p>
      <p className="text-xs text-muted-foreground/60">Or upload your folder directly — no limit.</p>
      <button onClick={onFolderClick} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:brightness-110 active:scale-[0.97] transition-all">
        Upload Folder →
      </button>
    </div>
  );
}
