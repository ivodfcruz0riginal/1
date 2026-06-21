import React from 'react';
import { useGameState } from '../../store/gameState';
import { SectionTitle, PaperCard } from './OfficePrimitives';
import type { StaffMember } from '../../types/staff';

// ── Stat bar ──────────────────────────────────────────────────────────────────

interface StatBarProps {
  label: string;
  value: number;
  invert?: boolean; // high value = bad (fatigue)
}

const StatBar: React.FC<StatBarProps> = ({ label, value, invert = false }) => {
  const good = invert ? value < 40 : value > 65;
  const bad  = invert ? value > 70 : value < 35;
  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-ivory/40 text-[9px] font-body uppercase tracking-wider">{label}</span>
        <span className="text-ivory/30 text-[9px] font-body">{value}%</span>
      </div>
      <div className="h-1 bg-leather-700/40 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            good ? 'bg-emerald-500/70' :
            bad  ? 'bg-red-500/70' :
                   'bg-amber-500/70'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

// ── Role pill ─────────────────────────────────────────────────────────────────

const ROLE_STYLE: Record<StaffMember['role'], string> = {
  Maioral: 'border-gold/40 text-gold/80 bg-gold/5',
  Campino: 'border-leather-500/40 text-ivory/40 bg-leather-800/20',
};

// ── Staff card ────────────────────────────────────────────────────────────────

const StaffCard: React.FC<{ member: StaffMember }> = ({ member }) => (
  <PaperCard>
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-display text-sm text-ivory/80 tracking-wider">{member.name}</p>
        <span className={`inline-block mt-1 text-[9px] font-body px-2 py-0.5 rounded-full border ${ROLE_STYLE[member.role]}`}>
          {member.role}
        </span>
      </div>
      <div className="text-right">
        <p className="text-ivory/25 text-[9px] font-body uppercase tracking-wider">Experiência</p>
        <p className="text-gold/70 text-sm font-display">{member.experience}</p>
      </div>
    </div>

    <div className="space-y-2 mb-3">
      <StatBar label="Humor"       value={member.mood} />
      <StatBar label="Fadiga"      value={member.fatigue} invert />
      <StatBar label="Lealdade"    value={member.loyalty} />
      <StatBar label="Saúde"       value={member.health} />
    </div>

    {member.monthlyNote && (
      <p className="text-ivory/35 text-[10px] font-body italic border-t border-leather-600/25 pt-2 leading-relaxed">
        "{member.monthlyNote}"
      </p>
    )}
  </PaperCard>
);

// ── Tab ───────────────────────────────────────────────────────────────────────

const AdministracaoTab: React.FC = () => {
  const { state } = useGameState();
  const { staff } = state;

  const maioral = staff.find(m => m.role === 'Maioral');
  const campinos = staff.filter(m => m.role === 'Campino');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SectionTitle>Pessoal da Herdade</SectionTitle>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {maioral && (
          <div>
            <p className="text-ivory/25 text-[9px] font-body uppercase tracking-[0.18em] mb-2">Maioral</p>
            <StaffCard member={maioral} />
          </div>
        )}
        {campinos.length > 0 && (
          <div>
            <p className="text-ivory/25 text-[9px] font-body uppercase tracking-[0.18em] mb-2">Campinos</p>
            <div className="space-y-3">
              {campinos.map(m => (
                <StaffCard key={m.id} member={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdministracaoTab;
