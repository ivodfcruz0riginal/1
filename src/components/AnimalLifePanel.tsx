import React from 'react';
import { useGameState } from '../store/gameState';
import { animalLifeService } from '../core/life/AnimalLifeService';
import type { AnimalLifeState, LifeStatus } from '../core/life/AnimalLife';

// ── Status styling ────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<LifeStatus, string> = {
  'Excelente':          'bg-emerald-900/30 text-emerald-400 border-emerald-600/30',
  'Bom':                'bg-green-900/30 text-green-400 border-green-600/30',
  'Normal':             'bg-amber-900/30 text-amber-400 border-amber-600/30',
  'Precisa de Atenção': 'bg-orange-900/30 text-orange-400 border-orange-600/30',
  'Crítico':            'bg-red-950/40 text-red-400 border-red-700/30',
};

// ── Bar ───────────────────────────────────────────────────────────────────────

function barColor(value: number, inverted: boolean): string {
  const e = inverted ? 100 - value : value;
  if (e >= 80) return 'bg-emerald-500';
  if (e >= 60) return 'bg-green-500';
  if (e >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

interface BarProps {
  label: string;
  value: number;
  inverted?: boolean;
}

const LifeBar: React.FC<BarProps> = ({ label, value, inverted = false }) => {
  const color = barColor(value, inverted);
  const textColor = color.replace('bg-', 'text-');
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-ivory/50 text-[11px] font-body uppercase tracking-wider">{label}</span>
        <span className={`font-display text-sm w-7 text-right ${textColor}`}>{value}</span>
      </div>
      <div className="h-2 bg-leather-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { animalId: string }

const AnimalLifePanel: React.FC<Props> = ({ animalId }) => {
  const { state } = useGameState();
  const lifeState: AnimalLifeState | undefined = state.animalLifeStates[animalId];

  if (!lifeState) return null;

  const status = animalLifeService.getLifeStatus(lifeState);

  return (
    <div>
      {/* Section header + status badge */}
      <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-leather-700/30">
        <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gold/55">
          Estado Actual
        </p>
        <span className={`text-[10px] font-body border rounded-full px-2.5 py-0.5 uppercase tracking-wider ${STATUS_STYLE[status]}`}>
          {status}
        </span>
      </div>

      {/* Condition bars */}
      <div className="space-y-3.5">
        <LifeBar label="Condição Corporal" value={lifeState.bodyCondition} />
        <LifeBar label="Hidratação"         value={lifeState.hydration} />
        <LifeBar label="Saúde Geral"        value={lifeState.health} />
        <LifeBar label="Stress"             value={lifeState.stress}   inverted />
        <LifeBar label="Fadiga"             value={lifeState.fatigue}  inverted />
        <LifeBar label="Condição Muscular"  value={lifeState.muscleCondition} />
      </div>

      {/* Weight as data point */}
      <div className="mt-3.5 pt-3 border-t border-leather-700/25 flex items-center justify-between">
        <span className="text-ivory/40 text-[11px] font-body uppercase tracking-wider">Peso Actual</span>
        <span className="font-display text-base text-ivory/85">{lifeState.weight} kg</span>
      </div>
    </div>
  );
};

export default AnimalLifePanel;
