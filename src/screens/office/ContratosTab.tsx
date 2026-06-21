import React from 'react';
import { SectionTitle } from './OfficePrimitives';

// ── Empty desk visualization ──────────────────────────────────────────────────

const MesaVazia: React.FC = () => (
  <div className="text-center">
    {/* Desk scene */}
    <div className="relative mx-auto w-48 h-36 mb-7">
      {/* Desk surface */}
      <div className="absolute inset-0 rounded bg-gradient-to-b from-amber-950/25 to-amber-950/15 border border-leather-600/20" />

      {/* Paper stack — centre */}
      <div className="absolute left-6 top-4 w-24 h-28">
        {/* Back sheets */}
        <div className="absolute inset-0 bg-amber-50/5 border border-amber-700/12 rounded-sm rotate-[3deg]" />
        <div className="absolute inset-0 bg-amber-50/5 border border-amber-700/12 rounded-sm -rotate-[1deg]" />
        {/* Front sheet */}
        <div className="absolute inset-0 bg-amber-50/8 border border-amber-700/20 rounded-sm">
          <div className="m-3 space-y-1.5">
            <div className="h-px bg-amber-700/15 w-full" />
            <div className="h-px bg-amber-700/12 w-4/5" />
            <div className="h-px bg-amber-700/10 w-full" />
            <div className="h-px bg-amber-700/12 w-3/4" />
            <div className="h-px bg-amber-700/10 w-full" />
          </div>
          <p className="text-amber-700/18 text-[7px] font-body text-center mt-3 tracking-[0.3em] uppercase">Contrato</p>
          {/* Signature line */}
          <div className="absolute bottom-4 inset-x-3 h-px bg-amber-700/20" />
          <p className="absolute bottom-2 left-3 text-amber-700/12 text-[6px] font-body italic">Assinatura</p>
        </div>
      </div>

      {/* Quill pen */}
      <div className="absolute right-5 top-1 opacity-20">
        <div className="relative w-4 h-28">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-20 bg-amber-600/80 rounded-full" />
          <div className="absolute top-0 left-0 w-4 h-10 bg-gradient-to-b from-amber-200/60 to-amber-600/40 rounded-t-full" style={{ clipPath: 'polygon(50% 0%, 0% 60%, 50% 100%, 100% 60%)' }} />
        </div>
      </div>

      {/* Wax seal */}
      <div className="absolute bottom-4 right-6 w-9 h-9 rounded-full bg-red-900/20 border border-red-700/20 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border border-red-600/20 flex items-center justify-center">
          <span className="text-red-700/25 text-[8px] font-display tracking-tighter">HF</span>
        </div>
      </div>

      {/* Ink well */}
      <div className="absolute top-3 right-3 w-5 h-6 opacity-20">
        <div className="w-full h-4 bg-leather-600/60 border border-leather-500/40 rounded-sm mt-2" />
        <div className="w-3 h-3 bg-leather-700/60 border border-leather-500/30 rounded-full mx-auto -mt-1" />
      </div>
    </div>

    <p className="font-display text-sm text-ivory/30 tracking-wider uppercase mb-3">Mesa sem acordos</p>
    <p className="text-ivory/20 text-xs font-body leading-relaxed max-w-xs">
      As praças aguardam proposta. Os acordos com arenas, empresas de espectáculos
      e ganadeiros parceiros serão lavrados e arquivados nesta secretária.
    </p>
    <div className="flex items-center justify-center gap-3 mt-4">
      <div className="w-8 h-px bg-gradient-to-r from-transparent to-gold/20" />
      <p className="text-ivory/15 text-[9px] font-body uppercase tracking-[0.25em]">Em preparação</p>
      <div className="w-8 h-px bg-gradient-to-l from-transparent to-gold/20" />
    </div>
  </div>
);

// ── Main tab ──────────────────────────────────────────────────────────────────

const ContratosTab: React.FC = () => (
  <div className="h-full flex flex-col overflow-hidden">
    <SectionTitle>Acordos e Contratos</SectionTitle>
    <div className="flex-1 flex items-center justify-center">
      <MesaVazia />
    </div>
  </div>
);

export default ContratosTab;
