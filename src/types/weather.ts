export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'fog' | 'wind' | 'drought' | 'cold';

export interface WeatherState {
  type: WeatherType;
  icon: string;
  temp: string;
  desc: string;
  // Monthly modifiers applied by downstream services
  pastureQualityDelta: number;   // ±points to pasture quality
  waterLevelDelta: number;       // ±points to water level
  feedingCostMod: number;        // multiplier (applied on top of location mod)
  hydrationDelta: number;        // ±points to animal hydration
  stressDelta: number;           // ±points to animal stress
  fatigueDelta: number;          // ±points to staff fatigue
}
