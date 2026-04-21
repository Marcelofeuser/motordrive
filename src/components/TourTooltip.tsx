import { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

export interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TourTooltipProps {
  steps: TourStep[];
  tourKey: string;
  onFinish?: () => void;
}

export default function TourTooltip({ steps, tourKey, onFinish }: TourTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, arrowPos: "bottom" as string });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seen = localStorage.getItem(`tour_${tourKey}`);
    if (!seen) { setVisible(true); setCurrentStep(0); }
  }, [tourKey]);

  useEffect(() => {
    if (!visible) return;
    positionTooltip();
    window.addEventListener("resize", positionTooltip);
    return () => window.removeEventListener("resize", positionTooltip);
  }, [visible, currentStep]);

  const positionTooltip = () => {
    const step = steps[currentStep];
    if (!step) return;
    const el = document.querySelector(step.target);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tooltipH = 140;
    const tooltipW = 280;
    const margin = 12;
    let top = 0, left = 0, arrowPos = "bottom";

    // Prefer below
    if (rect.bottom + tooltipH + margin < window.innerHeight) {
      top = rect.bottom + margin;
      arrowPos = "top";
    } else {
      top = rect.top - tooltipH - margin;
      arrowPos = "bottom";
    }
    left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - 16));
    setPos({ top, left, arrowPos });
  };

  const finish = () => {
    localStorage.setItem(`tour_${tourKey}`, "1");
    setVisible(false);
    onFinish?.();
  };

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
    else finish();
  };

  const prev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const el = document.querySelector(step.target);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const arrowLeft = Math.max(20, Math.min(rect.left + rect.width / 2 - pos.left, 260));

  return (
    <>
      {/* Overlay com highlight */}
      <div className="fixed inset-0 z-[90] pointer-events-none">
        <div className="absolute inset-0 bg-black/60" style={{ clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${rect.top - 6}px, ${rect.left - 6}px ${rect.top - 6}px, ${rect.left - 6}px ${rect.bottom + 6}px, ${rect.right + 6}px ${rect.bottom + 6}px, ${rect.right + 6}px ${rect.top - 6}px, 0 ${rect.top - 6}px)` }} />
      </div>
      {/* Click blocker */}
      <div className="fixed inset-0 z-[91] pointer-events-auto" onClick={next} />
      {/* Highlight border */}
      <div className="fixed z-[92] rounded-xl ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent pointer-events-none transition-all duration-300"
        style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }} />

      {/* Tooltip */}
      <div ref={tooltipRef} className="fixed z-[93] pointer-events-auto"
        style={{ top: pos.top, left: pos.left, width: 280 }}>
        {/* Arrow */}
        {pos.arrowPos === "top" && (
          <div className="absolute -top-2 w-4 h-2 overflow-hidden" style={{ left: arrowLeft - 8 }}>
            <div className="w-4 h-4 bg-[#0d1117] border border-blue-500/30 rotate-45 translate-y-2 mx-auto" />
          </div>
        )}
        <div className="bg-[#0d1117] border border-blue-500/30 rounded-2xl p-4 shadow-2xl shadow-black/50">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-bold text-white">{step.title}</p>
            <button onClick={finish} className="text-gray-500 hover:text-white transition-colors ml-2 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">{step.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentStep ? "w-4 bg-blue-400" : "w-1.5 bg-white/20"}`} />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button onClick={prev} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button onClick={next} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold transition-all">
                {currentStep < steps.length - 1 ? (<>Próximo <ChevronRight className="w-3.5 h-3.5" /></>) : "Entendi ✓"}
              </button>
            </div>
          </div>
        </div>
        {pos.arrowPos === "bottom" && (
          <div className="absolute -bottom-2 w-4 h-2 overflow-hidden" style={{ left: arrowLeft - 8 }}>
            <div className="w-4 h-4 bg-[#0d1117] border border-blue-500/30 rotate-45 -translate-y-2 mx-auto" />
          </div>
        )}
      </div>
    </>
  );
}

export function useTour(tourKey: string) {
  const startTour = () => {
    localStorage.removeItem(`tour_${tourKey}`);
    window.dispatchEvent(new CustomEvent("start-tour", { detail: tourKey }));
  };
  return { startTour };
}
