/** Game event — something notable that happened in the simulation world. */

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

export interface GameEvent {
  id: string;
  date: { month: string; year: number };
  title: string;
  description: string;
  category: EventCategory;
  severity: EventSeverity;
  /** Identifier of the system or trigger that generated this event. */
  source: string;
  relatedAnimalId: string | null;
  relatedPersonId: string | null;
  relatedLocationId: string | null;
  resolved: boolean;
  /** Ids of Consequence entities spawned by this event. */
  consequences: string[];
}
