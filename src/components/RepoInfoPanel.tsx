import React from 'react';
import { Github } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function RepoInfoPanel() {
  const { project } = useStore();

  if (!project) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-px group pointer-events-auto">
      <div className="bg-card/40 backdrop-blur-2xl border border-border/60 px-6 py-4 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-center gap-6">
          <div className="flex flex-col text-foreground">
            <span className="brutalist-label text-primary">Intelligence Node.Live</span>
            <h1 className="text-xl font-black font-sans leading-none tracking-tighter uppercase">
              {project.name}
            </h1>
          </div>
          
          <div className="h-8 w-px bg-border/50" />
          
          <div className="flex flex-col text-foreground">
            <span className="brutalist-label opacity-40">System Architecture</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase">
                V::{project.files.length} NODES
              </span>
              <div className="w-1.5 h-1.5 bg-success animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-px opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <div className="bg-card/60 backdrop-blur-md border border-border px-4 py-2 flex items-center gap-4 flex-1">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-muted-foreground/40 uppercase">Memory::Relic</span>
            <span className="text-[10px] font-mono text-foreground/80">{formatSize(project.files.reduce((a, b) => a + b.size, 0))}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-muted-foreground/40 uppercase">Signal::Density</span>
            <span className="text-[10px] font-mono text-foreground/80">{project.dependencies.length} EDGES</span>
          </div>
        </div>
        <button
          onClick={() => project.repoMeta?.htmlUrl && window.open(project.repoMeta.htmlUrl, '_blank')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 border border-primary flex items-center justify-center transition-all h-full"
        >
          <Github className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
