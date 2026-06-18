import type { RanchHistoryEntry, HistoryCategory, HistoryImportance } from '../types/history';

let _nextId = 1;

/**
 * HistoryManager owns the Livro da Casa — the permanent record of ranch events.
 * Logic migration from store/gameState.tsx planned for Alpha 0.3.
 */
export class HistoryManager {
  private entries: RanchHistoryEntry[];

  constructor(entries: RanchHistoryEntry[] = []) {
    this.entries = [...entries];
  }

  getHistory(): RanchHistoryEntry[] {
    return [...this.entries];
  }

  getByCategory(category: HistoryCategory): RanchHistoryEntry[] {
    return this.entries.filter(e => e.category === category);
  }

  getByImportance(importance: HistoryImportance): RanchHistoryEntry[] {
    return this.entries.filter(e => e.importance === importance);
  }

  addEntry(entry: Omit<RanchHistoryEntry, 'id'>): RanchHistoryEntry {
    const record: RanchHistoryEntry = {
      ...entry,
      id: `hist_${_nextId++}_${Date.now()}`,
    };
    this.entries = [record, ...this.entries];
    return record;
  }

  getRecent(count: number): RanchHistoryEntry[] {
    return this.entries.slice(0, count);
  }
}
