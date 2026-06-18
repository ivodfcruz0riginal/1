import React, { useState, useMemo } from 'react';
import { useGameState } from '../../store/gameState';
import type { GameEvent } from '../../store/gameState';
import { SectionTitle, EmptyState } from './OfficePrimitives';

type FilterKey = 'Todos' | 'Animais' | 'Economia' | 'Pessoal' | 'Meteorologia' | 'Saúde';

const FILTERS: FilterKey[] = ['Todos', 'Animais', 'Economia', 'Pessoal', 'Meteorologia', 'Saúde'];

const FILTER_KEYWORDS: Record<FilterKey, string[]> = {
  Todos: [],
  Animais: ['vitelo', 'animal', 'novilho', 'toiro', 'vaca', 'semental', 'efetivo', 'cercado', 'bravura', 'peso', 'saúde', 'sanitário', 'condição'],
  Economia: ['€', 'subsídio', 'receita', 'despesa', 'lucro', 'financ', 'econom', 'venda', 'compra', 'leilão', 'preço'],
  Pessoal: ['trabalhador', 'pessoal', 'reforma', 'visita', 'ganadeiro', 'veterinário', 'parceria', 'acordo'],
  Meteorologia: ['seca', 'chuva', 'húmid', 'quente', 'frio', 'vento', 'tempo', 'pastage', 'feno'],
  Saúde: ['doença', 'saúde', 'veterinário', 'recuperação', 'lesão', 'sanitário', 'anomalia', 'respiratória'],
};

function matchesFilter(event: GameEvent, filter: FilterKey): boolean {
  if (filter === 'Todos') return true;
  const kw = FILTER_KEYWORDS[filter];
  const text = event.text.toLowerCase();
  return kw.some(k => text.includes(k));
}

const DiarioEntry: React.FC<{ event: GameEvent; isFirst: boolean }> = ({ event, isFirst }) => (
  <div className={`flex items-start gap-4 p-3 rounded-lg border transition-all duration-200
    ${isFirst
      ? 'bg-gold/6 border-gold/20 shadow-sm'
      : 'bg-leather-800/20 border-leather-700/20 hover:bg-leather-800/40 hover:border-leather-600/40'
    }`}
  >
    {/* Date stamp */}
    <div className="shrink-0 w-12 text-center">
      <p className="text-gold/60 text-[9px] font-body uppercase tracking-widest leading-none">{event.month.slice(0, 3)}</p>
      <p className="text-ivory/40 text-[11px] font-display mt-0.5">{event.year}</p>
    </div>
    <div className="w-px self-stretch bg-gradient-to-b from-gold/20 via-leather-600/30 to-transparent shrink-0" />
    <p className={`text-sm font-body leading-relaxed flex-1 ${isFirst ? 'text-ivory' : 'text-ivory/75'}`}>
      {event.text}
    </p>
  </div>
);

const DiarioTab: React.FC = () => {
  const { state } = useGameState();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('Todos');

  const filtered = useMemo(
    () => state.eventLog.filter(ev => matchesFilter(ev, activeFilter)),
    [state.eventLog, activeFilter],
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SectionTitle>Diário da Herdade</SectionTitle>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4 shrink-0">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-[11px] font-body border transition-all duration-150 ${
              activeFilter === f
                ? 'bg-gold/15 border-gold/50 text-gold'
                : 'bg-leather-800/30 border-leather-600/30 text-ivory/50 hover:text-ivory/70 hover:border-leather-500/50'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-ivory/25 text-[10px] font-body">{filtered.length} entradas</span>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filtered.length === 0
          ? <EmptyState icon="📋" title="Sem entradas" subtitle="Nenhum evento corresponde ao filtro seleccionado." />
          : filtered.map((ev, idx) => <DiarioEntry key={ev.id} event={ev} isFirst={idx === 0} />)
        }
      </div>
    </div>
  );
};

export default DiarioTab;
