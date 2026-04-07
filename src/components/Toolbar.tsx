import React from 'react';
import { useStore } from '@/store/useStore';

const TOOLS = [
  { icon: '🔍', label: 'Search (Ctrl+F)', key: 'search' },
  { icon: '📐', label: 'Layout & Shapes', key: 'customize' },
  { icon: '❓', label: 'Guide', key: 'guide' },
  { icon: '📊', label: 'Sidebar', key: 'sidebar' },
  { icon: '📤', label: 'Export (Ctrl+E)', key: 'export' },
  { icon: '🖥️', label: 'Present (P)', key: 'present' },
  { icon: '🔄', label: 'Back to start', key: 'reset' },
] as const;

export function Toolbar() {
  const {
    toggleSidebar, toggleCustomization, toggleGuide, toggleExport, toggleSearch, togglePresentation,
    sidebarOpen, setProject,
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
    <div
      className="absolute left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-0.5 bg-card/95 backdrop-blur-sm border border-border rounded-r-xl p-1 shadow-xl shadow-black/10"
      style={{ marginLeft: sidebarOpen ? 320 : 0, transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {TOOLS.map((item, i) => (
        <button
          key={i}
          onClick={actions[item.key]}
          title={item.label}
          data-customize={item.key === 'customize' ? '' : undefined}
          data-export={item.key === 'export' ? '' : undefined}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary active:scale-90 transition-all text-sm"
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
