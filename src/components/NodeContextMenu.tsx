import React from 'react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

interface ContextMenuProps {
  x: number;
  y: number;
  nodePath: string;
  onClose: () => void;
}

export function NodeContextMenu({ x, y, nodePath, onClose }: ContextMenuProps) {
  const { openCodeView, setSelectedNode, project } = useStore();

  const fileName = nodePath.split('/').pop() || nodePath;

  const actions = [
    { label: 'Open in Code View', icon: '📄', action: () => openCodeView(nodePath) },
    { label: 'Locate in Graph', icon: '🎯', action: () => setSelectedNode(nodePath) },
    { label: 'Copy Path', icon: '📋', action: () => { navigator.clipboard.writeText(nodePath); toast.success('Path copied'); } },
    { label: 'Copy Full URL', icon: '🔗', action: () => {
      const meta = project?.repoMeta;
      if (meta) {
        const url = `https://github.com/${meta.fullName}/blob/${project?.branch || meta.defaultBranch}/${nodePath}`;
        navigator.clipboard.writeText(url);
        toast.success('GitHub URL copied');
      } else {
        navigator.clipboard.writeText(nodePath);
        toast.success('Path copied');
      }
    }},
    { label: 'Show Dependencies', icon: '↓', action: () => { setSelectedNode(nodePath); toast.info(`Showing dependencies of ${fileName}`); } },
    { label: 'Show Dependents', icon: '↑', action: () => { setSelectedNode(nodePath); toast.info(`Showing dependents of ${fileName}`); } },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div className="fixed z-[61] bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl shadow-black/20 py-1 w-52 overflow-hidden"
        style={{ left: x, top: y, animation: 'scale-in 0.15s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="px-3 py-1.5 text-[10px] text-muted-foreground/40 font-mono truncate border-b border-border/60">
          {nodePath}
        </div>
        {actions.map((a, i) => (
          <button key={i} onClick={() => { a.action(); onClose(); }}
            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-secondary/50 transition-colors">
            <span className="w-4 text-center text-[11px]">{a.icon}</span>
            <span className="text-foreground/80">{a.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
