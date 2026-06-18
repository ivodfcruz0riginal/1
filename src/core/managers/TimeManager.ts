import type { Month, Season, GameDate } from '../types/gameState';

const MONTH_ORDER: Month[] = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const SEASON_MAP: Record<Month, Season> = {
  Dezembro:  'Inverno',
  Janeiro:   'Inverno',
  Fevereiro: 'Inverno',
  Março:     'Primavera',
  Abril:     'Primavera',
  Maio:      'Primavera',
  Junho:     'Verão',
  Julho:     'Verão',
  Agosto:    'Verão',
  Setembro:  'Outono',
  Outubro:   'Outono',
  Novembro:  'Outono',
};

/**
 * TimeManager owns calendar advancement and date queries.
 * Logic migration from store/gameState.tsx planned for Alpha 0.3.
 */
export class TimeManager {
  private date: GameDate;

  constructor(date: GameDate) {
    this.date = { ...date };
  }

  getCurrentDate(): GameDate {
    return { ...this.date };
  }

  getCurrentSeason(): Season {
    return this.date.season;
  }

  advanceMonth(): GameDate {
    const idx = MONTH_ORDER.indexOf(this.date.month);
    const nextMonth = MONTH_ORDER[(idx + 1) % 12];
    const nextYear = nextMonth === 'Janeiro' ? this.date.year + 1 : this.date.year;
    this.date = {
      month: nextMonth,
      year: nextYear,
      season: SEASON_MAP[nextMonth],
    };
    return { ...this.date };
  }

  static monthIndex(month: Month): number {
    return MONTH_ORDER.indexOf(month);
  }

  static seasonFor(month: Month): Season {
    return SEASON_MAP[month];
  }
}
