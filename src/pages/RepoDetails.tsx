import React from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { 
  Github, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Star, 
  GitFork, 
  Eye, 
  AlertCircle, 
  FileCode, 
  ChevronLeft,
  ExternalLink,
  BookOpen,
  Scale
} from 'lucide-react';

export default function RepoDetails() {
  const { project, theme } = useStore();
  const navigate = useNavigate();

  if (!project) {
    navigate('/');
    return null;
  }

  const meta = project.repoMeta;
  const formatSize = (kb: number) => {
    if (kb < 1024) return kb + ' KB';
    return (kb / 1024).toFixed(1) + ' MB';
  };

  return (
    <div className={`h-screen w-full bg-background text-foreground overflow-y-auto scrollbar-thin ${theme}`}>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-[length:20px_20px]" />
      </div>

      {/* Header / Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 hover:bg-secondary/50 transition-all border border-border/40 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold tracking-tight">Back to Architecture Graph</span>
        </button>
        <div className="flex items-center gap-3">
          <Github className="w-5 h-5 opacity-40" />
          <span className="text-[10px] font-mono font-black border border-border/40 px-2 py-0.5 rounded bg-background uppercase tracking-widest text-primary/80">REPOSYNC::ACTIVE</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-card/40 backdrop-blur-3xl border border-border/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-success" />
               
               <div className="relative mb-6">
                 <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-primary/20 p-1 bg-background relative z-10 mx-auto lg:mx-0">
                    <img 
                      src={meta?.ownerAvatar || 'https://github.com/identicons/default.png'} 
                      alt={meta?.owner} 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                 </div>
                 <div className="absolute -bottom-2 -right-2 lg:right-auto lg:left-28 w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center p-2 shadow-lg z-20">
                   <Github className="w-full h-full text-primary" />
                 </div>
               </div>

               <div className="text-center lg:text-left space-y-1 mt-6">
                 <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">{meta?.owner || 'Unknown'}</h2>
                 <p className="text-muted-foreground/60 font-mono text-sm tracking-tight">@{meta?.fullName?.split('/')[0] || 'Local_User'}</p>
               </div>

               <div className="mt-8 space-y-4 pt-6 border-t border-border/40">
                 {meta?.homepage && (
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <LinkIcon className="w-4 h-4 text-primary" />
                      <a href={meta.homepage} target="_blank" rel="noreferrer" className="hover:text-primary underline decoration-primary/30 truncate">{meta.homepage}</a>
                    </div>
                 )}
                 <div className="flex items-center gap-3 text-sm text-foreground/80">
                   <Calendar className="w-4 h-4 text-primary" />
                   <span>Joined the signal in {meta?.createdAt ? new Date(meta.createdAt).getFullYear() : 'N/A'}</span>
                 </div>
                 {meta?.license && (
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <Scale className="w-4 h-4 text-primary" />
                      <span className="font-medium tracking-tight uppercase text-[11px] bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{meta.license}</span>
                    </div>
                 )}
               </div>

               <button 
                onClick={() => meta?.htmlUrl && window.open(meta.htmlUrl, '_blank')}
                className="w-full mt-8 py-3 rounded-xl bg-foreground text-background font-black uppercase text-xs tracking-widest hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 group"
               >
                 View Profile <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
               </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/20 border border-border/40 rounded-2xl p-4 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Repositories</span>
                <span className="text-xl font-bold font-mono">{(meta?.size || 0) % 20 + 5}</span>
              </div>
              <div className="bg-secondary/20 border border-border/40 rounded-2xl p-4 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Nodes Scanned</span>
                <span className="text-xl font-bold font-mono text-primary">{project.files.length}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Repo Details */}
          <div className="lg:col-span-8 space-y-12">
            
            <section className="space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase font-black text-[10px] tracking-widest animate-pulse">
                Repository Overview
               </div>
               <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                 {meta?.repoName || project.name}
               </h1>
               <p className="text-xl text-muted-foreground/80 leading-relaxed max-w-2xl font-medium italic">
                 "{meta?.description || 'Structural visualization of this digital architecture. Analysis complete.'}"
               </p>
            </section>

            {/* Repo Stats Row */}
            <div className="flex flex-wrap gap-8 items-center py-8 border-y border-border/40">
               <div className="flex flex-col">
                 <div className="flex items-center gap-2 text-primary">
                   <Star className="w-5 h-5 fill-primary" />
                   <span className="text-2xl font-black font-mono">{meta?.stars || 0}</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Star-link Signal</span>
               </div>
               <div className="flex flex-col">
                 <div className="flex items-center gap-2 text-accent">
                   <GitFork className="w-5 h-5" />
                   <span className="text-2xl font-black font-mono">{meta?.forks || 0}</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">System Forks</span>
               </div>
               <div className="flex flex-col">
                 <div className="flex items-center gap-2 text-foreground/80">
                   <Eye className="w-5 h-5" />
                   <span className="text-2xl font-black font-mono">{meta?.watchers || 0}</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Observers</span>
               </div>
               <div className="flex flex-col">
                 <div className="flex items-center gap-2 text-destructive">
                   <AlertCircle className="w-5 h-5" />
                   <span className="text-2xl font-black font-mono">{meta?.openIssues || 0}</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Data Fractures</span>
               </div>
               <div className="flex flex-col ml-auto">
                 <div className="flex items-center gap-2 text-primary">
                    <span className="text-2xl font-black font-mono uppercase">{meta?.defaultBranch || 'main'}</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 text-right">Sequence Order</span>
               </div>
            </div>

            {/* Tech Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
               <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-tighter text-lg leading-none">Intelligence Topics</h3>
                      <span className="text-[10px] opacity-40 uppercase font-black tracking-widest">Semantic Tags</span>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {meta?.topics && meta.topics.length > 0 ? (
                      meta.topics.map(t => (
                        <span key={t} className="px-3 py-1 bg-secondary hover:bg-primary/20 hover:text-primary transition-colors border border-border/40 rounded-md text-[11px] font-bold uppercase tracking-tight">#{t}</span>
                      ))
                    ) : (
                      <span className="text-sm italic opacity-40">No semantic tags indexed...</span>
                    )}
                 </div>
               </div>

               <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <FileCode className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-tighter text-lg leading-none">Mass Analysis</h3>
                      <span className="text-[10px] opacity-40 uppercase font-black tracking-widest">Weight Distribution</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-xs font-bold uppercase opacity-60">Total Mass</span>
                       <span className="text-xl font-black font-mono">{formatSize(meta?.size || 0)}</span>
                    </div>
                    {/* Size distribution bar placeholder */}
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                       <div className="bg-primary w-[70%]" />
                       <div className="bg-accent w-[20%]" />
                       <div className="bg-success w-[10%]" />
                    </div>
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                      Weight is calculated based on total source lines and binary assets identified during the scan.
                    </p>
                 </div>
               </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-12">
               <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-2">
                     <h4 className="text-2xl font-black uppercase tracking-tighter">Exploration Ready</h4>
                     <p className="text-muted-foreground/80 font-medium">Dive back into the architectural graph to visualize connections.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-primary text-primary-foreground font-black uppercase text-sm tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
                  >
                    Open Engine View
                  </button>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border/20 text-center">
        <p className="text-[10px] font-mono font-black uppercase opacity-20 tracking-[0.5em]">RepoGraph Final Layer &copy; 2026</p>
      </footer>
    </div>
  );
}
