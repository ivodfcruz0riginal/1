import type {
  GameState,
  GameEvent,
  Month,
  Season,
  BuildingNotification,
  BuildingKey,
  SimulationTrace,
} from '../../store/gameTypes';
import type { Location } from '../../types/location';
import type { Decision } from '../../data/decisions';

import {
  MONTHS,
  SEASON_MAP,
  ESCRITORIO_NOTIFICATIONS,
  CERCADO_NOTIFICATIONS,
} from '../../store/gameConstants';
import { applyMonthToEconomy } from '../../store/economyEngine';
import { updateAnimals, type AnimalDiaryEvent } from './AnimalSimulationService';
import { updateLocations, type LocationDiaryEvent } from './LocationSimulationService';
import { updateStaff, type StaffDiaryEvent } from './StaffSimulationService';
import { rollWeather } from './WeatherSimulationService';
import type { WeatherState } from '../../types/weather';
import { pickMonthlyDialogue } from '../../data/maioralDialogues';
import {
  FENCE_CONSEQUENCE_DELAYED,
  FENCE_CONSEQUENCE_IGNORED,
  pickDecision,
} from '../../data/decisions';
import { generateDailyTasks } from '../../data/dailyTasks';

// ── ID generator (local to this module) ──────────────────────────────────────

let _counter = 0;
function nextId(): string {
  return `sim-${++_counter}-${Date.now()}`;
}

// ── Phase helper ──────────────────────────────────────────────────────────────

function computePhase(
  pendingDialogue: unknown,
  pendingDecision: unknown,
  hasOpenedBuilding: boolean,
): GameState['phase'] {
  if (pendingDialogue !== null) return 'MonthStart';
  if (pendingDecision !== null) return 'Decisions';
  if (!hasOpenedBuilding) return 'DailyPlanning';
  return 'EstateManagement';
}

// ── Output types ──────────────────────────────────────────────────────────────

export interface MonthlyReport {
  month: Month;
  year: number;
  treasuryBefore: number;
  treasuryAfter: number;
  animalsUpdated: number;
  eventsGenerated: number;
  summary: string[];
}

export interface SimulationOutput {
  state: GameState;
  newEvents: GameEvent[];
  report: MonthlyReport;
  simulationLog: string;
  trace: SimulationTrace;
}

// ── Internal contexts ─────────────────────────────────────────────────────────

interface DateCtx {
  month: Month;
  year: number;
  season: Season;
  prevSeason: Season;
}

interface ClimateCtx extends DateCtx {
  droughtRisk: boolean;
  frostRisk: boolean;
  newSeason: boolean;
  weather: WeatherState;
}

// ── Phase 1: Advance Date ─────────────────────────────────────────────────────
//
// Derives the next month, year, and season from the current date.

function phase1_advanceDate(state: GameState): DateCtx {
  const currentIdx = MONTHS.indexOf(state.month);
  const nextIdx = (currentIdx + 1) % 12;
  const month = MONTHS[nextIdx];
  const year = nextIdx === 0 ? state.year + 1 : state.year;
  return { month, year, season: SEASON_MAP[month], prevSeason: state.season };
}

// ── Phase 2: Update Climate ───────────────────────────────────────────────────
//
// Evaluates climate conditions from the new season.
// Downstream phases use these flags to apply world-state effects.

function phase2_updateClimate(date: DateCtx, weather: WeatherState): ClimateCtx {
  return {
    ...date,
    droughtRisk: date.season === 'Verão',
    frostRisk: date.season === 'Inverno',
    newSeason: date.season !== date.prevSeason,
    weather,
  };
}

// ── Phase 3: Update Pastures ──────────────────────────────────────────────────
//
// Delegates to LocationSimulationService which handles all per-location
// simulation: pasture quality, fence wear, cleanliness, water levels,
// and occupation counts. Returns a feedingCostMod for the economy engine.

function phase3_updatePastures(
  climate: ClimateCtx,
  state: GameState,
): { locations: Location[]; locationEvents: LocationDiaryEvent[]; feedingCostMod: number } {
  const result = updateLocations(state.locations, state.animals, {
    season: climate.season,
    droughtRisk: climate.droughtRisk,
    newSeason: climate.newSeason,
    weatherPastureQualityDelta: climate.weather.pastureQualityDelta,
    weatherWaterLevelDelta: climate.weather.waterLevelDelta,
  });
  return {
    locations: result.locations,
    locationEvents: result.diaryEvents,
    feedingCostMod: result.feedingCostMod,
  };
}

// ── Phase 4: Update Animals ───────────────────────────────────────────────────
//
// Delegates to AnimalSimulationService which:
//   1. Applies growth (weight, health, fertility, category) via applyMonthlyGrowth.
//   2. Applies world-state condition updates (bodyCondition, hydration, stress,
//      fatigue, monthlyNotes) driven by enclosure quality, season, and age.

function phase4_updateAnimals(
  climate: ClimateCtx,
  state: GameState,
  updatedLocations: Location[],
): { animals: GameState['animals']; animalEvents: AnimalDiaryEvent[] } {
  const norte = updatedLocations.find(l => l.id === 'cercado_norte');
  const sul = updatedLocations.find(l => l.id === 'cercado_sul');

  const { animals, diaryEvents } = updateAnimals(state.animals, climate.month, climate.year, {
    season: climate.season,
    northCondition: norte?.condition ?? 'Good',
    southCondition: sul?.condition ?? 'Good',
    northHasBrokenFence: (norte?.notifications ?? []).includes('BrokenFence'),
    weatherHydrationDelta: climate.weather.hydrationDelta,
    weatherStressDelta: climate.weather.stressDelta,
  });

  return { animals, animalEvents: diaryEvents };
}

// ── Phase 5: Update Economy ───────────────────────────────────────────────────
//
// Delegates to the economy engine: applies seasonal modifiers, computes
// monthly income/expenses, and appends the record to history.

function phase5_updateEconomy(climate: ClimateCtx, state: GameState, feedingCostMod: number) {
  const combinedMod = feedingCostMod * climate.weather.feedingCostMod;
  return applyMonthToEconomy(state.economy, climate.month, climate.year, climate.season, combinedMod);
}

// ── Phase 6: Resolve Pending Consequences ─────────────────────────────────────
//
// Scripted consequences take priority over random monthly decisions.
// A pending fence consequence (set when the player delayed/ignored the
// original problem) fires here, injecting the appropriate decision.

function phase6_resolvePendingConsequences(state: GameState): {
  pendingDecision: Decision | null;
  nextFenceConsequence: 'delayed' | 'ignored' | null;
} {
  if (state.pendingFenceConsequence === 'delayed') {
    return { pendingDecision: FENCE_CONSEQUENCE_DELAYED, nextFenceConsequence: null };
  }
  if (state.pendingFenceConsequence === 'ignored') {
    return { pendingDecision: FENCE_CONSEQUENCE_IGNORED, nextFenceConsequence: null };
  }
  const randomDecision = Math.random() < 0.55
    ? pickDecision(state.decisionHistory.slice(0, 3).map(r => r.decisionId))
    : null;
  return { pendingDecision: randomDecision, nextFenceConsequence: null };
}

// ── Phase 9: Update Staff ─────────────────────────────────────────────────────
//
// Delegates to StaffSimulationService: updates experience, fatigue, mood,
// loyalty, health for each staff member. Generates Maioral observation and
// optional campino work report as diary events.

function phase9_updateStaff(
  climate: ClimateCtx,
  state: GameState,
  updatedLocations: Location[],
  economyProfit: number,
): { staff: GameState['staff']; staffEvents: StaffDiaryEvent[] } {
  const norte = updatedLocations.find(l => l.id === 'cercado_norte');
  const sul = updatedLocations.find(l => l.id === 'cercado_sul');

  const { staff, diaryEvents } = updateStaff(state.staff, {
    season: climate.season,
    economyProfit,
    northCondition: norte?.condition ?? 'Good',
    southCondition: sul?.condition ?? 'Good',
    hasBrokenFence: (norte?.notifications ?? []).includes('BrokenFence'),
    treasury: state.economy.treasury,
    weatherFatigueDelta: climate.weather.fatigueDelta,
  });

  return { staff, staffEvents: diaryEvents };
}

// ── Phase 7: Generate New Events ──────────────────────────────────────────────
//
// All events derive from the current world state — no arbitrary pool picks.
// Priority: pasture changes > animal health > economy > season transition >
// ongoing warnings.

const SEASON_TRANSITION_EVENTS: Record<Season, string> = {
  Primavera: 'A Primavera chegou. As pastagens revigoram e o efectivo ganha condição.',
  Verão: 'O calor do Verão instala-se. Maior vigilância na aguada dos animais.',
  Outono: 'O Outono chegou. Tempo de preparar reservas de feno para o Inverno.',
  Inverno: 'O Inverno chegou. Animais jovens necessitam de vigilância constante.',
};

function phase7_generateEvents(
  climate: ClimateCtx,
  state: GameState,
  animalEvents: AnimalDiaryEvent[],
  economicEvent: GameEvent | null,
  locationEvents: LocationDiaryEvent[],
  staffEvents: StaffDiaryEvent[],
  weatherEvent: string,
): GameEvent[] {
  const events: GameEvent[] = [];

  // 1. Location state changes (from Phase 3)
  for (const ev of locationEvents) {
    events.push({ id: nextId(), month: climate.month, year: climate.year, text: ev.text });
  }

  // 2. Animal-level events (capped inside applyMonthlyGrowth already)
  for (const ev of animalEvents) {
    events.push({ id: nextId(), month: climate.month, year: climate.year, text: ev.text });
  }

  // 3. Economy event (only when notable)
  if (economicEvent) events.push(economicEvent);

  // 4. Season transition (only on the first month of a new season)
  if (climate.newSeason) {
    events.push({
      id: nextId(),
      month: climate.month,
      year: climate.year,
      text: SEASON_TRANSITION_EVENTS[climate.season],
    });
  }

  // 5. Low treasury warning
  if (state.economy.treasury < 20_000) {
    events.push({
      id: nextId(),
      month: climate.month,
      year: climate.year,
      text: 'Tesouraria baixa. Gestão financeira cuidadosa necessária.',
    });
  }

  // 6. Weather event (max 1 per month)
  events.push({ id: nextId(), month: climate.month, year: climate.year, text: weatherEvent });

  // 7. Staff observations (max 2, appended after world events)
  for (const ev of staffEvents) {
    events.push({ id: nextId(), month: climate.month, year: climate.year, text: ev.text });
  }

  // Cap at 8 events (world + 1 weather + 2 staff)
  return events.slice(0, 8);
}

// ── Phase 8: Generate Monthly Report ─────────────────────────────────────────
//
// Produces a structured summary of everything that happened this month.
// The report is returned in SimulationOutput and can be consumed by
// future UI panels or logging systems.

function phase8_generateReport(
  climate: ClimateCtx,
  treasuryBefore: number,
  treasuryAfter: number,
  animalsUpdated: number,
  events: GameEvent[],
): MonthlyReport {
  const delta = treasuryAfter - treasuryBefore;
  const sign = delta >= 0 ? '+' : '';
  return {
    month: climate.month,
    year: climate.year,
    treasuryBefore,
    treasuryAfter,
    animalsUpdated,
    eventsGenerated: events.length,
    summary: [
      `Mês de ${climate.month} ${climate.year} simulado.`,
      `Resultado económico: ${sign}${delta.toLocaleString('pt-PT')}€.`,
      `${animalsUpdated} animais actualizados.`,
      `${events.length} evento(s) gerado(s) este mês.`,
    ],
  };
}

// ── Notifications update ──────────────────────────────────────────────────────
//
// Generates building-level notification icons for the map.
// Preserves the fence warning while a consequence is still pending.

function buildNotifications(
  state: GameState,
): Partial<Record<BuildingKey, BuildingNotification>> {
  const notifications = { ...state.notifications };
  const pick = (pool: BuildingNotification[]) =>
    pool[Math.floor(Math.random() * pool.length)];

  if (Math.random() < 0.7) {
    notifications.escritorio = pick(ESCRITORIO_NOTIFICATIONS);
  }
  if (state.pendingFenceConsequence === null && Math.random() < 0.3) {
    notifications.cercado_norte = pick(CERCADO_NOTIFICATIONS);
  }
  if (Math.random() < 0.3) {
    notifications.cercado_sul = pick(CERCADO_NOTIFICATIONS);
  }

  return notifications;
}

// ── Main entry point ──────────────────────────────────────────────────────────
//
// Runs one complete month simulation through all 8 phases.
// Returns the updated GameState plus structured output data that
// future systems can consume without re-parsing the state.

export function simulateMonth(state: GameState): SimulationOutput {
  // Phase 1: Advance Date
  const date = phase1_advanceDate(state);

  // Phase 2: Update Climate (includes rolling weather)
  const { weather, diaryEvent: weatherDiaryEvent } = rollWeather(date.season);
  const climate = phase2_updateClimate(date, weather);

  // Phase 3: Update Pastures
  const { locations, locationEvents, feedingCostMod } = phase3_updatePastures(climate, state);

  // Phase 4: Update Animals (receives updated locations for enclosure context)
  const { animals, animalEvents } = phase4_updateAnimals(climate, state, locations);

  // Phase 5: Update Economy
  const { economy, economicEvent } = phase5_updateEconomy(climate, state, feedingCostMod);

  // Phase 6: Resolve Pending Consequences
  const { pendingDecision, nextFenceConsequence } = phase6_resolvePendingConsequences(state);

  // Phase 9: Update Staff
  const thisMonthProfit = economy.history[0]?.profit ?? 0;
  const { staff, staffEvents } = phase9_updateStaff(climate, state, locations, thisMonthProfit);

  // Phase 7: Generate New Events
  const newEvents = phase7_generateEvents(
    climate,
    state,
    animalEvents,
    economicEvent,
    locationEvents,
    staffEvents,
    weatherDiaryEvent,
  );

  // Notifications update
  const notifications = buildNotifications(state);

  // Build updated event log (newest first, capped at 20)
  const eventLog = [...newEvents, ...state.eventLog].slice(0, 20);

  // Pick Maioral dialogue for the new month
  const pendingDialogue = pickMonthlyDialogue();

  // Phase 8: Generate Monthly Report
  const report = phase8_generateReport(
    climate,
    state.economy.treasury,
    economy.treasury,
    animals.filter(a => a.status !== 'Morto' && a.status !== 'Vendido').length,
    newEvents,
  );

  // Build simulation trace (dev debug panel)
  const trace: SimulationTrace = {
    month: climate.month,
    year: climate.year,
    executedAt: Date.now(),
    simulationOrder: [
      '1. Advance Date',
      '2. Roll Weather',
      '3. Update Pastures',
      '4. Update Animals',
      '5. Update Economy',
      '6. Resolve Consequences',
      '7. Update Staff',
      '8. Generate Events',
      '9. Build Report',
    ],
    weather: `${weather.icon} ${weather.desc} (${weather.temp})`,
    animalsUpdated: animals.filter(a => a.status !== 'Morto' && a.status !== 'Vendido').length,
    staffUpdated: staff.length,
    pasturesUpdated: locations.filter(l => l.type === 'Pasture').length,
    economyDelta: economy.treasury - state.economy.treasury,
    eventsGenerated: newEvents.length,
    reportSummary: report.summary,
  };

  // Compose next state — spread preserves all non-simulated fields
  // (flow flags, prestige, decision/dialogue history, etc.)
  const nextState: GameState = {
    ...state,
    year: climate.year,
    month: climate.month,
    season: climate.season,
    eventLog,
    economy,
    animals,
    staff,
    notifications,
    pendingDialogue,
    dailyTasks: generateDailyTasks(),
    pendingDecision,
    locations,
    activeLocationId: null,
    hasOpenedBuildingThisMonth: false,
    phase: computePhase(pendingDialogue, pendingDecision, false),
    pendingFenceConsequence: nextFenceConsequence,
    weather,
    lastSimulationTrace: trace,
  };

  return {
    state: nextState,
    newEvents,
    report,
    simulationLog: report.summary.join(' '),
    trace,
  };
}
