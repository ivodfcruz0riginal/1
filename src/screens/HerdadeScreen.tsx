import React, { useState, useEffect } from 'react';
import RanchMap, { getTimeOfDay } from '../components/RanchMap';
import MaioralDialogue from '../components/MaioralDialogue';
import TasksPanel from '../components/TasksPanel';
import LocationDetailPanel from '../components/LocationDetailPanel';
import GuidedTour from '../components/GuidedTour';
import { useGameState } from '../store/gameState';

const AMBIENT_KEY = 'herdade_ambient_enabled';

interface Props {
  showTour: boolean;
  onTourComplete: () => void;
}

const HerdadeScreen: React.FC<Props> = ({ showTour, onTourComplete }) => {
  const [tourHighlightId, setTourHighlightId] = useState<string | null>(null);
  const [ambientEnabled, setAmbientEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(AMBIENT_KEY) !== '0'; } catch { return true; }
  });

  const { state } = useGameState();
  const tod = getTimeOfDay(state.month, state.year);
  const weather = state.weather;

  useEffect(() => {
    try { localStorage.setItem(AMBIENT_KEY, ambientEnabled ? '1' : '0'); } catch {}
  }, [ambientEnabled]);

  return (
    <>
      {/* Pinned objective — top left */}
      {state.pinnedObjective && (
        <div className="absolute top-5 left-6 z-20 max-w-xs">
          <div className="bg-leather-900/90 border border-gold/30 rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm">
            <p className="text-ivory/50 text-[9px] font-body uppercase tracking-wider mb-1">Objectivo do Mês</p>
            <div className="flex items-start gap-2">
              <span className="text-gold text-sm shrink-0 mt-0.5">★</span>
              <p className="text-ivory/85 text-xs font-body leading-snug">{state.pinnedObjective}</p>
            </div>
          </div>
        </div>
      )}

      {/* Weather & Time — top right */}
      <div className="absolute top-5 right-6 z-20 flex gap-3">
        <div className="bg-leather-900/90 border border-gold/30 rounded-lg px-5 py-3 shadow-xl backdrop-blur-sm">
          <p className="text-ivory/50 text-xs font-body uppercase tracking-wider">Condições</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-amber-400">{weather.icon}</span>
            <p className="font-display text-lg text-ivory">{weather.temp}</p>
          </div>
          <p className="text-ivory/40 text-xs font-body">{weather.desc}</p>
        </div>
        <div className="bg-leather-900/90 border border-gold/30 rounded-lg px-5 py-3 shadow-xl backdrop-blur-sm">
          <p className="text-ivory/50 text-xs font-body uppercase tracking-wider">Hora</p>
          <p className="font-display text-2xl text-gold mt-1">{tod.time}</p>
          <p className="text-ivory/40 text-xs font-body">{tod.label}</p>
        </div>
      </div>

      {/* Ambient toggle — bottom right */}
      <div className="absolute bottom-5 right-6 z-20">
        <button
          onClick={() => setAmbientEnabled(e => !e)}
          className="flex items-center gap-2 bg-leather-900/80 border border-leather-600/40 hover:border-gold/30 rounded px-3 py-1.5 transition-all duration-200 backdrop-blur-sm"
        >
          <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${ambientEnabled ? 'bg-emerald-500/80' : 'bg-leather-500/60'}`} />
          <span className="text-ivory/30 hover:text-ivory/55 text-[10px] font-body uppercase tracking-widest transition-colors">
            Ambiente
          </span>
        </button>
      </div>

      <RanchMap highlightedId={showTour ? tourHighlightId : null} ambientEnabled={ambientEnabled} />
      <TasksPanel />
      <LocationDetailPanel />
      <MaioralDialogue />

      {showTour && (
        <GuidedTour
          onHighlight={setTourHighlightId}
          onComplete={onTourComplete}
        />
      )}
    </>
  );
};

export default HerdadeScreen;
