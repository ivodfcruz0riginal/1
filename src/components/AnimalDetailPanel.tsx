import React from 'react';
import type { Animal, HealthStatus } from '../types/animal';
import { formatAge } from '../utils/animalGrowth';

// ── Colour maps ───────────────────────────────────────────────────────────────

const COAT_HEX: Record<string, string> = {
  Negro:      '#1a1a2e',
  Castanho:   '#8B4513',
  Retinto:    '#6B2A0F',
  Colorado:   '#C47A2B',
  Jardineiro: '#4A5C2A',
  Bragado:    '#3D2B1F',
  Cárdeno:    '#5A5A7A',
};

const HEALTH_COLOR: Record<HealthStatus, string> = {
  Excelente: 'text-emerald-400',
  Bom:       'text-green-400',
  Regular:   'text-amber-400',
  Fraco:     'text-orange-400',
  Doente:    'text-red-400',
};

const STATUS_COLOR: Record<string, string> = {
  Ativo:     'text-emerald-400',
  Lesionado: 'text-amber-400',
  Reformado: 'text-ivory/50',
  Vendido:   'text-blue-400',
  Morto:     'text-red-400',
};

// ── Derived helpers ───────────────────────────────────────────────────────────

function deriveLocation(animal: Animal): string {
  if (animal.status === 'Morto')    return '—';
  if (animal.status === 'Vendido')  return 'Fora da herdade';
  if (animal.status === 'Reformado') return 'Cercado Sul';
  if (animal.category === 'Semental') return 'Cercado Norte';
  if (animal.category === 'Vaca' || animal.category === 'Bezerra' || animal.category === 'Novilha') return 'Cercado Sul';
  if (animal.category === 'Macho de Corrida' || animal.category === 'Utrero') return 'Currais';
  if (animal.category === 'Novilho') return 'Cercado Norte';
  if (animal.category === 'Bezerro') return 'Cercado Sul';
  return 'Cercado Norte';
}

function deriveSuitability(animal: Animal): { breeding: boolean; bullfight: boolean; tentadero: boolean; sale: boolean } {
  const active = animal.status === 'Ativo';
  const male = animal.sex === 'Macho';
  return {
    breeding:  active && animal.approvedForBreeding,
    bullfight: active && !animal.hasFought && !animal.rejected && (animal.category === 'Macho de Corrida' || animal.category === 'Utrero'),
    tentadero: active && !animal.hasFought && (animal.category === 'Novilho' || animal.category === 'Utrero' || (animal.sex === 'Fêmea' && animal.exactAgeMonths >= 24)),
    sale:      active && (animal.health === 'Bom' || animal.health === 'Excelente'),
  };
}

function maioralNote(animal: Animal): string {
  if (animal.status === 'Morto') return 'Animal falecido.';
  if (animal.status === 'Vendido') return 'Animal vendido — já não pertence à herdade.';
  if (animal.rejected) return 'Animal rejeitado. Não apto para corrida.';
  if (animal.hasFought) return 'Animal já lidado — retirado do programa de corridas.';
  if (animal.health === 'Doente') return 'Animal doente. Requer atenção veterinária urgente.';
  if (animal.health === 'Fraco') return 'Animal fraco. Necessita de ganhar condição antes de qualquer actividade.';
  if (animal.stress !== undefined && animal.stress > 70) return 'Animal com stress elevado. Evitar maneio intenso.';
  if (animal.bravery >= 90) return 'Animal com transmissão excepcional. Prioridade de reprodução.';
  if (animal.bravery >= 80) return 'Bravura sólida. Candidato forte para as próximas tentas.';
  if (animal.mobility >= 85) return 'Mobilidade excelente. Animal muito ágil em campo aberto.';
  if (animal.weight < 300 && animal.exactAgeMonths > 24) return 'Animal abaixo do peso esperado para a idade. Rever alimentação.';
  if (animal.exactAgeMonths > 84) return 'Animal com idade avançada. Acompanhar condição mensalmente.';
  if (animal.category === 'Semental') return 'Semental em actividade. Boa transmissão aos filhos.';
  if (animal.category === 'Vaca' && animal.fertility > 75) return 'Vaca com boa fertilidade. Elemento valioso da ganaderia.';
  return 'Animal sem observações especiais este mês.';
}

// ── Timeline generation ───────────────────────────────────────────────────────

interface TimelineEntry {
  label: string;
  note: string;
}

function buildTimeline(animal: Animal): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  if (animal.monthlyNotes) {
    entries.push({ label: 'Este mês', note: animal.monthlyNotes });
  }
  if (animal.hasFought) {
    entries.push({ label: 'Corrida', note: 'Participou numa corrida de touros.' });
  }
  if (animal.approvedForBreeding) {
    entries.push({ label: 'Reprodução', note: 'Aprovado para reprodução pelo maioral.' });
  }
  if (animal.health === 'Excelente') {
    entries.push({ label: 'Saúde', note: 'Estado sanitário excelente registado.' });
  }
  if (animal.status === 'Lesionado') {
    entries.push({ label: 'Lesão', note: 'Animal registado como lesionado.' });
  }
  if (animal.bodyCondition !== undefined && animal.bodyCondition < 50) {
    entries.push({ label: 'Condição', note: 'Condição corporal abaixo do ideal.' });
  }
  if (animal.bodyCondition !== undefined && animal.bodyCondition >= 80) {
    entries.push({ label: 'Condição', note: `Condição corporal muito boa (${animal.bodyCondition}).` });
  }
  if (animal.weight >= 500 && animal.sex === 'Macho') {
    entries.push({ label: 'Peso', note: `Atingiu ${animal.weight} kg — no intervalo ideal para corrida.` });
  }

  // Birth entry always last
  entries.push({
    label: `${animal.birthMonth} ${animal.birthYear}`,
    note: `Nasceu na herdade. Pelagem ${animal.coat.toLowerCase()}.`,
  });

  return entries.slice(0, 6);
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="font-display text-[9px] text-gold/60 tracking-widest uppercase mb-2">{children}</p>
);

const CondBar: React.FC<{ label: string; value: number; invert?: boolean }> = ({ label, value, invert = false }) => {
  const pct = value / 100;
  const color = invert
    ? pct > 0.7 ? 'bg-red-500/80' : pct > 0.4 ? 'bg-amber-500/70' : 'bg-emerald-600/70'
    : pct > 0.7 ? 'bg-emerald-500/80' : pct > 0.4 ? 'bg-amber-500/70' : 'bg-red-500/70';
  return (
    <div className="flex items-center gap-2">
      <span className="text-ivory/40 text-[10px] font-body w-16 uppercase tracking-wider shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-leather-700/60 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-ivory/50 text-[10px] font-body w-6 text-right shrink-0">{value}</span>
    </div>
  );
};

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-2">
    <span className="text-ivory/40 text-[10px] font-body w-16 uppercase tracking-wider shrink-0">{label}</span>
    <div className="flex-1 h-1.5 bg-leather-700/60 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
    <span className="text-ivory/60 text-[10px] font-body w-6 text-right shrink-0">{value}</span>
  </div>
);

const SuitBadge: React.FC<{ label: string; ok: boolean }> = ({ label, ok }) => (
  <div className={`px-2 py-1 rounded border text-[10px] font-body text-center transition-all ${
    ok
      ? 'bg-emerald-900/30 border-emerald-600/40 text-emerald-300'
      : 'bg-leather-800/30 border-leather-600/20 text-ivory/20 line-through'
  }`}>
    {label}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

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
  const isMale = animal.sex === 'Macho';
  const coatHex = COAT_HEX[animal.coat] ?? '#3D2B1F';
  const suitability = deriveSuitability(animal);
  const location = deriveLocation(animal);
  const note = maioralNote(animal);
  const timeline = buildTimeline(animal);
  const hasCondition = animal.bodyCondition !== undefined;

  return (
    <div className="h-full flex flex-col bg-leather-900 border-l-2 border-gold/20 overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-leather-600/40 bg-leather-900/80 shrink-0">
        <div>
          <h2 className="font-display text-lg text-gold tracking-widest uppercase leading-tight">{animal.name}</h2>
          <p className="text-ivory/40 text-[10px] font-body tracking-wide mt-0.5">{animal.category} · {animal.bloodline}</p>
        </div>
        <button
          onClick={onClose}
          className="text-ivory/30 hover:text-gold transition-colors text-lg leading-none p-1 ml-4 shrink-0"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>

      {/* ── Body — two-column layout ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">

          {/* ── Photograph + suitability + Maioral note ─────────────────────── */}
          <div
            className="rounded-lg overflow-hidden relative"
            style={{
              background: `linear-gradient(160deg, ${coatHex}22 0%, ${coatHex}44 100%)`,
              border: `1.5px solid ${coatHex}66`,
            }}
          >
            {/* Photo area */}
            <div className="flex items-center justify-center h-28 relative">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${coatHex}bb` }}
              >
                <span className="text-5xl">{isMale ? '🐂' : '🐄'}</span>
              </div>
              {/* Status dot */}
              <div className={`absolute top-3 right-3 text-[10px] font-body font-semibold px-2 py-0.5 rounded border ${
                animal.status === 'Ativo'     ? 'bg-emerald-900/50 border-emerald-600/50 text-emerald-300' :
                animal.status === 'Lesionado' ? 'bg-amber-900/50 border-amber-600/50 text-amber-300' :
                animal.status === 'Morto'     ? 'bg-red-900/50 border-red-600/50 text-red-300' :
                                                'bg-leather-700/50 border-leather-500/50 text-ivory/50'
              }`}>
                {animal.status}
              </div>
              {animal.hasFought && (
                <div className="absolute top-3 left-3 bg-red-900/70 border border-red-600/50 rounded px-1.5 py-0.5">
                  <span className="text-red-300 text-[9px] font-body uppercase tracking-wider">Lidado</span>
                </div>
              )}
              <div className="absolute bottom-2 left-3">
                <span className="text-ivory/30 text-[9px] font-body">{animal.coat}</span>
              </div>
            </div>

            {/* Suitability badges */}
            <div className="px-3 pb-3 grid grid-cols-4 gap-1.5">
              <SuitBadge label="Reprodução" ok={suitability.breeding} />
              <SuitBadge label="Corrida"    ok={suitability.bullfight} />
              <SuitBadge label="Tenta"      ok={suitability.tentadero} />
              <SuitBadge label="Venda"      ok={suitability.sale} />
            </div>
          </div>

          {/* ── Identity grid ────────────────────────────────────────────────── */}
          <div>
            <SectionLabel>Identificação</SectionLabel>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                ['Sexo',      animal.sex],
                ['Idade',     formatAge(animal.exactAgeMonths)],
                ['Peso',      `${animal.weight} kg`],
                ['Saúde',     <span key="h" className={HEALTH_COLOR[animal.health]}>{animal.health}</span>],
                ['Pelagem',   animal.coat],
                ['Cornament.', animal.hornType],
                ['Localização', location],
                ['Estado',    <span key="s" className={STATUS_COLOR[animal.status] ?? 'text-ivory/60'}>{animal.status}</span>],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-baseline justify-between py-1 border-b border-leather-700/20">
                  <span className="text-ivory/35 text-[10px] font-body uppercase tracking-wider shrink-0">{label}</span>
                  <span className="text-ivory/80 text-[11px] font-body text-right ml-2">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Genealogy ────────────────────────────────────────────────────── */}
          {(fatherName || motherName) && (
            <div>
              <SectionLabel>Genealogia</SectionLabel>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {fatherName && (
                  <div className="flex items-baseline justify-between py-1 border-b border-leather-700/20">
                    <span className="text-ivory/35 text-[10px] font-body uppercase tracking-wider">Pai</span>
                    <span className="text-gold/70 text-[11px] font-body text-right">{fatherName}</span>
                  </div>
                )}
                {motherName && (
                  <div className="flex items-baseline justify-between py-1 border-b border-leather-700/20">
                    <span className="text-ivory/35 text-[10px] font-body uppercase tracking-wider">Mãe</span>
                    <span className="text-gold/70 text-[11px] font-body text-right">{motherName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Condition bars ───────────────────────────────────────────────── */}
          {hasCondition && (
            <div>
              <SectionLabel>Condição Mensal</SectionLabel>
              <div className="space-y-1.5">
                <CondBar label="Condição"   value={animal.bodyCondition ?? 70} />
                <CondBar label="Hidratação" value={animal.hydration ?? 80} />
                <CondBar label="Stress"     value={animal.stress ?? 15} invert />
                <CondBar label="Fadiga"     value={animal.fatigue ?? 10} invert />
              </div>
            </div>
          )}

          {/* ── Bravura stats ─────────────────────────────────────────────────── */}
          <div>
            <SectionLabel>Estatísticas de Bravura</SectionLabel>
            <div className="space-y-1.5">
              <StatBar label="Bravura"    value={animal.bravery}    color="bg-gold" />
              <StatBar label="Nobreza"    value={animal.nobility}   color="bg-amber-500/80" />
              <StatBar label="Mobilidade" value={animal.mobility}   color="bg-emerald-600/80" />
              <StatBar label="Fôlego"     value={animal.stamina}    color="bg-sky-600/80" />
              {(animal.category === 'Semental' || animal.sex === 'Fêmea' || animal.fertility > 0) && (
                <>
                  <StatBar label="Transmissão" value={animal.transmission} color="bg-violet-500/70" />
                  <StatBar label="Fertilidade" value={animal.fertility}    color="bg-rose-500/70" />
                </>
              )}
            </div>
          </div>

          {/* ── Maioral note ──────────────────────────────────────────────────── */}
          <div>
            <SectionLabel>Nota do Maioral</SectionLabel>
            <div className="bg-leather-800/40 border border-leather-600/30 rounded-lg p-3">
              <p className="text-ivory/60 text-xs font-body leading-relaxed italic">"{note}"</p>
            </div>
          </div>

          {/* ── Timeline ──────────────────────────────────────────────────────── */}
          <div>
            <SectionLabel>Observações</SectionLabel>
            <div className="space-y-0">
              {timeline.map((entry, i) => (
                <div key={i} className="flex gap-3 py-2 border-b border-leather-700/20 last:border-0">
                  <div className="shrink-0 pt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${i === 0 ? 'bg-gold/60' : 'bg-leather-500/60'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-body uppercase tracking-wider text-gold/50 leading-none mb-0.5">{entry.label}</p>
                    <p className="text-ivory/65 text-[11px] font-body leading-snug">{entry.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnimalDetailPanel;
