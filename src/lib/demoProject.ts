import { FileNode } from '@/store/useStore';

export function getDemoFiles(): FileNode[] {
  const files: FileNode[] = [
    makeFile('src/main.tsx', `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`, true),
    makeFile('src/App.tsx', `import { Header } from './components/Header';\nimport { Dashboard } from './components/Dashboard';\nimport { useApi } from './hooks/useApi';\nimport './App.css';\n\nexport default function App() {\n  const { data } = useApi('/stats');\n  return (\n    <div className="app">\n      <Header />\n      <Dashboard data={data} />\n    </div>\n  );\n}`),
    makeFile('src/components/Header.tsx', `import { Logo } from './Logo';\nimport { Nav } from './Nav';\nimport '../styles/header.css';\n\nexport function Header() {\n  return (\n    <header>\n      <Logo />\n      <Nav />\n    </header>\n  );\n}`),
    makeFile('src/components/Dashboard.tsx', `import { Chart } from './Chart';\nimport { StatsCard } from './StatsCard';\nimport { formatNumber } from '../utils/format';\n\nexport function Dashboard({ data }: { data: any }) {\n  return (\n    <main>\n      <StatsCard value={formatNumber(data?.total)} />\n      <Chart data={data?.chart} />\n    </main>\n  );\n}`),
    makeFile('src/components/Logo.tsx', `export function Logo() {\n  return <div className="logo">RepoGraph</div>;\n}`),
    makeFile('src/components/Nav.tsx', `import { NavLink } from 'react-router-dom';\n\nexport function Nav() {\n  return (\n    <nav>\n      <NavLink to="/">Home</NavLink>\n      <NavLink to="/about">About</NavLink>\n    </nav>\n  );\n}`),
    makeFile('src/components/Chart.tsx', `import { useMemo } from 'react';\nimport { formatNumber } from '../utils/format';\n\nexport function Chart({ data }: { data: any[] }) {\n  const processed = useMemo(() => data?.map(d => ({\n    ...d, label: formatNumber(d.value)\n  })), [data]);\n  return <div className="chart">{JSON.stringify(processed)}</div>;\n}`),
    makeFile('src/components/StatsCard.tsx', `export function StatsCard({ value }: { value: string }) {\n  return <div className="stats-card">{value}</div>;\n}`),
    makeFile('src/hooks/useApi.ts', `import { useState, useEffect } from 'react';\nimport { fetchData } from '../utils/api';\n\nexport function useApi(url: string) {\n  const [data, setData] = useState(null);\n  useEffect(() => { fetchData(url).then(setData); }, [url]);\n  return { data };\n}`),
    makeFile('src/utils/api.ts', `export async function fetchData(url: string) {\n  const res = await fetch(url);\n  return res.json();\n}`),
    makeFile('src/utils/format.ts', `export function formatNumber(n: number): string {\n  return new Intl.NumberFormat().format(n);\n}`),
    makeFile('src/index.css', `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody { margin: 0; font-family: sans-serif; }`),
    makeFile('src/App.css', `.app { min-height: 100vh; }`),
    makeFile('src/styles/header.css', `header { display: flex; padding: 1rem; border-bottom: 1px solid #eee; }\n.logo { font-weight: bold; font-size: 1.2rem; }`),
    makeFile('package.json', JSON.stringify({ name: 'demo-app', dependencies: { react: '^18', 'react-dom': '^18', 'react-router-dom': '^6', typescript: '^5', vite: '^5', tailwindcss: '^3' }, scripts: { dev: 'vite', build: 'vite build' } }, null, 2)),
    makeFile('index.html', `<!DOCTYPE html>\n<html>\n<head><title>Demo App</title></head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.tsx"></script>\n</body>\n</html>`),
  ];
  return files;
}

function makeFile(path: string, content: string, isEntry = false): FileNode {
  const name = path.split('/').pop()!;
  const ext = '.' + name.split('.').pop()!;
  const langMap: Record<string, string> = { '.tsx': 'React TSX', '.ts': 'TypeScript', '.css': 'CSS', '.json': 'JSON', '.html': 'HTML' };
  return {
    path, name, content, size: content.length, extension: ext,
    language: langMap[ext] || 'Other', lineCount: content.split('\n').length,
    isEntryPoint: isEntry, isBinary: false, isGitignored: false,
  };
}
