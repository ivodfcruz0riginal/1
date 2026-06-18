export type AnimalSex = 'Macho' | 'Fêmea';

export type AnimalCategory =
  | 'Semental'
  | 'Vaca'
  | 'Novilha'
  | 'Macho de Corrida'
  | 'Cabresto';

export type AnimalStatus =
  | 'Ativo'
  | 'Lesionado'
  | 'Reformado'
  | 'Vendido'
  | 'Morto';

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

export interface Animal {
  id: string;
  name: string;
  sex: AnimalSex;
  age: number;
  birthYear: number;
  weight: number;
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
}
