import React from 'react';
import { Animal, HealthStatus } from '../types/animal';
import { formatAge } from '../utils/animalGrowth';

const coatColors: Record<string, string> = {
  'Negro': '#1a1a2e',
  'Castanho': '#8B4513',
  'Retinto': '#6B2A0F',
  'Colorado': '#C47A2B',
  'Jardineiro': '#4A5C2A',
  'Bragado': '#3D2B1F',
  'Cárdeno': '#5A5A7A',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  'Ativo': { label: 'Ativo', color: 'text-emerald-400' },
  'Lesionado': { label: 'Lesionado', color: 'text-amber-400' },
  'Reformado': { label: 'Reformado', color: 'text-ivory/50' },
  'Vendido': { label: 'Vendido', color: 'text-blue-400' },
  'Morto': { label: 'Morto', color: 'text-red-400' },
};

const healthColors: Record<HealthStatus, string> = {
  'Excelente': 'text-emerald-400',
  'Bom': 'text-green-400',
  'Regular': 'text-amber-400',
  'Fraco': 'text-orange-400',
  'Doente': 'text-red-400',
};

interface StatRowProps {
  label: string;
  value: number;
  color: string;
  max?: number;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, color, max = 100 }) => (
  <div className="flex items-center gap-3">
    <span className="text-ivory/50 text-xs font-body w-24 uppercase tracking-wider">{label}</span>
    <div className="flex-1 h-2 bg-leather-700/60 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-700`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    <span className="text-ivory/80 text-sm font-display w-8 text-right">{value}</span>
  </div>
);

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex items-baseline justify-between py-1.5 border-b border-leather-700/30">
    <span className="text-ivory/40 text-xs font-body uppercase tracking-wider">{label}</span>
    <span className="text-ivory/90 text-sm font-body text-right ml-4">{value}</span>
  </div>
);

interface AnimalDetailPanelProps {
  animal: Animal;
  fatherName?: string;
  motherName?: string;
  onClose: () => void;
}

const AnimalDetailPanel: React.FC<AnimalDetailPanelProps> = ({
  animal,
  fatherName,
  motherName,
  onClose,
}) => {
  const status = statusLabels[animal.status];
  const isMale = animal.sex === 'Macho';
  const hasBreedingStats =
    animal.category === 'Semental' ||
    animal.category === 'Vaca' ||
    animal.category === 'Novilha' ||
    animal.category === 'Bezerra' ||
    animal.category === 'Novilho' ||
    animal.fertility > 0;

  return (
    <div className="h-full flex flex-col bg-leather-800/60 border-l-2 border-gold/20 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-leather-600/40 bg-leather-900/60 shrink-0">
        <div>
          <h2 className="font-display text-xl text-gold tracking-widest uppercase">{animal.name}</h2>
          <p className="text-ivory/50 text-xs font-body mt-0.5 tracking-wide">{animal.category} · {animal.bloodline}</p>
        </div>
        <button
          onClick={onClose}
          className="text-ivory/40 hover:text-gold transition-colors text-xl leading-none p-1"
          aria-label="Fechar painel"
        >
          ✕
        </button>
      </div>

      {/* Animal visual */}
      <div
        className="mx-4 mt-4 rounded-lg h-36 flex items-center justify-center relative overflow-hidden shrink-0"
        style={{ backgroundColor: `${coatColors[animal.coat]}33`, border: `2px solid ${coatColors[animal.coat]}66` }}
      >
        <div
          className="w-24 h-18 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${coatColors[animal.coat]}88` }}
        >
          <span className="text-6xl">{isMale ? '🐂' : '🐄'}</span>
        </div>
        <div className="absolute bottom-2 right-3">
          <span className="text-ivory/50 text-[11px] font-body">{animal.coat}</span>
        </div>
        {animal.hasFought && (
          <div className="absolute top-3 left-3 bg-red-900/80 border border-red-600/60 rounded px-2 py-1">
            <span className="text-red-300 text-xs font-body uppercase tracking-wider">Lidado</span>
          </div>
        )}
        {animal.rejected && (
          <div className="absolute top-3 right-3 bg-red-900/80 border border-red-600/60 rounded px-2 py-1">
            <span className="text-red-300 text-xs font-body uppercase tracking-wider">Rejeitado</span>
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-4 flex-1">
        {/* Identification */}
        <div>
          <h3 className="font-display text-xs text-gold/70 tracking-widest uppercase mb-2">Identificação</h3>
          <div className="space-y-0">
            <InfoRow label="Sexo" value={animal.sex} />
            <InfoRow label="Idade" value={formatAge(animal.exactAgeMonths)} />
            <InfoRow label="Mês Nasc." value={animal.birthMonth} />
            <InfoRow label="Ano Nasc." value={animal.birthYear} />
            <InfoRow label="Peso" value={`${animal.weight} kg`} />
            <InfoRow
              label="Saúde"
              value={<span className={healthColors[animal.health]}>{animal.health}</span>}
            />
            <InfoRow label="Pelagem" value={animal.coat} />
            <InfoRow label="Cornamento" value={animal.hornType} />
            <InfoRow label="Casta" value={animal.bloodline} />
            <InfoRow label="Categoria" value={animal.category} />
            <InfoRow
              label="Estado"
              value={<span className={status.color}>{status.label}</span>}
            />
          </div>
        </div>

        {/* Genealogy */}
        {(fatherName || motherName) && (
          <div>
            <h3 className="font-display text-xs text-gold/70 tracking-widest uppercase mb-2">Genealogia</h3>
            <div className="space-y-0">
              {fatherName && <InfoRow label="Pai" value={fatherName} />}
              {motherName && <InfoRow label="Mãe" value={motherName} />}
            </div>
          </div>
        )}

        {/* Breeding & Fight status */}
        <div>
          <h3 className="font-display text-xs text-gold/70 tracking-widest uppercase mb-2">Estado Reprodutivo</h3>
          <div className="space-y-0">
            <InfoRow
              label="Apr. Reprodução"
              value={
                <span className={animal.approvedForBreeding ? 'text-emerald-400' : 'text-ivory/40'}>
                  {animal.approvedForBreeding ? 'Aprovado' : 'Não aprovado'}
                </span>
              }
            />
            <InfoRow
              label="Lidado"
              value={
                <span className={animal.hasFought ? 'text-red-400' : 'text-ivory/40'}>
                  {animal.hasFought ? 'Sim' : 'Não'}
                </span>
              }
            />
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="font-display text-xs text-gold/70 tracking-widest uppercase mb-3">Estatísticas de Bravura</h3>
          <div className="space-y-2.5">
            <StatRow label="Bravura" value={animal.bravery} color="bg-gold" />
            <StatRow label="Nobreza" value={animal.nobility} color="bg-amber-500/80" />
            <StatRow label="Mobilidade" value={animal.mobility} color="bg-emerald-600/80" />
            <StatRow label="Fôlego" value={animal.stamina} color="bg-sky-600/80" />
          </div>
        </div>

        {/* Breeding stats */}
        {hasBreedingStats && (
          <div>
            <h3 className="font-display text-xs text-gold/70 tracking-widest uppercase mb-3">Estatísticas Genéticas</h3>
            <div className="space-y-2.5">
              <StatRow label="Transmissão" value={animal.transmission} color="bg-purple-500/70" />
              <StatRow label="Fertilidade" value={animal.fertility} color="bg-rose-500/70" />
            </div>
          </div>
        )}

        {/* Notes */}
        {animal.notes && (
          <div>
            <h3 className="font-display text-xs text-gold/70 tracking-widest uppercase mb-2">Notas</h3>
            <p className="text-ivory/60 text-sm font-body leading-relaxed italic bg-leather-700/20 rounded p-3 border border-leather-600/30">
              {animal.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalDetailPanel;
