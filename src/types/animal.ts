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

export type HealthStatus =
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

export type Month =
  | 'Janeiro' | 'Fevereiro' | 'Março' | 'Abril' | 'Maio' | 'Junho'
  | 'Julho' | 'Agosto' | 'Setembro' | 'Outubro' | 'Novembro' | 'Dezembro';

export interface Animal {
  id: string;
  name: string;
  sex: AnimalSex;
  // Legacy integer age in full years (kept for backwards compat, derived from exactAgeMonths)
  age: number;
  birthYear: number;
  birthMonth: Month;
  exactAgeMonths: number;
  ageYears: number;
  weight: number;
  health: HealthStatus;
  coat: CoatColor;
  hornType: HornType;
  bloodline: string;
  category: AnimalCategory;
  status: AnimalStatus;
  fatherId?: string;
  motherId?: string;
  bravery: number;
  nobility: number;
  mobility: number;
  stamina: number;
  transmission: number;
  fertility: number;
  approvedForBreeding: boolean;
  rejected: boolean;
  hasFought: boolean;
  notes: string;
  // Monthly simulation fields (optional for backwards compat with static seed data)
  bodyCondition?: number;  // 0–100 overall physical condition
  hydration?: number;      // 0–100
  stress?: number;         // 0–100 (high is bad)
  fatigue?: number;        // 0–100 (high is bad)
  monthlyNotes?: string;   // note from the most recent monthly update
}
