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

// ── Fallback observations by trait pattern ────────────────────────────────────

const HIGH_BRAVERY = [
  'Mostra excelente atitude nos cercados. Um dos mais bravos desta geração.',
  'Nunca perde o terreno. Muito atento a qualquer movimento ao redor.',
  'Mantém-se firme mesmo nas situações mais exigentes. Toiro de excepção.',
];

const HIGH_TEMPERAMENT = [
  'Deve permanecer mais um inverno. Ainda muito impulsivo para a corrida.',
  'Requer atenção especial durante o maneio. Não se deve subestimar.',
  'Muito reagente. O tempo dirá se a bravura compensa a agressividade.',
];

const DOMINANCE = [
  'Dominante entre os machos. Lidera naturalmente qualquer grupo.',
  'Assume a frente do grupo com naturalidade. Temperamento de liderança.',
];

const FEMALE = [
  'Boa mãe em perspetiva. Comportamento exemplar nos cercados.',
  'Temperamento equilibrado. Excelente candidata ao programa de reprodução.',
  'Muito atenta aos vitelos. Instinto materno bem desenvolvido.',
];

const CALM = [
  'Animal sereno e de bom trato. Facilita muito o trabalho de maneio.',
  'Fácil de trabalhar. Nunca levanta problemas nos currais.',
];

const GENERAL = [
  'Animal sem problemas a registar este mês. Evolução dentro do esperado.',
  'Seguindo os padrões normais para a sua idade e categoria.',
  'Nada de especial a notar. Comportamento regular e estável.',
];

function pickSeeded<T>(arr: T[], id: string, slot: number): T {
  const idx = seeded(id, slot) % arr.length;
  return arr[idx];
}

function generateFallbackObservation(animal: Animal): string {
  // Use existing notes if available
  if (animal.notes && animal.notes.trim().length > 0) return animal.notes;

  const s30 = seeded(animal.id, 30);

  if (animal.sex === 'Fêmea') {
    return pickSeeded(FEMALE, animal.id, 31);
  }
  if (animal.bravery >= 88) {
    return s30 > 50
      ? pickSeeded(HIGH_BRAVERY, animal.id, 32)
      : pickSeeded(DOMINANCE, animal.id, 33);
  }
  if (animal.bravery >= 70 && seeded(animal.id, 34) > 55) {
    return pickSeeded(HIGH_TEMPERAMENT, animal.id, 35);
  }
  if (seeded(animal.id, 36) > 70) {
    return pickSeeded(CALM, animal.id, 37);
  }
  return pickSeeded(GENERAL, animal.id, 38);
}

// ── Maioral portrait (same style as MaioralDialogue) ──────────────────────────

const MaioralPortrait: React.FC = () => (
  <div className="relative shrink-0">
    <div className="w-8 h-8 rounded-full bg-leather-700/70 border border-gold/25 flex items-center justify-center overflow-hidden">
      <div className="absolute bottom-0 inset-x-0 h-4 bg-leather-800/80" />
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-800/70 rounded-full" />
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-1 bg-leather-900/80 rounded-full" />
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-1.5 bg-leather-800/70 rounded-t-sm" />
    </div>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { animal: Animal }

const AnimalObservations: React.FC<Props> = ({ animal }) => {
  const observation = generateFallbackObservation(animal);

  return (
    <div>
      <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gold/55 mb-3 pb-1.5 border-b border-leather-700/30">
        Observações do Maioral
      </p>
      <div
        className="rounded-lg px-4 py-3 border"
        style={{
          background: 'rgba(245,234,210,0.04)',
          borderColor: 'rgba(212,180,131,0.12)',
        }}
      >
        <div className="relative pl-3 border-l-2 border-gold/20 mb-3">
          <p className="text-ivory/75 text-sm font-body leading-relaxed italic">
            "{observation}"
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MaioralPortrait />
          <div>
            <p className="font-display text-[11px] text-gold/70 tracking-wider uppercase leading-none">Manuel</p>
            <p className="text-ivory/30 text-[9px] font-body mt-0.5">Maioral · Herdade da Ferraria</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalObservations;
