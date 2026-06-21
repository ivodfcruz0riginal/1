import type { Animal } from '../../types/animal';
import type { AnimalLifeState, LifeHistoryEntry, LifeStatus } from './AnimalLife';

// ── Helpers ───────────────────────────────────────────────────────────────────

function seeded(id: string, slot: number): number {
  let h = 0xdeadbeef;
  const s = `${id}:${slot}`;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x9e3779b9);
    h ^= h >>> 16;
  }
  return (h >>> 0) % 101;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, Math.round(v)));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Health number base ────────────────────────────────────────────────────────

const HEALTH_BASE: Record<string, number> = {
  'Excelente': 95,
  'Bom':       80,
  'Regular':   58,
  'Fraco':     35,
  'Doente':    18,
};

// ── Note pools ────────────────────────────────────────────────────────────────

const NOTES = {
  cond_up: [
    'Excelente recuperação. Animal em boa forma.',
    'Tem evoluído muito bem este mês.',
    'Condição corporal melhorou significativamente.',
  ],
  cond_down: [
    'Condição corporal em queda. Atenção à alimentação.',
    'Perdeu alguma condição. Requer monitorização.',
    'Mês difícil. Condição abaixo do esperado.',
  ],
  stress_high: [
    'Stress elevado. Necessita de maior observação.',
    'Animal mostra sinais de tensão. Causa ambiental possível.',
    'Precisa de maior observação este mês.',
  ],
  weight_up: [
    'Boa evolução de peso este mês.',
    'Ganhou peso. Alimentação adequada.',
    'Peso em crescimento. Animal bem alimentado.',
  ],
  weight_down: [
    'Perdeu algum peso. Convém monitorizar.',
    'Leve perda de peso. Dentro do normal para a estação.',
    'Perda de peso registada. Atenção à ração.',
  ],
  dominance: [
    'Mostra comportamento dominante no grupo.',
    'Posição de liderança bem estabelecida no efectivo.',
  ],
  good: [
    'Mês estável. Animal em boa forma.',
    'Evolução positiva. Sem preocupações a registar.',
    'Mês excelente. Animal equilibrado e saudável.',
  ],
  normal: [
    'Mês sem alterações significativas.',
    'Comportamento estável. Rotinas normais mantidas.',
    'Tudo conforme o esperado. Animal em ordem.',
  ],
};

function generateNote(
  condDelta: number,
  weightDelta: number,
  stressDelta: number,
  bodyCondition: number,
  stress: number,
): string {
  if (condDelta >= 6)                 return pick(NOTES.cond_up);
  if (condDelta <= -6)                return pick(NOTES.cond_down);
  if (stress > 65 && stressDelta > 2) return pick(NOTES.stress_high);
  if (weightDelta >= 6)               return pick(NOTES.weight_up);
  if (weightDelta <= -6)              return pick(NOTES.weight_down);
  if (bodyCondition >= 80)            return pick(NOTES.good);
  return pick(NOTES.normal);
}

// ── AnimalLifeService ─────────────────────────────────────────────────────────

export class AnimalLifeService {
  /** Create initial life states for all animals from their existing data. */
  initializeLifeStates(animals: Animal[]): Record<string, AnimalLifeState> {
    const states: Record<string, AnimalLifeState> = {};
    for (const animal of animals) {
      states[animal.id] = this._initOne(animal);
    }
    return states;
  }

  /** Update all animal life states for a new month. Uses real randomness. */
  updateAllLifeStates(
    states: Record<string, AnimalLifeState>,
    animals: Animal[],
    month: string,
    year: number,
    season: string,
  ): Record<string, AnimalLifeState> {
    const updated: Record<string, AnimalLifeState> = { ...states };
    for (const animal of animals) {
      const current = states[animal.id] ?? this._initOne(animal);
      updated[animal.id] = this._updateOne(current, animal, month, year, season);
    }
    return updated;
  }

  /** Get the current life status label based on overall condition. */
  getLifeStatus(state: AnimalLifeState): LifeStatus {
    const score = (
      state.bodyCondition +
      state.hydration +
      state.health +
      (100 - state.stress) +
      (100 - state.fatigue)
    ) / 5;
    if (score >= 82) return 'Excelente';
    if (score >= 68) return 'Bom';
    if (score >= 52) return 'Normal';
    if (score >= 35) return 'Precisa de Atenção';
    return 'Crítico';
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _initOne(animal: Animal): AnimalLifeState {
    const s   = (slot: number) => seeded(animal.id, slot + 50);
    const hb  = HEALTH_BASE[animal.health] ?? 70;
    const inj = animal.status === 'Lesionado';
    const cor = animal.category === 'Macho de Corrida';
    const male = animal.sex === 'Macho';

    return {
      animalId:        animal.id,
      ageMonths:       animal.exactAgeMonths,
      bodyCondition:   clamp(hb * 0.82 + s(1) * 0.18, 15, 99),
      hydration:       clamp(72 + s(2) * 0.22, 55, 99),
      stress:          inj  ? clamp(60 + s(3) * 0.28, 40, 88) : clamp(18 + s(3) * 0.28, 5, 58),
      fatigue:         cor  ? clamp(38 + s(4) * 0.28, 12, 78) : clamp(18 + s(4) * 0.24, 5, 60),
      happiness:       clamp(hb * 0.75 + s(5) * 0.25, 20, 99),
      dominance:       clamp((male ? 55 : 38) + s(6) * 0.33, 15, 95),
      socialRank:      clamp(30 + s(7) * 0.6,  15, 95),
      health:          hb,
      fertility:       animal.fertility > 0 ? animal.fertility : clamp(50 + s(8) * 0.4, 20, 90),
      weight:          animal.weight,
      hornDevelopment: animal.ageYears >= 3
                         ? clamp(72 + s(9) * 0.22, 55, 99)
                         : clamp(animal.ageYears * 20 + s(9) * 0.2, 5, 72),
      muscleCondition: clamp(hb * 0.78 + s(10) * 0.22, 15, 99),
      history:         [],
    };
  }

  private _updateOne(
    state: AnimalLifeState,
    animal: Animal,
    month: string,
    year: number,
    season: string,
  ): AnimalLifeState {
    const SEASON_MOD: Record<string, number> = {
      'Primavera':  0.5,
      'Verão':     -0.4,
      'Outono':     0.2,
      'Inverno':   -0.2,
    };
    const sm = SEASON_MOD[season] ?? 0;
    const r  = () => (Math.random() - 0.5) * 2; // -1..1

    const weightDelta    = Math.round(r() * 6 + sm * 4);
    const newWeight      = Math.max(
      Math.round(state.weight * 0.90),
      Math.min(Math.round(state.weight * 1.08), state.weight + weightDelta),
    );

    const rawCondDelta   = r() * 6 + sm * 3;
    const newBodyCond    = clamp(state.bodyCondition + rawCondDelta, 10, 99);

    const hydDelta       = r() * 3 + (season === 'Verão' ? -4 : 1);
    const newHydration   = clamp(state.hydration + hydDelta, 45, 99);

    const stressDelta    = r() * 6 + (season === 'Verão' ? 4 : -1);
    const newStress      = clamp(state.stress + stressDelta, 5, 88);

    const fatFactor      = animal.category === 'Macho de Corrida' ? 1.3 : 0.8;
    const fatDelta       = r() * 5 * fatFactor;
    const newFatigue     = clamp(state.fatigue + fatDelta, 5, 82);

    const condDeltaInt   = Math.round(newBodyCond - state.bodyCondition);
    const stressDeltaInt = Math.round(newStress - state.stress);

    const entry: LifeHistoryEntry = {
      id:             `${animal.id}-${month}-${year}`,
      month,
      year,
      note:           generateNote(condDeltaInt, weightDelta, stressDeltaInt, newBodyCond, newStress),
      weightDelta,
      conditionDelta: condDeltaInt,
      stressDelta:    stressDeltaInt,
    };

    return {
      ...state,
      ageMonths:       state.ageMonths + 1,
      weight:          newWeight,
      bodyCondition:   Math.round(newBodyCond),
      hydration:       Math.round(newHydration),
      stress:          Math.round(newStress),
      fatigue:         Math.round(newFatigue),
      happiness:       clamp(state.happiness + r() * 4 + rawCondDelta * 0.3, 20, 99),
      muscleCondition: clamp(state.muscleCondition + r() * 3 - fatDelta * 0.2, 20, 99),
      history:         [entry, ...state.history].slice(0, 36),
    };
  }
}

export const animalLifeService = new AnimalLifeService();
