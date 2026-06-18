import type { GameEvent, Month } from '../types/gameState';

let _nextId = 1;

/**
 * EventManager owns game event creation and history retrieval.
 * Logic migration from store/gameState.tsx planned for Alpha 0.3.
 */
export class EventManager {
  private history: GameEvent[];

  constructor(history: GameEvent[]) {
    this.history = [...history];
  }

  getEventHistory(): GameEvent[] {
    return [...this.history];
  }

  createEvent(text: string, month: Month, year: number): GameEvent {
    const event: GameEvent = {
      id: `evt_${_nextId++}_${Date.now()}`,
      month,
      year,
      text,
    };
    this.history = [event, ...this.history];
    return event;
  }

  getRecent(count: number): GameEvent[] {
    return this.history.slice(0, count);
  }
}
