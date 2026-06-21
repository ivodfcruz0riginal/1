import React, { useState } from 'react';
import RanchMap from '../components/RanchMap';
import MaioralDialogue from '../components/MaioralDialogue';
import TasksPanel from '../components/TasksPanel';
import LocationDetailPanel from '../components/LocationDetailPanel';
import GuidedTour from '../components/GuidedTour';

interface Props {
  showTour: boolean;
  onTourComplete: () => void;
}

const HerdadeScreen: React.FC<Props> = ({ showTour, onTourComplete }) => {
  const [tourHighlightId, setTourHighlightId] = useState<string | null>(null);

  return (
    <>
      {/* Weather & Time — top right */}
      <div className="absolute top-5 right-6 z-20 flex gap-3">
        <div className="bg-leather-900/90 border border-gold/30 rounded-lg px-5 py-3 shadow-xl backdrop-blur-sm">
          <p className="text-ivory/50 text-xs font-body uppercase tracking-wider">Condições</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-amber-400">☀</span>
            <p className="font-display text-lg text-ivory">22°C</p>
          </div>
          <p className="text-ivory/40 text-xs font-body">Seco, sem vento</p>
        </div>
        <div className="bg-leather-900/90 border border-gold/30 rounded-lg px-5 py-3 shadow-xl backdrop-blur-sm">
          <p className="text-ivory/50 text-xs font-body uppercase tracking-wider">Hora</p>
          <p className="font-display text-2xl text-gold mt-1">17:45</p>
          <p className="text-ivory/40 text-xs font-body">Pôr do sol</p>
        </div>
      </div>

      <RanchMap highlightedId={showTour ? tourHighlightId : null} />
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
