import React from 'react';
import { useGameState } from '../store/gameState';

const scheduledEvents = [
  { date: '15 Mar', title: 'Tienta - Cercado Norte', type: 'tienta' as const },
  { date: '18 Mar', title: 'Corrida - Lisboa', type: 'race' as const },
  { date: '22 Mar', title: 'Leilão - Évora', type: 'sale' as const },
  { date: '25 Mar', title: 'Reprodução - Temporada', type: 'breeding' as const },
];

const eventIcons = {
  race: '🏇',
  breeding: '❤️',
  tienta: '🎯',
  sale: '💰',
} as const;

const NewsPanel: React.FC = () => {
  const { state } = useGameState();
  const { eventLog } = state;

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Event log */}
      <div className="bg-leather-800/40 border border-leather-600/40 rounded-lg p-3 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-leather-600/40">
          <h3 className="font-display text-sm text-gold tracking-wider uppercase">Diário</h3>
          <div className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full font-semibold">
            {eventLog.length}
          </div>
        </div>
        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {eventLog.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-2 rounded transition-colors ${
                index === 0
                  ? 'bg-gold/10 border border-gold/20'
                  : 'bg-leather-700/30 hover:bg-leather-700/60'
              }`}
            >
              <span className="text-ivory/40 text-[10px] font-body w-14 shrink-0 mt-0.5">
                {item.month.slice(0, 3)} {item.year}
              </span>
              <p className={`text-sm font-body leading-snug ${
                index === 0 ? 'text-ivory/95' : 'text-ivory/80'
              }`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-leather-800/40 border border-leather-600/40 rounded-lg p-3 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-leather-600/40">
          <h3 className="font-display text-sm text-gold tracking-wider uppercase">Eventos</h3>
          <span className="text-ivory/40 text-xs hover:text-gold cursor-pointer transition-colors">Ver todos</span>
        </div>
        <div className="space-y-1 flex-1 overflow-y-auto">
          {scheduledEvents.map((event, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-leather-700/30 rounded hover:bg-leather-700/60 transition-colors cursor-pointer group"
            >
              <span className="text-base">{eventIcons[event.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-ivory/90 text-sm font-body truncate group-hover:text-gold transition-colors">{event.title}</p>
              </div>
              <span className="text-ivory/40 text-xs group-hover:text-gold/70 transition-colors">{event.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-leather-800/40 border border-leather-600/40 rounded-lg p-3 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-leather-600/40">
          <h3 className="font-display text-sm text-gold tracking-wider uppercase">Economia</h3>
          <span className="text-ivory/40 text-xs">
            {state.month.slice(0, 3)} {state.year}
          </span>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-leather-700/30 rounded p-2 border-l-2 border-emerald-500/50">
              <p className="text-ivory/50 text-xs font-body">Receitas</p>
              <p className="font-display text-base text-emerald-400">+12.500€</p>
            </div>
            <div className="bg-leather-700/30 rounded p-2 border-l-2 border-red-400/50">
              <p className="text-ivory/50 text-xs font-body">Despesas</p>
              <p className="font-display text-base text-red-400">-8.200€</p>
            </div>
          </div>

          <div className="bg-leather-700/20 rounded p-2 flex-1">
            <p className="text-ivory/40 text-xs font-body mb-1">Tendência Anual</p>
            <div className="flex items-end gap-0.5 h-10">
              {[25, 40, 35, 55, 45, 65, 55, 70, 60, 50, 55, 75].map((height, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-colors hover:bg-gold ${
                    i === 11 ? 'bg-gold' : 'bg-gold/25'
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-leather-600/40 flex justify-between items-center">
            <span className="text-ivory/50 text-xs">Balanço</span>
            <span className="font-display text-gold text-lg">+4.300€</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPanel;
