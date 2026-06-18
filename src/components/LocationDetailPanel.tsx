import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../store/gameState';
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_LABELS,
  CONDITION_COLOR,
  CONDITION_BG,
  TYPE_LABELS,
  occupancyRatio,
  getLocationById,
} from '../services/locationService';

const LocationDetailPanel: React.FC = () => {
  const { state, setActiveLocation } = useGameState();
  const navigate = useNavigate();
  const { locations, activeLocationId } = state;

  if (!activeLocationId) return null;

  const location = getLocationById(locations, activeLocationId);
  if (!location) return null;

  const ratio = occupancyRatio(location);

  const handleNavigate = () => {
    setActiveLocation(null);
    if (location.linkedScreen) navigate(location.linkedScreen);
  };

  const handleClose = () => setActiveLocation(null);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm mx-4 rounded-lg overflow-hidden shadow-2xl"
        style={{ border: '1px solid rgba(201,162,39,0.35)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4"
          style={{ background: 'linear-gradient(90deg, #1a1108 0%, #241608 50%, #1a1108 100%)' }}
        >
          {/* Type + condition row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-ivory/40 text-[9px] font-body uppercase tracking-[0.2em]">
              {TYPE_LABELS[location.type]}
            </span>
            <span
              className={`text-[9px] font-body uppercase tracking-wider px-2 py-0.5 rounded border ${CONDITION_BG[location.condition]} ${CONDITION_COLOR[location.condition]}`}
            >
              {location.condition}
            </span>
          </div>

          <h2 className="font-display text-lg text-gold tracking-widest uppercase leading-tight">
            {location.name}
          </h2>
        </div>

        {/* Thin separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

        {/* Body — parchment */}
        <div
          className="px-5 py-4 space-y-4"
          style={{ background: 'linear-gradient(150deg, #f5ead0 0%, #ecdcb8 100%)' }}
        >
          {/* Description */}
          <p className="text-leather-800 text-sm font-body leading-relaxed">
            {location.description}
          </p>

          {/* Capacity bar (only if capacity > 0) */}
          {location.capacity > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-leather-700 text-[10px] font-body uppercase tracking-wider">
                  Ocupação
                </span>
                <span className="text-leather-700 text-[10px] font-body">
                  {location.currentOccupation} / {location.capacity}
                </span>
              </div>
              <div className="h-1.5 bg-leather-600/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    ratio > 0.85 ? 'bg-red-500/70' :
                    ratio > 0.6  ? 'bg-amber-500/70' :
                                   'bg-emerald-500/70'
                  }`}
                  style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          {location.notifications.length > 0 && (
            <div>
              <p className="text-leather-700 text-[10px] font-body uppercase tracking-wider mb-2">
                Notificações
              </p>
              <div className="flex flex-wrap gap-1.5">
                {location.notifications.map(n => (
                  <div
                    key={n}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-leather-800/15 border border-leather-600/25"
                  >
                    <span className="text-sm leading-none">{NOTIFICATION_ICONS[n]}</span>
                    <span className="text-leather-700 text-[10px] font-body">{NOTIFICATION_LABELS[n]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {location.notes && (
            <p className="text-leather-600 text-xs font-body italic border-t border-leather-500/20 pt-3">
              {location.notes}
            </p>
          )}
        </div>

        {/* Footer buttons */}
        <div
          className="px-5 py-3 flex items-center justify-between gap-3"
          style={{ background: '#1a1108', borderTop: '1px solid rgba(201,162,39,0.2)' }}
        >
          <button
            onClick={handleClose}
            className="text-ivory/40 text-xs font-body hover:text-ivory/70 transition-colors"
          >
            Fechar
          </button>

          {location.linkedScreen && (
            <button
              onClick={handleNavigate}
              className="flex items-center gap-2 px-4 py-1.5 rounded border border-gold/40 text-gold/80 text-xs font-body hover:border-gold hover:text-gold transition-all duration-200"
            >
              Abrir {location.name}
              <span className="text-gold/50">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetailPanel;
