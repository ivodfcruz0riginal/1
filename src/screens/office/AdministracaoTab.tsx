import React from 'react';
import { SectionTitle, PaperCard } from './OfficePrimitives';

// ── Staff data ────────────────────────────────────────────────────────────────

interface StaffMember {
  name: string;
  role: string;
  description: string;
  since: string;
  activity: string;
  statusLabel: string;
  statusClass: string;
}

const STAFF: StaffMember[] = [
  {
    name: 'Manuel Monteiro',
    role: 'Maioral',
    description: 'Responsável máximo pelo efectivo. Supervisiona o pastoreio, a selecção e as provas.',
    since: '1971',
    activity: 'Ronda matinal — Cercado Norte',
    statusLabel: 'No campo',
    statusClass: 'text-emerald-400/70',
  },
  {
    name: 'António, Rodrigo, Zé Luís e Paulo',
    role: 'Campinos',
    description: 'A alma da herdade. Pastoreiam a pé, a cavalo e conhecem cada animal pelo nome.',
    since: '—',
    activity: 'Pastoreio — ronda dos cercados',
    statusLabel: 'No campo',
    statusClass: 'text-emerald-400/70',
  },
  {
    name: 'Dr. Miguel Ferreira Costa',
    role: 'Médico-Veterinário',
    description: 'Acompanha a saúde do efectivo, vacinas, partos e urgências sanitárias.',
    since: '1982',
    activity: 'Visita mensal programada',
    statusLabel: 'Disponível',
    statusClass: 'text-amber-400/70',
  },
];

// ── Staff card ────────────────────────────────────────────────────────────────

const StaffCard: React.FC<{ member: StaffMember }> = ({ member }) => (
  <PaperCard>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
          <p className="font-display text-sm text-ivory/80 tracking-wide">{member.name}</p>
          {member.since !== '—' && (
            <span className="text-ivory/20 text-[9px] font-body shrink-0">na herdade desde {member.since}</span>
          )}
        </div>
        <p className="text-gold/50 text-[10px] font-body uppercase tracking-widest mb-2">{member.role}</p>
        <p className="text-ivory/35 text-[11px] font-body leading-relaxed mb-2">{member.description}</p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-leather-500/50" />
          <p className="text-ivory/25 text-[10px] font-body italic">{member.activity}</p>
        </div>
      </div>
      <div className="shrink-0 pt-0.5">
        <span className={`text-[10px] font-body ${member.statusClass}`}>{member.statusLabel}</span>
      </div>
    </div>
  </PaperCard>
);

// ── Main tab ──────────────────────────────────────────────────────────────────

const AdministracaoTab: React.FC = () => (
  <div className="h-full flex flex-col overflow-y-auto">
    <SectionTitle>Equipa da Ganadaria</SectionTitle>

    <div className="space-y-3 mb-6">
      {STAFF.map(member => (
        <StaffCard key={member.role} member={member} />
      ))}
    </div>

    {/* Coming soon note */}
    <div className="mt-auto pt-4 border-t border-leather-700/30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-gold/20" />
        <p className="text-ivory/15 text-[9px] font-body uppercase tracking-[0.25em]">Em preparação</p>
        <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
      </div>
      <p className="text-ivory/18 text-xs font-body italic mt-2 leading-relaxed">
        A gestão de salários, contratação de novos campinos e formação de
        pessoal estarão disponíveis numa próxima actualização.
      </p>
    </div>
  </div>
);

export default AdministracaoTab;
