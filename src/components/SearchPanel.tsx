import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getFileTypeInfo } from '@/lib/fileIcons';

interface SearchPanelProps {
  onClose: () => void;
}

export function SearchPanel({ onClose }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { project, openCodeView, setSelectedNode } = useStore();

  const results = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2 || !project) return [];
    
    const query = searchQuery.toLowerCase();
    return project.files.filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.path.toLowerCase().includes(query)
    ).slice(0, 15);
  }, [searchQuery, project]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none">
      <div className="bg-card/90 backdrop-blur-2xl border border-border/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-primary animate-pulse" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ACCESS_NODE::[FILE_PATH_OR_SYMBOL]..."
            className="w-full bg-transparent pl-16 pr-24 py-6 text-sm font-mono tracking-widest text-foreground placeholder:text-muted-foreground/20 focus:outline-none"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
            <span className="brutalist-label text-muted-foreground/30 hidden sm:block">Searching::{results.length} Nodes</span>
            <button onClick={onClose} className="p-2 hover:bg-destructive/10 hover:text-destructive group transition-all">
                <X className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="border-t border-border/40 max-h-[480px] overflow-y-auto scrollbar-thin divide-y divide-border/20 bg-card/50">
            {results.map((file, i) => {
              const info = getFileTypeInfo(file.extension);
              return (
                <button
                  key={i}
                  onClick={() => { openCodeView(file.path); setSelectedNode(file.path); onClose(); }}
                  className="w-full text-left px-6 py-4 hover:bg-primary/5 group transition-all flex items-center gap-4"
                >
                  <div className={`w-10 h-10 flex flex-shrink-0 items-center justify-center font-black text-[10px] border border-border group-hover:border-primary group-hover:bg-primary/5 transition-all text-foreground ${info.iconUrl ? 'border-transparent' : ''}`}
                    style={info.iconUrl ? {} : { color: `hsl(var(--${info.colorVar}))` }}>
                    {info.iconUrl ? <img src={info.iconUrl} alt={info.language} className="w-6 h-6 object-contain drop-shadow-sm" /> : info.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{file.name}</span>
                      <span className="text-xs font-mono text-muted-foreground/60">{file.extension.toUpperCase()}</span>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground/70 truncate tracking-tight">{file.path}</div>
                  </div>
                  <div className="text-[10px] font-black text-muted-foreground/20 flex flex-col items-end gap-1">
                    <span className="group-hover:text-primary transition-colors">#{project.fileOrder?.get(file.path) || '?'}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
