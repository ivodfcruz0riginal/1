/**
 * Core GameState types for Herança Brava.
 *
 * Legacy primitives (Month, Season, GameDate, GamePhase, GameEvent) are kept
 * here because existing managers (TimeManager, EventManager) import them from
 * this path. Do NOT remove them until Alpha 0.3 migration is complete.
 *
 * CoreGameState uses the rich entity types from src/core/types/* and is the
 * target shape for the future global simulation state.
 */

import type { AnimalEntity } from './animal';
import type { PersonEntity } from './person';
import type { LocationEntity } from './location';
import type { ClimateState } from './climate';
import type { EconomyState } from './economy';
import type { GameEvent as SimGameEvent } from './event';
import type { DecisionRecord } from './decision';
import type { RanchHistoryEntry } from './history';
import type { DailyTask } from '../../data/dailyTasks';

// ── Legacy primitives (used by TimeManager, EventManager) ────────────────────

export type Month =
  | 'Janeiro' | 'Fevereiro' | 'Março' | 'Abril' | 'Maio' | 'Junho'
  | 'Julho' | 'Agosto' | 'Setembro' | 'Outubro' | 'Novembro' | 'Dezembro';

export type Season = 'Primavera' | 'Verão' | 'Outono' | 'Inverno';

export type GamePhase =
  | 'MonthStart'
  | 'DailyPlanning'
  | 'EstateManagement'
  | 'Decisions'
  | 'EndOfMonth'
  | 'Simulation';

export interface GameDate {
  month: Month;
  year: number;
  season: Season;
}

export interface GameEvent {
  id: string;
  month: Month;
  year: number;
  text: string;
}

// ── CoreGameState ─────────────────────────────────────────────────────────────

/**
 * The target simulation state for Alpha 0.3+.
 * Fields are optional to allow safe incremental migration — screens and stores
 * may populate them gradually without requiring a full rewrite in one sprint.
 */
export interface CoreGameState {
  time: GameDate;
  phase: GamePhase;
  animals: AnimalEntity[];
  people: PersonEntity[];
  locations: LocationEntity[];
  climate: ClimateState;
  economy: EconomyState;
  events: SimGameEvent[];
  decisions: DecisionRecord[];
  history: RanchHistoryEntry[];
  tasks: DailyTask[];
  notifications: Record<string, { icon: string; label: string }>;
  prestige: number;
}
