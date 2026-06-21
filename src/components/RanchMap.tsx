import React, { useState, useEffect } from 'react';
import { useGameState } from '../store/gameState';
import type { BuildingKey, BuildingNotification, LocationId } from '../store/gameState';

export type TimeOfDay = 'manha' | 'tarde' | 'entardecer' | 'noite';

// ── Ambient helpers ───────────────────────────────────────────────────────────

const MONTHS_ORDER = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export interface TimeInfo { label: string; time: string; period: TimeOfDay }

export function getTimeOfDay(month: string, year: number): TimeInfo {
  const idx = MONTHS_ORDER.indexOf(month);
  const hash = (idx * 7 + year * 3) % 4;
  const periods: TimeInfo[] = [
    { label: 'Manhã',       time: '09:30', period: 'manha' },
    { label: 'Tarde',       time: '14:15', period: 'tarde' },
    { label: 'Entardecer',  time: '18:45', period: 'entardecer' },
    { label: 'Noite',       time: '21:30', period: 'noite' },
  ];
  return periods[hash];
}

// ── Sound event placeholders ──────────────────────────────────────────────────
// Dispatches CustomEvents on window. No audio files needed.
// A future audio system can listen to these events.

type SoundEvent = 'birds' | 'wind' | 'cowbell' | 'horse' | 'gate' | 'rain' | 'cattle';

function emitSound(event: SoundEvent) {
  try {
    window.dispatchEvent(new CustomEvent('ranch:sound', { detail: { event } }));
  } catch {}
}

// ── Pre-computed ambient data (stable across renders) ─────────────────────────

const RAIN_DROPS = Array.from({ length: 38 }, (_, i) => ({
  left: `${((i * 2.65 + 0.5) % 100).toFixed(1)}%`,
  delay: `${((i * 0.073) % 0.65).toFixed(2)}s`,
  duration: `${(0.52 + (i % 7) * 0.05).toFixed(2)}s`,
  opacity: (0.3 + (i % 3) * 0.1).toFixed(2),
}));

const CLOUDS = [
  { top: '6%',  delay: '-22s', duration: '95s',  width: 130, height: 38, opacity: 0.28, cls: 'ambient-cloud-slow' },
  { top: '13%', delay: '-47s', duration: '72s',  width: 95,  height: 26, opacity: 0.2,  cls: 'ambient-cloud-mid'  },
  { top: '3%',  delay: '-68s', duration: '95s',  width: 155, height: 44, opacity: 0.22, cls: 'ambient-cloud-slow' },
  { top: '9%',  delay: '-10s', duration: '54s',  width: 75,  height: 22, opacity: 0.16, cls: 'ambient-cloud-fast' },
];

const BIRDS = [
  { top: '11%', delay: '0s',    duration: '28s' },
  { top: '7%',  delay: '-13s',  duration: '34s' },
  { top: '16%', delay: '-22s',  duration: '25s' },
  { top: '5%',  delay: '-39s',  duration: '42s' },
  { top: '19%', delay: '-55s',  duration: '31s' },
];

const LIGHTING: Record<TimeOfDay, string> = {
  manha:      'rgba(255,235,160,0.07)',
  tarde:      'rgba(0,0,0,0)',
  entardecer: 'rgba(220,90,30,0.05)',
  noite:      'rgba(15,20,60,0.28)',
};

// Pre-computed grazing animal positions in each cercado
// Each animal: position, size, bob delay, walk delay, turn delay
const NORTE_ANIMALS = [
  { bottom: 20, left: 30,  size: 'lg' as const, bobD: '0s',    walkD: '0s',   turnD: '0s'   },
  { bottom: 38, left: 68,  size: 'md' as const, bobD: '-1.5s', walkD: '-6s',  turnD: '-8s'  },
  { bottom: 24, left: 108, size: 'sm' as const, bobD: '-3s',   walkD: '-11s', turnD: '-4s'  },
  { bottom: 52, left: 90,  size: 'md' as const, bobD: '-0.7s', walkD: '-3s',  turnD: '-14s' },
  { bottom: 38, left: 148, size: 'sm' as const, bobD: '-2.2s', walkD: '-16s', turnD: '-2s'  },
  { bottom: 30, left: 185, size: 'md' as const, bobD: '-4s',   walkD: '-9s',  turnD: '-6s'  },
  { bottom: 60, left: 50,  size: 'sm' as const, bobD: '-1s',   walkD: '-18s', turnD: '-12s' },
];

const SUL_ANIMALS = [
  { bottom: 25, left: 40,  size: 'md' as const, bobD: '-0.5s', walkD: '-2s',  turnD: '-10s' },
  { bottom: 42, left: 80,  size: 'lg' as const, bobD: '-2.8s', walkD: '-7s',  turnD: '-3s'  },
  { bottom: 28, left: 130, size: 'sm' as const, bobD: '-1.2s', walkD: '-13s', turnD: '-7s'  },
  { bottom: 55, left: 100, size: 'md' as const, bobD: '-3.5s', walkD: '-5s',  turnD: '-15s' },
  { bottom: 35, left: 165, size: 'sm' as const, bobD: '-0.8s', walkD: '-10s', turnD: '-1s'  },
];

// Dust puff spawn points across the ground
const DUST_PUFFS = [
  { left: '12%', top: '72%', delay: '0s',    duration: '6.5s'  },
  { left: '28%', top: '68%', delay: '-2.3s', duration: '7.2s'  },
  { left: '45%', top: '75%', delay: '-4.1s', duration: '5.8s'  },
  { left: '62%', top: '70%', delay: '-1.5s', duration: '6.9s'  },
  { left: '78%', top: '73%', delay: '-5.6s', duration: '8.1s'  },
  { left: '88%', top: '67%', delay: '-3.2s', duration: '6.3s'  },
  { left: '35%', top: '80%', delay: '-7s',   duration: '9s'    },
  { left: '55%', top: '78%', delay: '-0.9s', duration: '7.5s'  },
];

// Ground cloud shadow passes
const GROUND_SHADOWS = [
  { top: '58%',  height: '12%', delay: '0s',   duration: '38s', opacity: 0.06 },
  { top: '70%',  height: '8%',  delay: '-14s',  duration: '52s', opacity: 0.05 },
  { top: '82%',  height: '10%', delay: '-29s',  duration: '44s', opacity: 0.04 },
];

// ── Small subcomponents ───────────────────────────────────────────────────────

const ComingSoonOverlay: React.FC<{ name: string; description?: string; onClose: () => void }> = ({ name, description, onClose }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm" onClick={onClose}>
    <div className="relative bg-leather-900 border-2 border-gold/40 rounded-lg px-10 py-8 shadow-2xl text-center max-w-sm mx-4" onClick={e => e.stopPropagation()}>
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold/60" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold/60" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gold/60" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gold/60" />
      <div className="text-4xl mb-4">🏗️</div>
      <h3 className="font-display text-xl text-gold tracking-widest uppercase mb-2">{name}</h3>
      {description && <p className="text-ivory/50 text-xs font-body mb-2">{description}</p>}
      <p className="text-ivory/60 text-sm font-body mb-1">Esta funcionalidade está em desenvolvimento.</p>
      <p className="text-ivory/30 text-xs font-body mb-6">Em breve disponível.</p>
      <button onClick={onClose} className="px-6 py-2 bg-leather-800 border border-gold/30 rounded text-gold/80 text-sm font-body hover:border-gold hover:text-gold transition-all duration-200">Fechar</button>
    </div>
  </div>
);

const NotificationBadge: React.FC<{ n: BuildingNotification }> = ({ n }) => (
  <div className="absolute -top-4 -right-2 z-20 flex items-center gap-1 bg-leather-900 border border-gold/70 rounded-full px-2 py-0.5 shadow-lg animate-bounce pointer-events-none select-none">
    <span className="text-[11px] leading-none">{n.icon}</span>
    <span className="text-gold text-[9px] font-body uppercase tracking-wide whitespace-nowrap">{n.label}</span>
  </div>
);

const BuildingTooltip: React.FC<{ name: string; hint: string; visible: boolean }> = ({ name, hint, visible }) => (
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

// ── Grazing bull with all three animation layers ───────────────────────────────

interface BullProps {
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  animated?: boolean;
  bobDelay?: string;
  walkDelay?: string;
  turnDelay?: string;
}

const BullSilhouette: React.FC<BullProps> = ({
  size = 'md', style, animated = false,
  bobDelay = '0s', walkDelay = '0s', turnDelay = '0s',
}) => {
  const w = size === 'sm' ? 'w-3 h-2' : size === 'md' ? 'w-5 h-3' : 'w-6 h-4';
  const body = (
    <div className="relative pointer-events-none">
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

  if (!animated) {
    return <div className="relative pointer-events-none" style={style}>{body}</div>;
  }

  return (
    // Outer: horizontal walk drift
    <div
      className="graze-walk"
      style={{ ...style, animationDelay: walkDelay }}
    >
      {/* Middle: turn/flip */}
      <div className="graze-turn" style={{ animationDelay: turnDelay }}>
        {/* Inner: bob */}
        <div className="graze-bob" style={{ animationDelay: bobDelay }}>
          {body}
        </div>
      </div>
    </div>
  );
};

// ── Staff figure (campino / maioral) ──────────────────────────────────────────

interface StickFigureProps {
  hat?: boolean;
  opacity?: number;
  style?: React.CSSProperties;
  className?: string;
}

const StickFigure: React.FC<StickFigureProps> = ({ hat = false, opacity = 0.55, style, className = '' }) => (
  <div className={`select-none ${className}`} style={{ ...style, opacity }}>
    {/* Hat */}
    {hat && <div className="w-4 h-1 bg-amber-800/80 rounded mx-auto mb-0" />}
    {/* Head */}
    <div className="w-3 h-3 bg-amber-800/75 rounded-full mx-auto" />
    {/* Body */}
    <div className="w-2.5 h-5 bg-leather-700/80 rounded-t mx-auto mt-0.5 relative">
      {/* Arms */}
      <div className="absolute top-1 -left-1.5 w-2 h-1 bg-leather-700/70 rounded-b-full rotate-12" />
      <div className="absolute top-1 -right-1.5 w-2 h-1 bg-leather-700/70 rounded-b-full -rotate-12" />
    </div>
    {/* Legs */}
    <div className="flex gap-0.5 justify-center">
      <div className="w-1.5 h-4 bg-leather-800/75 rounded-b" />
      <div className="w-1.5 h-4 bg-leather-800/75 rounded-b" />
    </div>
    {/* Shadow */}
    <div className="w-5 h-1 bg-black/20 rounded-full mx-auto blur-sm -mt-0.5" />
  </div>
);

// ── Static Manuel figure (Maioral near office) ────────────────────────────────

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

// ── Cloud shape ───────────────────────────────────────────────────────────────

const CloudShape: React.FC<{ width: number; height: number; opacity: number }> = ({ width, height, opacity }) => (
  <div style={{ position: 'relative', width, height, opacity }}>
    <div style={{ position: 'absolute', bottom: 0, left: '8%', right: '8%', height: '55%', background: 'rgba(210,200,185,0.5)', borderRadius: '50px' }} />
    <div style={{ position: 'absolute', bottom: '18%', left: '15%', right: '35%', height: '80%', background: 'rgba(210,200,185,0.4)', borderRadius: '50%' }} />
    <div style={{ position: 'absolute', bottom: '18%', left: '32%', right: '15%', height: '95%', background: 'rgba(210,200,185,0.4)', borderRadius: '50%' }} />
    <div style={{ position: 'absolute', bottom: '18%', left: '50%', right: '25%', height: '70%', background: 'rgba(210,200,185,0.35)', borderRadius: '50%' }} />
  </div>
);

// ── Bird shape ────────────────────────────────────────────────────────────────

const BirdShape: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <svg width={24 * scale} height={10 * scale} viewBox="0 0 24 10">
    <path d={`M0,5 Q6,${5 - 5 * scale} 12,5 Q18,${5 - 5 * scale} 24,5`} stroke="rgba(35,25,15,0.55)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
  </svg>
);

// ── Sound scheduler ───────────────────────────────────────────────────────────
// Fires ambient sound events on a random schedule.

function useSoundScheduler(ambientEnabled: boolean) {
  useEffect(() => {
    if (!ambientEnabled) return;

    // Fire birds shortly after mount
    const birdTimer = setTimeout(() => emitSound('birds'), 3500);

    const schedule = [
      { event: 'birds'   as SoundEvent, minMs: 18000, maxMs: 45000 },
      { event: 'wind'    as SoundEvent, minMs: 25000, maxMs: 70000 },
      { event: 'cowbell' as SoundEvent, minMs: 30000, maxMs: 80000 },
      { event: 'cattle'  as SoundEvent, minMs: 40000, maxMs: 90000 },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    function scheduleNext(entry: typeof schedule[0]) {
      const delay = entry.minMs + Math.random() * (entry.maxMs - entry.minMs);
      const t = setTimeout(() => {
        emitSound(entry.event);
        scheduleNext(entry);
      }, delay);
      timers.push(t);
    }

    schedule.forEach(scheduleNext);

    return () => {
      clearTimeout(birdTimer);
      timers.forEach(clearTimeout);
    };
  }, [ambientEnabled]);
}

// ── Activity dot — shows when a location is currently occupied ────────────────

const ActivityDot: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="absolute top-1.5 right-1.5 z-20 pointer-events-none">
      <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
      <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400/40 animate-ping" />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const RanchMap: React.FC<{
  highlightedId?: string | null;
  ambientEnabled?: boolean;
  occupiedLocations?: Set<string>;
  routineNotification?: string | null;
}> = ({
  highlightedId,
  ambientEnabled = true,
  occupiedLocations,
  routineNotification,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const { state, dismissNotification, setActiveLocation } = useGameState();
  const { notifications } = state;

  useSoundScheduler(ambientEnabled);

  const tod = getTimeOfDay(state.month, state.year);
  const weather = state.weather;
  const showRain = ambientEnabled && (weather.type === 'rain');
  const showFog  = ambientEnabled && (weather.type === 'fog');
  const showWind = ambientEnabled && (weather.type === 'wind' || weather.type === 'cold');

  const hover = (key: string) => () => setHovered(key);
  const unhover = () => setHovered(null);

  const openLocation = (key: BuildingKey) => {
    dismissNotification(key);
    setActiveLocation(key as LocationId);
  };

  const skyGradients: Record<TimeOfDay, { from: string; via: string }> = {
    manha:      { from: 'from-sky-800/70',      via: 'via-amber-500/30' },
    tarde:      { from: 'from-sky-700/50',       via: 'via-amber-600/25' },
    entardecer: { from: 'from-orange-700/60',    via: 'via-amber-600/40' },
    noite:      { from: 'from-slate-900/90',     via: 'via-indigo-950/60' },
  };
  const sky = skyGradients[tod.period];

  return (
    <div className="relative h-full overflow-hidden">

      {/* ── SKY ── */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-b ${sky.from} ${sky.via} via-60% to-leather-900`} />
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/15 via-transparent to-purple-900/8" />
      </div>

      {/* ── Daylight subtle pulse ── */}
      {ambientEnabled && tod.period !== 'noite' && (
        <div
          className="absolute inset-0 pointer-events-none daylight-pulse"
          style={{ background: 'rgba(255,235,160,0.06)', zIndex: 1 }}
        />
      )}

      {/* ── AMBIENT: Time-of-day lighting tint ── */}
      {ambientEnabled && (
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-1000"
          style={{ background: LIGHTING[tod.period], zIndex: 1 }}
        />
      )}

      {/* Sun / Moon */}
      {tod.period !== 'noite' ? (
        <div className="absolute top-12 left-1/4 pointer-events-none" style={{ zIndex: 2 }}>
          <div className="w-32 h-32 bg-gradient-radial from-amber-400/50 via-orange-500/30 to-transparent rounded-full blur-xl animate-pulse" />
          <div className="absolute inset-0 w-32 h-32 bg-gradient-radial from-yellow-300/70 to-transparent rounded-full blur-md" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 w-40 h-0.5 bg-gradient-to-r from-amber-500/30 to-transparent origin-left" style={{ transform: `rotate(${i * 45}deg)` }} />
          ))}
        </div>
      ) : (
        <div className="absolute top-10 left-1/4 pointer-events-none" style={{ zIndex: 2 }}>
          <div className="w-12 h-12 rounded-full bg-gradient-radial from-slate-200/40 via-slate-300/20 to-transparent blur-sm" />
          <div className="absolute inset-1 w-10 h-10 rounded-full border border-slate-300/20" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full bg-slate-300/30" style={{ top: `${20 + Math.sin(i * 1.05) * 30}px`, left: `${20 + Math.cos(i * 1.05) * 30}px` }} />
          ))}
        </div>
      )}

      {/* Mountains */}
      <svg className="absolute inset-x-0 top-0 h-48 w-full pointer-events-none" viewBox="0 0 1200 200" preserveAspectRatio="none" style={{ zIndex: 2 }}>
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

      {/* ── AMBIENT: CLOUDS ── */}
      {ambientEnabled && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
          {CLOUDS.map((c, i) => (
            <div key={i} className={`absolute ${c.cls}`} style={{ top: c.top, left: '105vw', animationDelay: c.delay, animationDuration: c.duration }}>
              <CloudShape width={c.width} height={c.height} opacity={c.opacity} />
            </div>
          ))}
        </div>
      )}

      {/* ── AMBIENT: Ground cloud shadows ── */}
      {ambientEnabled && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 4 }}>
          {GROUND_SHADOWS.map((s, i) => (
            <div
              key={i}
              className="absolute ground-shadow-anim"
              style={{
                top: s.top,
                left: '-25%',
                width: '35%',
                height: s.height,
                background: 'rgba(20,15,8,1)',
                borderRadius: '50%',
                animationDelay: `${i === 0 ? '0s' : i === 1 ? '-14s' : '-29s'}`,
                animationDuration: s.duration,
                opacity: s.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* ── AMBIENT: BIRDS ── */}
      {ambientEnabled && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 4 }}>
          {BIRDS.map((b, i) => (
            <div key={i} className="absolute ambient-bird" style={{ top: b.top, left: '105vw', animationDelay: b.delay, animationDuration: b.duration }}>
              <BirdShape scale={0.75 + i * 0.12} />
            </div>
          ))}
        </div>
      )}

      {/* Ground */}
      <div className="absolute bottom-0 inset-x-0 h-2/3 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/30 via-yellow-900/20 to-leather-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-leather-900/50 via-transparent to-leather-900/40" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[...Array(20)].map((_, i) => (
            <path key={i} d={`M0,${i * 5 + 2} Q25,${i * 5} 50,${i * 5 + 3} T100,${i * 5 + 2}`} stroke="#c9a227" strokeWidth="0.2" fill="none" />
          ))}
        </svg>
      </div>

      {/* Cork oaks */}
      {[{ top: '8%', left: '15%' }, { top: '75%', left: '30%' }, { top: '20%', right: '40%' }, { top: '60%', right: '55%' }].map((pos, i) => (
        <div
          key={i}
          className={`absolute opacity-40 pointer-events-none ${ambientEnabled ? 'ambient-tree' : ''}`}
          style={{ ...pos, animationDelay: `${i * 0.85}s`, zIndex: 5 }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-6 bg-leather-800/80 rounded-t" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-6 bg-emerald-950/60 rounded-t-full" />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-4 bg-emerald-950/50 rounded-full" />
        </div>
      ))}

      {/* ── AMBIENT: Dust puffs ── */}
      {ambientEnabled && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
          {DUST_PUFFS.map((d, i) => (
            <div
              key={i}
              className="absolute dust-puff"
              style={{
                left: d.left,
                top: d.top,
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(180,150,100,0.3)',
                animationDelay: d.delay,
                animationDuration: d.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* ── AMBIENT: Dust columns (heat haze) ── */}
      {ambientEnabled && tod.period === 'tarde' && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
          {[
            { left: '22%', delay: '0s' },
            { left: '68%', delay: '-5s' },
          ].map((col, i) => (
            <div
              key={i}
              className="absolute bottom-0 dust-column"
              style={{
                left: col.left,
                width: '4px',
                height: '60px',
                background: 'linear-gradient(to top, rgba(180,150,100,0.15), transparent)',
                borderRadius: '4px',
                animationDelay: col.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* ── ESTATE LAYOUT ── */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
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

              <div className={`absolute inset-0 opacity-30 ${ambientEnabled && showWind ? 'ambient-grass' : ''}`}>
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

            {/* Grazing animals — animated */}
            {NORTE_ANIMALS.map((a, i) => (
              <BullSilhouette
                key={i}
                size={a.size}
                animated={ambientEnabled}
                bobDelay={a.bobD}
                walkDelay={a.walkD}
                turnDelay={a.turnD}
                style={{ position: 'absolute', bottom: a.bottom, left: a.left, opacity: 0.6 + i * 0.04 }}
              />
            ))}

            <div className={`absolute bottom-3 left-3 transition-opacity duration-200 ${hovered === 'norte' ? 'opacity-0' : 'opacity-100'}`}>
              <span className="text-ivory/40 text-[10px] font-body uppercase tracking-widest">Cercado Norte</span>
            </div>
            {notifications.cercado_norte && (
              <div className="absolute top-2 right-2 z-10"><NotificationBadge n={notifications.cercado_norte} /></div>
            )}
            <ActivityDot visible={!!occupiedLocations?.has('cercado_norte')} />
            {highlightedId === 'cercado_norte' && (
              <div className="absolute inset-0 rounded border-2 border-gold/70 shadow-xl shadow-gold/40 pointer-events-none z-20 animate-pulse" />
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

              <div className={`absolute inset-0 opacity-30 ${ambientEnabled && showWind ? 'ambient-grass' : ''}`} style={ambientEnabled && showWind ? { animationDelay: '-1.4s' } : {}}>
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

            {/* Grazing animals — animated */}
            {SUL_ANIMALS.map((a, i) => (
              <BullSilhouette
                key={i}
                size={a.size}
                animated={ambientEnabled}
                bobDelay={a.bobD}
                walkDelay={a.walkD}
                turnDelay={a.turnD}
                style={{ position: 'absolute', bottom: a.bottom, left: a.left, opacity: 0.6 + i * 0.05 }}
              />
            ))}

            <div className={`absolute bottom-3 left-3 transition-opacity duration-200 ${hovered === 'sul' ? 'opacity-0' : 'opacity-100'}`}>
              <span className="text-ivory/40 text-[10px] font-body uppercase tracking-widest">Cercado Sul</span>
            </div>
            {notifications.cercado_sul && (
              <div className="absolute top-2 right-2 z-10"><NotificationBadge n={notifications.cercado_sul} /></div>
            )}
            <ActivityDot visible={!!occupiedLocations?.has('cercado_sul')} />
            {highlightedId === 'cercado_sul' && (
              <div className="absolute inset-0 rounded border-2 border-gold/70 shadow-xl shadow-gold/40 pointer-events-none z-20 animate-pulse" />
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
            <ActivityDot visible={!!occupiedLocations?.has('tentadero')} />
            {highlightedId === 'tentadero' && (
              <div className="absolute inset-0 rounded-full border-2 border-gold/70 shadow-xl shadow-gold/40 pointer-events-none z-20 animate-pulse" />
            )}
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
            <ActivityDot visible={!!occupiedLocations?.has('escritorio')} />
            {highlightedId === 'escritorio' && (
              <div className="absolute inset-0 rounded border-2 border-gold/70 shadow-xl shadow-gold/40 pointer-events-none z-20 animate-pulse" />
            )}
            <BuildingTooltip name="Escritório" hint="Centro de administração" visible={hovered === 'escritorio'} />
            <div className="absolute inset-0 bg-black/30 translate-y-2 translate-x-1 rounded pointer-events-none" />
            <div className={`absolute inset-0 rounded shadow-lg border-2 transition-all duration-300 ${hovered === 'escritorio' ? 'bg-leather-700/95 border-gold/50 shadow-gold/20' : 'bg-leather-800/90 border-leather-600/60'}`}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[32px] border-l-transparent border-r-transparent border-b-amber-900/80 pointer-events-none" />
              <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[28px] border-l-transparent border-r-transparent border-b-amber-800/60 pointer-events-none transition-opacity duration-300 ${hovered === 'escritorio' ? 'opacity-100' : 'opacity-40'}`} />
              <div className={`absolute top-4 left-3 w-5 h-5 border rounded-sm transition-all duration-300 ${hovered === 'escritorio' ? 'bg-amber-400/40 border-amber-500/60' : 'bg-amber-500/20 border-leather-500/40'}`}>
                <div className="absolute inset-0.5 bg-amber-400/10" />
              </div>
              <div className={`absolute top-4 right-3 w-5 h-5 border rounded-sm transition-all duration-300 ${hovered === 'escritorio' ? 'bg-amber-400/40 border-amber-500/60' : 'bg-amber-500/20 border-leather-500/40'}`}>
                <div className="absolute inset-0.5 bg-amber-400/10" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-leather-900/80 border-t-2 border-leather-500/30 rounded-t">
                <div className="absolute top-3 right-1 w-1 h-1 bg-gold/40 rounded-full" />
              </div>
            </div>
          </div>

          {/* ── MANUEL — Maioral (static with dialogue indicator) ── */}
          <ManuelFigure hasDialogue={!!state.pendingDialogue} />

          {/* ── AMBIENT: Campinos walking route ── */}
          {ambientEnabled && (
            <>
              <StickFigure hat className="campino-a" style={{ animationDelay: '0s', zIndex: 14 }} />
              <StickFigure hat className="campino-b" style={{ animationDelay: '-18s', zIndex: 14 }} />
            </>
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
            <ActivityDot visible={!!occupiedLocations?.has('casa')} />
            <BuildingTooltip name="Casa Principal" hint="Residência da herdade" visible={hovered === 'casa'} />
            <div className="absolute inset-0 bg-black/30 translate-y-2 translate-x-1 rounded pointer-events-none" />
            <div className={`absolute inset-0 rounded shadow-lg border-2 transition-all duration-300 ${hovered === 'casa' ? 'bg-leather-700/95 border-gold/40 shadow-gold/15' : 'bg-leather-800/80 border-leather-600/50'}`}>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[72px] border-r-[72px] border-b-[40px] border-l-transparent border-r-transparent border-b-amber-900/70 pointer-events-none" />
              <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[72px] border-r-[72px] border-b-[36px] border-l-transparent border-r-transparent border-b-amber-800/50 pointer-events-none transition-opacity duration-300 ${hovered === 'casa' ? 'opacity-100' : 'opacity-30'}`} />
              <div className="absolute -top-14 right-5 w-4 h-8 bg-leather-700/70 border border-leather-600/40 rounded-t pointer-events-none" />

              {ambientEnabled && (
                <>
                  <div className="pointer-events-none ambient-smoke" style={{ position: 'absolute', top: '-30px', right: '19px', width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(210,200,185,0.5)', animationDelay: '0s' }} />
                  <div className="pointer-events-none ambient-smoke" style={{ position: 'absolute', top: '-30px', right: '21px', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(210,200,185,0.42)', animationDelay: '-1.2s' }} />
                  <div className="pointer-events-none ambient-smoke" style={{ position: 'absolute', top: '-30px', right: '17px', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(210,200,185,0.38)', animationDelay: '-2.5s' }} />
                </>
              )}

              {[3, 12, 21].map((left, i) => (
                <div key={i} className={`absolute top-4 w-5 h-5 border rounded-sm transition-all duration-300 ${hovered === 'casa' ? 'bg-amber-400/30 border-amber-500/50' : 'bg-amber-500/15 border-leather-500/30'}`} style={{ left: `${left}px` }}>
                  <div className="absolute inset-0.5 bg-amber-400/8" />
                </div>
              ))}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-10 bg-leather-900/80 border-t-2 border-leather-500/30 rounded-t-full">
                <div className="absolute top-4 right-1 w-1 h-1 bg-gold/40 rounded-full" />
              </div>
              <div className="absolute top-12 inset-x-2 h-px bg-leather-600/30" />
            </div>
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
            <ActivityDot visible={!!occupiedLocations?.has('currais')} />
            {highlightedId === 'currais' && (
              <div className="absolute inset-0 rounded border-2 border-gold/70 shadow-xl shadow-gold/40 pointer-events-none z-20 animate-pulse" />
            )}
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
            {highlightedId === 'embarque' && (
              <div className="absolute inset-0 rounded border-2 border-gold/70 shadow-xl shadow-gold/40 pointer-events-none z-20 animate-pulse" />
            )}
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

          {/* ── ROUTINE NOTIFICATION TOAST ── */}
          {routineNotification && (
            <div
              key={routineNotification}
              className="routine-notif absolute pointer-events-none"
              style={{ top: '52px', left: '50%', zIndex: 30 }}
            >
              <div className="bg-leather-900/95 border border-leather-600/50 rounded-full px-4 py-1.5 shadow-lg backdrop-blur-sm whitespace-nowrap">
                <p className="text-ivory/65 text-[11px] font-body">{routineNotification}</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Heat shimmer */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-amber-600/5 to-transparent pointer-events-none" style={{ zIndex: 6 }} />

      {/* ── AMBIENT: Rain overlay ── */}
      {showRain && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 15 }}>
          {RAIN_DROPS.map((d, i) => (
            <div
              key={i}
              className="absolute ambient-rain-drop"
              style={{
                left: d.left,
                top: '-30px',
                width: '1px',
                height: '18px',
                background: 'linear-gradient(to bottom, transparent, rgba(160,195,230,0.55), transparent)',
                animationDelay: d.delay,
                animationDuration: d.duration,
                opacity: Number(d.opacity),
              }}
            />
          ))}
          <div className="absolute inset-0 bg-sky-900/8" />
        </div>
      )}

      {/* ── AMBIENT: Fog mist ── */}
      {showFog && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
          {[
            { top: '52%', height: '14%', delay: '0s' },
            { top: '64%', height: '11%', delay: '-4.5s' },
            { top: '76%', height: '9%',  delay: '-7s' },
          ].map((m, i) => (
            <div
              key={i}
              className="absolute inset-x-0 ambient-mist"
              style={{
                top: m.top, height: m.height,
                background: 'linear-gradient(to right, transparent 0%, rgba(200,205,195,0.16) 15%, rgba(200,205,195,0.22) 50%, rgba(200,205,195,0.16) 85%, transparent 100%)',
                animationDelay: m.delay,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-slate-500/6" />
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
      </div>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '100px 100px', zIndex: 21 }} />
    </div>
  );
};

export default RanchMap;
