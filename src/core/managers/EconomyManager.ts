import type { EconomyState } from '../../store/economyEngine';

/**
 * EconomyManager owns treasury access and monthly economy application.
 * Logic migration from store/economyEngine.ts planned for Alpha 0.3.
 */
export class EconomyManager {
  private economy: EconomyState;

  constructor(economy: EconomyState) {
    this.economy = { ...economy, history: [...economy.history] };
  }

  getTreasury(): number {
    return this.economy.treasury;
  }

  getEconomy(): EconomyState {
    return { ...this.economy, history: [...this.economy.history] };
  }

  /** Placeholder — full logic lives in economyEngine.ts until Alpha 0.3 migration. */
  applyMonthlyEconomy(): EconomyState {
    return this.getEconomy();
  }

  credit(amount: number): EconomyState {
    this.economy = { ...this.economy, treasury: this.economy.treasury + amount };
    return this.getEconomy();
  }

  debit(amount: number): EconomyState {
    this.economy = { ...this.economy, treasury: this.economy.treasury - amount };
    return this.getEconomy();
  }
}
