import React, { useState, useEffect } from 'react';

type Phase = 'black' | 'title' | 'subtitle' | 'fading' | 'welcome' | 'exiting';

interface Props {
  onComplete: () => void;
}

const PHASES: { phase: Phase; delay: number }[] = [
  { phase: 'title',    delay: 500  },
  { phase: 'subtitle', delay: 2100 },
  { phase: 'fading',   delay: 3700 },
  { phase: 'welcome',  delay: 5200 },
];

const OpeningSequence: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('black');

  useEffect(() => {
    const timers = PHASES.map(({ phase: p, delay }) =>
      setTimeout(() => setPhase(p), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleComplete = () => {
    setPhase('exiting');
    setTimeout(onComplete, 700);
  };

  const overlayInDom  = phase !== 'welcome' && phase !== 'exiting';
  const overlayOpaque = phase === 'black' || phase === 'title' || phase === 'subtitle';
  const titleVisible  = phase === 'title' || phase === 'subtitle' || phase === 'fading';
  const subtitleVisible = phase === 'subtitle' || phase === 'fading';
  const welcomeVisible  = phase === 'welcome';

  return (
    <>
      {/* ── Cinematic overlay ────────────────────────────────────────────── */}
      {overlayInDom && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none
            transition-opacity duration-[1400ms]
            ${overlayOpaque ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          style={{ background: 'linear-gradient(180deg, #080503 0%, #040201 100%)' }}
        >
          {/* Horizontal rule above title */}
          <div
            className={`w-32 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-7
              transition-opacity duration-[1200ms] delay-300
              ${titleVisible ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Title */}
          <h1
            className={`font-display tracking-[0.35em] uppercase text-gold
              transition-opacity duration-[1200ms]
              ${titleVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
              textShadow: '0 0 60px rgba(180,140,55,0.35), 0 2px 4px rgba(0,0,0,0.8)',
              letterSpacing: '0.35em',
            }}
          >
            HERANÇA BRAVA
          </h1>

          {/* Horizontal rule below title */}
          <div
            className={`w-32 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mt-7 mb-6
              transition-opacity duration-[1200ms] delay-300
              ${titleVisible ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Subtitle */}
          <p
            className={`font-body text-[13px] text-ivory/50 italic tracking-widest
              transition-opacity duration-[1200ms]
              ${subtitleVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            "O legado não se recebe. Constrói-se."
          </p>
        </div>
      )}

      {/* ── Maioral welcome card ─────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 flex items-end justify-center pb-12 px-6
          pointer-events-none select-none
          transition-opacity duration-700
          ${welcomeVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/65 via-black/20 to-transparent pointer-events-none" />

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

            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-pulse" />
              <span className="text-ivory/20 text-[9px] font-body uppercase tracking-widest">Bem-vindo</span>
            </div>
          </div>

          {/* Speech */}
          <div className="px-5 pt-4 pb-3">
            <div className="relative pl-3 border-l-2 border-gold/25">
              <p className="text-ivory/80 text-sm font-body leading-relaxed italic">
                "Bom dia, Patrão.
                <br />
                Bem-vindo à Herdade Brava."
              </p>
            </div>
          </div>

          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-leather-600/40 to-transparent" />

          {/* Action */}
          <div className="px-5 py-4">
            <button
              onClick={handleComplete}
              className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 border border-leather-600/40
                rounded transition-all duration-200 hover:border-gold/50 hover:bg-gold/6 group"
            >
              <span className="text-gold/35 text-xs font-body group-hover:text-gold/70 transition-colors shrink-0">›</span>
              <span className="text-ivory/65 text-xs font-body group-hover:text-ivory/90 transition-colors">
                Conhecer a Herdade
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const OPENING_STORAGE_KEY = 'herdade_opening_done';

export function isOpeningDone(): boolean {
  try {
    return localStorage.getItem(OPENING_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markOpeningDone(): void {
  try {
    localStorage.setItem(OPENING_STORAGE_KEY, '1');
  } catch {}
}

export default OpeningSequence;
