import React from 'react';
import { useGameState } from '../../store/gameState';
import { formatEuro, lastNMonths } from '../../store/economyEngine';
import { SectionTitle, StatBlock } from './OfficePrimitives';

const BalanceBar: React.FC<{ income: number; expenses: number }> = ({ income, expenses }) => {
  const total = Math.max(income, expenses) || 1;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-ivory/40 text-[10px] font-body w-16">Receitas</span>
        <div className="flex-1 h-2 bg-leather-700/40 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${(income / total) * 100}%` }} />
        </div>
        <span className="text-emerald-400 text-xs font-display w-24 text-right">{formatEuro(income)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-ivory/40 text-[10px] font-body w-16">Despesas</span>
        <div className="flex-1 h-2 bg-leather-700/40 rounded-full overflow-hidden">
          <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${(expenses / total) * 100}%` }} />
        </div>
        <span className="text-red-400 text-xs font-display w-24 text-right">{formatEuro(expenses)}</span>
      </div>
    </div>
  );
};

const HistoryTable: React.FC = () => {
  const { state } = useGameState();
  const rows = lastNMonths(state.economy.history, 12);

  if (rows.length === 0) {
    return <p className="text-ivory/25 text-xs font-body text-center py-6">Sem histórico disponível.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-body">
        <thead>
          <tr className="border-b border-leather-600/30">
            <th className="text-left text-ivory/30 font-normal uppercase tracking-wider py-2 pr-3">Período</th>
            <th className="text-right text-ivory/30 font-normal uppercase tracking-wider py-2 px-3">Receitas</th>
            <th className="text-right text-ivory/30 font-normal uppercase tracking-wider py-2 px-3">Despesas</th>
            <th className="text-right text-ivory/30 font-normal uppercase tracking-wider py-2 pl-3">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-b border-leather-700/20 hover:bg-leather-700/20 transition-colors">
              <td className="py-2 pr-3 text-ivory/60">{r.month.slice(0, 3)} {r.year}</td>
              <td className="py-2 px-3 text-emerald-400/80 text-right">{formatEuro(r.income)}</td>
              <td className="py-2 px-3 text-red-400/80 text-right">{formatEuro(r.expenses)}</td>
              <td className={`py-2 pl-3 text-right font-display ${r.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.profit >= 0 ? '+' : ''}{formatEuro(r.profit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EconomiaTab: React.FC = () => {
  const { state } = useGameState();
  const { economy } = state;
  const latest = economy.history[0];
  const last12 = lastNMonths(economy.history, 12);
  const totalIncome = last12.reduce((s, r) => s + r.income, 0);
  const totalExpenses = last12.reduce((s, r) => s + r.expenses, 0);
  const monthlyBalance = latest ? latest.profit : 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SectionTitle>Situação Económica</SectionTitle>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 mb-5 shrink-0">
        <StatBlock
          label="Tesouraria"
          value={<span className="text-gold">{formatEuro(economy.treasury)}</span>}
          sub="Saldo actual"
        />
        <StatBlock
          label="Saldo Mensal"
          value={
            <span className={monthlyBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {monthlyBalance >= 0 ? '+' : ''}{formatEuro(monthlyBalance)}
            </span>
          }
          sub={latest ? `${latest.month} ${latest.year}` : '—'}
        />
      </div>

      {/* Balance bar */}
      {last12.length > 0 && (
        <div className="mb-5 shrink-0">
          <p className="text-ivory/30 text-[10px] font-body uppercase tracking-wider mb-2">Acumulado (12 meses)</p>
          <BalanceBar income={totalIncome} expenses={totalExpenses} />
        </div>
      )}

      {/* History */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <SectionTitle>Histórico Mensal</SectionTitle>
        <div className="flex-1 overflow-y-auto pr-1">
          <HistoryTable />
        </div>
      </div>
    </div>
  );
};

export default EconomiaTab;
