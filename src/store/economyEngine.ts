import type { Month, Season, GameEvent } from './gameTypes';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MonthlyRecord {
  id: string;
  month: Month;
  year: number;
  income: number;
  expenses: number;
  profit: number;
  treasury: number;
  events: string[];
}

export interface EconomyState {
  treasury: number;
  history: MonthlyRecord[]; // newest first, max 60
}

export interface IncomeBreakdown {
  subsidies: number;
  animalSales: number;
  agricultural: number;
  ranchVisits: number;
}

export interface ExpensesBreakdown {
  salaries: number;
  feeding: number;
  veterinary: number;
  maintenance: number;
  water: number;
  electricity: number;
}

// ── Base monthly values (€) ──────────────────────────────────────────────────

const BASE_EXPENSES: ExpensesBreakdown = {
  salaries: 8_500,
  feeding: 4_200,
  veterinary: 1_800,
  maintenance: 1_200,
  water: 600,
  electricity: 400,
};

const BASE_INCOME: IncomeBreakdown = {
  subsidies: 3_500,
  animalSales: 0,
  agricultural: 2_800,
  ranchVisits: 800,
};

// ── Random events pool ────────────────────────────────────────────────────────

export interface EconomicEvent {
  text: string;
  expenseMultipliers?: Partial<Record<keyof ExpensesBreakdown, number>>;
  incomeBonus?: number;
  expenseBonus?: number;
}

const ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    text: 'Seca prolongada — custo de alimentação aumentou 20%.',
    expenseMultipliers: { feeding: 1.2 },
  },
  {
    text: 'Chuvas intensas — qualidade das pastagens melhora 15%.',
    expenseMultipliers: { feeding: 0.85 },
  },
  {
    text: 'Inspeção veterinária obrigatória — custos veterinários elevados.',
    expenseMultipliers: { veterinary: 1.5 },
  },
  {
    text: 'Subsídio governamental recebido — €5.000 adicionados.',
    incomeBonus: 5_000,
  },
  {
    text: 'Danos nas vedações — custo de manutenção duplicou.',
    expenseMultipliers: { maintenance: 2.0 },
  },
  {
    text: 'Venda de dois novilhos — receita adicional de €3.200.',
    incomeBonus: 3_200,
  },
  {
    text: 'Avaria no sistema de água — custos de água aumentados.',
    expenseMultipliers: { water: 2.5 },
  },
  {
    text: 'Grupo de visitantes internacionais — receita de visitas triplicou.',
    expenseMultipliers: {},
    incomeBonus: 1_600,
  },
  {
    text: 'Época de partos — custos veterinários acrescidos.',
    expenseMultipliers: { veterinary: 1.3 },
  },
  {
    text: 'Contratação sazonal — salários aumentaram este mês.',
    expenseMultipliers: { salaries: 1.15 },
  },
  {
    text: 'Incêndio de pequena dimensão — custos de manutenção aumentados.',
    expenseMultipliers: { maintenance: 1.8 },
  },
  {
    text: 'Mês sem eventos económicos extraordinários.',
  },
];

// ── Seasonal modifiers ────────────────────────────────────────────────────────

const SEASON_FEEDING_MOD: Record<Season, number> = {
  Primavera: 0.85, // good pastures
  Verão: 1.15,     // drought risk
  Outono: 0.95,
  Inverno: 1.20,   // hay needed
};

const SEASON_INCOME_MOD: Record<Season, number> = {
  Primavera: 1.1,
  Verão: 1.2,  // visit season
  Outono: 1.0,
  Inverno: 0.85,
};

// ── Monthly animal-sale chance ────────────────────────────────────────────────

function rollAnimalSales(month: Month): number {
  // Higher chance in spring/autumn (fair seasons)
  const fairMonths: Month[] = ['Março', 'Abril', 'Setembro', 'Outubro'];
  const chance = fairMonths.includes(month) ? 0.4 : 0.2;
  if (Math.random() < chance) {
    return Math.floor(Math.random() * 3 + 1) * 1_800; // 1-3 animals
  }
  return 0;
}

// ── Core calculation ──────────────────────────────────────────────────────────

export function calculateMonth(
  month: Month,
  year: number,
  season: Season,
  currentTreasury: number,
  pastureMod = 1.0, // feeding cost modifier from pasture quality (0.85–1.30)
): {
  record: MonthlyRecord;
  newTreasury: number;
} {
  // Pick a random economic event (30% chance of a non-neutral event)
  const eventIdx = Math.random() < 0.3
    ? Math.floor(Math.random() * (ECONOMIC_EVENTS.length - 1))
    : ECONOMIC_EVENTS.length - 1; // neutral
  const ecoEvent = ECONOMIC_EVENTS[eventIdx];

  // Compute expenses with seasonal + pasture + event modifiers
  const feedingMod = (ecoEvent.expenseMultipliers?.feeding ?? 1) * SEASON_FEEDING_MOD[season] * pastureMod;
  const expenses: ExpensesBreakdown = {
    salaries: Math.round(BASE_EXPENSES.salaries * (ecoEvent.expenseMultipliers?.salaries ?? 1)),
    feeding: Math.round(BASE_EXPENSES.feeding * feedingMod),
    veterinary: Math.round(BASE_EXPENSES.veterinary * (ecoEvent.expenseMultipliers?.veterinary ?? 1)),
    maintenance: Math.round(BASE_EXPENSES.maintenance * (ecoEvent.expenseMultipliers?.maintenance ?? 1)),
    water: Math.round(BASE_EXPENSES.water * (ecoEvent.expenseMultipliers?.water ?? 1)),
    electricity: BASE_EXPENSES.electricity,
  };

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0)
    + (ecoEvent.expenseBonus ?? 0);

  // Compute income with seasonal + event modifiers
  const seasonMod = SEASON_INCOME_MOD[season];
  const animalSales = rollAnimalSales(month);
  const income: IncomeBreakdown = {
    subsidies: Math.round(BASE_INCOME.subsidies * seasonMod),
    animalSales,
    agricultural: Math.round(BASE_INCOME.agricultural * seasonMod),
    ranchVisits: Math.round(BASE_INCOME.ranchVisits * seasonMod),
  };

  const totalIncome = Object.values(income).reduce((a, b) => a + b, 0)
    + (ecoEvent.incomeBonus ?? 0);

  const profit = totalIncome - totalExpenses;
  const newTreasury = currentTreasury + profit;

  const eventTexts: string[] = [];
  if (ecoEvent.text !== ECONOMIC_EVENTS[ECONOMIC_EVENTS.length - 1].text) {
    eventTexts.push(ecoEvent.text);
  }
  if (animalSales > 0 && ecoEvent.incomeBonus === undefined) {
    eventTexts.push(`Venda de animais — receita de €${animalSales.toLocaleString('pt-PT')}.`);
  }

  const record: MonthlyRecord = {
    id: `eco-${year}-${month}-${Date.now()}`,
    month,
    year,
    income: totalIncome,
    expenses: totalExpenses,
    profit,
    treasury: newTreasury,
    events: eventTexts,
  };

  return { record, newTreasury };
}

// ── Initial economy state ─────────────────────────────────────────────────────

export const INITIAL_ECONOMY: EconomyState = {
  treasury: 100_000,
  history: [],
};

// ── Reducer helper ────────────────────────────────────────────────────────────

export function applyMonthToEconomy(
  economy: EconomyState,
  month: Month,
  year: number,
  season: Season,
  pastureMod = 1.0,
): { economy: EconomyState; economicEvent: GameEvent | null } {
  const { record, newTreasury } = calculateMonth(month, year, season, economy.treasury, pastureMod);

  const newHistory = [record, ...economy.history].slice(0, 60);

  const economicEvent: GameEvent | null = record.events.length > 0
    ? {
        id: `eco-evt-${Date.now()}`,
        month,
        year,
        text: record.events[0],
      }
    : null;

  return {
    economy: {
      treasury: newTreasury,
      history: newHistory,
    },
    economicEvent,
  };
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatEuro(value: number): string {
  return `${value.toLocaleString('pt-PT')}€`;
}

export function lastNMonths(history: MonthlyRecord[], n: number): MonthlyRecord[] {
  return history.slice(0, n);
}
