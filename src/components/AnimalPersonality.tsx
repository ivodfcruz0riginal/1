import React from 'react';
import type { Animal } from '../types/animal';

// ── Seeded deterministic random (0-100) ───────────────────────────────────────

function seeded(id: string, slot: number): number {
  let h = 0xdeadbeef;
  const s = `${id}:${slot}`;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x9e3779b9);
    h ^= h >>> 16;
  }
  return (h >>> 0) % 101;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, Math.round(v)));
}

// ── Personality computation ───────────────────────────────────────────────────

interface Personality {
  bravery: number;
  nobility: number;
  temperament: number;
  curiosity: number;
  dominance: number;
  intelligence: number;
  calmness: number;
}

function computePersonality(animal: Animal): Personality {
  const s = (slot: number) => seeded(animal.id, slot);
  const rawTemp = animal.bravery * 0.6 + s(1) * 0.4;
  const temperament = clamp(rawTemp, 10, 98);

  return {
    bravery: animal.bravery,
    nobility: animal.nobility,
    temperament,
    curiosity:    clamp(35 + s(2) * 0.38 + (animal.sex === 'Fêmea' ? 8 : 0), 15, 90),
    dominance:    clamp((animal.sex === 'Macho' ? 55 : 38) + s(3) * 0.33, 15, 95),
    intelligence: clamp(30 + s(4) * 0.48, 18, 92),
    calmness:     clamp(100 - temperament * 0.65 + s(5) * 0.22, 5, 88),
  };
}

// ── Bar component ─────────────────────────────────────────────────────────────

const LEVEL_LABELS = ['Muito Baixo', 'Baixo', 'Médio', 'Elevado', 'Excepcional'];

function levelLabel(v: number): string {
  if (v >= 88) return LEVEL_LABELS[4];
  if (v >= 70) return LEVEL_LABELS[3];
  if (v >= 50) return LEVEL_LABELS[2];
  if (v >= 30) return LEVEL_LABELS[1];
  return LEVEL_LABELS[0];
}

interface BarProps {
  label: string;
  value: number;
  barColor: string;
}

const TraitBar: React.FC<BarProps> = ({ label, value, barColor }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-ivory/50 text-[11px] font-body uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2.5">
        <span className="text-ivory/25 text-[10px] font-body">{levelLabel(value)}</span>
        <span className="font-display text-sm text-ivory/80 w-6 text-right">{value}</span>
      </div>
    </div>
    <div className="h-1.5 bg-leather-700/50 rounded-full overflow-hidden">
      <div
        className={`h-full ${barColor} rounded-full transition-all duration-700`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// ── Traits config ─────────────────────────────────────────────────────────────

const TRAITS: { key: keyof Personality; label: string; color: string }[] = [
  { key: 'bravery',      label: 'Bravura',      color: 'bg-gold' },
  { key: 'nobility',     label: 'Nobreza',      color: 'bg-amber-500' },
  { key: 'temperament',  label: 'Temperamento', color: 'bg-orange-500' },
  { key: 'curiosity',    label: 'Curiosidade',  color: 'bg-sky-400' },
  { key: 'dominance',    label: 'Dominância',   color: 'bg-red-500' },
  { key: 'intelligence', label: 'Inteligência', color: 'bg-teal-400' },
  { key: 'calmness',     label: 'Serenidade',   color: 'bg-emerald-400' },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { animal: Animal }

const AnimalPersonality: React.FC<Props> = ({ animal }) => {
  const p = computePersonality(animal);

  return (
    <div>
      <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gold/55 mb-3 pb-1.5 border-b border-leather-700/30">
        Personalidade
      </p>
      <div className="space-y-3">
        {TRAITS.map(t => (
          <TraitBar key={t.key} label={t.label} value={p[t.key]} barColor={t.color} />
        ))}
      </div>
    </div>
  );
};

export { computePersonality };
export type { Personality };
export default AnimalPersonality;
