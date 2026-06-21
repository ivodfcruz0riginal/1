import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  INITIAL_ECONOMY,
  type EconomyState,
} from './economyEngine';
import { animals as initialAnimals } from '../data/animals';
import { INITIAL_STAFF } from '../data/staff';
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
  resetPastureAfterRepair,
} from '../services/locationService';
import { simulateMonth } from '../core/simulation/SimulationEngine';
import type { WeatherState } from '../types/weather';
import { FIRST_CONTRACT_OFFER, nextContractInstanceId } from '../data/contracts';

const INITIAL_WEATHER: WeatherState = {
  type: 'cloudy',
  icon: '⛅',
  temp: '18°C',
  desc: 'Sol e nuvens',
  pastureQualityDelta: 1,
  waterLevelDelta: 1,
  feedingCostMod: 1.00,
  hydrationDelta: 0,
  stressDelta: 0,
  fatigueDelta: 0,
};

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
  ConsequenceEntry,
  Location,
  LocationId,
  LocationCondition,
  LocationNotification,
  StaffMember,
  WeatherState,
  BullightContract,
  ContractOffer,
  SimulationTrace,
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
  ConsequenceEntry,
  GameState,
  GameAction,
  LocationId,
  LocationCondition,
  LocationNotification,
  Decision,
  BullightContract,
  ContractOffer,
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
  const simOutput = simulateMonth(state);
  const next = simOutput.state;
  const newSimMonths = (state.simulatedMonths ?? 0) + 1;

  // Check first contract trigger: after 2 months, onboarding done, prestige > 0, >= 2 suitable bulls, not yet offered
  const shouldOfferFirstContract =
    !next.firstContractOffered &&
    next.openingSequenceCompleted &&
    newSimMonths >= 2 &&
    next.prestige > 0 &&
    next.animals.filter(
      a =>
        a.sex === 'Macho' &&
        a.status === 'Ativo' &&
        (a.category === 'Macho de Corrida' || a.category === 'Novilho' || a.category === 'Semental' || a.category === 'Utrero'),
    ).length >= 2;

  const pendingContract = shouldOfferFirstContract
    ? { ...FIRST_CONTRACT_OFFER, performanceYear: next.year }
    : next.pendingContract;

  return {
    ...next,
    simulatedMonths: newSimMonths,
    pendingContract,
    firstContractOffered: next.firstContractOffered || shouldOfferFirstContract,
    lastSimulationTrace: simOutput.trace,
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
        dialogueHistory: [record, ...state.dialogueHistory].slice(0, 100),
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
        decisionHistory: [record, ...state.decisionHistory].slice(0, 100),
        phase: computePhase(state.pendingDialogue, null, state.hasOpenedBuildingThisMonth),
        firstDecisionCompleted: true,
      };

      // ── Consequence chain helpers ───────────────────────────────────────────
      // Find the root instance id for a given decisionId in the history.
      // After decisionHistory is updated, the newest record is index 0.
      const findOriginId = (decisionId: string): string => {
        const found = next.decisionHistory.find(r => r.decisionId === decisionId);
        return found?.instanceId ?? record.instanceId;
      };

      const addConsequence = (
        originInstanceId: string,
        text: string,
        severity: ConsequenceEntry['severity'],
        resolved: boolean,
      ): ConsequenceEntry => ({
        id: nextId(),
        originDecisionInstanceId: originInstanceId,
        month: state.month,
        year: state.year,
        text,
        severity,
        resolved,
      });

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
          // Repaired immediately — chain closed
          const ce = addConsequence(record.instanceId, 'Vedação reparada imediatamente. Sem consequências futuras.', 'info', true);
          next = { ...next, consequenceChain: [ce, ...next.consequenceChain].slice(0, 50) };
          const withoutNotif = { ...next.notifications };
          delete withoutNotif.cercado_norte;
          next = {
            ...next,
            economy: { ...next.economy, treasury: next.economy.treasury - 1500 },
            notifications: withoutNotif,
            locations: clearLocationNotification(
              resetPastureAfterRepair(next.locations, 'cercado_norte'),
              'cercado_norte',
              'BrokenFence',
            ),
          };
        } else {
          // choices 1 (adiar) and 2 (ignorar) start the chain
          const severity: ConsequenceEntry['severity'] = choiceIdx === 1 ? 'warning' : 'critical';
          const text = choiceIdx === 1
            ? 'Reparação adiada. A vedação continuou a deteriorar-se.'
            : 'Problema ignorado. A vedação ficou sem reparação.';
          const ce = addConsequence(record.instanceId, text, severity, false);
          next = {
            ...next,
            pendingFenceConsequence: choiceIdx === 1 ? 'delayed' : 'ignored',
            consequenceChain: [ce, ...next.consequenceChain].slice(0, 50),
          };
        }
      }

      // Fence deterioration consequence (inf_02)
      if (state.pendingDecision.id === 'inf_02') {
        // Link to the original inf_01 instance
        const originId = findOriginId('inf_01');
        const diaryTexts = [
          'Vedação do Cercado Norte reparada. Custo: 2.000€.',
          'Reparação adiada novamente. O risco é agora muito elevado.',
        ];
        const ev: GameEvent = { id: nextId(), month: state.month, year: state.year, text: diaryTexts[choiceIdx] ?? diaryTexts[1] };
        next = { ...next, eventLog: [ev, ...next.eventLog].slice(0, 20) };

        if (choiceIdx === 0) {
          // Repaired now — chain closes
          const ce = addConsequence(originId, 'Vedação reparada ao segundo aviso. Custo adicional: 2.000€.', 'warning', true);
          next = {
            ...next,
            consequenceChain: [ce, ...next.consequenceChain].slice(0, 50),
          };
          const withoutNotif = { ...next.notifications };
          delete withoutNotif.cercado_norte;
          next = {
            ...next,
            economy: { ...next.economy, treasury: next.economy.treasury - 2000 },
            notifications: withoutNotif,
            locations: clearLocationNotification(
              resetPastureAfterRepair(next.locations, 'cercado_norte'),
              'cercado_norte',
              'BrokenFence',
            ),
          };
        } else {
          // Escalate — chain continues
          const ce = addConsequence(originId, 'Segunda reparação adiada. Fuga de animais iminente.', 'critical', false);
          next = {
            ...next,
            pendingFenceConsequence: 'ignored',
            consequenceChain: [ce, ...next.consequenceChain].slice(0, 50),
          };
        }
      }

      // Animal escape consequence (inf_03)
      if (state.pendingDecision.id === 'inf_03') {
        const originId = findOriginId('inf_01');
        // Livro da Casa: record the escape event
        const escapeEv: GameEvent = { id: nextId(), month: state.month, year: state.year, text: 'Dois novilhos fugiram do Cercado Norte durante a noite.' };
        const diaryTexts = [
          'Dois novilhos encontrados após fuga do Cercado Norte. Custo: 1.000€.',
          'Campinos extra chamados. Animais recuperados e vedação reparada. Custo: 2.500€.',
          'Fuga no Cercado Norte sem resposta adequada. Reputação afectada.',
        ];
        const choiceEv: GameEvent = { id: nextId(), month: state.month, year: state.year, text: diaryTexts[choiceIdx] ?? diaryTexts[2] };
        next = { ...next, eventLog: [choiceEv, escapeEv, ...next.eventLog].slice(0, 20) };

        const ceTexts = [
          'Dois novilhos fugiram. Animais recuperados após busca. Custo: 1.000€.',
          'Fuga no Cercado Norte. Campinos extra chamados. Custo: 2.500€. Reputação preservada.',
          'Fuga ignorada. Reputação da casa sofreu -5 de prestígio.',
        ];
        const ceSeverity: ConsequenceEntry['severity'][] = ['warning', 'warning', 'critical'];
        const ce = addConsequence(originId, ceTexts[choiceIdx] ?? ceTexts[2], ceSeverity[choiceIdx] ?? 'critical', true);
        next = { ...next, consequenceChain: [ce, ...next.consequenceChain].slice(0, 50) };

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
              resetPastureAfterRepair(next.locations, 'cercado_norte'),
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
    case 'PIN_OBJECTIVE':
      return { ...state, pinnedObjective: action.text };
    case 'RESPOND_CONTRACT': {      if (!state.pendingContract) return state;
      const offer: ContractOffer = state.pendingContract;

      // Find 2 suitable active bulls not already reserved
      const reservedIds = new Set(
        state.contracts.flatMap(c => c.reservedAnimalIds),
      );
      const suitableBulls = state.animals.filter(
        a =>
          a.sex === 'Macho' &&
          a.status === 'Ativo' &&
          !reservedIds.has(a.id) &&
          (a.category === 'Macho de Corrida' || a.category === 'Novilho' || a.category === 'Semental' || a.category === 'Utrero'),
      );
      const chosen = suitableBulls.slice(0, offer.bullsRequired);

      if (action.choice === 'decline') {
        const ev: GameEvent = {
          id: nextId(), month: state.month, year: state.year,
          text: `Proposta da Praça de ${offer.city} recusada. Oportunidade perdida.`,
        };
        return {
          ...state,
          pendingContract: null,
          prestige: Math.max(0, state.prestige - 1),
          eventLog: [ev, ...state.eventLog].slice(0, 20),
        };
      }

      // negotiate: 50% chance of +20% payment
      let finalPayment = offer.basePayment;
      let negotiateText = '';
      if (action.choice === 'negotiate') {
        if (Math.random() < 0.5) {
          finalPayment = Math.round(offer.basePayment * 1.2);
          negotiateText = ` Negociação bem-sucedida: valor aumentado para ${finalPayment.toLocaleString('pt-PT')}€.`;
        } else {
          negotiateText = ' Negociação sem resultado. Contrato ao valor original.';
        }
      }

      const instanceId = nextContractInstanceId();
      const contract: BullightContract = {
        id: offer.contractId,
        instanceId,
        placeId: offer.city.toLowerCase(),
        placeName: offer.placeName,
        city: offer.city,
        performanceMonth: offer.performanceMonth,
        performanceYear: offer.performanceYear,
        bullsRequired: offer.bullsRequired,
        basePayment: offer.basePayment,
        negotiatedPayment: finalPayment,
        reservedAnimalIds: chosen.map(a => a.id),
        status: 'Aceite',
        offeredMonth: state.month,
        offeredYear: state.year,
        acceptedMonth: state.month,
        acceptedYear: state.year,
        letterText: offer.letterText,
        isFirstContract: offer.isFirstContract,
      };

      const diaryText = offer.isFirstContract
        ? `Primeiro contrato aceite: ${offer.bullsRequired} toiros para a ${offer.placeName} em ${offer.performanceMonth}.${negotiateText}`
        : `Contrato aceite: ${offer.bullsRequired} toiros para a ${offer.placeName} em ${offer.performanceMonth}.${negotiateText}`;

      const ev: GameEvent = {
        id: nextId(), month: state.month, year: state.year,
        text: diaryText,
      };

      // Notify economy: add expected payment to treasury as advance
      const advance = Math.round(finalPayment * 0.3);
      return {
        ...state,
        pendingContract: null,
        contracts: [contract, ...state.contracts],
        economy: { ...state.economy, treasury: state.economy.treasury + advance },
        eventLog: [ev, ...state.eventLog].slice(0, 20),
      };
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
      return { ...INITIAL_STATE, openingSequenceCompleted: false, guidedTourCompleted: false, firstDecisionCompleted: false, firstRanchProblemCompleted: false, prestige: 42, pendingFenceConsequence: null, lastSimulationTrace: null, consequenceChain: [], pinnedObjective: null };
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
  staff: INITIAL_STAFF,
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
  weather: INITIAL_WEATHER,
  contracts: [],
  pendingContract: null,
  firstContractOffered: false,
  simulatedMonths: 0,
  lastSimulationTrace: null,
  consequenceChain: [],
  pinnedObjective: null,
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
  respondContract: (choice: 'accept' | 'negotiate' | 'decline') => void;
  pinObjective: (text: string | null) => void;
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
const ANIMALS_KEY = 'herdade_animals';
const LOCATIONS_KEY = 'herdade_locations';
const STAFF_KEY = 'herdade_staff';
const WEATHER_KEY = 'herdade_weather';
const CONTRACTS_KEY = 'herdade_contracts';
const CONTRACT_FLAGS_KEY = 'herdade_contract_flags';
const CONSEQUENCE_CHAIN_KEY = 'herdade_consequence_chain';
const PINNED_OBJECTIVE_KEY = 'herdade_pinned_objective';
const DATE_KEY = 'herdade_date';
const ECONOMY_KEY = 'herdade_economy';
const EVENT_LOG_KEY = 'herdade_event_log';
const PENDING_DECISION_KEY = 'herdade_pending_decision';
const PENDING_DIALOGUE_KEY = 'herdade_pending_dialogue';
const DIALOGUE_HISTORY_KEY = 'herdade_dialogue_history';

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
  try {
    const raw = localStorage.getItem(ANIMALS_KEY);
    if (raw) out.animals = JSON.parse(raw);
  } catch {}
  try {
    const raw = localStorage.getItem(LOCATIONS_KEY);
    if (raw) out.locations = JSON.parse(raw);
  } catch {}
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    if (raw) out.staff = JSON.parse(raw);
  } catch {}
  try {
    const raw = localStorage.getItem(WEATHER_KEY);
    if (raw) out.weather = JSON.parse(raw) as WeatherState;
  } catch {}
  try {
    const raw = localStorage.getItem(CONTRACTS_KEY);
    if (raw) out.contracts = JSON.parse(raw) as BullightContract[];
  } catch {}
  try {
    const raw = localStorage.getItem(CONTRACT_FLAGS_KEY);
    if (raw) {
      const flags = JSON.parse(raw) as { firstContractOffered: boolean; simulatedMonths: number };
      out.firstContractOffered = flags.firstContractOffered ?? false;
      out.simulatedMonths = flags.simulatedMonths ?? 0;
    }
  } catch {}
  try {
    const raw = localStorage.getItem(CONSEQUENCE_CHAIN_KEY);
    if (raw) out.consequenceChain = JSON.parse(raw) as ConsequenceEntry[];
  } catch {}
  try {
    const raw = localStorage.getItem(PINNED_OBJECTIVE_KEY);
    if (raw !== null) out.pinnedObjective = raw === 'null' ? null : raw;
  } catch {}
  try {
    const raw = localStorage.getItem(DATE_KEY);
    if (raw) {
      const { month, year } = JSON.parse(raw) as { month: Month; year: number };
      out.month = month;
      out.year = year;
      out.season = SEASON_MAP[month];
    }
  } catch {}
  try {
    const raw = localStorage.getItem(ECONOMY_KEY);
    if (raw) out.economy = JSON.parse(raw) as EconomyState;
  } catch {}
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    if (raw) out.eventLog = JSON.parse(raw) as GameEvent[];
  } catch {}
  try {
    const raw = localStorage.getItem(PENDING_DECISION_KEY);
    if (raw !== null) out.pendingDecision = JSON.parse(raw) as Decision | null;
  } catch {}
  try {
    const raw = localStorage.getItem(PENDING_DIALOGUE_KEY);
    if (raw !== null) out.pendingDialogue = JSON.parse(raw) as DialogueTemplate | null;
  } catch {}
  try {
    const raw = localStorage.getItem(DIALOGUE_HISTORY_KEY);
    if (raw) out.dialogueHistory = JSON.parse(raw) as DialogueRecord[];
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

  useEffect(() => {
    try {
      localStorage.setItem(ANIMALS_KEY, JSON.stringify(state.animals));
    } catch {}
  }, [state.animals]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCATIONS_KEY, JSON.stringify(state.locations));
    } catch {}
  }, [state.locations]);

  useEffect(() => {
    try {
      localStorage.setItem(STAFF_KEY, JSON.stringify(state.staff));
    } catch {}
  }, [state.staff]);

  useEffect(() => {
    try {
      localStorage.setItem(WEATHER_KEY, JSON.stringify(state.weather));
    } catch {}
  }, [state.weather]);

  useEffect(() => {
    try {
      localStorage.setItem(CONTRACTS_KEY, JSON.stringify(state.contracts));
    } catch {}
  }, [state.contracts]);

  useEffect(() => {
    try {
      localStorage.setItem(CONTRACT_FLAGS_KEY, JSON.stringify({
        firstContractOffered: state.firstContractOffered,
        simulatedMonths: state.simulatedMonths,
      }));
    } catch {}
  }, [state.firstContractOffered, state.simulatedMonths]);

  useEffect(() => {
    try {
      localStorage.setItem(CONSEQUENCE_CHAIN_KEY, JSON.stringify(state.consequenceChain));
    } catch {}
  }, [state.consequenceChain]);

  useEffect(() => {
    try {
      localStorage.setItem(PINNED_OBJECTIVE_KEY, state.pinnedObjective ?? 'null');
    } catch {}
  }, [state.pinnedObjective]);

  useEffect(() => {
    try {
      localStorage.setItem(DATE_KEY, JSON.stringify({ month: state.month, year: state.year }));
    } catch {}
  }, [state.month, state.year]);

  useEffect(() => {
    try {
      localStorage.setItem(ECONOMY_KEY, JSON.stringify(state.economy));
    } catch {}
  }, [state.economy]);

  useEffect(() => {
    try {
      localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(state.eventLog));
    } catch {}
  }, [state.eventLog]);

  useEffect(() => {
    try {
      localStorage.setItem(PENDING_DECISION_KEY, JSON.stringify(state.pendingDecision));
    } catch {}
  }, [state.pendingDecision]);

  useEffect(() => {
    try {
      localStorage.setItem(PENDING_DIALOGUE_KEY, JSON.stringify(state.pendingDialogue));
    } catch {}
  }, [state.pendingDialogue]);

  useEffect(() => {
    try {
      localStorage.setItem(DIALOGUE_HISTORY_KEY, JSON.stringify(state.dialogueHistory.slice(0, 100)));
    } catch {}
  }, [state.dialogueHistory]);

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
  const respondContract = (choice: 'accept' | 'negotiate' | 'decline') =>
    dispatch({ type: 'RESPOND_CONTRACT', choice });
  const pinObjective = (text: string | null) =>
    dispatch({ type: 'PIN_OBJECTIVE', text });
  const startNewGame = () => {
    try { localStorage.removeItem(OPENING_DONE_KEY); } catch {}
    try { localStorage.removeItem(TOUR_DONE_KEY); } catch {}
    try { localStorage.removeItem(FIRST_DECISION_DONE_KEY); } catch {}
    try { localStorage.removeItem(RANCH_PROBLEM_DONE_KEY); } catch {}
    try { localStorage.removeItem(PRESTIGE_KEY); } catch {}
    try { localStorage.removeItem(FENCE_CONSEQUENCE_KEY); } catch {}
    try { localStorage.removeItem(ANIMALS_KEY); } catch {}
    try { localStorage.removeItem(LOCATIONS_KEY); } catch {}
    try { localStorage.removeItem(STAFF_KEY); } catch {}
    try { localStorage.removeItem(WEATHER_KEY); } catch {}
    try { localStorage.removeItem(CONTRACTS_KEY); } catch {}
    try { localStorage.removeItem(CONTRACT_FLAGS_KEY); } catch {}
    try { localStorage.removeItem(DECISIONS_STORAGE_KEY); } catch {}
    try { localStorage.removeItem(CONSEQUENCE_CHAIN_KEY); } catch {}
    try { localStorage.removeItem(PINNED_OBJECTIVE_KEY); } catch {}
    try { localStorage.removeItem(DATE_KEY); } catch {}
    try { localStorage.removeItem(ECONOMY_KEY); } catch {}
    try { localStorage.removeItem(EVENT_LOG_KEY); } catch {}
    try { localStorage.removeItem(PENDING_DECISION_KEY); } catch {}
    try { localStorage.removeItem(PENDING_DIALOGUE_KEY); } catch {}
    try { localStorage.removeItem(DIALOGUE_HISTORY_KEY); } catch {}
    dispatch({ type: 'NEW_GAME' });
  };

  return (
    <GameStateContext.Provider value={{
      state, advanceMonth: advance, dismissNotification, answerDialogue,
      completeTask, ignoreTask, resolveDecision,
      setActiveLocation, updateLocationCondition, addLocationNotification,
      clearLocationNotification, updateLocationOccupation, setPhase, addGameEvent,
      completeIntro, completeTour, triggerRanchProblem, respondContract, pinObjective, startNewGame,
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
