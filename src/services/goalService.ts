import type { Goal, GoalCategory, GoalDifficulty, GoalTimeframe, RewardType } from '../types/goal';
import type { GameState } from '../store/gameState';

// ── Month utilities ───────────────────────────────────────────────────────────

const MONTH_ORDER = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const START_YEAR = 1985;
const START_MONTH_IDX = 2; // Março

export function monthsPlayed(state: GameState): number {
  const idx = MONTH_ORDER.indexOf(state.month);
  return Math.max(0, (state.year - START_YEAR) * 12 + (idx - START_MONTH_IDX));
}

function clamp(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v)));
}

// ── Per-goal progress logic ───────────────────────────────────────────────────

export function computeGoalProgress(goal: Goal, state: GameState): number {
  if (goal.completed) return 100;

  const getLocation = (id: string) => state.locations.find(l => l.id === id);

  switch (goal.id) {

    // Reparar Vedação Norte — BrokenFence notification cleared from cercado_norte
    case 'st_1': {
      const loc = getLocation('cercado_norte');
      if (!loc) return 0;
      const hasBroken = loc.notifications.includes('BrokenFence');
      return hasBroken ? 0 : 100;
    }

    // Preparar 6 Touros — active fighting males
    case 'st_2': {
      const fightingMales = state.animals.filter(a =>
        a.sex === 'Macho' &&
        a.status === 'Ativo' &&
        !a.hasFought &&
        ['Macho de Corrida', 'Novilho', 'Utrero'].includes(a.category),
      ).length;
      return clamp(fightingMales / 6 * 100);
    }

    // Aumentar Qualidade da Pastagem — cercado_norte condition
    case 'st_3': {
      const loc = getLocation('cercado_norte');
      if (!loc) return 0;
      const scoreMap: Record<string, number> = {
        Excellent: 100, Good: 75, Regular: 50, Poor: 25, Damaged: 0,
      };
      return scoreMap[loc.condition] ?? 0;
    }

    // Constituir Reserva Financeira — treasury above 5M escudos
    case 'st_4': {
      const target = 5_000_000;
      const initial = 3_800_000;
      return clamp((state.economy.treasury - initial) / (target - initial) * 100);
    }

    // Completar Primeira Tienta — 3 months of play
    case 'st_5':
      return clamp(monthsPlayed(state) / 3 * 100);

    // Produzir Semental — 10 months of play (time + effort proxy)
    case 'mt_1':
      return clamp(monthsPlayed(state) / 10 * 100);

    // Atingir Prestígio 500 — prestige is tracked at 250 currently
    case 'mt_2':
      return clamp(250 / 500 * 100);

    // Melhorar Escritório — escritorio condition
    case 'mt_3': {
      const loc = getLocation('escritorio');
      if (!loc) return 0;
      const scoreMap: Record<string, number> = {
        Excellent: 100, Good: 66, Regular: 33, Poor: 10, Damaged: 0,
      };
      return scoreMap[loc.condition] ?? 0;
    }

    // Expandir a Herdade — ge_03 decision chosen "Aprovar"
    case 'mt_4': {
      const expansion = state.decisionHistory.find(d => d.decisionId === 'ge_03');
      if (!expansion) return 0;
      if (expansion.choice.startsWith('Aprovar')) return 100;
      return 25;
    }

    // Adquirir Nova Pastagem — not yet measurable, placeholder
    case 'mt_5':
      return 0;

    // Melhor Ganaderia de Portugal — 36 months played
    case 'lt_1':
      return clamp(monthsPlayed(state) / 36 * 100);

    // Criar Linhagem Lendária — 24 months played
    case 'lt_2':
      return clamp(monthsPlayed(state) / 24 * 100);

    // Atingir Prestígio 1000
    case 'lt_3':
      return clamp(250 / 1000 * 100);

    // Cinquenta Corridas — not yet trackable
    case 'lt_4':
      return 0;

    // Passar o Testemunho — 36 months played
    case 'lt_5':
      return clamp(monthsPlayed(state) / 36 * 100);

    default:
      return goal.progress;
  }
}

// ── Display helpers ───────────────────────────────────────────────────────────

export const TIMEFRAME_LABELS: Record<GoalTimeframe, string> = {
  ShortTerm:  'Curto Prazo',
  MediumTerm: 'Médio Prazo',
  LongTerm:   'Longo Prazo',
};

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  Economy:    'Economia',
  Animals:    'Animais',
  Genetics:   'Genética',
  Prestige:   'Prestígio',
  Buildings:  'Instalações',
  Bullfights: 'Touradas',
  Legacy:     'Legado',
};

export const CATEGORY_ICONS: Record<GoalCategory, string> = {
  Economy:    '💰',
  Animals:    '🐂',
  Genetics:   '🧬',
  Prestige:   '👑',
  Buildings:  '🏗',
  Bullfights: '🎯',
  Legacy:     '📜',
};

export const REWARD_ICONS: Record<RewardType, string> = {
  Money:        '💶',
  Prestige:     '👑',
  Unlock:       '🔓',
  SpecialEvent: '✨',
};

export const DIFFICULTY_STARS: Record<GoalDifficulty, number> = {
  Easy:      1,
  Medium:    2,
  Hard:      3,
  Legendary: 4,
};

export const DIFFICULTY_COLOR: Record<GoalDifficulty, string> = {
  Easy:      'text-green-400',
  Medium:    'text-amber-400',
  Hard:      'text-orange-400',
  Legendary: 'text-red-400',
};
