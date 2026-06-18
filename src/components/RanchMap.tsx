import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../store/gameState';
import type { BuildingKey } from '../store/gameState';

// ── Coming Soon overlay ───────────────────────────────────────────────────────

interface ComingSoonProps {
  name: string;
  onClose: () => void;
}

const ComingSoonOverlay: React.FC<ComingSoonProps> = ({ name, onClose }) => (
  <div
    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
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
      <p className="text-ivory/60 text-sm font-body mb-1">Esta funcionalidade está em desenvolvimento.</p>
      <p className="text-ivory/40 text-xs font-body mb-6">Em breve disponível.</p>

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

interface NotificationBadgeProps {
  icon: string;
  label: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ icon, label }) => (
  <div className="absolute -top-3 -right-3 z-20 flex items-center gap-1 bg-leather-900 border border-gold/60 rounded-full px-2 py-0.5 shadow-lg animate-bounce pointer-events-none">
    <span className="text-xs">{icon}</span>
    <span className="text-gold text-[9px] font-body uppercase tracking-wide whitespace-nowrap">{label}</span>
  </div>
);

// ── Interactive map label ─────────────────────────────────────────────────────

interface MapLabelProps {
  title: string;
  subtitle: string;
  position: { top?: string; left?: string; right?: string; bottom?: string };
  onClick: () => void;
  notification?: { icon: string; label: string } | null;
  isHovered?: boolean;
}

const MapLabel: React.FC<MapLabelProps> = ({ title, subtitle, position, onClick, notification, isHovered }) => (
  <div
    className="absolute cursor-pointer group"
    style={{ ...position }}
    onClick={onClick}
  >
    <div className={`relative bg-leather-900/95 border-2 rounded-md px-4 py-3 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
      isHovered ? 'border-gold shadow-gold/20' : 'border-gold/50 hover:border-gold hover:shadow-premium'
    }`}>
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gold" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gold" />

      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gold/30 rounded-r">
        <div className="absolute inset-0 bg-gold rounded-r animate-pulse" />
      </div>

      <div className="flex items-center gap-3 pl-2">
        <div>
          <p className="font-display text-sm text-gold tracking-widest uppercase">{title}</p>
          <p className="text-ivory/80 text-xs font-body mt-0.5">{subtitle}</p>
        </div>
      </div>

      {notification && (
        <NotificationBadge icon={notification.icon} label={notification.label} />
      )}

      <div className="absolute inset-0 rounded-md bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  </div>
);

// ── Bull silhouette ───────────────────────────────────────────────────────────

const BullSilhouette: React.FC<{ size?: 'small' | 'medium' | 'large'; style?: React.CSSProperties }> = ({
  size = 'medium',
  style,
}) => {
  const sizes = {
    small: { body: 'w-3 h-2' },
    medium: { body: 'w-5 h-3' },
    large: { body: 'w-6 h-4' },
  };

  return (
    <div className="relative" style={style}>
      <div className={`${sizes[size].body} bg-leather-900/70 rounded-full relative`}>
        <div className="absolute -top-1 left-1 w-2 h-2 bg-leather-900/70 rounded-t-full" />
        <div className="absolute -bottom-1 left-1 w-0.5 h-1 bg-leather-900/70" />
        <div className="absolute -bottom-1 right-1 w-0.5 h-1 bg-leather-900/70" />
      </div>
      <div className="absolute -top-2 left-0 w-1.5 h-0.5 border-t-2 border-leather-700/60 rounded-t-full transform -rotate-45" />
      <div className="absolute -top-2 right-0 w-1.5 h-0.5 border-t-2 border-leather-700/60 rounded-t-full transform rotate-45" />
      <div className="absolute top-1 -right-2 w-2 h-0.5 bg-leather-900/50 rounded transform rotate-12" />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const RanchMap: React.FC = () => {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const navigate = useNavigate();
  const { state, dismissNotification } = useGameState();
  const { notifications } = state;

  const goToEscritorio = () => {
    dismissNotification('escritorio');
    navigate('/escritorio');
  };

  const openComingSoon = (name: string, key: BuildingKey) => {
    dismissNotification(key);
    setComingSoon(name);
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Coming Soon overlay */}
      {comingSoon && (
        <ComingSoonOverlay name={comingSoon} onClose={() => setComingSoon(null)} />
      )}

      {/* Sky gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-700/60 via-amber-600/40 via-60% to-leather-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 via-transparent to-purple-900/10" />
      </div>

      {/* Sunset sun */}
      <div className="absolute top-12 left-1/4">
        <div className="w-32 h-32 bg-gradient-radial from-amber-400/50 via-orange-500/30 to-transparent rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-0 w-32 h-32 bg-gradient-radial from-yellow-300/70 to-transparent rounded-full blur-md" />
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-40 h-0.5 bg-gradient-to-r from-amber-500/30 to-transparent origin-left"
            style={{ transform: `rotate(${i * 45}deg)` }}
          />
        ))}
      </div>

      {/* Mountains */}
      <svg className="absolute inset-x-0 top-0 h-48 w-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mountainGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a2a1f" />
            <stop offset="100%" stopColor="#1a1410" />
          </linearGradient>
          <linearGradient id="mountainGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a3528" />
            <stop offset="100%" stopColor="#2a2018" />
          </linearGradient>
        </defs>
        <path d="M0,200 L0,100 Q80,50 160,80 Q240,30 350,70 Q420,20 520,60 Q620,10 720,50 Q800,30 900,80 Q1000,40 1100,70 Q1200,50 1200,100 L1200,200 Z" fill="url(#mountainGrad1)" opacity="0.4" />
        <path d="M0,200 L0,130 Q100,80 200,110 Q300,50 420,90 Q520,40 650,80 Q750,20 880,70 Q980,35 1100,90 Q1200,60 1200,130 L1200,200 Z" fill="url(#mountainGrad2)" opacity="0.6" />
      </svg>

      {/* Ground terrain */}
      <div className="absolute bottom-0 inset-x-0 h-2/3">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/30 via-yellow-900/20 to-leather-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-leather-900/50 via-transparent to-leather-900/40" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[...Array(20)].map((_, i) => (
            <path key={i} d={`M0,${i * 5 + 2} Q25,${i * 5} 50,${i * 5 + 3} T100,${i * 5 + 2}`} stroke="#c9a227" strokeWidth="0.2" fill="none" />
          ))}
        </svg>
      </div>

      {/* Cork oak trees */}
      {[{ top: '8%', left: '15%' }, { top: '75%', left: '30%' }, { top: '20%', right: '40%' }, { top: '60%', right: '55%' }].map((pos, i) => (
        <div key={i} className="absolute opacity-40" style={{ ...pos }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-6 bg-leather-800/80 rounded-t" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-6 bg-emerald-950/60 rounded-t-full" />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-4 bg-emerald-950/50 rounded-full" />
        </div>
      ))}

      {/* Main Ranch Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-5xl mx-10 my-20">

          {/* MAIN PERIMETER FENCE */}
          <div className="absolute inset-2 border-[3px] border-leather-600/60 rounded-lg">
            <div className="absolute inset-0 border-4 border-black/20 rounded-lg translate-y-1" />
            {[0, 25, 50, 75, 100].map((pct) => (
              <React.Fragment key={`top-${pct}`}>
                <div className="absolute -top-2 w-3 h-6 bg-leather-700/80 rounded-t shadow-md" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
                  <div className="absolute top-0 inset-x-0 h-1 bg-leather-600/40" />
                </div>
                <div className="absolute -bottom-2 w-3 h-6 bg-leather-700/80 rounded-b shadow-md" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-leather-600/40" />
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* DIRT ROADS */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
            <path d="M0,200 Q200,195 400,185 Q600,195 800,200" stroke="#4a3528" strokeWidth="20" fill="none" strokeLinecap="round" />
            <path d="M0,200 Q200,195 400,185 Q600,195 800,200" stroke="#5a4030" strokeWidth="16" fill="none" strokeLinecap="round" strokeDasharray="8,12" />
            <path d="M420,0 Q415,100 420,200 Q410,300 420,400" stroke="#4a3528" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M420,0 Q415,100 420,200 Q410,300 420,400" stroke="#5a4030" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray="6,10" />
          </svg>

          {/* CERCADO NORTE */}
          <div
            className={`absolute top-6 left-6 right-1/2 bottom-[52%] mr-10 mb-4 rounded transition-all duration-500 cursor-pointer ${hoveredArea === 'norte' ? 'shadow-lg shadow-gold/20' : ''}`}
            onMouseEnter={() => setHoveredArea('norte')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-yellow-900/20 to-amber-950/30 rounded border-2 border-leather-600/50 overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className="absolute w-1 h-3 bg-emerald-800/40 rounded-t" style={{ left: `${5 + (i * 3.8) % 90}%`, top: `${10 + Math.sin(i * 0.5) * 40}%`, transform: `rotate(${-10 + (i % 3) * 10}deg)` }} />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-emerald-950/30 to-transparent" />
            </div>
            <BullSilhouette size="large" style={{ position: 'absolute', bottom: '20px', left: '30px' }} />
            <BullSilhouette size="medium" style={{ position: 'absolute', bottom: '35px', left: '70px', opacity: 0.8 }} />
            <BullSilhouette size="small" style={{ position: 'absolute', bottom: '25px', left: '110px', opacity: 0.6 }} />
            <BullSilhouette size="medium" style={{ position: 'absolute', bottom: '50px', left: '90px', opacity: 0.5 }} />
            <BullSilhouette size="small" style={{ position: 'absolute', bottom: '40px', left: '150px', opacity: 0.7 }} />
          </div>

          {/* CERCADO SUL */}
          <div
            className={`absolute top-[52%] left-6 right-1/2 bottom-6 mr-10 mt-4 rounded transition-all duration-500 cursor-pointer ${hoveredArea === 'sul' ? 'shadow-lg shadow-gold/20' : ''}`}
            onMouseEnter={() => setHoveredArea('sul')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-amber-950/30 via-yellow-900/25 to-emerald-950/20 rounded border-2 border-leather-600/50 overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="absolute w-1 h-3 bg-emerald-800/40 rounded-t" style={{ left: `${8 + (i * 4.5) % 88}%`, top: `${5 + Math.cos(i * 0.6) * 35}%`, transform: `rotate(${5 + (i % 4) * 5}deg)` }} />
                ))}
              </div>
            </div>
            <BullSilhouette size="medium" style={{ position: 'absolute', bottom: '25px', left: '40px' }} />
            <BullSilhouette size="large" style={{ position: 'absolute', bottom: '40px', left: '80px', opacity: 0.9 }} />
            <BullSilhouette size="small" style={{ position: 'absolute', bottom: '30px', left: '130px', opacity: 0.7 }} />
            <BullSilhouette size="medium" style={{ position: 'absolute', bottom: '55px', left: '100px', opacity: 0.6 }} />
          </div>

          {/* TENTADERO - Circular Arena */}
          <div
            className={`absolute top-1/4 right-6 w-52 h-52 rounded-full transition-all duration-300 cursor-pointer ${hoveredArea === 'tentadero' ? 'scale-105' : 'hover:scale-103'}`}
            onMouseEnter={() => setHoveredArea('tentadero')}
            onMouseLeave={() => setHoveredArea(null)}
            onClick={() => openComingSoon('Tentadero', 'tentadero')}
          >
            <div className="absolute inset-0 rounded-full bg-leather-700/50 border-4 border-leather-600/60 shadow-2xl">
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
            {/* Hover "click" hint */}
            <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity duration-200 ${hoveredArea === 'tentadero' ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-gold/80 text-xs font-body uppercase tracking-widest bg-leather-900/70 px-2 py-1 rounded">Clique</span>
            </div>
          </div>

          {/* ESCRITÓRIO - Main Building */}
          <div
            className={`absolute top-4 right-20 w-28 h-20 cursor-pointer transition-transform duration-200 ${hoveredArea === 'escritorio' ? 'scale-110' : 'hover:scale-105'}`}
            onMouseEnter={() => setHoveredArea('escritorio')}
            onMouseLeave={() => setHoveredArea(null)}
            onClick={goToEscritorio}
          >
            {notifications.escritorio && (
              <NotificationBadge icon={notifications.escritorio.icon} label={notifications.escritorio.label} />
            )}
            <div className="absolute inset-0 bg-black/30 translate-y-2 translate-x-1 rounded" />
            <div className="absolute inset-0 bg-leather-800/90 border-2 border-leather-600/60 rounded shadow-lg">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[32px] border-l-transparent border-r-transparent border-b-amber-900/80" />
              <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[28px] border-l-transparent border-r-transparent border-b-amber-800/60 transition-opacity duration-500 ${hoveredArea === 'escritorio' ? 'opacity-100' : 'opacity-40'}`} />
              <div className="absolute top-4 left-3 w-5 h-5 bg-amber-500/20 border border-leather-500/40 rounded-sm">
                <div className="absolute inset-0.5 bg-amber-400/10" />
              </div>
              <div className="absolute top-4 right-3 w-5 h-5 bg-amber-500/20 border border-leather-500/40 rounded-sm">
                <div className="absolute inset-0.5 bg-amber-400/10" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-leather-900/80 border-t-2 border-leather-500/30 rounded-t">
                <div className="absolute top-3 right-1 w-1 h-1 bg-gold/40 rounded-full" />
              </div>
            </div>
          </div>

          {/* CURRAIS - Corral Pens */}
          <div
            className={`absolute bottom-16 right-10 w-32 h-24 cursor-pointer transition-transform duration-200 ${hoveredArea === 'currais' ? 'scale-105' : 'hover:scale-103'}`}
            onMouseEnter={() => setHoveredArea('currais')}
            onMouseLeave={() => setHoveredArea(null)}
            onClick={() => openComingSoon('Currais', 'currais')}
          >
            {notifications.currais && (
              <NotificationBadge icon={notifications.currais.icon} label={notifications.currais.label} />
            )}
            <div className="absolute inset-0 grid grid-cols-4 gap-0.5 bg-leather-900/20 border-2 border-leather-600/50 rounded overflow-hidden">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="relative h-full border-r border-leather-600/30 last:border-r-0 flex items-end justify-center pb-3">
                  {i < 3 && (
                    <div className="relative">
                      <div className="w-4 h-2.5 bg-leather-900/60 rounded-full" />
                      <div className="absolute -top-1 left-0 w-0.5 h-0.5 border-t-2 border-leather-700/50 rounded-t-full transform -rotate-45" />
                      <div className="absolute -top-1 right-0 w-0.5 h-0.5 border-t-2 border-leather-700/50 rounded-t-full transform rotate-45" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {[0, 33, 66, 100].map((pct, i) => (
              <div key={i} className="absolute -top-1 w-2 h-3 bg-leather-700/70 rounded-t" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }} />
            ))}
          </div>

          {/* PARQUE DE EMBARQUE - Loading Area */}
          <div
            className={`absolute bottom-8 right-48 w-24 h-16 cursor-pointer transition-transform duration-200 ${hoveredArea === 'embarque' ? 'scale-105' : 'hover:scale-103'}`}
            onMouseEnter={() => setHoveredArea('embarque')}
            onMouseLeave={() => setHoveredArea(null)}
            onClick={() => openComingSoon('Parque de Embarque', 'embarque')}
          >
            {notifications.embarque && (
              <NotificationBadge icon={notifications.embarque.icon} label={notifications.embarque.label} />
            )}
            <div className="absolute inset-0 bg-leather-700/60 border-2 border-leather-600/50 rounded shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-leather-700/80 via-leather-600/60 to-leather-700 rounded" />
              <div className="absolute inset-x-2 top-4 h-0.5 bg-leather-800/40 rounded" />
              <div className="absolute inset-x-2 bottom-4 h-0.5 bg-leather-800/40 rounded" />
            </div>
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-10 h-6 bg-leather-800/50 border border-leather-600/30 rounded flex items-center justify-center">
              <div className="w-6 h-3 bg-leather-700/40 rounded-sm" />
            </div>
          </div>

          {/* MAP LABELS */}
          <MapLabel
            title="Cercado Norte"
            subtitle="24 animais"
            position={{ top: '15%', left: '8%' }}
            onClick={() => {}}
            isHovered={hoveredArea === 'norte'}
          />
          <MapLabel
            title="Cercado Sul"
            subtitle="16 animais"
            position={{ bottom: '18%', left: '8%' }}
            onClick={() => {}}
            isHovered={hoveredArea === 'sul'}
          />
          <MapLabel
            title="Tentadero"
            subtitle="Clique para abrir"
            position={{ top: '45%', right: '3%' }}
            onClick={() => openComingSoon('Tentadero', 'tentadero')}
            isHovered={hoveredArea === 'tentadero'}
          />
          <MapLabel
            title="Escritório"
            subtitle="Clique para gerir"
            position={{ top: '2%', right: '12%' }}
            onClick={goToEscritorio}
            notification={notifications.escritorio}
            isHovered={hoveredArea === 'escritorio'}
          />
          <MapLabel
            title="Currais"
            subtitle="8 toiros"
            position={{ bottom: '10%', right: '5%' }}
            onClick={() => openComingSoon('Currais', 'currais')}
            notification={notifications.currais}
            isHovered={hoveredArea === 'currais'}
          />
          <MapLabel
            title="Parque de Embarque"
            subtitle="Clique para abrir"
            position={{ bottom: '5%', right: '28%' }}
            onClick={() => openComingSoon('Parque de Embarque', 'embarque')}
            notification={notifications.embarque}
            isHovered={hoveredArea === 'embarque'}
          />

        </div>
      </div>

      {/* Atmospheric dust */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-amber-500/20 rounded-full animate-pulse"
          style={{ left: `${5 + i * 7}%`, top: `${30 + Math.sin(i * 0.8) * 20}%`, animationDelay: `${i * 0.2}s`, animationDuration: '4s' }}
        />
      ))}

      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-amber-600/5 to-transparent pointer-events-none" />

      {/* Cinematic vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
      </div>

      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, backgroundSize: '100px 100px' }}
      />
    </div>
  );
};

export default RanchMap;
