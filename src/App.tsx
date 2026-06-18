import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RanchMap from './components/RanchMap';
import NewsPanel from './components/NewsPanel';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-leather-900 flex overflow-hidden">
      {/* Leather texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px'
        }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content - Ranch Map */}
        <div className="flex-1 relative overflow-hidden">
          {/* Top info overlay */}
          <div className="absolute top-5 left-6 z-20">
            <div className="relative bg-leather-900/95 border-2 border-gold/40 rounded-lg px-6 py-4 shadow-2xl backdrop-blur-sm">
              {/* Corner decorations */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold/60"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold/60"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gold/60"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gold/60"></div>

              <h2 className="font-display text-2xl text-gold tracking-widest">HERDADE DA FERRARIA</h2>
              <p className="text-ivory/60 text-sm font-body mt-1 tracking-wide">Alentejo, Portugal • 1.250 hectares</p>
            </div>
          </div>

          {/* Right: Weather & Time */}
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

          {/* Ranch Map */}
          <RanchMap />
        </div>

        {/* Gold divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>

        {/* Bottom Panel */}
        <div className="h-[200px] p-4 bg-leather-900/98 border-t border-leather-700/40">
          <NewsPanel />
        </div>
      </div>
    </div>
  );
};

export default App;
