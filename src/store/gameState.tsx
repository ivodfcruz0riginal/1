import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  INITIAL_ECONOMY,
  applyMonthToEconomy,
  type EconomyState,
} from './economyEngine';
import { applyMonthlyGrowth } from '../utils/animalGrowth';
import { animals as initialAnimals } from '../data/animals';
import { GREETING_DIALOGUE, pickMonthlyDialogue } from '../data/maioralDialogues';
import type { DialogueTemplate } from '../data/maioralDialogues';
import { generateDailyTasks } from '../data/dailyTasks';
import { OPENING_DECISION, pickDecision, nextDecisionInstanceId } from '../data/decisions';
import { INITIAL_LOCATIONS } from '../data/locations';
import {
  updateLocationCondition,
  addLocationNotification,
  clearLocationNotification,
  updateLocationOccupation,
} from '../services/locationService';

// ── Re-export types ───────────────────────────────────────────────────────────

export type {
  GamePhase,
  Month,
  Season,
  GameEvent,
  BuildingKey,
  BuildingNotification,
  MaioralDialogue,
  DialogueRecord,
  DailyTask,
  Decision,
  DecisionCategory,
  DecisionRecord,
  Location,
  LocationId,
  LocationCondition,
  LocationNotification,
  GameState,
  GameAction,
} from './gameTypes';

import type {
  GamePhase,
  Month,
  Season,
  GameEvent,
  BuildingKey,
  BuildingNotification,
  DialogueRecord,
  DecisionRecord,
  GameState,
  GameAction,
  LocationId,
  LocationCondition,
  LocationNotification,
  Decision,
} from './gameTypes';

// ── Re-export constants ───────────────────────────────────────────────────────

export {
  MONTHS,
  SEASON_MAP,
  EVENTS_POOL,
  ESCRITORIO_NOTIFICATIONS,
  CERCADO_NOTIFICATIONS,
} from './gameConstants';

import {
  MONTHS,
  SEASON_MAP,
  EVENTS_POOL,
  ESCRITORIO_NOTIFICATIONS,
  CERCADO_NOTIFICATIONS,
} from './gameConstants';

// ── Re-export EconomyState ────────────────────────────────────────────────────

export type { EconomyState };

// ── Helpers ───────────────────────────────────────────────────────────────────

function pickNotification(pool: BuildingNotification[]): BuildingNotification {
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Reducer ──────────────────────────────────────────────────────────────────

function computePhase(
  pendingDialogue: DialogueTemplate | null,
  pendingDecision: Decision | null,
  hasOpenedBuilding: boolean,
): GamePhase {
  if (pendingDialogue !== null) return 'MonthStart';
  if (pendingDecision !== null) return 'Decisions';
  if (!hasOpenedBuilding) return 'DailyPlanning';
  return 'EstateManagement';
}

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

  const newDecision = Math.random() < 0.55
    ? pickDecision(state.decisionHistory.slice(0, 3).map(r => r.decisionId))
    : null;
  const newDialogue = pickMonthlyDialogue();

  return {
    year: nextYear,
    month: nextMonth,
    season: nextSeason,
    eventLog: newLog,
    economy: newEconomy,
    animals: newAnimals,
    notifications: newNotifications,
    pendingDialogue: newDialogue,
    dialogueHistory: state.dialogueHistory,
    dailyTasks: generateDailyTasks(),
    pendingDecision: newDecision,
    decisionHistory: state.decisionHistory,
    locations: state.locations,
    activeLocationId: null,
    hasOpenedBuildingThisMonth: false,
    phase: computePhase(newDialogue, newDecision, false),
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
        phase: computePhase(null, state.pendingDecision, state.hasOpenedBuildingThisMonth),
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
      const choiceIdx = state.pendingDecision.choices.indexOf(action.choice);
      const result = state.pendingDecision.consequences?.[choiceIdx] ?? null;
      const record: DecisionRecord = {
        instanceId: nextDecisionInstanceId(),
        decisionId: state.pendingDecision.id,
        title: state.pendingDecision.title,
        category: state.pendingDecision.category,
        choice: action.choice,
        month: state.month,
        year: state.year,
        result,
        important: state.pendingDecision.important,
      };
      return {
        ...state,
        pendingDecision: null,
        decisionHistory: [record, ...state.decisionHistory],
        phase: computePhase(state.pendingDialogue, null, state.hasOpenedBuildingThisMonth),
      };
    }
    case 'SET_ACTIVE_LOCATION': {
      const opened = action.id !== null ? true : state.hasOpenedBuildingThisMonth;
      return {
        ...state,
        activeLocationId: action.id,
        hasOpenedBuildingThisMonth: opened,
        phase: computePhase(state.pendingDialogue, state.pendingDecision, opened),
      };
    }
    case 'UPDATE_LOCATION_CONDITION':
      return { ...state, locations: updateLocationCondition(state.locations, action.id, action.condition) };
    case 'ADD_LOCATION_NOTIFICATION':
      return { ...state, locations: addLocationNotification(state.locations, action.id, action.notification) };
    case 'CLEAR_LOCATION_NOTIFICATION':
      return { ...state, locations: clearLocationNotification(state.locations, action.id, action.notification) };
    case 'UPDATE_LOCATION_OCCUPATION':
      return { ...state, locations: updateLocationOccupation(state.locations, action.id, action.occupation) };
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'ADD_GAME_EVENT': {
      const ev: GameEvent = { id: nextId(), month: state.month, year: state.year, text: action.text };
      return { ...state, eventLog: [ev, ...state.eventLog].slice(0, 20) };
    }
    case 'COMPLETE_INTRO':
      return { ...state, openingSequenceCompleted: true };
    case 'NEW_GAME':
      return { ...INITIAL_STATE, openingSequenceCompleted: false };
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
  hasOpenedBuildingThisMonth: false,
  phase: 'MonthStart' as GamePhase,
  openingSequenceCompleted: false,
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
  clearLocationNotification: (id: LocationId, notification: LocationNotification) => void;
  updateLocationOccupation: (id: LocationId, occupation: number) => void;
  setPhase: (phase: GamePhase) => void;
  addGameEvent: (text: string) => void;
  completeIntro: () => void;
  startNewGame: () => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

const DECISIONS_STORAGE_KEY = 'herdade_decisions';
const OPENING_DONE_KEY = 'herdade_opening_done';

function loadSavedState(): Partial<GameState> {
  const out: Partial<GameState> = {};
  try {
    const decisions = localStorage.getItem(DECISIONS_STORAGE_KEY);
    if (decisions) out.decisionHistory = JSON.parse(decisions) as DecisionRecord[];
  } catch {}
  try {
    out.openingSequenceCompleted = localStorage.getItem(OPENING_DONE_KEY) === '1';
  } catch {}
  return out;
}

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (init) => {
    const saved = loadSavedState();
    return { ...init, ...saved };
  });

  useEffect(() => {
    try {
      localStorage.setItem(DECISIONS_STORAGE_KEY, JSON.stringify(state.decisionHistory));
    } catch {}
  }, [state.decisionHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(OPENING_DONE_KEY, state.openingSequenceCompleted ? '1' : '0');
    } catch {}
  }, [state.openingSequenceCompleted]);

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
  const clearLocationNotification = (id: LocationId, notification: LocationNotification) =>
    dispatch({ type: 'CLEAR_LOCATION_NOTIFICATION', id, notification });
  const updateLocationOccupation = (id: LocationId, occupation: number) =>
    dispatch({ type: 'UPDATE_LOCATION_OCCUPATION', id, occupation });
  const setPhase = (phase: GamePhase) =>
    dispatch({ type: 'SET_PHASE', phase });
  const addGameEvent = (text: string) =>
    dispatch({ type: 'ADD_GAME_EVENT', text });
  const completeIntro = () =>
    dispatch({ type: 'COMPLETE_INTRO' });
  const startNewGame = () => {
    try { localStorage.removeItem(OPENING_DONE_KEY); } catch {}
    try { localStorage.removeItem(DECISIONS_STORAGE_KEY); } catch {}
    dispatch({ type: 'NEW_GAME' });
  };

  return (
    <GameStateContext.Provider value={{
      state, advanceMonth: advance, dismissNotification, answerDialogue,
      completeTask, ignoreTask, resolveDecision,
      setActiveLocation, updateLocationCondition, addLocationNotification,
      clearLocationNotification, updateLocationOccupation, setPhase, addGameEvent,
      completeIntro, startNewGame,
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
