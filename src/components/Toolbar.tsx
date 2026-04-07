import React from 'react';
import { useStore } from '@/store/useStore';
import { 
  Search, 
  Settings2, 
  HelpCircle, 
  LayoutDashboard, 
  Share2, 
  Monitor, 
  RotateCcw,
  Sidebar
} from 'lucide-react';

const TOOLS = [
  { icon: Search, label: 'Search Index (Ctrl+K)', key: 'search' },
  { icon: Settings2, label: 'Deck Configuration', key: 'customize' },
  { icon: HelpCircle, label: 'Access Guide', key: 'guide' },
  { icon: Sidebar, label: 'Toggle Intelligence', key: 'sidebar' },
  { icon: Share2, label: 'Export Protocol (Ctrl+E)', key: 'export' },
  { icon: Monitor, label: 'Presentation Mode (P)', key: 'present' },
  { icon: RotateCcw, label: 'Initialize New Scan', key: 'reset' },
] as const;

export function Toolbar() {
  const {
    toggleSidebar, toggleCustomization, toggleGuide, toggleExport, toggleSearch, togglePresentation,
    setProject,
  } = useStore();

  const actions: Record<string, () => void> = {
    search: toggleSearch,
    customize: toggleCustomization,
    guide: toggleGuide,
    sidebar: toggleSidebar,
    export: toggleExport,
    present: togglePresentation,
    reset: () => setProject(null),
  };

  return (
    <div className="fixed bottom-8 inset-x-0 flex justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto flex items-center bg-card/60 backdrop-blur-2xl border border-white/5 p-1 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden group/dock">
        
        {/* Precision Dock Background Glow */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        {TOOLS.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={actions[item.key]}
              title={item.label}
              className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 text-foreground/60 hover:text-primary transition-all duration-300 rounded-sm relative group"
            >
              <Icon className="w-4.5 h-4.5 relative z-10 transition-transform group-hover:scale-110" />
              
              {/* Internal Accent */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all" />
              
              {/* Brutalist Tooltip */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap translate-y-2 group-hover:translate-y-0">
                <div className="bg-popover/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-xs shadow-xl">
                  <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest leading-none">
                    {item.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
