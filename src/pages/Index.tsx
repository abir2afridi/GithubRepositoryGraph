import React, { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { LandingPage } from '@/components/LandingPage';
import { GraphView } from '@/components/GraphView';
import { IntelligencePanel } from '@/components/IntelligencePanel';
import { CodeViewPanel } from '@/components/CodeViewPanel';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { Toolbar } from '@/components/Toolbar';
import { TopStatsBar } from '@/components/TopStatsBar';
import { GuidePanel } from '@/components/GuidePanel';
import { ExportModal } from '@/components/ExportModal';
import { SearchPanel } from '@/components/SearchPanel';
import { OnboardingTour } from '@/components/OnboardingTour';
import { PresentationMode } from '@/components/PresentationMode';
import { NodeContextMenu } from '@/components/NodeContextMenu';

export default function Index() {
  const { project, toggleExport, presentationMode, contextMenu, setContextMenu, theme, 
          searchOpen, toggleSearch } = useStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'e' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); toggleExport(); }
      if (e.key === 'p' && !e.ctrlKey && !e.metaKey && !(e.target as HTMLElement)?.matches?.('input, textarea')) {
        useStore.getState().togglePresentation();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleExport]);

  if (!project) return <LandingPage />;

  if (presentationMode) return <PresentationMode />;

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-background ${theme}`}>
      <TopStatsBar />
      <div className="flex-1 flex overflow-hidden relative">
        <IntelligencePanel />
        <div className="flex-1 relative overflow-hidden">
          <GraphView />
          <CustomizationPanel />
          <GuidePanel />
          {searchOpen && <SearchPanel onClose={toggleSearch} />}
        </div>
        <CodeViewPanel />
      </div>
      
      {/* Global Viewport Components */}
      <Toolbar />
      <ExportModal />
      <OnboardingTour />
      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodePath={contextMenu.nodePath}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
