import type { ContractOffer } from '../types/contract';

let _contractInstanceCounter = 0;

export function nextContractInstanceId(): string {
  return `cnt-${++_contractInstanceCounter}-${Date.now()}`;
}

// ── First contract offer ──────────────────────────────────────────────────────
// Triggered after 2 simulated months when prestige > 0 and >= 2 suitable bulls.

export const FIRST_CONTRACT_OFFER: ContractOffer = {
  contractId: 'ctr_001',
  placeName: 'Praça de Touros de Coruche',
  city: 'Coruche',
  performanceMonth: 'Setembro',
  performanceYear: 0, // overridden at trigger time
  bullsRequired: 2,
  basePayment: 4500,
  letterText:
    'Exmo. Ganadeiro,\n\n' +
    'A Empresa da Praça de Touros de Coruche pretende contratar dois toiros ' +
    'da vossa ganaderia para a corrida de Setembro próximo.\n\n' +
    'Trata-se de uma oportunidade de apresentar o efectivo da Herdade da Ferraria ' +
    'ao público coruchense, que muito aprecia animais de qualidade e bravura.\n\n' +
    'A remuneração proposta é de 4.500€ pelos dois animais, ' +
    'podendo ser discutida consoante a qualidade do efectivo.\n\n' +
    'Aguardamos resposta com brevidade.\n\n' +
    'Com os melhores cumprimentos,\nEmpresa Tauromáquica de Coruche',
  isFirstContract: true,
};
