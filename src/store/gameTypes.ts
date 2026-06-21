import type { Animal } from '../types/animal';
import type { DialogueTemplate } from '../data/maioralDialogues';
import type { DailyTask } from '../data/dailyTasks';
import type { Decision, DecisionCategory } from '../data/decisions';
import type { Location, LocationId, LocationCondition, LocationNotification } from '../types/location';
import type { EconomyState } from './economyEngine';

export type GamePhase =
  | 'MonthStart'
  | 'DailyPlanning'
  | 'EstateManagement'
  | 'Decisions'
  | 'EndOfMonth'
  | 'Simulation';

export type Month =
  | 'Janeiro' | 'Fevereiro' | 'Março' | 'Abril' | 'Maio' | 'Junho'
  | 'Julho' | 'Agosto' | 'Setembro' | 'Outubro' | 'Novembro' | 'Dezembro';

export type Season = 'Primavera' | 'Verão' | 'Outono' | 'Inverno';

export interface GameEvent {
  id: string;
  month: Month;
  year: number;
  text: string;
}

export type BuildingKey = 'escritorio' | 'tentadero' | 'currais' | 'embarque' | 'cercado_norte' | 'cercado_sul' | 'casa';

export interface BuildingNotification {
  icon: string;
  label: string;
}

export type { DialogueTemplate as MaioralDialogue };

export interface DialogueRecord {
  dialogueId: string;
  choice: string;
  month: Month;
  year: number;
}

export type { DailyTask };
export type { Decision, DecisionCategory };
export type { Location, LocationId, LocationCondition, LocationNotification };

export interface DecisionRecord {
  instanceId: string;
  decisionId: string;
  title: string;
  category: DecisionCategory;
  choice: string;
  month: Month;
  year: number;
  result: string | null;
  important?: boolean;
}

export interface GameState {
  year: number;
  month: Month;
  season: Season;
  eventLog: GameEvent[];
  economy: EconomyState;
  animals: Animal[];
  notifications: Partial<Record<BuildingKey, BuildingNotification>>;
  pendingDialogue: DialogueTemplate | null;
  dialogueHistory: DialogueRecord[];
  dailyTasks: DailyTask[];
  pendingDecision: Decision | null;
  decisionHistory: DecisionRecord[];
  locations: Location[];
  activeLocationId: LocationId | null;
  phase: GamePhase;
  hasOpenedBuildingThisMonth: boolean;
  openingSequenceCompleted: boolean;
}

export type GameAction =
  | { type: 'ADVANCE_MONTH' }
  | { type: 'DISMISS_NOTIFICATION'; building: BuildingKey }
  | { type: 'ANSWER_DIALOGUE'; choice: string }
  | { type: 'COMPLETE_TASK'; id: string }
  | { type: 'IGNORE_TASK'; id: string }
  | { type: 'RESOLVE_DECISION'; choice: string }
  | { type: 'SET_ACTIVE_LOCATION'; id: LocationId | null }
  | { type: 'UPDATE_LOCATION_CONDITION'; id: LocationId; condition: LocationCondition }
  | { type: 'ADD_LOCATION_NOTIFICATION'; id: LocationId; notification: LocationNotification }
  | { type: 'CLEAR_LOCATION_NOTIFICATION'; id: LocationId; notification: LocationNotification }
  | { type: 'UPDATE_LOCATION_OCCUPATION'; id: LocationId; occupation: number }
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'ADD_GAME_EVENT'; text: string }
  | { type: 'COMPLETE_INTRO' }
  | { type: 'NEW_GAME' };
