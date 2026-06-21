import React, { useState } from 'react';
import { useGameplayDirector } from '../hooks/useGameplayDirector';
import type { DirectorPhase } from '../core/directors/GameplayDirector';

// ── Phase labels ──────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<DirectorPhase, string> = {
  Welcome:            'Chegada',
  MorningBriefing:    'Alvorada',
  Planning:           'Ordens do Dia',
  EstateManagement:   'Na Herdade',
  Decision:           'Decisão',
  MonthlySimulation:  'Simulação',
  Review:             'Balanço',
  Repeat:             'Novo Mês',
};

// ── Priority styles ───────────────────────────────────────────────────────────

const PRIORITY_BORDER: Record<string, string> = {
  urgent:   'border-gold/55',
  normal:   'border-leather-600/50',
  optional: 'border-leather-700/35',
};

const PRIORITY_DOT: Record<string, string> = {
  urgent:   'bg-gold',
  normal:   'bg-leather-500/70',
  optional: 'bg-leather-600/40',
};

const PRIORITY_TEXT: Record<string, string> = {
  urgent:   'text-gold/90',
  normal:   'text-ivory/75',
  optional: 'text-ivory/45',
};

// ── Director card ─────────────────────────────────────────────────────────────

const DirectorCard: React.FC = () => {
  const { phase, objective, isBlocked } = useGameplayDirector();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-6 left-4 z-20 w-52 pointer-events-auto">
      <div
        className={`rounded-lg overflow-hidden shadow-xl transition-all duration-300 ${PRIORITY_BORDER[objective.priority]}`}
        style={{
          background: 'linear-gradient(160deg, #1a1208 0%, #140e05 100%)',
          border: `1px solid`,
          borderColor: isBlocked ? 'rgba(201,162,39,0.5)' : 'rgba(90,60,30,0.5)',
        }}
      >
        {/* Header — always visible */}
        <button
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-leather-700/20 transition-colors"
          onClick={() => setCollapsed(v => !v)}
        >
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[objective.priority]} ${isBlocked ? 'animate-pulse' : ''}`} />
            <p className="text-ivory/30 text-[9px] font-body uppercase tracking-[0.2em]">
              {PHASE_LABELS[phase]}
            </p>
          </div>
          <span className={`text-ivory/20 text-[9px] transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}>▾</span>
        </button>

        {/* Objective — collapsible */}
        {!collapsed && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-leather-600/40 to-transparent" />
            <div className="px-3 py-2.5">
              <p className={`font-display text-sm tracking-wide leading-snug mb-1 ${PRIORITY_TEXT[objective.priority]}`}>
                {objective.text}
              </p>
              <p className="text-ivory/28 text-[10px] font-body leading-relaxed">
                {objective.hint}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DirectorCard;
