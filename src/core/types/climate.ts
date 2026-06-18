/** Climate state — ambient conditions that shape pasture, animal health, and work efficiency. */

export type Season = 'Primavera' | 'Verão' | 'Outono' | 'Inverno';

export type WeatherType =
  | 'Sunny'
  | 'Cloudy'
  | 'Rain'
  | 'Fog'
  | 'Wind';

export interface ClimateState {
  currentWeather: WeatherType;
  season: Season;
  rainfall: number;              // mm accumulated this month
  temperature: number;           // °C average for the current period
  droughtRisk: number;           // 0–100 — cumulative dry-spell pressure
  pastureGrowthModifier: number; // multiplier applied to pasture regeneration
  waterModifier: number;         // multiplier applied to water level changes
}
