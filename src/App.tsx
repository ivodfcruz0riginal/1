import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DecisionWindow from './components/DecisionWindow';
import ConsequencePanel from './components/ConsequencePanel';
import GoalCompletionPopup from './components/GoalCompletionPopup';
import PlaceholderPage from './pages/PlaceholderPage';
import EfetivoScreen from './screens/EfetivoScreen';
import EconomyScreen from './screens/EconomyScreen';
import EscritorioScreen from './screens/EscritorioScreen';
import LegacyScreen from './screens/LegacyScreen';
import HerdadeScreen from './screens/HerdadeScreen';
import { GameStateProvider, useGameState } from './store/gameState';
import { ConsequenceProvider, useConsequences } from './store/consequenceStore';
import { GoalProvider, useGoals } from './store/goalStore';
import { computeGoalProgress } from './services/goalService';
import WelcomeSequence from './components/WelcomeSequence';

// ── Consequence processor — activates triggered consequences on month change ──

const ConsequenceProcessor: React.FC = () => {
  const { state } = useGameState();
  const { triggerMonth } = useConsequences();

  useEffect(() => {
    triggerMonth(state.month, state.year);
  }, [state.month, state.year]);

  return null;
};

// ── Goal processor — updates progress whenever relevant state changes ─────────

const GoalProcessor: React.FC = () => {
  const { state: gameState } = useGameState();
  const { state: goalState, batchUpdateProgress } = useGoals();

  useEffect(() => {
    const updates = goalState.goals.map(goal => ({
      id: goal.id,
      progress: computeGoalProgress(goal, gameState),
    }));
    batchUpdateProgress(updates, { month: gameState.month, year: gameState.year });
  }, [
    gameState.month,
    gameState.year,
    gameState.locations,
    gameState.animals,
    gameState.economy.treasury,
    gameState.decisionHistory,
  ]);

  return null;
};

// ── Layout ────────────────────────────────────────────────────────────────────

const Layout: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-leather-900 flex overflow-hidden">
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
            <Route path="/herdade" element={<HerdadeScreen />} />
            <Route path="/escritorio" element={<EscritorioScreen />} />
            <Route path="/efetivo" element={<EfetivoScreen />} />
            <Route path="/reproducao" element={<PlaceholderPage title="Reprodução" subtitle="A criação de bons toiros começa aqui. O programa de reprodução da ganaderia." />} />
            <Route path="/tentas" element={<PlaceholderPage title="Tentas" subtitle="Onde se descobre a bravura. Calendário e resultados das provas de selecção." />} />
            <Route path="/corridas" element={<PlaceholderPage title="Corridas" subtitle="Os animais que honraram esta casa. Histórico e agenda das corridas de touros." />} />
            <Route path="/jornal" element={<PlaceholderPage title="Jornal" subtitle="O que se fala da ganaderia e do mundo taurino. Notícias e acontecimentos." />} />
            <Route path="/livro-da-casa" element={<PlaceholderPage title="Livro da Casa" subtitle="A memória escrita da herdade. Registos, genealogias e história da ganaderia." />} />
            <Route path="/economia" element={<EconomyScreen />} />
            <Route path="/legado" element={<LegacyScreen />} />
            <Route path="/definicoes" element={<PlaceholderPage title="Definições" subtitle="Preferências da herdade e configurações da partida." />} />
          </Routes>
        </div>
      </div>

      {/* Global overlays */}
      <DecisionWindow />
      <ConsequencePanel />
      <GoalCompletionPopup />
      <ConsequenceProcessor />
      <GoalProcessor />
      <WelcomeSequence />
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────

const App: React.FC = () => (
  <GameStateProvider>
    <ConsequenceProvider>
      <GoalProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </GoalProvider>
    </ConsequenceProvider>
  </GameStateProvider>
);

export default App;
