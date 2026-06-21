import React, { useState } from 'react';
import { useGameState } from '../store/gameState';

// Only renders in development. Vite tree-shakes this in production builds
// because import.meta.env.DEV is replaced with `false` at build time.

interface CheckItem {
  label: string;
  done: boolean;
  blocked?: boolean; // true when a prerequisite isn't met yet
}

const Row: React.FC<CheckItem> = ({ label, done, blocked }) => (
  <div className={`flex items-center gap-2 py-0.5 ${blocked ? 'opacity-35' : ''}`}>
    <span className={`text-xs shrink-0 ${done ? 'text-emerald-400' : blocked ? 'text-ivory/20' : 'text-amber-400'}`}>
      {done ? '✓' : blocked ? '○' : '◌'}
    </span>
    <span className={`text-[10px] font-mono leading-tight ${done ? 'text-ivory/50 line-through' : 'text-ivory/80'}`}>
      {label}
    </span>
  </div>
);

const DevFlowChecklist: React.FC = () => {
  const { state } = useGameState();
  const [collapsed, setCollapsed] = useState(false);

  const {
    openingSequenceCompleted,
    guidedTourCompleted,
    firstDecisionCompleted,
    firstRanchProblemCompleted,
    pendingFenceConsequence,
    firstContractOffered,
  } = state;

  const consequenceResolved =
    firstRanchProblemCompleted &&
    pendingFenceConsequence === null;

  const items: CheckItem[] = [
    {
      label: 'Opening completed',
      done: openingSequenceCompleted,
      blocked: false,
    },
    {
      label: 'Tour completed',
      done: guidedTourCompleted,
      blocked: !openingSequenceCompleted,
    },
    {
      label: 'First decision completed',
      done: firstDecisionCompleted,
      blocked: !guidedTourCompleted,
    },
    {
      label: 'First ranch problem completed',
      done: firstRanchProblemCompleted,
      blocked: !firstDecisionCompleted,
    },
    {
      label: 'First consequence resolved',
      done: consequenceResolved,
      blocked: !firstRanchProblemCompleted,
    },
    {
      label: 'First contract received',
      done: firstContractOffered,
      blocked: !firstRanchProblemCompleted,
    },
  ];

  const doneCount = items.filter(i => i.done).length;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] select-none"
      style={{ fontFamily: 'monospace' }}
    >
      <div
        className="rounded-lg overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(10, 6, 2, 0.92)',
          border: '1px solid rgba(201,162,39,0.3)',
          backdropFilter: 'blur(8px)',
          minWidth: '220px',
        }}
      >
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-3 py-2 border-b border-gold/20 hover:bg-white/5 transition-colors"
          onClick={() => setCollapsed(v => !v)}
        >
          <span className="text-[10px] text-gold/70 uppercase tracking-widest">DEV · Flow Checklist</span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-ivory/30">{doneCount}/{items.length}</span>
            <span className={`text-ivory/25 text-[9px] transition-transform duration-150 ${collapsed ? '' : 'rotate-180'}`}>▾</span>
          </div>
        </button>

        {/* Items */}
        {!collapsed && (
          <div className="px-3 py-2 space-y-0.5">
            {items.map(item => (
              <Row key={item.label} {...item} />
            ))}
            <div className="mt-2 pt-2 border-t border-gold/10 text-[9px] text-ivory/20 font-mono">
              simulatedMonths: {state.simulatedMonths} · prestige: {state.prestige}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevFlowChecklist;
