import type { GameState } from '../store/gameTypes';

export type StatusLevel = 'ok' | 'warn' | 'critical';

export interface LocationStatus {
  level: StatusLevel;
  message: string;
}

function fromCondition(condition: string): StatusLevel | null {
  if (condition === 'Damaged') return 'critical';
  if (condition === 'Poor')    return 'warn';
  return null;
}

export function deriveLocationStatus(locationId: string, state: GameState): LocationStatus {
  const loc = state.locations.find(l => l.id === locationId);
  if (!loc) return { level: 'ok', message: 'Sem informação disponível.' };

  switch (locationId) {

    case 'cercado_norte':
    case 'cercado_sul': {
      const fence   = loc.fenceCondition  ?? 100;
      const pasture = loc.pastureQuality  ?? 100;
      const cond    = fromCondition(loc.condition);
      const brokenFence = loc.notifications.includes('BrokenFence');
      const pendingFence = locationId === 'cercado_norte' && !!state.pendingFenceConsequence;

      if (brokenFence || fence < 25 || (pendingFence && state.pendingFenceConsequence === 'ignored')) {
        return { level: 'critical', message: 'Vedação danificada. Risco de fuga.' };
      }
      if (cond === 'critical' || pasture < 25) {
        return { level: 'critical', message: 'Pastagem esgotada. Animais em risco.' };
      }
      if (fence < 55 || pendingFence) {
        return { level: 'warn', message: 'Vedação necessita de reparação.' };
      }
      if (pasture < 50 || cond === 'warn') {
        return { level: 'warn', message: 'Pastagem degradada. Atenção recomendada.' };
      }
      return { level: 'ok', message: 'Pastagem e vedação em boas condições.' };
    }

    case 'barragem': {
      const water = loc.waterLevel ?? 100;
      if (water < 20) return { level: 'critical', message: `Nível de água crítico (${water}%).` };
      if (water < 45) return { level: 'warn',     message: `Nível de água baixo (${water}%).` };
      return { level: 'ok', message: `Barragem em boas condições (${water}%).` };
    }

    case 'currais': {
      const clean = loc.cleanliness ?? 100;
      const cond  = fromCondition(loc.condition);
      const notif = loc.notifications.length > 0;
      if (cond === 'critical' || clean < 20) {
        return { level: 'critical', message: 'Currais em estado crítico.' };
      }
      if (cond === 'warn' || clean < 50 || notif) {
        return { level: 'warn', message: 'Currais necessitam de atenção.' };
      }
      return { level: 'ok', message: 'Currais limpos e operacionais.' };
    }

    case 'tentadero': {
      const cond = fromCondition(loc.condition);
      if (cond === 'critical') return { level: 'critical', message: 'Tentadero com danos graves.' };
      if (cond === 'warn')     return { level: 'warn',     message: 'Tentadero necessita de manutenção.' };
      return { level: 'ok', message: 'Tentadero em condições.' };
    }

    case 'escritorio': {
      if (state.notifications.escritorio) {
        return { level: 'warn', message: 'Documentação pendente no Escritório.' };
      }
      return { level: 'ok', message: 'Escritório operacional.' };
    }

    case 'casa': {
      if (state.notifications.casa) {
        return { level: 'warn', message: 'Requer atenção na Casa Principal.' };
      }
      return { level: 'ok', message: 'Casa Principal em ordem.' };
    }

    case 'embarque': {
      const cond  = fromCondition(loc.condition);
      const notif = loc.notifications.length > 0 || !!state.notifications.embarque;
      if (cond === 'critical') return { level: 'critical', message: 'Parque de Embarque com avaria.' };
      if (cond === 'warn' || notif) return { level: 'warn', message: 'Verificar Parque de Embarque.' };
      return { level: 'ok', message: 'Parque de Embarque operacional.' };
    }

    default: {
      const cond = fromCondition(loc.condition);
      if (cond === 'critical') return { level: 'critical', message: 'Estado crítico.' };
      if (cond === 'warn')     return { level: 'warn',     message: 'Necessita de atenção.' };
      return { level: 'ok', message: 'Sem problemas conhecidos.' };
    }
  }
}
