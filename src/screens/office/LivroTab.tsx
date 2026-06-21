import React from 'react';
import { useGameState } from '../../store/gameState';
import { SectionTitle, PaperCard, Pill } from './OfficePrimitives';
import type { DecisionRecord } from '../../store/gameTypes';

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

        {/* Important decisions */}
        {(() => {
          const important = state.decisionHistory.filter((r: DecisionRecord) => r.important);
          if (important.length === 0) return null;
          return (
            <div>
              <SectionTitle>Decisões Importantes</SectionTitle>
              <div className="space-y-2">
                {important.map((rec: DecisionRecord) => (
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
      </div>
    </div>
  );
};

export default LivroTab;
