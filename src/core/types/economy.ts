/** Economy state — the financial position of the ganaderia at any point in time. */

export interface EconomyHistoryRecord {
  date: { month: string; year: number };
  income: number;
  expenses: number;
  profit: number;
  treasury: number;
  notes: string[];
}

export interface EconomyState {
  treasury: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  debt: number;
  payroll: number;
  feedingCosts: number;
  veterinaryCosts: number;
  maintenanceCosts: number;
  history: EconomyHistoryRecord[];
}
