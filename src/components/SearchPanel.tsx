import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { getFileTypeInfo } from '@/lib/fileIcons';

export function SearchPanel() {
  const { searchOpen, toggleSearch, searchQuery, setSearchQuery, project, setSelectedNode, openCodeView } = useStore();
  const [results, setResults] = useState<typeof project extends null ? never : NonNullable<typeof project>['files']>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
      setSelectedIdx(0);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!project || !searchQuery) { setResults([]); return; }
    const q = searchQuery.toLowerCase();
    setResults(
      project.files
        .filter(f => f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
        .slice(0, 12)
    );
    setSelectedIdx(0);
  }, [searchQuery, project]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'Escape' && searchOpen) toggleSearch();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, toggleSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) {
      setSelectedNode(results[selectedIdx].path);
      toggleSearch();
    }
    if (e.key === 'Escape') toggleSearch();
  };

  if (!searchOpen) return null;

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[420px] bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden">
      <div className="p-2.5">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-sm">🔍</span>
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files..."
            className="w-full pl-9 pr-3 py-2.5 bg-secondary/50 border border-border/60 rounded-lg text-sm font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring/30"
          />
        </div>
      </div>
      {results.length > 0 && (
        <div className="border-t border-border/60 max-h-72 overflow-y-auto scrollbar-thin pb-1">
          {results.map((file, i) => {
            const info = getFileTypeInfo(file.extension);
            return (
              <button
                key={file.path}
                onClick={() => { setSelectedNode(file.path); toggleSearch(); }}
                onDoubleClick={() => { openCodeView(file.path); toggleSearch(); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                  i === selectedIdx ? 'bg-primary/10 text-foreground' : 'hover:bg-secondary/50 text-foreground/80'
                }`}
              >
                <span className="text-[10px] w-5 text-center flex-shrink-0" style={{ color: info.color }}>{info.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-[10px] text-muted-foreground/40 font-mono truncate">{file.path}</div>
                </div>
                <span className="text-[10px] text-muted-foreground/30 font-mono flex-shrink-0">{file.lineCount}L</span>
              </button>
            );
          })}
        </div>
      )}
      {searchQuery && results.length === 0 && (
        <div className="px-3 py-6 text-center text-xs text-muted-foreground/40">
          No files found
        </div>
      )}
    </div>
  );
}
