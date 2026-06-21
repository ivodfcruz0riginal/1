import React, { useState } from 'react';
import { useGameState } from '../store/gameState';
import { formatEuro } from '../store/economyEngine';

// Dev-only panel. Vite tree-shakes this in production because
// it is only imported when import.meta.env.DEV is true.

const DevSimulationPanel: React.FC = () => {
  const { state } = useGameState();
  const [collapsed, setCollapsed] = useState(false);

  const trace = state.lastSimulationTrace;

  const sign = (n: number) => (n >= 0 ? '+' : '');

  return (
    <div
      className="fixed bottom-4 left-4 z-[9999] select-none"
      style={{ fontFamily: 'monospace', maxWidth: '320px' }}
    >
      <div
        className="rounded-lg overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(10, 6, 2, 0.92)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-3 py-2 border-b border-sky-500/20 hover:bg-white/5 transition-colors"
          onClick={() => setCollapsed(v => !v)}
        >
          <span className="text-[10px] text-sky-400/70 uppercase tracking-widest">DEV · Simulation Trace</span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-ivory/30">{state.month} {state.year}</span>
            <span className={`text-ivory/25 text-[9px] transition-transform duration-150 ${collapsed ? '' : 'rotate-180'}`}>▾</span>
          </div>
        </button>

        {!collapsed && (
          <div className="px-3 py-2 space-y-2.5">
            {/* Current game state */}
            <div>
              <p className="text-[9px] text-sky-400/50 uppercase tracking-widest mb-1">Current State</p>
              <div className="space-y-0.5">
                {[
                  ['Month', `${state.month} ${state.year}`],
                  ['Season', state.season],
                  ['Weather', `${state.weather.icon} ${state.weather.temp}`],
                  ['Treasury', formatEuro(state.economy.treasury)],
                  ['Prestige', String(state.prestige)],
                  ['Active animals', String(state.animals.filter(a => a.status !== 'Morto' && a.status !== 'Vendido').length)],
                  ['Simulated months', String(state.simulatedMonths)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between">
                    <span className="text-ivory/30 text-[10px] font-mono">{label}</span>
                    <span className="text-ivory/70 text-[10px] font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last simulation trace */}
            {trace ? (
              <>
                <div className="border-t border-sky-500/10 pt-2">
                  <p className="text-[9px] text-sky-400/50 uppercase tracking-widest mb-1">
                    Last Simulation — {trace.month} {trace.year}
                  </p>
                  <div className="space-y-0.5">
                    {[
                      ['Weather', trace.weather],
                      ['Animals updated', String(trace.animalsUpdated)],
                      ['Staff updated', String(trace.staffUpdated)],
                      ['Pastures updated', String(trace.pasturesUpdated)],
                      ['Economy delta', `${sign(trace.economyDelta)}${formatEuro(trace.economyDelta)}`],
                      ['Events generated', String(trace.eventsGenerated)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-baseline justify-between gap-2">
                        <span className="text-ivory/30 text-[10px] font-mono shrink-0">{label}</span>
                        <span className={`text-[10px] font-mono text-right truncate ${
                          label === 'Economy delta'
                            ? trace.economyDelta >= 0 ? 'text-emerald-400/80' : 'text-red-400/80'
                            : 'text-ivory/70'
                        }`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulation order */}
                <div className="border-t border-sky-500/10 pt-2">
                  <p className="text-[9px] text-sky-400/50 uppercase tracking-widest mb-1">Execution Order</p>
                  <div className="space-y-0.5">
                    {trace.simulationOrder.map((step, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-sky-400/30 shrink-0" />
                        <span className="text-ivory/45 text-[9px] font-mono leading-tight">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report summary */}
                <div className="border-t border-sky-500/10 pt-2">
                  <p className="text-[9px] text-sky-400/50 uppercase tracking-widest mb-1">Report</p>
                  <div className="space-y-0.5">
                    {trace.reportSummary.map((line, i) => (
                      <p key={i} className="text-ivory/45 text-[9px] font-mono leading-snug">{line}</p>
                    ))}
                  </div>
                  <p className="text-ivory/15 text-[8px] font-mono mt-1">
                    at {new Date(trace.executedAt).toLocaleTimeString('pt-PT')}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-ivory/20 text-[9px] font-mono italic">No simulation run yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevSimulationPanel;
