import React, { useMemo, useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node, Edge, Background, MiniMap, useNodesState, useEdgesState,
  BackgroundVariant, NodeProps, Handle, Position, useReactFlow, ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '@/store/useStore';
import { getFileTypeInfo } from '@/lib/fileIcons';

function FileNodeComponent({ data, selected }: NodeProps) {
  const { openCodeView, selectedNode, setContextMenu } = useStore();
  const info = getFileTypeInfo(data.extension);
  const isDimmed = selectedNode && selectedNode !== data.path && !data.isDirectConnection;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, nodePath: data.path });
  };

  return (
    <div
      className={`group relative px-3 py-2.5 rounded-lg border transition-all duration-200 cursor-pointer min-w-[140px] max-w-[220px] ${
        selected
          ? 'border-node-selected glow-primary-sm bg-node-bg scale-[1.04]'
          : isDimmed
          ? 'border-node-border/40 bg-node-bg/50 opacity-35'
          : 'border-node-border bg-node-bg hover:border-muted-foreground hover:shadow-md hover:shadow-black/10 hover:-translate-y-0.5'
      }`}
      onDoubleClick={() => openCodeView(data.path)}
      onContextMenu={handleContextMenu}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-primary/80 !border-0 !-top-1" />
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-mono font-bold w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundColor: info.color + '18', color: info.color }}>
          {info.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium truncate text-foreground flex items-center gap-1">
            {data.isEntryPoint && <span className="text-warn text-[10px]">⚡</span>}
            {data.isOrphan && <span className="text-[10px]" title="Orphan file">⚫</span>}
            {data.isTest && <span className="text-[10px]" title="Test file">🧪</span>}
            {data.isConfig && <span className="text-[10px]" title="Config file">⚙️</span>}
            {data.name}
            {data.fileOrder && <span className="text-[9px] text-muted-foreground/40 font-mono ml-1">#{data.fileOrder}</span>}
          </div>
          {data.folderPath && (
            <div className="text-[9px] text-muted-foreground/40 font-mono truncate">{data.folderPath}</div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-mono mt-0.5">
            <span>{formatSize(data.size)}</span>
            {data.importCount > 0 && <span className="text-primary/60">↓{data.importCount}</span>}
            {data.usedByCount > 0 && <span className="text-accent/60">↑{data.usedByCount}</span>}
          </div>
        </div>
        {data.complexityLevel && (
          <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
            data.complexityLevel === 'Critical' ? 'bg-destructive/20 text-destructive' :
            data.complexityLevel === 'High' ? 'bg-warn/20 text-warn' :
            data.complexityLevel === 'Medium' ? 'bg-warn/10 text-warn/60' : 'bg-success/10 text-success/60'
          }`}>{data.complexityLevel[0]}</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-primary/80 !border-0 !-bottom-1" />
    </div>
  );
}

const nodeTypes = { fileNode: FileNodeComponent };

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Layout algorithms
function forceDirectedLayout(nodes: Node[]): Node[] {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  return nodes.map((n, i) => ({
    ...n,
    position: {
      x: (i % cols) * 280 + (Math.random() - 0.5) * 50,
      y: Math.floor(i / cols) * 140 + (Math.random() - 0.5) * 25,
    },
  }));
}

function hierarchicalLayout(nodes: Node[], edges: Edge[]): Node[] {
  const incoming = new Map<string, Set<string>>();
  nodes.forEach(n => incoming.set(n.id, new Set()));
  edges.forEach(e => incoming.get(e.target)?.add(e.source));
  const levels = new Map<string, number>();
  const queue = nodes.filter(n => incoming.get(n.id)!.size === 0).map(n => n.id);
  queue.forEach(id => levels.set(id, 0));
  let i = 0;
  while (i < queue.length) {
    const current = queue[i++];
    const lvl = levels.get(current) || 0;
    edges.filter(e => e.source === current).forEach(e => {
      if (!levels.has(e.target)) { levels.set(e.target, lvl + 1); queue.push(e.target); }
    });
  }
  nodes.forEach(n => { if (!levels.has(n.id)) levels.set(n.id, 0); });
  const byLevel = new Map<number, string[]>();
  levels.forEach((lvl, id) => { if (!byLevel.has(lvl)) byLevel.set(lvl, []); byLevel.get(lvl)!.push(id); });
  return nodes.map(n => {
    const lvl = levels.get(n.id) || 0;
    const siblings = byLevel.get(lvl) || [];
    const idx = siblings.indexOf(n.id);
    return { ...n, position: { x: idx * 280 - (siblings.length * 140), y: lvl * 170 } };
  });
}

function circularLayout(nodes: Node[]): Node[] {
  const r = Math.max(250, nodes.length * 32);
  return nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    return { ...n, position: { x: Math.cos(angle) * r, y: Math.sin(angle) * r } };
  });
}

function gridLayout(nodes: Node[]): Node[] {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  return nodes.map((n, i) => ({ ...n, position: { x: (i % cols) * 280, y: Math.floor(i / cols) * 140 } }));
}

function radialLayout(nodes: Node[], edges: Edge[]): Node[] {
  const incoming = new Map<string, Set<string>>();
  nodes.forEach(n => incoming.set(n.id, new Set()));
  edges.forEach(e => incoming.get(e.target)?.add(e.source));
  const levels = new Map<string, number>();
  const roots = nodes.filter(n => incoming.get(n.id)!.size === 0).map(n => n.id);
  if (roots.length === 0 && nodes.length > 0) roots.push(nodes[0].id);
  roots.forEach(id => levels.set(id, 0));
  const queue = [...roots];
  let i = 0;
  while (i < queue.length) {
    const current = queue[i++];
    const lvl = levels.get(current) || 0;
    edges.filter(e => e.source === current).forEach(e => {
      if (!levels.has(e.target)) { levels.set(e.target, lvl + 1); queue.push(e.target); }
    });
  }
  nodes.forEach(n => { if (!levels.has(n.id)) levels.set(n.id, 0); });
  const byLevel = new Map<number, string[]>();
  levels.forEach((lvl, id) => { if (!byLevel.has(lvl)) byLevel.set(lvl, []); byLevel.get(lvl)!.push(id); });
  return nodes.map(n => {
    const lvl = levels.get(n.id) || 0;
    const siblings = byLevel.get(lvl) || [];
    const idx = siblings.indexOf(n.id);
    if (lvl === 0) return { ...n, position: { x: idx * 200, y: 0 } };
    const r = lvl * 280;
    const angle = (2 * Math.PI * idx) / siblings.length - Math.PI / 2;
    return { ...n, position: { x: Math.cos(angle) * r, y: Math.sin(angle) * r } };
  });
}

function shapeLayout(nodes: Node[], shape: string): Node[] {
  const n = nodes.length;
  if (n === 0) return nodes;
  const positions = generateShapePositions(shape, n);
  return nodes.map((node, i) => ({ ...node, position: positions[i] }));
}

function generateShapePositions(shape: string, count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  switch (shape) {
    case 'star': {
      const outerR = Math.max(300, count * 15);
      const innerR = outerR * 0.4;
      for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        positions.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }
      break;
    }
    case 'heart': {
      for (let i = 0; i < count; i++) {
        const t = (2 * Math.PI * i) / count;
        const scale = Math.max(10, count * 1.5);
        positions.push({ x: scale * 16 * Math.pow(Math.sin(t), 3), y: -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) });
      }
      break;
    }
    case 'wave': {
      const spacing = Math.max(200, 1200 / Math.max(1, count - 1));
      for (let i = 0; i < count; i++) positions.push({ x: i * spacing, y: Math.sin(i * 0.5) * 200 });
      break;
    }
    case 'circle': {
      const r = Math.max(250, count * 28);
      for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count;
        positions.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }
      break;
    }
    case 'diamond': {
      const size = Math.max(200, count * 15);
      for (let i = 0; i < count; i++) {
        const t = i / count;
        let x: number, y: number;
        if (t < 0.25) { x = t * 4 * size; y = t * 4 * size; }
        else if (t < 0.5) { x = (0.5 - t) * 4 * size; y = (t - 0.25) * 4 * size + size; }
        else if (t < 0.75) { x = -(t - 0.5) * 4 * size; y = (0.75 - t) * 4 * size + size; }
        else { x = -(1 - t) * 4 * size; y = -(t - 0.75) * 4 * size; }
        positions.push({ x, y });
      }
      break;
    }
    case 'honeycomb': {
      const cols = Math.ceil(Math.sqrt(count * 1.2));
      const size = 85;
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        positions.push({ x: col * size * 1.8 + (row % 2) * size * 0.9, y: row * size * 1.55 });
      }
      break;
    }
    case 'pyramid': {
      let placed = 0, row = 0;
      while (placed < count) {
        const rowSize = row + 1;
        const width = rowSize * 240;
        for (let j = 0; j < rowSize && placed < count; j++) {
          positions.push({ x: j * 240 - width / 2 + 120, y: row * 150 });
          placed++;
        }
        row++;
      }
      break;
    }
    case 'human': {
      const s = Math.max(5, count * 0.8);
      for (let i = 0; i < count; i++) {
        const t = i / count;
        let x = 0, y = 0;
        if (t < 0.1) { const a = (2 * Math.PI * i) / Math.ceil(count * 0.1); x = Math.cos(a) * s * 2; y = Math.sin(a) * s * 2; }
        else if (t < 0.5) { const row = Math.floor((t - 0.1) / 0.05); const col = ((t - 0.1) % 0.05) / 0.05; x = (col - 0.5) * s * 4; y = s * 5 + row * s; }
        else if (t < 0.7) { const armT = (t - 0.5) / 0.2; x = (armT < 0.5 ? -1 : 1) * (s * 3 + armT * s * 5); y = s * 6 + Math.abs(armT - 0.5) * s * 3; }
        else { const legT = (t - 0.7) / 0.3; x = (legT < 0.5 ? -1 : 1) * s * 1.5; y = s * 13 + legT * s * 8; }
        positions.push({ x, y });
      }
      break;
    }
    case 'tree': {
      for (let i = 0; i < count; i++) {
        const t = i / count;
        if (t < 0.2) positions.push({ x: 0, y: 600 - t * 2000 });
        else { const a = (t - 0.2) * 2 * Math.PI * 3; const r = (t - 0.2) * count * 16; positions.push({ x: Math.cos(a) * r, y: -r * 0.6 + Math.sin(a) * r * 0.3 }); }
      }
      break;
    }
    case 'jet': {
      for (let i = 0; i < count; i++) {
        const t = i / count;
        if (t < 0.1) positions.push({ x: -t * 3000, y: 0 });
        else if (t < 0.3) positions.push({ x: (t - 0.2) * 2000, y: 0 });
        else if (t < 0.6) { const wt = (t - 0.3) / 0.3; positions.push({ x: 0, y: (wt - 0.5) * 800 }); }
        else { const tt = (t - 0.6) / 0.4; positions.push({ x: tt * 600, y: (tt - 0.5) * 300 }); }
      }
      break;
    }
    case 'cat': {
      for (let i = 0; i < count; i++) {
        const t = i / count;
        if (t < 0.15) { const et = t / 0.15; positions.push({ x: (et < 0.5 ? -100 : 100) + (Math.random() - 0.5) * 40, y: -200 + et * 50 }); }
        else if (t < 0.35) { const a = ((t - 0.15) / 0.2) * Math.PI * 2; positions.push({ x: Math.cos(a) * 100, y: Math.sin(a) * 80 - 100 }); }
        else if (t < 0.75) { const a = ((t - 0.35) / 0.4) * Math.PI * 2; positions.push({ x: Math.cos(a) * 120, y: Math.sin(a) * 150 + 100 }); }
        else { const tt = (t - 0.75) / 0.25; positions.push({ x: 150 + tt * 200, y: 200 - Math.sin(tt * Math.PI) * 100 }); }
      }
      break;
    }
    case 'spiral': {
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const angle = t * Math.PI * 6;
        const r = 50 + t * count * 12;
        positions.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }
      break;
    }
    default:
      for (let i = 0; i < count; i++) {
        const cols = Math.ceil(Math.sqrt(count));
        positions.push({ x: (i % cols) * 280, y: Math.floor(i / cols) * 140 });
      }
  }
  return positions;
}

type ColorByMode = 'type' | 'folder' | 'depth' | 'connections' | 'complexity' | 'size';
type FilterMode = 'all' | 'js' | 'css' | 'html' | 'config' | 'tests' | 'orphans' | 'entry';

function GraphViewInner() {
  const { project, layout, shape, edgeStyle, selectedNode, setSelectedNode, edgeOpacity, edgeThickness, bgPattern, setContextMenu } = useStore();
  const reactFlowInstance = useReactFlow();
  const [colorBy, setColorBy] = useState<ColorByMode>('type');
  const [filter, setFilter] = useState<FilterMode>('all');

  // Import analysis data lazily
  const analysisData = useMemo(() => {
    if (!project) return { orphans: new Set<string>(), tests: new Set<string>(), configs: new Set<string>(), complexity: new Map<string, { score: number; level: string }>() };
    
    // Inline simple versions to avoid async import
    const hasImports = new Set<string>();
    const isImported = new Set<string>();
    project.dependencies.forEach(d => {
      if (!d.isExternal) { hasImports.add(d.source); if (d.resolved) isImported.add(d.target); }
    });
    const orphans = new Set(
      project.files
        .filter(f => !f.isBinary && !project.entryPoints.includes(f.path) && !hasImports.has(f.path) && !isImported.has(f.path))
        .map(f => f.path)
    );
    const tests = new Set(
      project.files.filter(f => /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(f.name) || f.path.includes('__tests__/')).map(f => f.path)
    );
    const configPatterns = [/^(vite|webpack|rollup|babel|jest|vitest|tailwind|postcss|tsconfig|prettier|eslint)\.config/i, /^\.eslintrc/, /^\.prettierrc/, /^Dockerfile/i];
    const configs = new Set(
      project.files.filter(f => configPatterns.some(p => p.test(f.name))).map(f => f.path)
    );
    const complexity = new Map<string, { score: number; level: string }>();
    const branchPattern = /\b(if|else|switch|case|for|while|do|catch|throw)\b/g;
    for (const f of project.files) {
      if (f.isBinary || !f.content) continue;
      if (!['.ts', '.tsx', '.js', '.jsx', '.py', '.php'].includes(f.extension)) continue;
      const matches = f.content.match(branchPattern);
      const score = Math.min(100, (matches?.length || 0) * 3 + Math.floor(f.lineCount / 20));
      const level = score >= 80 ? 'Critical' : score >= 50 ? 'High' : score >= 25 ? 'Medium' : 'Low';
      complexity.set(f.path, { score, level });
    }
    
    return { orphans, tests, configs, complexity };
  }, [project]);

  const connectedNodes = useMemo(() => {
    if (!selectedNode || !project) return new Set<string>();
    const connected = new Set<string>();
    connected.add(selectedNode);
    project.dependencies.forEach(d => {
      if (d.source === selectedNode) connected.add(d.target);
      if (d.target === selectedNode) connected.add(d.source);
    });
    return connected;
  }, [selectedNode, project]);

  const { initialNodes, initialEdges } = useMemo(() => {
    if (!project) return { initialNodes: [], initialEdges: [] };

    const connectionCount = new Map<string, number>();
    const importCount = new Map<string, number>();
    const usedByCount = new Map<string, number>();
    project.dependencies.forEach(d => {
      connectionCount.set(d.source, (connectionCount.get(d.source) || 0) + 1);
      if (d.resolved) connectionCount.set(d.target, (connectionCount.get(d.target) || 0) + 1);
      importCount.set(d.source, (importCount.get(d.source) || 0) + 1);
      if (d.resolved && !d.isExternal) usedByCount.set(d.target, (usedByCount.get(d.target) || 0) + 1);
    });

    let textFiles = project.files.filter(f => !f.isBinary);
    
    // Apply filter
    if (filter !== 'all') {
      textFiles = textFiles.filter(f => {
        switch (filter) {
          case 'js': return ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(f.extension);
          case 'css': return ['.css', '.scss', '.less', '.sass'].includes(f.extension);
          case 'html': return ['.html', '.htm'].includes(f.extension);
          case 'config': return analysisData.configs.has(f.path);
          case 'tests': return analysisData.tests.has(f.path);
          case 'orphans': return analysisData.orphans.has(f.path);
          case 'entry': return f.isEntryPoint;
          default: return true;
        }
      });
    }

    let nodes: Node[] = textFiles.map(f => {
      const folderPath = f.path.substring(0, f.path.lastIndexOf('/'));
      const comp = analysisData.complexity.get(f.path);
      return {
        id: f.path,
        type: 'fileNode',
        position: { x: 0, y: 0 },
        data: {
          name: f.name,
          path: f.path,
          extension: f.extension,
          size: f.size,
          isEntryPoint: f.isEntryPoint,
          isOrphan: analysisData.orphans.has(f.path),
          isTest: analysisData.tests.has(f.path),
          isConfig: analysisData.configs.has(f.path),
          complexityLevel: comp?.level,
          connectionCount: connectionCount.get(f.path) || 0,
          importCount: importCount.get(f.path) || 0,
          usedByCount: usedByCount.get(f.path) || 0,
          isDirectConnection: connectedNodes.has(f.path),
          folderPath: folderPath || undefined,
          fileOrder: project.fileOrder?.get(f.path),
        },
      };
    });

    const nodeIds = new Set(nodes.map(n => n.id));
    const edges: Edge[] = project.dependencies
      .filter(d => d.resolved && !d.isExternal && nodeIds.has(d.source) && nodeIds.has(d.target))
      .map((d, i) => {
        const isHighlighted = selectedNode && (d.source === selectedNode || d.target === selectedNode);
        return {
          id: `e-${i}`,
          source: d.source,
          target: d.target,
          type: edgeStyle === 'step' ? 'smoothstep' : edgeStyle === 'straight' ? 'straight' : 'default',
          animated: edgeStyle === 'animated-dots',
          style: {
            stroke: isHighlighted ? 'hsl(var(--primary))' : d.type === 'html' ? 'hsl(25, 90%, 55%)' : d.type === 'css' ? 'hsl(210, 90%, 55%)' : 'hsl(var(--edge-import))',
            strokeWidth: isHighlighted ? edgeThickness + 1 : edgeThickness,
            opacity: selectedNode ? (isHighlighted ? 1 : 0.08) : edgeOpacity / 100,
            transition: 'opacity 0.3s, stroke-width 0.2s',
          },
        };
      });

    if (shape !== 'auto') {
      nodes = shapeLayout(nodes, shape);
    } else {
      switch (layout) {
        case 'hierarchy': nodes = hierarchicalLayout(nodes, edges); break;
        case 'circular': nodes = circularLayout(nodes); break;
        case 'grid': nodes = gridLayout(nodes); break;
        case 'radial': nodes = radialLayout(nodes, edges); break;
        default: nodes = forceDirectedLayout(nodes);
      }
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [project, layout, shape, edgeStyle, edgeOpacity, edgeThickness, selectedNode, connectedNodes, filter, analysisData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_: any, node: Node) => setSelectedNode(node.id), [setSelectedNode]);
  const onPaneClick = useCallback(() => { setSelectedNode(null); setContextMenu(null); }, [setSelectedNode, setContextMenu]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.15, duration: 500 });
  }, [reactFlowInstance]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelectedNode(null); setContextMenu(null); }
      if (e.key === 'F' && (e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); handleFitView(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSelectedNode, handleFitView, setContextMenu]);

  const bgVariant = bgPattern === 'lines' ? BackgroundVariant.Lines
    : bgPattern === 'cross' ? BackgroundVariant.Cross
    : BackgroundVariant.Dots;

  const FILTERS: { id: FilterMode; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'js', label: 'JS/TS' },
    { id: 'css', label: 'CSS' },
    { id: 'html', label: 'HTML' },
    { id: 'config', label: 'Config' },
    { id: 'tests', label: 'Tests' },
    { id: 'orphans', label: 'Orphans' },
    { id: 'entry', label: 'Entry' },
  ];

  return (
    <div className="w-full h-full bg-graph relative">
      {/* Filter bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-1.5 py-1 shadow-lg shadow-black/10">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              filter === f.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground/60 hover:text-foreground hover:bg-secondary/50'
            }`}>
            {f.label}
          </button>
        ))}
        <div className="w-px h-4 bg-border/60 mx-0.5" />
        <select value={colorBy} onChange={e => setColorBy(e.target.value as ColorByMode)}
          className="text-[10px] bg-transparent border-0 text-muted-foreground/60 cursor-pointer focus:outline-none px-1">
          <option value="type">🎨 File Type</option>
          <option value="folder">📁 Folder</option>
          <option value="connections">🔗 Connections</option>
          <option value="complexity">⚡ Complexity</option>
        </select>
      </div>

      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick} onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView minZoom={0.05} maxZoom={3}
        className="bg-graph"
        proOptions={{ hideAttribution: true }}>
        {bgPattern !== 'solid' && bgPattern !== 'hex' && (
          <Background variant={bgVariant} gap={20} size={1} color="hsl(var(--graph-grid))" />
        )}
        <MiniMap
          nodeColor={(n) => getFileTypeInfo(n.data?.extension || '').color}
          maskColor="hsl(var(--background) / 0.8)"
          style={{ width: 160, height: 110, borderRadius: 8 }}
          className="!bg-surface-overlay !border !border-border"
        />
      </ReactFlow>
      <button onClick={handleFitView} title="Fit to view (Ctrl+Shift+F)"
        className="absolute bottom-4 right-[180px] z-20 w-8 h-8 rounded-lg bg-card/90 backdrop-blur border border-border flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground active:scale-95 transition-all shadow-sm">
        ⊡
      </button>
    </div>
  );
}

export function GraphView() {
  return (
    <ReactFlowProvider>
      <GraphViewInner />
    </ReactFlowProvider>
  );
}
