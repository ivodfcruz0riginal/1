export type ConsequenceCategory =
  | 'Animals'
  | 'Economy'
  | 'Health'
  | 'Buildings'
  | 'Staff'
  | 'Weather'
  | 'Contracts';

export type ConsequenceSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface GameDate {
  month: string;
  year: number;
}

export interface Consequence {
  id: string;
  creationDate: GameDate;
  triggerDate: GameDate;
  title: string;
  description: string;
  category: ConsequenceCategory;
  severity: ConsequenceSeverity;
  triggered: boolean;
  resolved: boolean;
  sourceDecision?: string;
  relatedAnimalId?: string;
  relatedLocationId?: string;
}
