import type { Animal } from '../../types/animal';
import type { Month } from '../../types/animal';
import type { Season } from '../../store/gameTypes';
import type { LocationCondition } from '../../types/location';
import { applyMonthlyGrowth } from '../../utils/animalGrowth';

// ── Context passed in from the simulation engine ──────────────────────────────

export interface AnimalContext {
  season: Season;
  northCondition: LocationCondition;
  southCondition: LocationCondition;
  northHasBrokenFence: boolean;
}

// ── Output types ──────────────────────────────────────────────────────────────

export interface AnimalDiaryEvent {
  text: string;
  priority: number; // higher = more important for diary selection
}

export interface AnimalUpdateResult {
  animals: Animal[];
  diaryEvents: AnimalDiaryEvent[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

// Estimate which enclosure an animal lives in by category.
// Animals share the north enclosure with the bulls; females live in the south.
function enclosureFor(animal: Animal): 'north' | 'south' | 'corrals' {
  switch (animal.category) {
    case 'Cabresto':
      return 'corrals';
    case 'Vaca':
    case 'Novilha':
    case 'Bezerra':
      return 'south';
    default:
      return 'north';
  }
}

// Map location condition to a quality score (-2 to +2)
const CONDITION_QUALITY: Record<LocationCondition, number> = {
  Excellent: 2,
  Good: 1,
  Regular: 0,
  Poor: -1,
  Damaged: -2,
};

// Defaults for animals that pre-date the monthly simulation fields
function applyDefaults(animal: Animal) {
  return {
    bodyCondition: animal.bodyCondition ?? 70,
    hydration: animal.hydration ?? 80,
    stress: animal.stress ?? 15,
    fatigue: animal.fatigue ?? 10,
    monthlyNotes: animal.monthlyNotes ?? '',
  };
}

// ── Per-animal monthly update ─────────────────────────────────────────────────

function updateAnimal(
  animal: Animal,
  ctx: AnimalContext,
): { updated: Animal; event: AnimalDiaryEvent | null } {
  if (animal.status === 'Morto' || animal.status === 'Vendido') {
    return { updated: animal, event: null };
  }

  const prev = applyDefaults(animal);
  const enc = enclosureFor(animal);
  const encCondition =
    enc === 'south' ? ctx.southCondition
    : enc === 'corrals' ? ctx.northCondition // corrals share north quality
    : ctx.northCondition;
  const quality = CONDITION_QUALITY[encCondition];
  const hasBrokenFence = enc === 'north' && ctx.northHasBrokenFence;
  const ageYears = animal.exactAgeMonths / 12;
  const isOld = ageYears > 8;
  const isYoung = ageYears < 2;

  // ── Body condition ──────────────────────────────────────────────────────────
  // Driven by pasture quality, season, age, and health.
  let bcDelta = quality * 3;                                  // −6 to +6
  if (ctx.season === 'Primavera') bcDelta += 2;               // spring bonus
  if (ctx.season === 'Inverno') bcDelta -= 2;                 // winter penalty
  if (isOld) bcDelta -= 1;                                    // age attrition
  if (animal.health === 'Doente') bcDelta -= 5;
  if (animal.health === 'Fraco') bcDelta -= 3;
  if (animal.health === 'Excelente') bcDelta += 2;
  const newBodyCondition = clamp(prev.bodyCondition + bcDelta);

  // ── Hydration ───────────────────────────────────────────────────────────────
  // Summer heat depletes water; autumn and spring help.
  let hydDelta = 0;
  if (ctx.season === 'Verão') hydDelta -= 8;
  else if (ctx.season === 'Inverno') hydDelta -= 2;
  else if (ctx.season === 'Primavera') hydDelta += 3;
  else hydDelta += 1;                                         // Outono
  const newHydration = clamp(prev.hydration + hydDelta);

  // ── Stress ──────────────────────────────────────────────────────────────────
  // Broken fences, poor pastures, and heat all raise stress.
  let stressDelta = 0;
  if (hasBrokenFence) stressDelta += 10;
  if (encCondition === 'Poor') stressDelta += 5;
  else if (encCondition === 'Damaged') stressDelta += 8;
  else if (encCondition === 'Good' || encCondition === 'Excellent') stressDelta -= 3;
  if (ctx.season === 'Verão') stressDelta += 3;
  if (isOld) stressDelta += 2;
  const newStress = clamp(prev.stress + stressDelta);

  // ── Fatigue ─────────────────────────────────────────────────────────────────
  // Injured animals accumulate fatigue; healthy animals recover slowly.
  let fatigDelta = 0;
  if (animal.status === 'Lesionado') fatigDelta += 10;
  else fatigDelta -= 2;                                       // natural recovery
  if (ctx.season === 'Inverno') fatigDelta += 2;
  if (isYoung) fatigDelta -= 2;                               // young recover faster
  const newFatigue = clamp(prev.fatigue + fatigDelta);

  // ── Monthly note and diary event ────────────────────────────────────────────
  const bcChange = newBodyCondition - prev.bodyCondition;
  let monthlyNotes = '';
  let event: AnimalDiaryEvent | null = null;

  if (animal.health === 'Doente') {
    monthlyNotes = 'Estado sanitário preocupante.';
    event = { text: `${animal.name} com estado sanitário preocupante.`, priority: 4 };
  } else if (isOld && bcChange < -3) {
    monthlyNotes = 'Sinais de idade. Condição em queda.';
    event = { text: `${animal.name} começa a mostrar sinais de idade.`, priority: 3 };
  } else if (bcChange <= -5) {
    const loc = enc === 'south' ? 'Cercado Sul' : 'Cercado Norte';
    monthlyNotes = 'Perda de condição este mês.';
    event = { text: `${animal.name} perdeu condição no ${loc}.`, priority: 2 };
  } else if (bcChange >= 5 && animal.health !== 'Fraco') {
    monthlyNotes = 'Boa recuperação de condição.';
    event = { text: `${animal.name} recuperou bem durante o mês.`, priority: 2 };
  } else if (newStress > 70) {
    monthlyNotes = 'Stress elevado detectado.';
  } else if (isYoung && newBodyCondition > 75) {
    monthlyNotes = 'Bom desenvolvimento juvenil.';
    event = { text: `${animal.name} em excelente desenvolvimento.`, priority: 1 };
  } else if (animal.health === 'Excelente' && newBodyCondition > 80) {
    monthlyNotes = 'Excelente estado geral.';
  }

  const updated: Animal = {
    ...animal,
    bodyCondition: newBodyCondition,
    hydration: newHydration,
    stress: newStress,
    fatigue: newFatigue,
    monthlyNotes,
  };

  return { updated, event };
}

// ── Main entry point ──────────────────────────────────────────────────────────
//
// 1. Runs applyMonthlyGrowth for weight/health/fertility/category.
// 2. Applies world-state-driven condition updates (bodyCondition, hydration,
//    stress, fatigue, monthlyNotes) to every active animal.
// 3. Returns up to 2 diary events (highest-priority first).

export function updateAnimals(
  animals: Animal[],
  month: Month,
  year: number,
  ctx: AnimalContext,
): AnimalUpdateResult {
  // Step 1: growth (weight, health, fertility, category, age)
  const { animals: grownAnimals, events: growthEvents } = applyMonthlyGrowth(
    animals,
    month,
    year,
    ctx.season,
  );

  // Step 2: world-state condition updates
  const diaryEvents: AnimalDiaryEvent[] = [];
  const updated: Animal[] = [];

  for (const animal of grownAnimals) {
    const { updated: a, event } = updateAnimal(animal, ctx);
    updated.push(a);
    if (event) diaryEvents.push(event);
  }

  // Also surface notable growth events as diary candidates
  for (const ev of growthEvents) {
    diaryEvents.push({ text: ev.text, priority: 1 });
  }

  // Return only the 2 most important diary events
  const topEvents = diaryEvents
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 2);

  return { animals: updated, diaryEvents: topEvents };
}
