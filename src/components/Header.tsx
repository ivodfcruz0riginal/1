import React from 'react';
import { useGameState } from '../store/gameState';
import type { Season } from '../store/gameState';

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

const SEASON_ICONS: Record<Season, string> = {
  Primavera: '❀',
  Verão: '☀',
  Outono: '🍂',
  Inverno: '❄',
};

const Header: React.FC = () => {
  const { state, advanceMonth } = useGameState();

  return (
    <header className="bg-leather-900 border-b-2 border-gold/20 px-6 py-3">
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
            <div className="w-px h-8 bg-gold/20 mx-2"></div>
            <div className="flex flex-col items-center min-w-[4.5rem]">
              <span className="text-ivory/40 text-[10px] font-body uppercase tracking-wider">Mês</span>
              <span className="font-display text-base text-ivory font-semibold">{state.month}</span>
            </div>
            <div className="w-px h-8 bg-gold/20 mx-2"></div>
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
            onClick={advanceMonth}
            className="group relative flex items-center gap-2 px-4 py-2.5 bg-leather-800/60 border-2 border-gold/40 rounded-lg hover:border-gold hover:bg-gold/10 transition-all duration-200 cursor-pointer"
          >
            <span className="font-display text-sm text-gold tracking-wider uppercase">Avançar Mês</span>
            <span className="text-gold/70 group-hover:translate-x-0.5 transition-transform">▶</span>
          </button>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-3">
          <StatBadge icon="👑" value="250" label="Prestígio" />
          <StatBadge icon="💶" value="100.000€" label="Tesouraria" highlight />
          <StatBadge icon="🐂" value="42" label="Efetivo" />
        </div>
      </div>
    </header>
  );
};

export default Header;
