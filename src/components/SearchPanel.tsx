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

  type SearchResult = NonNullable<typeof project>['files'][0] & { order?: number };

  const results = useMemo((): SearchResult[] => {
    const query = searchQuery.toLowerCase().trim();
    if (!query || !project) return [];
    
    // Numeric search detection (if starts with # or is purely numeric)
    const isNumeric = query.startsWith('#') || !isNaN(Number(query));
    const cleanQuery = query.startsWith('#') ? query.slice(1) : query;

    if (isNumeric && project.fileOrder) {
      const fileEntries = Array.from(project.fileOrder.entries());
      return fileEntries
        .filter(([path, order]) => order.toString().includes(cleanQuery))
        .slice(0, 15)
        .map(([path, order]) => ({
             ...project.files.find(f => f.path === path)!,
             order
        }))
        .filter(f => f.name !== undefined);
    }

    if (query.length < 2) return [];

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
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-2xl px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div className="bg-card/95 backdrop-blur-3xl border border-primary/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] pointer-events-auto overflow-hidden rounded-sm">
        <div className="relative group bg-primary/5">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-primary" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="TYPE #123 FOR SERIAL OR PATH::[NAME]..."
            className="w-full bg-transparent pl-16 pr-32 py-5 text-sm font-mono tracking-widest text-foreground placeholder:text-foreground/20 focus:outline-none"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
            <span className="text-[10px] font-black font-mono text-primary/40 uppercase tracking-widest hidden sm:block">
              {results.length > 0 ? `NODES::FOUND[${results.length}]` : 'SCANNING_INDEX'}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-destructive/10 hover:text-destructive group transition-all rounded-xs">
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
                   <div className="text-[10px] font-black text-primary/30 flex flex-col items-end gap-1 font-mono">
                    <span>#{project.fileOrder?.get(file.path) || file.order || '?'}</span>
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
