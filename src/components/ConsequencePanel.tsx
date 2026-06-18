import React, { useState } from 'react';
import { useConsequences, selectActiveConsequences, selectHistory } from '../store/consequenceStore';
import {
  CATEGORY_ICONS,
  SEVERITY_COLOR,
  SEVERITY_DOT,
} from '../services/consequenceService';
import type { Consequence } from '../types/consequence';

// ── Consequence card ──────────────────────────────────────────────────────────

interface CardProps {
  consequence: Consequence;
  onResolve?: (id: string) => void;
}

const ConsequenceCard: React.FC<CardProps> = ({ consequence, onResolve }) => {
  const c = consequence;
  return (
    <div className="rounded border border-leather-700/40 bg-leather-800/30 overflow-hidden">
      <div className="flex items-start gap-3 p-3">
        <span className="text-xl leading-none mt-0.5 shrink-0">
          {CATEGORY_ICONS[c.category] ?? '📋'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[9px] font-body uppercase tracking-wider px-1.5 py-0.5 rounded border ${SEVERITY_COLOR[c.severity]}`}>
              {c.severity}
            </span>
            <span className="text-ivory/30 text-[9px] font-body uppercase tracking-wider">
              {c.category}
            </span>
          </div>
          <p className="text-ivory/85 text-xs font-display tracking-wide leading-snug">{c.title}</p>
          <p className="text-ivory/50 text-[11px] font-body leading-relaxed mt-1">{c.description}</p>
          {c.sourceDecision && (
            <p className="text-ivory/25 text-[9px] font-body mt-1.5 italic">
              Origem: decisão {c.sourceDecision}
            </p>
          )}
          <p className="text-ivory/20 text-[9px] font-body mt-0.5">
            Criado em {c.creationDate.month} {c.creationDate.year}
          </p>
        </div>
        {onResolve && (
          <button
            onClick={() => onResolve(c.id)}
            className="shrink-0 text-[9px] font-body uppercase tracking-wider text-ivory/30 hover:text-gold/70 border border-leather-600/30 hover:border-gold/30 rounded px-2 py-1 transition-all"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main panel ────────────────────────────────────────────────────────────────

const ConsequencePanel: React.FC = () => {
  const { state, resolveConsequence, setShowPanel } = useConsequences();
  const [tab, setTab] = useState<'active' | 'history'>('active');

  if (!state.showPanel) return null;

  const active = selectActiveConsequences(state);
  const history = selectHistory(state);
  const items = tab === 'active' ? active : history;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      onClick={() => setShowPanel(false)}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      <div
        className="relative w-full max-w-md shadow-2xl rounded-lg overflow-hidden flex flex-col"
        style={{
          maxHeight: '75vh',
          background: 'linear-gradient(160deg, #1a1108 0%, #130d06 100%)',
          border: '1px solid rgba(201,162,39,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid rgba(201,162,39,0.15)' }}
        >
          <div>
            <h2 className="font-display text-base text-gold tracking-widest uppercase">
              Consequências
            </h2>
            <p className="text-ivory/30 text-[9px] font-body uppercase tracking-wider mt-0.5">
              {active.length} activa{active.length !== 1 ? 's' : ''} · {history.length} resolvida{history.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowPanel(false)}
            className="text-ivory/30 hover:text-ivory/70 text-lg transition-colors leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex shrink-0"
          style={{ borderBottom: '1px solid rgba(201,162,39,0.1)' }}
        >
          {(['active', 'history'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-[10px] font-body uppercase tracking-wider transition-all ${
                tab === t
                  ? 'text-gold border-b border-gold/50 bg-gold/5'
                  : 'text-ivory/30 hover:text-ivory/50'
              }`}
            >
              {t === 'active' ? `Activas (${active.length})` : `Histórico (${history.length})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-2xl opacity-20">
                {tab === 'active' ? '✓' : '📋'}
              </span>
              <p className="text-ivory/20 text-xs font-body">
                {tab === 'active' ? 'Nenhuma consequência activa' : 'Histórico vazio'}
              </p>
            </div>
          ) : (
            items.map(c => (
              <ConsequenceCard
                key={c.id}
                consequence={c}
                onResolve={tab === 'active' ? resolveConsequence : undefined}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsequencePanel;
