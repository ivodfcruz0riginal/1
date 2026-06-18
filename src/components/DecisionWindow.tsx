import React from 'react';
import { useGameState } from '../store/gameState';
import type { DecisionCategory } from '../data/decisions';
import { useConsequences } from '../store/consequenceStore';
import { generateConsequencesFromDecision } from '../services/consequenceService';

// ── Category styling ──────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<DecisionCategory, { dot: string; label: string }> = {
  'Saúde Animal':  { dot: 'bg-amber-500',   label: 'text-amber-700' },
  'Contrato':      { dot: 'bg-sky-500',      label: 'text-sky-700' },
  'Gestão':        { dot: 'bg-emerald-500',  label: 'text-emerald-700' },
  'Evento':        { dot: 'bg-rose-500',     label: 'text-rose-700' },
  'Pessoal':       { dot: 'bg-stone-500',    label: 'text-stone-600' },
};

// ── Ornament SVG ──────────────────────────────────────────────────────────────

const CornerOrnament: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br' }> = ({ position }) => {
  const rotate = { tl: '0', tr: '90', bl: '270', br: '180' }[position];
  const pos: Record<string, string> = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  };
  return (
    <svg
      className={`absolute ${pos[position]} w-10 h-10 pointer-events-none`}
      style={{ transform: `rotate(${rotate}deg)` }}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path d="M2 2 L2 16 M2 2 L16 2" stroke="rgba(201,162,39,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 2 L10 10" stroke="rgba(201,162,39,0.3)" strokeWidth="0.75" />
      <circle cx="2" cy="2" r="1.5" fill="rgba(201,162,39,0.6)" />
    </svg>
  );
};

// ── Image placeholder ─────────────────────────────────────────────────────────

const ImagePlaceholder: React.FC<{ hint: string; category: DecisionCategory }> = ({ hint, category }) => (
  <div className="w-full aspect-[4/3] rounded border border-dashed border-leather-600/50 bg-leather-800/30 flex flex-col items-center justify-center gap-2 px-3">
    <div className={`w-2 h-2 rounded-full ${CATEGORY_STYLE[category].dot} opacity-60`} />
    <p className="text-leather-600/60 text-[9px] font-body uppercase tracking-widest text-center leading-tight">{hint}</p>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const DecisionWindow: React.FC = () => {
  const { state, resolveDecision } = useGameState();
  const { addConsequences } = useConsequences();
  const { pendingDecision } = state;

  if (!pendingDecision) return null;

  const catStyle = CATEGORY_STYLE[pendingDecision.category];

  const handleChoice = (choice: string, index: number) => {
    const consequences = generateConsequencesFromDecision(
      pendingDecision.id,
      index,
      { month: state.month, year: state.year },
    );
    if (consequences.length > 0) addConsequences(consequences);
    resolveDecision(choice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Window */}
      <div
        className="relative w-full max-w-lg shadow-2xl rounded-lg overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 20px rgba(201,162,39,0.08)' }}
      >
        {/* Leather outer frame */}
        <div
          className="relative p-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(201,162,39,0.35) 0%, rgba(90,60,30,0.6) 40%, rgba(201,162,39,0.25) 100%)',
          }}
        >
          <CornerOrnament position="tl" />
          <CornerOrnament position="tr" />
          <CornerOrnament position="bl" />
          <CornerOrnament position="br" />

          {/* Parchment inner */}
          <div
            className="rounded"
            style={{ background: 'linear-gradient(150deg, #f5ead0 0%, #ecdcb8 40%, #f0e5cc 100%)' }}
          >
            {/* Header band — dark leather */}
            <div
              className="px-6 py-4"
              style={{ background: 'linear-gradient(90deg, #1a1108 0%, #261808 50%, #1a1108 100%)' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                <span className="text-gold/60 text-[9px] font-body uppercase tracking-[0.25em]">
                  {pendingDecision.category}
                </span>
              </div>
              <h2 className="font-display text-lg text-gold tracking-widest uppercase leading-tight">
                {pendingDecision.title}
              </h2>
            </div>

            {/* Thin gold rule */}
            <div className="h-px bg-gradient-to-r from-transparent via-leather-500/60 to-transparent" />

            {/* Body */}
            <div className="p-6">
              <div className="flex gap-5">
                {/* Image placeholder */}
                <div className="w-28 shrink-0">
                  <ImagePlaceholder hint={pendingDecision.imageHint} category={pendingDecision.category} />
                </div>

                {/* Description */}
                <div className="flex-1">
                  <p className="text-leather-800 text-sm font-body leading-relaxed italic">
                    "{pendingDecision.description}"
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 h-px bg-gradient-to-r from-transparent via-leather-500/40 to-transparent" />

              {/* Choices */}
              <div className="flex flex-col gap-2">
                {pendingDecision.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(choice, i)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded border transition-all duration-200 group"
                    style={{
                      background: 'rgba(26,17,8,0.88)',
                      borderColor: 'rgba(90,60,30,0.5)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,162,39,0.6)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(35,22,8,0.95)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(90,60,30,0.5)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(26,17,8,0.88)';
                    }}
                  >
                    <span className="text-gold/30 text-xs font-body group-hover:text-gold/70 transition-colors shrink-0">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="text-ivory/70 text-xs font-body group-hover:text-ivory/95 transition-colors">
                      {choice}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionWindow;
