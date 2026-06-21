import type { Location, LocationCondition, LocationNotification } from '../../types/location';
import type { Animal } from '../../types/animal';
import type { Season } from '../../store/gameTypes';

// ── Context passed in from the simulation engine ──────────────────────────────

export interface LocationClimate {
  season: Season;
  droughtRisk: boolean;
  newSeason: boolean;
}

// ── Output types ──────────────────────────────────────────────────────────────

export interface LocationDiaryEvent {
  text: string;
  priority: number;
}

export interface LocationUpdateResult {
  locations: Location[];
  diaryEvents: LocationDiaryEvent[];
  feedingCostMod: number; // 0.85–1.30 passed to economy engine
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

// Derive a condition enum from a 0-100 quality value
const QUALITY_THRESHOLDS: Array<[number, LocationCondition]> = [
  [80, 'Excellent'],
  [60, 'Good'],
  [40, 'Regular'],
  [20, 'Poor'],
  [0,  'Damaged'],
];
function qualityToCondition(q: number): LocationCondition {
  for (const [threshold, cond] of QUALITY_THRESHOLDS) {
    if (q > threshold) return cond;
  }
  return 'Damaged';
}

// Default quality from the current condition (used when field hasn't been set yet)
const CONDITION_TO_QUALITY: Record<LocationCondition, number> = {
  Excellent: 90, Good: 70, Regular: 50, Poor: 30, Damaged: 10,
};

// Estimate which enclosure an animal belongs to (mirrors AnimalSimulationService)
function animalEnclosure(animal: Animal): 'north' | 'south' | 'corrals' {
  switch (animal.category) {
    case 'Cabresto': return 'corrals';
    case 'Vaca': case 'Novilha': case 'Bezerra': return 'south';
    default: return 'north';
  }
}

function addNotification(loc: Location, n: LocationNotification): Location {
  if (loc.notifications.includes(n)) return loc;
  return { ...loc, notifications: [...loc.notifications, n] };
}

function removeNotification(loc: Location, n: LocationNotification): Location {
  return { ...loc, notifications: loc.notifications.filter(x => x !== n) };
}

// ── Per-location update functions ─────────────────────────────────────────────

function updateBarragem(
  loc: Location,
  climate: LocationClimate,
  events: LocationDiaryEvent[],
): Location {
  const prevLevel = loc.waterLevel ?? loc.currentOccupation;

  let delta = 0;
  if (climate.season === 'Primavera') delta = 8;
  else if (climate.season === 'Verão') delta = -10;
  else if (climate.season === 'Outono') delta = 5;
  else delta = -3; // Inverno

  const newLevel = clamp(prevLevel + delta);
  const newCondition = qualityToCondition(newLevel);

  let updated: Location = {
    ...loc,
    waterLevel: newLevel,
    currentOccupation: newLevel,
    condition: newCondition,
  };

  if (newLevel < 20) {
    updated = addNotification(updated, 'VeterinaryAlert');
    events.push({ text: 'A barragem atingiu nível crítico. Animais em risco de desidratação.', priority: 5 });
  } else if (newLevel < 40) {
    events.push({ text: 'A barragem perdeu nível durante o mês seco.', priority: 2 });
    updated = removeNotification(updated, 'VeterinaryAlert');
  } else {
    updated = removeNotification(updated, 'VeterinaryAlert');
  }

  return updated;
}

function updatePasture(
  loc: Location,
  enclosureOccupation: number,
  climate: LocationClimate,
  events: LocationDiaryEvent[],
): Location {
  const prevPQ = loc.pastureQuality ?? CONDITION_TO_QUALITY[loc.condition];
  const prevFC = loc.fenceCondition ?? 80;
  const prevCL = loc.cleanliness ?? 70;
  const hasBrokenFence = loc.notifications.includes('BrokenFence');
  const capacityRatio = loc.capacity > 0 ? enclosureOccupation / loc.capacity : 0;

  // ── Pasture quality ─────────────────────────────────────────────────────────
  let pqDelta = 0;
  if (climate.season === 'Primavera') pqDelta = 9;
  else if (climate.season === 'Verão') pqDelta = -8;
  else if (climate.season === 'Outono') pqDelta = 4;
  else pqDelta = -4; // Inverno
  if (capacityRatio > 0.8) pqDelta -= 5; // overcrowding degrades pasture
  if (hasBrokenFence) pqDelta -= 3; // fence stress accelerates degradation
  const newPQ = clamp(prevPQ + pqDelta);

  // ── Fence condition ─────────────────────────────────────────────────────────
  let fcDelta = -0.5; // natural wear each month
  if (hasBrokenFence) fcDelta -= 2; // accelerated degradation when broken
  if (climate.season === 'Inverno') fcDelta -= 1; // frost accelerates wear
  const newFC = clamp(prevFC + fcDelta);

  // ── Cleanliness ─────────────────────────────────────────────────────────────
  let clDelta = -1;
  if (capacityRatio > 0.8) clDelta -= 5;
  const newCL = clamp(prevCL + clDelta);

  const newCondition = qualityToCondition(newPQ);

  let updated: Location = {
    ...loc,
    pastureQuality: newPQ,
    fenceCondition: newFC,
    cleanliness: newCL,
    condition: newCondition,
    currentOccupation: enclosureOccupation,
  };

  // NeedsCleaning notification
  if (newCL < 40) updated = addNotification(updated, 'NeedsCleaning');
  else if (newCL >= 55) updated = removeNotification(updated, 'NeedsCleaning');

  // Diary events
  if (!hasBrokenFence && newFC < 35 && prevFC >= 35) {
    events.push({ text: `${loc.name} começa a mostrar desgaste na vedação.`, priority: 3 });
  }
  if (newPQ > prevPQ + 5 && climate.season === 'Primavera') {
    events.push({ text: `As pastagens melhoraram depois da chuva.`, priority: 1 });
  }
  if (newPQ < prevPQ - 6 && climate.droughtRisk) {
    events.push({ text: `Seca de Verão — qualidade das pastagens do ${loc.name} diminuiu.`, priority: 2 });
  }

  return updated;
}

function updateCorrals(
  loc: Location,
  enclosureOccupation: number,
  events: LocationDiaryEvent[],
): Location {
  const prevCL = loc.cleanliness ?? 55;
  const prevFC = loc.fenceCondition ?? 65;
  const capacityRatio = loc.capacity > 0 ? enclosureOccupation / loc.capacity : 0;

  let clDelta = -2; // currais get dirty faster than open pastures
  if (capacityRatio > 0.8) clDelta -= 5;
  const newCL = clamp(prevCL + clDelta);

  let fcDelta = -0.3;
  const newFC = clamp(prevFC + fcDelta);

  let updated: Location = {
    ...loc,
    cleanliness: newCL,
    fenceCondition: newFC,
    currentOccupation: enclosureOccupation,
  };

  if (newCL < 40) updated = addNotification(updated, 'NeedsCleaning');
  else if (newCL >= 60) updated = removeNotification(updated, 'NeedsCleaning');

  return updated;
}

// ── Main entry point ──────────────────────────────────────────────────────────
//
// Updates all simulation-relevant locations each month:
// - Barragem: water level from rainfall/evaporation
// - Cercados: pasture quality, fence condition, cleanliness, occupation
// - Currais: cleanliness, fence condition, occupation
// Returns a feedingCostMod for the economy engine based on average pasture quality.

export function updateLocations(
  locations: Location[],
  animals: Animal[],
  climate: LocationClimate,
): LocationUpdateResult {
  const diaryEvents: LocationDiaryEvent[] = [];

  // Count active animals per enclosure for occupation updates
  const activeAnimals = animals.filter(a => a.status !== 'Morto' && a.status !== 'Vendido');
  const northCount = activeAnimals.filter(a => animalEnclosure(a) === 'north').length;
  const southCount = activeAnimals.filter(a => animalEnclosure(a) === 'south').length;
  const corralsCount = activeAnimals.filter(a => animalEnclosure(a) === 'corrals').length;

  const updated = locations.map(loc => {
    if (loc.id === 'barragem') return updateBarragem(loc, climate, diaryEvents);
    if (loc.id === 'cercado_norte') return updatePasture(loc, northCount, climate, diaryEvents);
    if (loc.id === 'cercado_sul') return updatePasture(loc, southCount, climate, diaryEvents);
    if (loc.id === 'currais') return updateCorrals(loc, corralsCount, diaryEvents);
    return loc;
  });

  // Average pasture quality drives feeding cost modifier
  const norte = updated.find(l => l.id === 'cercado_norte');
  const sul = updated.find(l => l.id === 'cercado_sul');
  const avgPQ = ((norte?.pastureQuality ?? 60) + (sul?.pastureQuality ?? 70)) / 2;

  let feedingCostMod = 1.0;
  if (avgPQ > 70) feedingCostMod = 0.85;       // good pasture: save on hay
  else if (avgPQ > 50) feedingCostMod = 1.0;   // normal
  else if (avgPQ > 30) feedingCostMod = 1.15;  // poor pasture: more hay needed
  else feedingCostMod = 1.30;                  // very poor: expensive supplemental feed

  // Return only the 2 highest-priority diary events
  const topEvents = diaryEvents
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 2);

  return { locations: updated, diaryEvents: topEvents, feedingCostMod };
}
