import React, { useRef, useState } from 'react';
import { GameplayDirector, GameplayPhase } from '../core/gameplay/GameplayDirector';
import type { GameplayObjective } from '../core/gameplay/GameplayDirector';

// ── Labels ────────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<GameplayPhase, string> = {
  [GameplayPhase.WELCOME]:           'Bem-vindo',
  [GameplayPhase.MORNING_REPORT]:    'Alvorada',
  [GameplayPhase.PLANNING]:          'Planeamento',
  [GameplayPhase.HERDADE]:           'Na Herdade',
  [GameplayPhase.OFFICE]:            'Escritório',
  [GameplayPhase.ANIMAL_MANAGEMENT]: 'Efectivo',
  [GameplayPhase.DECISION]:          'Decisão',
  [GameplayPhase.MONTH_END]:         'Fim do Mês',
  [GameplayPhase.SIMULATION]:        'Simulação',
  [GameplayPhase.REVIEW]:            'Balanço',
};

const LOCATION_LABELS: Record<string, string> = {
  '/herdade':      'Herdade',
  '/escritorio':   'Escritório',
  '/efetivo':      'Efectivo',
  'currais':       'Currais',
  'tentadero':     'Tentadero',
  'cercado_norte': 'Cercado Norte',
  'cercado_sul':   'Cercado Sul',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const isFallback = (obj: GameplayObjective) => obj.id === 'explore-herdade';

// ── Component ─────────────────────────────────────────────────────────────────

const GameplayObjectiveCard: React.FC = () => {
  const directorRef = useRef(new GameplayDirector(GameplayPhase.HERDADE));

  const [phase, setPhase] = useState<GameplayPhase>(
    () => directorRef.current.getCurrentPhase(),
  );
  const [objective, setObjective] = useState<GameplayObjective>(
    () => directorRef.current.getCurrentObjective(),
  );

  const handleComplete = () => {
    directorRef.current.completeObjective(objective.id);
    directorRef.current.advancePhase();
    setPhase(directorRef.current.getCurrentPhase());
    setObjective(directorRef.current.getCurrentObjective());
  };

  const fallback = isFallback(objective);
  const locationLabel = objective.location
    ? (LOCATION_LABELS[objective.location] ?? objective.location)
    : null;

  return (
    <div className="absolute bottom-6 right-6 z-20 w-56 pointer-events-auto">
      <div
        className="rounded-lg overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(160deg, #1a1208 0%, #140e05 100%)',
          border: '1px solid rgba(201,162,39,0.35)',
        }}
      >
        {/* Phase + location header */}
        <div className="flex items-center justify-between px-3 pt-2.5">
          <p className="text-ivory/30 text-[9px] font-body uppercase tracking-[0.2em]">
            {PHASE_LABELS[phase]}
          </p>
          {locationLabel && (
            <span className="text-gold/40 text-[9px] font-body border border-gold/20 rounded-full px-2 py-0.5 shrink-0">
              {locationLabel}
            </span>
          )}
        </div>

        <div className="mx-3 mt-2 h-px bg-gradient-to-r from-transparent via-leather-600/40 to-transparent" />

        {/* Objective content */}
        <div className="px-3 py-2.5">
          {fallback ? (
            <>
              <p className="font-display text-sm text-gold/70 tracking-wide leading-snug mb-1.5">
                Explorar a Herdade
              </p>
              <p className="text-ivory/35 text-[10px] font-body leading-relaxed">
                Percorra os locais e descubra o que precisa de atenção.
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-sm text-ivory/80 tracking-wide leading-snug mb-1">
                {objective.title}
              </p>
              <p className="text-ivory/40 text-[10px] font-body leading-relaxed mb-3">
                {objective.description}
              </p>
              <button
                onClick={handleComplete}
                className="w-full text-[10px] font-body text-gold/70 border border-gold/30 rounded px-3 py-1.5 uppercase tracking-wider transition-all duration-200 hover:border-gold/60 hover:text-gold hover:bg-gold/5"
              >
                Marcar como feito
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameplayObjectiveCard;
