import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { loadFromGitHub, loadFromFolder, loadDemo, addRecentSession, getRecentSessions } from '@/lib/projectLoader';
import { toast } from 'sonner';
import { 
  AlertTriangle, FolderOpen, Sparkles, Github, Clock, Monitor, X, 
  ShieldAlert, Cpu, Terminal, Moon, Sun
} from 'lucide-react';

export function LandingPage() {
  const { setProject, setLoading, isLoading, loadingMessage, loadingProgress, theme, setTheme } = useStore();
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
    setLoading(true, 'INITIATING_SEQUENCE...', 0);
    try {
      const project = await loadFromGitHub(url, (msg, pct) => setLoading(true, msg, pct));
      addRecentSession(project.name, 'github');
      setProject(project);
      setLoading(false);
      toast.success(`SYSTEM UPDATED: ${project.files.length} NODES LOGGED`);
    } catch (e) {
      setLoading(false);
      const msg = (e as Error).message || '';
      if (msg === 'PRIVATE') {
        setShowPrivateWarning(true);
      } else if (msg.startsWith('RATE_LIMIT:')) {
        setRateLimitReset(parseInt(msg.split(':')[1]));
      } else if (msg === 'NOT_FOUND') {
        setUrlError('ERR 404: TARGET UNREACHABLE');
      } else if (msg === 'EMPTY') {
        setUrlError('ERR 000: PAYLOAD EMPTY');
      } else if (msg === 'NO_BRANCH') {
        setUrlError('ERR 011: BRANCH IDENTIFIER MISSING');
      } else {
        setUrlError(msg.toUpperCase());
      }
    }
  }, [url, setProject, setLoading]);

  const handleFolderUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoading(true, 'ANALYZING_LOCAL_PAYLOAD...', 0);
    try {
      const projectData = await loadFromFolder(files, (msg, pct) => setLoading(true, msg, pct));
      addRecentSession(projectData.name, 'local');
      setProject(projectData);
      setLoading(false);
      toast.success(`LOCAL SYNC COMPLETE: ${projectData.files.length} NODES LINKED`);
    } catch (e) {
      setLoading(false);
      toast.error('FATAL ERR: ' + (e as Error).message.toUpperCase());
    }
  }, [setProject, setLoading]);

  const handleDemo = useCallback(() => {
    const project = loadDemo();
    setProject(project);
    toast.success('DEMO_PROTOCOL::ACTIVE');
  }, [setProject]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLoad();
  };

  const stagger = (i: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.99)',
    transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms`,
  });

  return (
    <div className={`min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans selection:bg-primary/30 ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* Global Accents */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-20">
        <div className="text-[11px] uppercase font-black font-mono tracking-widest text-foreground/40 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          AES-256 ENCRYPTION :: SECURE
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-background border border-border/50 backdrop-blur-md">
          <span className="w-2 h-2 bg-primary rounded-none animate-pulse" />
          <span className="text-[10px] uppercase font-black font-mono tracking-widest text-primary">PROTOCOL ACTIVE</span>
        </div>
      </div>

      {/* Theme Toggle mapped to Top Right */}
      <div className="absolute top-4 right-4 sm:top-16 sm:right-10 z-50">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-3 border border-border/50 bg-background/50 backdrop-blur-md hover:bg-foreground/5 hover:border-foreground/30 transition-all rounded-none text-foreground/60 hover:text-foreground shadow-[0_0_15px_rgba(var(--primary),0.1)] focus:outline-none"
          title="Toggle Light/Dark Mode"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4" style={stagger(0)}>
          <h1 className="text-6xl md:text-[7rem] leading-none font-black uppercase tracking-tighter text-foreground drop-shadow-[0_0_30px_rgba(var(--primary),0.15)] flex items-center justify-center gap-4">
            <Terminal className="w-16 h-16 md:w-20 md:h-20 text-primary" strokeWidth={1.5} />
            REPOGRAPH
          </h1>
          <p className="text-[11px] font-mono tracking-[0.4em] text-foreground/50 uppercase">
             SURGICAL CODEBASE MAPPING ENGINE V3
          </p>
        </div>

        {/* Loading Overlay */}
        {isLoading ? (
          <div className="w-full max-w-2xl bg-background/80 backdrop-blur-xl border border-primary/40 p-8 space-y-6" style={stagger(1)}>
             <div className="flex items-center gap-4">
                <Spinner />
                <span className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-primary">{loadingMessage}</span>
             </div>
             <div className="w-full h-1 bg-foreground/10 overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${loadingProgress}%` }} />
             </div>
             <div className="text-right text-[9px] text-foreground/50 font-black font-mono uppercase tracking-widest">{loadingProgress}% CALIBRATED</div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-8" style={stagger(1)}>
            
            {/* Primary Action: Giant URL Input */}
            <div className="w-full flex flex-col gap-2">
              <div className="w-full flex flex-col sm:flex-row items-stretch border border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl shadow-black/20 focus-within:border-primary/50 focus-within:shadow-[0_0_30px_rgba(var(--primary),0.15)] transition-all">
                 <div className="hidden sm:flex w-16 items-center justify-center bg-muted/20 border-r border-border/50 shrink-0">
                    <Github className="w-6 h-6 text-foreground/50" />
                 </div>
                 <div className="relative flex-1 flex items-center">
                   <input 
                     type="text"
                     value={url}
                     onChange={e => { setUrl(e.target.value); setUrlError(''); setShowPrivateWarning(false); }}
                     onKeyDown={handleKeyDown}
                     placeholder="PASTE GITHUB URL HERE..."
                     className="w-full h-full bg-transparent text-foreground text-sm sm:text-base font-mono p-4 sm:p-5 focus:outline-none rounded-none placeholder:text-foreground/30 focus:bg-foreground/[0.02]"
                   />
                   {url && (
                     <button onClick={() => setUrl('')} className="absolute right-4 text-foreground/40 hover:text-foreground">
                        <X className="w-5 h-5" />
                     </button>
                   )}
                 </div>
                 <button 
                   onClick={handleLoad}
                   disabled={!url.trim()}
                   className="px-6 sm:px-10 py-4 sm:py-0 bg-primary text-primary-foreground font-black text-xs sm:text-sm uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none rounded-none"
                 >
                   EXECUTE
                 </button>
              </div>

              {/* Status/Error Messages */}
              {urlError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-[10px] sm:text-xs font-mono text-red-500 tracking-widest uppercase flex items-center gap-3">
                   <AlertTriangle className="w-4 h-4" /> {urlError}
                </div>
              )}
              {showPrivateWarning && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-[10px] sm:text-xs font-mono text-red-500 tracking-widest uppercase flex items-center gap-3">
                   <AlertTriangle className="w-4 h-4" /> ERR: TARGET IS PRIVATE. USE LOCAL SYNC INSTEAD.
                </div>
              )}
              {rateLimitReset !== null && rateLimitReset !== undefined && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-[10px] sm:text-xs font-mono text-yellow-600 tracking-widest uppercase flex items-center gap-3">
                   <Clock className="w-4 h-4" /> <RateLimitTimer reset={rateLimitReset} onExpired={() => setRateLimitReset(null)} onFolderClick={() => fileInputRef.current?.click()} />
                </div>
              )}
            </div>

            {/* Alternative Actions: Local & Demo */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Drag & Drop Local Directory */}
               <div 
                 onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                 onDragLeave={() => setDragOver(false)}
                 onDrop={e => { e.preventDefault(); setDragOver(false); handleFolderUpload(e.dataTransfer.files); }}
                 className={`group relative backdrop-blur-xl border border-border/50 p-6 flex flex-col justify-center items-center py-10 transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/[0.02] cursor-pointer rounded-none ${dragOver ? 'border-primary bg-primary/5' : 'bg-background/50'}`}
                 onClick={() => fileInputRef.current?.click()}
               >
                 <input
                   ref={fileInputRef}
                   type="file"
                   className="hidden"
                   {...{ webkitdirectory: '', directory: '' } as Record<string, string>}
                   onChange={e => handleFolderUpload(e.target.files)}
                 />
                 <Cpu className={`w-8 h-8 mb-4 transition-colors ${dragOver ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground'}`} />
                 <h2 className="text-sm font-black uppercase tracking-widest text-foreground text-center">Local Ingestion</h2>
                 <p className="text-[10px] text-foreground/40 font-mono uppercase tracking-widest mt-2">{dragOver ? 'DROP NOW' : 'SELECT DIRECTORY (100% CLIENT-SIDE)'}</p>
               </div>

               {/* Demo */}
               <div 
                 onClick={handleDemo}
                 className="group relative backdrop-blur-xl border border-border/50 bg-background/50 p-6 flex flex-col justify-center items-center py-10 transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.02] hover:shadow-[0_0_20px_rgba(var(--primary),0.1)] cursor-pointer rounded-none"
               >
                 <Sparkles className="w-8 h-8 mb-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                 <h2 className="text-sm font-black uppercase tracking-widest text-foreground text-center">Demo Simulation</h2>
                 <p className="text-[10px] text-foreground/40 font-mono uppercase tracking-widest mt-2">INITIALIZE PRE-CONFIGURED ARCHITECTURE</p>
               </div>
            </div>

            {/* History Nodes */}
            {recent.length > 0 && (
              <div className="w-full mt-8 space-y-4" style={stagger(2)}>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border/40" />
                  <p className="text-[9px] text-foreground/30 uppercase tracking-[0.5em] font-black">History::Nodes</p>
                  <div className="flex-1 h-px bg-border/40" />
                </div>
                <div className="flex gap-2 flex-wrap justify-center overflow-hidden">
                  {recent.map((r, i) => (
                    <span key={i} className="px-3 py-1.5 bg-muted/20 border border-border/40 text-[10px] font-mono text-foreground/50 flex items-center gap-2 hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => r.source === 'github' ? setUrl(`github.com/${r.name}`) : null}>
                      {r.source === 'github' ? <Github className="w-3 h-3 opacity-40" /> : <Monitor className="w-3 h-3 opacity-40" />}
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-none" />
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
    <span className="flex items-center gap-2">
      API EXHAUSTED. RECOVERY IN: <span className="font-black">{remaining}</span>
      <button onClick={onFolderClick} className="ml-2 px-3 py-1 bg-yellow-500/20 text-yellow-600 border border-yellow-500/30 text-[9px] uppercase hover:bg-yellow-500/30 transition-colors">
        INJECT FOLDER
      </button>
    </span>
  );
}
