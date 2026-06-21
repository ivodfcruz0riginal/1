import React from 'react';
import { useGameState } from '../../store/gameState';
import { formatEuro } from '../../store/economyEngine';
import { SectionTitle, PaperCard, Pill } from './OfficePrimitives';
import type { DecisionRecord, ConsequenceEntry } from '../../store/gameTypes';

const CATEGORY_VARIANT: Record<string, 'gold' | 'amber' | 'sky' | 'green' | 'rose' | 'muted'> = {
  'Saúde Animal': 'rose',
  'Contrato': 'sky',
  'Gestão': 'amber',
  'Evento': 'gold',
  'Pessoal': 'green',
};

const MILESTONES = [
  { year: 1947, text: 'Fundação da Herdade da Ferraria por D. João Nobre da Costa.' },
  { year: 1952, text: 'Primeira corrida com animais da ganaderia na Praça de Lisboa.' },
  { year: 1960, text: 'Início da colaboração com a ganaderia espanhola Pablo Romero.' },
  { year: 1968, text: 'Introdução da casta Miura no efectivo. Primeiro cruzamento bem-sucedido.' },
  { year: 1971, text: 'Construção do actual tentadero. Inaugurado em Maio desse ano.' },
  { year: 1975, text: 'Maior temporada da história: 24 toiros lidados em Portugal e Espanha.' },
  { year: 1980, text: 'Nova geração de sementais adquiridos. Renovação do efectivo.' },
  { year: 1985, text: 'Nova geração de toiros promissores. Temporada com grandes expectativas.' },
];

const BLOODLINES = [
  { name: 'Miura', origin: 'Espanha', note: 'A mais brava das castas. Caracterizada pela força e imprevisibilidade.' },
  { name: 'Pablo Romero', origin: 'Espanha', note: 'Toiros nobles e de grande fôlego. Excelentes para praças grandes.' },
  { name: 'Concha y Sierra', origin: 'Espanha', note: 'Casta elegante, de boa transmissão e bravura equilibrada.' },
  { name: 'Cruzado', origin: 'Portugal', note: 'Linha nacional. Cabrestos e toiros de apoio ao efectivo.' },
];

const LivroTab: React.FC = () => {
  const { state } = useGameState();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SectionTitle>Livro da Casa — Herdade da Ferraria</SectionTitle>

      {/* Ranch info */}
      <PaperCard className="mb-4 shrink-0">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-ivory/30 text-[10px] font-body uppercase tracking-wider">Fundação</p>
            <p className="font-display text-base text-gold mt-1">1947</p>
          </div>
          <div>
            <p className="text-ivory/30 text-[10px] font-body uppercase tracking-wider">Área</p>
            <p className="font-display text-base text-ivory mt-1">1.250 ha</p>
          </div>
          <div>
            <p className="text-ivory/30 text-[10px] font-body uppercase tracking-wider">Efectivo</p>
            <p className="font-display text-base text-ivory mt-1">{state.animals.length} animais</p>
          </div>
        </div>
      </PaperCard>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {/* Bloodlines */}
        <div>
          <SectionTitle>Castas Presentes</SectionTitle>
          <div className="space-y-2">
            {BLOODLINES.map(b => (
              <PaperCard key={b.name}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <p className="font-display text-sm text-gold tracking-wide">{b.name}</p>
                    <p className="text-ivory/30 text-[10px] font-body">{b.origin}</p>
                  </div>
                  <div className="w-px self-stretch bg-leather-600/30 shrink-0" />
                  <p className="text-ivory/60 text-xs font-body leading-relaxed">{b.note}</p>
                </div>
              </PaperCard>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <SectionTitle>Marcos Históricos</SectionTitle>
          <div className="relative pl-5">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-gold/30 via-leather-600/30 to-transparent" />
            <div className="space-y-3">
              {MILESTONES.map(m => (
                <div key={m.year} className="relative">
                  <div className="absolute -left-5 top-1.5 w-2 h-2 rounded-full border border-gold/40 bg-leather-900" />
                  <p className="text-gold/60 font-display text-[10px] uppercase tracking-widest mb-0.5">{m.year}</p>
                  <p className="text-ivory/65 text-xs font-body leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important decisions with consequence chains */}
        {(() => {
          const important = state.decisionHistory.filter((r: DecisionRecord) => r.important);
          if (important.length === 0) return null;

          // Group consequences by decision instance
          const chainMap: Record<string, ConsequenceEntry[]> = {};
          for (const entry of (state.consequenceChain ?? [])) {
            const key = entry.originDecisionInstanceId;
            if (!chainMap[key]) chainMap[key] = [];
            chainMap[key].push(entry);
          }
          for (const key of Object.keys(chainMap)) {
            chainMap[key].sort((a, b) => a.year - b.year);
          }

          // Only show in Livro decisions with actual multi-step consequences
          const withChain = important.filter(r => (chainMap[r.instanceId]?.length ?? 0) > 1);
          const withoutChain = important.filter(r => (chainMap[r.instanceId]?.length ?? 0) <= 1);

          return (
            <div>
              <SectionTitle>Decisões Importantes</SectionTitle>
              <div className="space-y-3">
                {/* Decisions with consequence chains first */}
                {withChain.map((rec: DecisionRecord) => {
                  const chain = chainMap[rec.instanceId] ?? [];
                  const isResolved = chain.every(e => e.resolved);
                  return (
                    <PaperCard key={rec.instanceId}>
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-16">
                          <p className="text-gold/60 font-display text-[10px] uppercase tracking-widest leading-none">{rec.month.slice(0, 3)}</p>
                          <p className="text-ivory/30 text-[10px] font-body mt-0.5">{rec.year}</p>
                        </div>
                        <div className="w-px self-stretch bg-leather-600/30 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-display text-sm text-ivory/80 tracking-wide">{rec.title}</p>
                            <Pill label={rec.category} variant={CATEGORY_VARIANT[rec.category] ?? 'muted'} />
                            <span className={`text-[9px] font-body px-1.5 py-0.5 rounded border ${
                              isResolved
                                ? 'bg-emerald-900/25 border-emerald-600/25 text-emerald-400/70'
                                : 'bg-amber-900/25 border-amber-600/25 text-amber-400/70'
                            }`}>
                              {isResolved ? 'Resolvido' : 'Em curso'}
                            </span>
                          </div>
                          <p className="text-ivory/50 text-xs font-body italic leading-snug mb-3">"{rec.choice}"</p>

                          {/* Timeline chain */}
                          <div className="relative pl-4">
                            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gradient-to-b from-leather-500/40 to-transparent" />
                            <div className="space-y-2">
                              {/* Root decision as first node */}
                              <div className="relative flex items-start gap-2.5">
                                <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-gold/50 border border-gold/30 shrink-0" />
                                <div className="flex-1 rounded-md border border-gold/15 bg-gold/5 px-2.5 py-1.5">
                                  <p className="text-[9px] font-body text-gold/50 uppercase tracking-widest mb-0.5">{rec.month.slice(0, 3)} {rec.year} · Decisão</p>
                                  <p className="text-ivory/60 text-[11px] font-body leading-snug">{rec.result ?? rec.choice}</p>
                                </div>
                              </div>
                              {/* Consequence entries */}
                              {chain.map((entry) => {
                                const dot =
                                  entry.severity === 'critical' ? 'bg-red-500/70' :
                                  entry.severity === 'warning' ? 'bg-amber-500/60' : 'bg-sky-500/50';
                                const border =
                                  entry.severity === 'critical' ? 'border-red-500/25 bg-red-900/10' :
                                  entry.severity === 'warning' ? 'border-amber-500/20 bg-amber-900/10' : 'border-sky-500/15 bg-leather-800/20';
                                const textColor =
                                  entry.severity === 'critical' ? 'text-red-300/80' :
                                  entry.severity === 'warning' ? 'text-amber-300/80' : 'text-ivory/60';
                                return (
                                  <div key={entry.id} className="relative flex items-start gap-2.5">
                                    <div className={`absolute -left-4 top-1.5 w-2 h-2 rounded-full border border-leather-600/30 ${dot} shrink-0`} />
                                    <div className={`flex-1 rounded-md border px-2.5 py-1.5 ${border}`}>
                                      <p className="text-[9px] font-body text-gold/40 uppercase tracking-widest mb-0.5">
                                        {entry.month.slice(0, 3)} {entry.year}
                                        {entry.resolved && ' · ✓'}
                                      </p>
                                      <p className={`text-[11px] font-body leading-snug ${textColor}`}>{entry.text}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </PaperCard>
                  );
                })}
                {/* Decisions without multi-step chains */}
                {withoutChain.map((rec: DecisionRecord) => (
                  <PaperCard key={rec.instanceId}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-16">
                        <p className="text-gold/60 font-display text-[10px] uppercase tracking-widest leading-none">{rec.month.slice(0, 3)}</p>
                        <p className="text-ivory/30 text-[10px] font-body mt-0.5">{rec.year}</p>
                      </div>
                      <div className="w-px self-stretch bg-leather-600/30 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-display text-sm text-ivory/80 tracking-wide">{rec.title}</p>
                          <Pill label={rec.category} variant={CATEGORY_VARIANT[rec.category] ?? 'muted'} />
                        </div>
                        <p className="text-ivory/50 text-xs font-body italic leading-snug">"{rec.choice}"</p>
                        {rec.result && (
                          <p className="text-ivory/35 text-[11px] font-body mt-1 leading-snug">{rec.result}</p>
                        )}
                      </div>
                    </div>
                  </PaperCard>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Accepted contracts */}
        {(() => {
          const accepted = (state.contracts ?? []).filter(c => c.status === 'Aceite' || c.status === 'Concluído');
          if (accepted.length === 0) return null;
          return (
            <div>
              <SectionTitle>Contratos da Casa</SectionTitle>
              <div className="relative pl-5">
                <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-sky-500/30 via-leather-600/30 to-transparent" />
                <div className="space-y-3">
                  {accepted.map(c => (
                    <div key={c.instanceId} className="relative">
                      <div className="absolute -left-5 top-1.5 w-2 h-2 rounded-full border border-sky-400/40 bg-leather-900" />
                      <p className="text-sky-400/60 font-display text-[10px] uppercase tracking-widest mb-0.5">
                        {c.offeredMonth} {c.offeredYear}
                      </p>
                      <p className="text-ivory/65 text-xs font-body leading-relaxed">
                        {c.isFirstContract ? 'Primeiro contrato da nova administração. ' : ''}
                        Contrato com a {c.placeName} para {c.performanceMonth} {c.performanceYear}. {formatEuro(c.negotiatedPayment)}.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default LivroTab;
