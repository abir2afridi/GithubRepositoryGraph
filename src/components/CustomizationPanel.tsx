import React from 'react';
import { useStore, ThemeId, ShapeId, EdgeStyle, BgPattern, LayoutId } from '@/store/useStore';
import { 
  X, 
  Palette, 
  GitBranch, 
  Layout as LayoutIcon, 
  Shapes,
  Settings,
  Activity,
  Layers,
  Box
} from 'lucide-react';

const THEMES: { id: ThemeId; label: string; color: string }[] = [
  { id: 'dark', label: 'Classic Dark', color: '#0A0A0A' },
  { id: 'light', label: 'Paper Light', color: '#F9F9F9' },
  { id: 'neon', label: 'Neon Pink', color: '#FF00FF' },
  { id: 'blueprint', label: 'CAD Blueprint', color: '#1B2B44' },
  { id: 'pastel', label: 'Soft Pastel', color: '#FADADD' },
  { id: 'blood', label: 'Crimson Blood', color: '#330000' },
  { id: 'forest', label: 'Deep Forest', color: '#0A1A0A' },
  { id: 'sunset', label: 'Solar Sunset', color: '#FF4500' },
  { id: 'electric', label: 'High Voltage', color: '#FFFF00' },
  { id: 'midnight', label: 'Deep Midnight', color: '#191970' },
  { id: 'matrix', label: 'Bio Hazard', color: '#00FF00' },
  { id: 'cyber', label: 'Cyber Punk', color: '#FF00A0' },
  { id: 'drift', label: 'Asphalt Drift', color: '#E30000' },
  { id: 'arctic', label: 'Polar Arctic', color: '#D0F0FF' },
  { id: 'desert', label: 'Gold Desert', color: '#EEDC82' },
  { id: 'lava', label: 'Volcanic Lava', color: '#FF2400' },
  { id: 'void', label: 'Absolute Void', color: '#FFFFFF' },
];

const SHAPES: { id: ShapeId; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'human', label: 'Human' },
  { id: 'jet', label: 'Jet' },
  { id: 'cat', label: 'Cat' },
  { id: 'tree', label: 'Tree' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'wave', label: 'Wave' },
  { id: 'circle', label: 'Circle' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'honeycomb', label: 'Hexagon' },
  { id: 'pyramid', label: 'Pyramid' },
  { id: 'spiral', label: 'Spiral' },
];

const EDGE_STYLES: { id: EdgeStyle; label: string; desc: string }[] = [
  { id: 'bezier', label: 'Bezier Curve', desc: 'Fluid connections' },
  { id: 'straight', label: 'Straight Line', desc: 'Direct mapping' },
  { id: 'step', label: 'Orchestrated', desc: 'Clean right-angles' },
  { id: 'animated-dots', label: 'Pulse Flow', desc: 'Active data packets' },
];

const LAYOUTS: { id: LayoutId; label: string; desc: string }[] = [
  { id: 'force', label: 'Dynamic Force', desc: 'Organic repulsion' },
  { id: 'hierarchy', label: 'Structural Tree', desc: 'Parent-child order' },
  { id: 'circular', label: 'Radial Ring', desc: 'Cyclical layout' },
  { id: 'grid', label: 'Orthogonal Matrix', desc: 'Perfect alignment' },
  { id: 'radial', label: 'Expansion Halo', desc: 'Centralized nodes' },
];

const BG_PATTERNS: { id: BgPattern; label: string }[] = [
  { id: 'dots', label: 'Protocol A' },
  { id: 'lines', label: 'Protocol B' },
  { id: 'cross', label: 'Protocol C' },
  { id: 'hex', label: 'Protocol D' },
  { id: 'solid', label: 'Protocol E' },
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
    <div className="absolute top-4 right-4 w-[360px] bg-card border border-border/80 rounded-sm shadow-[0_0_80px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex flex-col" 
      style={{ animation: 'panel-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      
      {/* Premium Header */}
      <div className="relative px-6 py-5 bg-secondary/10 border-b border-border/60">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-sans font-black text-sm uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-primary" />
              Protocol::Configure
            </h3>
            <p className="text-[9px] text-primary font-mono font-bold uppercase tracking-[0.25em] opacity-80">
              Visual Engine Parameters
            </p>
          </div>
          <button onClick={toggleCustomization} 
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all rounded-sm">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modern Navigation */}
      <div className="flex bg-secondary/5 border-b border-border/40 p-1.5 gap-1">
        {[
          { id: 'theme', icon: Palette, label: 'Mode' },
          { id: 'edges', icon: GitBranch, label: 'Vector' },
          { id: 'shapes', icon: Box, label: 'Geom' },
          { id: 'layout', icon: Layers, label: 'Orch' },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id as 'theme' | 'edges' | 'shapes' | 'layout')}
            className={`flex-1 py-2 rounded-sm flex flex-col items-center gap-1 transition-all ${tab === t.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="text-[8px] uppercase font-black tracking-widest">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 max-h-[500px] overflow-y-auto scrollbar-thin space-y-8 bg-gradient-to-b from-transparent to-primary/5">
        
        {tab === 'theme' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-primary" />
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground">Visual Protocols</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    className={`group relative p-3 rounded-sm border transition-all flex items-center gap-3 ${theme === t.id ? 'bg-primary/10 border-primary shadow-lg' : 'bg-transparent border-border/40 hover:border-primary/40 hover:bg-primary/5'}`}>
                    <div className="w-3 h-3 rounded-full border border-border shadow-[0_0_8px_rgba(var(--primary),0.5)]" style={{ backgroundColor: t.color }} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === t.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>{t.label}</span>
                    {theme === t.id && <div className="absolute inset-0 border-2 border-primary/20 animate-pulse pointer-events-none" />}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
               <div className="flex items-center gap-2 mb-1">
                <LayoutIcon className="w-3 h-3 text-primary" />
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground">Grid Architecture</label>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {BG_PATTERNS.map(p => (
                  <button key={p.id} onClick={() => setBgPattern(p.id)}
                    className={`aspect-square rounded-sm flex items-center justify-center text-[9px] uppercase font-black transition-all border ${bgPattern === p.id ? 'bg-primary border-primary text-primary-foreground' : 'bg-secondary/10 border-border/40 text-muted-foreground hover:bg-secondary/20 hover:text-foreground'}`}>
                    {p.label.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'edges' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground">Mapping Algorithm</label>
              <div className="space-y-2">
                {EDGE_STYLES.map(e => (
                  <button key={e.id} onClick={() => setEdgeStyle(e.id)}
                    className={`w-full group text-left px-4 py-3 rounded-sm border transition-all flex flex-col gap-0.5 ${edgeStyle === e.id ? 'bg-primary/10 border-primary shadow-md' : 'bg-transparent border-border/40 hover:border-primary/40'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${edgeStyle === e.id ? 'text-primary' : 'text-foreground'}`}>{e.label}</span>
                    <span className="text-[9px] text-muted-foreground font-mono opacity-60 uppercase">{e.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-5 px-1 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground">Vector Intensity</label>
                  <span className="text-[10px] font-mono text-primary font-black">{edgeOpacity}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden flex items-center group cursor-pointer">
                   <input type="range" min={20} max={100} value={edgeOpacity} onChange={e => setEdgeOpacity(Number(e.target.value))} className="w-full h-full accent-primary bg-transparent appearance-none" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground">Vector Magnitude</label>
                  <span className="text-[10px] font-mono text-primary font-black">{edgeThickness}px</span>
                </div>
                 <div className="h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden flex items-center group cursor-pointer">
                    <input type="range" min={1} max={6} value={edgeThickness} onChange={e => setEdgeThickness(Number(e.target.value))} className="w-full h-full accent-primary bg-transparent appearance-none" />
                 </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'shapes' && (
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-1">
                <Shapes className="w-3 h-3 text-primary" />
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground">Geometric Primitives</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map(s => (
                <button key={s.id} onClick={() => setShape(s.id)}
                  className={`px-3 py-3 rounded-sm border transition-all flex flex-col items-center justify-center gap-2 ${shape === s.id ? 'bg-primary/10 border-primary text-primary shadow-md' : 'bg-transparent border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'layout' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-primary" />
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground">Coordinate Engine</label>
            </div>
            <div className="space-y-2">
              {LAYOUTS.map(l => (
                <button key={l.id} onClick={() => { setLayout(l.id); setShape('auto'); }}
                  className={`w-full text-left px-4 py-4 rounded-sm border transition-all flex flex-col gap-1 ${layout === l.id && shape === 'auto' ? 'bg-primary/10 border-primary shadow-md' : 'bg-transparent border-border/40 hover:border-primary/40'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${layout === l.id && shape === 'auto' ? 'text-primary' : 'text-foreground'}`}>{l.label}</span>
                  <span className="text-[9px] text-muted-foreground font-mono uppercase opacity-60">{l.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      <div className="px-6 py-4 bg-secondary/10 border-t border-border/60 flex items-center justify-between">
        <span className="text-[8px] uppercase font-black tracking-[0.3em] text-muted-foreground/40">Secure Authority Active</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
          <div className="w-1 h-1 bg-primary/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
