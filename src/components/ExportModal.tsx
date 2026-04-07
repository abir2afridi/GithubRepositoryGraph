import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export function ExportModal() {
  const { exportOpen, toggleExport, project } = useStore();
  const [exporting, setExporting] = useState<string | null>(null);

  if (!exportOpen || !project) return null;

  const getGraphElement = () => document.querySelector('.react-flow') as HTMLElement | null;

  const handleExport = async (format: string) => {
    setExporting(format);
    try {
      switch (format) {
        case 'png': {
          const el = getGraphElement();
          if (!el) throw new Error('Graph not found');
          const dataUrl = await toPng(el, { backgroundColor: 'transparent', pixelRatio: 2 });
          download(dataUrl, `${project.name}-graph.png`);
          break;
        }
        case 'svg': {
          const el = getGraphElement();
          if (!el) throw new Error('Graph not found');
          const dataUrl = await toSvg(el);
          download(dataUrl, `${project.name}-graph.svg`);
          break;
        }
        case 'pdf': {
          const el = getGraphElement();
          if (!el) throw new Error('Graph not found');
          const dataUrl = await toPng(el, { pixelRatio: 2 });
          const pdf = new jsPDF('landscape');
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${project.name}-graph.pdf`);
          break;
        }
        case 'json': {
          const data = {
            name: project.name,
            files: project.files.map(f => ({ path: f.path, size: f.size, language: f.language })),
            dependencies: project.dependencies,
            techStack: project.techStack,
            entryPoints: project.entryPoints,
          };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          download(URL.createObjectURL(blob), `${project.name}-data.json`);
          break;
        }
        case 'markdown': {
          const langCounts = new Map<string, number>();
          project.files.forEach(f => langCounts.set(f.language, (langCounts.get(f.language) || 0) + 1));
          let md = `# ${project.name} — Dependency Report\n\n`;
          if (project.description) md += `> ${project.description}\n\n`;
          md += `## Overview\n- Files: ${project.files.length}\n- Dependencies: ${project.dependencies.length}\n- Entry Points: ${project.entryPoints.join(', ')}\n\n`;
          md += `## Languages\n`;
          langCounts.forEach((count, lang) => { md += `- ${lang}: ${count} files\n`; });
          md += `\n## File List\n| File | Size | Language |\n|------|------|----------|\n`;
          project.files.forEach(f => { md += `| ${f.path} | ${f.size} B | ${f.language} |\n`; });
          const blob = new Blob([md], { type: 'text/markdown' });
          download(URL.createObjectURL(blob), `${project.name}-report.md`);
          break;
        }
      }
      toast.success('Export complete — downloading...');
    } catch (e: any) {
      toast.error('Export failed: ' + e.message);
    } finally {
      setExporting(null);
      toggleExport();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={toggleExport}>
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 w-[380px] p-6 space-y-4"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg tracking-tight">Export</h2>
          <button onClick={toggleExport} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">✕</button>
        </div>

        <div className="space-y-1.5">
          {[
            { format: 'png', icon: '🖼', label: 'PNG Image', desc: '2x resolution, transparent bg' },
            { format: 'svg', icon: '📐', label: 'SVG Vector', desc: 'Scalable, perfect for docs' },
            { format: 'pdf', icon: '📄', label: 'PDF Document', desc: 'Graph snapshot' },
            { format: 'json', icon: '{ }', label: 'JSON Data', desc: 'Raw graph data, re-importable' },
            { format: 'markdown', icon: '📝', label: 'Markdown Report', desc: 'Auto-generated documentation' },
          ].map(opt => (
            <button
              key={opt.format}
              onClick={() => handleExport(opt.format)}
              disabled={!!exporting}
              className="w-full text-left px-4 py-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 active:scale-[0.99] transition-all flex items-center gap-3 disabled:opacity-40"
            >
              <span className="text-lg w-7 text-center">{exporting === opt.format ? '⏳' : opt.icon}</span>
              <div>
                <div className="text-sm font-medium text-foreground/90">{opt.label}</div>
                <div className="text-[10px] text-muted-foreground/50">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground/30 text-center">Ctrl+E to toggle</p>
      </div>
    </div>
  );
}

function download(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
