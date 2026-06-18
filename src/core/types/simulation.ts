/**
 * Core simulation entity types for Herança Brava.
 *
 * These types define the world model. Screens consume derived views of these
 * entities — they do not manipulate them directly. All game logic operates
 * on these shapes via Core Managers (see ../managers/).
 */

// ── Shared primitives ────────────────────────────────────────────────────────

export type Month =
  | 'Janeiro' | 'Fevereiro' | 'Março' | 'Abril' | 'Maio' | 'Junho'
  | 'Julho' | 'Agosto' | 'Setembro' | 'Outubro' | 'Novembro' | 'Dezembro';

export type Season = 'Primavera' | 'Verão' | 'Outono' | 'Inverno';

export interface SimDate {
  month: Month;
  year: number;
}

// ── Animal ───────────────────────────────────────────────────────────────────

export type AnimalSex = 'Macho' | 'Fêmea';

export type AnimalCategory =
  | 'Semental'
  | 'Vaca'
  | 'Novilha'
  | 'Macho de Corrida'
  | 'Cabresto'
  | 'Bezerro'
  | 'Bezerra'
  | 'Utrero'
  | 'Novilho';

export type AnimalStatus =
  | 'Ativo'
  | 'Lesionado'
  | 'Reformado'
  | 'Vendido'
  | 'Morto';

export type AnimalHealth =
  | 'Excelente'
  | 'Bom'
  | 'Regular'
  | 'Fraco'
  | 'Doente';

export type CoatColor =
  | 'Negro'
  | 'Castanho'
  | 'Retinto'
  | 'Colorado'
  | 'Jardineiro'
  | 'Bragado'
  | 'Cárdeno';

export type HornType =
  | 'Cornalón'
  | 'Veleto'
  | 'Astifino'
  | 'Playero'
  | 'Brocho'
  | 'Astillado';

/** Genetic and behavioural traits accumulated through life and selection. */
export interface AnimalTraits {
  bravery: number;       // 0–100 — charge instinct under pressure
  nobility: number;      // 0–100 — consistency and predictability in the ring
  mobility: number;      // 0–100 — agility and responsiveness
  stamina: number;       // 0–100 — capacity to sustain effort over time
  transmission: number;  // 0–100 — genetic inheritance potential (breeding value)
  fertility: number;     // 0–100 — reproductive success rate (females)
}

/** Permanent record of notable events in an animal's life. */
export interface AnimalHistoryEntry {
  date: SimDate;
  text: string;
  category: 'Birth' | 'Tentadero' | 'Corrida' | 'Health' | 'Transfer' | 'Death' | 'Other';
}

/** A living animal on the ranch or elsewhere in the simulation. */
export interface AnimalEntity {
  id: string;
  name: string;
  sex: AnimalSex;
  birthYear: number;
  birthMonth: Month;
  ageMonths: number;
  locationId: string;
  category: AnimalCategory;
  status: AnimalStatus;
  health: AnimalHealth;
  weight: number;
  coat: CoatColor;
  hornType: HornType;
  bloodlineId: string;
  fatherId: string | null;
  motherId: string | null;
  traits: AnimalTraits;
  /** Short-term observable state used by AI behaviour (not persisted long-term). */
  memory: string[];
  history: AnimalHistoryEntry[];
}

// ── Person ───────────────────────────────────────────────────────────────────

export type PersonRole =
  | 'Ganadeiro'
  | 'Maioral'
  | 'Campino'
  | 'Veterinario'
  | 'Administrador'
  | 'Empresario'
  | 'Jornalista';

export type PersonStatus = 'Active' | 'Absent' | 'Dismissed' | 'Retired';

export type PersonSpeciality =
  | 'AnimalHandling'
  | 'Veterinary'
  | 'Finance'
  | 'Negotiation'
  | 'Breeding'
  | 'Logistics'
  | 'None';

export interface PersonHistoryEntry {
  date: SimDate;
  text: string;
}

/** A person participating in the ranch simulation (staff, owner, external). */
export interface PersonEntity {
  id: string;
  name: string;
  role: PersonRole;
  age: number;
  locationId: string;
  experience: number;  // 0–100 — accumulated competence
  mood: number;        // 0–100 — current emotional state
  fatigue: number;     // 0–100 — accumulated tiredness
  loyalty: number;     // 0–100 — likelihood of staying with the ganaderia
  speciality: PersonSpeciality;
  status: PersonStatus;
  /** Short-term observable state used by dialogue and AI systems. */
  memory: string[];
  history: PersonHistoryEntry[];
}

// ── Location ─────────────────────────────────────────────────────────────────

export type LocationType =
  | 'Residence'
  | 'Office'
  | 'Corrals'
  | 'Tentadero'
  | 'Pasture'
  | 'Shipping'
  | 'Storage'
  | 'Water'
  | 'Workshop';

export type LocationCondition =
  | 'Excellent'
  | 'Good'
  | 'Regular'
  | 'Poor'
  | 'Damaged';

export type LocationNotification =
  | 'BrokenFence'
  | 'NeedsCleaning'
  | 'WaitingInspection'
  | 'Ready'
  | 'Busy'
  | 'VeterinaryAlert'
  | 'NewContract'
  | 'FinancialUpdate'
  | 'AnimalAttention';

export interface LocationHistoryEntry {
  date: SimDate;
  text: string;
}

/** A physical space on the ranch. Drives animal placement and condition decay. */
export interface LocationEntity {
  id: string;
  name: string;
  type: LocationType;
  condition: LocationCondition;
  capacity: number;
  currentOccupation: number;
  pastureQuality: number;  // 0–100 — grass availability (pastures only)
  waterLevel: number;      // 0–100 — trough/dam fill level
  shade: number;           // 0–100 — natural or artificial shade coverage
  fenceCondition: number;  // 0–100 — perimeter integrity
  cleanliness: number;     // 0–100 — hygiene state of the area
  notifications: LocationNotification[];
  history: LocationHistoryEntry[];
}

// ── Climate ──────────────────────────────────────────────────────────────────

export type WeatherType =
  | 'Sunny'
  | 'Cloudy'
  | 'Rain'
  | 'Fog'
  | 'Wind';

/** Ambient conditions that affect pasture, animal health, and work efficiency. */
export interface ClimateState {
  currentWeather: WeatherType;
  season: Season;
  rainfall: number;             // mm/month accumulated this month
  temperature: number;          // °C average
  droughtRisk: number;          // 0–100 — cumulative dry-spell pressure
  pastureGrowthModifier: number; // multiplier applied to pasture regeneration
  waterModifier: number;        // multiplier applied to water level changes
}

// ── Economy ──────────────────────────────────────────────────────────────────

export interface EconomyHistoryRecord {
  date: SimDate;
  income: number;
  expenses: number;
  profit: number;
  treasury: number;
  notes: string[];
}

/** Financial state of the ganaderia. */
export interface SimEconomyState {
  treasury: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  debt: number;
  payroll: number;
  feedingCosts: number;
  veterinaryCosts: number;
  maintenanceCosts: number;
  history: EconomyHistoryRecord[];
}

// ── Events ───────────────────────────────────────────────────────────────────

export type EventCategory =
  | 'Animals'
  | 'Economy'
  | 'Health'
  | 'Buildings'
  | 'Staff'
  | 'Weather'
  | 'Contracts'
  | 'Corrida'
  | 'Breeding'
  | 'Legacy';

export type EventSeverity = 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';

/** Something that happened in the simulation world. May spawn a decision. */
export interface GameEvent {
  id: string;
  date: SimDate;
  title: string;
  description: string;
  category: EventCategory;
  severity: EventSeverity;
  source: string;
  relatedAnimalId: string | null;
  relatedPersonId: string | null;
  relatedLocationId: string | null;
  resolved: boolean;
  consequences: string[];  // ids of Consequence entities generated by this event
}

// ── Decisions ────────────────────────────────────────────────────────────────

export interface DecisionChoice {
  id: string;
  label: string;
  description: string;
  consequences: string[];  // human-readable preview of expected outcomes
}

/** A player-facing choice generated by an event or simulation trigger. */
export interface DecisionRecord {
  id: string;
  date: SimDate;
  title: string;
  description: string;
  choices: DecisionChoice[];
  selectedChoice: string | null;
  relatedEventId: string | null;
  consequences: string[];  // ids of outcomes applied after resolution
  resolved: boolean;
}

// ── Ranch history ─────────────────────────────────────────────────────────────

export type HistoryImportance = 'Minor' | 'Notable' | 'Significant' | 'Historic';

export type HistoryCategory =
  | 'Animals'
  | 'Economy'
  | 'Buildings'
  | 'Staff'
  | 'Corrida'
  | 'Legacy'
  | 'Weather'
  | 'Other';

/** A permanent narrative record in the ganaderia's chronicle. */
export interface RanchHistoryEntry {
  id: string;
  date: SimDate;
  title: string;
  text: string;
  category: HistoryCategory;
  importance: HistoryImportance;
  relatedAnimalId: string | null;
  relatedPersonId: string | null;
  relatedLocationId: string | null;
}
