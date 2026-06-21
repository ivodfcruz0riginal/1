import type { GameState } from '../../store/gameState';

// ── Public types ──────────────────────────────────────────────────────────────

/** High-level phases the director recognises, independent of the store's GamePhase. */
export type DirectorPhase =
  | 'Welcome'
  | 'MorningBriefing'
  | 'Planning'
  | 'EstateManagement'
  | 'Decision'
  | 'MonthlySimulation'
  | 'Review'
  | 'Repeat';

export type ObjectivePriority = 'urgent' | 'normal' | 'optional';

export interface Objective {
  text: string;
  hint: string;
  priority: ObjectivePriority;
}

// ── Director ──────────────────────────────────────────────────────────────────

/**
 * GameplayDirector — pure logic, no side-effects.
 *
 * Receives a snapshot of GameState and exposes guidance methods.
 * It never dispatches actions or mutates state.
 */
export class GameplayDirector {
  constructor(private readonly state: GameState) {}

  // ── Phase ──────────────────────────────────────────────────────────────────

  getCurrentPhase(): DirectorPhase {
    const { phase, year, month, pendingDialogue, pendingDecision, dailyTasks } = this.state;

    // Very first moments of the game
    if (year === 1985 && month === 'Março' && pendingDialogue !== null && this.state.dialogueHistory.length === 0) {
      return 'Welcome';
    }

    if (pendingDecision !== null) return 'Decision';
    if (pendingDialogue !== null) return 'MorningBriefing';

    if (phase === 'EndOfMonth' || phase === 'Simulation') return 'MonthlySimulation';

    if (phase === 'DailyPlanning') return 'Planning';

    // EstateManagement — check if work is done
    const stillPending = dailyTasks.some(t => t.status === 'pending');
    const hasNotifications = Object.keys(this.state.notifications).length > 0;
    if (!stillPending && !hasNotifications) return 'Review';

    return 'EstateManagement';
  }

  // ── Objective ──────────────────────────────────────────────────────────────

  getNextObjective(): Objective {
    const phase = this.getCurrentPhase();

    switch (phase) {
      case 'Welcome':
        return {
          text: 'Falar com o Maioral',
          hint: 'Manuel aguarda junto ao Escritório com novidades sobre a herdade.',
          priority: 'urgent',
        };

      case 'MorningBriefing':
        return {
          text: 'Ouvir o relatório do mês',
          hint: 'O Maioral tem o balanço do período pronto a apresentar.',
          priority: 'urgent',
        };

      case 'Decision': {
        const title = this.state.pendingDecision?.title ?? 'Assunto pendente';
        return {
          text: 'Tomar uma decisão',
          hint: `"${title}" aguarda a sua resposta.`,
          priority: 'urgent',
        };
      }

      case 'Planning': {
        const pending = this.state.dailyTasks.filter(t => t.status === 'pending');
        if (pending.length > 0) {
          return {
            text: pending[0].label,
            hint: `${pending.length} ordem${pending.length > 1 ? 's' : ''} por cumprir. Clique para avançar.`,
            priority: 'normal',
          };
        }
        return {
          text: 'Visitar um local da herdade',
          hint: 'Entre num edifício ou cercado para começar o dia.',
          priority: 'normal',
        };
      }

      case 'EstateManagement': {
        // Prioritise buildings with active notifications
        const notifEntries = Object.entries(this.state.notifications);
        if (notifEntries.length > 0) {
          const [key, notif] = notifEntries[0];
          const names: Record<string, string> = {
            escritorio: 'Escritório',
            tentadero: 'Tentadero',
            currais: 'Currais',
            embarque: 'Parque de Embarque',
            cercado_norte: 'Cercado Norte',
            cercado_sul: 'Cercado Sul',
            casa: 'Casa Principal',
          };
          return {
            text: `Verificar ${names[key] ?? key}`,
            hint: notif.label,
            priority: 'normal',
          };
        }
        // Next pending task
        const pending = this.state.dailyTasks.filter(t => t.status === 'pending');
        if (pending.length > 0) {
          return {
            text: pending[0].label,
            hint: `${pending.length} tarefa${pending.length > 1 ? 's' : ''} por concluir hoje.`,
            priority: 'normal',
          };
        }
        return {
          text: 'Avançar o mês',
          hint: 'A herdade está em ordem. Use o botão no cabeçalho.',
          priority: 'normal',
        };
      }

      case 'Review':
        return {
          text: 'Avançar o mês',
          hint: 'Todas as tarefas cumpridas. O novo mês aguarda.',
          priority: 'normal',
        };

      case 'MonthlySimulation':
        return {
          text: 'Aguardar a simulação',
          hint: 'A natureza actua. Os resultados do mês estão a ser calculados.',
          priority: 'optional',
        };

      case 'Repeat':
      default:
        return {
          text: 'Iniciar o novo mês',
          hint: 'Ouça o Maioral e defina as prioridades do período.',
          priority: 'normal',
        };
    }
  }

  // ── Blocking check ─────────────────────────────────────────────────────────

  /**
   * Returns true when the player cannot progress without a specific interaction.
   * Used by the UI to emphasise the objective card.
   */
  isPlayerBlocked(): boolean {
    const phase = this.getCurrentPhase();
    return phase === 'Welcome' || phase === 'MorningBriefing' || phase === 'Decision';
  }

  // ── Phase advancement ──────────────────────────────────────────────────────

  /**
   * The director does not execute actions — phase advancement is the
   * responsibility of the game state reducer.
   * This method exists for interface completeness.
   */
  advancePhase(): void {
    // no-op: dispatch { type: 'ADVANCE_MONTH' } or 'ANSWER_DIALOGUE' etc. from the UI layer.
  }
}
