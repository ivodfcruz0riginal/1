import React from 'react';

const NewsPanel: React.FC = () => {
  const news = [
    { date: '12 Mar', title: 'Vitória em Sevilha', type: 'success' },
    { date: '10 Mar', title: 'Nova Aquisição de Novilhas', type: 'info' },
    { date: '08 Mar', title: 'Alerta Sanitário - Vacinação', type: 'warning' },
  ];

  const events = [
    { date: '15 Mar', title: 'Tienta - Cercado Norte', type: 'tienta' },
    { date: '18 Mar', title: 'Corrida - Lisboa', type: 'race' },
    { date: '22 Mar', title: 'Leilão - Évora', type: 'sale' },
    { date: '25 Mar', title: 'Reprodução - Temporada', type: 'breeding' },
  ];

  const typeColors = {
    info: 'text-gold',
    warning: 'text-amber-400',
    success: 'text-emerald-400',
  };

  const eventIcons = {
    race: '🏇',
    breeding: '❤️',
    tienta: '🎯',
    sale: '💰',
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Recent News */}
      <div className="bg-leather-800/40 border border-leather-600/40 rounded-lg p-3 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-leather-600/40">
          <h3 className="font-display text-sm text-gold tracking-wider uppercase">Jornal</h3>
          <div className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full font-semibold">3</div>
        </div>
        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {news.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 bg-leather-700/30 rounded hover:bg-leather-700/60 transition-colors cursor-pointer group"
            >
              <span className="text-ivory/40 text-xs font-body w-10">{item.date}</span>
              <div className="flex-1 min-w-0">
                <p className="text-ivory/90 text-sm font-body truncate group-hover:text-gold transition-colors">{item.title}</p>
              </div>
              <span className={`text-xs ${typeColors[item.type]}`}>
                {item.type === 'success' ? '✓' : item.type === 'warning' ? '!' : '○'}
              </span>
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
          {events.map((event, index) => (
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
          <span className="text-ivory/40 text-xs">Mar 1985</span>
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

          {/* Year trend */}
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
