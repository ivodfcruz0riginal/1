import type { CoreGameState } from '../types/gameState';

export const initialCoreGameState: CoreGameState = {
  time: {
    month: 'Janeiro',
    year: 1985,
    season: 'Inverno',
  },
  phase: 'MonthStart',
  animals: [],
  people: [],
  locations: [],
  climate: {
    currentWeather: 'Cloudy',
    season: 'Inverno',
    rainfall: 40,
    temperature: 10,
    droughtRisk: 0,
    pastureGrowthModifier: 0.8,
    waterModifier: 1.1,
  },
  economy: {
    treasury: 50000,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    debt: 0,
    payroll: 2400,
    feedingCosts: 800,
    veterinaryCosts: 0,
    maintenanceCosts: 300,
    history: [],
  },
  events: [],
  decisions: [],
  history: [],
  tasks: [],
  notifications: {},
  prestige: 0,
};
