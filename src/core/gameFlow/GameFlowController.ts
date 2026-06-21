import type { GameState } from '../../store/gameTypes';

// ── Flow step ─────────────────────────────────────────────────────────────────

export type GameFlowStep =
  | 'OPENING'
  | 'GUIDED_TOUR'
  | 'FIRST_DECISION'
  | 'NORMAL_GAME';

// ── Debug flags (read from URL params once at startup) ────────────────────────

export interface GameFlowDebugFlags {
  forceOpening: boolean;
  forceTour: boolean;
}

export function readDebugFlags(): GameFlowDebugFlags {
  const params = new URLSearchParams(window.location.search);
  return {
    forceOpening: params.get('intro') === 'true',
    forceTour:    params.get('tour')  === 'true',
  };
}

// ── Controller ────────────────────────────────────────────────────────────────
//
// Single function that determines what the player should see.
// All conditional rendering in the app must derive from this output.
//
// Flags are applied in sequence order — a force flag re-shows a completed step
// only when the player is still at or before that position in the flow.

export function getGameFlowStep(
  state: GameState,
  debug: GameFlowDebugFlags = { forceOpening: false, forceTour: false },
): GameFlowStep {
  if (!state.openingSequenceCompleted || debug.forceOpening) return 'OPENING';
  if (!state.guidedTourCompleted      || debug.forceTour)    return 'GUIDED_TOUR';
  if (!state.firstDecisionCompleted)                         return 'FIRST_DECISION';
  return 'NORMAL_GAME';
}
