import React, { useRef, useState } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { GameplayDirector, GameplayPhase } from '../core/gameplay/GameplayDirector';
import type { GameplayObjective } from '../core/gameplay/GameplayDirector';
import { useGameState } from '../store/gameState';
import type { LocationId } from '../types/location';

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
  '/economia':     'Economia',
  '/reproducao':   'Reprodução',
  '/tentas':       'Tentas',
  '/corridas':     'Corridas',
  '/legado':       'Legado',
  'casa':          'Casa Principal',
  'currais':       'Currais',
  'tentadero':     'Tentadero',
  'cercado_norte': 'Cercado Norte',
  'cercado_sul':   'Cercado Sul',
  'embarque':      'Embarque',
  'armazem':       'Armazém',
  'barragem':      'Barragem',
  'oficina':       'Oficina',
};

// ── Navigation helpers ────────────────────────────────────────────────────────

/** True when `loc` is a React Router route (starts with /). */
const isRoute = (loc: string) => loc.startsWith('/');

// ── Helpers ───────────────────────────────────────────────────────────────────

const isFallback = (obj: GameplayObjective) => obj.id === 'explore-herdade';

// ── Component ─────────────────────────────────────────────────────────────────

const GameplayObjectiveCard: React.FC = () => {
  const directorRef = useRef(new GameplayDirector(GameplayPhase.HERDADE));
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { setActiveLocation } = useGameState();

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

  const handleNavigate = () => {
    const loc = objective.location;
    if (!loc) return;

    if (isRoute(loc)) {
      navigate(loc);
    } else {
      // Location ID — open the panel on the Herdade map
      setActiveLocation(loc as LocationId);
      if (routerLocation.pathname !== '/herdade') {
        navigate('/herdade');
      }
    }
  };

  const fallback = isFallback(objective);
  const hasLocation = !!objective.location;
  const locationLabel = objective.location ? (LOCATION_LABELS[objective.location] ?? objective.location) : null;

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
              <p className="text-ivory/35 text-[10px] font-body leading-relaxed mb-3">
                Percorra os locais e descubra o que precisa de atenção.
              </p>
              <button
                onClick={() => navigate('/herdade')}
                className="w-full text-[10px] font-body text-gold/70 border border-gold/30 rounded px-3 py-1.5 uppercase tracking-wider transition-all duration-200 hover:border-gold/60 hover:text-gold hover:bg-gold/5"
              >
                Ir para a Herdade
              </button>
            </>
          ) : (
            <>
              <p className="font-display text-sm text-ivory/80 tracking-wide leading-snug mb-1">
                {objective.title}
              </p>
              <p className="text-ivory/40 text-[10px] font-body leading-relaxed mb-3">
                {objective.description}
              </p>

              <div className="flex flex-col gap-1.5">
                {hasLocation && (
                  <button
                    onClick={handleNavigate}
                    className="w-full text-[10px] font-body text-gold border border-gold/50 rounded px-3 py-1.5 uppercase tracking-wider transition-all duration-200 hover:bg-gold/10 hover:border-gold/80"
                  >
                    Ir para o local
                  </button>
                )}
                <button
                  onClick={handleComplete}
                  className="w-full text-[10px] font-body text-ivory/45 border border-leather-600/40 rounded px-3 py-1.5 uppercase tracking-wider transition-all duration-200 hover:border-leather-500/60 hover:text-ivory/65"
                >
                  Marcar como feito
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameplayObjectiveCard;
