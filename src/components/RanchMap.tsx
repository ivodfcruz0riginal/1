import React, { useState, useMemo } from 'react';
import { useGameState } from '../store/gameState';
import type { BuildingKey, BuildingNotification, LocationId } from '../store/gameState';
import { useDayCycle } from '../hooks/useDayCycle';
import type { DayPeriod, WeatherType } from '../hooks/useDayCycle';

// ── Coming Soon overlay ───────────────────────────────────────────────────────

interface ComingSoonProps {
  name: string;
  description?: string;
  onClose: () => void;
}

const ComingSoonOverlay: React.FC<ComingSoonProps> = ({ name, description, onClose }) => (
  <div
    className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="relative bg-leather-900 border-2 border-gold/40 rounded-lg px-10 py-8 shadow-2xl text-center max-w-sm mx-4"
      onClick={e => e.stopPropagation()}
    >
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold/60" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold/60" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gold/60" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gold/60" />

      <div className="text-4xl mb-4">🏗️</div>
      <h3 className="font-display text-xl text-gold tracking-widest uppercase mb-2">{name}</h3>
      {description && (
        <p className="text-ivory/50 text-xs font-body mb-2">{description}</p>
      )}
      <p className="text-ivory/60 text-sm font-body mb-1">Esta funcionalidade está em desenvolvimento.</p>
      <p className="text-ivory/30 text-xs font-body mb-6">Em breve disponível.</p>
      <button
        onClick={onClose}
        className="px-6 py-2 bg-leather-800 border border-gold/30 rounded text-gold/80 text-sm font-body hover:border-gold hover:text-gold transition-all duration-200"
      >
        Fechar
      </button>
    </div>
  </div>
);

// ── Notification badge ────────────────────────────────────────────────────────

const NotificationBadge: React.FC<{ n: BuildingNotification }> = ({ n }) => (
  <div className="absolute -top-4 -right-2 z-20 flex items-center gap-1 bg-leather-900 border border-gold/70 rounded-full px-2 py-0.5 shadow-lg animate-bounce pointer-events-none select-none">
    <span className="text-[11px] leading-none">{n.icon}</span>
    <span className="text-gold text-[9px] font-body uppercase tracking-wide whitespace-nowrap">{n.label}</span>
  </div>
);

// ── Building tooltip ──────────────────────────────────────────────────────────

interface TooltipProps {
  name: string;
  hint: string;
  visible: boolean;
}

const BuildingTooltip: React.FC<TooltipProps> = ({ name, hint, visible }) => (
  <div className={`absolute -top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-200 ${visible ? 'opacity-100 -translate-y-0' : 'opacity-0 translate-y-1'}`}>
    <div className="relative bg-leather-900/98 border border-gold/50 rounded px-3 py-2 shadow-xl whitespace-nowrap">
      <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-gold/50" />
      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t border-r border-gold/50" />
      <p className="font-display text-xs text-gold tracking-widest uppercase">{name}</p>
      <p className="text-ivory/50 text-[10px] font-body mt-0.5">{hint}</p>
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-leather-900/98 border-b border-r border-gold/50 rotate-45" />
    </div>
  </div>
);

// ── Animated bull silhouette ──────────────────────────────────────────────────

interface BullProps {
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  anim?: 'wander' | 'wander-rev' | 'graze' | 'drink' | 'still';
  delay?: number;
}

const BullSilhouette: React.FC<BullProps> = ({ size = 'md', style, anim = 'still', delay = 0 }) => {
  const w = size === 'sm' ? 'w-3 h-2' : size === 'md' ? 'w-5 h-3' : 'w-6 h-4';
  const animClass =
    anim === 'wander'     ? 'animate-wander' :
    anim === 'wander-rev' ? 'animate-wander-rev' :
    anim === 'graze'      ? 'animate-graze' :
    anim === 'drink'      ? 'animate-drink' : '';

  return (
    <div
      className={`relative pointer-events-none ${animClass}`}
      style={{ ...style, animationDelay: delay ? `${delay}s` : undefined }}
    >
      <div className={`${w} bg-leather-900/70 rounded-full relative`}>
        <div className="absolute -top-1 left-1 w-2 h-2 bg-leather-900/70 rounded-t-full" />
        <div className="absolute -bottom-1 left-1 w-0.5 h-1 bg-leather-900/70" />
        <div className="absolute -bottom-1 right-1 w-0.5 h-1 bg-leather-900/70" />
      </div>
      <div className="absolute -top-2 left-0 w-1.5 h-0.5 border-t-2 border-leather-700/60 rounded-t-full -rotate-45" />
      <div className="absolute -top-2 right-0 w-1.5 h-0.5 border-t-2 border-leather-700/60 rounded-t-full rotate-45" />
      <div className="absolute top-1 -right-2 w-2 h-0.5 bg-leather-900/50 rounded rotate-12" />
    </div>
  );
};

// ── Bird silhouette ───────────────────────────────────────────────────────────

interface BirdProps {
  style?: React.CSSProperties;
  delay?: number;
}

const Bird: React.FC<BirdProps> = ({ style, delay = 0 }) => (
  <div
    className="absolute pointer-events-none animate-bird-fly"
    style={{ ...style, animationDelay: `${delay}s` }}
  >
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
      <path d="M9,5 Q6,1 1,3" stroke="rgba(100,80,60,0.6)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M9,5 Q12,1 17,3" stroke="rgba(100,80,60,0.6)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

// ── Campino figure ────────────────────────────────────────────────────────────

interface CampinoProps {
  style?: React.CSSProperties;
  activity: 'riding' | 'fence' | 'watching';
}

const CampinoFigure: React.FC<CampinoProps> = ({ style, activity }) => (
  <div className="absolute pointer-events-none select-none" style={style}>
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-1 bg-black/20 rounded-full blur-sm" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-1 bg-leather-800/80 rounded-full" />
    <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-4 h-3 bg-leather-700/80 rounded-t-sm" />
    <div className="w-4 h-4 bg-amber-900/65 rounded-full mx-auto mt-0.5" />
    <div
      className={`w-4 h-7 bg-leather-600/75 rounded-t mx-auto mt-0.5 ${activity === 'fence' ? 'animate-campino-work' : ''}`}
      style={{ transformOrigin: 'top center' }}
    />
    <div className="flex gap-0.5 justify-center">
      <div className="w-1.5 h-4 bg-leather-800/70 rounded-b" />
      <div className="w-1.5 h-4 bg-leather-800/70 rounded-b" />
    </div>
    {activity === 'fence' && (
      <div className="absolute top-10 -right-3 w-1 h-5 bg-leather-600/50 rounded origin-bottom animate-campino-work" />
    )}
  </div>
);

// ── Manuel — Maioral character ────────────────────────────────────────────────

const ManuelFigure: React.FC<{ hasDialogue: boolean }> = ({ hasDialogue }) => (
  <div className="absolute pointer-events-none select-none" style={{ top: '98px', right: '118px', zIndex: 15 }}>
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-1.5 bg-black/25 rounded-full blur-sm" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-1.5 bg-leather-900/90 rounded-full" />
    <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-5 h-4 bg-leather-800/90 rounded-t-sm" />
    <div className="w-5 h-5 bg-amber-800/75 rounded-full mx-auto mt-1" />
    <div className="w-6 h-9 bg-leather-700/85 rounded-t mx-auto mt-0.5 relative">
      <div className="absolute top-1 left-1 w-1.5 h-4 bg-leather-600/60 rounded-b-full" />
      <div className="absolute top-1 right-1 w-1.5 h-4 bg-leather-600/60 rounded-b-full" />
    </div>
    <div className="flex gap-0.5 justify-center">
      <div className="w-2 h-5 bg-leather-800/80 rounded-b" />
      <div className="w-2 h-5 bg-leather-800/80 rounded-b" />
    </div>
    {hasDialogue && (
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="relative bg-gold/90 text-leather-900 rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-gold/30">
          <span className="text-[10px] font-bold leading-none">!</span>
          <div className="absolute inset-0 rounded-full bg-gold/40 animate-ping" />
        </div>
      </div>
    )}
  </div>
);

// ── Smoke from chimney ────────────────────────────────────────────────────────

const ChimneySmoke: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <>
    <div className="absolute w-3 h-4 rounded-full bg-ivory/12 animate-smoke-rise" style={{ ...style, animationDelay: '0s' }} />
    <div className="absolute w-2 h-3 rounded-full bg-ivory/8 animate-smoke-rise" style={{ ...style, top: (style?.top as number ?? 0) - 6, animationDelay: '1.4s' }} />
    <div className="absolute w-2 h-3 rounded-full bg-ivory/6 animate-smoke-rise" style={{ ...style, top: (style?.top as number ?? 0) - 3, animationDelay: '2.8s' }} />
  </>
);

// ── Weather overlays ──────────────────────────────────────────────────────────

const RainOverlay: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        className="absolute w-px bg-gradient-to-b from-transparent via-sky-300/25 to-transparent animate-rain-fall"
        style={{
          left: `${(i * 3.4) % 100}%`,
          top: '-20%',
          height: '30%',
          animationDelay: `${(i * 0.04) % 1.2}s`,
          animationDuration: `${0.9 + (i % 5) * 0.08}s`,
        }}
      />
    ))}
    <div className="absolute inset-0 bg-slate-900/15" />
  </div>
);

const FogOverlay: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
    <div className="absolute inset-0 animate-fog-drift" style={{ background: 'radial-gradient(ellipse 120% 40% at 50% 70%, rgba(200,190,170,0.28) 0%, transparent 70%)' }} />
    <div className="absolute inset-0 animate-fog-drift" style={{ background: 'radial-gradient(ellipse 100% 30% at 30% 60%, rgba(190,180,165,0.20) 0%, transparent 65%)', animationDelay: '6s' }} />
  </div>
);

const WindOverlay: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="absolute h-px bg-gradient-to-r from-transparent via-ivory/8 to-transparent"
        style={{
          top: `${20 + i * 12}%`,
          left: '-10%',
          width: '120%',
          animationName: 'fog-drift',
          animationDuration: `${3 + i * 0.4}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: `${i * 0.5}s`,
        }}
      />
    ))}
  </div>
);

// ── Ambient event label ───────────────────────────────────────────────────────

interface AmbientLabelProps {
  text: string;
  style?: React.CSSProperties;
}

const AmbientLabel: React.FC<AmbientLabelProps> = ({ text, style }) => (
  <div
    className="absolute pointer-events-none"
    style={style}
  >
    <div className="bg-leather-900/75 border border-leather-600/40 rounded px-2 py-0.5 backdrop-blur-sm">
      <span className="text-ivory/35 text-[9px] font-body uppercase tracking-wider whitespace-nowrap">{text}</span>
    </div>
  </div>
);

// ── Truck ─────────────────────────────────────────────────────────────────────

const ParkedTruck: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div className="absolute pointer-events-none" style={style}>
    <div className="relative w-16 h-7">
      <div className="absolute left-0 bottom-0 w-10 h-5 bg-leather-700/60 border border-leather-600/40 rounded-sm" />
      <div className="absolute right-0 bottom-0 w-7 h-6 bg-leather-800/70 border border-leather-600/40 rounded-r-sm" />
      <div className="absolute bottom-0 left-2 w-4 h-1.5 bg-black/40 rounded-full" />
      <div className="absolute bottom-0 right-1 w-4 h-1.5 bg-black/40 rounded-full" />
      <div className="absolute right-1 top-1 w-4 h-3 bg-amber-900/20 border border-leather-600/30 rounded-sm" />
    </div>
  </div>
);

// ── Sky tint per period ───────────────────────────────────────────────────────

function getSkyTint(period: DayPeriod, weather: WeatherType): string {
  if (weather === 'Rain')   return 'from-slate-800/80 via-slate-700/50 to-leather-900';
  if (weather === 'Fog')    return 'from-stone-600/55 via-stone-500/25 to-leather-900';
  if (weather === 'Cloudy') return 'from-slate-600/45 via-amber-800/15 to-leather-900';
  switch (period) {
    case 'Morning':   return 'from-amber-400/50 via-orange-500/25 to-leather-900';
    case 'Afternoon': return 'from-sky-600/35 via-amber-700/15 to-leather-900';
    case 'Evening':   return 'from-orange-700/65 via-amber-600/40 to-leather-900';
    case 'Night':     return 'from-slate-900/90 via-slate-800/30 to-leather-900';
  }
}

function getGroundTint(period: DayPeriod): string {
  switch (period) {
    case 'Morning':   return 'from-amber-900/25 via-yellow-900/15 to-leather-900';
    case 'Afternoon': return 'from-amber-900/30 via-yellow-900/20 to-leather-900';
    case 'Evening':   return 'from-orange-900/40 via-amber-900/20 to-leather-900';
    case 'Night':     return 'from-leather-900/80 via-slate-900/20 to-leather-900';
  }
}

// ── Main component ────────────────────────────────────────────────────────────

const RanchMap: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const { state, dismissNotification, setActiveLocation } = useGameState();
  const { notifications } = state;
  const dayCycle = useDayCycle();
  const { period, weather } = dayCycle;

  const hover = (key: string) => () => setHovered(key);
  const unhover = () => setHovered(null);

  const openLocation = (key: BuildingKey) => {
    dismissNotification(key);
    setActiveLocation(key as LocationId);
  };

  // Deterministic ambient event selection based on period
  const ambientEvents = useMemo(() => {
    const events = {
      showFenceRepair:  period === 'Morning' || period === 'Afternoon',
      showDrinkingBull: period === 'Afternoon' || period === 'Evening',
      showTruck:        period === 'Morning' || period === 'Afternoon',
      showSmoke:        period === 'Evening' || period === 'Night',
      showVet:          period === 'Afternoon',
      showCampino2:     period !== 'Night',
    };
    return events;
  }, [period]);

  const skyTint = getSkyTint(period, weather);
  const groundTint = getGroundTint(period);
  const isNight = period === 'Night';
  const sunVisible = weather !== 'Rain' && weather !== 'Fog' && !isNight;

  return (
    <div className="relative h-full overflow-hidden">

      {/* ── SKY ── */}
      <div className="absolute inset-0 transition-all duration-[3000ms]">
        <div className={`absolute inset-0 bg-gradient-to-b ${skyTint} transition-all duration-[3000ms]`} />
        {!isNight && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-800/15 via-transparent to-purple-900/8" />
        )}
        {isNight && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent" />
        )}
      </div>

      {/* Stars (night only) */}
      {isNight && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-ivory/40 rounded-full animate-pulse"
              style={{ left: `${(i * 7.3 + 2) % 95}%`, top: `${(i * 5.7 + 1) % 35}%`, animationDelay: `${i * 0.15}s`, animationDuration: '3s' }}
            />
          ))}
        </div>
      )}

      {/* Sun / Moon */}
      {sunVisible && (
        <div className={`absolute pointer-events-none transition-all duration-[3000ms] ${period === 'Morning' ? 'top-16 left-1/5' : period === 'Afternoon' ? 'top-8 left-1/2 -translate-x-1/2' : 'top-12 left-1/4'}`}>
          <div className="w-24 h-24 bg-gradient-radial from-amber-400/55 via-orange-500/25 to-transparent rounded-full blur-xl animate-pulse" />
          <div className="absolute inset-0 w-24 h-24 bg-gradient-radial from-yellow-300/65 to-transparent rounded-full blur-md" />
        </div>
      )}
      {isNight && (
        <div className="absolute top-10 left-1/4 pointer-events-none">
          <div className="w-10 h-10 bg-gradient-radial from-ivory/30 via-ivory/10 to-transparent rounded-full blur-sm" />
        </div>
      )}

      {/* Mountains */}
      <svg className="absolute inset-x-0 top-0 h-48 w-full pointer-events-none" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mg1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a2a1f" />
            <stop offset="100%" stopColor="#1a1410" />
          </linearGradient>
          <linearGradient id="mg2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a3528" />
            <stop offset="100%" stopColor="#2a2018" />
          </linearGradient>
        </defs>
        <path d="M0,200 L0,100 Q80,50 160,80 Q240,30 350,70 Q420,20 520,60 Q620,10 720,50 Q800,30 900,80 Q1000,40 1100,70 Q1200,50 1200,100 L1200,200 Z" fill="url(#mg1)" opacity="0.4" />
        <path d="M0,200 L0,130 Q100,80 200,110 Q300,50 420,90 Q520,40 650,80 Q750,20 880,70 Q980,35 1100,90 Q1200,60 1200,130 L1200,200 Z" fill="url(#mg2)" opacity="0.6" />
      </svg>

      {/* Ground */}
      <div className="absolute bottom-0 inset-x-0 h-2/3 pointer-events-none transition-all duration-[3000ms]">
        <div className={`absolute inset-0 bg-gradient-to-b ${groundTint} transition-all duration-[3000ms]`} />
        <div className="absolute inset-0 bg-gradient-to-r from-leather-900/50 via-transparent to-leather-900/40" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[...Array(20)].map((_, i) => (
            <path key={i} d={`M0,${i * 5 + 2} Q25,${i * 5} 50,${i * 5 + 3} T100,${i * 5 + 2}`} stroke="#c9a227" strokeWidth="0.2" fill="none" />
          ))}
        </svg>
      </div>

      {/* Cork oaks */}
      {[{ top: '8%', left: '15%' }, { top: '75%', left: '30%' }, { top: '20%', right: '40%' }, { top: '60%', right: '55%' }].map((pos, i) => (
        <div key={i} className="absolute pointer-events-none" style={{ ...pos, opacity: isNight ? 0.2 : 0.4 }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-6 bg-leather-800/80 rounded-t" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-6 bg-emerald-950/60 rounded-t-full" />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-4 bg-emerald-950/50 rounded-full" />
        </div>
      ))}

      {/* Birds */}
      {!isNight && weather !== 'Rain' && (
        <>
          <Bird style={{ top: '18%', left: '35%' }} delay={0} />
          <Bird style={{ top: '22%', left: '20%' }} delay={3.5} />
          <Bird style={{ top: '15%', left: '55%' }} delay={7} />
        </>
      )}

      {/* Weather overlays */}
      {weather === 'Rain'  && <RainOverlay />}
      {weather === 'Fog'   && <FogOverlay />}
      {weather === 'Wind'  && <WindOverlay />}

      {/* ── ESTATE LAYOUT ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-5xl mx-10 my-16">

          {/* Perimeter fence */}
          <div className="absolute inset-2 border-[3px] border-leather-600/60 rounded-lg pointer-events-none">
            <div className="absolute inset-0 border-4 border-black/20 rounded-lg translate-y-1" />
            {[0, 25, 50, 75, 100].map(pct => (
              <React.Fragment key={pct}>
                <div className="absolute -top-2 w-3 h-6 bg-leather-700/80 rounded-t shadow-md" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
                  <div className="absolute top-0 inset-x-0 h-1 bg-leather-600/40" />
                </div>
                <div className="absolute -bottom-2 w-3 h-6 bg-leather-700/80 rounded-b shadow-md" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-leather-600/40" />
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Dirt roads */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400">
            <path d="M0,200 Q200,195 400,185 Q600,195 800,200" stroke="#4a3528" strokeWidth="20" fill="none" strokeLinecap="round" />
            <path d="M0,200 Q200,195 400,185 Q600,195 800,200" stroke="#5a4030" strokeWidth="16" fill="none" strokeLinecap="round" strokeDasharray="8,12" />
            <path d="M420,0 Q415,100 420,200 Q410,300 420,400" stroke="#4a3528" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M420,0 Q415,100 420,200 Q410,300 420,400" stroke="#5a4030" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray="6,10" />
          </svg>

          {/* ── CERCADO NORTE ── */}
          <div
            className="absolute top-6 left-6 right-1/2 bottom-[52%] mr-10 mb-4 rounded cursor-pointer group"
            onMouseEnter={hover('norte')}
            onMouseLeave={unhover}
            onClick={() => openLocation('cercado_norte')}
          >
            <div className={`absolute inset-0 rounded border-2 overflow-hidden transition-all duration-300 ${hovered === 'norte' ? 'border-gold/60 shadow-lg shadow-gold/15' : 'border-leather-600/50'}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-yellow-900/20 to-amber-950/30" />
              <div className={`absolute inset-0 bg-gold/5 transition-opacity duration-300 ${hovered === 'norte' ? 'opacity-100' : 'opacity-0'}`} />
              <div className="absolute inset-0 opacity-30">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className="absolute w-1 h-3 bg-emerald-800/40 rounded-t" style={{ left: `${5 + (i * 3.8) % 90}%`, top: `${10 + Math.sin(i * 0.5) * 40}%`, transform: `rotate(${-10 + (i % 3) * 10}deg)` }} />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-emerald-950/30 to-transparent" />
              <div className={`absolute top-2 left-1/2 -translate-x-1/2 transition-all duration-200 ${hovered === 'norte' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-leather-900/95 border border-gold/50 rounded px-3 py-1.5 shadow-lg whitespace-nowrap">
                  <p className="font-display text-xs text-gold tracking-widest uppercase">Cercado Norte</p>
                  <p className="text-ivory/50 text-[10px] font-body">24 animais · Pastagem activa</p>
                </div>
              </div>
            </div>

            {/* Animated bulls — Cercado Norte */}
            <BullSilhouette size="lg" anim="wander"     delay={0}   style={{ position: 'absolute', bottom: 20, left: 30 }} />
            <BullSilhouette size="md" anim="graze"      delay={1.5} style={{ position: 'absolute', bottom: 35, left: 70, opacity: 0.8 }} />
            <BullSilhouette size="sm" anim="wander-rev" delay={3}   style={{ position: 'absolute', bottom: 25, left: 110, opacity: 0.6 }} />
            <BullSilhouette size="md" anim="still"      delay={0}   style={{ position: 'absolute', bottom: 50, left: 90, opacity: 0.5 }} />
            <BullSilhouette size="sm" anim="graze"      delay={2}   style={{ position: 'absolute', bottom: 40, left: 150, opacity: 0.7 }} />
            {ambientEvents.showDrinkingBull && (
              <BullSilhouette size="md" anim="drink" delay={0.5} style={{ position: 'absolute', bottom: 15, left: 190, opacity: 0.75 }} />
            )}

            <div className={`absolute bottom-3 left-3 transition-opacity duration-200 ${hovered === 'norte' ? 'opacity-0' : 'opacity-100'}`}>
              <span className="text-ivory/40 text-[10px] font-body uppercase tracking-widest">Cercado Norte</span>
            </div>
            {notifications.cercado_norte && (
              <div className="absolute top-2 right-2 z-10">
                <NotificationBadge n={notifications.cercado_norte} />
              </div>
            )}

            {/* Fence repair campino */}
            {ambientEvents.showFenceRepair && (
              <>
                <CampinoFigure activity="fence" style={{ bottom: 8, right: 14, zIndex: 12 }} />
                <AmbientLabel text="A reparar vedação" style={{ bottom: -16, right: 0, zIndex: 13 }} />
              </>
            )}
          </div>

          {/* ── CERCADO SUL ── */}
          <div
            className="absolute top-[52%] left-6 right-1/2 bottom-6 mr-10 mt-4 rounded cursor-pointer group"
            onMouseEnter={hover('sul')}
            onMouseLeave={unhover}
            onClick={() => openLocation('cercado_sul')}
          >
            <div className={`absolute inset-0 rounded border-2 overflow-hidden transition-all duration-300 ${hovered === 'sul' ? 'border-gold/60 shadow-lg shadow-gold/15' : 'border-leather-600/50'}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-amber-950/30 via-yellow-900/25 to-emerald-950/20" />
              <div className={`absolute inset-0 bg-gold/5 transition-opacity duration-300 ${hovered === 'sul' ? 'opacity-100' : 'opacity-0'}`} />
              <div className="absolute inset-0 opacity-30">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="absolute w-1 h-3 bg-emerald-800/40 rounded-t" style={{ left: `${8 + (i * 4.5) % 88}%`, top: `${5 + Math.cos(i * 0.6) * 35}%`, transform: `rotate(${5 + (i % 4) * 5}deg)` }} />
                ))}
              </div>
              <div className={`absolute top-2 left-1/2 -translate-x-1/2 transition-all duration-200 ${hovered === 'sul' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-leather-900/95 border border-gold/50 rounded px-3 py-1.5 shadow-lg whitespace-nowrap">
                  <p className="font-display text-xs text-gold tracking-widest uppercase">Cercado Sul</p>
                  <p className="text-ivory/50 text-[10px] font-body">16 animais · Pastagem activa</p>
                </div>
              </div>
            </div>

            {/* Animated bulls — Cercado Sul */}
            <BullSilhouette size="md" anim="wander"     delay={1}   style={{ position: 'absolute', bottom: 25, left: 40 }} />
            <BullSilhouette size="lg" anim="graze"      delay={0}   style={{ position: 'absolute', bottom: 40, left: 80, opacity: 0.9 }} />
            <BullSilhouette size="sm" anim="wander-rev" delay={4}   style={{ position: 'absolute', bottom: 30, left: 130, opacity: 0.7 }} />
            <BullSilhouette size="md" anim="graze"      delay={2.5} style={{ position: 'absolute', bottom: 55, left: 100, opacity: 0.6 }} />

            <div className={`absolute bottom-3 left-3 transition-opacity duration-200 ${hovered === 'sul' ? 'opacity-0' : 'opacity-100'}`}>
              <span className="text-ivory/40 text-[10px] font-body uppercase tracking-widest">Cercado Sul</span>
            </div>
            {notifications.cercado_sul && (
              <div className="absolute top-2 right-2 z-10">
                <NotificationBadge n={notifications.cercado_sul} />
              </div>
            )}

            {/* Vet visiting in afternoon */}
            {ambientEvents.showVet && (
              <>
                <CampinoFigure activity="watching" style={{ bottom: 8, left: 180, zIndex: 12 }} />
                <AmbientLabel text="Veterinário em visita" style={{ bottom: -16, left: 155, zIndex: 13 }} />
              </>
            )}
          </div>

          {/* ── TENTADERO ── */}
          <div
            className={`absolute top-1/4 right-6 w-52 h-52 rounded-full cursor-pointer transition-transform duration-300 ${hovered === 'tentadero' ? 'scale-105' : ''}`}
            onMouseEnter={hover('tentadero')}
            onMouseLeave={unhover}
            onClick={() => openLocation('tentadero')}
          >
            {notifications.tentadero && <NotificationBadge n={notifications.tentadero} />}
            <div className={`absolute inset-0 rounded-full border-4 shadow-2xl transition-all duration-300 ${hovered === 'tentadero' ? 'border-gold/40 shadow-gold/15' : 'border-leather-600/60'}`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-leather-800/80 to-leather-900/90" />
            </div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-900/60 via-yellow-900/40 to-leather-800/70">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute w-full h-px bg-leather-600/20" style={{ top: `${8 + i * 8}%`, transform: `rotate(${-5 + i * 0.8}deg)` }} />
                ))}
              </div>
            </div>
            <div className="absolute inset-10 rounded-full border-2 border-gold/20" />
            <div className="absolute inset-16 rounded-full border border-gold/10 flex items-center justify-center">
              <div className="w-2 h-2 bg-gold/30 rounded-full" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-leather-800/80 border-2 border-leather-600/40 rounded-t" />
            <BuildingTooltip name="Tentadero" hint="Arena de provas" visible={hovered === 'tentadero'} />
          </div>

          {/* ── ESCRITÓRIO ── */}
          <div
            className="absolute top-6 right-20 w-28 h-20 cursor-pointer group"
            onMouseEnter={hover('escritorio')}
            onMouseLeave={unhover}
            onClick={() => openLocation('escritorio')}
            style={{ zIndex: 10 }}
          >
            {notifications.escritorio && <NotificationBadge n={notifications.escritorio} />}
            <BuildingTooltip name="Escritório" hint="Centro de administração" visible={hovered === 'escritorio'} />
            <div className="absolute inset-0 bg-black/30 translate-y-2 translate-x-1 rounded pointer-events-none" />
            <div className={`absolute inset-0 rounded shadow-lg border-2 transition-all duration-300 ${hovered === 'escritorio' ? 'bg-leather-700/95 border-gold/50 shadow-gold/20' : 'bg-leather-800/90 border-leather-600/60'}`}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[32px] border-l-transparent border-r-transparent border-b-amber-900/80 pointer-events-none" />
              <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[28px] border-l-transparent border-r-transparent border-b-amber-800/60 pointer-events-none transition-opacity duration-300 ${hovered === 'escritorio' ? 'opacity-100' : 'opacity-40'}`} />
              <div className={`absolute top-4 left-3 w-5 h-5 border rounded-sm transition-all duration-300 ${isNight || hovered === 'escritorio' ? 'bg-amber-400/50 border-amber-500/70' : 'bg-amber-500/20 border-leather-500/40'}`}>
                <div className="absolute inset-0.5 bg-amber-400/10" />
              </div>
              <div className={`absolute top-4 right-3 w-5 h-5 border rounded-sm transition-all duration-300 ${isNight || hovered === 'escritorio' ? 'bg-amber-400/50 border-amber-500/70' : 'bg-amber-500/20 border-leather-500/40'}`}>
                <div className="absolute inset-0.5 bg-amber-400/10" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-leather-900/80 border-t-2 border-leather-500/30 rounded-t">
                <div className="absolute top-3 right-1 w-1 h-1 bg-gold/40 rounded-full" />
              </div>
            </div>
          </div>

          {/* ── MANUEL — Maioral ── */}
          <ManuelFigure hasDialogue={!!state.pendingDialogue} />

          {/* ── CAMPINO 2 — Watching near tentadero ── */}
          {ambientEvents.showCampino2 && (
            <CampinoFigure
              activity="watching"
              style={{ position: 'absolute', top: '72%', right: '30%', zIndex: 15 }}
            />
          )}

          {/* ── CASA PRINCIPAL ── */}
          <div
            className="absolute top-6 right-56 w-32 h-24 cursor-pointer group"
            onMouseEnter={hover('casa')}
            onMouseLeave={unhover}
            onClick={() => openLocation('casa')}
            style={{ zIndex: 10 }}
          >
            {notifications.casa && <NotificationBadge n={notifications.casa} />}
            <BuildingTooltip name="Casa Principal" hint="Residência da herdade" visible={hovered === 'casa'} />
            <div className="absolute inset-0 bg-black/30 translate-y-2 translate-x-1 rounded pointer-events-none" />
            <div className={`absolute inset-0 rounded shadow-lg border-2 transition-all duration-300 ${hovered === 'casa' ? 'bg-leather-700/95 border-gold/40 shadow-gold/15' : 'bg-leather-800/80 border-leather-600/50'}`}>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[72px] border-r-[72px] border-b-[40px] border-l-transparent border-r-transparent border-b-amber-900/70 pointer-events-none" />
              <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[72px] border-r-[72px] border-b-[36px] border-l-transparent border-r-transparent border-b-amber-800/50 pointer-events-none transition-opacity duration-300 ${hovered === 'casa' ? 'opacity-100' : 'opacity-30'}`} />
              {/* Chimney */}
              <div className="absolute -top-14 right-5 w-4 h-8 bg-leather-700/70 border border-leather-600/40 rounded-t pointer-events-none" />
              {[3, 12, 21].map((left, i) => (
                <div key={i} className={`absolute top-4 w-5 h-5 border rounded-sm transition-all duration-300 ${isNight || hovered === 'casa' ? 'bg-amber-400/40 border-amber-500/60' : 'bg-amber-500/15 border-leather-500/30'}`} style={{ left: `${left}px` }}>
                  <div className="absolute inset-0.5 bg-amber-400/8" />
                </div>
              ))}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-10 bg-leather-900/80 border-t-2 border-leather-500/30 rounded-t-full">
                <div className="absolute top-4 right-1 w-1 h-1 bg-gold/40 rounded-full" />
              </div>
              <div className="absolute top-12 inset-x-2 h-px bg-leather-600/30" />
            </div>
            {/* Chimney smoke */}
            {ambientEvents.showSmoke && (
              <ChimneySmoke style={{ top: -50, right: 16 }} />
            )}
          </div>

          {/* ── CURRAIS ── */}
          <div
            className="absolute bottom-16 right-10 w-32 h-24 cursor-pointer group"
            onMouseEnter={hover('currais')}
            onMouseLeave={unhover}
            onClick={() => openLocation('currais')}
            style={{ zIndex: 10 }}
          >
            {notifications.currais && <NotificationBadge n={notifications.currais} />}
            <BuildingTooltip name="Currais" hint="8 toiros em manga" visible={hovered === 'currais'} />
            <div className={`absolute inset-0 rounded border-2 overflow-hidden transition-all duration-300 ${hovered === 'currais' ? 'border-gold/50 shadow-md shadow-gold/10' : 'border-leather-600/50'}`}>
              <div className={`absolute inset-0 bg-gold/5 transition-opacity duration-300 ${hovered === 'currais' ? 'opacity-100' : 'opacity-0'}`} />
              <div className="absolute inset-0 grid grid-cols-4 gap-0.5 bg-leather-900/20">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="relative h-full border-r border-leather-600/30 last:border-r-0 flex items-end justify-center pb-3">
                    {i < 3 && (
                      <div className="relative">
                        <div className="w-4 h-2.5 bg-leather-900/60 rounded-full" />
                        <div className="absolute -top-1 left-0 w-0.5 h-0.5 border-t-2 border-leather-700/50 rounded-t-full -rotate-45" />
                        <div className="absolute -top-1 right-0 w-0.5 h-0.5 border-t-2 border-leather-700/50 rounded-t-full rotate-45" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {[0, 33, 66, 100].map((pct, i) => (
              <div key={i} className="absolute -top-1 w-2 h-3 bg-leather-700/70 rounded-t pointer-events-none" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }} />
            ))}
          </div>

          {/* ── PARQUE DE EMBARQUE ── */}
          <div
            className="absolute bottom-8 right-52 w-24 h-16 cursor-pointer group"
            onMouseEnter={hover('embarque')}
            onMouseLeave={unhover}
            onClick={() => openLocation('embarque')}
            style={{ zIndex: 10 }}
          >
            {notifications.embarque && <NotificationBadge n={notifications.embarque} />}
            <BuildingTooltip name="Parque de Embarque" hint="Carga e transporte" visible={hovered === 'embarque'} />
            <div className={`absolute inset-0 rounded border-2 shadow-lg transition-all duration-300 ${hovered === 'embarque' ? 'border-gold/40 shadow-gold/10' : 'border-leather-600/50'}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-leather-700/80 via-leather-600/60 to-leather-700 rounded" />
              <div className={`absolute inset-0 bg-gold/5 rounded transition-opacity duration-300 ${hovered === 'embarque' ? 'opacity-100' : 'opacity-0'}`} />
              <div className="absolute inset-x-2 top-4 h-0.5 bg-leather-800/40 rounded" />
              <div className="absolute inset-x-2 bottom-4 h-0.5 bg-leather-800/40 rounded" />
            </div>
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-10 h-6 bg-leather-800/50 border border-leather-600/30 rounded flex items-center justify-center pointer-events-none">
              <div className="w-6 h-3 bg-leather-700/40 rounded-sm" />
            </div>
          </div>

          {/* Parked truck near embarque */}
          {ambientEvents.showTruck && (
            <>
              <ParkedTruck style={{ bottom: '10%', right: '22%', zIndex: 11 }} />
              <AmbientLabel text="Camião parado" style={{ bottom: 'calc(10% - 18px)', right: '22%', zIndex: 12 }} />
            </>
          )}

          {/* ── FLOATING ESTATE NAME ── */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="relative bg-leather-900/90 border border-gold/30 rounded px-5 py-2 shadow-lg backdrop-blur-sm">
              <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-gold/50" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t border-r border-gold/50" />
              <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b border-l border-gold/50" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r border-gold/50" />
              <p className="font-display text-xs text-gold/70 tracking-[0.3em] uppercase">Herdade da Ferraria</p>
            </div>
          </div>

        </div>
      </div>

      {/* Dust particles */}
      {!isNight && Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="absolute w-1 h-1 bg-amber-500/20 rounded-full animate-pulse pointer-events-none" style={{ left: `${5 + i * 7}%`, top: `${30 + Math.sin(i * 0.8) * 20}%`, animationDelay: `${i * 0.2}s`, animationDuration: '4s' }} />
      ))}

      {/* Heat shimmer (afternoon/morning only) */}
      {(period === 'Afternoon' || period === 'Morning') && weather === 'Sunny' && (
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-amber-600/5 to-transparent pointer-events-none" />
      )}

      {/* Night darkness overlay */}
      {isNight && (
        <div className="absolute inset-0 bg-slate-950/35 pointer-events-none" />
      )}

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
      </div>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '100px 100px' }} />
    </div>
  );
};

export default RanchMap;
