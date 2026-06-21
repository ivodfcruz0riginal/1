import { SAVE_KEY, SAVE_VERSION } from './saveVersion';

/** The envelope written to localStorage. */
export interface SaveFile<T = unknown> {
  version: string;
  saveDate: string;
  gameState: T;
}

/**
 * PersistenceManager handles all save/load operations for the simulation.
 *
 * Generic over T so it can be used with any state shape. The default
 * singleton (see bottom of file) is pre-configured with the active save key
 * and version string.
 *
 * Wiring to game actions (auto-save on ADVANCE_MONTH, RESOLVE_DECISION, etc.)
 * is handled at store level — this class only owns I/O.
 */
export class PersistenceManager<T = unknown> {
  private readonly key: string;
  private readonly version: string;

  constructor(key: string = SAVE_KEY, version: string = SAVE_VERSION) {
    this.key = key;
    this.version = version;
  }

  /** Persist gameState to localStorage under the versioned envelope. */
  saveGame(gameState: T): void {
    try {
      const file: SaveFile<T> = {
        version: this.version,
        saveDate: new Date().toISOString(),
        gameState,
      };
      localStorage.setItem(this.key, JSON.stringify(file));
    } catch {
      // Storage quota exceeded or unavailable — fail silently, never crash.
    }
  }

  /**
   * Load the saved gameState.
   * Returns null if no save exists, storage is unavailable, or the version
   * is incompatible with the running build.
   */
  loadGame(): T | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const file = JSON.parse(raw) as SaveFile<T>;
      if (file.version !== this.version) return null;
      return file.gameState ?? null;
    } catch {
      return null;
    }
  }

  /** Remove the save from storage. */
  deleteSave(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {}
  }

  /**
   * Returns true when a valid, version-compatible save is present.
   * Does NOT load the state — use loadGame() for that.
   */
  hasSave(): boolean {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return false;
      const file = JSON.parse(raw) as SaveFile<T>;
      return file.version === this.version && file.gameState != null;
    } catch {
      return false;
    }
  }

  /**
   * Export the raw save JSON string for download or clipboard sharing.
   * Returns null if nothing is saved or storage is unavailable.
   */
  exportSave(): string | null {
    try {
      return localStorage.getItem(this.key);
    } catch {
      return null;
    }
  }

  /**
   * Import a save from a JSON string (e.g. from a file the player uploaded).
   * Validates version compatibility, writes to storage, and returns the state.
   * Returns null and makes no changes if the string is malformed or incompatible.
   */
  importSave(json: string): T | null {
    try {
      const file = JSON.parse(json) as SaveFile<T>;
      if (file.version !== this.version || file.gameState == null) return null;
      this.saveGame(file.gameState);
      return file.gameState;
    } catch {
      return null;
    }
  }
}

/** Shared singleton — use this unless you need a custom key or version. */
export const persistenceManager = new PersistenceManager();
