import type { Location, LocationId, LocationCondition, LocationNotification, LocationType } from '../types/location';

// ── Notification display ──────────────────────────────────────────────────────

export const NOTIFICATION_ICONS: Record<LocationNotification, string> = {
  BrokenFence:      '⚠',
  NeedsCleaning:    '🧹',
  WaitingInspection:'🔍',
  Ready:            '✅',
  Busy:             '🔄',
  VeterinaryAlert:  '🩺',
  NewContract:      '📬',
  FinancialUpdate:  '💰',
  AnimalAttention:  '🐂',
};

export const NOTIFICATION_LABELS: Record<LocationNotification, string> = {
  BrokenFence:      'Vedação danificada',
  NeedsCleaning:    'Necessita limpeza',
  WaitingInspection:'Aguarda inspecção',
  Ready:            'Pronto',
  Busy:             'Em uso',
  VeterinaryAlert:  'Alerta veterinário',
  NewContract:      'Novo contrato',
  FinancialUpdate:  'Actualização financeira',
  AnimalAttention:  'Animais necessitam atenção',
};

// ── Condition display ─────────────────────────────────────────────────────────

export const CONDITION_COLOR: Record<LocationCondition, string> = {
  Excellent: 'text-emerald-400',
  Good:      'text-green-400',
  Regular:   'text-amber-400',
  Poor:      'text-orange-400',
  Damaged:   'text-red-400',
};

export const CONDITION_BG: Record<LocationCondition, string> = {
  Excellent: 'bg-emerald-500/15 border-emerald-500/30',
  Good:      'bg-green-500/15 border-green-500/30',
  Regular:   'bg-amber-500/15 border-amber-500/30',
  Poor:      'bg-orange-500/15 border-orange-500/30',
  Damaged:   'bg-red-500/15 border-red-500/30',
};

// ── Type display ──────────────────────────────────────────────────────────────

export const TYPE_LABELS: Record<LocationType, string> = {
  Residence:  'Residência',
  Office:     'Escritório',
  Corrals:    'Currais',
  Tentadero:  'Tentadero',
  Pasture:    'Pastagem',
  Shipping:   'Embarque',
  Storage:    'Armazém',
  Water:      'Água',
  Workshop:   'Oficina',
};

// ── Service functions ─────────────────────────────────────────────────────────

export function getAllLocations(locations: Location[]): Location[] {
  return locations;
}

export function getLocationById(locations: Location[], id: LocationId): Location | undefined {
  return locations.find(l => l.id === id);
}

export function updateLocationCondition(
  locations: Location[],
  id: LocationId,
  condition: LocationCondition,
): Location[] {
  return locations.map(l => l.id === id ? { ...l, condition } : l);
}

export function addLocationNotification(
  locations: Location[],
  id: LocationId,
  notification: LocationNotification,
): Location[] {
  return locations.map(l =>
    l.id === id && !l.notifications.includes(notification)
      ? { ...l, notifications: [...l.notifications, notification] }
      : l,
  );
}

export function clearLocationNotification(
  locations: Location[],
  id: LocationId,
  notification: LocationNotification,
): Location[] {
  return locations.map(l =>
    l.id === id
      ? { ...l, notifications: l.notifications.filter(n => n !== notification) }
      : l,
  );
}

export function updateLocationOccupation(
  locations: Location[],
  id: LocationId,
  occupation: number,
): Location[] {
  return locations.map(l =>
    l.id === id ? { ...l, currentOccupation: occupation } : l,
  );
}

export function occupancyRatio(location: Location): number {
  return location.capacity === 0 ? 0 : location.currentOccupation / location.capacity;
}

export function resetPastureAfterRepair(locations: Location[], id: LocationId): Location[] {
  return locations.map(l =>
    l.id === id
      ? { ...l, condition: 'Good', pastureQuality: 70, fenceCondition: 80 }
      : l,
  );
}
