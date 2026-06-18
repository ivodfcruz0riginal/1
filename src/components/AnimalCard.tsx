import React from 'react';
import { Animal, AnimalCategory, HealthStatus } from '../types/animal';
import { formatAge } from '../utils/animalGrowth';

const coatColors: Record<string, string> = {
  'Negro': '#1a1a2e',
  'Castanho': '#8B4513',
  'Retinto': '#6B2A0F',
  'Colorado': '#C47A2B',
  'Jardineiro': '#4A5C2A',
  'Bragado': '#3D2B1F',
  'Cárdeno': '#5A5A7A',
};

const categoryBadgeColors: Record<AnimalCategory, string> = {
  'Semental': 'bg-gold/20 text-gold border-gold/30',
  'Vaca': 'bg-rose-900/30 text-rose-300 border-rose-500/30',
  'Novilha': 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30',
  'Macho de Corrida': 'bg-amber-900/30 text-amber-300 border-amber-500/30',
  'Cabresto': 'bg-leather-700/50 text-ivory/60 border-leather-500/30',
  'Bezerro': 'bg-sky-900/30 text-sky-300 border-sky-500/30',
  'Bezerra': 'bg-sky-900/30 text-sky-300 border-sky-500/30',
  'Novilho': 'bg-teal-900/30 text-teal-300 border-teal-500/30',
  'Utrero': 'bg-orange-900/30 text-orange-300 border-orange-500/30',
};

const categoryShortLabel: Record<AnimalCategory, string> = {
  'Semental': 'Semental',
  'Vaca': 'Vaca',
  'Novilha': 'Novilha',
  'Macho de Corrida': 'Corrida',
  'Cabresto': 'Cabresto',
  'Bezerro': 'Bezerro',
  'Bezerra': 'Bezerra',
  'Novilho': 'Novilho',
  'Utrero': 'Utrero',
};

const statusColors: Record<string, string> = {
  'Ativo': 'bg-emerald-500',
  'Lesionado': 'bg-amber-400',
  'Reformado': 'bg-leather-500',
  'Vendido': 'bg-blue-400',
  'Morto': 'bg-red-800',
};

const healthColors: Record<HealthStatus, string> = {
  'Excelente': 'text-emerald-400',
  'Bom': 'text-green-400',
  'Regular': 'text-amber-400',
  'Fraco': 'text-orange-400',
  'Doente': 'text-red-400',
};

interface StatBarProps {
  value: number;
  color?: string;
}

const StatBar: React.FC<StatBarProps> = ({ value, color = 'bg-gold' }) => (
  <div className="h-1 bg-leather-700/60 rounded-full overflow-hidden">
    <div
      className={`h-full ${color} rounded-full transition-all duration-500`}
      style={{ width: `${value}%` }}
    />
  </div>
);

interface AnimalCardProps {
  animal: Animal;
  isSelected: boolean;
  onClick: () => void;
  fatherName?: string;
  motherName?: string;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, isSelected, onClick }) => {
  const statColor =
    animal.bravery >= 90 ? 'bg-gold' :
    animal.bravery >= 80 ? 'bg-amber-500' :
    animal.bravery >= 70 ? 'bg-amber-700' : 'bg-leather-500';

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 overflow-hidden group
        ${isSelected
          ? 'border-gold bg-leather-700/60 shadow-premium'
          : 'border-leather-600/50 bg-leather-800/50 hover:border-gold/50 hover:bg-leather-700/40'
        }`}
    >
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />
      )}

      {/* Animal silhouette area */}
      <div
        className="h-20 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: `${coatColors[animal.coat]}22` }}
      >
        <div
          className="w-16 h-12 rounded-full opacity-60 flex items-center justify-center"
          style={{ backgroundColor: coatColors[animal.coat] }}
        >
          <span className="text-2xl">
            {animal.sex === 'Macho' ? '🐂' : '🐄'}
          </span>
        </div>
        <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${statusColors[animal.status]}`} />
        {animal.hasFought && (
          <div className="absolute top-2 left-2 bg-red-900/70 border border-red-600/50 rounded px-1 py-0.5">
            <span className="text-red-300 text-[9px] font-body uppercase tracking-wider">Lidado</span>
          </div>
        )}
        {animal.rejected && (
          <div className="absolute bottom-2 left-2 bg-red-900/70 border border-red-600/50 rounded px-1 py-0.5">
            <span className="text-red-300 text-[9px] font-body uppercase tracking-wider">Rejeitado</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <h3 className={`font-display text-sm tracking-wide truncate ${isSelected ? 'text-gold' : 'text-ivory group-hover:text-gold/90'} transition-colors`}>
            {animal.name}
          </h3>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 font-body ${categoryBadgeColors[animal.category]}`}>
            {categoryShortLabel[animal.category]}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-ivory/50 text-[11px] font-body">{formatAge(animal.exactAgeMonths)}</span>
          <span className="text-leather-500">·</span>
          <span className="text-ivory/50 text-[11px] font-body">{animal.weight}kg</span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-body ${healthColors[animal.health]}`}>{animal.health}</span>
          <span className="text-leather-500">·</span>
          <span className="text-ivory/40 text-[11px] font-body truncate">{animal.bloodline}</span>
        </div>

        {/* Stat bars */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-ivory/40 text-[9px] font-body w-10 uppercase tracking-wider">Brav</span>
            <div className="flex-1">
              <StatBar value={animal.bravery} color={statColor} />
            </div>
            <span className="text-ivory/60 text-[10px] font-body w-5 text-right">{animal.bravery}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-ivory/40 text-[9px] font-body w-10 uppercase tracking-wider">Nob</span>
            <div className="flex-1">
              <StatBar value={animal.nobility} color="bg-amber-600/70" />
            </div>
            <span className="text-ivory/60 text-[10px] font-body w-5 text-right">{animal.nobility}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-ivory/40 text-[9px] font-body w-10 uppercase tracking-wider">Mob</span>
            <div className="flex-1">
              <StatBar value={animal.mobility} color="bg-emerald-700/70" />
            </div>
            <span className="text-ivory/60 text-[10px] font-body w-5 text-right">{animal.mobility}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-ivory/40 text-[9px] font-body w-10 uppercase tracking-wider">Fôl</span>
            <div className="flex-1">
              <StatBar value={animal.stamina} color="bg-sky-700/70" />
            </div>
            <span className="text-ivory/60 text-[10px] font-body w-5 text-right">{animal.stamina}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;
