import React from 'react';
import { useGameState } from '../../store/gameState';
import { SectionTitle, PaperCard, Pill } from './OfficePrimitives';

const SEASON_ICONS: Record<string, string> = {
  Primavera: '🌿',
  Verão: '☀️',
  Outono: '🍂',
  Inverno: '❄️',
};

const EVENTS = [
  { date: '15 Mar 1985', type: 'Tienta',     title: 'Tienta — Cercado Norte',               icon: '🎯', variant: 'amber' },
  { date: '18 Mar 1985', type: 'Corrida',    title: 'Corrida de Touros — Lisboa',            icon: '🏟️', variant: 'red' },
  { date: '22 Mar 1985', type: 'Leilão',     title: 'Leilão — Évora',                        icon: '💰', variant: 'green' },
  { date: '25 Mar 1985', type: 'Reprodução', title: 'Início da Temporada de Reprodução',     icon: '❤️', variant: 'rose' },
  { date: '10 Abr 1985', type: 'Corrida',    title: 'Corrida de Touros — Moita',             icon: '🏟️', variant: 'red' },
  { date: '20 Abr 1985', type: 'Visita',     title: 'Visita de Ganadeiro Espanhol',          icon: '🤝', variant: 'sky' },
] as const;

const CalendarioTab: React.FC = () => {
  const { state } = useGameState();
  const seasonIcon = SEASON_ICONS[state.season] ?? '🌍';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SectionTitle>Calendário da Herdade</SectionTitle>

      {/* Current period card */}
      <div className="grid grid-cols-3 gap-3 mb-5 shrink-0">
        {[
          { label: 'Mês', value: state.month },
          { label: 'Ano', value: String(state.year) },
          { label: 'Estação', value: `${seasonIcon} ${state.season}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-leather-800/40 border border-leather-600/30 rounded-lg p-3 text-center">
            <p className="text-ivory/30 text-[10px] font-body uppercase tracking-widest mb-1">{label}</p>
            <p className="font-display text-base text-gold">{value}</p>
          </div>
        ))}
      </div>

      <SectionTitle>Próximos Eventos</SectionTitle>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {EVENTS.map((ev, i) => (
          <PaperCard key={i}>
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0">{ev.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-ivory/85 text-sm font-body truncate">{ev.title}</p>
                <p className="text-ivory/35 text-[10px] font-body mt-0.5">{ev.date}</p>
              </div>
              <Pill label={ev.type} variant={ev.variant} />
            </div>
          </PaperCard>
        ))}
      </div>
    </div>
  );
};

export default CalendarioTab;
