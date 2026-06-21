import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  INITIAL_ECONOMY,
  type EconomyState,
} from './economyEngine';
import { animals as initialAnimals } from '../data/animals';
import { GREETING_DIALOGUE } from '../data/maioralDialogues';
import type { DialogueTemplate } from '../data/maioralDialogues';
import { generateDailyTasks } from '../data/dailyTasks';
import { OPENING_DECISION, NORTH_FENCE_DECISION, nextDecisionInstanceId } from '../data/decisions';
import { INITIAL_LOCATIONS } from '../data/locations';
import {
  updateLocationCondition,
  addLocationNotification,
  clearLocationNotification,
  updateLocationOccupation,
} from '../services/locationService';
import { simulateMonth } from '../core/simulation/SimulationEngine';

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

function advanceMonthState(state: GameState): GameState {
  return simulateMonth(state).state;
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
      let next: GameState = {
        ...state,
        pendingDecision: null,
        decisionHistory: [record, ...state.decisionHistory],
        phase: computePhase(state.pendingDialogue, null, state.hasOpenedBuildingThisMonth),
        firstDecisionCompleted: true,
      };

      // North fence special effects (inf_01)
      if (state.pendingDecision.id === 'inf_01') {
        next = { ...next, firstRanchProblemCompleted: true };
        const diaryTexts = [
          'Vedação do Cercado Norte reparada. Custo: 1.500€.',
          'Reparação da vedação do Cercado Norte adiada para o próximo mês.',
          'Problema na vedação do Cercado Norte ignorado.',
        ];
        const eventText = diaryTexts[choiceIdx] ?? diaryTexts[2];
        const ev: GameEvent = { id: nextId(), month: state.month, year: state.year, text: eventText };
        next = { ...next, eventLog: [ev, ...next.eventLog].slice(0, 20) };

        if (choiceIdx === 0) {
          const withoutNotif = { ...next.notifications };
          delete withoutNotif.cercado_norte;
          next = {
            ...next,
            economy: { ...next.economy, treasury: next.economy.treasury - 1500 },
            notifications: withoutNotif,
            locations: clearLocationNotification(
              updateLocationCondition(next.locations, 'cercado_norte', 'Good'),
              'cercado_norte',
              'BrokenFence',
            ),
          };
        } else {
          // choices 1 (adiar) and 2 (ignorar) schedule a future consequence
          next = { ...next, pendingFenceConsequence: choiceIdx === 1 ? 'delayed' : 'ignored' };
        }
      }

      // Fence deterioration consequence (inf_02)
      if (state.pendingDecision.id === 'inf_02') {
        const diaryTexts = [
          'Vedação do Cercado Norte reparada. Custo: 2.000€.',
          'Reparação adiada novamente. O risco é agora muito elevado.',
        ];
        const ev: GameEvent = { id: nextId(), month: state.month, year: state.year, text: diaryTexts[choiceIdx] ?? diaryTexts[1] };
        next = { ...next, eventLog: [ev, ...next.eventLog].slice(0, 20) };

        if (choiceIdx === 0) {
          const withoutNotif = { ...next.notifications };
          delete withoutNotif.cercado_norte;
          next = {
            ...next,
            economy: { ...next.economy, treasury: next.economy.treasury - 2000 },
            notifications: withoutNotif,
            locations: clearLocationNotification(
              updateLocationCondition(next.locations, 'cercado_norte', 'Good'),
              'cercado_norte',
              'BrokenFence',
            ),
          };
        } else {
          // Escalate to escape scenario
          next = { ...next, pendingFenceConsequence: 'ignored' };
        }
      }

      // Animal escape consequence (inf_03)
      if (state.pendingDecision.id === 'inf_03') {
        // Livro da Casa: record the escape event
        const escapeEv: GameEvent = { id: nextId(), month: state.month, year: state.year, text: 'Dois novilhos fugiram do Cercado Norte durante a noite.' };
        const diaryTexts = [
          'Dois novilhos encontrados após fuga do Cercado Norte. Custo: 1.000€.',
          'Campinos extra chamados. Animais recuperados e vedação reparada. Custo: 2.500€.',
          'Fuga no Cercado Norte sem resposta adequada. Reputação afectada.',
        ];
        const choiceEv: GameEvent = { id: nextId(), month: state.month, year: state.year, text: diaryTexts[choiceIdx] ?? diaryTexts[2] };
        next = { ...next, eventLog: [choiceEv, escapeEv, ...next.eventLog].slice(0, 20) };

        if (choiceIdx === 0) {
          next = { ...next, economy: { ...next.economy, treasury: next.economy.treasury - 1000 } };
        } else if (choiceIdx === 1) {
          const withoutNotif = { ...next.notifications };
          delete withoutNotif.cercado_norte;
          next = {
            ...next,
            economy: { ...next.economy, treasury: next.economy.treasury - 2500 },
            prestige: Math.min(100, next.prestige + 1),
            notifications: withoutNotif,
            locations: clearLocationNotification(
              updateLocationCondition(next.locations, 'cercado_norte', 'Regular'),
              'cercado_norte',
              'BrokenFence',
            ),
          };
        } else {
          next = { ...next, prestige: Math.max(0, next.prestige - 5) };
        }
      }

      return next;
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
    case 'COMPLETE_TOUR':
      return { ...state, guidedTourCompleted: true };
    case 'TRIGGER_RANCH_PROBLEM': {
      const updatedLocations = addLocationNotification(
        updateLocationCondition(state.locations, 'cercado_norte', 'Poor'),
        'cercado_norte',
        'BrokenFence',
      );
      return {
        ...state,
        pendingDecision: NORTH_FENCE_DECISION,
        notifications: { ...state.notifications, cercado_norte: { icon: '⚠', label: 'Vedação fraca' } },
        locations: updatedLocations,
      };
    }
    case 'NEW_GAME':
      return { ...INITIAL_STATE, openingSequenceCompleted: false, guidedTourCompleted: false, firstDecisionCompleted: false, firstRanchProblemCompleted: false, prestige: 42, pendingFenceConsequence: null };
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
  guidedTourCompleted: false,
  firstDecisionCompleted: false,
  firstRanchProblemCompleted: false,
  prestige: 42,
  pendingFenceConsequence: null,
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
  completeTour: () => void;
  triggerRanchProblem: () => void;
  startNewGame: () => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

const DECISIONS_STORAGE_KEY = 'herdade_decisions';
const OPENING_DONE_KEY = 'herdade_opening_done';
const TOUR_DONE_KEY = 'herdade_tour_done';
const FIRST_DECISION_DONE_KEY = 'herdade_first_decision_done';
const RANCH_PROBLEM_DONE_KEY = 'herdade_ranch_problem_done';
const PRESTIGE_KEY = 'herdade_prestige';
const FENCE_CONSEQUENCE_KEY = 'herdade_fence_consequence';

function loadSavedState(): Partial<GameState> {
  const out: Partial<GameState> = {};
  try {
    const decisions = localStorage.getItem(DECISIONS_STORAGE_KEY);
    if (decisions) out.decisionHistory = JSON.parse(decisions) as DecisionRecord[];
  } catch {}
  try {
    out.openingSequenceCompleted = localStorage.getItem(OPENING_DONE_KEY) === '1';
  } catch {}
  try {
    out.guidedTourCompleted = localStorage.getItem(TOUR_DONE_KEY) === '1';
  } catch {}
  try {
    out.firstDecisionCompleted = localStorage.getItem(FIRST_DECISION_DONE_KEY) === '1';
  } catch {}
  try {
    out.firstRanchProblemCompleted = localStorage.getItem(RANCH_PROBLEM_DONE_KEY) === '1';
  } catch {}
  try {
    const p = localStorage.getItem(PRESTIGE_KEY);
    if (p !== null) out.prestige = Number(p);
  } catch {}
  try {
    const fc = localStorage.getItem(FENCE_CONSEQUENCE_KEY);
    if (fc === 'delayed' || fc === 'ignored') out.pendingFenceConsequence = fc;
    else out.pendingFenceConsequence = null;
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

  useEffect(() => {
    try {
      localStorage.setItem(TOUR_DONE_KEY, state.guidedTourCompleted ? '1' : '0');
    } catch {}
  }, [state.guidedTourCompleted]);

  useEffect(() => {
    try {
      localStorage.setItem(FIRST_DECISION_DONE_KEY, state.firstDecisionCompleted ? '1' : '0');
    } catch {}
  }, [state.firstDecisionCompleted]);

  useEffect(() => {
    try {
      localStorage.setItem(RANCH_PROBLEM_DONE_KEY, state.firstRanchProblemCompleted ? '1' : '0');
    } catch {}
  }, [state.firstRanchProblemCompleted]);

  useEffect(() => {
    try {
      localStorage.setItem(PRESTIGE_KEY, String(state.prestige));
    } catch {}
  }, [state.prestige]);

  useEffect(() => {
    try {
      localStorage.setItem(FENCE_CONSEQUENCE_KEY, state.pendingFenceConsequence ?? 'null');
    } catch {}
  }, [state.pendingFenceConsequence]);

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
  const completeTour = () =>
    dispatch({ type: 'COMPLETE_TOUR' });
  const triggerRanchProblem = () =>
    dispatch({ type: 'TRIGGER_RANCH_PROBLEM' });
  const startNewGame = () => {
    try { localStorage.removeItem(OPENING_DONE_KEY); } catch {}
    try { localStorage.removeItem(TOUR_DONE_KEY); } catch {}
    try { localStorage.removeItem(FIRST_DECISION_DONE_KEY); } catch {}
    try { localStorage.removeItem(RANCH_PROBLEM_DONE_KEY); } catch {}
    try { localStorage.removeItem(PRESTIGE_KEY); } catch {}
    try { localStorage.removeItem(FENCE_CONSEQUENCE_KEY); } catch {}
    try { localStorage.removeItem(DECISIONS_STORAGE_KEY); } catch {}
    dispatch({ type: 'NEW_GAME' });
  };

  return (
    <GameStateContext.Provider value={{
      state, advanceMonth: advance, dismissNotification, answerDialogue,
      completeTask, ignoreTask, resolveDecision,
      setActiveLocation, updateLocationCondition, addLocationNotification,
      clearLocationNotification, updateLocationOccupation, setPhase, addGameEvent,
      completeIntro, completeTour, triggerRanchProblem, startNewGame,
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
