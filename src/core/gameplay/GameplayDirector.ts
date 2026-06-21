// ── GameplayPhase ─────────────────────────────────────────────────────────────

export enum GameplayPhase {
  WELCOME           = 'WELCOME',
  MORNING_REPORT    = 'MORNING_REPORT',
  PLANNING          = 'PLANNING',
  HERDADE           = 'HERDADE',
  OFFICE            = 'OFFICE',
  ANIMAL_MANAGEMENT = 'ANIMAL_MANAGEMENT',
  DECISION          = 'DECISION',
  MONTH_END         = 'MONTH_END',
  SIMULATION        = 'SIMULATION',
  REVIEW            = 'REVIEW',
}

// ── GameplayObjective ─────────────────────────────────────────────────────────

export interface GameplayObjective {
  /** Stable unique identifier. */
  id: string;
  /** Short action title shown in UI. */
  title: string;
  /** Longer explanation of what the player should do and why. */
  description: string;
  /** Lower number = higher priority. Objectives are served in ascending order. */
  priority: number;
  completed: boolean;
  /** Optional location key (BuildingKey / route) where the objective takes place. */
  location?: string;
}

// ── Default phase sequence ────────────────────────────────────────────────────

const PHASE_SEQUENCE: GameplayPhase[] = [
  GameplayPhase.WELCOME,
  GameplayPhase.MORNING_REPORT,
  GameplayPhase.PLANNING,
  GameplayPhase.HERDADE,
  GameplayPhase.OFFICE,
  GameplayPhase.ANIMAL_MANAGEMENT,
  GameplayPhase.DECISION,
  GameplayPhase.MONTH_END,
  GameplayPhase.SIMULATION,
  GameplayPhase.REVIEW,
];

// ── Fallback objective ────────────────────────────────────────────────────────

const FALLBACK_OBJECTIVE: GameplayObjective = {
  id: 'explore-herdade',
  title: 'Explorar a Herdade',
  description: 'Percorra os locais da herdade para descobrir o que precisa de atenção.',
  priority: 999,
  completed: false,
  location: '/herdade',
};

// ── Sample objectives ─────────────────────────────────────────────────────────

export const SAMPLE_OBJECTIVES: GameplayObjective[] = [
  {
    id: 'visit-office',
    title: 'Visitar o Escritório',
    description: 'Abra o escritório e consulte os registos e acontecimentos do mês.',
    priority: 1,
    completed: false,
    location: '/escritorio',
  },
  {
    id: 'inspect-currais',
    title: 'Inspecionar os Currais',
    description: 'Verifique o estado dos animais nos currais e confirme que não há problemas de saúde.',
    priority: 2,
    completed: false,
    location: 'currais',
  },
  {
    id: 'review-economy',
    title: 'Rever a Economia',
    description: 'Analise o estado da tesouraria e o balanço de receitas e despesas do período.',
    priority: 3,
    completed: false,
    location: '/economia',
  },
  {
    id: 'read-diary',
    title: 'Ler o Diário',
    description: 'Consulte o diário da herdade para acompanhar os acontecimentos recentes.',
    priority: 4,
    completed: false,
    location: '/escritorio',
  },
  {
    id: 'advance-month',
    title: 'Avançar o Mês',
    description: 'Todas as tarefas estão concluídas. Confirme o avanço para o próximo período.',
    priority: 5,
    completed: false,
    location: '/herdade',
  },
];

// ── GameplayDirector ──────────────────────────────────────────────────────────

/**
 * GameplayDirector manages gameplay flow and objective tracking.
 *
 * Responsibilities:
 *   - Track the current gameplay phase.
 *   - Maintain an ordered list of objectives.
 *   - Always provide a current objective (falls back to "Explore the Herdade").
 *   - Signal when the player is blocked with no available path.
 *
 * This class is UI-agnostic. Connect it to the store / components separately.
 */
export class GameplayDirector {
  private phase: GameplayPhase;
  private objectives: GameplayObjective[];

  constructor(
    initialPhase: GameplayPhase = GameplayPhase.WELCOME,
    objectives: GameplayObjective[] = [...SAMPLE_OBJECTIVES],
  ) {
    this.phase = initialPhase;
    this.objectives = objectives.map(o => ({ ...o }));
  }

  // ── Phase API ────────────────────────────────────────────────────────────

  /** Returns the director's current gameplay phase. */
  getCurrentPhase(): GameplayPhase {
    return this.phase;
  }

  /** Jumps directly to a specific phase. */
  setCurrentPhase(phase: GameplayPhase): void {
    this.phase = phase;
  }

  /**
   * Advances to the next phase in the canonical sequence.
   * Wraps from REVIEW back to MORNING_REPORT (start of a new month cycle).
   */
  advancePhase(): GameplayPhase {
    const currentIndex = PHASE_SEQUENCE.indexOf(this.phase);
    if (currentIndex === -1) {
      this.phase = GameplayPhase.MORNING_REPORT;
      return this.phase;
    }

    const nextIndex = (currentIndex + 1) % PHASE_SEQUENCE.length;
    // After REVIEW, cycle back to MORNING_REPORT (skip WELCOME for subsequent months)
    if (PHASE_SEQUENCE[nextIndex] === GameplayPhase.WELCOME) {
      this.phase = GameplayPhase.MORNING_REPORT;
    } else {
      this.phase = PHASE_SEQUENCE[nextIndex];
    }
    return this.phase;
  }

  // ── Objective API ────────────────────────────────────────────────────────

  /** Returns all objectives, sorted by priority. */
  getObjectives(): GameplayObjective[] {
    return [...this.objectives].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Returns the highest-priority incomplete objective.
   * If all objectives are complete or none exist, returns the fallback.
   */
  getCurrentObjective(): GameplayObjective {
    const sorted = this.getObjectives();
    const pending = sorted.find(o => !o.completed);
    return pending ?? { ...FALLBACK_OBJECTIVE };
  }

  /**
   * Marks an objective as completed by id.
   * Returns true if the objective was found and updated, false otherwise.
   */
  completeObjective(id: string): boolean {
    const target = this.objectives.find(o => o.id === id);
    if (!target) return false;
    target.completed = true;
    return true;
  }

  // ── Blocking detection ───────────────────────────────────────────────────

  /**
   * Returns true when the player is in a state where no interaction can
   * advance the game — for example, during the monthly simulation.
   *
   * The UI should surface a passive "waiting" message rather than an action
   * prompt when this returns true.
   */
  isGameplayBlocked(): boolean {
    return this.phase === GameplayPhase.SIMULATION;
  }
}
