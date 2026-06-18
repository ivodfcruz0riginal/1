/** Core animal entity — a fighting bull or breeding cow on the ganaderia. */

export type Month =
  | 'Janeiro' | 'Fevereiro' | 'Março' | 'Abril' | 'Maio' | 'Junho'
  | 'Julho' | 'Agosto' | 'Setembro' | 'Outubro' | 'Novembro' | 'Dezembro';

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

/** Genetic and behavioural traits shaped by bloodline and selection. */
export interface AnimalTraits {
  bravery: number;       // 0–100 — charge instinct under pressure
  nobility: number;      // 0–100 — consistency and regularity in performance
  mobility: number;      // 0–100 — agility and responsiveness
  stamina: number;       // 0–100 — capacity to sustain effort over time
  transmission: number;  // 0–100 — genetic inheritance potential
  fertility: number;     // 0–100 — reproductive success rate (females)
}

export interface AnimalHistoryEntry {
  date: { month: Month; year: number };
  text: string;
  category: 'Birth' | 'Tentadero' | 'Corrida' | 'Health' | 'Transfer' | 'Death' | 'Other';
}

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
