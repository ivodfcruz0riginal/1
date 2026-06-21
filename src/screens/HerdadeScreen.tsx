import React from 'react';
import RanchMap from '../components/RanchMap';
import MaioralDialogue from '../components/MaioralDialogue';
import TasksPanel from '../components/TasksPanel';
import DirectorCard from '../components/DirectorCard';
import LocationDetailPanel from '../components/LocationDetailPanel';
import GameplayObjectiveCard from '../components/GameplayObjectiveCard';
import { useDayCycle } from '../hooks/useDayCycle';

const HerdadeScreen: React.FC = () => {
  const dayCycle = useDayCycle();

  return (
    <>
      {/* Weather & Time — top right */}
      <div className="absolute top-5 right-6 z-20 flex gap-3">
        <div className="bg-leather-900/90 border border-gold/30 rounded-lg px-5 py-3 shadow-xl backdrop-blur-sm">
          <p className="text-ivory/50 text-[10px] font-body uppercase tracking-wider">Condições</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-amber-400 text-lg">{dayCycle.weatherIcon}</span>
            <p className="font-display text-lg text-ivory">{dayCycle.temperature}°C</p>
          </div>
          <p className="text-ivory/40 text-xs font-body">{dayCycle.weatherLabel}</p>
        </div>
        <div className="bg-leather-900/90 border border-gold/30 rounded-lg px-5 py-3 shadow-xl backdrop-blur-sm">
          <p className="text-ivory/50 text-[10px] font-body uppercase tracking-wider">Hora</p>
          <p className="font-display text-2xl text-gold mt-1">{dayCycle.timeString}</p>
          <p className="text-ivory/40 text-xs font-body">{dayCycle.periodLabel}</p>
        </div>
      </div>

      <RanchMap />
      <TasksPanel />
      <DirectorCard />
      <GameplayObjectiveCard />
      <LocationDetailPanel />
      <MaioralDialogue />
    </>
  );
};

export default HerdadeScreen;
