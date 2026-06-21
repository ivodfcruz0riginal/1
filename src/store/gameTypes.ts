import type { Animal } from '../types/animal';
import type { StaffMember } from '../types/staff';
import type { DialogueTemplate } from '../data/maioralDialogues';
import type { DailyTask } from '../data/dailyTasks';
import type { Decision, DecisionCategory } from '../data/decisions';
import type { Location, LocationId, LocationCondition, LocationNotification } from '../types/location';
import type { EconomyState } from './economyEngine';
import type { WeatherState } from '../types/weather';
import type { BullightContract, ContractOffer } from '../types/contract';

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

// ── Dev simulation trace ──────────────────────────────────────────────────────
// Populated once per ADVANCE_MONTH; only consumed by the dev debug panel.

export interface SimulationTrace {
  month: Month;
  year: number;
  executedAt: number;
  simulationOrder: string[];
  weather: string;
  animalsUpdated: number;
  staffUpdated: number;
  pasturesUpdated: number;
  economyDelta: number;
  eventsGenerated: number;
  reportSummary: string[];
}

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
export type { StaffMember };
export type { Decision, DecisionCategory };
export type { Location, LocationId, LocationCondition, LocationNotification };
export type { WeatherState };
export type { BullightContract, ContractOffer };

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

// ── Consequence chain ─────────────────────────────────────────────────────────
// Each entry records what happened downstream of a specific decision instance.
// Multiple entries can share the same originInstanceId, forming a chain.

export interface ConsequenceEntry {
  id: string;                         // unique entry id
  originDecisionInstanceId: string;   // links back to DecisionRecord.instanceId
  month: Month;
  year: number;
  text: string;                       // human-readable consequence description
  severity: 'info' | 'warning' | 'critical';
  resolved: boolean;                  // true once the chain is fully closed
}

export interface GameState {
  year: number;
  month: Month;
  season: Season;
  eventLog: GameEvent[];
  economy: EconomyState;
  animals: Animal[];
  staff: StaffMember[];
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
  guidedTourCompleted: boolean;
  firstDecisionCompleted: boolean;
  firstRanchProblemCompleted: boolean;
  prestige: number;
  pendingFenceConsequence: 'delayed' | 'ignored' | null;
  weather: WeatherState;
  contracts: BullightContract[];
  pendingContract: ContractOffer | null;
  firstContractOffered: boolean;
  simulatedMonths: number;
  lastSimulationTrace: SimulationTrace | null;
  consequenceChain: ConsequenceEntry[];  // newest first, max 50
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
  | { type: 'COMPLETE_TOUR' }
  | { type: 'TRIGGER_RANCH_PROBLEM' }
  | { type: 'RESPOND_CONTRACT'; choice: 'accept' | 'negotiate' | 'decline' }
  | { type: 'NEW_GAME' };
