import React from 'react';
import type { Animal, HealthStatus } from '../types/animal';

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

// ── Condition computation ─────────────────────────────────────────────────────

interface Condition {
  bodyCondition: number;
  hydration: number;
  stress: number;
  fatigue: number;
  health: number;
}

const HEALTH_BASE: Record<HealthStatus, number> = {
  'Excelente': 95,
  'Bom': 80,
  'Regular': 58,
  'Fraco': 35,
  'Doente': 18,
};

function computeCondition(animal: Animal): Condition {
  const s = (slot: number) => seeded(animal.id, slot + 20);
  const healthBase = HEALTH_BASE[animal.health] ?? 70;
  const isInjured = animal.status === 'Lesionado';
  const isActive  = animal.status === 'Ativo';
  const isCorrida = animal.category === 'Macho de Corrida';

  return {
    bodyCondition: clamp(healthBase * 0.82 + s(1) * 0.18, 12, 99),
    hydration:     clamp(72 + s(2) * 0.22,                 55, 99),
    stress:        isInjured
                     ? clamp(62 + s(3) * 0.28, 40, 92)
                     : clamp(18 + s(3) * 0.28,  5, 60),
    fatigue:       isCorrida
                     ? clamp(42 + s(4) * 0.28, 12, 80)
                     : clamp(20 + s(4) * 0.24,  5, 65),
    health:        isActive ? healthBase : clamp(healthBase * 0.85, 10, 99),
  };
}

// ── Indicator component ───────────────────────────────────────────────────────

interface IndicatorProps {
  label: string;
  value: number;
  /** When true, HIGH value = BAD (stress, fatigue) */
  inverted?: boolean;
}

function barColor(value: number, inverted: boolean): string {
  const effective = inverted ? 100 - value : value;
  if (effective >= 80) return 'bg-emerald-500';
  if (effective >= 60) return 'bg-green-500';
  if (effective >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function statusLabel(value: number, inverted: boolean): string {
  const e = inverted ? 100 - value : value;
  if (e >= 80) return 'Óptimo';
  if (e >= 60) return 'Bom';
  if (e >= 40) return 'Regular';
  return 'Preocupante';
}

const ConditionBar: React.FC<IndicatorProps> = ({ label, value, inverted = false }) => {
  const color = barColor(value, inverted);
  const textColor = color.replace('bg-', 'text-');

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-ivory/50 text-[11px] font-body uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] font-body ${textColor}`}>{statusLabel(value, inverted)}</span>
          <span className="font-display text-sm text-ivory/80 w-6 text-right">{value}</span>
        </div>
      </div>
      <div className="h-2 bg-leather-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { animal: Animal }

const AnimalCondition: React.FC<Props> = ({ animal }) => {
  const c = computeCondition(animal);

  return (
    <div>
      <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gold/55 mb-3 pb-1.5 border-b border-leather-700/30">
        Condição Actual
      </p>
      <div className="space-y-3.5">
        <ConditionBar label="Condição Corporal" value={c.bodyCondition} />
        <ConditionBar label="Hidratação"         value={c.hydration} />
        <ConditionBar label="Stress"             value={c.stress}    inverted />
        <ConditionBar label="Fadiga"             value={c.fatigue}   inverted />
        <ConditionBar label="Saúde Geral"        value={c.health} />
      </div>
    </div>
  );
};

export default AnimalCondition;
