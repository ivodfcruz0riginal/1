import React, { useState, useMemo } from 'react';
import { useGameState } from '../../store/gameState';
import type { GameEvent, ConsequenceEntry } from '../../store/gameState';
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

const SEVERITY_STYLE: Record<ConsequenceEntry['severity'], { dot: string; text: string; border: string }> = {
  info:     { dot: 'bg-sky-500/60',     text: 'text-ivory/60',   border: 'border-sky-500/20' },
  warning:  { dot: 'bg-amber-500/70',   text: 'text-amber-300/80', border: 'border-amber-500/25' },
  critical: { dot: 'bg-red-500/80',     text: 'text-red-300/90', border: 'border-red-500/30' },
};

function matchesFilter(event: GameEvent, filter: FilterKey): boolean {
  if (filter === 'Todos') return true;
  const kw = FILTER_KEYWORDS[filter];
  const text = event.text.toLowerCase();
  return kw.some(k => text.includes(k));
}

// ── Consequence chain for one decision ───────────────────────────────────────

const ConsequenceChainView: React.FC<{ entries: ConsequenceEntry[] }> = ({ entries }) => {
  if (entries.length === 0) return null;
  const isFullyResolved = entries.every(e => e.resolved);

  return (
    <div className="mt-2.5 pt-2.5 border-t border-leather-600/25">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] font-body uppercase tracking-widest text-ivory/30">Consequências</span>
        {isFullyResolved && (
          <span className="text-[9px] font-body px-1.5 py-0.5 rounded bg-emerald-900/30 border border-emerald-600/25 text-emerald-400/70">
            Resolvido
          </span>
        )}
        {!isFullyResolved && (
          <span className="text-[9px] font-body px-1.5 py-0.5 rounded bg-amber-900/30 border border-amber-600/25 text-amber-400/70">
            Em curso
          </span>
        )}
      </div>

      <div className="relative pl-4">
        {/* Vertical timeline line */}
        <div className="absolute left-1.5 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-leather-500/40 to-transparent" />

        <div className="space-y-2">
          {entries.map((entry, i) => {
            const style = SEVERITY_STYLE[entry.severity];
            return (
              <div key={entry.id} className="relative flex items-start gap-2.5">
                {/* Timeline dot */}
                <div className={`absolute -left-4 top-1.5 w-2 h-2 rounded-full border border-leather-600/30 ${style.dot} shrink-0`} />

                <div className={`flex-1 rounded-md border px-2.5 py-1.5 ${style.border} bg-leather-800/20`}>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-gold/50 text-[9px] font-body uppercase tracking-widest shrink-0">
                      {entry.month.slice(0, 3)} {entry.year}
                    </span>
                    {entry.resolved && i === entries.length - 1 && (
                      <span className="text-emerald-400/50 text-[8px] font-body">✓ fechado</span>
                    )}
                  </div>
                  <p className={`text-[11px] font-body leading-snug ${style.text}`}>{entry.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Diary event entry ─────────────────────────────────────────────────────────

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

// ── Decision entry with expandable consequence chain ─────────────────────────

const DecisionEntry: React.FC<{
  record: DecisionRecord;
  isFirst: boolean;
  consequences: ConsequenceEntry[];
}> = ({ record, isFirst, consequences }) => {
  const [expanded, setExpanded] = useState(isFirst && consequences.length > 0);
  const hasConsequences = consequences.length > 0;

  return (
    <div className={`rounded-lg border transition-all duration-200
      ${isFirst
        ? 'bg-gold/6 border-gold/20 shadow-sm'
        : 'bg-leather-800/20 border-leather-700/20 hover:bg-leather-800/40 hover:border-leather-600/40'
      }`}
    >
      <div className="flex items-start gap-4 p-3">
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
            {hasConsequences && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="ml-auto text-[9px] font-body px-2 py-0.5 rounded border border-leather-500/30 text-ivory/35 hover:text-ivory/60 hover:border-leather-400/50 transition-colors"
              >
                {expanded ? 'Ocultar' : 'Ver consequências'} ({consequences.length})
              </button>
            )}
          </div>
          <p className="text-ivory/50 text-xs font-body italic leading-snug">
            "{record.choice}"
          </p>
          {record.result && (
            <p className="text-ivory/40 text-[11px] font-body mt-1 leading-snug">{record.result}</p>
          )}

          {hasConsequences && expanded && (
            <ConsequenceChainView entries={consequences} />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Tab ───────────────────────────────────────────────────────────────────────

const DiarioTab: React.FC = () => {
  const { state } = useGameState();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('Todos');

  const filtered = useMemo(
    () => state.eventLog.filter(ev => matchesFilter(ev, activeFilter)),
    [state.eventLog, activeFilter],
  );

  // Pre-group consequences by originDecisionInstanceId for O(1) lookup
  const chainByDecision = useMemo(() => {
    const map: Record<string, ConsequenceEntry[]> = {};
    for (const entry of state.consequenceChain) {
      const key = entry.originDecisionInstanceId;
      if (!map[key]) map[key] = [];
      map[key].push(entry);
    }
    // Sort each group oldest-first so the timeline reads chronologically
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return 0;
      });
    }
    return map;
  }, [state.consequenceChain]);

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
      <div className="shrink-0 flex flex-col" style={{ maxHeight: '48%' }}>
        <SectionTitle>Decisões Recentes</SectionTitle>
        {state.decisionHistory.length === 0 ? (
          <p className="text-ivory/25 text-xs font-body italic px-1">Nenhuma decisão tomada ainda.</p>
        ) : (
          <div className="overflow-y-auto space-y-1.5 pr-1">
            {state.decisionHistory.slice(0, 10).map((rec, idx) => (
              <DecisionEntry
                key={rec.instanceId}
                record={rec}
                isFirst={idx === 0}
                consequences={chainByDecision[rec.instanceId] ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiarioTab;
