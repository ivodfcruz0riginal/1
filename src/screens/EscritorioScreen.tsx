import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../store/gameState';
import DiarioTab from './office/DiarioTab';
import JornalTab from './office/JornalTab';
import EconomiaTab from './office/EconomiaTab';
import CalendarioTab from './office/CalendarioTab';
import ContratosTab from './office/ContratosTab';
import LivroTab from './office/LivroTab';
import PrestigioTab from './office/PrestigioTab';
import AdministracaoTab from './office/AdministracaoTab';

// ── Tab config ────────────────────────────────────────────────────────────────

type TabKey = 'diario' | 'jornal' | 'economia' | 'calendario' | 'contratos' | 'livro' | 'prestigio' | 'administracao';

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'diario',        icon: '📖', label: 'Diário' },
  { key: 'jornal',        icon: '📰', label: 'Gazeta' },
  { key: 'economia',      icon: '💰', label: 'Finanças' },
  { key: 'calendario',    icon: '📅', label: 'Calendário' },
  { key: 'contratos',     icon: '📜', label: 'Contratos' },
  { key: 'livro',         icon: '📚', label: 'Livro da Casa' },
  { key: 'prestigio',     icon: '👑', label: 'Prestígio' },
  { key: 'administracao', icon: '⚙️', label: 'Equipa' },
];

// ── Bull silhouette painting ──────────────────────────────────────────────────

const BullPainting: React.FC = () => (
  <svg viewBox="0 0 100 72" className="w-full h-full" aria-hidden="true">
    {/* Body */}
    <path d="M35,42 Q30,31 35,22 Q45,13 58,17 Q72,13 81,20 Q89,29 86,42 Q89,52 82,57 Q70,62 55,60 Q38,62 32,53 Z"
      fill="rgba(28,16,6,0.85)" />
    {/* Neck */}
    <path d="M37,20 Q44,14 51,18 Q53,24 51,33 Q44,38 37,35 Q33,29 35,23 Z"
      fill="rgba(28,16,6,0.85)" />
    {/* Head */}
    <path d="M21,37 Q16,28 19,19 Q26,9 39,15 Q48,9 52,18 Q54,27 49,37 Q41,45 28,41 Z"
      fill="rgba(28,16,6,0.85)" />
    {/* Hump */}
    <path d="M55,16 Q63,9 70,13 Q73,18 70,23 Q64,25 59,22 Q55,20 55,16 Z"
      fill="rgba(22,12,4,0.8)" />
    {/* Left horn */}
    <path d="M23,18 Q17,7 11,4" fill="none" stroke="rgba(140,95,30,0.55)" strokeWidth="2.2" strokeLinecap="round" />
    {/* Right horn */}
    <path d="M37,13 Q43,3 49,1" fill="none" stroke="rgba(140,95,30,0.55)" strokeWidth="2.2" strokeLinecap="round" />
    {/* Legs */}
    <line x1="42" y1="59" x2="40" y2="70" stroke="rgba(28,16,6,0.85)" strokeWidth="4" strokeLinecap="round" />
    <line x1="52" y1="60" x2="51" y2="70" stroke="rgba(28,16,6,0.85)" strokeWidth="4" strokeLinecap="round" />
    <line x1="66" y1="60" x2="66" y2="70" stroke="rgba(28,16,6,0.85)" strokeWidth="4" strokeLinecap="round" />
    <line x1="76" y1="58" x2="78" y2="69" stroke="rgba(28,16,6,0.85)" strokeWidth="4" strokeLinecap="round" />
    {/* Tail */}
    <path d="M85,41 Q94,32 91,44 Q89,51 84,55" fill="none" stroke="rgba(28,16,6,0.85)" strokeWidth="2.5" strokeLinecap="round" />
    {/* Eye */}
    <circle cx="23" cy="26" r="2.2" fill="rgba(90,60,20,0.5)" />
    {/* Nostril */}
    <ellipse cx="18" cy="32" rx="2" ry="1.2" fill="rgba(50,28,8,0.45)" />
  </svg>
);

// ── Office wall decorations ───────────────────────────────────────────────────

const WallDecoration: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Wood wainscoting at bottom */}
    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-amber-950/25 to-transparent" />

    {/* Bull painting – top left */}
    <div className="absolute top-6 left-6 w-20 h-16 opacity-15">
      <div className="w-full h-full bg-amber-950/30 border border-leather-500/25 rounded overflow-hidden p-1.5">
        <BullPainting />
      </div>
      {/* Frame */}
      <div className="absolute -inset-1 border border-gold/15 rounded pointer-events-none" />
      <div className="absolute -inset-2 border border-leather-600/15 rounded pointer-events-none" />
    </div>

    {/* Map sketch – top right */}
    <div className="absolute top-5 right-5 w-24 h-18 opacity-15">
      <div className="w-full h-full bg-amber-950/40 border border-leather-500/20 rounded p-1.5">
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect x="10" y="10" width="80" height="60" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.5" />
          <path d="M10,40 Q30,35 50,40 Q70,45 90,40" fill="none" stroke="#c9a227" strokeWidth="0.8" opacity="0.4" />
          <path d="M50,10 Q48,25 50,40 Q52,55 50,70" fill="none" stroke="#c9a227" strokeWidth="0.8" opacity="0.4" />
          <circle cx="50" cy="40" r="3" fill="#c9a227" opacity="0.4" />
          <text x="52" y="38" fontSize="6" fill="#c9a227" opacity="0.5">HF</text>
        </svg>
      </div>
      <div className="absolute -inset-1 border border-gold/15 rounded pointer-events-none" />
    </div>

    {/* Bookshelf hint – right side centre */}
    <div className="absolute top-1/2 -translate-y-1/2 right-3 flex flex-col gap-0.5 opacity-10">
      {['bg-amber-800/60', 'bg-leather-600/60', 'bg-amber-900/60', 'bg-leather-700/60', 'bg-amber-700/60'].map((c, i) => (
        <div key={i} className={`w-3 ${c} rounded-sm`} style={{ height: `${28 + i * 4}px` }} />
      ))}
    </div>

    {/* Subtle vignette */}
    <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/15" />
  </div>
);

// ── Tab navigation ────────────────────────────────────────────────────────────

interface TabBarProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

const TabBar: React.FC<TabBarProps> = ({ active, onChange }) => (
  <div className="flex items-end gap-0 overflow-x-auto shrink-0 border-b border-leather-700/50">
    {TABS.map(tab => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-body whitespace-nowrap transition-all duration-200 border-b-2 ${
          active === tab.key
            ? 'border-gold text-gold bg-gradient-to-t from-gold/8 to-transparent'
            : 'border-transparent text-ivory/45 hover:text-ivory/70 hover:bg-leather-700/20'
        }`}
      >
        <span className="text-sm">{tab.icon}</span>
        <span className="uppercase tracking-wider text-[11px]">{tab.label}</span>
      </button>
    ))}
  </div>
);

// ── Main screen ───────────────────────────────────────────────────────────────

const EscritorioScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('diario');
  const navigate = useNavigate();
  const { state, dismissNotification } = useGameState();

  useEffect(() => {
    dismissNotification('escritorio');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-full flex flex-col overflow-hidden relative"
      style={{ background: 'linear-gradient(160deg, #1a130e 0%, #150f0a 60%, #1c1108 100%)' }}>

      <WallDecoration />

      {/* Header — aged wood look */}
      <div className="relative z-10 shrink-0 border-b border-leather-600/50"
        style={{ background: 'linear-gradient(180deg, #2a1c12 0%, #1e1409 100%)' }}>
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/herdade')}
            className="text-ivory/35 hover:text-gold/80 transition-colors text-xs font-body flex items-center gap-1.5 mr-2"
          >
            ← Herdade
          </button>
          <div className="h-4 w-px bg-leather-600/40" />

          {/* Office nameplate */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-leather-700/60 border border-gold/20 flex items-center justify-center shrink-0">
              <span className="text-gold/60 text-sm">🏛️</span>
            </div>
            <div>
              <h2 className="font-display text-lg text-gold tracking-widest uppercase leading-none">Escritório do Patrão</h2>
              <p className="text-ivory/35 text-[11px] font-body mt-0.5">Herdade da Ferraria · {state.month} {state.year}</p>
            </div>
          </div>

          {/* Season badge */}
          <div className="ml-auto bg-leather-800/60 border border-leather-600/30 rounded px-3 py-1.5">
            <p className="text-ivory/30 text-[9px] font-body uppercase tracking-widest">{state.season}</p>
          </div>
        </div>

        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content area — two-panel layout: ambient sidebar + main content */}
      <div className="relative z-10 flex-1 flex overflow-hidden">

        {/* Left ambient panel — wood texture, wall art */}
        <div className="w-48 shrink-0 border-r border-leather-700/40 flex flex-col relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #1e1409 0%, #170f08 100%)' }}>

          {/* Wood grain lines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="absolute inset-x-0 h-px bg-amber-800"
                style={{ top: `${(i + 1) * 5.5}%`, transform: `skewY(${i % 2 === 0 ? 0.3 : -0.3}deg)` }} />
            ))}
          </div>

          {/* Bull silhouette painting */}
          <div className="mx-4 mt-4 mb-3 relative">
            <div className="h-28 bg-gradient-to-b from-amber-950/30 to-leather-900/70 border border-leather-600/30 rounded flex items-center justify-center overflow-hidden p-3">
              <BullPainting />
              <div className="absolute inset-0 bg-gradient-to-t from-leather-900/20 to-transparent pointer-events-none" />
            </div>
            {/* Painting frame */}
            <div className="absolute -inset-1 border border-gold/15 rounded pointer-events-none" />
            <div className="absolute -inset-2 border border-leather-600/20 rounded pointer-events-none" />
            <p className="text-ivory/15 text-[9px] font-body text-center mt-2 italic tracking-wider">Herdade da Ferraria · 1947</p>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

          {/* Quick stats */}
          <div className="mx-4 mt-3 space-y-2">
            {[
              { label: 'Cabeças', value: `${state.animals.length}` },
              { label: 'Tesouraria', value: `${Math.round(state.economy.treasury / 1000)}k€` },
              { label: 'Acontecimentos', value: `${state.eventLog.length}` },
            ].map(s => (
              <div key={s.label} className="flex items-baseline justify-between">
                <span className="text-ivory/25 text-[10px] font-body uppercase tracking-wider">{s.label}</span>
                <span className="text-gold/60 text-xs font-display">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Subtle seal at bottom */}
          <div className="mt-auto mx-auto mb-5 opacity-10">
            <div className="w-12 h-12 rounded-full border-2 border-gold/60 flex items-center justify-center">
              <span className="text-xl">🐂</span>
            </div>
            <p className="text-gold/40 text-[8px] font-body text-center mt-1 tracking-widest uppercase">Est. 1947</p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Paper surface */}
          <div className="flex-1 overflow-hidden m-5 rounded-lg relative"
            style={{ background: 'linear-gradient(160deg, #1e1509 0%, #180e07 100%)', border: '1px solid rgba(90,60,30,0.35)' }}>
            {/* Paper texture top edge */}
            <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent pointer-events-none" />
            <div className="h-full overflow-hidden flex flex-col p-5">
              {activeTab === 'diario'        && <DiarioTab />}
              {activeTab === 'jornal'        && <JornalTab />}
              {activeTab === 'economia'      && <EconomiaTab />}
              {activeTab === 'calendario'    && <CalendarioTab />}
              {activeTab === 'contratos'     && <ContratosTab />}
              {activeTab === 'livro'         && <LivroTab />}
              {activeTab === 'prestigio'     && <PrestigioTab />}
              {activeTab === 'administracao' && <AdministracaoTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscritorioScreen;
