import { useState, useEffect } from 'react';

export type DayPeriod = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type WeatherType = 'Sunny' | 'Cloudy' | 'Rain' | 'Fog' | 'Wind';

export interface DayCycleState {
  timeString: string;
  period: DayPeriod;
  periodLabel: string;
  hour: number;
  minute: number;
  weather: WeatherType;
  weatherLabel: string;
  weatherIcon: string;
  temperature: number;
  skyGradient: string;
}

const PERIOD_LABELS: Record<DayPeriod, string> = {
  Morning:   'Manhã',
  Afternoon: 'Tarde',
  Evening:   'Entardecer',
  Night:     'Noite',
};

const WEATHER_LABELS: Record<WeatherType, string> = {
  Sunny:  'Sol intenso',
  Cloudy: 'Nublado',
  Rain:   'Chuva',
  Fog:    'Nevoeiro',
  Wind:   'Vento forte',
};

const WEATHER_ICONS: Record<WeatherType, string> = {
  Sunny:  '☀',
  Cloudy: '☁',
  Rain:   '🌧',
  Fog:    '🌫',
  Wind:   '💨',
};

const WEATHER_TEMPS: Record<WeatherType, number> = {
  Sunny:  28,
  Cloudy: 20,
  Rain:   14,
  Fog:    12,
  Wind:   17,
};

// Sky gradient per period × weather
function getSkyGradient(period: DayPeriod, weather: WeatherType): string {
  if (weather === 'Rain') {
    return 'from-slate-800/80 via-slate-700/50 to-leather-900';
  }
  if (weather === 'Fog') {
    return 'from-stone-600/60 via-stone-500/30 to-leather-900';
  }
  if (weather === 'Cloudy') {
    return 'from-slate-600/50 via-amber-800/20 to-leather-900';
  }
  switch (period) {
    case 'Morning':   return 'from-amber-400/50 via-orange-500/30 to-leather-900';
    case 'Afternoon': return 'from-sky-600/40 via-amber-600/20 to-leather-900';
    case 'Evening':   return 'from-orange-700/60 via-amber-600/40 to-leather-900';
    case 'Night':     return 'from-slate-900/90 via-indigo-950/40 to-leather-900';
  }
}

function getPeriod(hour: number): DayPeriod {
  if (hour >= 6  && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 18) return 'Afternoon';
  if (hour >= 18 && hour < 21) return 'Evening';
  return 'Night';
}

function pickWeather(): WeatherType {
  const roll = Math.random();
  if (roll < 0.45) return 'Sunny';
  if (roll < 0.65) return 'Cloudy';
  if (roll < 0.78) return 'Wind';
  if (roll < 0.89) return 'Fog';
  return 'Rain';
}

// Advance game time: starts at 06:00, each real second = 10 game minutes
// so one full day (1440 minutes) takes 144 real seconds (~2.4 min)
// Loop continuously
const GAME_MINUTES_PER_SECOND = 10;

export function useDayCycle(): DayCycleState {
  const [gameMinutes, setGameMinutes] = useState(() => 6 * 60); // start at 06:00
  const [weather, setWeather] = useState<WeatherType>(() => pickWeather());

  useEffect(() => {
    const tick = setInterval(() => {
      setGameMinutes(prev => {
        const next = (prev + GAME_MINUTES_PER_SECOND) % (24 * 60);
        // Change weather once per day at midnight
        if (next < GAME_MINUTES_PER_SECOND) {
          setWeather(pickWeather());
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const hour = Math.floor(gameMinutes / 60);
  const minute = gameMinutes % 60;
  const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const period = getPeriod(hour);

  return {
    timeString,
    period,
    periodLabel: PERIOD_LABELS[period],
    hour,
    minute,
    weather,
    weatherLabel: WEATHER_LABELS[weather],
    weatherIcon:  WEATHER_ICONS[weather],
    temperature:  WEATHER_TEMPS[weather],
    skyGradient:  getSkyGradient(period, weather),
  };
}
