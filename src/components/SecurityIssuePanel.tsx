import React, { useMemo, useState } from 'react';
import { toast } from "sonner";
import { useStore } from '@/store/useStore';
import { scanForSecurityIssues, SecurityIssue } from '@/lib/securityAnalysis';
import {
  ShieldAlert,
  FileCode,
  Terminal,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Eye,
  Info
} from 'lucide-react';

export function SecurityHubView() {
  const project = useStore(state => state.project);
  const openCodeView = useStore(state => state.openCodeView);

  const [activeTab, setActiveTab] = useState<'issues' | 'ai-prompt' | 'manual-guide'>('issues');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  // We always calculate issues when this tab is active
  const allIssues = useMemo(() => {
    if (!project) return [];
    return scanForSecurityIssues(project.files);
  }, [project]);

  const criticalCount = allIssues.filter(i => i.severity === 'Critical').length;

  const secretTypes = useMemo(() => {
    const types = new Set<string>();
    allIssues.forEach(i => types.add(i.secretType));
    return ['All', ...Array.from(types)];
  }, [allIssues]);

  const filteredIssues = useMemo(() => {
    let list = allIssues;
    if (selectedType !== 'All') {
      list = list.filter(i => i.secretType === selectedType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i =>
        i.file.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allIssues, selectedType, searchQuery]);

  const groupedIssues = useMemo(() => {
    const groups: Record<string, SecurityIssue[]> = {};
    filteredIssues.forEach(i => {
      if (!groups[i.secretType]) groups[i.secretType] = [];
      groups[i.secretType].push(i);
    });
    return Object.entries(groups).map(([type, items]) => ({
      type,
      items,
      severity: items.some(i => i.severity === 'Critical') ? 'Critical' : 'Warning'
    }));
  }, [filteredIssues]);

  const copyPrompt = () => {
    const fullPrompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🤖 AI SECURITY FIX PROMPT
 (Copy and paste this into Cursor / Copilot / any AI IDE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I have a security issue in my codebase. 
Sensitive credentials are hardcoded in my source files.
Please help me fix this completely and safely.

STEP 1 — SCAN
  Search my entire codebase for any hardcoded:
  - API keys (OpenAI, Google, Anthropic, Stripe, etc.)
  - Passwords or secrets
  - Database connection strings containing credentials
  - JWT tokens
  - Private keys or certificates
  - Any string matching patterns like:
      sk-[...], AIza[...], AKIA[...], Bearer [...],
      password = "...", secret = "..."
  
  List every file and line number where you find them.
  Do not fix anything yet — just list all findings first.

STEP 2 — CREATE .env FILE
  Create a .env file in the project root.
  Move every found secret into it as an environment variable.
  Use UPPER_SNAKE_CASE naming:
    OPENAI_API_KEY=
    DATABASE_URL=
    GOOGLE_API_KEY=
    etc.
  
  Leave the values empty — I will fill them in manually.
  This is intentional — never put real values in code.

STEP 3 — CREATE .env.example FILE
  Create a .env.example file (same as .env but with
  placeholder values, safe to commit to git):
    OPENAI_API_KEY=your_openai_api_key_here
    DATABASE_URL=your_database_url_here
  
  This file shows other developers what variables
  are needed without exposing real values.

STEP 4 — UPDATE .gitignore
  Open or create .gitignore in project root.
  Make sure these lines exist:
    .env
    .env.local
    .env.development
    .env.production
    .env*.local
    *.pem
    *.key
    id_rsa
    id_ed25519
  
  If .env is already tracked by git, tell me —
  it needs to be removed from git history separately.

STEP 5 — REPLACE IN SOURCE FILES
  For each file that had hardcoded secrets:
  Replace the hardcoded value with the environment variable.
  
  For Node.js / Next.js / Vite:
    Before: const apiKey = "sk-abc123..."
    After:  const apiKey = process.env.OPENAI_API_KEY
    
  For Vite specifically:
    After:  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    (Vite requires VITE_ prefix for client-side variables)
  
  For React (Create React App):
    After:  const apiKey = process.env.REACT_APP_OPENAI_API_KEY
  
  For Python:
    import os
    api_key = os.getenv("OPENAI_API_KEY")
  
  For PHP:
    $apiKey = $_ENV['OPENAI_API_KEY'];

STEP 6 — ADD NULL CHECKS
  After replacing, add a check so the app fails clearly
  if the variable is missing:
  
  JavaScript / TypeScript:
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set. 
                       Check your .env file.")
    }
  
  Python:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set in environment")

STEP 7 — VERIFY
  After making all changes:
  1. Search the entire codebase again for the old
     secret values to confirm none remain
  2. Check that .env is in .gitignore
  3. Check that .env.example does NOT contain real values
  4. List all files you modified

IMPORTANT FINAL NOTE:
  If any of these secrets were EVER committed to git
  (even if now removed from files), they are still in
  git history and must be considered compromised.
  You MUST rotate/regenerate those keys immediately:
  - Go to the service's dashboard (OpenAI, Google, etc.)
  - Delete the old key
  - Generate a brand new key
  - Put the new key in your .env file
  Removing the key from code does NOT remove it from
  git history — it is still visible in old commits.`;

    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    toast.success("AI Security Prompt Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">

      {/* ULTRA COMPACT HEADER */}
      <div className="p-2 px-3 border-b border-border/80 bg-card/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className={`w-3.5 h-3.5 ${allIssues.length > 0 ? 'text-destructive' : 'text-success'}`} />
            <h2 className="text-[10px] font-black uppercase tracking-tight">Security_Hub</h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1 h-1 bg-destructive rounded-full animate-pulse" />
            <span className="text-[8px] font-mono font-black text-destructive/80 uppercase">Investigate_Required</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center justify-between py-1 px-2 bg-destructive/5 border border-destructive/20 rounded-sm">
            <span className="text-[8px] uppercase font-black tracking-widest text-destructive/60">Critical_Sec</span>
            <span className="text-xs font-black font-mono text-destructive leading-none">{criticalCount}</span>
          </div>
          <div className="flex-1 flex items-center justify-between py-1 px-2 bg-secondary/10 border border-border/40 rounded-sm">
            <span className="text-[8px] uppercase font-black tracking-widest opacity-40">Scanned_Files</span>
            <span className="text-xs font-black font-mono leading-none">{project.files.length}</span>
          </div>
        </div>
      </div>

      {/* ULTRA COMPACT TABS */}
      <div className="flex bg-secondary/20 border-b border-border/40 shrink-0">
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[8.5px] font-black uppercase tracking-widest transition-all ${activeTab === 'issues' ? 'bg-background text-primary' : 'text-muted-foreground hover:bg-background/40'}`}
        >
          <AlertTriangle className="w-2.5 h-2.5" /> Issues [{allIssues.length}]
        </button>
        <button
          onClick={() => setActiveTab('ai-prompt')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[8.5px] font-black uppercase tracking-widest transition-all border-l border-border/40 ${activeTab === 'ai-prompt' ? 'bg-background text-primary' : 'text-muted-foreground hover:bg-background/40'}`}
        >
          <Terminal className="w-2.5 h-2.5" /> Fix_AI
        </button>
        <button
          onClick={() => setActiveTab('manual-guide')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${activeTab === 'manual-guide' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-background/40'}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Manual Guide
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-behavior-contain">
        {activeTab === 'issues' && (
          <div className="flex flex-col h-full">
            {/* Search & Type Filters - Simplified for performance */}
            <div className="p-6 pb-4 space-y-4 bg-background border-b border-border/60 sticky top-0 z-30 shadow-sm">
              <div className="relative group">
                <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Investigate filename or content signature..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-secondary/30 border border-border/60 rounded-xl px-10 py-3 text-xs font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-muted-foreground hover:text-primary transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 -mx-2 px-2">
                {secretTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${selectedType === type ? 'bg-primary border-primary text-primary-foreground' : 'bg-secondary/40 border-border/60 text-muted-foreground hover:border-primary/40'}`}
                  >
                    {type} {type !== 'All' ? `(${allIssues.filter(i => i.secretType === type).length})` : `(${allIssues.length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scroll-smooth will-change-transform custom-scrollbar p-6 space-y-8 min-h-0 pb-20">
              {groupedIssues.length === 0 ? (
                <div className="h-full flex items-center justify-center p-8 text-center">
                  <div className="space-y-4 max-w-[280px]">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                      <ShieldCheck className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-lg font-black uppercase italic">{allIssues.length === 0 ? 'Zero Fractures' : 'No Matches'}</h3>
                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                      {allIssues.length === 0 ? 'Codebase is shielded from known hardcoded secrets.' : `No occurrences found for "${searchQuery}" in ${selectedType} category.`}
                    </p>
                  </div>
                </div>
              ) : (
                groupedIssues.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2.5">
                        {(() => {
                          const t = group.type.toLowerCase();
                          if (t.includes('google')) return <img src="https://img.icons8.com/color/48/google-logo.png" className="w-4 h-4" alt="" />;
                          if (t.includes('aws')) return <img src="https://img.icons8.com/color/48/amazon-web-services.png" className="w-4 h-4" alt="" />;
                          if (t.includes('firebase')) return <img src="https://img.icons8.com/color/48/firebase.png" className="w-4 h-4" alt="" />;
                          if (t.includes('stripe')) return <img src="https://img.icons8.com/color/48/stripe.png" className="w-4 h-4" alt="" />;
                          if (t.includes('password') || t.includes('secret')) return <img src="https://img.icons8.com/color/48/password.png" className="w-4 h-4" alt="" />;
                          return <span className={`w-2 h-2 rounded-full ${group.severity === 'Critical' ? 'bg-destructive shadow-[0_0_8px_red]' : 'bg-warn'}`} />;
                        })()}
                        <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-foreground/90">{group.type}</h4>
                      </div>
                      <span className="text-[10px] font-mono font-black text-primary/40 bg-primary/5 px-2 py-0.5 rounded border border-primary/10">{group.items.length} Frame{group.items.length > 1 ? 's' : ''}</span>
                    </div>

                    <div className="space-y-6 pb-4">
                      {group.items.map((issue, idx) => {
                        const getProviderIcon = (type: string) => {
                          const t = type.toLowerCase();
                          if (t.includes('google')) return 'https://img.icons8.com/color/48/google-logo.png';
                          if (t.includes('aws')) return 'https://img.icons8.com/color/48/amazon-web-services.png';
                          if (t.includes('firebase')) return 'https://img.icons8.com/?size=96&id=62452&format=png';
                          if (t.includes('stripe')) return 'https://img.icons8.com/color/48/stripe.png';
                          if (t.includes('github')) return 'https://img.icons8.com/ios-filled/50/ffffff/github.png';
                          if (t.includes('password') || t.includes('secret')) return 'https://img.icons8.com/color/48/password.png';
                          return 'https://img.icons8.com/isometric/50/key.png';
                        };

                        const cardStyles = [
                          'bg-destructive/5 border-destructive/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]',
                          'bg-success/5 border-success/20 shadow-[0_0_20px_rgba(34,197,94,0.05)]',
                          'bg-primary/5 border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]',
                          'bg-amber-500/5 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]',
                          'bg-violet-500/5 border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]'
                        ];
                        const currentStyle = cardStyles[idx % cardStyles.length];

                        return (
                          <div key={`${issue.file}-${issue.line}-${idx}`} className={`group relative border rounded-xl p-4 transition-all ${currentStyle}`}>
                            {/* PROVIDER BRANDING OVERLAY */}
                            <div className="absolute -top-1 -right-1 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                              <img src={getProviderIcon(group.type)} className="w-16 h-16 grayscale" alt="" />
                            </div>

                            <div className="flex flex-col gap-3 relative z-10">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 text-[10px] font-mono text-foreground/90 bg-white/5 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/10 min-w-0 flex-1 overflow-hidden shadow-sm group-hover:border-white/20 transition-colors">
                                  <img src="https://img.icons8.com/?size=160&id=DVzc1vi8FDJt&format=png" className="w-4 h-4 shrink-0" alt="file" />
                                  <span className="font-bold tracking-tight break-all leading-tight opacity-80 group-hover:opacity-100 transition-opacity">{issue.file}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(issue.content);
                                      toast.success("Copied!");
                                    }}
                                    className="p-2 bg-secondary/50 rounded-lg hover:bg-primary/20 hover:text-primary transition-all border border-border/40"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => openCodeView(issue.file, issue.line)}
                                    className="p-2 bg-secondary/50 rounded-lg hover:bg-primary/20 hover:text-primary transition-all border border-border/40"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="px-2 py-0.5 bg-destructive/10 border border-destructive/20 rounded-md text-[9px] font-black font-mono text-destructive uppercase tracking-widest flex items-center gap-1.5">
                                  <ShieldAlert className="w-2.5 h-2.5" /> LINE::{issue.line}
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-border/10 via-border/5 to-transparent" />
                              </div>
                            </div>

                            <div className="relative z-10">
                              <div className="text-[12px] font-mono bg-black/90 p-3.5 rounded-lg border border-white/10 overflow-x-auto custom-scrollbar-horizontal">
                                <code className="text-white font-bold block">{issue.content}</code>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2.5 border-t border-border/10 pt-3">
                              <div className="flex items-center gap-2">
                                <Terminal className="w-3 h-3 text-primary/40" />
                                <span className="text-[9px] font-mono text-muted-foreground/60 italic tracking-tight truncate">Pattern::{issue.pattern.substring(0, 20)}</span>
                              </div>
                              <button
                                onClick={() => openCodeView(issue.file, issue.line)}
                                className="w-full text-[10px] font-black uppercase text-primary flex items-center justify-center gap-2 tracking-[0.1em] bg-primary/5 hover:bg-primary/10 py-2.5 rounded-lg border border-primary/20 transition-all active:scale-95"
                              >
                                START_INVESTIGATION <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}


        {activeTab === 'ai-prompt' && (
          <div className="p-6 space-y-6">
            <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Terminal className="w-24 h-24" />
              </div>
              <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-2 relative z-10">
                AI RECOVERY HANDLER
              </h3>
              <p className="text-xs text-muted-foreground relative z-10 leading-relaxed mb-6 italic">
                Surgically fix all hardcoded credentials. This prompt is pre-configured for Cursor, GitHub Copilot, or any AI IDE to perform a zero-mistake remediation.
              </p>

              <button
                onClick={copyPrompt}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[0.98] active:scale-95 transition-all relative z-10 shadow-[0_10px_30px_rgba(var(--primary),0.3)]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied System Prompt' : 'Copy AI Fix Prompt'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Prompt Preview</h4>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
                </div>
              </div>
              <div className="bg-background/90 border border-border/40 rounded-xl p-5 font-mono text-[10px] text-muted-foreground/80 overflow-hidden relative shadow-inner">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                <pre className="whitespace-pre-wrap leading-relaxed">
                  {`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🤖 AI SECURITY FIX PROMPT
 (Copy and paste this into Cursor / Copilot / any AI IDE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I have a security issue in my codebase. 
Sensitive credentials are hardcoded in my source files.
Please help me fix this completely and safely.

STEP 1 — SCAN
  Search my entire codebase for any hardcoded:
  - API keys (OpenAI, Google, Anthropic, Stripe, etc.)
  - Passwords or secrets
  - Database connection strings containing credentials
  - JWT tokens
  - Private keys or certificates
...`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manual-guide' && (
          <div className="p-6 space-y-8 pb-12">
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl space-y-2">
              <h3 className="text-xs font-black uppercase text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> CRITICAL: READ BEFORE PROCEEDING
              </h3>
              <p className="text-[11px] leading-relaxed text-destructive/80 italic">
                If your secret was EVER pushed to GitHub, even for 1 second, treat it as <span className="font-black text-destructive">STOLEN</span>. Automated scanners identify these in milliseconds.
              </p>
              <div className="pt-2 text-[11px] font-black text-destructive uppercase tracking-widest">
                YOUR FIRST ACTION: ROTATE THE KEY IMMEDIATELY.
              </div>
            </div>

            <div className="space-y-12">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black border border-primary/20">01</div>
                  <h3 className="font-black uppercase tracking-tighter text-sm">Create your .env file</h3>
                </div>
                <div className="pl-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">A .env file stores secret values separately from your code. It lives in your project root but is NEVER committed to git.</p>
                  <div className="bg-black/95 p-5 rounded-lg border border-white/20 space-y-2 font-mono text-[11px] shadow-2xl overflow-x-auto relative group/env">
                    <div className="flex items-center justify-between mb-1 opacity-50 group-hover/env:opacity-100 transition-opacity">
                      <div className="text-primary/70 italic"># .env configuration</div>
                      <div className="text-[9px] uppercase tracking-widest text-primary/40">Read_Only</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-white whitespace-nowrap">OPENAI_API_KEY=<span className="text-emerald-400">sk-your-new-key-here</span></div>
                      <div className="text-white whitespace-nowrap">DATABASE_URL=<span className="text-emerald-400">postgres://user:pass@host/db</span></div>
                      <div className="text-white whitespace-nowrap">GOOGLE_API_KEY=<span className="text-emerald-400">AIza-your-key-here</span></div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black border border-primary/20 shrink-0">02</div>
                  <h3 className="font-black uppercase tracking-tighter text-sm">Update .gitignore</h3>
                </div>
                <div className="pl-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">Ensure git never tracks your secrets. Add these lines to your <code className="text-primary">.gitignore</code>:</p>
                  <div className="bg-black/90 p-4 rounded-lg border border-white/10 font-mono text-[11px] text-emerald-400/90 shadow-2xl overflow-x-auto">
                    .env<br />
                    .env.local<br />
                    .env.development<br />
                    .env.production
                  </div>
                  <div className="p-3 bg-primary/10 border-l-2 border-primary rounded-r-lg">
                    <p className="text-[10px] font-black uppercase text-primary mb-1 tracking-widest">PRO TIP</p>
                    <p className="text-[10px] text-muted-foreground italic leading-tight">If .env was already committed, run: <code className="text-white bg-black/60 px-1.5 py-0.5 rounded font-mono border border-white/10">git rm --cached .env</code></p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black border border-primary/20 shrink-0">03</div>
                  <h3 className="font-black uppercase tracking-tighter text-sm">Replace In Code</h3>
                </div>
                <div className="pl-4 space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">VITE / REACT</p>
                    <div className="bg-black/90 p-3 rounded-lg border border-white/10 font-mono text-[11px] overflow-x-auto">
                      <span className="text-emerald-400">const</span> apiKey = <span className="text-sky-400">import</span>.meta.env.VITE_API_KEY;
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">NODE.JS / NEXT.JS</p>
                    <div className="bg-black/90 p-3 rounded-lg border border-white/10 font-mono text-[11px] overflow-x-auto">
                      <span className="text-emerald-400">const</span> apiKey = process.env.API_KEY;
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black border border-primary/20 shrink-0">04</div>
                  <h3 className="font-black uppercase tracking-tighter text-sm">Verification</h3>
                </div>
                <div className="pl-4 space-y-3">
                  {[
                    "Search project for OLD key (0 results).",
                    "Check .env is ignored in git status.",
                    "Confirm app works with variables.",
                    "Set Production Envs in Vercel/Netlify."
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs text-muted-foreground bg-secondary/20 p-2 rounded border border-border/10">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <button
              onClick={() => window.open('https://gitguardian.com/blog', '_blank')}
              className="w-full flex items-center justify-between p-4 bg-secondary/30 border border-border/40 rounded-xl hover:bg-secondary/50 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-colors">
                  <ExternalLink className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-foreground">External Security Intel</h5>
                  <p className="text-[9px] text-muted-foreground italic">Learn from GitGuardian Experts</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-border group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Footer / Telemetry */}
      <div className="p-4 bg-card/80 border-t border-border/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${allIssues.length > 0 ? 'bg-destructive animate-pulse shadow-[0_0_8px_red]' : 'bg-success'}`} />
          <span className="text-[9px] font-mono font-black uppercase tracking-widest opacity-40">System_Status::{allIssues.length > 0 ? 'Fractured' : 'Shielded'}</span>
        </div>
        <div className="flex gap-1.5 p-1 bg-black/20 rounded-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= (allIssues.length) ? 'bg-destructive' : 'bg-primary/20'}`} />)}
        </div>
      </div>
    </div>
  );
}
