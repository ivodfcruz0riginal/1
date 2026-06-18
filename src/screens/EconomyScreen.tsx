import React, { useState } from 'react';
import { useGameState } from '../store/gameState';
import { formatEuro, lastNMonths, type MonthlyRecord } from '../store/economyEngine';

// ── Small stat card ───────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
  highlight?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, sub, positive, negative, highlight }) => {
  const valueColor = positive ? 'text-emerald-400' : negative ? 'text-red-400' : highlight ? 'text-gold' : 'text-ivory';
  return (
    <div className="relative bg-leather-800/60 border border-leather-600/50 rounded-lg px-5 py-4 hover:border-gold/30 transition-colors">
      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-gold/40"></div>
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r border-gold/40"></div>
      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b border-l border-gold/40"></div>
      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r border-gold/40"></div>
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-ivory/50 text-[10px] font-body uppercase tracking-wider mb-1">{label}</p>
          <p className={`font-display text-xl font-bold truncate ${valueColor}`}>{value}</p>
          {sub && <p className="text-ivory/40 text-xs font-body mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
};

// ── Mini bar chart ────────────────────────────────────────────────────────────

interface BarChartProps {
  records: MonthlyRecord[];
}

const BarChart: React.FC<BarChartProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-ivory/30 text-sm font-body">
        Sem dados suficientes
      </div>
    );
  }

  const maxVal = Math.max(...records.map(r => Math.max(r.income, r.expenses)), 1);

  return (
    <div className="flex items-end gap-1 h-36 px-2">
      {[...records].reverse().map((r, i) => {
        const incH = Math.max(4, (r.income / maxVal) * 132);
        const expH = Math.max(4, (r.expenses / maxVal) * 132);
        return (
          <div key={r.id} className="flex-1 flex flex-col items-center gap-0.5 group relative" title={`${r.month} ${r.year}`}>
            <div className="w-full flex items-end justify-center gap-0.5" style={{ height: 132 }}>
              <div
                className="flex-1 bg-emerald-500/70 rounded-t-sm group-hover:bg-emerald-400 transition-colors"
                style={{ height: incH }}
              />
              <div
                className="flex-1 bg-red-500/60 rounded-t-sm group-hover:bg-red-400 transition-colors"
                style={{ height: expH }}
              />
            </div>
            {i % 3 === 0 && (
              <span className="text-[8px] text-ivory/30 font-body truncate w-full text-center">
                {r.month.substring(0, 3)}
              </span>
            )}
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-leather-900 border border-gold/30 rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-xl">
              <p className="text-gold text-[10px] font-display font-bold">{r.month} {r.year}</p>
              <p className="text-emerald-400 text-[10px] font-body">+ {formatEuro(r.income)}</p>
              <p className="text-red-400 text-[10px] font-body">− {formatEuro(r.expenses)}</p>
              <p className={`text-[10px] font-body ${r.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.profit >= 0 ? '▲' : '▼'} {formatEuro(Math.abs(r.profit))}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── History table ─────────────────────────────────────────────────────────────

interface HistoryTableProps {
  records: MonthlyRecord[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-ivory/30 text-sm font-body">
        Sem histórico disponível. Avance o mês para gerar dados.
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-72">
      <table className="w-full text-sm font-body border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-leather-900 border-b border-gold/20">
            {['Mês', 'Ano', 'Receitas', 'Despesas', 'Resultado', 'Tesouraria'].map(h => (
              <th key={h} className="text-left text-[10px] text-ivory/40 uppercase tracking-wider px-3 py-2 font-body font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r, idx) => (
            <tr
              key={r.id}
              className={`border-b border-leather-700/30 hover:bg-leather-800/40 transition-colors ${idx === 0 ? 'bg-leather-800/20' : ''}`}
            >
              <td className="px-3 py-2.5 text-ivory font-display text-sm">{r.month}</td>
              <td className="px-3 py-2.5 text-ivory/60">{r.year}</td>
              <td className="px-3 py-2.5 text-emerald-400">{formatEuro(r.income)}</td>
              <td className="px-3 py-2.5 text-red-400">{formatEuro(r.expenses)}</td>
              <td className={`px-3 py-2.5 font-semibold ${r.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.profit >= 0 ? '+' : ''}{formatEuro(r.profit)}
              </td>
              <td className="px-3 py-2.5 text-gold font-display">{formatEuro(r.treasury)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const EconomyScreen: React.FC = () => {
  const { state } = useGameState();
  const { economy } = state;
  const [showAll, setShowAll] = useState(false);

  const last12 = lastNMonths(economy.history, 12);
  const displayHistory = showAll ? economy.history : lastNMonths(economy.history, 12);

  // Compute current month stats from latest record
  const latest = economy.history[0] ?? null;
  const prevMonth = economy.history[1] ?? null;

  const avgIncome = last12.length > 0
    ? Math.round(last12.reduce((s, r) => s + r.income, 0) / last12.length)
    : 0;
  const avgExpenses = last12.length > 0
    ? Math.round(last12.reduce((s, r) => s + r.expenses, 0) / last12.length)
    : 0;
  const avgProfit = avgIncome - avgExpenses;

  const treasuryTrend = latest && prevMonth
    ? economy.treasury - prevMonth.treasury
    : null;

  return (
    <div className="h-full overflow-y-auto bg-leather-900/50">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl text-gold tracking-widest uppercase">Economia</h2>
            <p className="text-ivory/40 text-sm font-body mt-0.5">Gestão financeira da Herdade da Ferraria</p>
          </div>
          <div className="text-right">
            <p className="text-ivory/30 text-xs font-body uppercase tracking-wider">Período actual</p>
            <p className="font-display text-base text-ivory">{state.month} {state.year}</p>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            icon="🏦"
            label="Tesouraria Actual"
            value={formatEuro(economy.treasury)}
            sub={treasuryTrend !== null
              ? `${treasuryTrend >= 0 ? '+' : ''}${formatEuro(treasuryTrend)} este mês`
              : 'Nenhum mês registado'}
            highlight
          />
          <KpiCard
            icon="📈"
            label="Receitas (média 12m)"
            value={formatEuro(avgIncome)}
            sub={latest ? `Último mês: ${formatEuro(latest.income)}` : '—'}
            positive
          />
          <KpiCard
            icon="📉"
            label="Despesas (média 12m)"
            value={formatEuro(avgExpenses)}
            sub={latest ? `Último mês: ${formatEuro(latest.expenses)}` : '—'}
            negative
          />
          <KpiCard
            icon="⚖️"
            label="Resultado Líquido (média)"
            value={formatEuro(avgProfit)}
            sub={latest ? `Último mês: ${formatEuro(latest.profit)}` : '—'}
            positive={avgProfit >= 0}
            negative={avgProfit < 0}
          />
        </div>

        {/* Chart + last event */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar chart */}
          <div className="lg:col-span-2 relative bg-leather-800/40 border border-leather-600/40 rounded-lg p-5">
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold/30"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold/30"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gold/30"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gold/30"></div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm text-ivory/80 tracking-wider uppercase">Últimos 12 Meses</h3>
              <div className="flex items-center gap-4 text-[10px] font-body">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70 inline-block"></span>Receitas</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/60 inline-block"></span>Despesas</span>
              </div>
            </div>

            <BarChart records={last12} />
          </div>

          {/* Events panel */}
          <div className="relative bg-leather-800/40 border border-leather-600/40 rounded-lg p-5 flex flex-col">
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold/30"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold/30"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gold/30"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gold/30"></div>

            <h3 className="font-display text-sm text-ivory/80 tracking-wider uppercase mb-4">Eventos Recentes</h3>

            {economy.history.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-ivory/30 text-sm font-body text-center px-4">
                Avance o mês para ver eventos económicos
              </div>
            ) : (
              <ul className="space-y-2 overflow-y-auto flex-1">
                {economy.history.slice(0, 6).flatMap(r =>
                  r.events.map((ev, i) => (
                    <li key={`${r.id}-${i}`} className="flex gap-2.5 items-start">
                      <span className="text-gold/60 mt-0.5 shrink-0 text-xs">◆</span>
                      <div>
                        <p className="text-ivory/70 text-xs font-body leading-relaxed">{ev}</p>
                        <p className="text-ivory/30 text-[10px] font-body mt-0.5">{r.month} {r.year}</p>
                      </div>
                    </li>
                  ))
                ).slice(0, 8)}
              </ul>
            )}
          </div>
        </div>

        {/* History table */}
        <div className="relative bg-leather-800/40 border border-leather-600/40 rounded-lg overflow-hidden">
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold/30"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold/30"></div>

          <div className="flex items-center justify-between px-5 py-4 border-b border-leather-600/30">
            <h3 className="font-display text-sm text-ivory/80 tracking-wider uppercase">
              Histórico Mensal
              <span className="ml-2 text-ivory/30 font-body text-xs font-normal normal-case">
                ({economy.history.length} meses registados)
              </span>
            </h3>
            {economy.history.length > 12 && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="text-[10px] font-body text-gold/60 hover:text-gold uppercase tracking-wider transition-colors"
              >
                {showAll ? 'Mostrar últimos 12' : `Ver todos (${economy.history.length})`}
              </button>
            )}
          </div>

          <HistoryTable records={displayHistory} />
        </div>

        {/* No data prompt */}
        {economy.history.length === 0 && (
          <div className="relative bg-leather-800/30 border border-gold/20 rounded-lg px-6 py-8 text-center">
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold/40"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold/40"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gold/40"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gold/40"></div>
            <p className="text-gold/60 font-display text-lg mb-2">Economia ainda não iniciada</p>
            <p className="text-ivory/40 text-sm font-body">
              Clique em "Avançar Mês" para começar a gerar receitas, despesas e histórico financeiro.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default EconomyScreen;
