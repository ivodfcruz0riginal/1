import type { ClimateState, Season, WeatherType } from '../types/climate';

const SEASON_WEATHER_DEFAULTS: Record<Season, WeatherType> = {
  Primavera: 'Cloudy',
  Verão:     'Sunny',
  Outono:    'Rain',
  Inverno:   'Fog',
};

const DEFAULT_CLIMATE: ClimateState = {
  currentWeather: 'Sunny',
  season: 'Verão',
  rainfall: 0,
  temperature: 25,
  droughtRisk: 0,
  pastureGrowthModifier: 1,
  waterModifier: 1,
};

/**
 * ClimateManager owns weather and seasonal state.
 * Logic migration and full simulation planned for Alpha 0.3.
 */
export class ClimateManager {
  private climate: ClimateState;

  constructor(climate: ClimateState = DEFAULT_CLIMATE) {
    this.climate = { ...climate };
  }

  getClimate(): ClimateState {
    return { ...this.climate };
  }

  /** Placeholder — advances climate to defaults for the given season. */
  updateMonthlyClimate(season: Season): ClimateState {
    this.climate = {
      ...this.climate,
      season,
      currentWeather: SEASON_WEATHER_DEFAULTS[season],
    };
    return this.getClimate();
  }

  setWeather(weather: WeatherType): ClimateState {
    this.climate = { ...this.climate, currentWeather: weather };
    return this.getClimate();
  }

  getDroughtRisk(): number {
    return this.climate.droughtRisk;
  }
}
