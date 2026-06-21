import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DecisionWindow from './components/DecisionWindow';
import OpeningSequence, { isOpeningDone, markOpeningDone } from './components/OpeningSequence';
import { isTourDone } from './components/GuidedTour';
import HerdadeScreen from './screens/HerdadeScreen';
import PlaceholderPage from './pages/PlaceholderPage';
import EfetivoScreen from './screens/EfetivoScreen';
import EconomyScreen from './screens/EconomyScreen';
import EscritorioScreen from './screens/EscritorioScreen';
import { GameStateProvider } from './store/gameState';

const Layout: React.FC<{ showTour: boolean; onTourComplete: () => void }> = ({ showTour, onTourComplete }) => (
  <div className="min-h-screen bg-leather-900 flex overflow-hidden">
    {/* Leather texture overlay */}
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: '150px 150px',
      }}
    />

    <Sidebar />

    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Header />

      <div className="flex-1 relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/herdade" replace />} />
          <Route path="/herdade" element={<HerdadeScreen showTour={showTour} onTourComplete={onTourComplete} />} />
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

    {/* Decision Window — global, floats above all screens */}
    <DecisionWindow />
  </div>
);

const App: React.FC = () => {
  const [showOpening, setShowOpening] = useState(() => !isOpeningDone());
  const [showTour, setShowTour] = useState(() => isOpeningDone() && !isTourDone());

  const handleOpeningComplete = () => {
    markOpeningDone();
    setShowOpening(false);
    if (!isTourDone()) {
      setShowTour(true);
    }
  };

  const handleTourComplete = () => {
    setShowTour(false);
  };

  return (
    <GameStateProvider>
      <BrowserRouter>
        <Layout showTour={showTour} onTourComplete={handleTourComplete} />
        {showOpening && <OpeningSequence onComplete={handleOpeningComplete} />}
      </BrowserRouter>
    </GameStateProvider>
  );
};

export default App;
