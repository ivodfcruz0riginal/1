import React, { useState } from 'react';
import { useGameState } from '../../store/gameState';
import { formatEuro } from '../../store/economyEngine';
import { SectionTitle, PaperCard, Pill, EmptyState } from './OfficePrimitives';
import type { BullightContract, ContractStatus } from '../../types/contract';

type FilterKey = 'Todos' | ContractStatus;

const FILTERS: FilterKey[] = ['Todos', 'Pendente', 'Aceite', 'Concluído', 'Cancelado'];

const STATUS_VARIANT: Record<ContractStatus, 'amber' | 'green' | 'muted' | 'red'> = {
  Pendente:  'amber',
  Aceite:    'green',
  Concluído: 'muted',
  Cancelado: 'red',
};

const ContractCard: React.FC<{ contract: BullightContract }> = ({ contract }) => (
  <PaperCard>
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-display text-sm text-ivory/85 tracking-wide">{contract.placeName}</p>
        <p className="text-ivory/35 text-[10px] font-body mt-0.5">{contract.city}</p>
      </div>
      <Pill label={contract.status} variant={STATUS_VARIANT[contract.status]} />
    </div>

    <div className="grid grid-cols-3 gap-2 mb-3">
      <div>
        <p className="text-ivory/30 text-[9px] font-body uppercase tracking-wider">Corrida</p>
        <p className="text-ivory/70 text-xs font-display mt-0.5">{contract.performanceMonth} {contract.performanceYear}</p>
      </div>
      <div>
        <p className="text-ivory/30 text-[9px] font-body uppercase tracking-wider">Toiros</p>
        <p className="text-ivory/70 text-xs font-display mt-0.5">{contract.reservedAnimalIds.length} reservados</p>
      </div>
      <div>
        <p className="text-ivory/30 text-[9px] font-body uppercase tracking-wider">Valor</p>
        <p className={`text-xs font-display mt-0.5 ${contract.negotiatedPayment > contract.basePayment ? 'text-gold' : 'text-ivory/70'}`}>
          {formatEuro(contract.negotiatedPayment)}
          {contract.negotiatedPayment > contract.basePayment && (
            <span className="text-gold/60 text-[9px] font-body ml-1">(negociado)</span>
          )}
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between border-t border-leather-600/20 pt-2">
      <p className="text-ivory/25 text-[9px] font-body">
        Acordado em {contract.offeredMonth} {contract.offeredYear}
      </p>
      {contract.isFirstContract && (
        <span className="text-gold/50 text-[9px] font-body italic">Primeiro contrato</span>
      )}
    </div>
  </PaperCard>
);

const ContratosTab: React.FC = () => {
  const { state } = useGameState();
  const [filter, setFilter] = useState<FilterKey>('Todos');

  const contracts = state.contracts ?? [];
  const filtered = filter === 'Todos'
    ? contracts
    : contracts.filter(c => c.status === filter);

  const counts: Record<ContractStatus, number> = {
    Pendente:  contracts.filter(c => c.status === 'Pendente').length,
    Aceite:    contracts.filter(c => c.status === 'Aceite').length,
    Concluído: contracts.filter(c => c.status === 'Concluído').length,
    Cancelado: contracts.filter(c => c.status === 'Cancelado').length,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SectionTitle>Contratos</SectionTitle>

      {/* Summary badges */}
      <div className="grid grid-cols-4 gap-2 mb-4 shrink-0">
        {(['Pendente', 'Aceite', 'Concluído', 'Cancelado'] as ContractStatus[]).map(s => (
          <div key={s} className="bg-leather-800/30 border border-leather-600/25 rounded-lg p-2 text-center">
            <p className="text-ivory/25 text-[9px] font-body uppercase tracking-wider">{s}</p>
            <p className="font-display text-lg text-ivory/70 mt-0.5">{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4 shrink-0">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-[11px] font-body border transition-all duration-150 ${
              filter === f
                ? 'bg-gold/15 border-gold/50 text-gold'
                : 'bg-leather-800/30 border-leather-600/30 text-ivory/50 hover:text-ivory/70 hover:border-leather-500/50'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-ivory/25 text-[10px] font-body">{filtered.length} contrato{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Contract list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filtered.length === 0 ? (
          <EmptyState
            icon="📜"
            title="Sem contratos"
            subtitle={filter === 'Todos'
              ? 'Os contratos aparecerão aqui quando forem celebrados.'
              : `Nenhum contrato com o estado "${filter}".`}
          />
        ) : (
          filtered.map(c => <ContractCard key={c.instanceId} contract={c} />)
        )}
      </div>
    </div>
  );
};

export default ContratosTab;
