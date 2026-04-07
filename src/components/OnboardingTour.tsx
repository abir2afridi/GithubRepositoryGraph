import React, { useState, useEffect } from 'react';

const TOUR_KEY = 'repograph_tour_dismissed';

const STEPS = [
  { target: '.react-flow', title: 'Your Graph', text: 'Each box represents one file in the project. Lines show which files import each other.', position: 'center' },
  { target: '.react-flow', title: 'Click a Node', text: 'Click any node to highlight its connections. Unrelated files fade out.', position: 'center' },
  { target: '.react-flow', title: 'Open Code View', text: 'Double-click a node to open the file in a full code viewer with syntax highlighting.', position: 'center' },
  { target: '[data-sidebar]', title: 'Project Explorer', text: 'This sidebar shows detailed stats, file tree, packages, and more. Collapse sections you don\'t need.', position: 'right' },
  { target: '[data-customize]', title: 'Customize Everything', text: 'Change themes, edge styles, layouts, and shape presets from the customization panel.', position: 'left' },
  { target: '[data-export]', title: 'Export Your Graph', text: 'Export as PNG, SVG, PDF, JSON, or Markdown. Press Ctrl+E anytime.', position: 'left' },
];

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  const current = STEPS[step];

  const dismiss = (permanent = false) => {
    setShow(false);
    if (permanent) localStorage.setItem(TOUR_KEY, '1');
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] pointer-events-auto" onClick={() => dismiss(false)} />
      
      {/* Tour card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        style={{ animation: 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/30 p-6 w-[360px] space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/40 w-3' : 'bg-secondary w-3'}`} />
            ))}
          </div>

          <div>
            <h3 className="font-display font-bold text-lg tracking-tight text-foreground">{current.title}</h3>
            <p className="text-sm text-muted-foreground/70 mt-1 leading-relaxed">{current.text}</p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-[10px] text-muted-foreground/50 cursor-pointer">
              <input type="checkbox" className="w-3 h-3 accent-primary" onChange={e => { if (e.target.checked) localStorage.setItem(TOUR_KEY, '1'); }} />
              Don't show again
            </label>

            <div className="flex gap-1.5">
              <button onClick={() => dismiss(true)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Skip
              </button>
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:brightness-110 active:scale-95 transition-all">
                  Next →
                </button>
              ) : (
                <button onClick={() => dismiss(true)}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:brightness-110 active:scale-95 transition-all">
                  Get Started ✨
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function restartTour() {
  localStorage.removeItem(TOUR_KEY);
  window.location.reload();
}
