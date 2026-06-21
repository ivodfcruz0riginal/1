import React from 'react';
import type { Animal, AnimalCategory, HealthStatus } from '../types/animal';
import { formatAge } from '../utils/animalGrowth';
import AnimalPersonality from './AnimalPersonality';
import AnimalCondition from './AnimalCondition';
import AnimalObservations from './AnimalObservations';
import AnimalTimeline from './AnimalTimeline';

// ── Visual mappings ───────────────────────────────────────────────────────────

const COAT_HEX: Record<string, string> = {
  'Negro':    '#1a1a2e',
  'Castanho': '#8B4513',
  'Retinto':  '#6B2A0F',
  'Colorado': '#C47A2B',
  'Jardineiro':'#4A5C2A',
  'Bragado':  '#3D2B1F',
  'Cárdeno':  '#5A5A7A',
};

const CATEGORY_STYLE: Record<AnimalCategory, string> = {
  'Semental':        'bg-gold/15 text-gold border-gold/35',
  'Vaca':            'bg-rose-900/30 text-rose-300 border-rose-500/30',
  'Novilha':         'bg-emerald-900/30 text-emerald-300 border-emerald-500/30',
  'Macho de Corrida':'bg-amber-900/30 text-amber-300 border-amber-500/30',
  'Cabresto':        'bg-leather-700/50 text-ivory/55 border-leather-500/30',
  'Bezerro':         'bg-sky-900/30 text-sky-300 border-sky-500/30',
  'Bezerra':         'bg-sky-900/30 text-sky-300 border-sky-500/30',
  'Novilho':         'bg-teal-900/30 text-teal-300 border-teal-500/30',
  'Utrero':          'bg-orange-900/30 text-orange-300 border-orange-500/30',
};

const STATUS_STYLE: Record<string, string> = {
  'Ativo':     'bg-emerald-900/30 text-emerald-400 border-emerald-600/30',
  'Lesionado': 'bg-amber-900/30 text-amber-400 border-amber-600/30',
  'Reformado': 'bg-leather-700/40 text-ivory/45 border-leather-500/30',
  'Vendido':   'bg-sky-900/30 text-sky-400 border-sky-600/30',
  'Morto':     'bg-red-950/50 text-red-400 border-red-800/30',
};

const HEALTH_COLOR: Record<HealthStatus, string> = {
  'Excelente': 'text-emerald-400',
  'Bom':       'text-green-400',
  'Regular':   'text-amber-400',
  'Fraco':     'text-orange-400',
  'Doente':    'text-red-400',
};

// ── Derived location from category ───────────────────────────────────────────

function seeded(id: string, slot: number): number {
  let h = 0xdeadbeef;
  const s = `${id}:${slot}`;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x9e3779b9);
    h ^= h >>> 16;
  }
  return (h >>> 0) % 101;
}

const FAVOURITE_PASTURES: Record<string, string[]> = {
  'Miura':           ['Cercado Norte', 'Dehesa Principal'],
  'Pablo Romero':    ['Cercado Sul', 'Cercado Norte'],
  'Concha y Sierra': ['Pastagem das Azinheiras', 'Cercado Sul'],
  'Cruzado':         ['Dehesa Principal', 'Pastagem Livre'],
};

function derivedLocation(animal: Animal): string {
  if (animal.status === 'Morto')   return '—';
  if (animal.status === 'Reformado') return 'Dehesa Principal';
  const map: Partial<Record<AnimalCategory, string>> = {
    'Semental':         'Dehesa Principal',
    'Macho de Corrida': 'Cercado dos Touros',
    'Cabresto':         'Pastagem Livre',
  };
  if (map[animal.category]) return map[animal.category]!;
  return seeded(animal.id, 60) > 50 ? 'Cercado Norte' : 'Cercado Sul';
}

function favouritePasture(animal: Animal): string {
  const options = FAVOURITE_PASTURES[animal.bloodline] ?? ['Cercado Norte', 'Cercado Sul'];
  return options[seeded(animal.id, 61) % options.length];
}

function currentGroup(animal: Animal): string {
  const map: Partial<Record<AnimalCategory, string>> = {
    'Semental':         'Grupo dos Reprodutores',
    'Vaca':             'Grupo das Fêmeas',
    'Novilha':          'Grupo das Fêmeas Jovens',
    'Macho de Corrida': 'Lote de Corrida',
    'Cabresto':         'Grupo de Manso',
    'Novilho':          'Lote dos Novilhos',
    'Utrero':           'Lote dos Utreros',
    'Bezerro':          'Grupo dos Jovens',
    'Bezerra':          'Grupo dos Jovens',
  };
  return map[animal.category] ?? 'Efectivo Geral';
}

// ── Sub-components ────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between py-1.5 border-b border-leather-700/25">
    <span className="text-ivory/35 text-[11px] font-body uppercase tracking-wider shrink-0">{label}</span>
    <span className="text-ivory/80 text-xs font-body text-right ml-3 leading-snug">{value}</span>
  </div>
);

const Badge: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`text-[11px] px-2.5 py-0.5 rounded border font-body ${className}`}>
    {children}
  </span>
);

const StatChip: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-ivory/30 text-[9px] font-body uppercase tracking-widest">{label}</span>
    <span className={`font-display text-sm text-ivory/80 ${className ?? ''}`}>{value}</span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

interface AnimalProfileProps {
  animal: Animal;
  allAnimals: Animal[];
  onClose: () => void;
}

const AnimalProfile: React.FC<AnimalProfileProps> = ({ animal, allAnimals, onClose }) => {
  const coatHex = COAT_HEX[animal.coat] ?? '#3d2b1f';
  const isMale = animal.sex === 'Macho';

  const father   = animal.fatherId   ? allAnimals.find(a => a.id === animal.fatherId)   : null;
  const mother   = animal.motherId   ? allAnimals.find(a => a.id === animal.motherId)   : null;
  const children = allAnimals.filter(a => a.fatherId === animal.id || a.motherId === animal.id);

  const hasBreedingStats = animal.fertility > 0 || animal.transmission > 0;

  return (
    <div className="h-full flex flex-col bg-leather-900 overflow-hidden">

      {/* ── Portrait header ─────────────────────────────────────────────────── */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          height: '192px',
          background: `linear-gradient(145deg, ${coatHex}55 0%, ${coatHex}22 55%, #0d0905 100%)`,
        }}
      >
        {/* Horizontal texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px)',
          }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold/35 pointer-events-none" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gold/35 pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-ivory/35 hover:text-gold transition-colors text-lg leading-none p-1"
          aria-label="Fechar perfil"
        >
          ✕
        </button>

        {/* Main content */}
        <div className="absolute inset-x-0 inset-y-0 flex items-center gap-6 px-7">
          {/* Portrait circle */}
          <div
            className="shrink-0 w-28 h-28 rounded-full border border-gold/20 flex items-center justify-center shadow-2xl relative overflow-hidden"
            style={{ background: `radial-gradient(circle at 40% 35%, ${coatHex}80, ${coatHex}30 70%, transparent)` }}
          >
            {/* Status dot */}
            <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-leather-900
              ${animal.status === 'Ativo' ? 'bg-emerald-500' :
                animal.status === 'Lesionado' ? 'bg-amber-500' :
                animal.status === 'Morto' ? 'bg-red-700' : 'bg-leather-500'}`}
            />
            <span
              className="font-display select-none"
              style={{ fontSize: '3.5rem', lineHeight: 1, color: 'rgba(245,234,210,0.50)' }}
            >
              {animal.name[0]}
            </span>
          </div>

          {/* Identity block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="font-display text-4xl text-gold tracking-[0.08em] uppercase leading-none truncate">
                {animal.name}
              </h1>
            </div>
            <p className="text-ivory/30 text-[11px] font-body tracking-widest uppercase mt-1 mb-3">
              #{animal.id.toUpperCase()} · {animal.bloodline}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={CATEGORY_STYLE[animal.category]}>{animal.category}</Badge>
              <Badge className={STATUS_STYLE[animal.status]}>{animal.status}</Badge>
              {animal.hasFought && (
                <Badge className="bg-red-950/50 text-red-400 border-red-800/30">Lidado</Badge>
              )}
              {animal.rejected && (
                <Badge className="bg-red-950/50 text-red-400 border-red-800/30">Rejeitado</Badge>
              )}
              {animal.approvedForBreeding && (
                <Badge className="bg-emerald-950/50 text-emerald-400 border-emerald-800/30">Aprovado Reprod.</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Key stats bar */}
        <div className="absolute bottom-0 inset-x-0 bg-leather-950/70 border-t border-leather-700/30 flex items-center gap-8 px-8 py-2.5">
          <StatChip label="Idade"  value={formatAge(animal.exactAgeMonths)} />
          <div className="h-4 w-px bg-leather-700/40" />
          <StatChip label="Peso"   value={`${animal.weight} kg`} />
          <div className="h-4 w-px bg-leather-700/40" />
          <StatChip label="Saúde"  value={animal.health} className={HEALTH_COLOR[animal.health]} />
          <div className="h-4 w-px bg-leather-700/40" />
          <StatChip label="Sexo"   value={animal.sex} />
          <div className="h-4 w-px bg-leather-700/40" />
          <StatChip label="Bravura" value={animal.bravery} className={animal.bravery >= 90 ? 'text-gold' : 'text-ivory/80'} />
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">

          {/* Top 2-column grid: Identity + Personality */}
          <div className="grid grid-cols-2 gap-8">

            {/* Identity */}
            <div>
              <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gold/55 mb-3 pb-1.5 border-b border-leather-700/30">
                Identificação
              </p>
              <div>
                <InfoRow label="Nascimento" value={`${animal.birthMonth} ${animal.birthYear}`} />
                <InfoRow label="Pelagem"    value={animal.coat} />
                <InfoRow label="Cornamento" value={animal.hornType} />
                <InfoRow label="Localização" value={derivedLocation(animal)} />
                {father && <InfoRow label="Pai"  value={father.name} />}
                {mother && <InfoRow label="Mãe"  value={mother.name} />}
              </div>
            </div>

            {/* Personality */}
            <AnimalPersonality animal={animal} />
          </div>

          {/* Second 2-column grid: Condition + Observations */}
          <div className="grid grid-cols-2 gap-8">
            <AnimalCondition animal={animal} />
            <AnimalObservations animal={animal} />
          </div>

          {/* Breeding stats (if applicable) */}
          {hasBreedingStats && (
            <div>
              <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gold/55 mb-3 pb-1.5 border-b border-leather-700/30">
                Estatísticas Genéticas
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Transmissão', value: animal.transmission, color: 'bg-purple-500/70' },
                  { label: 'Fertilidade',  value: animal.fertility,    color: 'bg-rose-500/70' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-ivory/50 text-[11px] font-body uppercase tracking-wider">{s.label}</span>
                      <span className="font-display text-sm text-ivory/80">{s.value}</span>
                    </div>
                    <div className="h-1.5 bg-leather-700/50 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <AnimalTimeline animal={animal} />

          {/* Relationships */}
          <div>
            <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gold/55 mb-3 pb-1.5 border-b border-leather-700/30">
              Relações
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-0">
              {father && <InfoRow label="Pai"                value={father.name} />}
              {mother && <InfoRow label="Mãe"                value={mother.name} />}
              {children.length > 0 && (
                <InfoRow
                  label={`Descendentes (${children.length})`}
                  value={children.slice(0, 3).map(c => c.name).join(', ') + (children.length > 3 ? '…' : '')}
                />
              )}
              <InfoRow label="Grupo Actual"      value={currentGroup(animal)} />
              <InfoRow label="Pastagem Preferida" value={favouritePasture(animal)} />
            </div>
          </div>

          {/* Bottom padding */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default AnimalProfile;
