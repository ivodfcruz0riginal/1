import React, { createContext, useContext, useReducer } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type Month =
  | 'Janeiro' | 'Fevereiro' | 'Março' | 'Abril' | 'Maio' | 'Junho'
  | 'Julho' | 'Agosto' | 'Setembro' | 'Outubro' | 'Novembro' | 'Dezembro';

export type Season = 'Primavera' | 'Verão' | 'Outono' | 'Inverno';

export interface GameEvent {
  id: string;
  month: Month;
  year: number;
  text: string;
}

export interface GameState {
  year: number;
  month: Month;
  season: Season;
  eventLog: GameEvent[];
}

type GameAction = { type: 'ADVANCE_MONTH' };

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS: Month[] = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const SEASON_MAP: Record<Month, Season> = {
  'Março': 'Primavera', 'Abril': 'Primavera', 'Maio': 'Primavera',
  'Junho': 'Verão',     'Julho': 'Verão',     'Agosto': 'Verão',
  'Setembro': 'Outono', 'Outubro': 'Outono',  'Novembro': 'Outono',
  'Dezembro': 'Inverno','Janeiro': 'Inverno', 'Fevereiro': 'Inverno',
};

const EVENTS_POOL: string[] = [
  'Nasceram 3 vitelos saudáveis no Cercado Norte.',
  'Nasceram 5 vitelos — excelente época de partos.',
  'Nasceram 2 vitelos. Um deles já mostra sinais de bravura.',
  'Grande seca. As pastagens ressentem-se.',
  'Primavera muito húmida. Pastagens exuberantes.',
  'Excelente produção de pastagens este mês.',
  'Um trabalhador reformou-se após 30 anos de serviço.',
  'Veterinário visitou a herdade. Efetivo em boa saúde.',
  'Recebido convite para tienta em Salamanca.',
  'Recebido convite para corrida em Lisboa.',
  'Recebido convite para corrida na Moita.',
  'Recebido convite para corrida em Espanha.',
  'Excelente evolução dos novilhos do Cercado Sul.',
  'Problemas na vedação do Cercado Norte. Reparação urgente.',
  'Pequena doença respiratória detetada. Veterinário em vigilância.',
  'Boa produção de feno. Reservas para o Inverno asseguradas.',
  'Comprado novo cavalo para trabalho na herdade.',
  'Visita de um ganadeiro espanhol interessado em reprodução.',
  'Chuvas intensas causaram alagamento parcial das pastagens.',
  'Tempo seco e quente. Animais transferidos para Cercado Norte.',
  'Um novilho distinguiu-se durante o treino no tentadero.',
  'Acordo de parceria assinado com ganaderia vizinha.',
  'Festival taurino em Évora — boa visibilidade para a ganaderia.',
  'Recebido relatório veterinário anual. Sem anomalias graves.',
  'Trabalhos de manutenção concluídos no tentadero.',
];

// ── Reducer ──────────────────────────────────────────────────────────────────

let _eventIdCounter = 0;

function nextId(): string {
  return `evt-${++_eventIdCounter}-${Date.now()}`;
}

function randomEvent(month: Month, year: number): GameEvent {
  const text = EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
  return { id: nextId(), month, year, text };
}

function advanceMonth(state: GameState): GameState {
  const currentIdx = MONTHS.indexOf(state.month);
  const nextIdx = (currentIdx + 1) % 12;
  const nextMonth = MONTHS[nextIdx];
  const nextYear = nextIdx === 0 ? state.year + 1 : state.year;
  const nextSeason = SEASON_MAP[nextMonth];

  const newEvent = randomEvent(nextMonth, nextYear);
  const newLog = [newEvent, ...state.eventLog].slice(0, 20);

  return {
    year: nextYear,
    month: nextMonth,
    season: nextSeason,
    eventLog: newLog,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADVANCE_MONTH':
      return advanceMonth(state);
    default:
      return state;
  }
}

// ── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: GameState = {
  year: 1985,
  month: 'Março',
  season: 'Primavera',
  eventLog: [
    {
      id: 'evt-0',
      month: 'Março',
      year: 1985,
      text: 'A Herdade da Ferraria inicia uma nova época. Que seja próspera.',
    },
  ],
};

// ── Context ──────────────────────────────────────────────────────────────────

interface GameStateContextValue {
  state: GameState;
  advanceMonth: () => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const advance = () => dispatch({ type: 'ADVANCE_MONTH' });

  return (
    <GameStateContext.Provider value={{ state, advanceMonth: advance }}>
      {children}
    </GameStateContext.Provider>
  );
};

export function useGameState(): GameStateContextValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used inside GameStateProvider');
  return ctx;
}
