import type { Decision } from '../../data/decisions';

/**
 * DecisionManager owns decision lifecycle: creation, queuing, and resolution.
 * Logic migration from store/gameState.tsx / data/decisions.ts planned for Alpha 0.3.
 */
export class DecisionManager {
  private pending: Decision | null;
  private resolvedIds: Set<string>;

  constructor(pending: Decision | null = null) {
    this.pending = pending;
    this.resolvedIds = new Set();
  }

  getPending(): Decision | null {
    return this.pending;
  }

  hasPending(): boolean {
    return this.pending !== null;
  }

  createDecision(decision: Decision): void {
    if (!this.pending) {
      this.pending = decision;
    }
  }

  resolveDecision(choiceId: string): Decision | null {
    const resolved = this.pending;
    if (resolved) {
      this.resolvedIds.add(resolved.id);
    }
    this.pending = null;
    return resolved;
  }

  wasResolved(decisionId: string): boolean {
    return this.resolvedIds.has(decisionId);
  }
}
