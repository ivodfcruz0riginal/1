import React, { useRef } from 'react';
import { useGameState } from '../store/gameState';
import type { Season, GamePhase } from '../store/gameState';
import { formatEuro } from '../store/economyEngine';
import { useConsequences, selectActiveConsequences } from '../store/consequenceStore';

// ── StatBadge ─────────────────────────────────────────────────────────────────

interface StatBadgeProps {
  icon: string;
  value: string | number;
  label?: string;
  highlight?: boolean;
}

const StatBadge: React.FC<StatBadgeProps> = ({ icon, value, label, highlight }) => (
  <div className={`flex items-center gap-2.5 px-4 py-2 rounded-md border transition-all duration-300 ${
    highlight
      ? 'bg-gold/15 border-gold/50 hover:border-gold'
      : 'bg-leather-800/60 border-leather-600/50 hover:border-gold/40'
  }`}>
    <span className="text-lg">{icon}</span>
    <div className="flex flex-col">
      {label && <span className="text-ivory/50 text-[10px] font-body uppercase tracking-wider">{label}</span>}
      <span className={`font-display text-lg font-semibold ${highlight ? 'text-gold' : 'text-ivory'}`}>
        {value}
      </span>
    </div>
  </div>
);

// ── Phase indicator ───────────────────────────────────────────────────────────

const PHASE_ORDER: GamePhase[] = [
  'MonthStart',
  'DailyPlanning',
  'EstateManagement',
  'Decisions',
  'EndOfMonth',
  'Simulation',
];

const PHASE_LABELS: Record<GamePhase, string> = {
  MonthStart:       'Alvorada',
  DailyPlanning:    'Ordens do Dia',
  EstateManagement: 'Na Herdade',
  Decisions:        'À Consulta',
  EndOfMonth:       'Ao Crepúsculo',
  Simulation:       'A Natureza Actua',
};

const PhaseIndicator: React.FC<{ current: GamePhase }> = ({ current }) => (
  <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-leather-700/40">
    {PHASE_ORDER.flatMap((phase, i) => {
      const isActive = phase === current;
      const pill = (
        <div
          key={phase}
          className={`px-2.5 py-0.5 rounded text-[9px] font-body uppercase tracking-wider border transition-all duration-300 ${
            isActive
              ? 'bg-gold/20 border-gold/50 text-gold shadow-[0_0_8px_rgba(201,162,39,0.2)]'
              : 'border-leather-600/25 text-ivory/18'
          }`}
        >
          {PHASE_LABELS[phase]}
        </div>
      );
      if (i < PHASE_ORDER.length - 1) {
        return [
          pill,
          <span key={`sep-${i}`} className="text-leather-600/35 text-[8px] select-none leading-none">›</span>,
        ];
      }
      return [pill];
    })}
  </div>
);

// ── Season icons ──────────────────────────────────────────────────────────────

const SEASON_ICONS: Record<Season, string> = {
  Primavera: '❀',
  Verão: '☀',
  Outono: '🍂',
  Inverno: '❄',
};

// ── Header ────────────────────────────────────────────────────────────────────

const Header: React.FC = () => {
  const { state, advanceMonth, setPhase } = useGameState();
  const { state: conseqState, setShowPanel } = useConsequences();
  const activeConsequences = selectActiveConsequences(conseqState);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAdvanceMonth = () => {
    if (advanceTimerRef.current) return; // prevent double-click

    setPhase('EndOfMonth');
    advanceTimerRef.current = setTimeout(() => {
      setPhase('Simulation');
      advanceTimerRef.current = setTimeout(() => {
        advanceTimerRef.current = null;
        advanceMonth();
      }, 500);
    }, 500);
  };

  const isAdvancing = state.phase === 'EndOfMonth' || state.phase === 'Simulation';

  return (
    <header className="bg-leather-900 border-b-2 border-gold/20 px-6 pt-3 pb-2">
      <div className="flex items-center justify-between">
        {/* Left: Title */}
        <div className="flex items-center gap-6">
          <div>
            <h1 className="font-display text-2xl text-gold tracking-widest uppercase">HERANÇA BRAVA</h1>
            <p className="text-ivory/40 text-xs font-body tracking-wide">GESTÃO DE TOURO BRAVO</p>
          </div>
        </div>

        {/* Center: Year, Month & Season + Advance button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-leather-800/50 border-2 border-gold/30 rounded-lg px-5 py-2">
            <div className="flex flex-col items-center">
              <span className="text-ivory/40 text-[10px] font-body uppercase tracking-wider">Ano</span>
              <span className="font-display text-2xl text-ivory font-bold">{state.year}</span>
            </div>
            <div className="w-px h-8 bg-gold/20 mx-2" />
            <div className="flex flex-col items-center min-w-[4.5rem]">
              <span className="text-ivory/40 text-[10px] font-body uppercase tracking-wider">Mês</span>
              <span className="font-display text-base text-ivory font-semibold">{state.month}</span>
            </div>
            <div className="w-px h-8 bg-gold/20 mx-2" />
            <div className="flex flex-col items-center">
              <span className="text-ivory/40 text-[10px] font-body uppercase tracking-wider">Estação</span>
              <div className="flex items-center gap-1.5">
                <span className="text-gold">{SEASON_ICONS[state.season]}</span>
                <span className="font-display text-base text-gold font-semibold">{state.season}</span>
              </div>
            </div>
          </div>

          {/* Advance Month button */}
          <button
            onClick={handleAdvanceMonth}
            disabled={isAdvancing}
            className={`group relative flex items-center gap-2 px-4 py-2.5 border-2 rounded-lg transition-all duration-200 ${
              isAdvancing
                ? 'bg-gold/5 border-gold/20 cursor-not-allowed opacity-60'
                : 'bg-leather-800/60 border-gold/40 hover:border-gold hover:bg-gold/10 cursor-pointer'
            }`}
          >
            {isAdvancing ? (
              <>
                <span className="font-display text-sm text-gold/60 tracking-wider uppercase">
                  {state.phase === 'EndOfMonth' ? 'Fim do Mês...' : 'Simulando...'}
                </span>
                <span className="text-gold/40 animate-spin text-xs">◌</span>
              </>
            ) : (
              <>
                <span className="font-display text-sm text-gold tracking-wider uppercase">Avançar Mês</span>
                <span className="text-gold/70 group-hover:translate-x-0.5 transition-transform">▶</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Stats + Consequence notification */}
        <div className="flex items-center gap-3">
          <StatBadge icon="👑" value={state.prestige} label="Prestígio" />
          <StatBadge icon="💶" value={formatEuro(state.economy.treasury)} label="Tesouraria" highlight />
          <StatBadge icon="🐂" value={state.animals.filter(a => a.status === 'Ativo').length} label="Cabeças" />

          {/* Consequence notification bell */}
          <button
            onClick={() => setShowPanel(true)}
            className="relative flex items-center justify-center w-10 h-10 rounded-md border border-leather-600/50 bg-leather-800/60 hover:border-gold/40 transition-all duration-200"
            title="Consequências"
          >
            <span className="text-base text-ivory/50 leading-none">🔔</span>
            {activeConsequences.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-lg shadow-red-900/50">
                {activeConsequences.length > 9 ? '9+' : activeConsequences.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Phase indicator */}
      <PhaseIndicator current={state.phase} />
    </header>
  );
};

export default Header;
