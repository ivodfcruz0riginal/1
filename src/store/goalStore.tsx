import React, { createContext, useContext, useReducer } from 'react';
import type { Goal } from '../types/goal';
import { INITIAL_GOALS } from '../data/goals';

// ── State ─────────────────────────────────────────────────────────────────────

export interface GoalState {
  goals: Goal[];
  pendingCompletion: Goal | null;
}

// ── Actions ───────────────────────────────────────────────────────────────────

type GoalAction =
  | { type: 'BATCH_UPDATE'; updates: Array<{ id: string; progress: number }>; now: { month: string; year: number } }
  | { type: 'DISMISS_COMPLETION' };

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: GoalState, action: GoalAction): GoalState {
  switch (action.type) {
    case 'BATCH_UPDATE': {
      let pendingCompletion = state.pendingCompletion;

      const goals = state.goals.map(goal => {
        const update = action.updates.find(u => u.id === goal.id);
        if (!update) return goal;

        const newProgress = Math.min(100, Math.max(0, Math.round(update.progress)));
        const justCompleted = !goal.completed && newProgress >= 100;

        const updated: Goal = {
          ...goal,
          progress: newProgress,
          completed: newProgress >= 100,
          completedDate: justCompleted ? action.now : goal.completedDate,
        };

        if (justCompleted && pendingCompletion === null) {
          pendingCompletion = updated;
        }

        return updated;
      });

      return { goals, pendingCompletion };
    }

    case 'DISMISS_COMPLETION':
      return { ...state, pendingCompletion: null };

    default:
      return state;
  }
}

const INITIAL_STATE: GoalState = {
  goals: INITIAL_GOALS,
  pendingCompletion: null,
};

// ── Context ───────────────────────────────────────────────────────────────────

interface GoalContextValue {
  state: GoalState;
  batchUpdateProgress: (
    updates: Array<{ id: string; progress: number }>,
    now: { month: string; year: number },
  ) => void;
  dismissCompletion: () => void;
}

const GoalContext = createContext<GoalContextValue | null>(null);

export const GoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const batchUpdateProgress = (
    updates: Array<{ id: string; progress: number }>,
    now: { month: string; year: number },
  ) => dispatch({ type: 'BATCH_UPDATE', updates, now });

  const dismissCompletion = () => dispatch({ type: 'DISMISS_COMPLETION' });

  return (
    <GoalContext.Provider value={{ state, batchUpdateProgress, dismissCompletion }}>
      {children}
    </GoalContext.Provider>
  );
};

export function useGoals(): GoalContextValue {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error('useGoals must be used inside GoalProvider');
  return ctx;
}

// ── Selectors ─────────────────────────────────────────────────────────────────

export function selectGoalsByTimeframe(state: GoalState, timeframe: Goal['timeframe']): Goal[] {
  return state.goals.filter(g => g.timeframe === timeframe);
}

export function selectCompletedGoals(state: GoalState): Goal[] {
  return state.goals.filter(g => g.completed);
}

export function selectActiveGoals(state: GoalState): Goal[] {
  return state.goals.filter(g => !g.completed);
}
