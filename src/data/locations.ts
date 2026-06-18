// ── Types ─────────────────────────────────────────────────────────────────────

export type LocationId =
  | 'casa'
  | 'escritorio'
  | 'currais'
  | 'tentadero'
  | 'cercado_norte'
  | 'cercado_sul'
  | 'embarque'
  | 'armazem'
  | 'barragem'
  | 'oficina';

export type LocationType =
  | 'residence'
  | 'office'
  | 'livestock'
  | 'training'
  | 'pasture'
  | 'logistics'
  | 'storage'
  | 'infrastructure';

export type LocationCondition =
  | 'Excellent'
  | 'Good'
  | 'Regular'
  | 'Poor'
  | 'Damaged';

export type LocationNotification =
  | 'Broken fence'
  | 'Needs cleaning'
  | 'Waiting inspection'
  | 'Ready'
  | 'Busy';

export interface LocationCapacity {
  current: number;
  maximum: number;
}

export interface Location {
  id: LocationId;
  name: string;
  description: string;
  type: LocationType;
  capacity: LocationCapacity;
  condition: LocationCondition;
  notifications: LocationNotification[];
}

// ── Initial location data ─────────────────────────────────────────────────────

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'casa',
    name: 'Casa Principal',
    description: 'Residência da família proprietária da herdade. Centro da vida doméstica e social da ganaderia.',
    type: 'residence',
    capacity: { current: 4, maximum: 10 },
    condition: 'Good',
    notifications: [],
  },
  {
    id: 'escritorio',
    name: 'Escritório',
    description: 'Centro de administração da herdade. Aqui se gerem contratos, contas e correspondência.',
    type: 'office',
    capacity: { current: 1, maximum: 3 },
    condition: 'Good',
    notifications: ['Ready'],
  },
  {
    id: 'currais',
    name: 'Currais',
    description: 'Instalações para separação e maneio individual dos toiros. Essencial nas épocas de embarque.',
    type: 'livestock',
    capacity: { current: 8, maximum: 12 },
    condition: 'Regular',
    notifications: ['Needs cleaning'],
  },
  {
    id: 'tentadero',
    name: 'Tentadero',
    description: 'Arena privada para provas de bravura dos animais. Onde se avaliam os novilhos antes das tentas.',
    type: 'training',
    capacity: { current: 0, maximum: 4 },
    condition: 'Good',
    notifications: ['Ready'],
  },
  {
    id: 'cercado_norte',
    name: 'Cercado Norte',
    description: 'Pastagem principal para vacas e vitelos. Maior cercado da herdade com abundância de água.',
    type: 'pasture',
    capacity: { current: 24, maximum: 40 },
    condition: 'Regular',
    notifications: ['Broken fence', 'Waiting inspection'],
  },
  {
    id: 'cercado_sul',
    name: 'Cercado Sul',
    description: 'Pastagem secundária usada para novilhos e animais em quarentena. Boa exposição solar.',
    type: 'pasture',
    capacity: { current: 16, maximum: 30 },
    condition: 'Good',
    notifications: ['Ready'],
  },
  {
    id: 'embarque',
    name: 'Parque de Embarque',
    description: 'Área de carga e transporte dos animais para corridas e tentas. Manga de embarque com básculas.',
    type: 'logistics',
    capacity: { current: 0, maximum: 6 },
    condition: 'Good',
    notifications: [],
  },
  {
    id: 'armazem',
    name: 'Armazém',
    description: 'Depósito de forragens, ferramentas e equipamento agrícola. Capacidade para reservas de Inverno.',
    type: 'storage',
    capacity: { current: 60, maximum: 100 },
    condition: 'Good',
    notifications: ['Ready'],
  },
  {
    id: 'barragem',
    name: 'Barragem',
    description: 'Reservatório de água que abastece toda a herdade. Fundamental nos meses de seca intensa.',
    type: 'infrastructure',
    capacity: { current: 85, maximum: 100 },
    condition: 'Regular',
    notifications: ['Waiting inspection'],
  },
  {
    id: 'oficina',
    name: 'Oficina',
    description: 'Espaço de manutenção e reparação de veículos, máquinas e infraestruturas da herdade.',
    type: 'infrastructure',
    capacity: { current: 1, maximum: 4 },
    condition: 'Poor',
    notifications: ['Needs cleaning', 'Waiting inspection'],
  },
];

// ── Location Manager ──────────────────────────────────────────────────────────

export const LocationManager = {
  getAll(locations: Location[]): Location[] {
    return locations;
  },

  getById(locations: Location[], id: LocationId): Location | undefined {
    return locations.find(l => l.id === id);
  },

  getByType(locations: Location[], type: LocationType): Location[] {
    return locations.filter(l => l.type === type);
  },

  withCondition(locations: Location[], condition: LocationCondition): Location[] {
    return locations.filter(l => l.condition === condition);
  },

  withNotification(locations: Location[], notification: LocationNotification): Location[] {
    return locations.filter(l => l.notifications.includes(notification));
  },

  updateCondition(locations: Location[], id: LocationId, condition: LocationCondition): Location[] {
    return locations.map(l => l.id === id ? { ...l, condition } : l);
  },

  addNotification(locations: Location[], id: LocationId, notification: LocationNotification): Location[] {
    return locations.map(l =>
      l.id === id && !l.notifications.includes(notification)
        ? { ...l, notifications: [...l.notifications, notification] }
        : l
    );
  },

  removeNotification(locations: Location[], id: LocationId, notification: LocationNotification): Location[] {
    return locations.map(l =>
      l.id === id
        ? { ...l, notifications: l.notifications.filter(n => n !== notification) }
        : l
    );
  },

  updateOccupancy(locations: Location[], id: LocationId, current: number): Location[] {
    return locations.map(l =>
      l.id === id ? { ...l, capacity: { ...l.capacity, current } } : l
    );
  },

  isOverCapacity(location: Location): boolean {
    return location.capacity.current > location.capacity.maximum;
  },

  occupancyRatio(location: Location): number {
    return location.capacity.maximum === 0
      ? 0
      : location.capacity.current / location.capacity.maximum;
  },
};
