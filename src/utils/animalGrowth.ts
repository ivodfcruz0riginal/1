import type { Animal, AnimalCategory, HealthStatus, Month } from '../types/animal';
import type { Season } from '../store/gameState';

// ── Age display ───────────────────────────────────────────────────────────────

export function formatAge(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`;
  if (months === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

// ── Category resolution ───────────────────────────────────────────────────────

export function resolveCategory(animal: Animal): AnimalCategory {
  // Cabrestos never change
  if (animal.category === 'Cabresto') return 'Cabresto';
  // Dead/sold/retired animals don't change category
  if (animal.status === 'Morto' || animal.status === 'Vendido' || animal.status === 'Reformado') {
    return animal.category;
  }
  // Explicit sementais stay sementais
  if (animal.category === 'Semental') return 'Semental';

  const months = animal.exactAgeMonths;

  if (animal.sex === 'Macho') {
    if (months <= 12) return 'Bezerro';
    if (months <= 35) return 'Novilho';
    if (months <= 47) return 'Utrero';
    if (months <= 60) return 'Macho de Corrida';
    // 61+ months: keep as Macho de Corrida unless promoted manually
    return 'Macho de Corrida';
  }

  // Female
  if (months <= 12) return 'Bezerra';
  if (months <= 35) return 'Novilha';
  return 'Vaca';
}

// ── Weight growth ─────────────────────────────────────────────────────────────

// Returns delta weight in kg for this month
function weightDelta(animal: Animal, season: Season): number {
  if (animal.status === 'Morto' || animal.status === 'Vendido') return 0;

  const months = animal.exactAgeMonths;
  const isMale = animal.sex === 'Macho';
  const isInjured = animal.status === 'Lesionado';
  const healthPenalty = animal.health === 'Doente' ? -3 : animal.health === 'Fraco' ? -1.5 : 0;

  // Seasonal pasture modifier
  const seasonMod: Record<Season, number> = {
    Primavera: 1.2,
    Verão: 0.8,
    Outono: 1.0,
    Inverno: 0.6,
  };
  const smod = seasonMod[season];

  let base = 0;

  if (months <= 6) {
    base = isMale ? 8 : 6; // very fast growth
  } else if (months <= 12) {
    base = isMale ? 6 : 4.5;
  } else if (months <= 24) {
    base = isMale ? 4.5 : 3.5;
  } else if (months <= 36) {
    base = isMale ? 3 : 2;
  } else if (months <= 60) {
    base = isMale ? 1.5 : 0.8;
  } else if (months <= 84) {
    base = isMale ? 0.3 : 0.1; // plateau
  } else {
    base = isMale ? -0.5 : -0.3; // old age weight loss
  }

  const injury = isInjured ? -1.5 : 0;
  const noise = (Math.random() - 0.45) * 1.5; // slight randomness

  return base * smod + injury + healthPenalty + noise;
}

const MIN_WEIGHT: Record<Animal['sex'], number> = { Macho: 80, Fêmea: 60 };
const MAX_WEIGHT: Record<Animal['sex'], number> = { Macho: 700, Fêmea: 500 };

// ── Health update ─────────────────────────────────────────────────────────────

const HEALTH_LEVELS: HealthStatus[] = ['Excelente', 'Bom', 'Regular', 'Fraco', 'Doente'];

function updateHealth(animal: Animal, season: Season): HealthStatus {
  if (animal.status === 'Morto' || animal.status === 'Vendido') return animal.health;

  const idx = HEALTH_LEVELS.indexOf(animal.health);
  const ageMonths = animal.exactAgeMonths;

  // Base deterioration chance increases with age
  const ageFactor = ageMonths > 120 ? 0.12 : ageMonths > 84 ? 0.07 : 0.03;
  const injuryFactor = animal.status === 'Lesionado' ? 0.06 : 0;
  const winterFactor = season === 'Inverno' ? 0.03 : 0;
  const deteriorateChance = ageFactor + injuryFactor + winterFactor;

  // Recovery chance (good pasture, spring)
  const recoverChance = season === 'Primavera' ? 0.15 : 0.07;

  const roll = Math.random();
  if (roll < deteriorateChance && idx < HEALTH_LEVELS.length - 1) {
    return HEALTH_LEVELS[idx + 1];
  }
  if (roll > 1 - recoverChance && idx > 0) {
    return HEALTH_LEVELS[idx - 1];
  }
  return animal.health;
}

// ── Fertility update ──────────────────────────────────────────────────────────

function updateFertility(animal: Animal): number {
  // Only females and sementais have meaningful fertility
  const isBreeder = animal.sex === 'Fêmea' || animal.category === 'Semental';
  if (!isBreeder) return 0;

  const years = animal.exactAgeMonths / 12;
  let target: number;

  if (animal.sex === 'Fêmea') {
    if (years < 3) target = 40 + years * 10;
    else if (years <= 10) target = 80 + (years - 3) * 2;
    else if (years <= 12) target = 94 - (years - 10) * 5;
    else target = Math.max(20, 84 - (years - 12) * 8);
  } else {
    // Semental
    if (years < 4) target = 50 + years * 8;
    else if (years <= 9) target = 82 + (years - 4) * 2;
    else target = Math.max(20, 92 - (years - 9) * 6);
  }

  // Drift current value toward target by small amount each month
  const current = animal.fertility;
  const drift = (target - current) * 0.05;
  const noise = (Math.random() - 0.5) * 2;
  return Math.round(Math.max(0, Math.min(100, current + drift + noise)));
}

// ── Event generation ──────────────────────────────────────────────────────────

export interface AnimalGrowthEvent {
  text: string;
}

function maybeEvent(animal: Animal, prevWeight: number, prevHealth: HealthStatus): AnimalGrowthEvent | null {
  const gained = animal.weight - prevWeight;
  const healthImproved = HEALTH_LEVELS.indexOf(animal.health) < HEALTH_LEVELS.indexOf(prevHealth);
  const healthWorsened = HEALTH_LEVELS.indexOf(animal.health) > HEALTH_LEVELS.indexOf(prevHealth);

  if (gained >= 6) {
    return { text: `${animal.name} ganhou condição este mês.` };
  }
  if (gained <= -4) {
    return { text: `${animal.name} perdeu peso durante o mês seco.` };
  }
  if (healthImproved) {
    return { text: `${animal.name} melhorou de estado sanitário — agora ${animal.health}.` };
  }
  if (healthWorsened && (animal.health === 'Fraco' || animal.health === 'Doente')) {
    return { text: `${animal.name} deu sinais preocupantes de saúde este mês.` };
  }
  if (animal.exactAgeMonths > 84 && Math.random() < 0.08) {
    return { text: `${animal.name} começa a mostrar sinais de idade.` };
  }
  return null;
}

// ── Main monthly update ───────────────────────────────────────────────────────

export interface GrowthResult {
  animals: Animal[];
  events: AnimalGrowthEvent[];
}

export function applyMonthlyGrowth(
  animals: Animal[],
  currentMonth: Month,
  currentYear: number,
  season: Season,
): GrowthResult {
  const events: AnimalGrowthEvent[] = [];

  const updated = animals.map(animal => {
    if (animal.status === 'Morto' || animal.status === 'Vendido') return animal;

    const prevWeight = animal.weight;
    const prevHealth = animal.health;

    // Age
    const newAgeMonths = animal.exactAgeMonths + 1;
    const newAgeYears = Math.floor(newAgeMonths / 12);

    // Weight
    const delta = weightDelta(animal, season);
    const newWeight = Math.round(
      Math.max(MIN_WEIGHT[animal.sex], Math.min(MAX_WEIGHT[animal.sex], animal.weight + delta))
    );

    // Health
    const newHealth = updateHealth(animal, season);

    // Category
    const updatedAnimal: Animal = {
      ...animal,
      exactAgeMonths: newAgeMonths,
      ageYears: newAgeYears,
      age: newAgeYears,
      weight: newWeight,
      health: newHealth,
      fertility: updateFertility({ ...animal, exactAgeMonths: newAgeMonths }),
    };
    updatedAnimal.category = resolveCategory(updatedAnimal);

    const ev = maybeEvent(updatedAnimal, prevWeight, prevHealth);
    if (ev) events.push(ev);

    return updatedAnimal;
  });

  // Cap at max 2 animal events
  return { animals: updated, events: events.slice(0, 2) };
}

// ── Seed helper: enrich static animals with new required fields ───────────────

const MONTHS_LIST: Month[] = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// Given a game start of Março 1985, back-calculate approximate birth month
function estimateBirthMonth(birthYear: number, startYear: number, startMonth: Month): Month {
  const diff = (startYear - birthYear) * 12 + MONTHS_LIST.indexOf(startMonth);
  // Distribute births roughly in spring months
  const springBirthMonths: Month[] = ['Fevereiro', 'Março', 'Abril'];
  return springBirthMonths[Math.abs(birthYear) % 3];
}

export function enrichAnimal(a: Animal & { birthMonth?: Month; exactAgeMonths?: number; ageYears?: number; health?: HealthStatus }): Animal {
  const startYear = 1985;
  const startMonth: Month = 'Março';
  const startMonthIdx = MONTHS_LIST.indexOf(startMonth);

  const birthMonth = a.birthMonth ?? estimateBirthMonth(a.birthYear, startYear, startMonth);
  const birthMonthIdx = MONTHS_LIST.indexOf(birthMonth);

  const monthsSinceBirth =
    (startYear - a.birthYear) * 12 + (startMonthIdx - birthMonthIdx);
  const exactAgeMonths = a.exactAgeMonths ?? Math.max(0, monthsSinceBirth);
  const ageYears = a.ageYears ?? Math.floor(exactAgeMonths / 12);

  return {
    ...a,
    birthMonth,
    exactAgeMonths,
    ageYears,
    age: ageYears,
    health: a.health ?? 'Bom',
  };
}
