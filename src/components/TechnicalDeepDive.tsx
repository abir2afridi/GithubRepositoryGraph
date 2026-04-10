import React, { useEffect, useState, useRef } from 'react';
import { X, Terminal, Languages, Cpu, ShieldCheck } from 'lucide-react';

interface TechSectionProps {
  icon: React.ReactNode;
  title: string;
  step: string;
  children: React.ReactNode;
}

function TechSection({ icon, title, step, children }: TechSectionProps) {
  return (
    <div className="border border-border/30 bg-card/10 backdrop-blur-sm p-6 space-y-4 hover:border-primary/30 transition-colors group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 text-[8px] font-black font-mono text-foreground/10 uppercase tracking-widest group-hover:text-primary/20 transition-colors">
        NODE_UID: {Math.random().toString(16).slice(2, 8).toUpperCase()}
      </div>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
          {icon}
        </div>
        <div>
          <div className="text-[10px] font-black font-mono text-primary uppercase tracking-[0.3em]">{step}</div>
          <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
        </div>
      </div>
      <div className="space-y-4 text-foreground/70 text-[13px] leading-relaxed font-sans">
        {children}
      </div>
    </div>
  );
}

function TechCodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="space-y-1 my-4">
      {label && <div className="text-[9px] font-bold font-mono text-foreground/30 uppercase ml-1 tracking-widest">{label}</div>}
      <pre className="bg-black/80 border border-border/50 p-4 font-mono text-[11px] text-cyan-400 overflow-x-auto selection:bg-cyan-500/20 leading-relaxed shadow-inner custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function DeepDiveNote({ children, title = "INTERNAL_LOGIC" }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-black text-primary tracking-widest">
        <Cpu className="w-3 h-3" /> {title}
      </div>
      <div className="text-[11px] leading-relaxed opacity-80 whitespace-pre-wrap">
        {children}
      </div>
    </div>
  )
}

// Fixed Interface for consistency
interface StepData {
  title: string;
  step: string;
  deep: string;
  // Common keys initialized with empty strings to prevent TS errors
  github: string;
  githubDesc: string;
  githubAPI: string;
  call1: string;
  call2: string;
  lazy: string;
  local: string;
  localDesc: string;
  worker: string;
  patterns: string;
  resolution: string;
  special: string;
  circular: string;
  entry: string;
  complexity: string;
  orphan: string;
  theory: string;
  nodes: string;
  edges: string;
  bfs: string;
  physics: string;
  params: string;
  layouts: string;
  canvas: string;
  monaco: string;
  env: string;
  decorations: string;
  hovers: string;
  follow: string;
  state: string;
  split: string;
  zustand: string;
  stores: string;
  zip: string;
  formats: string;
  image: string;
  lod: string;
  cleanup: string;
  cache: string;
  virtual: string;
}

interface Translation {
  header: string;
  version: string;
  title: string;
  subtitle: string;
  steps: {
    s1: StepData;
    s2: StepData;
    s3: StepData;
    s4: StepData;
    s5: StepData;
    s6: StepData;
    s7: StepData;
    s8: StepData;
  };
  privacy: {
    title: string;
    desc: string;
    encryption: string;
  };
}

export function TechnicalDeepDive({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setMounted(true), 50);
    } else {
      document.body.style.overflow = 'auto';
      setMounted(false);
    }
  }, [isOpen]);

  // Smooth scroll logic for the container
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollBehavior = 'smooth';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const emptyStep: StepData = {
    title: "", step: "", deep: "", github: "", githubDesc: "", githubAPI: "", call1: "", call2: "", lazy: "", local: "", localDesc: "",
    worker: "", patterns: "", resolution: "", special: "", circular: "", entry: "", complexity: "", orphan: "", theory: "", nodes: "",
    edges: "", bfs: "", physics: "", params: "", layouts: "", canvas: "", monaco: "", env: "", decorations: "", hovers: "", follow: "",
    state: "", split: "", zustand: "", stores: "", zip: "", formats: "", image: "", lod: "", cleanup: "", cache: "", virtual: ""
  };

  const t: Record<'en' | 'bn', Translation> = {
    en: {
      header: "TECHNICAL_ARCHITECTURE_CORE",
      version: "SYSTEM_VERSION 4.2.0 :: FULL_SPECIFICATION",
      title: "REPOGRAPH — ABSOLUTE DOCUMENTATION",
      subtitle: "RepoGraph is a specialized static analysis engine. Every line is engineered for maximum client-side performance. We transform code into an interactive map.",
      steps: {
        s1: {
          ...emptyStep,
          title: "INGESTION & VIRTUALIZATION",
          step: "STEP 01",
          github: "[A] GITHUB CLOUD GATEWAY",
          githubDesc: "Atomic URL decomposition using segmented Regex groups. It handles sub-directories, specific branches, and commit hashes via Octokit REST.",
          githubAPI: "Atomic REST Cycle:",
          call1: "Recursion Level: Infinity — Fetches every node in a single JSON payload (~7MB limit).",
          call2: "Metadata Sync: Syncs Stars, Forks, Watchers, and Language breakdown stats.",
          lazy: "Lazy-Loading: File blobs are fetched only when requested, minimizing initial bandwidth.",
          local: "[B] SYSTEM_FILE_HANDLES",
          localDesc: "Utilizes the modern W3C FileSystem API. Convert native handles into virtual paths for zero-latency random access safely.",
          deep: "INTERNAL LOGIC: Flat paths are transformed into a Trie-like structure using a recursive reducer function. This ensures parent directories are logically initialized before children."
        },
        s2: {
          ...emptyStep,
          title: "INTELLIGENT PARSING",
          step: "STEP 02",
          worker: "Off-thread execution using `WorkerSync`. Independent V8 contexts process regex-loops, keeping the Main Thread available for 120Hz UI rendering.",
          patterns: "EXTENDED REGEX ENGINE:",
          resolution: "PATH RESOLUTION: Trials [EXT].ts, .tsx, .js, .jsx, and /index.ts. Cross-reference with memory nodes to flag EXTERNAL_MODULE.",
          special: "ADVANCED LOGIC PROTOCOLS:",
          circular: "DFS Cycle Detection: Uses Recursion Stack to identify dependency loops.",
          entry: "Heuristic Ranking: Scores based on filename (index, main, app) and zero In-Degree count.",
          complexity: "Halstead Metrics: Assigns weights (1.0 vs 0.5) to operators and jumps.",
          orphan: "Isolation Check: Node Degree Check (In+Out === 0) handles redundant files.",
          deep: "AST VS REGEX: Uses optimized Regex for 1000x faster performance on large repos. Negative Lookbehind excludes comments and static strings."
        },
        s3: {
          ...emptyStep,
          title: "GRAPH THEORY ENGINE",
          step: "STEP 03",
          theory: "ADJACENCY_LIST ARCHITECTURE:",
          nodes: "NODE SHAPE: Typed objects containing Adjacency Lists and Complexity Scores.",
          edges: "EDGE LOGIC: Composite key 'src:target' for O(1) deduplication and instant lookup.",
          bfs: "Graph Depth & Ranking: Calculated using BFS to determine vertical/horizontal distribution in the matrix.",
          deep: "CIRCULAR LOGIC: Implements DFS algorithm for recursion detection. Cycles are visually marked with 'Dashed Red' borders."
        },
        s4: {
          ...emptyStep,
          title: "PHYSICS & RENDERING",
          step: "STEP 04",
          physics: "PHYSICS_ENGINE (D3-Force):",
          params: "Runs 300 iterations (cooling phase) using: Charge (-1000), Link Distance (100), Gravity (0.1).",
          layouts: "LAYOUT ALGORITHM: Applied to 2D plane with 'ManyBody' repulsion for breathable structure.",
          canvas: "Occlusion Culling: layer only re-draws nodes visible in viewport, managing 10k+ nodes safely.",
          deep: "CHAIN LINKS: Samples the SVG path every 20px using `getPointAtLength` to inject flow indicators showing data direction."
        },
        s5: {
          ...emptyStep,
          title: "CODE ANALYSIS (MONACO)",
          step: "STEP 05",
          monaco: "MONACO_SYSTEM_BRIDGE:",
          env: "Full IDE experience. Monarch tokenizer manages syntax with custom Logic Layer injection.",
          decorations: "GUTTER LOGIC: Maps graph 'Edge' data to Monaco's `deltaDecorations` buffer for interactive markers.",
          hovers: "INTELLIGENT HOVER: Custom `HoverProvider` fetches target node complexity and dependency stats.",
          follow: "NAVIGATOR: Location Stack (LIFO) maintained for 'Follow' definition jumps.",
          complexity: "Halstead Math: Volume and Difficulty determine color saturation and ripple intensity.",
          deep: "MEMORY_BUFFER: Virtual Viewport rendering keeps browser memory usage below 250MB even for massive files."
        },
        s6: {
          ...emptyStep,
          title: "STATE SYNCHRONIZATION",
          step: "STEP 06",
          state: "ZUSTAND_IMMUTABLE_STORE:",
          split: "Atomic store splitting: Separate stores for REPO (Data) and GRAPH (Visual) and UI (Local).",
          zustand: "Zustand Middleware (Immutable State): Selective subscription optimized for large updates.",
          stores: "Separation of concerns: Heavy data structures kept outside the React tree.",
          deep: "PERSISTENCE: IndexedDB Graph Cache used for large data (exceeding LocalStorage's 5MB limit)."
        },
        s7: {
          ...emptyStep,
          title: "EXPORT & MOBILITY",
          step: "STEP 07",
          zip: "JSZip serialization: Bundles analyzed codebase into standard ZIP format entirely in-memory.",
          formats: "EXPORT FORMATS: PNG (2x High Res), SVG (Vector), ZIP (Bundle), JSON (Data).",
          image: "High-Resolution Compositing: html2canvas captures SVG/HTML hybrid layers at 2x scale.",
          deep: "METADATA_INJECTION: SVG files contain hidden XML blocks with graph metadata for future smart imports."
        },
        s8: {
          ...emptyStep,
          title: "OPTIMIZATION LAYER",
          step: "STEP 08",
          lod: "LOD (Level of Detail): Hides labels and detailed strokes at low zoom to maintain 60+ FPS.",
          cleanup: "GC (Garbage Collection): Manual `URL.revokeObjectURL` calls release memory on node disposal.",
          cache: "O(1) Access: Every file indexed by absolute path for instant lookup.",
          virtual: "DOM Lifecycle: Sidebar virtualization renders only 15-20 rows regardless of repo size.",
          deep: "PARALLEL_CHUNKING: Large repos split into chunks and processed by dedicated workers for responsiveness."
        }
      },
      privacy: {
        title: "SECURITY & PRIVACY PROTOCOL",
        desc: "RepoGraph is a 100% Client-Side application. Your code NEVER leaves your machine. No telemetry used.",
        encryption: "HTTPS encrypted GitHub API calls. Local file handles discarded upon session termination."
      }
    },
    bn: {
      header: "টেকনিক্যাল_আর্কিটেকচার_কোর",
      version: "সিস্টেম_ভার্সন ৪.২.০ :: সম্পূর্ণ ডকুমেন্টেশন",
      title: "রেপোগ্রাফ — গভীর কারিগরি তথ্য",
      subtitle: "রেপোগ্রাফ একটি বিশেষায়িত স্ট্যাটিক অ্যানালাইসিস ইঞ্জিন। এর প্রতিটি লাইন অপ্টিমাইজ করা হয়েছে ব্রাউজারে সর্বোচ্চ পারফরম্যান্সের জন্য। আমরা কোডকে একটি ইন্টারঅ্যাক্টিভ ম্যাপে রূপান্তর করি।",
      steps: {
        s1: {
          ...emptyStep,
          title: "ইনপুট এবং ভার্চুয়ালাইজেশন",
          step: "ধাপ ০১",
          github: "[A] গিটহাব ক্লাউড গেটওয়ে",
          githubDesc: "Regex ব্যবহার করে ইউআরএল থেকে ইউজার, রেপো এবং পাথ আলাদা করা হয়। Octokit REST API দিয়ে পুরো রেপো ট্রি রিকার্সিভলি ফেচ করা হয়।",
          githubAPI: "অটোমিক REST সাইকেল:",
          call1: "রিকরশন লেভেল: ইনফিনিটি — একবারে পুরো প্রজেক্টের ফাইল লিস্ট আনা হয় (সীমা ~7MB)।",
          call2: "মেটাডেটা সিঙ্ক: স্টার, ফর্ক এবং ল্যাঙ্গুয়েজ স্ট্যাট সিঙ্ক করা হয়।",
          lazy: "লেজি-লোডিং: ফাইলের কন্টেন্ট তখনই ফেচ করা হয় যখন এডিটর সেই ডেটা চায়।",
          local: "[B] মেমোরি ফোল্ডার এক্সেস",
          localDesc: "আধুনিক W3C FileSystem API ব্যবহার করে লোকাল ফাইল এক্সেস করা হয়। লোকাল পাথ থেকে জিরো-ল্যাটেন্সি এক্সেস নিশ্চিত করা হয়।",
          deep: "ইন্টারনাল লজিক: ফাইল পাথগুলোকে একটি Trie-স্ট্রাকচারে রূপান্তর করা হয়। এটি নিশ্চিত করে যে প্যারেন্ট ফোল্ডারগুলো আগে তৈরি হয়।"
        },
        s2: {
          ...emptyStep,
          title: "ডিপেনডেন্সি এনালাইসিস",
          step: "ধাপ ০২",
          worker: "Main Thread থেকে আলাদা করে `WorkerSync` এর মাধ্যমে প্রসেসিং করা হয় যাতে UI হ্যাং না করে এবং ১২০ হার্টজ রেন্ডারিং বজায় থাকে।",
          patterns: "এক্সটেন্ডেড রেজেক্স ইঞ্জিন:",
          resolution: "পাথ রেজোলিউশন লজিক: .ts, .tsx, .js, .jsx এবং /index চেক করে মেমোরি নোডের সাথে ক্রস-রেফারেন্স করা হয়।",
          special: "অ্যাডভান্সড লজিক প্রটোকল:",
          circular: "DFS সাইকেল ডিটেকশন: ডিপেনডেন্সি লুপ শনাক্ত করতে রিকার্সন স্ট্যাক ব্যবহার করা হয়।",
          entry: "হিউরিস্টিক র‍্যাঙ্কিং: ফাইল নেম এবং ইন-ডিগ্রি জিরো-কাউন্টের ওপর ভিত্তি করে মেইন এন্ট্রি নির্ধারণ করা হয়।",
          complexity: "Halstead মেট্রিক্স: অপারেটর এবং জাম্প ইন্সট্রাকশনে আলাদা ওয়েট (১.০ বনাম ০.৫) দেওয়া হয়।",
          orphan: "আইসোলেশন চেক: ইন-ডিগ্রি + আউট-ডিগ্রি শূন্য কিনা তা পরীক্ষা করা হয়।",
          deep: "AST বনাম REGEX: বড় প্রজেক্টের দ্রুত প্রসেসিংয়ের জন্য অপ্টিমাইজড Regex ব্যবহার করা হয়। Negative Lookbehind কমেন্ট বাদ দিতে সাহায্য করে।"
        },
        s3: {
          ...emptyStep,
          title: "গ্রাফ থিওরি লজিক",
          step: "ধাপ ৩",
          theory: "অ্যাডজাসেন্সি লিস্ট আর্কিটেকচার:",
          nodes: "নোড ডেটা: প্রতিটি নোডে কমপ্লেক্সিটি স্কোর এবং ভিজ্যুয়াল স্টেট থাকে।",
          edges: "লিংক লজিক: O(1) ডি-ডুপ্লিকেশনের জন্য 'সোর্স:টার্গেট' ইউনিক কি ব্যবহার করা হয়।",
          bfs: "গ্রাফ ডেপথ ও র‍্যাঙ্কিং: BFS ব্যবহার করে ডিস্ট্রিবিউশন র‍্যাঙ্ক নির্ধারণ করা হয়।",
          deep: "সার্কুলার লজিক: রিকার্সন ধরতে DFS অ্যালগরিদম ব্যবহার করা হয়। এগুলো গ্রাফে 'লাল ড্যাশড লাইন' দিয়ে মার্ক করা হয়।"
        },
        s4: {
          ...emptyStep,
          title: "রেন্ডারিং এবং ফিজিক্স",
          step: "ধাপ ৪",
          physics: "D3-Force ফিজিক্স ইঞ্জিন:",
          params: "৩০০ বার সিমুলেশন চালানো হয়: চার্জ (-১০০০), লিংক ডিস্ট্যান্স (১০০) এবং গ্র্যাভিটি (০.১)।",
          layouts: "লেআউট অ্যালগরিদম: ManyBody রিপালশন ব্যবহার করে একটি রিডেবল স্ট্রাকচার নিশ্চিত করা হয়।",
          canvas: "Occlusion Culling: শুধু স্ক্রিনে দেখা যাচ্ছে এমন অংশ রেন্ডার করা হয়, ফলে ১০ হাজার নোডও অনায়াসে চলে।",
          deep: "চেইন লিংকস: SVG Path স্যাম্পলিং ব্যবহার করে প্রতি ২০ পিক্সেল পরপর ডেটা গতির এনিমেশন যোগ করা হয়।"
        },
        s5: {
          ...emptyStep,
          title: "কোড অ্যানালাইসিস (Monaco)",
          step: "ধাপ ০৫",
          monaco: "মোন্যাকো এডিটর ব্রিজ:",
          env: "সম্পূর্ণ IDE এক্সপেরিয়েন্স। মোনার্ক টোকেনাইজার সিনট্যাক্স ম্যানেজ করে।",
          decorations: "গাটার লজিক: মোন্যাকোর `deltaDecorations` বাফারের মাধ্যমে ইমপোর্ট লাইনে ইন্টারঅ্যাক্টিভ মার্কার যোগ করা হয়।",
          hovers: "ইন্টেলিজেন্ট হোভার: কাস্টম হোভার প্রোভাইডার রিয়েল-টাইমে ডিপেনডেন্সি স্ট্যাট সংগ্রহ করে।",
          follow: "নেভিগেটর: ডেফিনিশন জাম্পের জন্য লোকেশনে স্ট্যাক (LIFO) মেইনটেইন করা হয়।",
          complexity: "Halstead ম্যাথমেটিক্স: কমপ্লেক্সিটি অনুযায়ী কালার স্যাচুরেশন এবং রিপল ইনটেনসিটি নির্ধারণ করা হয়।",
          deep: "মেমোরি বাফার: Virtual Viewport রেন্ডারিং বড় ফাইলের ক্ষেত্রেও র্যাম খরচ ২৫০ মেগাবাইটের নিচে রাখে।"
        },
        s6: {
          ...emptyStep,
          title: "স্টেট ম্যানেজমেন্ট",
          step: "ধাপ ৬",
          state: "Zustand মেমোরি স্টোর:",
          split: "অটোমিক স্টোর: রেপো, গ্রাফ এবং ইউআই ডেটা আলাদা রেখে রি-রেন্ডারিং কমানো হয়।",
          zustand: "Zustand মিডলওয়্যার: অপ্টিমাইজড আপডেটের জন্য সিলেক্টিভ সাবস্ক্রিপশন ব্যবহার করা হয়।",
          stores: "সেপারেশন অফ কনসার্নস: হেভি ডেটা রিঅ্যাক্ট ট্রির বাইরে রাখা হয়।",
          deep: "পারসিস্টেন্স: লোকাল-স্টোরেজের লিমিট এড়াতে 'IndexedDB' ব্যবহার করা হয়।"
        },
        s7: {
          ...emptyStep,
          title: "এক্সপোর্ট সিস্টেম",
          step: "ধাপ ৭",
          zip: "JSZip সিরিয়ালাইজেশন: এনালাইজ করা প্রজেক্ট মেমোরিতে সরাসরি জিপ ফাইল হিসেবে তৈরি করা হয়।",
          formats: "এক্সপোর্ট ফরম্যাট: PNG (হাই রেজোলিউশন), SVG (ভেক্টর), ZIP (বান্ডিল), JSON (ডেটা)।",
          image: "হাই-রেজোলিউশন ইমেজ: html2canvas দিয়ে SVG/HTML লেয়ার মার্জ করে ইমেজ তৈরি করা হয়।",
          deep: "মেটাডেটা ইনজেকশন: এক্সপোর্ট করা SVG ফাইলে অরিজিনাল গ্রাফ ডেটা XML ব্লকে সেভ করা থাকে।"
        },
        s8: {
          ...emptyStep,
          title: "অপ্টিমাইজেশন লেয়ার",
          step: "ধাপ ৮",
          lod: "LOD (Level of Detail): জুম আউট করলে অপ্রয়োজনীয় টেক্সট এবং ডিটেইলস লুকানো হয় (Maintain 60+ FPS)।",
          cleanup: "গারবেজ কালেকশন: সেশন শেষে `URL.revokeObjectURL` কল করে মেমোরি ফ্রি করা হয়।",
          cache: "O(1) এক্সেস: প্রতিটি ফাইল পাথের মাধ্যমে ইনস্ট্যান্ট লুকেআপের জন্য ইনডেক্স করা থাকে।",
          virtual: "DOM লাইফসাইকেল: সাইডবারে ভার্চুয়ালাইজেশনের মাধ্যমে মাত্র ১৫-২০টি রো রেন্ডার করা হয়।",
          deep: "প্যারালাল চাঙ্কিং: প্রসেসিং চাঙ্কে ভাগ করে আলাদা ওয়ার্কার থ্রেডে চালানো হয় যাতে মেইন থ্রেড রেসপনসিভ থাকে।"
        }
      },
      privacy: {
        title: "নিরাপত্তা ও গোপনীয়তা প্রটোকল",
        desc: "রেপোগ্রাফ একটি ১০০% ক্লায়েন্ট-সাইড অ্যাপ্লিকেশন। আপনার কোড কখনই আপনার মেশিন ছেড়ে কোথাও যায় না।",
        encryption: "গিটহাব এপিআই কলের জন্য HTTPS এনক্রিপশন ব্যবহার করা হয়।"
      }
    }
  };

  const current = t[lang] as Translation;
  const s1 = current.steps.s1 as StepData;
  const s2 = current.steps.s2 as StepData;
  const s3 = current.steps.s3 as StepData;
  const s4 = current.steps.s4 as StepData;
  const s5 = current.steps.s5 as StepData;
  const s6 = current.steps.s6 as StepData;
  const s7 = current.steps.s7 as StepData;
  const s8 = current.steps.s8 as StepData;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-10 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .smooth-scroll-container {
          scroll-behavior: smooth !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-gutter: stable;
        }
        .smooth-scroll-container * {
          scroll-behavior: smooth !important;
        }
      `}} />
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 md:bg-background/95 backdrop-blur-3xl"
        onClick={onClose}
      />

      {/* Container */}
      <div className={`relative w-full max-w-7xl h-full bg-background border border-border/50 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-700 delay-100 ${mounted ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 border border-primary/50 items-center justify-center bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{current.header}</h1>
              <p className="text-[10px] font-mono tracking-[0.4em] text-foreground/40 uppercase">{current.version}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-2 px-4 py-2 border border-primary/30 bg-primary/5 hover:bg-primary/20 transition-all text-[10px] font-black uppercase tracking-widest text-primary shadow-lg shadow-primary/5"
            >
              <Languages className="w-3 h-3" />
              {lang === 'en' ? 'বাংলা' : 'ENGLISH'}
            </button>
            <button
              onClick={onClose}
              className="p-3 border border-border/50 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all group"
            >
              <X className="w-5 h-5 group-active:scale-90" />
            </button>
          </div>
        </div>

        {/* Content - WITH PROPER SMOOTH SCROLLING */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-12 space-y-16 custom-scrollbar select-none smooth-scroll-container"
        >

          {/* Hero Section */}
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">LIVE_SYSTEM_ANALYSIS</span>
            </div>
            <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-foreground/90">
              {current.title}
            </h2>
            <p className="text-lg md:text-2xl text-foreground/40 font-medium leading-relaxed max-w-3xl">
              {current.subtitle}
            </p>
          </div>

          {/* Grid Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">

            {/* Step 1 */}
            <TechSection
              icon={<img src="https://img.icons8.com/?size=96&id=PGLq9T8fr9Uy&format=gif&color=f7f7f7" alt="Input" className="w-8 h-8" />}
              title={s1.title}
              step={s1.step}
            >
              <div className="space-y-6">
                <div className="p-5 border-l-4 border-primary bg-primary/5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">{s1.github}</h4>
                  <p>{s1.githubDesc}</p>
                  <TechCodeBlock
                    label="REGEX_PATTERN"
                    code={'const GH_REGEX = /^https:\\/\\/github\\.com\\/([^\\/]+)\\/([^\\/]+)/;'}
                  />
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-foreground/50">{s1.githubAPI}</p>
                    <ul className="text-[11px] space-y-2 opacity-70 border-l border-white/10 pl-4 ml-1">
                      <li><strong>Recursion:</strong> {s1.call1}</li>
                      <li><strong>Intelligence:</strong> {s1.call2}</li>
                      <li><strong>Optimization:</strong> {s1.lazy}</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 border-l-4 border-cyan-500 bg-cyan-500/5 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">{s1.local}</h4>
                  <p>{s1.localDesc}</p>
                </div>

                <DeepDiveNote>
                  {s1.deep}
                </DeepDiveNote>
              </div>
            </TechSection>

            {/* Step 2 */}
            <TechSection
              icon={<img src="https://img.icons8.com/?size=96&id=BISYa8VExZ04&format=gif&color=f7f7f7" alt="Parsing" className="w-8 h-8" />}
              title={s2.title}
              step={s2.step}
            >
              <div className="space-y-6">
                <p className="text-foreground/80">{s2.worker}</p>
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase text-primary tracking-widest">{s2.patterns}</h5>
                  <TechCodeBlock
                    code={'/import\\s+{[^}]+}\\s+from\\s+[\'"]([^\'"]+)[\'"]/g'}
                    label="STANDARD_IMPORTS"
                  />
                  <TechCodeBlock
                    code={'/require\\s*\\(\\s*[\'"]([^\'"]+)[\'"]\\s*\\)/g'}
                    label="COMMONJS_IMPORTS"
                  />
                </div>
                <div className="p-4 border border-white/5 bg-foreground/[0.02] space-y-4">
                  <p className="text-xs font-bold leading-none">{s2.resolution}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {['.ts', '.tsx', '.js', '.jsx', 'index.ts'].map(ext => (
                      <span key={ext} className="px-2 py-1 text-[9px] font-mono bg-white/5 border border-white/10">{ext}</span>
                    ))}
                  </div>
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{s2.special}</p>
                    <ul className="text-[11px] space-y-1 opacity-70">
                      <li>• {s2.circular}</li>
                      <li>• {s2.entry}</li>
                      <li>• {s2.complexity}</li>
                      <li>• {s2.orphan}</li>
                    </ul>
                  </div>
                </div>

                <DeepDiveNote>
                  {s2.deep}
                </DeepDiveNote>
              </div>
            </TechSection>

            {/* Step 3 */}
            <TechSection
              icon={<img src="https://img.icons8.com/?size=96&id=nHu7dMNox1kB&format=gif&color=f7f7f7" alt="Graph" className="w-8 h-8" />}
              title={s3.title}
              step={s3.step}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/10">
                    <h5 className="text-[10px] font-black uppercase mb-1">{s3.nodes}</h5>
                    <p className="text-[10px] opacity-60">Memory-safe objects with adjacency pointers.</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10">
                    <h5 className="text-[10px] font-black uppercase mb-1">{s3.edges}</h5>
                    <p className="text-[10px] opacity-60">Composite keys prevent redundant data.</p>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 text-[10px] font-mono leading-relaxed">
                  <strong>{s3.bfs}</strong>
                </div>

                <DeepDiveNote title="CIRCULAR_LOGIC">
                  {s3.deep}
                </DeepDiveNote>
              </div>
            </TechSection>

            {/* Step 4 */}
            <TechSection
              icon={<img src="https://img.icons8.com/?size=96&id=5hf4XRUvAyeP&format=gif&color=f7f7f7" alt="Physics" className="w-8 h-8" />}
              title={s4.title}
              step={s4.step}
            >
              <div className="space-y-6">
                <p>{s4.params}</p>
                <div className="p-5 bg-black/40 border border-primary/20 relative">
                  <div className="text-[9px] font-black uppercase text-primary absolute -top-2 left-4 px-2 bg-background">D3_FORCE_PARAMS</div>
                  <div className="grid grid-cols-3 gap-6 pt-4 text-[11px] font-mono">
                    <div className="space-y-1"><p className="opacity-40 uppercase tracking-tighter">Charge</p><p className="text-primary font-black">-1000</p></div>
                    <div className="space-y-1"><p className="opacity-40 uppercase tracking-tighter">LinkDist</p><p className="text-primary font-black">100</p></div>
                    <div className="space-y-1"><p className="opacity-40 uppercase tracking-tighter">Gravity</p><p className="text-primary font-black">0.1</p></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground/50">{s4.layouts}</p>
                  <div className="p-4 border-l-2 border-white/20 bg-white/5 italic opacity-80">
                    {s4.canvas}
                  </div>
                </div>

                <DeepDiveNote title="PATH_SAMPLING">
                  {s4.deep}
                </DeepDiveNote>
              </div>
            </TechSection>

            {/* Step 5 */}
            <TechSection
              icon={<img src="https://img.icons8.com/?size=96&id=dlWp8TavnGsj&format=gif&color=f7f7f7" alt="Editor" className="w-8 h-8" />}
              title={s5.title}
              step={s5.step}
            >
              <div className="space-y-6">
                <p>{s5.monaco}</p>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-1 bg-primary shrink-0" />
                    <div className="space-y-1">
                      <h5 className="font-black uppercase tracking-widest text-[11px]">{s5.decorations}</h5>
                      <p className="text-xs opacity-60">DeltaDecorations API used to sync UI state with analysis results.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 opacity-80">
                    <div className="w-1 bg-white/20 shrink-0" />
                    <div className="text-[11px] space-y-1">
                      <p>• {s5.hovers}</p>
                      <p>• {s5.follow}</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1 bg-cyan-400 shrink-0" />
                    <div className="space-y-1">
                      <h5 className="font-black uppercase tracking-widest text-[11px]">{s5.complexity}</h5>
                      <p className="text-xs opacity-60">Determines color saturation and ripple intensity.</p>
                    </div>
                  </li>
                </ul>

                <DeepDiveNote title="VIEWPORT_LOGIC">
                  {s5.deep}
                </DeepDiveNote>
              </div>
            </TechSection>

            {/* Step 6 */}
            <TechSection
              icon={<img src="https://img.icons8.com/?size=160&id=kQfYb9BCJ7uL&format=gif&color=f7f7f7" alt="State" className="w-8 h-8" />}
              title={s6.title}
              step={s6.step}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">{s6.state}</p>
                </div>
                <p className="text-xs opacity-80">{s6.zustand}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-sm">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">DATA_SPLIT</p>
                    <p className="text-[11px] leading-tight">{s6.split}</p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-sm">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">REACT_TREE</p>
                    <p className="text-[11px] leading-tight">{s6.stores}</p>
                  </div>
                </div>

                <DeepDiveNote title="PERSIST_LOGIC">
                  {s6.deep}
                </DeepDiveNote>
              </div>
            </TechSection>

            {/* Step 7 */}
            <TechSection
              icon={<img src="https://img.icons8.com/?size=100&id=12403&format=png" alt="Export" className="w-8 h-8" />}
              title={s7.title}
              step={s7.step}
            >
              <div className="space-y-6">
                <p>{s7.zip}</p>
                <div className="p-5 border-y border-white/5 space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">{s7.formats}</h5>
                  <p className="text-xs">{s7.image}</p>
                </div>

                <DeepDiveNote title="METADATA_INJECTION">
                  {s7.deep}
                </DeepDiveNote>
              </div>
            </TechSection>

            {/* Step 8 */}
            <TechSection
              icon={<img src="https://img.icons8.com/?size=100&id=77&format=png" alt="Perf" className="w-8 h-8" />}
              title={s8.title}
              step={s8.step}
            >
              <div className="space-y-6">
                <ul className="text-[11px] space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="text-primary font-black mt-1">LOD</div>
                    <p>{s8.lod}</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="text-primary font-black mt-1">CACHE</div>
                    <p>{s8.cache}</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="text-primary font-black mt-1">VIRTUAL</div>
                    <p>{s8.virtual}</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="text-primary font-black mt-1">GC</div>
                    <p>{s8.cleanup}</p>
                  </li>
                </ul>

                <DeepDiveNote title="BATCH_PROCESSING">
                  {s8.deep}
                </DeepDiveNote>
              </div>
            </TechSection>

          </div>

          {/* Privacy Protocol */}
          <div className="max-w-4xl p-10 border border-primary/20 bg-primary/5 space-y-4 relative overflow-hidden group mb-20">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            <div className="flex items-center gap-4 mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h3 className="text-3xl font-black uppercase tracking-tighter">{current.privacy.title}</h3>
            </div>
            <p className="text-lg leading-relaxed text-foreground/70">
              {current.privacy.desc}
            </p>
            <p className="text-sm font-bold text-primary group-hover:translate-x-2 transition-transform cursor-default">
              {current.privacy.encryption}
            </p>
          </div>

          {/* Bottom Banner */}
          <div className="border-t border-white/5 pt-20 pb-40 text-center space-y-12">
            <div className="max-w-xl mx-auto space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.5em] text-foreground/30">CORE_ARCHITECTURE_LOG</h4>
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <p className="text-[10px] font-mono text-foreground/20 leading-relaxed uppercase">
                EOF :: 0x7E4_DOCUMENTATION_SESSION_END<br />
                All system processes cleared. Visualizing core logic documentation.<br />
                Render completed at {new Date().toLocaleTimeString()}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-12 py-10 grayscale hover:grayscale-0 transition-all duration-1000 opacity-50">
              <img src="https://img.icons8.com/?size=160&id=asWSSTBrDlTW&format=png" alt="React" className="h-10 hover:scale-125 transition-transform" />
              <img src="https://img.icons8.com/?size=160&id=Xf1sHBmY73hA&format=png" alt="TS" className="h-10 hover:scale-125 transition-transform" />
              <img src="https://img.icons8.com/?size=96&id=CIAZz2CYc6Kc&format=png" alt="Tailwind" className="h-10 hover:scale-125 transition-transform" />
              <img src="https://img.icons8.com/?size=96&id=dJjTWMogzFzg&format=png" alt="Vite" className="h-10 hover:scale-125 transition-transform" />
              <img src="https://img.icons8.com/?size=160&id=asWSSTBrDlTW&format=png" alt="ReFlow" className="h-10 hover:scale-125 transition-transform" />
              <img src="https://img.icons8.com/?size=96&id=20909&format=png" alt="HTML" className="h-10 hover:scale-125 transition-transform invert" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
