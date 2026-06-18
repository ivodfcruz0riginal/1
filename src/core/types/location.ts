/** Core location entity — a physical space on the ranch that holds animals and triggers events. */

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
  date: { month: string; year: number };
  text: string;
}

export interface LocationEntity {
  id: string;
  name: string;
  type: LocationType;
  condition: LocationCondition;
  capacity: number;
  currentOccupation: number;
  pastureQuality: number;  // 0–100 — grass availability (pastures only)
  waterLevel: number;      // 0–100 — trough or dam fill level
  shade: number;           // 0–100 — natural or artificial shade coverage
  fenceCondition: number;  // 0–100 — perimeter integrity
  cleanliness: number;     // 0–100 — hygiene state of the area
  notifications: LocationNotification[];
  history: LocationHistoryEntry[];
}
