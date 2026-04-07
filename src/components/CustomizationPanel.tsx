import React from 'react';
import { useStore, ThemeId, ShapeId, EdgeStyle, BgPattern, LayoutId } from '@/store/useStore';

const THEMES: { id: ThemeId; label: string; icon: string }[] = [
  { id: 'dark', label: 'Dark', icon: '🌑' },
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'neon', label: 'Neon', icon: '⚡' },
  { id: 'blueprint', label: 'Blueprint', icon: '📐' },
  { id: 'pastel', label: 'Pastel', icon: '🍬' },
  { id: 'blood', label: 'Blood', icon: '🩸' },
  { id: 'forest', label: 'Forest', icon: '🌲' },
];

const SHAPES: { id: ShapeId; label: string; icon: string }[] = [
  { id: 'auto', label: 'Auto', icon: '🌐' },
  { id: 'human', label: 'Human', icon: '🧑' },
  { id: 'jet', label: 'Jet', icon: '✈️' },
  { id: 'cat', label: 'Cat', icon: '🐱' },
  { id: 'tree', label: 'Tree', icon: '🌳' },
  { id: 'star', label: 'Star', icon: '⭐' },
  { id: 'heart', label: 'Heart', icon: '🫀' },
  { id: 'wave', label: 'Wave', icon: '🌊' },
  { id: 'circle', label: 'Circle', icon: '🔵' },
  { id: 'diamond', label: 'Diamond', icon: '🔷' },
  { id: 'honeycomb', label: 'Honeycomb', icon: '⬡' },
  { id: 'pyramid', label: 'Pyramid', icon: '🔺' },
  { id: 'spiral', label: 'Spiral', icon: '🌀' },
];

const EDGE_STYLES: { id: EdgeStyle; label: string; desc: string }[] = [
  { id: 'bezier', label: 'Bezier Curve', desc: 'Smooth default' },
  { id: 'straight', label: 'Straight Line', desc: 'Direct path' },
  { id: 'step', label: 'Elbow / Step', desc: 'Right-angle bends' },
  { id: 'animated-dots', label: 'Animated Dots', desc: 'Flowing particles' },
];

const LAYOUTS: { id: LayoutId; label: string; desc: string }[] = [
  { id: 'force', label: 'Force-directed', desc: 'Organic, default' },
  { id: 'hierarchy', label: 'Hierarchical', desc: 'Top-down tree' },
  { id: 'circular', label: 'Circular', desc: 'Ring arrangement' },
  { id: 'grid', label: 'Grid', desc: 'Neat rows & columns' },
  { id: 'radial', label: 'Radial', desc: 'Entry at center, rings outward' },
];

const BG_PATTERNS: { id: BgPattern; label: string }[] = [
  { id: 'dots', label: 'Dots' },
  { id: 'lines', label: 'Lines' },
  { id: 'cross', label: 'Cross' },
  { id: 'solid', label: 'Solid' },
  { id: 'hex', label: 'Hex' },
];

export function CustomizationPanel() {
  const {
    customizationOpen, toggleCustomization,
    theme, setTheme, shape, setShape, edgeStyle, setEdgeStyle,
    bgPattern, setBgPattern, edgeOpacity, setEdgeOpacity,
    edgeThickness, setEdgeThickness, layout, setLayout,
  } = useStore();

  const [tab, setTab] = React.useState<'theme' | 'edges' | 'shapes' | 'layout'>('theme');

  if (!customizationOpen) return null;

  return (
    <div className="absolute top-4 right-4 w-72 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-display font-bold text-sm tracking-tight">Customize</h3>
        <button onClick={toggleCustomization} className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-xs">✕</button>
      </div>

      <div className="flex border-b border-border bg-secondary/20">
        {(['theme', 'edges', 'shapes', 'layout'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-semibold transition-all ${tab === t ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground/60 hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-3 max-h-80 overflow-y-auto scrollbar-thin space-y-3">
        {tab === 'theme' && (
          <>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Theme</label>
            <div className="grid grid-cols-4 gap-1.5">
              {THEMES.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={`p-2 rounded-lg text-center text-xs transition-all active:scale-95 ${theme === t.id ? 'bg-primary/15 text-primary ring-1 ring-primary/40' : 'bg-secondary/50 hover:bg-secondary'}`}>
                  <div className="text-sm">{t.icon}</div>
                  <div className="text-[10px] mt-0.5 font-medium">{t.label}</div>
                </button>
              ))}
            </div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Background</label>
            <div className="flex gap-1">
              {BG_PATTERNS.map(p => (
                <button key={p.id} onClick={() => setBgPattern(p.id)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all active:scale-95 ${bgPattern === p.id ? 'bg-primary/15 text-primary ring-1 ring-primary/40' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </>
        )}

        {tab === 'edges' && (
          <>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Edge Style</label>
            <div className="space-y-1">
              {EDGE_STYLES.map(e => (
                <button key={e.id} onClick={() => setEdgeStyle(e.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all active:scale-[0.98] ${edgeStyle === e.id ? 'bg-primary/15 text-primary ring-1 ring-primary/40' : 'bg-secondary/50 hover:bg-secondary'}`}>
                  <div className="font-medium">{e.label}</div>
                  <div className="text-[10px] opacity-50 mt-0.5">{e.desc}</div>
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold flex items-center justify-between">
                Opacity <span className="text-foreground font-mono">{edgeOpacity}%</span>
              </label>
              <input type="range" min={20} max={100} value={edgeOpacity} onChange={e => setEdgeOpacity(Number(e.target.value))} className="w-full accent-primary h-1" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold flex items-center justify-between">
                Thickness <span className="text-foreground font-mono">{edgeThickness}px</span>
              </label>
              <input type="range" min={1} max={6} value={edgeThickness} onChange={e => setEdgeThickness(Number(e.target.value))} className="w-full accent-primary h-1" />
            </div>
          </>
        )}

        {tab === 'shapes' && (
          <>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Arrange nodes as shape</label>
            <div className="grid grid-cols-4 gap-1.5">
              {SHAPES.map(s => (
                <button key={s.id} onClick={() => setShape(s.id)}
                  className={`p-2 rounded-lg text-center transition-all active:scale-95 ${shape === s.id ? 'bg-primary/15 text-primary ring-1 ring-primary/40' : 'bg-secondary/50 hover:bg-secondary'}`}>
                  <div className="text-sm">{s.icon}</div>
                  <div className="text-[10px] mt-0.5 font-medium">{s.label}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === 'layout' && (
          <>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Layout Algorithm</label>
            <div className="space-y-1">
              {LAYOUTS.map(l => (
                <button key={l.id} onClick={() => { setLayout(l.id); setShape('auto'); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all active:scale-[0.98] ${layout === l.id && shape === 'auto' ? 'bg-primary/15 text-primary ring-1 ring-primary/40' : 'bg-secondary/50 hover:bg-secondary'}`}>
                  <div className="font-medium">{l.label}</div>
                  <div className="text-[10px] opacity-50 mt-0.5">{l.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
