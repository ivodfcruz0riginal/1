import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DecisionWindow from './components/DecisionWindow';
import OpeningSequence from './components/OpeningSequence';
import HerdadeScreen from './screens/HerdadeScreen';
import PlaceholderPage from './pages/PlaceholderPage';
import EfetivoScreen from './screens/EfetivoScreen';
import EconomyScreen from './screens/EconomyScreen';
import EscritorioScreen from './screens/EscritorioScreen';
import { GameStateProvider, useGameState } from './store/gameState';

// ── Layout shell ──────────────────────────────────────────────────────────────

const Layout: React.FC<{ showTour: boolean; onTourComplete: () => void }> = ({ showTour, onTourComplete }) => (
  <div className="min-h-screen bg-leather-900 flex overflow-hidden">
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

    <DecisionWindow />
  </div>
);

// ── Game root — inside GameStateProvider, reads state to control sequences ────

const GameRoot: React.FC = () => {
  const { state, completeIntro } = useGameState();

  const params = new URLSearchParams(window.location.search);
  const forceIntro = params.get('intro') === 'true';
  const forceTour  = params.get('tour')  === 'true';

  // Opening: show when not completed, or forced via ?intro=true
  const openingDone = state.openingSequenceCompleted && !forceIntro;
  const [showOpening, setShowOpening] = useState(() => !openingDone);

  // Tour: show when opening already done + tour not done, or forced via ?tour=true
  const [showTour, setShowTour] = useState(
    () => (openingDone && !state.guidedTourCompleted) || forceTour
  );

  const handleOpeningComplete = () => {
    completeIntro();
    setShowOpening(false);
    if (!state.guidedTourCompleted || forceTour) {
      setShowTour(true);
    }
  };

  const handleTourComplete = () => setShowTour(false);

  return (
    <>
      <Layout showTour={showTour} onTourComplete={handleTourComplete} />
      {showOpening && <OpeningSequence onComplete={handleOpeningComplete} />}
    </>
  );
};

// ── App root ──────────────────────────────────────────────────────────────────

const App: React.FC = () => (
  <GameStateProvider>
    <BrowserRouter>
      <GameRoot />
    </BrowserRouter>
  </GameStateProvider>
);

export default App;
