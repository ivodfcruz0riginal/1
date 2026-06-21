import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DecisionWindow from './components/DecisionWindow';
import ContractOfferModal from './components/ContractOfferModal';
import OpeningSequence from './components/OpeningSequence';
import HerdadeScreen from './screens/HerdadeScreen';
import PlaceholderPage from './pages/PlaceholderPage';
import EfetivoScreen from './screens/EfetivoScreen';
import EconomyScreen from './screens/EconomyScreen';
import EscritorioScreen from './screens/EscritorioScreen';
import { GameStateProvider, useGameState } from './store/gameState';
import {
  getGameFlowStep,
  readDebugFlags,
  type GameFlowStep,
} from './core/gameFlow/GameFlowController';

const DevFlowChecklist = import.meta.env.DEV
  ? React.lazy(() => import('./components/DevFlowChecklist'))
  : null;

// ── Layout shell ──────────────────────────────────────────────────────────────

interface LayoutProps {
  flowStep: GameFlowStep;
  onTourComplete: () => void;
}

const Layout: React.FC<LayoutProps> = ({ flowStep, onTourComplete }) => (
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
          <Route
            path="/herdade"
            element={
              <HerdadeScreen
                showTour={flowStep === 'GUIDED_TOUR'}
                onTourComplete={onTourComplete}
              />
            }
          />
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

// ── Game root — single flow decision point ────────────────────────────────────

const GameRoot: React.FC = () => {
  const { state, completeIntro, triggerRanchProblem } = useGameState();

  // Read URL debug flags once at mount — force flags are consumed when the
  // matching overlay sequence completes, so they never loop.
  const debugFlags = useRef(readDebugFlags()).current;

  // Determine the initial step using the controller (includes debug flags).
  const initialStep = useRef(getGameFlowStep(state, debugFlags)).current;

  // Overlay sequences use local state so exit animations can play before
  // the game state changes and the reactive step advances.
  const [showOpening, setShowOpening] = useState(() => initialStep === 'OPENING');
  const [showTour,    setShowTour]    = useState(() => initialStep === 'GUIDED_TOUR');

  // For FIRST_DECISION → NORMAL_GAME, there is no animation overlay:
  // derive reactively from game state (no debug flags needed here).
  const stateStep = getGameFlowStep(state, { forceOpening: false, forceTour: false });

  // Single flowStep drives ALL rendering — no scattered conditions elsewhere.
  const flowStep: GameFlowStep =
    showOpening ? 'OPENING'
    : showTour  ? 'GUIDED_TOUR'
    : stateStep; // 'FIRST_DECISION' or 'NORMAL_GAME'

  // ── Ranch problem trigger ─────────────────────────────────────────────────
  // Fires once when the player first reaches NORMAL_GAME and has no pending
  // decision. The DecisionWindow then shows the fence problem modally.
  useEffect(() => {
    if (
      flowStep === 'NORMAL_GAME' &&
      !state.firstRanchProblemCompleted &&
      state.pendingDecision === null
    ) {
      triggerRanchProblem();
    }
  }, [flowStep, state.firstRanchProblemCompleted, state.pendingDecision]);

  // ── Sequence completion handlers ──────────────────────────────────────────

  const handleOpeningComplete = () => {
    completeIntro();
    setShowOpening(false);
    // Show tour if not yet done (or forced). Read from current state snapshot
    // since completeIntro() hasn't flushed yet.
    if (!state.guidedTourCompleted || debugFlags.forceTour) {
      setShowTour(true);
    }
  };

  // Tour unmounts itself via completeTour() state change after its animation;
  // this callback is the acknowledgment hook from HerdadeScreen.
  const handleTourComplete = () => setShowTour(false);

  // ── Render ────────────────────────────────────────────────────────────────

  // DecisionWindow is suppressed during OPENING and GUIDED_TOUR — it would
  // otherwise show over the intro sequence since pendingDecision is already
  // set in INITIAL_STATE.
  const showDecisionWindow = flowStep === 'FIRST_DECISION' || flowStep === 'NORMAL_GAME';

  // Contract modal only after ranch problem is completed (and only in NORMAL_GAME)
  const showContractModal = flowStep === 'NORMAL_GAME' && state.firstRanchProblemCompleted;

  return (
    <>
      <Layout flowStep={flowStep} onTourComplete={handleTourComplete} />
      {showDecisionWindow && <DecisionWindow />}
      {showContractModal && <ContractOfferModal />}
      {flowStep === 'OPENING' && <OpeningSequence onComplete={handleOpeningComplete} />}
      {DevFlowChecklist && (
        <React.Suspense fallback={null}>
          <DevFlowChecklist />
        </React.Suspense>
      )}
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
