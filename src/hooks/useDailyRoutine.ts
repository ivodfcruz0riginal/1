import { useState, useEffect, useRef } from 'react';

// ── Schedule types ────────────────────────────────────────────────────────────

interface ScheduleEntry {
  hour: number;
  locationId: string;
  label: string;
}

// ── Maioral schedule ──────────────────────────────────────────────────────────

const MAIORAL_SCHEDULE: ScheduleEntry[] = [
  { hour: 6,  locationId: 'escritorio',    label: 'Maioral está no Escritório — início do dia.' },
  { hour: 8,  locationId: 'currais',       label: 'Maioral está a inspeccionar os Currais.' },
  { hour: 10, locationId: 'cercado_norte', label: 'Maioral percorre os Cercados.' },
  { hour: 13, locationId: 'casa',          label: 'Maioral na pausa do almoço.' },
  { hour: 15, locationId: 'tentadero',     label: 'Maioral a inspeccionar o Tentadero.' },
  { hour: 18, locationId: 'escritorio',    label: 'Maioral voltou ao Escritório.' },
  { hour: 22, locationId: 'casa',          label: 'Maioral recolheu. Boa noite.' },
];

// ── Campinos schedule ─────────────────────────────────────────────────────────

const CAMPINOS_SCHEDULE: ScheduleEntry[] = [
  { hour: 6,  locationId: 'cercado_norte', label: 'Campinos verificam as vedações.' },
  { hour: 9,  locationId: 'currais',       label: 'Campinos movem animais para os Currais.' },
  { hour: 12, locationId: 'casa',          label: 'Campinos na pausa do almoço.' },
  { hour: 14, locationId: 'barragem',      label: 'Campinos verificam os pontos de água.' },
  { hour: 17, locationId: 'currais',       label: 'Campinos no trabalho da tarde.' },
  { hour: 20, locationId: 'escritorio',    label: 'Campinos recolheram ao fim do dia.' },
];

// All hours that trigger a floating notification
const BOUNDARY_HOURS = new Set(
  [...MAIORAL_SCHEDULE, ...CAMPINOS_SCHEDULE].map(e => e.hour),
);

// 25 real seconds = 1 in-game hour; full day = 10 real minutes
const MS_PER_HOUR = 25_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function activeEntry(schedule: ScheduleEntry[], hour: number): ScheduleEntry {
  let result = schedule[schedule.length - 1];
  for (const entry of schedule) {
    if (entry.hour <= hour) result = entry;
  }
  return result;
}

const GAME_MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

function deriveStartHour(gameMonth: string, gameYear: number): number {
  const idx = GAME_MONTHS.indexOf(gameMonth);
  const hash = ((idx < 0 ? 0 : idx) * 7 + gameYear * 3) % 4;
  return [8, 13, 18, 22][hash];
}

// Notification texts that alternate when both staff transition at same hour
function notificationText(hour: number): string | null {
  const maioral = MAIORAL_SCHEDULE.find(e => e.hour === hour);
  const campinos = CAMPINOS_SCHEDULE.find(e => e.hour === hour);
  if (maioral && campinos) return campinos.label; // campinos is more visual
  return maioral?.label ?? campinos?.label ?? null;
}

// ── Public interface ──────────────────────────────────────────────────────────

export interface DailyRoutineState {
  hour: number;
  maioralLocation: string;
  maioralLabel: string;
  campinosLocation: string;
  campinosLabel: string;
  notification: string | null;
  occupiedLocations: Set<string>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDailyRoutine(
  gameMonth: string,
  gameYear: number,
  onDiaryNote: (text: string) => void,
): DailyRoutineState {
  const [hour, setHour] = useState(() => deriveStartHour(gameMonth, gameYear));
  const [notification, setNotification] = useState<string | null>(null);

  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const diaryFiredRef = useRef(false);
  const prevHourRef   = useRef(-1);         // -1 = first render, skip notification
  const onDiaryRef    = useRef(onDiaryNote);
  onDiaryRef.current  = onDiaryNote;        // always current without re-subscribing

  // Advance one in-game hour every 25 real seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHour(h => (h + 1) % 24);
    }, MS_PER_HOUR);
    return () => clearInterval(interval);
  }, []);

  // Handle hour transitions
  useEffect(() => {
    // First render: record initial hour, no notification
    if (prevHourRef.current === -1) {
      prevHourRef.current = hour;
      return;
    }
    if (prevHourRef.current === hour) return;
    prevHourRef.current = hour;

    // Show boundary-hour notification
    if (BOUNDARY_HOURS.has(hour)) {
      const text = notificationText(hour);
      if (text) {
        if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
        setNotification(text);
        notifTimerRef.current = setTimeout(() => setNotification(null), 5_000);
      }
    }

    // Diary note: once per day when clock wraps midnight (hour 0)
    if (hour === 0 && !diaryFiredRef.current) {
      diaryFiredRef.current = true;
      onDiaryRef.current('O trabalho decorreu normalmente. O dia encerrou sem incidentes.');
    }
    if (hour === 1) {
      diaryFiredRef.current = false; // allow note for next cycle
    }
  }, [hour]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    };
  }, []);

  const maioral  = activeEntry(MAIORAL_SCHEDULE, hour);
  const campinos = activeEntry(CAMPINOS_SCHEDULE, hour);

  return {
    hour,
    maioralLocation:  maioral.locationId,
    maioralLabel:     maioral.label,
    campinosLocation: campinos.locationId,
    campinosLabel:    campinos.label,
    notification,
    occupiedLocations: new Set([maioral.locationId, campinos.locationId]),
  };
}
