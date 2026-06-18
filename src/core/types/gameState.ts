/**
 * Core GameState type for Alpha 0.3+ architecture.
 *
 * All fields are optional to allow incremental migration from
 * the legacy store/gameState.tsx without breaking existing screens.
 * Managers (see ../managers/) own the logic for each domain.
 */

import type { Animal } from '../../types/animal';
import type { Location, LocationId } from '../../types/location';
import type { EconomyState } from '../../store/economyEngine';
import type { DailyTask } from '../../data/dailyTasks';
import type { Decision } from '../../data/decisions';
import type { DialogueTemplate } from '../../data/maioralDialogues';

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

/** Full core game state — fields are optional to allow gradual migration. */
export interface CoreGameState {
  // Time
  time?: GameDate;
  phase?: GamePhase;
  hasOpenedBuildingThisMonth?: boolean;

  // Animals
  animals?: Animal[];

  // Locations
  locations?: Location[];
  activeLocationId?: LocationId | null;

  // Economy
  economy?: EconomyState;

  // Prestige
  prestige?: number;

  // Events / history
  events?: GameEvent[];

  // Decisions
  pendingDecision?: Decision | null;

  // Dialogues
  pendingDialogue?: DialogueTemplate | null;

  // Tasks
  tasks?: DailyTask[];

  // UI notifications (building-level)
  notifications?: Record<string, { icon: string; label: string }>;
}
