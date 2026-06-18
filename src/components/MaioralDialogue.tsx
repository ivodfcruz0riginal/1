import React from 'react';
import { useGameState } from '../store/gameState';

const MaioralDialogue: React.FC = () => {
  const { state, answerDialogue } = useGameState();
  const { pendingDialogue } = state;

  if (!pendingDialogue) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center pb-10 px-6 pointer-events-none">
      {/* Subtle bottom vignette to lift the card */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/50 via-black/15 to-transparent pointer-events-none" />

      <div
        className="relative pointer-events-auto w-full max-w-xl rounded-lg shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1f1609 0%, #170e06 100%)',
          border: '1px solid rgba(180,140,55,0.38)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold/50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold/50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold/50 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-leather-700/40">
          {/* Character avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-leather-700/70 border-2 border-gold/30 flex items-center justify-center overflow-hidden">
              {/* Campino silhouette */}
              <div className="absolute bottom-0 inset-x-0 h-5 bg-leather-800/80" />
              <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-800/70 rounded-full" />
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-leather-900/80 rounded-full" />
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-leather-800/70 rounded-t-sm" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gold/80 border border-leather-900 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-leather-900" />
            </div>
          </div>

          <div>
            <p className="font-display text-sm text-gold tracking-widest uppercase leading-none">Manuel</p>
            <p className="text-ivory/35 text-[10px] font-body uppercase tracking-wider mt-0.5">
              Maioral · Herdade da Ferraria
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-pulse" />
            <span className="text-ivory/20 text-[9px] font-body uppercase tracking-widest">À sua espera</span>
          </div>
        </div>

        {/* Speech */}
        <div className="px-5 pt-4 pb-3">
          <div className="relative pl-3 border-l-2 border-gold/25">
            <p className="text-ivory/80 text-sm font-body leading-relaxed italic">
              "{pendingDialogue.text}"
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-leather-600/40 to-transparent" />

        {/* Choices */}
        <div className="px-5 py-4 flex flex-col gap-2">
          {pendingDialogue.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => answerDialogue(choice)}
              className="text-left flex items-center gap-2.5 px-3.5 py-2.5 border border-leather-600/40 rounded transition-all duration-200 hover:border-gold/50 hover:bg-gold/6 group"
            >
              <span className="text-gold/35 text-xs font-body group-hover:text-gold/70 transition-colors shrink-0">›</span>
              <span className="text-ivory/65 text-xs font-body group-hover:text-ivory/90 transition-colors">
                {choice}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaioralDialogue;
