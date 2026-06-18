import React, { createContext, useContext, useReducer } from 'react';
import type { Consequence } from '../types/consequence';
import { processConsequences, resolveConsequence } from '../services/consequenceService';

// ── State ─────────────────────────────────────────────────────────────────────

export interface ConsequenceState {
  consequences: Consequence[];
  showPanel: boolean;
}

// ── Actions ───────────────────────────────────────────────────────────────────

type ConsequenceAction =
  | { type: 'ADD_CONSEQUENCES'; items: Consequence[] }
  | { type: 'TRIGGER_MONTH'; month: string; year: number }
  | { type: 'RESOLVE_CONSEQUENCE'; id: string }
  | { type: 'SET_SHOW_PANEL'; show: boolean };

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: ConsequenceState, action: ConsequenceAction): ConsequenceState {
  switch (action.type) {
    case 'ADD_CONSEQUENCES':
      return { ...state, consequences: [...state.consequences, ...action.items] };
    case 'TRIGGER_MONTH':
      return {
        ...state,
        consequences: processConsequences(state.consequences, action.month, action.year),
      };
    case 'RESOLVE_CONSEQUENCE':
      return {
        ...state,
        consequences: resolveConsequence(state.consequences, action.id),
      };
    case 'SET_SHOW_PANEL':
      return { ...state, showPanel: action.show };
    default:
      return state;
  }
}

const INITIAL_STATE: ConsequenceState = {
  consequences: [],
  showPanel: false,
};

// ── Context ───────────────────────────────────────────────────────────────────

interface ConsequenceContextValue {
  state: ConsequenceState;
  addConsequences: (items: Consequence[]) => void;
  triggerMonth: (month: string, year: number) => void;
  resolveConsequence: (id: string) => void;
  setShowPanel: (show: boolean) => void;
}

const ConsequenceContext = createContext<ConsequenceContextValue | null>(null);

export const ConsequenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const addConsequences = (items: Consequence[]) =>
    dispatch({ type: 'ADD_CONSEQUENCES', items });
  const triggerMonth = (month: string, year: number) =>
    dispatch({ type: 'TRIGGER_MONTH', month, year });
  const resolveConsequenceById = (id: string) =>
    dispatch({ type: 'RESOLVE_CONSEQUENCE', id });
  const setShowPanel = (show: boolean) =>
    dispatch({ type: 'SET_SHOW_PANEL', show });

  return (
    <ConsequenceContext.Provider value={{
      state,
      addConsequences,
      triggerMonth,
      resolveConsequence: resolveConsequenceById,
      setShowPanel,
    }}>
      {children}
    </ConsequenceContext.Provider>
  );
};

export function useConsequences(): ConsequenceContextValue {
  const ctx = useContext(ConsequenceContext);
  if (!ctx) throw new Error('useConsequences must be used inside ConsequenceProvider');
  return ctx;
}

// ── Selectors ─────────────────────────────────────────────────────────────────

export function selectActiveConsequences(state: ConsequenceState) {
  return state.consequences.filter(c => c.triggered && !c.resolved);
}

export function selectHistory(state: ConsequenceState) {
  return state.consequences.filter(c => c.triggered && c.resolved);
}

export function selectPending(state: ConsequenceState) {
  return state.consequences.filter(c => !c.triggered);
}
