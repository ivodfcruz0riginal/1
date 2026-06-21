import React, { useState } from 'react';
import { useGameState } from '../store/gameState';
import type { LifeHistoryEntry } from '../core/life/AnimalLife';

// ── Delta chip ────────────────────────────────────────────────────────────────

interface DeltaProps {
  value: number;
  label: string;
  goodDirection: 'up' | 'down';
}

const DeltaChip: React.FC<DeltaProps> = ({ value, label, goodDirection }) => {
  if (value === 0) return null;
  const isGood = goodDirection === 'up' ? value > 0 : value < 0;
  const color  = isGood ? 'text-emerald-400' : 'text-orange-400';
  const arrow  = value > 0 ? '▲' : '▼';
  return (
    <span className={`text-[9px] font-body ${color} opacity-70`}>
      {arrow} {Math.abs(value)} {label}
    </span>
  );
};

// ── Single entry ──────────────────────────────────────────────────────────────

const HistoryEntry: React.FC<{ entry: LifeHistoryEntry; isFirst: boolean }> = ({ entry, isFirst }) => (
  <div className="flex gap-3">
    {/* Dot + line */}
    <div className="flex flex-col items-center shrink-0">
      <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${isFirst ? 'bg-gold' : 'bg-leather-600'}`} />
      <div className="w-px flex-1 bg-leather-700/40 mt-1" />
    </div>

    {/* Content */}
    <div className="flex-1 pb-4">
      <p className={`text-[10px] font-body uppercase tracking-wider mb-0.5 ${isFirst ? 'text-gold/70' : 'text-ivory/30'}`}>
        {entry.month} · {entry.year}
      </p>
      <p className={`text-xs font-body leading-relaxed ${isFirst ? 'text-ivory/85' : 'text-ivory/60'}`}>
        {entry.note}
      </p>
      {(entry.weightDelta !== 0 || entry.conditionDelta !== 0 || entry.stressDelta !== 0) && (
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <DeltaChip value={entry.weightDelta}    label="kg"   goodDirection="up" />
          <DeltaChip value={entry.conditionDelta} label="cond" goodDirection="up" />
          <DeltaChip value={entry.stressDelta}    label="str"  goodDirection="down" />
        </div>
      )}
    </div>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const INITIAL_VISIBLE = 6;

interface Props { animalId: string }

const AnimalMonthlyNotes: React.FC<Props> = ({ animalId }) => {
  const { state } = useGameState();
  const lifeState = state.animalLifeStates[animalId];
  const [showAll, setShowAll] = useState(false);

  const history = lifeState?.history ?? [];
  const visible = showAll ? history : history.slice(0, INITIAL_VISIBLE);

  return (
    <div>
      <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gold/55 mb-4 pb-1.5 border-b border-leather-700/30">
        Notas Mensais
      </p>

      {history.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-ivory/25 text-xs font-body">
            As notas mensais aparecem aqui à medida que o tempo avança.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-0">
            {visible.map((entry, i) => (
              <HistoryEntry key={entry.id} entry={entry} isFirst={i === 0} />
            ))}
          </div>

          {history.length > INITIAL_VISIBLE && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="text-[10px] font-body text-ivory/35 hover:text-gold/70 transition-colors uppercase tracking-wider mt-2"
            >
              {showAll ? '▲ Ver menos' : `▼ Ver mais (${history.length - INITIAL_VISIBLE} entradas)`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default AnimalMonthlyNotes;
