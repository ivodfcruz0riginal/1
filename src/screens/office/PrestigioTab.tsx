import React from 'react';
import { SectionTitle, StatBlock, EmptyState } from './OfficePrimitives';
import { useGameState } from '../../store/gameState';

function getTier(pct: number): { label: string; desc: string } {
  if (pct >= 75) return { label: 'Internacional', desc: 'A ganaderia é reconhecida além-fronteiras. Os melhores touros são disputados pelas grandes praças.' };
  if (pct >= 50) return { label: 'Nacional',      desc: 'A reputação da ganaderia chega a todo o país. As praças de primeira categoria já procuram os vossos animais.' };
  if (pct >= 25) return { label: 'Regional',      desc: 'O nome da ganaderia começa a circular pela região. Continue a criar toiros de qualidade e a honrar os contratos.' };
  return { label: 'Desconhecida', desc: 'A ganaderia está a dar os primeiros passos. Aceite contratos, crie bons toiros e tome decisões acertadas para crescer.' };
}

function getNextGoal(pct: number): string {
  if (pct >= 75) return 'Mantenha a classificação internacional cumprindo os contratos e garantindo bravura nos animais.';
  if (pct >= 50) return `Precisa de ${75 - pct} pontos para atingir prestígio Internacional. Aceite corridas de renome e negoceie bem.`;
  if (pct >= 25) return `Precisa de ${50 - pct} pontos para prestígio Nacional. Crie toiros bravos e honre os contratos aceites.`;
  return `Precisa de ${25 - pct} pontos para prestígio Regional. Avance meses, resolva as tarefas e aceite o primeiro contrato.`;
}

const PrestigioTab: React.FC = () => {
  const { state } = useGameState();
  const pct = state.prestige;
  const segments = 20;
  const tier = getTier(pct);
  const nextGoal = getNextGoal(pct);

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
            <p className="font-display text-4xl text-gold">{pct}</p>
            <p className="text-ivory/30 text-[10px] font-body uppercase tracking-wider">/ 100</p>
          </div>
        </div>
      </div>

      {/* Tier + next goal */}
      <div className="grid grid-cols-2 gap-3 mb-5 shrink-0">
        <StatBlock label="Classificação Actual" value={tier.label} sub={tier.desc} />
        <StatBlock label="Próximo Objectivo" value="↑" sub={nextGoal} />
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

