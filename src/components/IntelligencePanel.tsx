import React, { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { getFileTypeInfo } from '@/lib/fileIcons';
import { detectCircularDeps } from '@/lib/projectLoader';
import { computeComplexity, detectOrphans, detectTestFiles, detectConfigFiles } from '@/lib/analysis';
import {
   FolderOpen,
   Folder,
   Zap,
   Beaker,
   Settings,
   Ghost,
   Plus,
   Minus,
   Layers,
   Activity,
   FileText,
   Cpu,
   BarChart3,
   Network,
   ShieldCheck,
   AlertTriangle,
   History,
   ChevronRight,
   ChevronDown,
   Package
} from 'lucide-react';

interface TreeNode {
   name: string;
   path: string;
   children: TreeNode[];
   file?: {
      path: string;
      name: string;
      extension: string;
      size: number;
      lineCount: number;
      isBinary: boolean;
      isEntryPoint?: boolean;
      content?: string;
   };
}

export function IntelligencePanel() {
   const { project, sidebarOpen, openCodeView, setSelectedNode } = useStore();
   const [activeSections, setActiveSections] = useState<Set<string>>(new Set(['tree']));
   const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

   // Basic Stats
   const textFiles = useMemo(() => project?.files.filter(f => !f.isBinary) ?? [], [project]);
   const totalSize = useMemo(() => project?.files.reduce((a, f) => a + f.size, 0) ?? 0, [project]);
   const totalLines = useMemo(() => textFiles.reduce((a, f) => a + f.lineCount, 0), [textFiles]);
   const unresolvedDeps = useMemo(() => project?.dependencies.filter(d => !d.resolved && !d.isExternal) ?? [], [project]);

   // Advanced Analysis
   const complexityReport = useMemo(() => project ? computeComplexity(project.files).slice(0, 8) : [], [project]);
   const orphanFiles = useMemo(() => project ? detectOrphans(project.files, project.dependencies, project.entryPoints) : [], [project]);
   const testFiles = useMemo(() => project ? detectTestFiles(project.files) : [], [project]);
   const configFiles = useMemo(() => project ? detectConfigFiles(project.files) : [], [project]);
   const circularDeps = useMemo(() => project ? detectCircularDeps(project.dependencies).slice(0, 5) : [], [project]);

   // Network stats
   const connectionCounts = useMemo(() => {
      const counts = new Map<string, number>();
      project?.dependencies.forEach(d => {
         counts.set(d.source, (counts.get(d.source) || 0) + 1);
         if (d.resolved) counts.set(d.target, (counts.get(d.target) || 0) + 1);
      });
      return counts;
   }, [project]);
   const topConnected = useMemo(() => [...connectionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5), [connectionCounts]);

   const externalDeps = useMemo(() => {
      const deps = new Map<string, number>();
      project?.dependencies.filter(d => d.isExternal).forEach(d => {
         deps.set(d.target, (deps.get(d.target) || 0) + 1);
      });
      return [...deps.entries()].sort((a, b) => b[1] - a[1]);
   }, [project]);

   // Language Breakdown
   const totalTextSize = useMemo(() => textFiles.reduce((a, f) => a + f.size, 0), [textFiles]);
   const langBreakdown = useMemo(() => {
      const counts = new Map<string, { count: number; size: number; color: string; language: string }>();
      textFiles.forEach(f => {
         const info = getFileTypeInfo(f.extension);
         const key = info.language;
         const prev = counts.get(key) || { count: 0, size: 0, color: info.color, language: info.language };
         counts.set(key, { ...prev, count: prev.count + 1, size: prev.size + f.size });
      });
      return [...counts.values()].sort((a, b) => b.size - a.size);
   }, [textFiles]);

   // Risk Score calculation (Mocked but based on data)
   const riskScore = useMemo(() => {
      if (!project) return 0;
      let score = 0;
      score += circularDeps.length * 15;
      score += orphanFiles.length * 2;
      score += unresolvedDeps.length * 5;
      return Math.min(100, Math.max(5, score));
   }, [project, circularDeps, orphanFiles, unresolvedDeps]);

   const formatSize = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
   };

   // Folder tree logic...
   const folderTree = useMemo(() => {
      if (!project) return null;
      const root: TreeNode = { name: '', path: '', children: [] };
      project.files.forEach(f => {
         const parts = f.path.split('/');
         let current = root;
         for (let i = 0; i < parts.length - 1; i++) {
            const folderPath = parts.slice(0, i + 1).join('/');
            let child = current.children.find(c => c.name === parts[i] && !c.file);
            if (!child) {
               child = { name: parts[i], path: folderPath, children: [] };
               current.children.push(child);
            }
            current = child;
         }
         current.children.push({ name: f.name, path: f.path, children: [], file: f });
      });
      const sortTree = (node: TreeNode) => {
         node.children.sort((a, b) => {
            if (a.file && !b.file) return 1;
            if (!a.file && b.file) return -1;
            return a.name.localeCompare(b.name);
         });
         node.children.forEach(sortTree);
      };
      sortTree(root);
      return root;
   }, [project]);

   if (!project || !sidebarOpen) return null;

   const toggleFolder = (path: string) => {
      setExpandedFolders(prev => {
         const next = new Set(prev);
         if (next.has(path)) next.delete(path);
         else next.add(path);
         return next;
      });
   };

   const renderTree = (node: TreeNode, depth = 0) => {
      if (node.file) {
         const info = getFileTypeInfo(node.file.extension);
         const isOrphan = orphanFiles.includes(node.file.path);
         return (
            <button key={node.path} onClick={() => setSelectedNode(node.path)} onDoubleClick={() => openCodeView(node.path)}
               className="w-full text-left flex items-center gap-2 py-2 px-1 hover:bg-white/10 transition-colors text-sm"
               style={{ paddingLeft: depth * 16 + 12 }}>
               <span className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={info.iconUrl ? {} : { color: info.color }}>
                  {info.iconUrl ? <img src={info.iconUrl} alt="" className="w-4 h-4 object-contain" /> : <span className="text-xs font-black opacity-90">{info.icon}</span>}
               </span>
               <span className={`truncate flex-1 tracking-tight ${isOrphan ? 'text-muted-foreground/70 italic' : 'text-foreground font-medium'}`}>{node.name}</span>
               <div className="flex items-center gap-1.5 text-muted-foreground/70">
                  {node.file.isEntryPoint && <Zap className="w-3.5 h-3.5 text-primary" />}
                  {testFiles.includes(node.file.path) && <Beaker className="w-3.5 h-3.5 text-primary" />}
                  {configFiles.includes(node.file.path) && <Settings className="w-3.5 h-3.5" />}
                  {isOrphan && <Ghost className="w-3.5 h-3.5" />}
               </div>
            </button>
         );
      }
      const isExpanded = expandedFolders.has(node.path);
      return (
         <div key={node.path}>
            <button onClick={() => toggleFolder(node.path)}
               className="w-full text-left flex items-center gap-2 py-1.5 px-1 hover:bg-white/5 transition-colors text-[13px] font-bold"
               style={{ paddingLeft: depth * 14 + 8 }}>
               {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-primary/60" /> : <Folder className="w-3.5 h-3.5 text-muted-foreground/30" />}
               <span className="truncate flex-1 text-foreground/80">{node.name}</span>
            </button>
            {isExpanded && node.children.map((child: TreeNode) => renderTree(child, depth + 1))}
         </div>
      );
   };

   const Section = ({ id, title, badge, icon: Icon, children }: { id: string; title: string; badge?: string | number; icon: React.ElementType; children: React.ReactNode }) => {
      const isOpen = activeSections.has(id);

      const toggleSection = (e: React.MouseEvent) => {
         e.stopPropagation();
         const next = new Set(activeSections);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         setActiveSections(next);
      };

      return (
         <div className="border-b border-border/80">
            <button
               type="button"
               onClick={toggleSection}
               className={`w-full px-6 py-5 flex items-center justify-between group transition-all ${isOpen ? 'bg-primary/5' : 'hover:bg-secondary/10'}`}>
               <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full transition-all ${isOpen ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'bg-border/40'}`} />
                  <Icon className={`w-4 h-4 ${isOpen ? 'text-primary' : 'text-primary/40'}`} />
                  <span className={`text-sm font-black uppercase tracking-[0.15em] transition-colors ${isOpen ? 'text-primary' : 'text-foreground/80'}`}>
                     {title}
                  </span>
               </div>
               <div className="flex items-center gap-3">
                  {badge !== undefined && (
                     <span className="text-xs font-mono font-black text-primary/60">[{badge}]</span>
                  )}
                  <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground/30'}`}>
                     <Plus className="w-3.5 h-3.5" />
                  </div>
               </div>
            </button>
            <div
               className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
            >
               <div className="px-6 pb-6 pt-3 bg-card/20 border-t border-border/40">{children}</div>
            </div>
         </div>
      );
   };

   return (
      <div className="h-full bg-background border-r border-border/80 overflow-hidden flex flex-col flex-shrink-0 relative z-40 w-[360px]" style={{ transform: 'translateZ(0)' }}>

         {/* 01: SYSTEM DIAGNOSTICS HEADER */}
         <div className="p-6 border-b border-border/80 bg-card/40 relative">
            <div className="absolute top-0 right-0 p-3">
               <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-mono font-black text-success uppercase tracking-widest">System_Healthy</span>
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
               </div>
            </div>

            <div className="flex flex-col gap-1.5">
               <span className="text-xs font-mono font-black text-primary uppercase tracking-[0.2em]">Nodal_Intelligence</span>
               <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground truncate">
                  {project.name.split('/').pop()}
               </h2>
               <div className="flex items-center gap-2 mt-3">
                  <div className="px-2.5 py-1 bg-primary/10 border border-primary/30 rounded-sm">
                     <span className="text-xs font-black text-primary uppercase tracking-widest">{project.source}::PRO</span>
                  </div>
                  <div className="px-2.5 py-1 border border-border rounded-sm">
                     <span className="text-xs font-black text-foreground/80 uppercase tracking-widest">{project.branch || 'main'}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* 02: LIVE TELEMETRY STREAM */}
         <div className="flex-1 overflow-y-auto scrollbar-thin">

            {/* Architecture Assessment Section */}
            <div className="p-6 border-b border-border/80 bg-secondary/5">
               <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                     <ShieldCheck className="w-4 h-4 text-primary" />
                     <span className="text-sm font-black uppercase tracking-widest text-foreground">Arch_Assessment</span>
                  </div>
                  <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-sm ${riskScore > 50 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                     CRIT_LEVEL::{(riskScore / 10).toFixed(1)}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className={`p-3 border rounded-sm flex flex-col gap-1 transition-colors ${riskScore > 50 ? 'bg-destructive/10 border-destructive/20' : 'bg-success/10 border-success/20'}`}>
                     <div className="flex items-center gap-2">
                        <img src="https://img.icons8.com/?size=100&id=blQxxezppUsK&format=png" className="w-6 h-6 object-contain" alt="" />
                        <span className="text-[11px] font-mono font-black text-foreground/70 uppercase tracking-widest">Risk_Index</span>
                     </div>
                     <div className="flex items-end gap-2">
                        <span className={`text-xl leading-none font-black font-mono transition-colors ${riskScore > 50 ? 'text-destructive' : 'text-success'}`}>{riskScore}%</span>
                     </div>
                  </div>
                  <div className="p-3 border border-blue-500/20 rounded-sm bg-blue-500/10 flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                        <img src="https://img.icons8.com/fluency/48/database.png" className="w-6 h-6 object-contain" alt="" />
                        <span className="text-[11px] font-mono font-black text-blue-500/80 uppercase tracking-widest">Compute_Mass</span>
                     </div>
                     <div className="flex items-end gap-1.5">
                        <span className="text-xl leading-none font-black font-mono text-blue-600 dark:text-blue-400">{Math.round(totalLines / 1000)}k</span>
                        <span className="text-[11px] text-blue-500/60 font-mono font-black pb-0.5">LOC</span>
                     </div>
                  </div>
                  <div className="p-3 border border-emerald-500/20 rounded-sm bg-emerald-500/10 flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                        <img src="https://img.icons8.com/?size=100&id=b0vfoq4G1DH5&format=png" className="w-6 h-6 object-contain" alt="" />
                        <span className="text-[11px] font-mono font-black text-emerald-500/80 uppercase tracking-widest">Active_Nodes</span>
                     </div>
                     <div className="flex items-end gap-1.5">
                        <span className="text-xl leading-none font-black font-mono text-emerald-600 dark:text-emerald-400">{project.files.length}</span>
                        <span className="text-[11px] text-emerald-500/60 font-mono font-black pb-0.5">FILES</span>
                     </div>
                  </div>
                  <div className="p-3 border border-amber-500/20 rounded-sm bg-amber-500/10 flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                        <img src="https://img.icons8.com/?size=120&id=8rdiNySzVahQ&format=png" className="w-6 h-6 object-contain" alt="" />
                        <span className="text-[11px] font-mono font-black text-amber-500/80 uppercase tracking-widest">Vector_Edges</span>
                     </div>
                     <div className="flex items-end gap-1.5">
                        <span className="text-xl leading-none font-black font-mono text-amber-600 dark:text-amber-400">{project.dependencies.length}</span>
                        <span className="text-[11px] text-amber-500/60 font-mono font-black pb-0.5">LINKS</span>
                     </div>
                  </div>

                  <div className="col-span-2 p-3 mt-1 border border-indigo-500/20 rounded-sm bg-indigo-500/10 flex flex-col gap-3">
                     <span className="text-[11px] font-mono font-black text-indigo-500/80 uppercase tracking-widest">Structural_Health_Monitors</span>
                     <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1" title="Orphan Files (No dependencies)">
                           <div className="flex items-center gap-1.5">
                              <img src="https://img.icons8.com/?size=80&id=21105&format=png" className="w-5 h-5 object-contain" alt="" />
                              <span className={`text-xs font-mono font-black ${orphanFiles.length > 0 ? 'text-warn' : 'text-success'}`}>{orphanFiles.length} Orphans</span>
                           </div>
                        </div>
                        <div className="flex flex-col gap-1" title="Unresolved / Broken Imports">
                           <div className="flex items-center gap-1.5">
                              <img src="https://img.icons8.com/?size=96&id=IhAjlzjzL9ip&format=png" className="w-5 h-5 object-contain" alt="" />
                              <span className={`text-xs font-mono font-black ${unresolvedDeps.length > 0 ? 'text-destructive' : 'text-success'}`}>{unresolvedDeps.length} Dropped</span>
                           </div>
                        </div>
                        <div className="flex flex-col gap-1" title="Circular Dependencies">
                           <div className="flex items-center gap-1.5">
                              <img src="https://img.icons8.com/?size=160&id=KTlnpfeIRFWy&format=png" className="w-5 h-5 object-contain" alt="" />
                              <span className={`text-xs font-mono font-black ${circularDeps.length > 0 ? 'text-warn' : 'text-success'}`}>{circularDeps.length} Cycles</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>



            {/* Dynamic Sections */}
            <Section id="tree" title="File Manifest" badge={project.files.length} icon={Layers}>
               <div className="max-h-[400px] overflow-y-auto scrollbar-thin p-1 border border-border/30 bg-secondary/10">
                  {folderTree && folderTree.children.map(child => renderTree(child, 0))}
               </div>
            </Section>

            <Section id="languages" title="Language Spectrum" badge={langBreakdown.length} icon={BarChart3}>
               <div className="space-y-5">
                  <div className="h-2.5 bg-secondary/40 rounded-full overflow-hidden flex">
                     {langBreakdown.map((data, i) => (
                        <div key={i} style={{ width: `${(data.size / totalTextSize) * 100}%`, backgroundColor: data.color }} className="h-full" />
                     ))}
                  </div>
                  <div className="space-y-2.5">
                     {langBreakdown.map((data, i) => (
                        <div key={i} className="flex items-center justify-between group">
                           <div className="flex items-center gap-2.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                              <span className="text-xs font-black uppercase text-foreground/80 group-hover:text-primary transition-colors">{data.language}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-xs font-mono text-foreground/60">{data.count} units</span>
                              <span className="text-xs font-black text-foreground">{Math.round((data.size / totalTextSize) * 100)}%</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </Section>

            <Section id="entry" title="Kernel Entries" badge={project.entryPoints.length} icon={Zap}>
               <div className="space-y-1.5">
                  {project.entryPoints.map((ep, i) => (
                     <button key={i} onClick={() => { setSelectedNode(ep); openCodeView(ep); }}
                        className="w-full flex items-center justify-between p-4 border border-border/40 hover:border-primary/40 bg-card hover:bg-secondary/10 transition-all group">
                        <div className="flex items-center gap-4 truncate">
                           <Zap className="w-4 h-4 text-primary animate-pulse" />
                           <span className="text-sm font-mono font-black text-foreground truncate group-hover:text-primary">{ep.split('/').pop()}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-border group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                     </button>
                  ))}
               </div>
            </Section>

            <Section id="network" title="Network Topology" badge={topConnected.length} icon={Network}>
               <div className="space-y-5">
                  <div className="p-4 border border-fuchsia-500/20 bg-fuchsia-500/10 rounded-sm">
                     <span className="text-xs font-mono font-black text-fuchsia-500/80 uppercase block mb-4 tracking-widest">High Concentration Clusters</span>
                     <div className="space-y-1.5">
                        {topConnected.map(([path, count], i) => (
                           <button key={i} onClick={() => setSelectedNode(path)}
                              className="w-full flex items-center justify-between py-3 px-1 hover:bg-fuchsia-500/5 border-b border-fuchsia-500/20 last:border-0 group">
                              <span className="text-sm font-mono text-foreground/80 truncate group-hover:text-fuchsia-500">{path.split('/').pop()}</span>
                              <span className="text-xs font-black text-fuchsia-600 dark:text-fuchsia-400 p-1.5 bg-fuchsia-500/10 rounded-sm">{count}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  {circularDeps.length > 0 && (
                     <div className="p-4 border border-accent/20 bg-accent/5 rounded-sm">
                        <div className="flex items-center gap-2.5 mb-2.5">
                           <AlertTriangle className="w-4 h-4 text-accent" />
                           <span className="text-xs font-black text-accent uppercase tracking-tighter">Circular_Reference_Warn</span>
                        </div>
                        <div className="space-y-2.5">
                           {circularDeps.map((cycle, i) => (
                              <div key={i} className="text-xs font-mono text-accent/90 border-l border-accent/40 pl-3">
                                 {cycle.map(c => c.split('/').pop()).join(' → ')}
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </Section>

            <Section id="hotspots" title="Complexity Vectors" badge={complexityReport.length} icon={Activity}>
               <div className="space-y-2.5">
                  {complexityReport.map((c, i) => (
                     <button key={i} onClick={() => openCodeView(c.file)}
                        className={`w-full p-4 border rounded-sm transition-all group text-left ${c.level === 'Critical' ? 'bg-destructive/10 border-destructive/20 hover:border-destructive/40' : 'bg-warn/10 border-warn/20 hover:border-warn/40'}`}>
                        <div className="flex items-center justify-between mb-2">
                           <span className={`text-sm font-mono font-bold truncate transition-colors ${c.level === 'Critical' ? 'text-destructive/90 group-hover:text-destructive' : 'text-warn/90 group-hover:text-warn'}`}>{c.file.split('/').pop()}</span>
                           <span className={`text-xs font-black ${c.level === 'Critical' ? 'text-destructive' : 'text-warn'}`}>{c.score}</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${c.level === 'Critical' ? 'bg-destructive/20' : 'bg-warn/20'}`}>
                           <div className={`h-full ${c.level === 'Critical' ? 'bg-destructive' : 'bg-warn'}`} style={{ width: `${Math.min(100, c.score)}%` }} />
                        </div>
                     </button>
                  ))}
               </div>
            </Section>


         </div>

         {/* 03: SYSTEM FOOTER (TELEMETRY) */}
         <div className="p-6 border-t border-border/80 bg-card/60">
            <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                     <FileText className="w-4 h-4 text-muted-foreground/80" />
                     <span className="text-xs font-mono font-black text-foreground/70 uppercase tracking-widest">Payload_Capacity</span>
                  </div>
                  <span className="text-sm font-black text-foreground">{formatSize(totalSize)}</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                     <History className="w-4 h-4 text-muted-foreground/80" />
                     <span className="text-xs font-mono font-black text-foreground/70 uppercase tracking-widest">Thread_Connectivity</span>
                  </div>
                  <span className="text-sm font-black text-foreground">ACTIVE_SYNC</span>
               </div>

               <div className="mt-4 flex items-center justify-between pt-5 border-t border-border/40">
                  <div className="flex items-center gap-2.5">
                     <Cpu className="w-5 h-5 text-primary opacity-60 shadow-primary/20" />
                     <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Protocol::Static</span>
                  </div>
                  <div className="flex gap-1.5">
                     {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-4 bg-primary/20" />)}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
