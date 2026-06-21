import type { Season } from '../store/gameTypes';
import type { WeatherState, WeatherType } from '../types/weather';

// ── Season weather probability tables ────────────────────────────────────────
// Each entry: [WeatherType, cumulative probability 0-1]

type WeatherEntry = [WeatherType, number];

const SEASON_WEATHER: Record<Season, WeatherEntry[]> = {
  Primavera: [
    ['sunny',  0.30],
    ['cloudy', 0.60],
    ['rain',   0.85],
    ['wind',   1.00],
  ],
  Verão: [
    ['sunny',   0.55],
    ['wind',    0.75],
    ['drought', 0.95],
    ['cloudy',  1.00],
  ],
  Outono: [
    ['cloudy', 0.30],
    ['rain',   0.60],
    ['fog',    0.80],
    ['wind',   1.00],
  ],
  Inverno: [
    ['rain',   0.35],
    ['fog',    0.55],
    ['wind',   0.75],
    ['cold',   0.95],
    ['cloudy', 1.00],
  ],
};

// ── Weather effect profiles ────────────────────────────────────────────────────

const WEATHER_EFFECTS: Record<WeatherType, Omit<WeatherState, 'type' | 'icon' | 'temp' | 'desc'>> = {
  sunny:   { pastureQualityDelta:  3, waterLevelDelta:  -2, feedingCostMod: 0.95, hydrationDelta:  1, stressDelta: -3, fatigueDelta: -1 },
  cloudy:  { pastureQualityDelta:  1, waterLevelDelta:   1, feedingCostMod: 1.00, hydrationDelta:  0, stressDelta:  0, fatigueDelta:  0 },
  rain:    { pastureQualityDelta:  6, waterLevelDelta:   8, feedingCostMod: 0.90, hydrationDelta:  5, stressDelta: -2, fatigueDelta:  3 },
  fog:     { pastureQualityDelta:  0, waterLevelDelta:   2, feedingCostMod: 1.05, hydrationDelta:  1, stressDelta:  3, fatigueDelta:  2 },
  wind:    { pastureQualityDelta: -2, waterLevelDelta:  -3, feedingCostMod: 1.05, hydrationDelta: -2, stressDelta:  6, fatigueDelta:  4 },
  drought: { pastureQualityDelta:-10, waterLevelDelta: -12, feedingCostMod: 1.25, hydrationDelta:-10, stressDelta: 10, fatigueDelta:  5 },
  cold:    { pastureQualityDelta: -4, waterLevelDelta:  -1, feedingCostMod: 1.15, hydrationDelta: -3, stressDelta:  5, fatigueDelta:  6 },
};

// ── Display data ───────────────────────────────────────────────────────────────

const WEATHER_DISPLAY: Record<WeatherType, { icon: string; desc: string; tempRange: [number, number] }> = {
  sunny:   { icon: '☀',  desc: 'Sol, tempo seco',         tempRange: [24, 32] },
  cloudy:  { icon: '⛅',  desc: 'Céu nublado',             tempRange: [12, 20] },
  rain:    { icon: '🌧',  desc: 'Chuva',                   tempRange: [10, 16] },
  fog:     { icon: '🌫',  desc: 'Nevoeiro',                tempRange: [8,  13] },
  wind:    { icon: '🌬',  desc: 'Vento forte',             tempRange: [12, 18] },
  drought: { icon: '🌵',  desc: 'Seca intensa',            tempRange: [30, 38] },
  cold:    { icon: '❄',  desc: 'Frio intenso',             tempRange: [2,   8] },
};

// ── Diary events per weather type ─────────────────────────────────────────────

const WEATHER_DIARY: Record<WeatherType, string[]> = {
  sunny:   [
    'O bom tempo animou a herdade e o gado este mês.',
    'Sol constante durante o mês. Pastagens secaram um pouco.',
  ],
  cloudy:  [
    'Céu encoberto durante o mês. Temperaturas amenas.',
    'Tempo nublado mas estável. Condições normais na herdade.',
  ],
  rain:    [
    'A chuva deste mês melhorou as pastagens consideravelmente.',
    'Boas chuvas encheram a barragem e revigoraram os campos.',
    'Mês chuvoso. Gado e pastagens beneficiaram das águas.',
  ],
  fog:     [
    'Nevoeiro persistente dificultou as rondas dos campinos.',
    'Mês de nevoeiros. Vigilância redobrada no campo.',
  ],
  wind:    [
    'O vento forte deixou sinais nas vedações e no ânimo do gado.',
    'Rajadas de vento causaram desgaste nas instalações este mês.',
    'Vento persistente agitou os animais durante o mês.',
  ],
  drought: [
    'Seca severa. Barragem em baixo e pastagens muito afectadas.',
    'Mês de seca intensa. Alimentação suplementar necessária.',
    'A seca castigou as pastagens e a aguada dos animais.',
  ],
  cold:    [
    'Frio intenso exigiu cuidados redobrados com os animais jovens.',
    'Temperaturas negativas prejudicaram o gado mais fraco.',
    'Inverno rigoroso. Mais trabalho e custos de alimentação.',
  ],
};

function pickFrom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Roll weather from season probabilities ────────────────────────────────────

function rollWeatherType(season: Season): WeatherType {
  const table = SEASON_WEATHER[season];
  const roll = Math.random();
  for (const [type, threshold] of table) {
    if (roll <= threshold) return type;
  }
  return table[table.length - 1][0];
}

// ── Main entry point ──────────────────────────────────────────────────────────

export interface WeatherRollResult {
  weather: WeatherState;
  diaryEvent: string;
}

export function rollWeather(season: Season): WeatherRollResult {
  const type = rollWeatherType(season);
  const effects = WEATHER_EFFECTS[type];
  const display = WEATHER_DISPLAY[type];

  const [tMin, tMax] = display.tempRange;
  const temp = `${Math.round(tMin + Math.random() * (tMax - tMin))}°C`;

  const weather: WeatherState = {
    type,
    icon: display.icon,
    temp,
    desc: display.desc,
    ...effects,
  };

  const diaryEvent = pickFrom(WEATHER_DIARY[type]);

  return { weather, diaryEvent };
}
