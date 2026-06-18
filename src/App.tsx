import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RanchMap from './components/RanchMap';
import MaioralDialogue from './components/MaioralDialogue';
import PlaceholderPage from './pages/PlaceholderPage';
import EfetivoScreen from './screens/EfetivoScreen';
import EconomyScreen from './screens/EconomyScreen';
import EscritorioScreen from './screens/EscritorioScreen';
import { GameStateProvider } from './store/gameState';

const HerdadePage: React.FC = () => (
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

    <RanchMap />
    <MaioralDialogue />
  </>
);

const Layout: React.FC = () => {
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

      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <div className="flex-1 relative overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/herdade" replace />} />
            <Route path="/herdade" element={<HerdadePage />} />
            <Route path="/escritorio" element={<EscritorioScreen />} />
            <Route path="/efetivo" element={<EfetivoScreen />} />
            <Route path="/reproducao" element={<PlaceholderPage title="Reprodução" subtitle="Programa de reprodução e genética" />} />
            <Route path="/tentas" element={<PlaceholderPage title="Tentas" subtitle="Calendário e resultados das tentas" />} />
            <Route path="/corridas" element={<PlaceholderPage title="Corridas" subtitle="Histórico e agenda de corridas" />} />
            <Route path="/jornal" element={<PlaceholderPage title="Jornal" subtitle="Notícias e eventos da herdade" />} />
            <Route path="/livro-da-casa" element={<PlaceholderPage title="Livro da Casa" subtitle="Registo histórico e genealógico" />} />
            <Route path="/economia" element={<EconomyScreen />} />
            <Route path="/definicoes" element={<PlaceholderPage title="Definições" subtitle="Configurações do jogo" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <GameStateProvider>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </GameStateProvider>
);

export default App;
