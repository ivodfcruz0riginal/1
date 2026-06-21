import React from 'react';
import { useGameState } from '../../store/gameState';
import { SectionTitle, PaperCard, Pill, EmptyState } from './OfficePrimitives';
import type { BullightContract } from '../../types/contract';

const SEASON_ICONS: Record<string, string> = {
  Primavera: '🌿',
  Verão: '☀️',
  Outono: '🍂',
  Inverno: '❄️',
};

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const;

function monthIndex(m: string): number {
  return MONTHS.indexOf(m as typeof MONTHS[number]);
}

function contractIsUpcoming(c: BullightContract, currentYear: number, currentMonth: string): boolean {
  const perfIdx = monthIndex(c.performanceMonth);
  const curIdx  = monthIndex(currentMonth);
  if (c.performanceYear > currentYear) return true;
  if (c.performanceYear === currentYear && perfIdx >= curIdx) return true;
  return false;
}

const SEASONAL_NOTES: Record<string, string> = {
  Primavera: 'Época ideal para avaliar os jovens animais e preparar o efectivo para as corridas de verão.',
  Verão:     'Alta temporada de corridas. Certifique-se que os animais reservados estão em boa condição.',
  Outono:    'Período de maneio. Boa altura para rever contratos e planear a temporada seguinte.',
  Inverno:   'Época de repouso. Mantenha os animais alimentados e aproveite para gerir a administração.',
};

const CalendarioTab: React.FC = () => {
  const { state } = useGameState();
  const seasonIcon = SEASON_ICONS[state.season] ?? '🌍';
  const seasonNote = SEASONAL_NOTES[state.season] ?? '';

  const upcoming = (state.contracts ?? [])
    .filter(c => (c.status === 'Aceite' || c.status === 'Pendente') && contractIsUpcoming(c, state.year, state.month))
    .sort((a, b) => {
      if (a.performanceYear !== b.performanceYear) return a.performanceYear - b.performanceYear;
      return monthIndex(a.performanceMonth) - monthIndex(b.performanceMonth);
    });

  const past = (state.contracts ?? [])
    .filter(c => c.status === 'Concluído' || c.status === 'Cancelado')
    .slice(-5)
    .reverse();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SectionTitle>Calendário da Herdade</SectionTitle>

      {/* Current period */}
      <div className="grid grid-cols-3 gap-3 mb-4 shrink-0">
        {[
          { label: 'Mês',     value: state.month },
          { label: 'Ano',     value: String(state.year) },
          { label: 'Estação', value: `${seasonIcon} ${state.season}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-leather-800/40 border border-leather-600/30 rounded-lg p-3 text-center">
            <p className="text-ivory/30 text-[10px] font-body uppercase tracking-widest mb-1">{label}</p>
            <p className="font-display text-base text-gold">{value}</p>
          </div>
        ))}
      </div>

      {/* Seasonal note */}
      <div className="mb-4 px-4 py-2.5 bg-leather-800/30 border border-leather-600/25 rounded-lg shrink-0">
        <p className="text-ivory/50 text-xs font-body leading-relaxed">{seasonNote}</p>
      </div>

      {/* Upcoming contracts */}
      <SectionTitle>Corridas Agendadas</SectionTitle>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {upcoming.length === 0 ? (
          <EmptyState icon="📅" title="Sem corridas agendadas" subtitle="Aceite um contrato no Escritório para ver as corridas aqui." />
        ) : (
          upcoming.map(c => (
            <PaperCard key={c.id}>
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">🏟️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-ivory/85 text-sm font-body truncate">{c.placeName}</p>
                  <p className="text-ivory/35 text-[10px] font-body mt-0.5">
                    {c.performanceMonth} {c.performanceYear} · {c.bullsRequired} toiros reservados
                  </p>
                </div>
                <Pill
                  label={c.status === 'Aceite' ? 'Confirmado' : 'Pendente'}
                  variant={c.status === 'Aceite' ? 'green' : 'amber'}
                />
              </div>
            </PaperCard>
          ))
        )}
      </div>

      {/* Past events */}
      {past.length > 0 && (
        <>
          <SectionTitle>Histórico Recente</SectionTitle>
          <div className="shrink-0 space-y-1.5 overflow-y-auto max-h-40 pr-1">
            {past.map(c => (
              <PaperCard key={c.id}>
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0 opacity-50">🏟️</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-ivory/50 text-sm font-body truncate">{c.placeName}</p>
                    <p className="text-ivory/25 text-[10px] font-body mt-0.5">{c.performanceMonth} {c.performanceYear}</p>
                  </div>
                  <Pill label={c.status} variant={c.status === 'Concluído' ? 'muted' : 'red'} />
                </div>
              </PaperCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarioTab;
