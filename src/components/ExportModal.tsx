import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { 
  X, 
  Image as ImageIcon, 
  Maximize, 
  FileText, 
  FileJson, 
  FileType, 
  Loader2,
  Download
} from 'lucide-react';

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
    } catch (e) {
      toast.error('Export failed: ' + (e as Error).message);
    } finally {
      setExporting(null);
      toggleExport();
    }
  };

  const options = [
    { format: 'png', icon: ImageIcon, label: 'PNG Image', desc: 'High-res transparent manifest' },
    { format: 'svg', icon: Maximize, label: 'SVG Vector', desc: 'Scalable structural schematic' },
    { format: 'pdf', icon: FileText, label: 'PDF Document', desc: 'Compressed archival format' },
    { format: 'json', icon: FileJson, label: 'JSON Data', desc: 'Raw nodal connectivity graph' },
    { format: 'markdown', icon: FileType, label: 'Markdown Report', desc: 'Auto-generated protocol docs' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={toggleExport}>
      <div
        className="bg-card border-2 border-white/10 rounded-2xl shadow-3xl w-[420px] overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white/[0.03] border-b border-white/5">
          <div className="flex flex-col -space-y-1">
            <h2 className="font-display font-black text-xs uppercase tracking-[0.3em] text-primary">Protocol::Export</h2>
            <span className="text-[10px] text-muted-foreground/40 font-mono tracking-widest uppercase">Select Output Vector</span>
          </div>
          <button onClick={toggleExport} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {options.map(opt => (
            <button
              key={opt.format}
              onClick={() => handleExport(opt.format)}
              disabled={!!exporting}
              className={`w-full group text-left px-5 py-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 active:scale-[0.98] transition-all flex items-center gap-4 disabled:opacity-30`}
            >
              <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110 ${exporting === opt.format ? 'animate-spin' : ''}`}>
                {exporting === opt.format ? <Loader2 className="w-5 h-5 text-primary" /> : <opt.icon className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />}
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-black uppercase tracking-widest text-foreground/90">{opt.label}</div>
                <div className="text-[10px] text-muted-foreground/50 font-mono italic">{opt.desc}</div>
              </div>
              <Download className="w-4 h-4 opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex justify-center">
            <span className="text-[9px] uppercase font-black tracking-[0.4em] text-muted-foreground/20">Protocol Authorization Level: Clear</span>
        </div>
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
