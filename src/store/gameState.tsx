import React, { createContext, useContext, useReducer } from 'react';
import {
  INITIAL_ECONOMY,
  applyMonthToEconomy,
  type EconomyState,
} from './economyEngine';
import { applyMonthlyGrowth } from '../utils/animalGrowth';
import { animals as initialAnimals } from '../data/animals';
import type { Animal } from '../types/animal';
import { GREETING_DIALOGUE, pickMonthlyDialogue } from '../data/maioralDialogues';
import type { DialogueTemplate } from '../data/maioralDialogues';
import { generateDailyTasks } from '../data/dailyTasks';
import type { DailyTask } from '../data/dailyTasks';
import { OPENING_DECISION, pickDecision, nextDecisionInstanceId } from '../data/decisions';
import type { Decision, DecisionCategory } from '../data/decisions';
import { INITIAL_LOCATIONS, LocationManager } from '../data/locations';
import type { Location, LocationId, LocationCondition, LocationNotification } from '../data/locations';

// ── Types ────────────────────────────────────────────────────────────────────

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
export { LocationManager };

export interface DecisionRecord {
  instanceId: string;
  decisionId: string;
  title: string;
  category: DecisionCategory;
  choice: string;
  month: Month;
  year: number;
  result: string | null;
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
}

type GameAction =
  | { type: 'ADVANCE_MONTH' }
  | { type: 'DISMISS_NOTIFICATION'; building: BuildingKey }
  | { type: 'ANSWER_DIALOGUE'; choice: string }
  | { type: 'COMPLETE_TASK'; id: string }
  | { type: 'IGNORE_TASK'; id: string }
  | { type: 'RESOLVE_DECISION'; choice: string }
  | { type: 'SET_ACTIVE_LOCATION'; id: LocationId | null }
  | { type: 'UPDATE_LOCATION_CONDITION'; id: LocationId; condition: LocationCondition }
  | { type: 'ADD_LOCATION_NOTIFICATION'; id: LocationId; notification: LocationNotification }
  | { type: 'REMOVE_LOCATION_NOTIFICATION'; id: LocationId; notification: LocationNotification }
  | { type: 'UPDATE_LOCATION_OCCUPANCY'; id: LocationId; current: number };

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS: Month[] = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const SEASON_MAP: Record<Month, Season> = {
  'Março': 'Primavera', 'Abril': 'Primavera', 'Maio': 'Primavera',
  'Junho': 'Verão',     'Julho': 'Verão',     'Agosto': 'Verão',
  'Setembro': 'Outono', 'Outubro': 'Outono',  'Novembro': 'Outono',
  'Dezembro': 'Inverno','Janeiro': 'Inverno', 'Fevereiro': 'Inverno',
};

const EVENTS_POOL: string[] = [
  'Nasceram 3 vitelos saudáveis no Cercado Norte.',
  'Nasceram 5 vitelos — excelente época de partos.',
  'Nasceram 2 vitelos. Um deles já mostra sinais de bravura.',
  'Grande seca. As pastagens ressentem-se.',
  'Primavera muito húmida. Pastagens exuberantes.',
  'Excelente produção de pastagens este mês.',
  'Um trabalhador reformou-se após 30 anos de serviço.',
  'Veterinário visitou a herdade. Efetivo em boa saúde.',
  'Recebido convite para tienta em Salamanca.',
  'Recebido convite para corrida em Lisboa.',
  'Recebido convite para corrida na Moita.',
  'Recebido convite para corrida em Espanha.',
  'Excelente evolução dos novilhos do Cercado Sul.',
  'Problemas na vedação do Cercado Norte. Reparação urgente.',
  'Pequena doença respiratória detetada. Veterinário em vigilância.',
  'Boa produção de feno. Reservas para o Inverno asseguradas.',
  'Comprado novo cavalo para trabalho na herdade.',
  'Visita de um ganadeiro espanhol interessado em reprodução.',
  'Chuvas intensas causaram alagamento parcial das pastagens.',
  'Tempo seco e quente. Animais transferidos para Cercado Norte.',
  'Um novilho distinguiu-se durante o treino no tentadero.',
  'Acordo de parceria assinado com ganaderia vizinha.',
  'Festival taurino em Évora — boa visibilidade para a ganaderia.',
  'Recebido relatório veterinário anual. Sem anomalias graves.',
  'Trabalhos de manutenção concluídos no tentadero.',
];

// ── Notification pools ────────────────────────────────────────────────────────

const ESCRITORIO_NOTIFICATIONS: BuildingNotification[] = [
  { icon: '📰', label: 'Nova notícia' },
  { icon: '💰', label: 'Atualização económica' },
  { icon: '📬', label: 'Novo convite' },
  { icon: '📜', label: 'Contrato pendente' },
];

const CERCADO_NOTIFICATIONS: BuildingNotification[] = [
  { icon: '🐂', label: 'Animais activos' },
  { icon: '⚠️', label: 'Alerta veterinário' },
  { icon: '🐂', label: 'Nascimentos' },
];

function pickNotification(pool: BuildingNotification[]): BuildingNotification {
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Reducer ──────────────────────────────────────────────────────────────────

let _eventIdCounter = 0;

function nextId(): string {
  return `evt-${++_eventIdCounter}-${Date.now()}`;
}

function randomRanchEvent(month: Month, year: number): GameEvent {
  const text = EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
  return { id: nextId(), month, year, text };
}

function advanceMonthState(state: GameState): GameState {
  const currentIdx = MONTHS.indexOf(state.month);
  const nextIdx = (currentIdx + 1) % 12;
  const nextMonth = MONTHS[nextIdx];
  const nextYear = nextIdx === 0 ? state.year + 1 : state.year;
  const nextSeason = SEASON_MAP[nextMonth];

  const ranchEvent = randomRanchEvent(nextMonth, nextYear);

  const { economy: newEconomy, economicEvent } = applyMonthToEconomy(
    state.economy,
    nextMonth,
    nextYear,
    nextSeason,
  );

  const { animals: newAnimals, events: animalEvents } = applyMonthlyGrowth(
    state.animals,
    nextMonth,
    nextYear,
    nextSeason,
  );

  const newEvents: GameEvent[] = [ranchEvent];
  if (economicEvent) newEvents.push(economicEvent);
  animalEvents.forEach(ev => {
    newEvents.push({ id: nextId(), month: nextMonth, year: nextYear, text: ev.text });
  });

  const newLog = [...newEvents, ...state.eventLog].slice(0, 20);

  // Each month: 70% chance of escritório notification, 30% chance per cercado
  const newNotifications = { ...state.notifications };
  if (Math.random() < 0.7) {
    newNotifications.escritorio = pickNotification(ESCRITORIO_NOTIFICATIONS);
  }
  if (Math.random() < 0.3) {
    newNotifications.cercado_norte = pickNotification(CERCADO_NOTIFICATIONS);
  }
  if (Math.random() < 0.3) {
    newNotifications.cercado_sul = pickNotification(CERCADO_NOTIFICATIONS);
  }

  return {
    year: nextYear,
    month: nextMonth,
    season: nextSeason,
    eventLog: newLog,
    economy: newEconomy,
    animals: newAnimals,
    notifications: newNotifications,
    pendingDialogue: pickMonthlyDialogue(),
    dialogueHistory: state.dialogueHistory,
    dailyTasks: generateDailyTasks(),
    pendingDecision: Math.random() < 0.55
      ? pickDecision(state.decisionHistory.slice(0, 3).map(r => r.decisionId))
      : null,
    decisionHistory: state.decisionHistory,
    locations: state.locations,
    activeLocationId: state.activeLocationId,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADVANCE_MONTH':
      return advanceMonthState(state);
    case 'DISMISS_NOTIFICATION': {
      const notifications = { ...state.notifications };
      delete notifications[action.building];
      return { ...state, notifications };
    }
    case 'ANSWER_DIALOGUE': {
      if (!state.pendingDialogue) return state;
      const record: DialogueRecord = {
        dialogueId: state.pendingDialogue.id,
        choice: action.choice,
        month: state.month,
        year: state.year,
      };
      return {
        ...state,
        pendingDialogue: null,
        dialogueHistory: [record, ...state.dialogueHistory],
      };
    }
    case 'COMPLETE_TASK': {
      return {
        ...state,
        dailyTasks: state.dailyTasks.map(t =>
          t.id === action.id ? { ...t, status: 'completed' } : t
        ),
      };
    }
    case 'IGNORE_TASK': {
      return {
        ...state,
        dailyTasks: state.dailyTasks.map(t =>
          t.id === action.id ? { ...t, status: 'ignored' } : t
        ),
      };
    }
    case 'RESOLVE_DECISION': {
      if (!state.pendingDecision) return state;
      const record: DecisionRecord = {
        instanceId: nextDecisionInstanceId(),
        decisionId: state.pendingDecision.id,
        title: state.pendingDecision.title,
        category: state.pendingDecision.category,
        choice: action.choice,
        month: state.month,
        year: state.year,
        result: null,
      };
      return {
        ...state,
        pendingDecision: null,
        decisionHistory: [record, ...state.decisionHistory],
      };
    }
    case 'SET_ACTIVE_LOCATION':
      return { ...state, activeLocationId: action.id };
    case 'UPDATE_LOCATION_CONDITION':
      return { ...state, locations: LocationManager.updateCondition(state.locations, action.id, action.condition) };
    case 'ADD_LOCATION_NOTIFICATION':
      return { ...state, locations: LocationManager.addNotification(state.locations, action.id, action.notification) };
    case 'REMOVE_LOCATION_NOTIFICATION':
      return { ...state, locations: LocationManager.removeNotification(state.locations, action.id, action.notification) };
    case 'UPDATE_LOCATION_OCCUPANCY':
      return { ...state, locations: LocationManager.updateOccupancy(state.locations, action.id, action.current) };
    default:
      return state;
  }
}

// ── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: GameState = {
  year: 1985,
  month: 'Março',
  season: 'Primavera',
  eventLog: [
    {
      id: 'evt-0',
      month: 'Março',
      year: 1985,
      text: 'A Herdade da Ferraria inicia uma nova época. Que seja próspera.',
    },
  ],
  economy: INITIAL_ECONOMY,
  animals: initialAnimals,
  notifications: {},
  pendingDialogue: GREETING_DIALOGUE,
  dialogueHistory: [],
  dailyTasks: generateDailyTasks(),
  pendingDecision: OPENING_DECISION,
  decisionHistory: [],
  locations: INITIAL_LOCATIONS,
  activeLocationId: null,
};

// ── Context ──────────────────────────────────────────────────────────────────

interface GameStateContextValue {
  state: GameState;
  advanceMonth: () => void;
  dismissNotification: (building: BuildingKey) => void;
  answerDialogue: (choice: string) => void;
  completeTask: (id: string) => void;
  ignoreTask: (id: string) => void;
  resolveDecision: (choice: string) => void;
  setActiveLocation: (id: LocationId | null) => void;
  updateLocationCondition: (id: LocationId, condition: LocationCondition) => void;
  addLocationNotification: (id: LocationId, notification: LocationNotification) => void;
  removeLocationNotification: (id: LocationId, notification: LocationNotification) => void;
  updateLocationOccupancy: (id: LocationId, current: number) => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const advance = () => dispatch({ type: 'ADVANCE_MONTH' });
  const dismissNotification = (building: BuildingKey) =>
    dispatch({ type: 'DISMISS_NOTIFICATION', building });
  const answerDialogue = (choice: string) =>
    dispatch({ type: 'ANSWER_DIALOGUE', choice });
  const completeTask = (id: string) =>
    dispatch({ type: 'COMPLETE_TASK', id });
  const ignoreTask = (id: string) =>
    dispatch({ type: 'IGNORE_TASK', id });
  const resolveDecision = (choice: string) =>
    dispatch({ type: 'RESOLVE_DECISION', choice });
  const setActiveLocation = (id: LocationId | null) =>
    dispatch({ type: 'SET_ACTIVE_LOCATION', id });
  const updateLocationCondition = (id: LocationId, condition: LocationCondition) =>
    dispatch({ type: 'UPDATE_LOCATION_CONDITION', id, condition });
  const addLocationNotification = (id: LocationId, notification: LocationNotification) =>
    dispatch({ type: 'ADD_LOCATION_NOTIFICATION', id, notification });
  const removeLocationNotification = (id: LocationId, notification: LocationNotification) =>
    dispatch({ type: 'REMOVE_LOCATION_NOTIFICATION', id, notification });
  const updateLocationOccupancy = (id: LocationId, current: number) =>
    dispatch({ type: 'UPDATE_LOCATION_OCCUPANCY', id, current });

  return (
    <GameStateContext.Provider value={{
      state, advanceMonth: advance, dismissNotification, answerDialogue,
      completeTask, ignoreTask, resolveDecision,
      setActiveLocation, updateLocationCondition, addLocationNotification,
      removeLocationNotification, updateLocationOccupancy,
    }}>
      {children}
    </GameStateContext.Provider>
  );
};

export function useGameState(): GameStateContextValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used inside GameStateProvider');
  return ctx;
}
