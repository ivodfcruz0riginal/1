import React from 'react';
import { SectionTitle, StatBlock, EmptyState } from './OfficePrimitives';
import { useGameState } from '../../store/gameState';

const PRESTIGE_MAX = 1000;

const PrestigioTab: React.FC = () => {
  const { state } = useGameState();
  const prestige = state.prestige;
  const pct = Math.round((prestige / PRESTIGE_MAX) * 100);
  const segments = 20;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SectionTitle>Prestígio da Ganaderia</SectionTitle>

      {/* Main prestige meter */}
      <div className="bg-leather-800/40 border border-leather-600/40 rounded-lg p-5 mb-5 shrink-0">
        <div className="flex items-end gap-6">
          <div className="flex-1">
            <p className="text-ivory/30 text-[10px] font-body uppercase tracking-wider mb-3">Prestígio Actual</p>
            {/* Segmented bar */}
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: segments }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-4 rounded-sm transition-all duration-700 ${
                    i < Math.round((pct / 100) * segments)
                      ? i < 7  ? 'bg-leather-500/70'
                      : i < 12 ? 'bg-amber-600/70'
                      : i < 17 ? 'bg-gold/70'
                      :          'bg-gold'
                      : 'bg-leather-700/40'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-ivory/25 font-body">
              <span>Desconhecida</span>
              <span>Regional</span>
              <span>Nacional</span>
              <span>Internacional</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-4xl text-gold">{prestige}</p>
            <p className="text-ivory/30 text-[10px] font-body uppercase tracking-wider">/ {PRESTIGE_MAX}</p>
          </div>
        </div>
      </div>

      {/* Ranking placeholders */}
      <div className="grid grid-cols-2 gap-3 mb-5 shrink-0">
        <StatBlock label="Classificação Regional" value="—" sub="Disponível brevemente" />
        <StatBlock label="Classificação Nacional" value="—" sub="Disponível brevemente" />
      </div>

      {/* Achievements placeholder */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <SectionTitle>Conquistas</SectionTitle>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon="🏆" title="Sem conquistas desbloqueadas" subtitle="Lide e crie toiros excepcionais para ganhar prestígio." />
        </div>
      </div>
    </div>
  );
};

export default PrestigioTab;
