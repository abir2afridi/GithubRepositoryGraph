import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { getFileTypeInfo } from '@/lib/fileIcons';
import {
  Search,
  Download,
  Palette,
  Moon,
  Sun,
  Maximize,
  Settings,
  Cpu,
  Github,
  Monitor,
  Shield,
  Info,
  User
} from 'lucide-react';

export function TopStatsBar() {
  const {
    project,
    toggleRepoInfo,
    toggleExport,
    theme,
    setTheme,
    toggleCustomization,
    openCodeView,
    setSelectedNode,
    toggleGuide
  } = useStore();

  const navigate = useNavigate();


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!project) return null;

  const meta = project.repoMeta;

  const nextTheme = () => {
    const themes: typeof theme[] = [
      'dark', 'light', 'neon', 'blueprint', 'pastel', 'blood', 'forest',
      'sunset', 'electric', 'midnight', 'matrix', 'cyber', 'drift', 'arctic', 'desert', 'lava', 'void'
    ];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  const toggleLightDark = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="sticky top-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border/60 px-8 text-xs z-[100] flex-shrink-0 relative overflow-visible flex items-center justify-between">

      {/* Precision Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(var(--primary),0.02)_1px,transparent_1px)] bg-[length:100%_4px] opacity-20 animate-scanline" />

      {/* Cybernetic Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />

      {/* 01: ENGINE IDENTITY (LEFT) */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative group cursor-pointer" onClick={() => window.location.reload()}>
          <div className={`w-10 h-10 flex items-center justify-center transition-colors ${theme !== 'light' && theme !== 'pastel' && theme !== 'arctic' ? 'invert brightness-200' : ''}`}>
            <DotLottieReact
              src="https://lottie.host/b6ad3f7e-c784-4fed-8fbf-529dd1cba9b6/zf8gLWc3AU.lottie"
              loop
              autoplay
            />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card animate-pulse shadow-[0_0_8px_rgba(var(--success),0.5)]" />
        </div>
        <div className="flex flex-col -space-y-1">
          <span className="font-sans font-black text-lg uppercase tracking-tight text-foreground">REPOGRAPHP</span>
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="text-[9px] font-mono font-bold tracking-widest text-primary">v3.4.0</span>
          </div>
        </div>
      </div>

      {/* 02: REPOSITORY IDENTITY (MIDDLE - ABSOLUTE CENTER) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center h-full">
        <button
          onClick={() => navigate('/repo')}
          className="flex items-center gap-3 px-8 h-full hover:bg-primary/5 transition-all group relative"
        >
          {/* Vertical Separators */}
          <div className="absolute left-0 top-1/3 bottom-1/3 w-[1px] bg-border/20" />
          <div className="absolute right-0 top-1/3 bottom-1/3 w-[1px] bg-border/20" />

          {/* Repository Owner Photo */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border/40 group-hover:border-primary/50 transition-colors bg-card/60 shadow-sm relative z-10">
              {meta?.ownerAvatar ? (
                <img src={meta.ownerAvatar} alt={meta.owner} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/40">
                  {project.source === 'github' ? <Github className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-card p-0.5 border border-border/40 shadow-sm z-20">
              {project.source === 'github' ? <Github className="w-full h-full text-primary/60" /> : <Monitor className="w-full h-full text-foreground/40" />}
            </div>
          </div>

          <div className="flex flex-col items-start gap-0">
            <div className="flex items-center gap-1.5 opacity-40">
              <span className="text-[9px] font-mono font-black text-foreground uppercase tracking-[0.1em] leading-none">
                @{meta?.owner || 'LOCAL_OS'}
              </span>
            </div>
            <span className="text-lg font-black text-foreground uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">
              {meta?.repoName || project.name.split('/').pop()}
            </span>
          </div>
        </button>
      </div>

      {/* 03: MODULAR CONTROL INTERFACE (RIGHT) */}
      <div className="flex items-center gap-4 flex-1 justify-end">

        <div className="flex items-center bg-secondary/20 border border-border/40 rounded-sm p-1 gap-1">
          <button onClick={toggleExport} title="Export Architecture (Ctrl+E)"
            className="w-9 h-9 flex items-center justify-center hover:bg-primary/20 text-foreground hover:text-primary transition-all rounded-sm border border-transparent hover:border-primary/20">
            <Download className="w-4 h-4" />
          </button>

          <button onClick={toggleGuide} title="System Guide & Legend"
            className="w-9 h-9 flex items-center justify-center hover:bg-primary/20 text-foreground hover:text-primary transition-all rounded-sm border border-transparent hover:border-primary/20 bg-primary/10 border-primary/20">
            <Info className="w-4 h-4 text-primary" />
          </button>

          <button onClick={() => navigate('/developer')} title="About the Developer"
            className="w-9 h-9 flex items-center justify-center hover:bg-primary/20 text-foreground hover:text-primary transition-all rounded-sm border border-transparent hover:border-primary/20">
            <User className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-border/20 mx-1" />

          <button onClick={toggleLightDark} title={`Photometric_State: ${theme === 'light' ? 'Dark' : 'Light'}`}
            className="w-9 h-9 flex items-center justify-center hover:bg-primary/20 text-primary transition-all rounded-sm border border-transparent hover:border-primary/20">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button onClick={nextTheme} title="Protocol_Visual_Rotation"
            className="w-9 h-9 flex items-center justify-center hover:bg-primary/20 text-foreground hover:text-primary transition-all rounded-sm border border-transparent hover:border-primary/20">
            <Palette className="w-4 h-4" />
          </button>

          <button onClick={toggleCustomization} title="Engine_Subsystems"
            className="w-9 h-9 flex items-center justify-center hover:bg-primary/20 text-foreground hover:text-primary transition-all rounded-sm border border-transparent hover:border-primary/20">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => useStore.getState().togglePresentation()}
          title="Projection_Mode [P]"
          className="group relative w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-sm overflow-hidden flex-shrink-0"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-shimmer" />
          <Maximize className="w-4.5 h-4.5 relative z-10" />
        </button>
      </div>
    </div>
  );
}
