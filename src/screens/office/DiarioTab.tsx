import React, { useState, useMemo } from 'react';
import { useGameState } from '../../store/gameState';
import type { GameEvent } from '../../store/gameState';
import type { DecisionRecord } from '../../store/gameTypes';
import { SectionTitle, EmptyState, Pill } from './OfficePrimitives';

type FilterKey = 'Todos' | 'Animais' | 'Economia' | 'Contratos' | 'Pessoal' | 'Meteorologia' | 'Saúde';

const FILTERS: FilterKey[] = ['Todos', 'Animais', 'Economia', 'Contratos', 'Pessoal', 'Meteorologia', 'Saúde'];

const FILTER_KEYWORDS: Record<FilterKey, string[]> = {
  Todos: [],
  Animais: ['vitelo', 'animal', 'novilho', 'toiro', 'vaca', 'semental', 'efetivo', 'cercado', 'bravura', 'peso', 'saúde', 'sanitário', 'condição'],
  Economia: ['€', 'subsídio', 'receita', 'despesa', 'lucro', 'financ', 'econom', 'venda', 'compra', 'leilão', 'preço'],
  Contratos: ['contrato', 'praça', 'corrida', 'adiantamento', 'reserv', 'aceite', 'recusad', 'negociad'],
  Pessoal: ['trabalhador', 'pessoal', 'reforma', 'visita', 'ganadeiro', 'veterinário', 'parceria', 'acordo'],
  Meteorologia: ['seca', 'chuva', 'húmid', 'quente', 'frio', 'vento', 'tempo', 'pastage', 'feno'],
  Saúde: ['doença', 'saúde', 'veterinário', 'recuperação', 'lesão', 'sanitário', 'anomalia', 'respiratória'],
};

const CATEGORY_VARIANT: Record<string, 'gold' | 'amber' | 'sky' | 'green' | 'rose' | 'muted'> = {
  'Saúde Animal': 'rose',
  'Contrato': 'sky',
  'Gestão': 'amber',
  'Evento': 'gold',
  'Pessoal': 'green',
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

const DecisionEntry: React.FC<{ record: DecisionRecord; isFirst: boolean }> = ({ record, isFirst }) => (
  <div className={`flex items-start gap-4 p-3 rounded-lg border transition-all duration-200
    ${isFirst
      ? 'bg-gold/6 border-gold/20 shadow-sm'
      : 'bg-leather-800/20 border-leather-700/20 hover:bg-leather-800/40 hover:border-leather-600/40'
    }`}
  >
    <div className="shrink-0 w-12 text-center">
      <p className="text-gold/60 text-[9px] font-body uppercase tracking-widest leading-none">{record.month.slice(0, 3)}</p>
      <p className="text-ivory/40 text-[11px] font-display mt-0.5">{record.year}</p>
    </div>
    <div className="w-px self-stretch bg-gradient-to-b from-gold/20 via-leather-600/30 to-transparent shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <p className={`text-sm font-body font-medium ${isFirst ? 'text-ivory' : 'text-ivory/80'}`}>
          {record.title}
        </p>
        <Pill label={record.category} variant={CATEGORY_VARIANT[record.category] ?? 'muted'} />
      </div>
      <p className="text-ivory/50 text-xs font-body italic leading-snug">
        "{record.choice}"
      </p>
      {record.result && (
        <p className="text-ivory/40 text-[11px] font-body mt-1 leading-snug">{record.result}</p>
      )}
    </div>
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
    <div className="h-full flex flex-col overflow-hidden gap-4">
      {/* ── Events section ─────────────────────────────────────────────── */}
      <div className="flex flex-col min-h-0 flex-1">
        <SectionTitle>Diário da Herdade</SectionTitle>

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

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filtered.length === 0
            ? <EmptyState icon="📋" title="Sem entradas" subtitle="Nenhum evento corresponde ao filtro seleccionado." />
            : filtered.map((ev, idx) => <DiarioEntry key={ev.id} event={ev} isFirst={idx === 0} />)
          }
        </div>
      </div>

      {/* ── Decisions section ───────────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col" style={{ maxHeight: '40%' }}>
        <SectionTitle>Decisões Recentes</SectionTitle>
        {state.decisionHistory.length === 0 ? (
          <p className="text-ivory/25 text-xs font-body italic px-1">Nenhuma decisão tomada ainda.</p>
        ) : (
          <div className="overflow-y-auto space-y-1.5 pr-1">
            {state.decisionHistory.slice(0, 10).map((rec, idx) => (
              <DecisionEntry key={rec.instanceId} record={rec} isFirst={idx === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiarioTab;
