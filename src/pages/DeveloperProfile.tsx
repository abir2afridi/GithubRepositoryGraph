import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { 
  Github, 
  Twitter, 
  Mail, 
  MapPin, 
  Globe, 
  ChevronLeft, 
  Star, 
  GitFork, 
  Code2, 
  Cpu, 
  Zap,
  Layout,
  Layers,
  Activity,
  Award,
  BookOpen,
  PieChart as PieIcon,
  Terminal as TerminalIcon,
  Box,
  User,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

interface GithubEvent {
  type: string;
  created_at: string;
  repo: {
    name: string;
  };
}

interface GithubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string;
  blog: string;
  company: string;
  twitter_username: string;
  created_at: string;
  public_gists: number;
}

interface GithubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
}

export default function DeveloperProfile() {
  const { theme } = useStore();
  const navigate = useNavigate();
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [activity, setActivity] = useState<GithubEvent[]>([]);
  const [languages, setLanguages] = useState<{name: string, value: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ stars: 0, forks: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, reposRes, eventsRes, allReposRes] = await Promise.all([
          fetch('https://api.github.com/users/abir2afridi'),
          fetch('https://api.github.com/users/abir2afridi/repos?sort=updated&per_page=6'),
          fetch('https://api.github.com/users/abir2afridi/events?per_page=12'),
          fetch('https://api.github.com/users/abir2afridi/repos?per_page=100')
        ]);
        
        // Handle Rate Limiting (403) or other errors
        if (!userRes.ok || !reposRes.ok || !eventsRes.ok || !allReposRes.ok) {
           throw new Error('Github API Rate Limit or Network Error');
        }

        const userData = await userRes.json();
        const reposData = await reposRes.json();
        const eventsData = await eventsRes.json();
        const allReposData = await allReposRes.json();
        
        // Final sanity check for arrays
        if (!Array.isArray(reposData) || !Array.isArray(eventsData) || !Array.isArray(allReposData)) {
           throw new Error('Invalid response format from Github');
        }

        setUser(userData);
        setRepos(reposData);
        setActivity(eventsData);

        // Calculate language distribution & global stats
        const langMap: {[key: string]: number} = {};
        let totalStars = 0;
        let totalForks = 0;

        allReposData.forEach((r: GithubRepo) => {
          totalStars += r.stargazers_count;
          totalForks += r.forks_count;
          if (r.language) {
            langMap[r.language] = (langMap[r.language] || 0) + 1;
          }
        });

        const langArray = Object.entries(langMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        setLanguages(langArray);
        setStats({ stars: totalStars, forks: totalForks });

      } catch (err) {
        console.error('Failed to fetch developer metrics, using fallback simulation:', err);
        // Realistic Fallback Data for UI stability
        setUser({
          login: 'abir2afridi',
          name: 'Abir Hasan Siam',
          avatar_url: 'https://github.com/abir2afridi.png',
          bio: 'System Architect & Software Engineer',
          public_repos: 42,
          followers: 120,
          following: 80,
          location: 'Tangail, BD',
          blog: 'https://abir2afridi.vercel.app/',
          company: 'Independent Researcher',
          twitter_username: 'abir2afridi',
          created_at: '2020-01-01',
          public_gists: 5,
          html_url: 'https://github.com/abir2afridi'
        });
        setRepos([
          { name: 'GithubRepositoryGraph', description: 'Interactive visualization of repo dependencies.', stargazers_count: 12, forks_count: 4, language: 'TypeScript', html_url: '#' },
          { name: 'CyberpunkUI', description: 'Next-gen design protocol implementation.', stargazers_count: 45, forks_count: 12, language: 'TypeScript', html_url: '#' },
          { name: 'NeuralNet-Module', description: 'Core intelligence engine for distributed systems.', stargazers_count: 8, forks_count: 2, language: 'Python', html_url: '#' },
          { name: 'LinkSync-Protocol', description: 'Encrypted peer-to-peer data synchronization.', stargazers_count: 22, forks_count: 5, language: 'Dart', html_url: '#' }
        ]);
        setActivity([
          { type: 'PushEvent', created_at: new Date().toISOString(), repo: { name: 'user/GithubRepositoryGraph' } },
          { type: 'CreateEvent', created_at: new Date().toISOString(), repo: { name: 'user/CyberpunkUI' } },
          { type: 'WatchEvent', created_at: new Date().toISOString(), repo: { name: 'user/NeuralNet' } }
        ]);
        setLanguages([
          { name: 'TypeScript', value: 45 },
          { name: 'Dart', value: 30 },
          { name: 'Python', value: 15 },
          { name: 'Other', value: 10 }
        ]);
        setStats({ stars: 156, forks: 48 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center gap-4">
        <div className="relative">
           <Cpu className="w-16 h-16 text-primary animate-spin" />
           <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
        </div>
        <div className="flex flex-col items-center">
           <span className="text-[10px] font-mono font-black text-primary uppercase tracking-[0.5em] animate-pulse">Initializing_Profile...</span>
           <div className="w-48 h-1 bg-secondary/20 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-primary animate-[shimmer_2s_infinite]" style={{ width: '60%' }} />
           </div>
        </div>
      </div>
    );
  }

  const chartColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className={`min-h-screen w-full bg-background text-foreground overflow-x-hidden scrollbar-thin selection:bg-primary selection:text-primary-foreground ${theme}`}>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-primary/[0.03] blur-[150px]" />
        
        {/* Large BG Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35vw] font-black opacity-[0.015] text-foreground mix-blend-overlay tracking-tighter whitespace-nowrap">
          ABIR HASAN
        </div>

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] brightness-100 contrast-150" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-xl border-b border-border/40 px-8 py-4 flex flex-col items-stretch justify-center">
        <div className="flex items-center justify-between w-full">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 pr-6 border-r border-border/40 group text-foreground/50 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">System_Exit</span>
          </button>
          
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-3 px-4 py-1 bg-secondary/20 border border-border/40">
                <span className="w-1.5 h-1.5 bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/60">Protocol_Active</span>
             </div>
             <Github onClick={() => window.open(user?.html_url, '_blank')} className="w-5 h-5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
          </div>
        </div>
        
        {/* Technical Ticker Bar */}
        <div className="mt-4 border-t border-border/10 pt-2 flex items-center gap-6 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-2 animate-[marquee_20s_linear_infinite]">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 text-[8px] font-mono text-foreground/30 uppercase tracking-widest">
                   <span>Core_Heat: 42°C</span>
                   <span className="w-1 h-1 bg-primary/40 rounded-full" />
                   <span>Neural_Load: {Math.floor(Math.random() * 20) + 10}%</span>
                   <span className="w-1 h-1 bg-primary/40 rounded-full" />
                   <span>Mem_Alloc: 4.8GB/16GB</span>
                   <span className="w-1 h-1 bg-primary/40 rounded-full" />
                   <span>Ping: 14ms</span>
                   <span className="w-1 h-1 bg-primary/40 rounded-full" />
                </div>
             ))}
          </div>
        </div>
      </nav>

      <main className="w-full px-6 md:px-12 lg:px-20 pt-44 pb-20 relative z-10">
        
        {/* HERO SECTION */}
        <header className="mb-32 flex flex-col xl:flex-row xl:items-end justify-between gap-12 w-full">
           <div className="space-y-6 flex-grow">
              <div className="flex items-center gap-4">
                 <div className="px-3 py-1 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.4em]">
                    Engineer_V4.0
                 </div>
                 <div className="h-[1px] flex-grow md:w-24 bg-border/40" />
                 <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-[0.3em]">Crt_Time: {new Date().toLocaleTimeString()}</span>
              </div>
              <h1 className="text-7xl md:text-[10rem] xl:text-[12rem] font-black uppercase tracking-tighter leading-[0.8] text-foreground flex flex-col mix-blend-difference">
                 <span>Abir Hasan</span>
                 <span className="text-foreground/10 outline-text -mt-4">Siam</span>
              </h1>
              <p className="text-xl md:text-2xl text-foreground/40 font-medium max-w-4xl leading-relaxed uppercase tracking-wider relative">
                 <span className="absolute -left-8 top-0 text-primary opacity-40">[00]</span>
                 Architecting <span className="text-foreground">Intelligent Systems</span> with surgical precision. 
                 Optimizing <span className="border-b border-primary/40 text-foreground">Neural UI Protocols</span> for next-gen performance.
              </p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-6 mb-4">
              <button 
                onClick={() => window.open('https://abir2afridi.vercel.app/', '_blank')}
                className="px-16 py-8 bg-foreground text-background font-black uppercase text-[12px] tracking-[0.4em] hover:bg-primary hover:text-primary-foreground transition-all shadow-[12px_12px_0px_rgba(0,0,0,0.1)] dark:shadow-[12px_12px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none whitespace-nowrap"
              >
                Access_Core
              </button>
              <button 
                onClick={() => window.location.href = 'mailto:abir2afridi@gmail.com'}
                className="px-16 py-8 bg-transparent border-2 border-border text-foreground font-black uppercase text-[12px] tracking-[0.4em] hover:bg-foreground hover:text-background transition-all whitespace-nowrap"
              >
                Transmit_Mail
              </button>
           </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Column: Core Identity */}
          <div className="xl:col-span-3 space-y-12">
            <div className="bg-card/80 backdrop-blur-xl border border-border/40 p-12 relative group overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
               
               {/* Scanning Laser Line */}
               <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                  <div className="w-full h-[1px] bg-primary/40 shadow-[0_0_15px_var(--primary)] animate-[scan_4s_linear_infinite]" />
               </div>

               <div className="relative mb-12 aspect-[3/4] overflow-hidden transition-all duration-700 bg-secondary group/img">
                  <img src={user?.avatar_url} alt="Profile" className="w-full h-full object-cover group-hover/img:scale-105 transition-all" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-60 group-hover/img:opacity-0 transition-opacity" />
               </div>

               {/* Bio Stats Table */}
               <div className="space-y-6 font-mono">
                  <div className="flex items-center justify-between text-[10px] font-black text-foreground/20 uppercase tracking-[0.5em] mb-4">
                     <span>Identity_Descriptor</span>
                     <span className="animate-pulse text-primary">●</span>
                  </div>
                  {[
                    { label: 'Alias', val: user?.login || 'abir2afridi' },
                    { label: 'Origin', val: 'Tangail, BD' },
                    { label: 'Level', val: 'L7_Eng' },
                    { label: 'Status', val: 'Active' },
                    { label: 'Uptime', val: '99.9%' }
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between items-center py-4 border-b border-border/20 group/row">
                       <span className="text-[9px] uppercase tracking-[0.3em] text-foreground/30 group-hover/row:text-foreground transition-colors">{s.label}</span>
                       <span className="text-[11px] font-black uppercase tracking-widest">{s.val}</span>
                    </div>
                  ))}
               </div>
            </div>
            
            {/* Visual Intelligence - Recharts */}
            <div className="bg-card/60 border border-border/20 p-10 space-y-8 relative group">
               <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PieIcon className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Language_Dist</span>
                  </div>
               </div>
               
               <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languages}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {languages.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'][index % 6]} 
                            className="hover:opacity-80 transition-opacity cursor-crosshair shadow-[0_0_20px_rgba(0,0,0,0.5)]" 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '2px solid hsl(var(--foreground))', borderRadius: '0', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4">
                  {languages.slice(0, 4).map((l, i) => {
                    const color = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'][i % 6];
                    return (
                      <div key={l.name} className="p-3 border border-border/20 space-y-2 group/card">
                         <div className="text-[8px] font-mono opacity-20 italic" style={{ color }}>Module_0{i+1}</div>
                         <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                            <span className="font-black truncate mr-2" style={{ color }}>{l.name}</span>
                            <span className="opacity-40">{Math.round((l.value / (languages.reduce((acc, curr) => acc + curr.value, 0) || 1)) * 100)}%</span>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* LIVE SYSTEM SIGNALS */}
            <div className="bg-card border border-border/40 p-10 space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <TerminalIcon className="w-16 h-16" />
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live_Feed</span>
                  </div>
                  <div className="flex gap-1">
                     {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                     ))}
                  </div>
               </div>
               <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar font-mono">
                  {activity.map((event, i) => (
                    <div key={i} className="py-4 border-b border-border/20 space-y-2 group/entry cursor-crosshair hover:bg-foreground/5 transition-colors px-2">
                       <div className="flex justify-between items-center text-[8px]">
                          <span className="font-black text-primary uppercase">{event.type.replace('Event', '')}</span>
                          <span className="text-foreground/20 group-hover/entry:text-foreground transition-colors">[{new Date(event.created_at).toLocaleTimeString()}]</span>
                       </div>
                       <div className="text-[10px] font-black uppercase tracking-wider text-foreground/50 group-hover/entry:text-foreground truncate">
                          &gt; {event.repo.name.split('/')[1]}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Right Column: Experience and Impact */}
          <div className="xl:col-span-9 space-y-20">
            
            {/* PERFORMANCE HUB */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: 'Stars_Impact', val: stats.stars, icon: Star, color: '#f59e0b' },
                 { label: 'Fork_Density', val: stats.forks, icon: GitFork, color: '#3b82f6' },
                 { label: 'Repos_Node', val: user?.public_repos, icon: Box, color: '#10b981' },
                 { label: 'Followers', val: user?.followers, icon: User, color: '#f43f5e' }
               ].map((stat, idx) => (
                 <div key={stat.label} className="bg-card border border-border/40 p-10 space-y-4 hover:border-primary transition-all group relative overflow-hidden" style={{ borderTop: `4px solid ${stat.color}` }}>
                    <div className="absolute bottom-0 right-0 text-foreground/5 font-black text-6xl select-none translate-x-4 translate-y-4">0{idx+1}</div>
                    <div className="flex items-center justify-between relative z-10">
                       <stat.icon className="w-6 h-6 transition-transform group-hover:scale-110" style={{ color: stat.color }} />
                       <span className="text-[8px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100">Metric_X0{idx+1}</span>
                    </div>
                    <div className="relative z-10">
                       <div className="text-6xl font-black font-mono tracking-tighter group-hover:translate-x-2 transition-transform" style={{ color: stat.color }}>{stat.val}</div>
                       <div className="text-[11px] uppercase font-black tracking-[0.4em] mt-2 text-foreground/40 group-hover:text-foreground">{stat.label}</div>
                    </div>
                 </div>
               ))}
            </section>

            {/* CONTRIBUTION HEATMAP SIMULATION */}
            <section className="bg-card border-2 border-border p-12 space-y-10 group">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Layers className="w-5 h-5 text-primary" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Contribution_Pulse</h3>
                  </div>
                  <div className="text-[10px] font-mono text-foreground/30 uppercase tracking-[0.2em]">Scale: Low --&gt; High</div>
               </div>
               
               <div className="grid grid-flow-col grid-rows-7 gap-2 h-40">
                  {[...Array(52 * 7)].map((_, i) => {
                     const intensity = Math.random();
                     const color = intensity > 0.8 ? 'bg-primary' : intensity > 0.5 ? 'bg-primary/40' : intensity > 0.2 ? 'bg-primary/10' : 'bg-secondary/20';
                     return (
                        <div 
                           key={i} 
                           className={`w-full h-full ${color} hover:scale-125 transition-transform duration-300 cursor-crosshair`}
                           title={`Neural Activity: ${Math.floor(intensity * 100)}%`}
                        />
                     );
                  })}
               </div>
               
               <div className="flex justify-between items-center pt-6 border-t border-border/10 text-[9px] font-mono uppercase tracking-[0.4em] text-foreground/20">
                  <span>Start_Session: 2025_Q1</span>
                  <span className="group-hover:text-primary transition-colors">Integrity_Check: Verified</span>
                  <span>End_Session: Present</span>
               </div>
            </section>

            {/* Neural Evolution: Education & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
               {/* Skills Analysis */}
               <section className="space-y-12">
                  <div className="flex items-center gap-6">
                     <span className="text-5xl font-black text-foreground/10">01</span>
                     <h2 className="text-4xl font-black uppercase tracking-tighter">Energy_Stack</h2>
                  </div>
                  <div className="space-y-12">
                    {[
                      { name: 'Dart / Flutter', level: 95, icon: '0xC7', color: '#06b6d4' },
                      { name: 'React / Next.js', level: 90, icon: '0xF2', color: '#3b82f6' },
                      { name: 'Python Systems', level: 85, icon: '0xE8', color: '#10b981' },
                      { name: 'System Architecture', level: 80, icon: '0xB4', color: '#8b5cf6' }
                    ].map((skill) => (
                      <div key={skill.name} className="space-y-5 group/skill">
                         <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.5em]">
                            <div className="flex items-center gap-3">
                               <span className="font-mono" style={{ color: skill.color }}>{skill.icon}</span>
                               <span className="group-hover/skill:translate-x-2 transition-transform">{skill.name}</span>
                            </div>
                            <span className="text-foreground/40">{skill.level}%</span>
                         </div>
                         <div className="h-[4px] w-full bg-secondary/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full transition-all duration-1000 group-hover/skill:scale-x-105" style={{ width: `${skill.level}%`, backgroundColor: skill.color }} />
                            <div className="absolute top-0 left-0 h-full blur-md animate-pulse" style={{ width: `${skill.level}%`, backgroundColor: skill.color, opacity: 0.3 }} />
                         </div>
                      </div>
                    ))}
                  </div>
               </section>

               {/* Education Protocols */}
               <section className="space-y-12">
                  <div className="flex items-center gap-6">
                     <span className="text-5xl font-black text-foreground/10">02</span>
                     <h2 className="text-4xl font-black uppercase tracking-tighter">Knowledge_Prot</h2>
                  </div>
                  <div className="space-y-12">
                     {[
                       { inst: 'Independent Uni', deg: 'BSc Computer Science', date: '21-Current', detail: 'Advanced Neural Computing', color: '#f43f5e' },
                       { inst: 'Misir Ali College', deg: 'HSC Excellence', date: '19-20', detail: 'Mathematics & Logic', color: '#3b82f6' },
                       { inst: 'MEH Arif School', deg: 'SSC Foundation', date: '17-18', detail: 'General Curriculum', color: '#10b981' }
                     ].map((edu) => (
                       <div key={edu.inst} className="relative group border-l-2 pl-8 hover:translate-x-2 transition-all cursor-default space-y-3" style={{ borderColor: edu.color }}>
                          <div className="text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: edu.color }}>{edu.date}</div>
                          <h4 className="font-black uppercase text-2xl text-foreground break-words">{edu.inst}</h4>
                          <div className="space-y-1">
                             <h5 className="text-[11px] text-foreground/60 uppercase font-black tracking-[0.2em]">{edu.deg}</h5>
                             <p className="text-[9px] text-foreground/30 uppercase font-bold tracking-widest">{edu.detail}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </section>
            </div>

            {/* Neural Code Repository */}
            <section className="space-y-12">
               <div className="flex items-center justify-between border-b-4 border-foreground pb-6">
                  <div className="flex items-center gap-6">
                     <span className="text-5xl font-black text-foreground/10">03</span>
                     <h2 className="text-5xl font-black uppercase tracking-tighter">Core_Repos</h2>
                  </div>
                  <span className="text-[10px] uppercase font-black text-foreground/20 tracking-[0.6em]">Node::Output</span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {repos.map((repo, i) => {
                    const cardColors = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
                    const accentColor = cardColors[i % cardColors.length];
                    
                    return (
                      <div 
                        key={repo.name} 
                        className="group bg-card border border-border/40 p-12 transition-all relative overflow-hidden flex flex-col justify-between min-h-[320px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                        style={{ 
                          borderTop: `4px solid ${accentColor}`,
                          boxShadow: `inset 0 0 40px ${accentColor}05`
                        }}
                      >
                         <div className="absolute -top-4 -right-4 font-black text-8xl transition-colors" style={{ color: `${accentColor}10` }}>0{i+1}</div>
                         
                         <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-start">
                               <h3 className="text-3xl font-black uppercase tracking-tighter break-all leading-none group-hover:translate-x-1 transition-transform" style={{ color: accentColor }}>{repo.name}</h3>
                               <button 
                                  onClick={() => window.open(repo.html_url, '_blank')}
                                  className="p-2 border border-border/20 hover:bg-foreground hover:text-background transition-colors"
                                  style={{ borderColor: `${accentColor}40` }}
                               >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[12px] font-medium uppercase tracking-wider text-foreground/40 group-hover:text-foreground/80 line-clamp-3 leading-relaxed">
                               {repo.description || 'System module initialized without metadata descriptor. Integrity verified for runtime deployment.'}
                            </p>
                         </div>

                         <div className="flex items-center justify-between pt-8 border-t border-border/20 mt-8 relative z-10">
                            <div className="flex gap-8">
                               <div className="flex items-center gap-2 group/stat">
                                  <Star className="w-4 h-4 transition-colors" style={{ color: accentColor }} />
                                  <span className="text-sm font-black font-mono">{repo.stargazers_count}</span>
                               </div>
                               <div className="flex items-center gap-2 group/stat">
                                  <GitFork className="w-4 h-4 transition-colors" style={{ color: accentColor }} />
                                  <span className="text-sm font-black font-mono">{repo.forks_count}</span>
                               </div>
                            </div>
                            <div className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.4em] transition-colors" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                               {repo.language || 'Hybrid'}
                            </div>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </section>
         </div>
      </div>

      </main>

      {/* Final Transmission CTA - Moved Outside Main for true Full-Screen Width */}
      <section className="w-full bg-foreground py-24 md:py-40 text-background relative overflow-hidden group border-y border-border/10">
         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-96 h-96 -rotate-12" />
         </div>
         
         <div className="w-full px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
            <div className="space-y-8 text-center md:text-left">
               <div className="inline-block px-4 py-1 bg-background text-foreground text-[10px] font-black uppercase tracking-[0.4em]">
                  Network_Sync_Ready
               </div>
               <h2 className="text-7xl md:text-[11rem] font-black uppercase tracking-tighter leading-[0.8]">Initialize<br/>Link_Sync</h2>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] opacity-40">Authentication: Required / Status: Standby / Protocol: V4_Locked</p>
            </div>
            
            <button 
              onClick={() => window.location.href = 'mailto:abir2afridi@gmail.com'}
              className="group relative px-20 md:px-32 py-12 bg-background text-foreground font-black uppercase text-sm tracking-[1em] overflow-hidden hover:scale-95 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.3)] active:scale-90"
            >
              <span className="relative z-10">Transmit</span>
              <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
         </div>
      </section>

      <footer className="py-24 border-t border-border/20 relative overflow-hidden bg-secondary/10">
        <div className="w-full px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-3 items-center gap-12">
           <div className="text-[10px] font-mono font-black uppercase tracking-[0.8em] opacity-20 text-foreground text-center md:text-left">
              Identity::V7_Locked
           </div>
           <div className="flex justify-center gap-12 text-[10px] font-mono font-black uppercase tracking-[0.4em] text-foreground/20">
              <span className="hover:text-primary transition-colors cursor-crosshair">Enc: AES-256</span>
              <span className="hover:text-primary transition-colors cursor-crosshair">Net: Repomap_V4</span>
           </div>
           <div className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-primary/40 text-center md:text-right">
              &copy; 2026 ABIR_HASAN_SIAM_[EN_DEPLOYMENT]
           </div>
        </div>
      </footer>
    </div>
  );
}
