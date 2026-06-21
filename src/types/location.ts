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

export interface Location {
  id: LocationId;
  name: string;
  description: string;
  type: LocationType;
  condition: LocationCondition;
  capacity: number;
  currentOccupation: number;
  notifications: LocationNotification[];
  isClickable: boolean;
  linkedScreen?: string;
  notes: string;
  // Monthly simulation fields (optional for backwards compat with seed data)
  pastureQuality?: number;  // 0-100, Pasture types only
  waterLevel?: number;      // 0-100, Water type only
  fenceCondition?: number;  // 0-100, Pasture + Corrals
  cleanliness?: number;     // 0-100, all types
}
