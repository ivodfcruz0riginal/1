import React from 'react';
import { useGameState } from '../../store/gameState';
import { SectionTitle, PaperCard, Pill } from './OfficePrimitives';

const SEASON_ICONS: Record<string, string> = {
  Primavera: '🌿',
  Verão: '☀️',
  Outono: '🍂',
  Inverno: '❄️',
};

const RECURRING_EVENTS = [
  { monthOffset: 0, type: 'Tienta',     title: 'Tienta Ordinária — Cercado Norte',        icon: '🎯', variant: 'amber' as const },
  { monthOffset: 1, type: 'Corrida',    title: 'Corrida de Touros — Lisboa',               icon: '🏟️', variant: 'red' as const },
  { monthOffset: 1, type: 'Leilão',     title: 'Leilão de Gado — Évora',                   icon: '💰', variant: 'green' as const },
  { monthOffset: 2, type: 'Reprodução', title: 'Início da Temporada de Reprodução',        icon: '❤️', variant: 'rose' as const },
  { monthOffset: 2, type: 'Corrida',    title: 'Corrida de Touros — Moita',                icon: '🏟️', variant: 'red' as const },
  { monthOffset: 3, type: 'Visita',     title: 'Visita Veterinária Trimestral',            icon: '🩺', variant: 'sky' as const },
];

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const ALL_MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const CalendarioTab: React.FC = () => {
  const { state } = useGameState();
  const seasonIcon = SEASON_ICONS[state.season] ?? '🌍';
  const currentIdx = ALL_MONTHS.indexOf(state.month);

  const upcomingEvents = RECURRING_EVENTS.map(ev => {
    const targetIdx = (currentIdx + ev.monthOffset) % 12;
    const targetYear = state.year + Math.floor((currentIdx + ev.monthOffset) / 12);
    const date = `${MONTH_NAMES[targetIdx]} ${targetYear}`;
    return { ...ev, date };
  });

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
        {upcomingEvents.map((ev, i) => (
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
