import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../store/gameState';
import { useDayCycle } from '../hooks/useDayCycle';

// ── Constants ─────────────────────────────────────────────────────────────────

const INTRO_KEY = 'hb_intro_v1';

// Tour steps: each has Manuel's lines and an optional building to highlight
interface TourStep {
  lines: string[];
  highlight?: string;
  cta: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    lines: [
      'Bom dia, Patrão.',
      'Bem-vindo à Herdade da Ferraria.',
      'É Março de 1985. A Primavera começa hoje.',
    ],
    cta: 'Bom dia, Manuel.',
  },
  {
    lines: [
      'Aqui criamos toiros de lide há gerações.',
      'Cada animal que passa por estes campos...',
      '...carrega o nome desta casa.',
    ],
    cta: 'Compreendo o peso disso.',
  },
  {
    lines: [
      'Ali estão os Cercados Norte e Sul.',
      'É onde vivem os nossos animais.',
      'Cuide deles como cuidaria da família.',
    ],
    highlight: 'cercados',
    cta: 'Quantos animais temos?',
  },
  {
    lines: [
      'Este é o Tentadero.',
      'Aqui provamos a bravura de cada bicho.',
      'É onde se descobre se valem corrida.',
    ],
    highlight: 'tentadero',
    cta: 'Uma arena de verdade.',
  },
  {
    lines: [
      'O Escritório é o coração administrativo.',
      'Contratos, finanças, correspondência...',
      'Tudo passa por ali.',
    ],
    highlight: 'escritorio',
    cta: 'Onde estão os livros da casa?',
  },
  {
    lines: [
      'A Casa Principal é o seu lar.',
      'O Patrão antes de si fez tudo por ela.',
      'Agora é a sua vez.',
    ],
    highlight: 'casa',
    cta: 'Entendo a responsabilidade.',
  },
  {
    lines: [
      'Há muito trabalho pela frente.',
      'A ganaderia não se herda, Patrão.',
      'Constrói-se.',
    ],
    cta: 'Vamos começar.',
  },
];

// ── Phase machine ─────────────────────────────────────────────────────────────

type IntroPhase =
  | 'fade-in'
  | 'title-show'
  | 'quote-show'
  | 'fade-out'
  | 'season-show'
  | 'tour'
  | 'done';

// ── Sub-components ────────────────────────────────────────────────────────────

// Typewriter effect for text lines
const TypewriterLine: React.FC<{ text: string; delay: number; onDone?: () => void }> = ({ text, delay, onDone }) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, 38);
    return () => clearTimeout(t);
  }, [started, displayed, text, onDone]);

  return <span>{displayed}<span className="opacity-0">{text.slice(displayed.length)}</span></span>;
};

// Highlight ring on map area
const HighlightRing: React.FC<{ target: string }> = ({ target }) => {
  const rings: Record<string, React.CSSProperties> = {
    cercados:  { left: '5%',  top: '10%',  width: '44%', height: '80%', borderRadius: '8px' },
    tentadero: { right: '4%', top: '22%',  width: '220px', height: '220px', borderRadius: '50%' },
    escritorio:{ right: '7%', top: '3%',   width: '140px', height: '100px', borderRadius: '8px' },
    casa:      { right: '22%',top: '3%',   width: '150px', height: '110px', borderRadius: '8px' },
  };
  const s = rings[target];
  if (!s) return null;
  return (
    <div
      className="absolute pointer-events-none animate-pulse"
      style={{
        ...s,
        border: '2px solid rgba(201,162,39,0.7)',
        boxShadow: '0 0 24px rgba(201,162,39,0.3), inset 0 0 24px rgba(201,162,39,0.05)',
        zIndex: 35,
      }}
    />
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const WelcomeSequence: React.FC = () => {
  const { state, answerDialogue } = useGameState();
  const dayCycle = useDayCycle();
  const [phase, setPhase] = useState<IntroPhase>('fade-in');
  const [tourStep, setTourStep] = useState(0);
  const [linesDone, setLinesDone] = useState(false);
  const [visible, setVisible] = useState(true);

  // Only show for new games
  const isNewGame = typeof window !== 'undefined' && !localStorage.getItem(INTRO_KEY);

  const advance = useCallback(() => {
    setPhase(p => {
      switch (p) {
        case 'fade-in':     return 'title-show';
        case 'title-show':  return 'quote-show';
        case 'quote-show':  return 'fade-out';
        case 'fade-out':    return 'season-show';
        case 'season-show': return 'tour';
        default:            return p;
      }
    });
  }, []);

  // Auto-advance phases on timers
  useEffect(() => {
    if (!isNewGame) return;
    if (phase === 'fade-in')    { const t = setTimeout(advance, 800);   return () => clearTimeout(t); }
    if (phase === 'title-show') { const t = setTimeout(advance, 3200);  return () => clearTimeout(t); }
    if (phase === 'quote-show') { const t = setTimeout(advance, 4500);  return () => clearTimeout(t); }
    if (phase === 'fade-out')   { const t = setTimeout(advance, 1200);  return () => clearTimeout(t); }
    if (phase === 'season-show'){ const t = setTimeout(advance, 2800);  return () => clearTimeout(t); }
  }, [phase, isNewGame, advance]);

  const advanceTour = useCallback(() => {
    setLinesDone(false);
    if (tourStep >= TOUR_STEPS.length - 1) {
      // Tour finished
      localStorage.setItem(INTRO_KEY, '1');
      setPhase('done');
      // Dismiss the GREETING_DIALOGUE so it doesn't double-fire
      if (state.pendingDialogue?.id === 'greet_start') {
        answerDialogue('Que comece o trabalho.');
      }
      setTimeout(() => setVisible(false), 600);
    } else {
      setTourStep(s => s + 1);
    }
  }, [tourStep, state.pendingDialogue, answerDialogue]);

  if (!isNewGame || !visible) return null;

  const currentStep = TOUR_STEPS[tourStep];

  // ── Season / weather card text ──
  const seasonLabel = state.season;
  const seasonIcons: Record<string, string> = { Primavera: '🌿', Verão: '☀️', Outono: '🍂', Inverno: '❄️' };
  const seasonDesc: Record<string, string> = {
    Primavera: 'As pastagens estão a renascer.',
    Verão:     'O calor aperta na planície.',
    Outono:    'A luz muda. O ar esfria.',
    Inverno:   'O frio chegou às terras do sul.',
  };

  return (
    <div
      className="absolute inset-0 z-50 pointer-events-auto"
      style={{
        transition: phase === 'done' ? 'opacity 600ms ease-out' : undefined,
        opacity: phase === 'done' ? 0 : 1,
      }}
    >
      {/* ── CINEMATIC OVERLAY (splash phases) ── */}
      {(phase === 'fade-in' || phase === 'title-show' || phase === 'quote-show' || phase === 'fade-out') && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, #0a0704 0%, #0f0a06 50%, #0a0704 100%)',
            opacity: phase === 'fade-in' || phase === 'fade-out' ? 0 : 1,
            transition: 'opacity 1s ease-in-out',
          }}
        >
          {/* Texture overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />

          {/* Thin gold horizontal rule */}
          <div className="absolute top-1/2 -translate-y-1/2 w-px h-64 left-[15%] bg-gradient-to-b from-transparent via-gold/20 to-transparent pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 w-px h-64 right-[15%] bg-gradient-to-b from-transparent via-gold/20 to-transparent pointer-events-none" />

          <div className="relative flex flex-col items-center text-center px-8 max-w-lg">
            {/* Bull motif */}
            <div
              className="mb-8"
              style={{
                opacity: phase === 'title-show' || phase === 'quote-show' ? 1 : 0,
                transform: phase === 'title-show' || phase === 'quote-show' ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 1.2s ease-out 0.2s, transform 1.2s ease-out 0.2s',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/50" />
                <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
                  <path d="M18,12 Q14,6 6,8 M18,12 Q22,6 30,8 M18,12 Q16,18 14,22 M18,12 Q20,18 22,22 M6,8 Q2,5 3,2 M30,8 Q34,5 33,2" stroke="rgba(201,162,39,0.6)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <circle cx="18" cy="12" r="2" fill="rgba(201,162,39,0.4)" />
                </svg>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/50" />
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                opacity: phase === 'title-show' || phase === 'quote-show' ? 1 : 0,
                transform: phase === 'title-show' || phase === 'quote-show' ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 1.4s ease-out 0.1s, transform 1.4s ease-out 0.1s',
              }}
            >
              <p className="font-body text-xs text-gold/40 tracking-[0.5em] uppercase mb-3">Portugal · 1985</p>
              <h1 className="font-display text-5xl text-gold tracking-[0.25em] uppercase leading-tight">
                HERANÇA
              </h1>
              <h1 className="font-display text-5xl text-gold-light tracking-[0.18em] uppercase leading-tight">
                BRAVA
              </h1>
            </div>

            {/* Quote */}
            <div
              className="mt-10"
              style={{
                opacity: phase === 'quote-show' ? 1 : 0,
                transform: phase === 'quote-show' ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 1.6s ease-out 0.3s, transform 1.6s ease-out 0.3s',
              }}
            >
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto mb-6" />
              <p className="font-body text-ivory/55 text-base leading-loose italic tracking-wide">
                "A ganadaria não se herda.
              </p>
              <p className="font-body text-ivory/55 text-base leading-loose italic tracking-wide">
                Constrói-se geração após geração."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SEASON / WEATHER REVEAL ── */}
      {phase === 'season-show' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, rgba(10,7,4,0.88) 0%, rgba(15,10,6,0.75) 60%, rgba(10,7,4,0.60) 100%)',
            animation: 'intro-fade-in 0.8s ease-out forwards',
          }}
        >
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="text-ivory/30 text-xs font-body uppercase tracking-[0.4em]">
              Março · {state.year}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">{seasonIcons[seasonLabel] ?? '🌍'}</span>
                <span className="font-display text-2xl text-gold tracking-wider">{seasonLabel}</span>
              </div>
              <div className="w-px h-12 bg-gold/20" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">{dayCycle.weatherIcon}</span>
                <span className="font-display text-2xl text-ivory/80 tracking-wider">{dayCycle.weatherLabel}</span>
              </div>
            </div>
            <p className="text-ivory/40 text-sm font-body italic mt-2">
              {seasonDesc[seasonLabel] ?? ''}
            </p>
          </div>
        </div>
      )}

      {/* ── TOUR PHASE ── */}
      {phase === 'tour' && (
        <>
          {/* Dim overlay over map — lighter so ranch is visible */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />

          {/* Building highlight */}
          {currentStep.highlight && <HighlightRing target={currentStep.highlight} />}

          {/* Dialogue box */}
          <div className="absolute inset-0 flex items-end justify-center pb-10 px-6 pointer-events-none">
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />

            <div
              className="relative pointer-events-auto w-full max-w-xl rounded-lg shadow-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #1f1609 0%, #170e06 100%)',
                border: '1px solid rgba(180,140,55,0.38)',
                animation: 'intro-slide-up 0.4s ease-out forwards',
              }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold/50 pointer-events-none" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold/50 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold/50 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold/50 pointer-events-none" />

              {/* Header */}
              <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-leather-700/40">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-leather-700/70 border-2 border-gold/30 flex items-center justify-center overflow-hidden">
                    <div className="absolute bottom-0 inset-x-0 h-5 bg-leather-800/80" />
                    <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-800/70 rounded-full" />
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-leather-900/80 rounded-full" />
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-leather-800/70 rounded-t-sm" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gold/80 border border-leather-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-leather-900" />
                  </div>
                </div>
                <div>
                  <p className="font-display text-sm text-gold tracking-widest uppercase leading-none">Manuel</p>
                  <p className="text-ivory/35 text-[10px] font-body uppercase tracking-wider mt-0.5">
                    Maioral · Herdade da Ferraria
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-pulse" />
                  <span className="text-ivory/20 text-[9px] font-body uppercase tracking-widest">
                    {tourStep + 1} / {TOUR_STEPS.length}
                  </span>
                </div>
              </div>

              {/* Lines */}
              <div className="px-5 pt-4 pb-3">
                <div className="relative pl-3 border-l-2 border-gold/25 space-y-1.5">
                  {currentStep.lines.map((line, i) => (
                    <p key={`${tourStep}-${i}`} className="text-ivory/80 text-sm font-body leading-relaxed italic">
                      <TypewriterLine
                        text={`"${line}"`}
                        delay={i * 800}
                        onDone={i === currentStep.lines.length - 1 ? () => setLinesDone(true) : undefined}
                      />
                    </p>
                  ))}
                </div>
              </div>

              <div className="mx-5 h-px bg-gradient-to-r from-transparent via-leather-600/40 to-transparent" />

              {/* CTA */}
              <div className="px-5 py-4">
                <button
                  onClick={linesDone ? advanceTour : undefined}
                  className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 border rounded transition-all duration-300 group ${
                    linesDone
                      ? 'border-gold/40 hover:border-gold/70 hover:bg-gold/6 cursor-pointer'
                      : 'border-leather-700/30 cursor-default opacity-40'
                  }`}
                >
                  <span className={`text-xs font-body shrink-0 transition-colors ${linesDone ? 'text-gold/50 group-hover:text-gold/80' : 'text-ivory/20'}`}>›</span>
                  <span className={`text-xs font-body transition-colors ${linesDone ? 'text-ivory/65 group-hover:text-ivory/90' : 'text-ivory/20'}`}>
                    {currentStep.cta}
                  </span>
                  {!linesDone && (
                    <span className="ml-auto text-ivory/20 text-[9px] font-body animate-pulse">...</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WelcomeSequence;
