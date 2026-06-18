/** Core person entity — anyone who participates in the ranch simulation. */

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
  date: { month: string; year: number };
  text: string;
}

export interface PersonEntity {
  id: string;
  name: string;
  role: PersonRole;
  age: number;
  locationId: string;
  experience: number;  // 0–100 — accumulated competence in their role
  mood: number;        // 0–100 — current emotional state
  fatigue: number;     // 0–100 — accumulated tiredness
  loyalty: number;     // 0–100 — likelihood of staying with the ganaderia
  speciality: PersonSpeciality;
  status: PersonStatus;
  /** Short-term observable state used by dialogue and AI systems. */
  memory: string[];
  history: PersonHistoryEntry[];
}
