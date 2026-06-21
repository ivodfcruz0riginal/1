import type {
  GameState,
  GameEvent,
  Month,
  Season,
  BuildingNotification,
  BuildingKey,
} from '../../store/gameTypes';
import type { Location, LocationCondition } from '../../types/location';
import type { Decision } from '../../data/decisions';

import {
  MONTHS,
  SEASON_MAP,
  ESCRITORIO_NOTIFICATIONS,
  CERCADO_NOTIFICATIONS,
} from '../../store/gameConstants';
import { applyMonthToEconomy } from '../../store/economyEngine';
import { applyMonthlyGrowth, type AnimalGrowthEvent } from '../../utils/animalGrowth';
import { pickMonthlyDialogue } from '../../data/maioralDialogues';
import {
  FENCE_CONSEQUENCE_DELAYED,
  FENCE_CONSEQUENCE_IGNORED,
  pickDecision,
} from '../../data/decisions';
import { updateLocationCondition } from '../../services/locationService';
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
}

// ── Condition ordering for pasture degradation ────────────────────────────────

const CONDITION_ORDER: LocationCondition[] = [
  'Excellent',
  'Good',
  'Regular',
  'Poor',
  'Damaged',
];

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

function phase2_updateClimate(date: DateCtx): ClimateCtx {
  return {
    ...date,
    droughtRisk: date.season === 'Verão',
    frostRisk: date.season === 'Inverno',
    newSeason: date.season !== date.prevSeason,
  };
}

// ── Phase 3: Update Pastures ──────────────────────────────────────────────────
//
// Applies climate effects to location conditions.
// Broken fences degrade the enclosure; drought degrades summer pastures;
// spring rains restore pastures that were previously degraded.

function phase3_updatePastures(
  climate: ClimateCtx,
  state: GameState,
): { locations: Location[]; pastureEvents: GameEvent[] } {
  const pastureEvents: GameEvent[] = [];
  let locations = state.locations;

  const norte = locations.find(l => l.id === 'cercado_norte');

  // Broken fence → progressive condition deterioration
  if (norte?.notifications.includes('BrokenFence')) {
    const idx = CONDITION_ORDER.indexOf(norte.condition);
    if (idx < CONDITION_ORDER.length - 1) {
      locations = updateLocationCondition(
        locations,
        'cercado_norte',
        CONDITION_ORDER[idx + 1],
      );
      pastureEvents.push({
        id: nextId(),
        month: climate.month,
        year: climate.year,
        text: 'Vedação por reparar — condição do Cercado Norte deteriora.',
      });
    }
  }

  // Drought → south pasture degrades if currently in good condition
  if (climate.droughtRisk) {
    const sul = locations.find(l => l.id === 'cercado_sul');
    if (sul) {
      const idx = CONDITION_ORDER.indexOf(sul.condition);
      if (idx < 2) {
        locations = updateLocationCondition(
          locations,
          'cercado_sul',
          CONDITION_ORDER[idx + 1],
        );
        pastureEvents.push({
          id: nextId(),
          month: climate.month,
          year: climate.year,
          text: 'Seca de Verão — qualidade das pastagens do Cercado Sul diminuiu.',
        });
      }
    }
  }

  // Spring rains → south pasture recovers (only when season just changed)
  if (climate.newSeason && climate.season === 'Primavera') {
    const sul = locations.find(l => l.id === 'cercado_sul');
    if (sul && (sul.condition === 'Regular' || sul.condition === 'Poor')) {
      locations = updateLocationCondition(locations, 'cercado_sul', 'Good');
      pastureEvents.push({
        id: nextId(),
        month: climate.month,
        year: climate.year,
        text: 'Chuvas da Primavera — pastagens do Cercado Sul recuperaram.',
      });
    }
  }

  return { locations, pastureEvents };
}

// ── Phase 4: Update Animals ───────────────────────────────────────────────────
//
// Delegates to the existing growth engine: ages each animal, updates
// weight, health, fertility, and category based on season and condition.

function phase4_updateAnimals(
  climate: ClimateCtx,
  state: GameState,
): { animals: GameState['animals']; animalEvents: AnimalGrowthEvent[] } {
  const { animals, events } = applyMonthlyGrowth(
    state.animals,
    climate.month,
    climate.year,
    climate.season,
  );
  return { animals, animalEvents: events };
}

// ── Phase 5: Update Economy ───────────────────────────────────────────────────
//
// Delegates to the economy engine: applies seasonal modifiers, computes
// monthly income/expenses, and appends the record to history.

function phase5_updateEconomy(climate: ClimateCtx, state: GameState) {
  return applyMonthToEconomy(state.economy, climate.month, climate.year, climate.season);
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
  animalEvents: AnimalGrowthEvent[],
  economicEvent: GameEvent | null,
  pastureEvents: GameEvent[],
): GameEvent[] {
  const events: GameEvent[] = [];

  // 1. Pasture state changes (from Phase 3)
  events.push(...pastureEvents);

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

  // 5. Ongoing broken fence warning
  const norte = state.locations.find(l => l.id === 'cercado_norte');
  if (norte?.notifications.includes('BrokenFence')) {
    events.push({
      id: nextId(),
      month: climate.month,
      year: climate.year,
      text: 'Vedação do Cercado Norte ainda danificada. Reparação pendente.',
    });
  }

  // 6. Low treasury warning
  if (state.economy.treasury < 20_000) {
    events.push({
      id: nextId(),
      month: climate.month,
      year: climate.year,
      text: 'Tesouraria baixa. Gestão financeira cuidadosa necessária.',
    });
  }

  // Cap at 5 events to keep the log readable
  return events.slice(0, 5);
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

  // Phase 2: Update Climate
  const climate = phase2_updateClimate(date);

  // Phase 3: Update Pastures
  const { locations, pastureEvents } = phase3_updatePastures(climate, state);

  // Phase 4: Update Animals
  const { animals, animalEvents } = phase4_updateAnimals(climate, state);

  // Phase 5: Update Economy
  const { economy, economicEvent } = phase5_updateEconomy(climate, state);

  // Phase 6: Resolve Pending Consequences
  const { pendingDecision, nextFenceConsequence } = phase6_resolvePendingConsequences(state);

  // Phase 7: Generate New Events
  const newEvents = phase7_generateEvents(
    climate,
    state,
    animalEvents,
    economicEvent,
    pastureEvents,
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
    notifications,
    pendingDialogue,
    dailyTasks: generateDailyTasks(),
    pendingDecision,
    locations,
    activeLocationId: null,
    hasOpenedBuildingThisMonth: false,
    phase: computePhase(pendingDialogue, pendingDecision, false),
    pendingFenceConsequence: nextFenceConsequence,
  };

  return {
    state: nextState,
    newEvents,
    report,
    simulationLog: 'Simulation completed.',
  };
}
