/** Ranch history entry — a permanent narrative record in the ganaderia's chronicle. */

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

export interface RanchHistoryEntry {
  id: string;
  date: { month: string; year: number };
  title: string;
  text: string;
  category: HistoryCategory;
  importance: HistoryImportance;
  relatedAnimalId: string | null;
  relatedPersonId: string | null;
  relatedLocationId: string | null;
}
