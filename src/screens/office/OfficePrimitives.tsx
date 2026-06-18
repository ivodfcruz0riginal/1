import React from 'react';

// ── Section heading ───────────────────────────────────────────────────────────

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <h3 className="font-display text-xs text-gold/70 tracking-widest uppercase">{children}</h3>
    <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
  </div>
);

// ── Paper card ────────────────────────────────────────────────────────────────

interface PaperCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`relative bg-leather-800/40 border border-leather-600/40 rounded-lg p-4
      hover:border-gold/25 hover:bg-leather-800/60 transition-all duration-200
      ${onClick ? 'cursor-pointer' : ''}
      ${className}`}
  >
    {/* Subtle paper texture top edge */}
    <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
    {children}
  </div>
);

// ── Status pill ───────────────────────────────────────────────────────────────

type PillVariant = 'gold' | 'green' | 'amber' | 'red' | 'sky' | 'rose' | 'muted';

const PILL_CLASSES: Record<PillVariant, string> = {
  gold:   'border-gold/40 text-gold bg-gold/5',
  green:  'border-emerald-500/40 text-emerald-400 bg-emerald-900/10',
  amber:  'border-amber-500/40 text-amber-400 bg-amber-900/10',
  red:    'border-red-500/40 text-red-400 bg-red-900/10',
  sky:    'border-sky-500/40 text-sky-400 bg-sky-900/10',
  rose:   'border-rose-500/40 text-rose-400 bg-rose-900/10',
  muted:  'border-leather-500/40 text-ivory/40 bg-leather-800/20',
};

export const Pill: React.FC<{ label: string; variant?: PillVariant }> = ({ label, variant = 'muted' }) => (
  <span className={`text-[10px] font-body px-2 py-0.5 rounded-full border shrink-0 ${PILL_CLASSES[variant]}`}>
    {label}
  </span>
);

// ── Empty state ───────────────────────────────────────────────────────────────

export const EmptyState: React.FC<{ icon: string; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4 opacity-30">{icon}</div>
    <p className="font-display text-sm text-ivory/30 tracking-wider uppercase">{title}</p>
    {subtitle && <p className="text-ivory/20 text-xs font-body mt-2">{subtitle}</p>}
  </div>
);

// ── Stat block ────────────────────────────────────────────────────────────────

export const StatBlock: React.FC<{ label: string; value: React.ReactNode; sub?: string }> = ({ label, value, sub }) => (
  <div className="bg-leather-800/40 border border-leather-600/40 rounded-lg p-4">
    <p className="text-ivory/40 text-[10px] font-body uppercase tracking-wider mb-1">{label}</p>
    <div className="font-display text-xl text-ivory">{value}</div>
    {sub && <p className="text-ivory/30 text-[10px] font-body mt-1">{sub}</p>}
  </div>
);
