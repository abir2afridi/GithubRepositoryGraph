import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Languages } from 'lucide-react';

const T = {
  en: {
    title: 'Guide & Legend',
    symbols: 'Symbols & Meaning',
    entryPoint: ['⚡', 'Entry Point', 'Root/main file of the project'],
    chainOrder: ['#1 #2...', 'Chain Order', 'File order in dependency chain from root'],
    importEdge: ['→', 'Import Edge', 'This file imports another file'],
    selected: ['◉', 'Selected', 'Currently focused node'],
    dimmed: ['◌', 'Dimmed', 'Unrelated to current selection'],
    gutterDot: ['🔴', 'Gutter Dot', 'This code line connects to another file'],
    follow: ['[→]', 'Follow', 'Jump to connected file + exact line'],
    external: ['📦', 'External', 'Third-party package (npm, pip)'],
    unresolved: ['⚠️', 'Unresolved', 'Import target file not found in repo'],
    ignored: ['🔒', 'Ignored', 'File exists in .gitignore'],
    imports: ['↓2', 'Imports', 'This file imports 2 other files'],
    usedBy: ['↑1', 'Used By', 'This file is imported by 1 other file'],
    
    graphLegend: 'Graph Legend (H, L, C, M)',
    graphDesc: 'The letters H, L, C, M on the graph represent the Compute Complexity or logical complexity of a program:',
    critical: 'Critical (Extremely complex)',
    high: 'High (Highly complex)',
    medium: 'Medium (Moderate complexity)',
    low: 'Low (Simple / Basic)',
    graphTip: '💡 Now you can easily understand the complexity level of any file directly from the graph!',
    
    rightSidebar: 'Right Sidebar (Code Panel)',
    sidebarDesc: 'The Right Sidebar shows detailed metrics for a selected file. Here is how to read them:',
    isBinaryText: 'Checks if the file is a standard Text source or a Binary asset (images/compiled).',
    compWeightText: 'A measure of how much logical "weight" this file contributes to the bundle.',
    cxImpact: 'High CX means the logic is hard to follow. Solution: Use early returns or extract helper functions.',
    outImpact: 'High OUT means this file is a "Manager". It coordinates many other files.',
    inImpact: 'High IN means this file is a "Standard". Changing this will affect many parts of the project.',
    centImpact: 'Higher % means this file is a critical bridge in your dependency network.',
    
    leftSidebar: 'Architecture Assessment (Left Sidebar)',
    leftSidebarDesc: 'This panel provides a high-level overview of your project\'s structural integrity and complexity.',
    critLevelTitle: 'CRIT_LEVEL & RISK_INDEX',
    critLevelText: 'A weighted complexity score (0-10). Higher values indicate "spaghetti code" or overly dense logic. Risk Index (%) shows the probability of structural instability based on cycles and orphans.',
    computeMassTitle: 'COMPUTE_MASS & LOC',
    computeMassText: 'Compute Mass measures total logical density (logic depth + volume). LOC is the classic "Lines of Code". Together, they show if your project is "heavy" or "lean".',
    activeNodesTitle: 'ACTIVE_NODES & VECTOR_EDGES',
    activeNodesText: 'Nodes represent individual files. Edges represent the import links between them. Shows the visual scale of your source tree.',
    
    healthMonitorsTitle: 'Architectural Health Monitors',
    orphansText: 'Orphans: These files are not imported by any other file. They might be dead code or newly created files yet to be connected.',
    droppedText: 'Dropped: Unresolved imports where the target file could not be found within the repository (broken links).',
    cyclesText: 'Cycles: Circular dependencies (A → B → A). These make the project fragile and extremely hard to refactor or test.',
    
    howToReduceRiskTitle: 'How to reduce risk?',
    howToReduceRiskDesc: 'Follow these best practices to improve project health:',
    solution1: 'Split large complex files into smaller, reusable components.',
    solution2: 'Fix cycles by moving shared logic to a separate shared/common file.',
    solution3: 'Remove or integrate Orphan files to eliminate dead code.',
    solution4: 'Verify and fix broken imports (Dropped) to ensure build stability.',
    
    languageSpectrum: 'Language Spectrum (Global View)',
    languageSpectrumDesc: 'Shows the technological makeup of your project. Each color represents a different file type.',
    unitsText: 'Units: The total count of files for that specific language/format.',
    percentageText: 'Percentage (%): The distribution of logical weight or file volume across the project.',
    spectrumTip: '💡 Use this to see if your project is primarily React, TypeScript, or if it contains too many heavy assets.',
    
    fileIcons: 'File Type Icons',
    shortcuts: 'Keyboard Shortcuts',
    search: 'Search/find file in graph',
    fitScreen: 'Fit all nodes to screen',
    export: 'Open export modal',
    deselect: 'Deselect / close panels',
    navHistory: 'Navigate code history',
    selectNode: 'Select & highlight connections',
    openCode: 'Open in code view',
    zoom: 'Zoom in/out',
    moveNode: 'Move freely',
    pan: 'Pan canvas',
    
    fileNumbers: 'How File Numbers Work',
    fileNumbersDesc1: 'Files are numbered starting from',
    fileNumbersDesc2: '#1',
    fileNumbersDesc3: '(entry point). Each file that the entry imports becomes #2, #3, etc. Files deeper in the chain get higher numbers. This shows you the order in which your project "wakes up".',
  },
  bn: {
    title: 'গাইড এবং লিজেন্ড',
    symbols: 'সিম্বল এবং এর অর্থ',
    entryPoint: ['⚡', 'Entry Point', 'প্রোজেক্টের রুট বা মেইন ফাইল'],
    chainOrder: ['#1 #2...', 'Chain Order', 'রুট থেকে ফাইলের চেইন বা সিরিয়াল'],
    importEdge: ['→', 'Import Edge', 'এই ফাইলটি অন্য কোনো ফাইলকে ইমপোর্ট করে'],
    selected: ['◉', 'Selected', 'বর্তমানে ফোকাস করা নোড'],
    dimmed: ['◌', 'Dimmed', 'বর্তমান সিলেকশনের সাথে সম্পর্কহীন'],
    gutterDot: ['🔴', 'Gutter Dot', 'এই লাইনটি অন্য কোনো ফাইলের সাথে কানেক্টেড'],
    follow: ['[→]', 'Follow', 'কানেকশন হওয়া ফাইলে সরাসরি জাম্প করুন'],
    external: ['📦', 'External', 'থার্ড-পার্টি প্যাকেজ (npm, pip)'],
    unresolved: ['⚠️', 'Unresolved', 'ইমপোর্ট করা ফাইলটি প্রোজেক্টে পাওয়া যায়নি'],
    ignored: ['🔒', 'Ignored', 'ফাইলটি .gitignore এর লিস্টে আছে'],
    imports: ['↓2', 'Imports', 'এই ফাইলটি ২টি অন্য ফাইলকে ইমপোর্ট করে'],
    usedBy: ['↑1', 'Used By', 'ফাইলটি ১টি অন্য ফাইল কর্তৃক ইমপোর্টেড'],
    
    graphLegend: 'গ্রাফের লিজেন্ড (H, L, C, M)',
    graphDesc: 'গ্রাফে থাকা <strong>H, L, C, M</strong> লেটারগুলো মূলত ফাইলের <strong>Compute Complexity</strong> বা প্রোগ্রামের লজিক্যাল জটিলতা বোঝায়:',
    critical: 'Critical (খুবই বেশি জটিল)',
    high: 'High (বেশি জটিল)',
    medium: 'Medium (মাঝারি মানের)',
    low: 'Low (সহজ / সাধারণ মানের)',
    graphTip: '💡 এখন আপনি গ্রাফ থেকে সহজেই বুঝতে পারবেন কোন ফাইলের কমপ্লেক্সিটি লেভেল কত!',
    
    rightSidebar: 'Right Sidebar (Code Panel)',
    sidebarDesc: 'কোড ভিউ প্যানেল তথা রাইট সাইডবারে ফাইলের মেটাডেটা সেকশনের ইনফরমেশনগুলোর অর্থ নিচে দেয়া হলো:',
    isBinaryText: 'ফাইলটি কি সোর্স কোড (FALSE) নাকি কোনো ইমেজ/মিডিয়া (TRUE) ফাইল তা নির্দেশ করে।',
    compWeightText: 'এই ফাইলটি আপনার প্রোজেক্টের মোট ভলিউমে কতটা লজিক্যাল ওজন যোগ করছে তার পরিমাপ।',
    cxImpact: 'CX বেশি মানে কোডটি বুঝতে কঠিন। সমাধান: বড় লজিকগুলোকে ছোট ফাংশানে ভাগ করুন।',
    outImpact: 'OUT বেশি মানে এই ফাইলটি অনেক ফাইলকে নিয়ন্ত্রণ করে। এটি একটি "Manager" ফাইল।',
    inImpact: 'IN বেশি মানে অনেক ফাইল এর ওপর নির্ভর করে। এটি পরিবর্তন করলে পুরো অ্যাপে প্রভাব পড়বে।',
    centImpact: 'এই শতাংশ যত বেশি, প্রোজেক্টের নেটওয়ার্কে এই ফাইলটি তত বেশি গুরুত্বপূর্ণ সেতু হিসেবে কাজ করে।',
    
    leftSidebar: 'প্রোজেক্ট হেলথ অ্যাসেসমেন্ট (Left Sidebar)',
    leftSidebarDesc: 'এই প্যানেলটি আপনার পুরো প্রোজেক্টের গঠনগত স্থায়িত্ব এবং জটিলতার একটি ওভারভিউ দেয়।',
    critLevelTitle: 'CRIT_LEVEL এবং RISK_INDEX',
    critLevelText: 'এটি প্রোজেক্টের জটিলতার একটি স্কোর (০-১০)। স্কোর যত বেশি, কোড তত জটিল বা "অগোছালো"। রিস্ক ইনডেক্স (%) মূলত সার্কুলার ডিপেন্ডেন্সি এবং অরফ্যান ফাইলের ওপর ভিত্তি করে ঝুঁকির পরিমাণ বোঝায়।',
    computeMassTitle: 'COMPUTE_MASS এবং LOC',
    computeMassText: 'কম্পিউট মাস মূলত কোডের লজিক্যাল গভীরতা ও ঘনত্ব পরিমাপ করে। LOC মানে "Lines of Code" বা মোট লাইনের সংখ্যা। এই দুটি মিলে বোঝায় আপনার প্রোজেক্টটি কত বড় এবং জটিল।',
    activeNodesTitle: 'ACTIVE_NODES এবং VECTOR_EDGES',
    activeNodesText: 'Nodes হলো প্রোজেক্টের প্রতিটি ফাইল। Edges হলো তাদের মধ্যকার ইমপোর্ট কানেকশন বা লিংক। এটি আপনার সোর্স ট্রির আয়তন নির্দেশ করে।',
    
    healthMonitorsTitle: 'আর্কিটেকচারাল হেলথ মনিটরস',
    orphansText: 'Orphans: এই ফাইলগুলো অন্য কোনো ফাইল ইমপোর্ট করে না। এগুলো হয়তো ডেড কোড অথবা নতুন তৈরি ফাইল যা এখনো কানেক্ট করা হয়নি।',
    droppedText: 'Dropped: এই ইমপোর্টগুলোর টার্গেট ফাইলটি প্রোজেক্টের ভেতরে খুঁজে পাওয়া যায়নি (ব্রোকেন লিংক)।',
    cyclesText: 'Cycles: গোলকধাঁধা বা চক্রাকার জটিলতা (A ফাইল B-কে চেনে, আবার B চেনে A-কে)। এটি কোড মেইনটেইন করা কঠিন করে তোলে।',
    
    howToReduceRiskTitle: 'রিস্ক কমানোর উপায় কী?',
    howToReduceRiskDesc: 'প্রোজেক্টের স্বাস্থ্য উন্নত করতে নিচের টিপসগুলো ফলো করুন:',
    solution1: 'বড় এবং জটিল ফাইলগুলোকে ছোট ছোট কম্পোনেন্টে ভাগ করে ফেলুন।',
    solution2: 'শেয়ারড লজিক আলাদা ফাইলে নিয়ে "Cycles" বা চক্রাকার জটিলতা দূর করুন।',
    solution3: 'অব্যব্যবহৃত (Orphan) ফাইলগুলো হয় সরিয়ে ফেলুন না হয় কানেক্ট করুন।',
    solution4: 'ব্রোকেন ইমপোর্ট (Dropped) গুলো ফিক্স করে বিল্ড স্ট্যাবিলিটি নিশ্চিত করুন।',
    
    languageSpectrum: 'ল্যাংগুয়েজ স্পেকট্রাম (Global View)',
    languageSpectrumDesc: 'আপনার প্রোজেক্টে কোন ধরনের ফাইলের আধিক্য বেশি তা এখান থেকে দেখা যায়।',
    unitsText: 'Units: ওই নির্দিষ্ট ল্যাংগুয়েজ বা ফরমেটের মোট কয়টি ফাইল প্রোজেক্টে আছে।',
    percentageText: 'Percentage (%): পুরো প্রোজেক্টের ওজনের তুলনায় কত শতাংশ ওই ল্যাংগুয়েজ দখল করে আছে।',
    spectrumTip: '💡 এর মাধ্যমে আপনি সহজেই বুঝতে পারবেন আপনার প্রোজেক্টটি মূলত কোন ল্যাংগুয়েজ বা ফ্রেমওয়ার্কের ওপর ভিত্তি করে তৈরি।',
    
    fileIcons: 'ফাইলের আইকন সমূহ',
    shortcuts: 'কিবোর্ড শর্টকাট',
    search: 'ফাইন্ড / সার্চ ফাইল',
    fitScreen: 'স্ক্রিন অনুযায়ী ফিট করুন',
    export: 'এক্সপোর্ট উইন্ডো খুলুন',
    deselect: 'সিলেকশন রিমুভ / প্যানেল ক্লোজ',
    navHistory: 'হিস্ট্রি নেভিগেট করুন',
    selectNode: 'সিলেক্ট এবং হাইলাইট কানেকশন',
    openCode: 'কোড ভিউ ওপেন করুন',
    zoom: 'জুম ইন / আউট',
    moveNode: 'ইচ্ছেমতো সরান',
    pan: 'ক্যানভাস প্যান করুন',
    
    fileNumbers: 'ফাইলের নাম্বার কীভাবে কাজ করে',
    fileNumbersDesc1: 'ফাইলগুলোর নাম্বারিং শুরু হয়',
    fileNumbersDesc2: '#1',
    fileNumbersDesc3: '(এন্ট্রি পয়েন্ট) থেকে। #1 ফাইলটি যে ফাইলগুলোকে ইমপোর্ট করে, সেগুলো যথাক্রমে #2, #3 ইত্যাদি হয়। চেইনে ফাইলের গভীরতা যত বাড়ে নাম্বারও তত বাড়ে। এর মাধ্যমে বুঝতে পারবেন কোন ফাইলের পর কোন ফাইল লোড হচ্ছে।',
  }
};


export function GuidePanel() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const { guideOpen, toggleGuide } = useStore();
  
  if (!guideOpen) return null;

  const t = T[lang];

  return (
    <div className="absolute top-20 left-4 w-[420px] max-h-[80vh] bg-card/95 backdrop-blur-xl border border-border/80 rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden flex flex-col"
      style={{ animation: 'panel-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-secondary/20">
        <h3 className="font-sans font-black text-[13px] tracking-[0.2em] uppercase text-foreground">{t.title}</h3>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-background/50 border border-border/50 rounded-md p-0.5 shadow-inner">
            <button 
              onClick={() => setLang('en')} 
              className={`px-2 py-1 text-[10px] font-bold rounded-sm transition-all ${lang === 'en' ? 'bg-primary/20 text-primary shadow-sm' : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5'}`}>
              ENG
            </button>
            <button 
              onClick={() => setLang('bn')} 
              className={`px-2 py-1 text-[10px] font-bold rounded-sm transition-all ${lang === 'bn' ? 'bg-primary/20 text-primary shadow-sm' : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5'}`}>
              বাং
            </button>
          </div>
          
          <button onClick={toggleGuide} className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-all font-mono">✕</button>
        </div>
      </div>
      <div className="p-5 overflow-y-auto scrollbar-thin space-y-6 text-xs flex-1">
        
        <section>
          <h4 className="font-display font-semibold text-sm mb-3 text-primary tracking-wide uppercase">{t.leftSidebar}</h4>
          <p className="text-[12px] text-muted-foreground/80 leading-relaxed mb-4">
            {t.leftSidebarDesc}
          </p>
          <div className="space-y-5 bg-secondary/15 p-5 rounded-xl border border-border/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
             <div className="space-y-4">
                <div className="group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span className="font-black text-foreground/90 text-[10px] font-mono tracking-tighter uppercase">{t.critLevelTitle}</span>
                  </div>
                  <p className="text-[12px] text-foreground/60 leading-relaxed pl-3.5 border-l border-destructive/20 mb-3">{t.critLevelText}</p>
                  
                  {/* Solution Guide */}
                  <div className="ml-3.5 mt-2 bg-destructive/5 border border-destructive/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-bold uppercase tracking-wider">{t.howToReduceRiskTitle}</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-foreground/70">
                      <li className="flex gap-2 leading-relaxed italic opacity-80 decoration-destructive/30 border-b border-white/5 pb-1">
                        <span className="text-destructive">→</span> {t.solution1}
                      </li>
                      <li className="flex gap-2 leading-relaxed italic opacity-80 decoration-destructive/30 border-b border-white/5 pb-1">
                        <span className="text-destructive">→</span> {t.solution2}
                      </li>
                      <li className="flex gap-2 leading-relaxed italic opacity-80 decoration-destructive/30 border-b border-white/5 pb-1">
                        <span className="text-destructive">→</span> {t.solution3}
                      </li>
                      <li className="flex gap-2 leading-relaxed italic opacity-80">
                        <span className="text-destructive">→</span> {t.solution4}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <span className="font-black text-foreground/90 text-[10px] font-mono tracking-tighter uppercase">{t.computeMassTitle}</span>
                  </div>
                  <p className="text-[12px] text-foreground/60 leading-relaxed pl-3.5 border-l border-primary/20">{t.computeMassText}</p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="font-black text-foreground/90 text-[10px] font-mono tracking-tighter uppercase">{t.activeNodesTitle}</span>
                  </div>
                  <p className="text-[12px] text-foreground/60 leading-relaxed pl-3.5 border-l border-accent/20">{t.activeNodesText}</p>
                </div>
                
                <div className="pt-2">
                   <div className="bg-background/40 p-3 rounded-lg border border-border/20">
                      <span className="font-black text-primary/80 text-[10px] uppercase tracking-[0.15em] block mb-2">{t.healthMonitorsTitle}</span>
                      <div className="space-y-2.5">
                        <div className="flex gap-2.5">
                          <span className="text-muted-foreground/30 font-mono text-[10px] mt-0.5">●</span>
                          <span className="text-[11px] text-foreground/80 leading-relaxed">{t.orphansText}</span>
                        </div>
                        <div className="flex gap-2.5">
                          <span className="text-muted-foreground/30 font-mono text-[10px] mt-0.5">●</span>
                          <span className="text-[11px] text-foreground/80 leading-relaxed">{t.droppedText}</span>
                        </div>
                        <div className="flex gap-2.5">
                          <span className="text-muted-foreground/30 font-mono text-[10px] mt-0.5">●</span>
                          <span className="text-[11px] text-foreground/80 leading-relaxed">{t.cyclesText}</span>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        <div className="h-px bg-border/40" />

        <section>
          <h4 className="font-display font-semibold text-sm mb-3 text-primary tracking-wide uppercase">{t.languageSpectrum}</h4>
          <p className="text-[12px] text-muted-foreground/80 leading-relaxed mb-3">
            {t.languageSpectrumDesc}
          </p>
          <div className="bg-secondary/10 p-4 rounded-lg border border-border/20 shadow-inner">
             {/* Micro Spectrum Bar */}
             <div className="flex h-1.5 w-full rounded-full overflow-hidden mb-4 bg-muted/20">
                <div className="bg-blue-400 w-[40%]"></div>
                <div className="bg-primary w-[30%]"></div>
                <div className="bg-zinc-500 w-[20%]"></div>
                <div className="bg-accent w-[10%]"></div>
             </div>
             
             <div className="space-y-3">
                <div className="flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shadow-[0_0_5px_rgba(59,130,246,0.3)]"></div>
                   <div className="flex flex-col">
                      <span className="font-bold text-[11px] text-foreground/90 uppercase tracking-widest leading-none mb-1">UNITS</span>
                      <p className="text-[11px] text-foreground/60 leading-relaxed">{t.unitsText}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shadow-[0_0_5px_rgba(16,185,129,0.3)]"></div>
                   <div className="flex flex-col">
                      <span className="font-bold text-[11px] text-foreground/90 uppercase tracking-widest leading-none mb-1">PERCENTAGE (%)</span>
                      <p className="text-[11px] text-foreground/60 leading-relaxed">{t.percentageText}</p>
                   </div>
                </div>
             </div>
             
             <p className="text-[11px] text-primary/70 mt-4 font-medium italic border-t border-border/10 pt-3">
                {t.spectrumTip}
             </p>
          </div>
        </section>

        <div className="h-px bg-border/40" />

        <section>
          <h4 className="font-display font-semibold text-sm mb-3 text-primary tracking-wide uppercase">{t.graphLegend}</h4>
          <p className="text-[12px] text-muted-foreground/80 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: t.graphDesc }}></p>
          <div className="space-y-2.5 bg-secondary/20 p-4 rounded-lg border border-border/40 shadow-inner">
             <div className="flex items-center gap-3"><span className="w-5 h-5 rounded bg-destructive/30 text-destructive flex items-center justify-center font-black text-xs border border-destructive/50">C</span> <span className="text-[12px] font-medium">{t.critical}</span></div>
             <div className="flex items-center gap-3"><span className="w-5 h-5 rounded bg-warn/30 text-warn flex items-center justify-center font-black text-xs border border-warn/50">H</span> <span className="text-[12px] font-medium">{t.high}</span></div>
             <div className="flex items-center gap-3"><span className="w-5 h-5 rounded bg-warn/20 text-warn flex items-center justify-center font-black text-xs border border-warn/40">M</span> <span className="text-[12px] font-medium">{t.medium}</span></div>
             <div className="flex items-center gap-3"><span className="w-5 h-5 rounded bg-success/20 text-success flex items-center justify-center font-black text-xs border border-success/40">L</span> <span className="text-[12px] font-medium">{t.low}</span></div>
          </div>
          <p className="text-[11px] text-primary/80 mt-3 font-semibold tracking-wide">
            {t.graphTip}
          </p>
        </section>

        <div className="h-px bg-border/40" />

        <section>
          <h4 className="font-display font-semibold text-sm mb-3 text-primary tracking-wide uppercase">{t.rightSidebar}</h4>
          <p className="text-[12px] text-muted-foreground/80 leading-relaxed mb-4">
            {t.sidebarDesc}
          </p>
          <div className="space-y-5 bg-secondary/15 p-5 rounded-xl border border-border/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
             
             <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <span className="font-black text-foreground text-[10px] font-mono border border-border/40 px-2 py-1 rounded-md bg-background/50 tracking-widest uppercase block w-fit">CX::SCORE</span>
                  <p className="text-[11px] text-foreground/60 leading-relaxed italic">{t.cxImpact}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="font-black text-foreground text-[10px] font-mono border border-border/40 px-2 py-1 rounded-md bg-background/50 tracking-widest uppercase flex items-center inline-flex gap-2">↓ OUT</span>
                    <p className="text-[11px] text-foreground/60 mt-1.5 leading-relaxed">{t.outImpact}</p>
                  </div>
                  <div>
                    <span className="font-black text-foreground text-[10px] font-mono border border-border/40 px-2 py-1 rounded-md bg-background/50 tracking-widest uppercase flex items-center inline-flex gap-2">↑ IN</span>
                    <p className="text-[11px] text-foreground/60 mt-1.5 leading-relaxed">{t.inImpact}</p>
                  </div>
                </div>
             </div>
             
             <div className="h-px bg-border/20 my-2" />

             <div className="space-y-4">
               <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                    <span className="font-black text-primary/90 text-[10px] font-mono tracking-widest uppercase">COMPUTATIONAL WEIGHT</span>
                  </div>
                  <p className="text-[11px] text-foreground/70 pl-3.5 border-l border-primary/20">{t.compWeightText}</p>
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/60"></div>
                    <span className="font-black text-accent/90 text-[10px] font-mono tracking-widest uppercase">CENTRALITY INDEX</span>
                  </div>
                  <p className="text-[11px] text-foreground/70 pl-3.5 border-l border-accent/20">{t.centImpact}</p>
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-success/60"></div>
                    <span className="font-black text-success/90 text-[10px] font-mono tracking-widest uppercase">IS_BINARY</span>
                  </div>
                  <p className="text-[11px] text-foreground/70 pl-3.5 border-l border-success/20">{t.isBinaryText}</p>
               </div>
             </div>
          </div>
        </section>

        <div className="h-px bg-border/40" />

        <section>
          <h4 className="font-display font-semibold text-sm mb-3 text-foreground/90 tracking-wide uppercase">{t.symbols}</h4>
          <div className="space-y-2">
            {[
              t.entryPoint, t.chainOrder, t.importEdge, t.selected, t.dimmed,
              t.gutterDot, t.follow, t.external, t.unresolved, t.ignored, t.imports, t.usedBy
            ].map(([icon, title, desc], i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 text-center flex-shrink-0 mt-0.5 font-mono text-[11px] font-bold text-primary/80">{icon}</span>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground/80">{title}</span>
                  <span className="text-muted-foreground/60 text-[11px]">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border/40" />

        <section>
          <h4 className="font-display font-semibold text-sm mb-3 text-foreground/90 tracking-wide uppercase">{t.fileIcons}</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['TS', 'TypeScript', 'hsl(210, 80%, 55%)'],
              ['JS', 'JavaScript', 'hsl(48, 90%, 55%)'],
              ['⚛', 'React', 'hsl(195, 80%, 55%)'],
              ['🌐', 'HTML', 'hsl(16, 90%, 55%)'],
              ['🎨', 'CSS/SCSS', 'hsl(210, 90%, 55%)'],
              ['🐍', 'Python', 'hsl(120, 50%, 50%)'],
              ['{ }', 'JSON', 'hsl(220, 10%, 60%)'],
              ['V', 'Vue', 'hsl(153, 65%, 50%)'],
              ['S', 'Svelte', 'hsl(16, 90%, 55%)'],
              ['PHP', 'PHP', 'hsl(260, 50%, 55%)'],
              ['📄', 'Markdown', 'hsl(220, 10%, 70%)'],
              ['🖼', 'Images', 'hsl(280, 60%, 55%)'],
            ].map(([icon, name, color], i) => (
              <div key={i} className="flex items-center gap-2 py-0.5 bg-background/30 rounded border border-border/20 px-2">
                <span className="w-5 text-center text-[10px] font-mono font-black" style={{ color }}>{icon}</span>
                <span className="text-muted-foreground/70 font-medium">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border/40" />

        <section>
          <h4 className="font-display font-semibold text-sm mb-3 text-foreground/90 tracking-wide uppercase">{t.shortcuts}</h4>
          <div className="space-y-1.5">
            {[
              ['Ctrl+F', t.search],
              ['Ctrl+Shift+F', t.fitScreen],
              ['Ctrl+E', t.export],
              ['Escape', t.deselect],
              ['← →', t.navHistory],
              ['Click', t.selectNode],
              ['Double-click', t.openCode],
              ['Scroll', t.zoom],
              ['Drag node', t.moveNode],
              ['Drag bg', t.pan],
            ].map(([key, desc], i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-mono font-black border border-border/40 bg-secondary/80 px-2 py-1 rounded text-[9px] w-24 text-center tracking-widest text-primary/80 shadow-sm">{key}</span>
                <span className="text-muted-foreground/70 font-medium">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border/40" />

        <section>
          <h4 className="font-display font-semibold text-sm mb-3 text-foreground/90 tracking-wide uppercase">{t.fileNumbers}</h4>
          <p className="text-muted-foreground/70 leading-relaxed mb-3">
            {t.fileNumbersDesc1} <span className="text-primary font-mono font-black bg-primary/10 px-1 rounded mx-0.5">{t.fileNumbersDesc2}</span> {t.fileNumbersDesc3}
          </p>
          <div className="bg-background/50 border border-border/50 rounded-lg p-4 font-mono text-[11px] text-foreground/70 shadow-inner">
            <div className="text-primary font-black mb-1.5">#1 main.tsx</div>
            <div className="ml-4 border-l border-border/50 pl-3 py-1 space-y-1.5">
              <div className="relative"><span className="absolute -left-3 top-2 w-2 h-px bg-border/50"></span><span className="text-foreground/80 font-bold">#2 App.tsx</span></div>
              <div className="relative"><span className="absolute -left-3 top-2 w-2 h-px bg-border/50"></span><span className="text-muted-foreground/70">#3 Header.tsx</span></div>
              <div className="relative"><span className="absolute -left-3 top-2 w-2 h-px bg-border/50"></span><span className="text-muted-foreground/70">#4 Dashboard.tsx</span>
                <div className="ml-4 border-l border-border/50 pl-3 py-1 space-y-1.5 mt-1">
                  <div className="relative"><span className="absolute -left-3 top-2 w-2 h-px bg-border/50"></span><span className="text-muted-foreground/50">#5 Chart.tsx</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
