import { useMemo } from 'react';
import { useGameState } from '../store/gameState';
import { GameplayDirector } from '../core/directors/GameplayDirector';
import type { DirectorPhase, Objective } from '../core/directors/GameplayDirector';

export interface GameplayDirectorState {
  phase: DirectorPhase;
  objective: Objective;
  isBlocked: boolean;
}

export function useGameplayDirector(): GameplayDirectorState {
  const { state } = useGameState();

  return useMemo(() => {
    const director = new GameplayDirector(state);
    return {
      phase:     director.getCurrentPhase(),
      objective: director.getNextObjective(),
      isBlocked: director.isPlayerBlocked(),
    };
  }, [state]);
}
