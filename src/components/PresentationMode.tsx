import React, { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { GraphView } from './GraphView';

export function PresentationMode() {
  const { presentationMode, togglePresentation } = useStore();

  useEffect(() => {
    if (!presentationMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') togglePresentation();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presentationMode, togglePresentation]);

  if (!presentationMode) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-graph">
      <GraphView />
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/20 font-display font-bold tracking-wider">
        RepoGraph
      </div>
      <button onClick={togglePresentation}
        className="absolute top-4 right-4 px-3 py-1.5 bg-card/80 backdrop-blur border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-all z-10">
        Exit (ESC)
      </button>
    </div>
  );
}
