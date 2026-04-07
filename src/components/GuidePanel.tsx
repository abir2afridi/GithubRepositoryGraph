import React from 'react';
import { useStore } from '@/store/useStore';

export function GuidePanel() {
  const { guideOpen, toggleGuide, sidebarOpen } = useStore();
  if (!guideOpen) return null;

  return (
    <div className="absolute bottom-4 left-4 w-[400px] max-h-[75vh] bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden"
      style={{ marginLeft: sidebarOpen ? 320 : 0, transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-display font-bold text-sm tracking-tight">Guide & Legend</h3>
        <button onClick={toggleGuide} className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-xs">✕</button>
      </div>

      <div className="p-4 overflow-y-auto scrollbar-thin max-h-[65vh] space-y-5 text-xs">
        <section>
          <h4 className="font-display font-semibold text-sm mb-2.5 text-foreground/90">Symbols & Meaning</h4>
          <div className="space-y-2">
            {[
              ['⚡', 'Entry Point', 'Root/main file of the project'],
              ['#1 #2...', 'Chain Order', 'File order in dependency chain from root'],
              ['→', 'Import Edge', 'This file imports another file'],
              ['◉', 'Selected', 'Currently focused node'],
              ['◌', 'Dimmed', 'Unrelated to current selection'],
              ['🔴', 'Gutter Dot', 'This code line connects to another file'],
              ['[→]', 'Follow', 'Jump to connected file + exact line'],
              ['📦', 'External', 'Third-party package (npm, pip)'],
              ['⚠️', 'Unresolved', 'Import target file not found in repo'],
              ['🔒', 'Ignored', 'File exists in .gitignore'],
              ['↓2', 'Imports', 'This file imports 2 other files'],
              ['↑1', 'Used By', 'This file is imported by 1 other file'],
            ].map(([icon, title, desc], i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-6 text-center flex-shrink-0 mt-0.5 font-mono text-[10px]">{icon}</span>
                <div>
                  <span className="font-medium text-foreground/80">{title}</span>
                  <span className="text-muted-foreground/50 ml-1">— {desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border/40" />

        <section>
          <h4 className="font-display font-semibold text-sm mb-2.5 text-foreground/90">File Type Icons</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              ['TS', 'TypeScript', 'hsl(210, 80%, 55%)'],
              ['JS', 'JavaScript', 'hsl(48, 90%, 55%)'],
              ['⚛', 'React', 'hsl(195, 80%, 55%)'],
              ['🌐', 'HTML', 'hsl(16, 90%, 55%)'],
              ['🎨', 'CSS/SCSS', 'hsl(210, 90%, 55%)'],
              ['🐍', 'Python', 'hsl(120, 50%, 50%)'],
              ['{ }', 'JSON', 'hsl(220, 10%, 60%)'],
              ['V', 'Vue', 'hsl(153, 65%, 50%)'],
              ['S', 'Svelte', 'hsl(16, 90%, 55%)'],
              ['PHP', 'PHP', 'hsl(260, 50%, 55%)'],
              ['📄', 'Markdown', 'hsl(220, 10%, 70%)'],
              ['🖼', 'Images', 'hsl(280, 60%, 55%)'],
            ].map(([icon, name, color], i) => (
              <div key={i} className="flex items-center gap-2 py-0.5">
                <span className="w-5 text-center text-[10px] font-mono font-bold" style={{ color }}>{icon}</span>
                <span className="text-muted-foreground/60">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border/40" />

        <section>
          <h4 className="font-display font-semibold text-sm mb-2.5 text-foreground/90">Keyboard Shortcuts</h4>
          <div className="space-y-1.5">
            {[
              ['Ctrl+F', 'Search/find file in graph'],
              ['Ctrl+Shift+F', 'Fit all nodes to screen'],
              ['Ctrl+E', 'Open export modal'],
              ['Escape', 'Deselect / close panels'],
              ['← →', 'Navigate code history'],
              ['Click', 'Select & highlight connections'],
              ['Double-click', 'Open in code view'],
              ['Scroll', 'Zoom in/out'],
              ['Drag node', 'Move freely'],
              ['Drag bg', 'Pan canvas'],
            ].map(([key, desc], i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="font-mono bg-secondary/60 px-1.5 py-0.5 rounded text-[10px] w-24 text-center flex-shrink-0 font-medium">{key}</span>
                <span className="text-muted-foreground/60">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border/40" />

        <section>
          <h4 className="font-display font-semibold text-sm mb-2.5 text-foreground/90">How File Numbers Work</h4>
          <p className="text-muted-foreground/60 leading-relaxed mb-2">
            Files are numbered starting from <span className="text-primary font-mono font-bold">#1</span> (entry point).
            Each file that the entry imports becomes #2, #3, etc.
            Files deeper in the chain get higher numbers.
            This shows you the order in which your project "wakes up".
          </p>
          <div className="bg-secondary/30 rounded-lg p-3 font-mono text-[11px] text-foreground/70">
            <div className="text-primary font-semibold">#1 main.tsx</div>
            <div className="ml-3 text-muted-foreground/60">├── #2 App.tsx</div>
            <div className="ml-6 text-muted-foreground/50">├── #3 Header.tsx</div>
            <div className="ml-6 text-muted-foreground/50">└── #4 Dashboard.tsx</div>
            <div className="ml-9 text-muted-foreground/40">└── #5 Chart.tsx</div>
          </div>
        </section>
      </div>
    </div>
  );
}
