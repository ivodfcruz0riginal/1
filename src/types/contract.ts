import type { Month } from './animal';

export type ContractStatus = 'Pendente' | 'Aceite' | 'Concluído' | 'Cancelado';

export interface BullightContract {
  id: string;
  instanceId: string;        // unique per game instance
  // Offer details
  placeId: string;           // bullring identifier
  placeName: string;         // "Praça de Coruche"
  city: string;
  performanceMonth: Month;
  performanceYear: number;
  bullsRequired: number;
  basePayment: number;       // in euros
  negotiatedPayment: number; // may differ after negotiation
  // Animals reserved for this contract
  reservedAnimalIds: string[];
  // State
  status: ContractStatus;
  offeredMonth: Month;
  offeredYear: number;
  acceptedMonth: Month | null;
  acceptedYear: number | null;
  // Letter text displayed to player
  letterText: string;
  // Flags
  isFirstContract: boolean;
}

export interface ContractOffer {
  contractId: string;
  placeName: string;
  city: string;
  performanceMonth: Month;
  performanceYear: number;
  bullsRequired: number;
  basePayment: number;
  letterText: string;
  isFirstContract: boolean;
}
