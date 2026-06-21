import React, { useState, useEffect } from 'react';
import { useGameState } from '../store/gameState';

// ── Tour data ─────────────────────────────────────────────────────────────────

interface TourStep {
  locationId: string | null;
  name: string;
  text: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    locationId: 'escritorio',
    name: 'Escritório',
    text: 'É aqui que se tomam as decisões da casa. Contas, contratos, diário e Livro da Casa.',
  },
  {
    locationId: 'currais',
    name: 'Currais',
    text: 'Aqui vemos de perto o que no campo apenas se adivinha.',
  },
  {
    locationId: 'cercado_norte',
    name: 'Cercado Norte',
    text: 'Os machos novos passam muito tempo aqui. É preciso olho neles.',
  },
  {
    locationId: 'cercado_sul',
    name: 'Cercado Sul',
    text: 'As vacas e novilhas mostram aqui o futuro da casa.',
  },
  {
    locationId: 'tentadero',
    name: 'Tentadero',
    text: 'É aqui que se decide o futuro da ganadaria.',
  },
  {
    locationId: null,
    name: 'Barragem',
    text: 'Sem água não há pasto. Sem pasto não há toiro.',
  },
  {
    locationId: 'embarque',
    name: 'Parque de Embarque',
    text: 'Daqui partem os animais quando chega o dia de mostrar a casa.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

type Phase = 'touring' | 'final' | 'exiting';

interface Props {
  onHighlight: (id: string | null) => void;
  onComplete: () => void;
}

const GuidedTour: React.FC<Props> = ({ onHighlight, onComplete }) => {
  const { addGameEvent, completeTour } = useGameState();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('touring');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'touring') {
      onHighlight(TOUR_STEPS[step].locationId);
    } else {
      onHighlight(null);
    }
  }, [step, phase, onHighlight]);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setPhase('final');
    }
  };

  const handleSkip = () => finish();

  const handleFinish = () => finish();

  const finish = () => {
    onHighlight(null);
    setVisible(false);
    setPhase('exiting');
    setTimeout(() => {
      addGameEvent('O Maioral apresentou a Herdade ao novo ganadeiro.');
      completeTour();
      onComplete();
    }, 700);
  };

  const currentStep = TOUR_STEPS[step];
  const isFinal = phase === 'final';

  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-center pb-10 px-6 pointer-events-none
        transition-opacity duration-700 ${visible && phase !== 'exiting' ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Bottom vignette */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />

      <div
        className="relative pointer-events-auto w-full max-w-xl rounded-lg shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1f1609 0%, #170e06 100%)',
          border: '1px solid rgba(180,140,55,0.38)',
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

          <div className="ml-auto flex items-center gap-2">
            {!isFinal && (
              <span className="text-ivory/20 text-[9px] font-body uppercase tracking-widest">
                {step + 1} / {TOUR_STEPS.length}
              </span>
            )}
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-pulse" />
          </div>
        </div>

        {/* Location label */}
        {!isFinal && (
          <div className="px-5 pt-3 pb-1">
            <p className="text-gold/50 text-[9px] font-body uppercase tracking-[0.2em]">
              {currentStep.name}
            </p>
          </div>
        )}

        {/* Speech */}
        <div className="px-5 pt-2 pb-3">
          <div className="relative pl-3 border-l-2 border-gold/25">
            <p className="text-ivory/80 text-sm font-body leading-relaxed italic">
              {isFinal
                ? '"A Herdade está nas suas mãos."'
                : `"${currentStep.text}"`}
            </p>
          </div>
        </div>

        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-leather-600/40 to-transparent" />

        {/* Actions */}
        <div className="px-5 py-4 flex flex-col gap-2">
          {isFinal ? (
            <button
              onClick={handleFinish}
              className="text-left flex items-center gap-2.5 px-3.5 py-2.5 border border-gold/30 rounded
                transition-all duration-200 hover:border-gold/60 hover:bg-gold/8 group"
            >
              <span className="text-gold/50 text-xs font-body group-hover:text-gold/80 transition-colors shrink-0">›</span>
              <span className="text-ivory/80 text-xs font-body group-hover:text-ivory transition-colors">
                A Herdade está nas suas mãos.
              </span>
            </button>
          ) : (
            <>
              <button
                onClick={handleNext}
                className="text-left flex items-center gap-2.5 px-3.5 py-2.5 border border-leather-600/40 rounded
                  transition-all duration-200 hover:border-gold/50 hover:bg-gold/6 group"
              >
                <span className="text-gold/35 text-xs font-body group-hover:text-gold/70 transition-colors shrink-0">›</span>
                <span className="text-ivory/65 text-xs font-body group-hover:text-ivory/90 transition-colors">
                  {step < TOUR_STEPS.length - 1 ? 'Seguinte' : 'Concluir Visita'}
                </span>
              </button>
              <button
                onClick={handleSkip}
                className="text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded
                  transition-all duration-200 hover:bg-leather-800/30 group"
              >
                <span className="text-ivory/15 text-xs font-body group-hover:text-ivory/40 transition-colors shrink-0">›</span>
                <span className="text-ivory/25 text-xs font-body group-hover:text-ivory/50 transition-colors">
                  Saltar Visita
                </span>
              </button>
            </>
          )}
        </div>

        {/* Step progress dots */}
        {!isFinal && (
          <div className="px-5 pb-3 flex items-center gap-1.5 justify-center">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-4 h-1.5 bg-gold/70'
                    : i < step
                      ? 'w-1.5 h-1.5 bg-gold/30'
                      : 'w-1.5 h-1.5 bg-leather-600/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidedTour;
