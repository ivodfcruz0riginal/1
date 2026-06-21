import React from 'react';
import type { Animal } from '../types/animal';

// ── Timeline event types ──────────────────────────────────────────────────────

type EventType = 'birth' | 'pasture' | 'health' | 'corrida' | 'tienta' | 'breeding' | 'future';

interface TimelineEvent {
  date: string;
  type: EventType;
  title: string;
  description: string;
  isFuture?: boolean;
}

// ── Type config ───────────────────────────────────────────────────────────────

const EVENT_STYLES: Record<EventType, { dot: string; badge: string }> = {
  birth:    { dot: 'bg-gold',          badge: 'border-gold/30 text-gold/80' },
  pasture:  { dot: 'bg-emerald-500',   badge: 'border-emerald-500/30 text-emerald-400' },
  health:   { dot: 'bg-amber-500',     badge: 'border-amber-500/30 text-amber-400' },
  corrida:  { dot: 'bg-red-600',       badge: 'border-red-500/30 text-red-400' },
  tienta:   { dot: 'bg-sky-500',       badge: 'border-sky-500/30 text-sky-400' },
  breeding: { dot: 'bg-rose-500',      badge: 'border-rose-500/30 text-rose-400' },
  future:   { dot: 'bg-leather-600',   badge: 'border-leather-500/30 text-ivory/35' },
};

// ── Seeded deterministic random (0-100) ───────────────────────────────────────

function seeded(id: string, slot: number): number {
  let h = 0xdeadbeef;
  const s = `${id}:${slot}`;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x9e3779b9);
    h ^= h >>> 16;
  }
  return (h >>> 0) % 101;
}

// ── Timeline generation ───────────────────────────────────────────────────────

const PASTURES = ['Cercado Norte', 'Cercado Sul', 'Pastagem das Azinheiras', 'Dehesa Principal'];

function generateTimeline(animal: Animal): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const s = (slot: number) => seeded(animal.id, slot + 40);

  // 1. Birth
  events.push({
    date: `${animal.birthMonth} ${animal.birthYear}`,
    type: 'birth',
    title: 'Nascimento',
    description: `Nasceu no ${PASTURES[s(1) % 2]} da Herdade da Ferraria.`,
  });

  // 2. Weaning / desmame (~8-12 months after birth)
  const weaningYear = animal.birthMonth === 'Setembro' || animal.birthMonth === 'Outubro'
    || animal.birthMonth === 'Novembro' || animal.birthMonth === 'Dezembro'
    ? animal.birthYear + 1
    : animal.birthYear;
  events.push({
    date: `${weaningYear}`,
    type: 'pasture',
    title: 'Desmame',
    description: `Transferido para o ${PASTURES[s(2) % 2]} com os animais jovens.`,
  });

  // 3. Pasture change at ~2 years
  if (animal.ageYears >= 2) {
    events.push({
      date: `${animal.birthYear + 2}`,
      type: 'pasture',
      title: 'Transferência de Pastagem',
      description: `Integrado no ${PASTURES[s(3) % 4]} com o efectivo principal.`,
    });
  }

  // 4. Tienta (for females) at ~2-3 years
  if (animal.sex === 'Fêmea' && animal.ageYears >= 2) {
    const tientaYear = animal.birthYear + 2 + (s(4) > 60 ? 1 : 0);
    if (tientaYear <= 1985) {
      events.push({
        date: `${tientaYear}`,
        type: 'tienta',
        title: 'Tienta',
        description: animal.approvedForBreeding
          ? 'Aprovada na prova de selecção. Integrada no programa reprodutivo.'
          : animal.rejected
            ? 'Reprovada na tienta. Proposta de venda em análise.'
            : 'Prova de selecção realizada. Resultado em avaliação.',
      });
    }
  }

  // 5. Health events
  if (animal.status === 'Lesionado') {
    events.push({
      date: '1985',
      type: 'health',
      title: 'Lesão Registada',
      description: animal.notes && animal.notes.trim()
        ? animal.notes
        : 'Em recuperação sob supervisão veterinária.',
    });
  }

  // 6. Corrida (hasFought)
  if (animal.hasFought) {
    events.push({
      date: '1985',
      type: 'corrida',
      title: 'Lidado em Corrida',
      description: animal.notes && animal.notes.trim()
        ? animal.notes
        : 'Toiro lidado em corrida. Cumpriu com distinção.',
    });
  }

  // 7. Future events
  if (animal.status === 'Ativo') {
    if (animal.sex === 'Fêmea' && !animal.approvedForBreeding && !animal.rejected && animal.ageYears >= 2) {
      events.push({
        date: 'Temporada 1986',
        type: 'tienta',
        title: 'Tienta Agendada',
        description: 'Prova de selecção prevista para a próxima temporada.',
        isFuture: true,
      });
    }
    if (animal.category === 'Macho de Corrida' && !animal.hasFought) {
      events.push({
        date: 'Temporada 1985–1986',
        type: 'corrida',
        title: 'Corrida Programada',
        description: 'Inserido no programa de corridas da ganaderia.',
        isFuture: true,
      });
    }
    if (animal.approvedForBreeding) {
      events.push({
        date: 'Temporada 1986',
        type: 'breeding',
        title: 'Reprodução',
        description: 'Aprovado para o programa reprodutivo da herdade.',
        isFuture: true,
      });
    }
  }

  return events;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { animal: Animal }

const AnimalTimeline: React.FC<Props> = ({ animal }) => {
  const events = generateTimeline(animal);

  return (
    <div>
      <p className="text-[10px] font-body uppercase tracking-[0.2em] text-gold/55 mb-4 pb-1.5 border-b border-leather-700/30">
        Linha do Tempo
      </p>

      <div className="relative">
        {/* Vertical connector */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/30 via-leather-600/30 to-transparent" />

        <div className="space-y-4">
          {events.map((ev, i) => {
            const style = EVENT_STYLES[ev.type];
            return (
              <div key={i} className="flex gap-4">
                {/* Dot */}
                <div className="shrink-0 relative z-10 mt-0.5">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-leather-900 ${style.dot} ${ev.isFuture ? 'opacity-40' : ''}`} />
                </div>

                {/* Content */}
                <div className={`flex-1 pb-1 ${ev.isFuture ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-3 mb-0.5">
                    <p className="text-ivory/80 text-sm font-display tracking-wide leading-snug">
                      {ev.title}
                    </p>
                    <span className={`text-[9px] font-body border rounded-full px-2 py-0.5 shrink-0 uppercase tracking-wider ${style.badge}`}>
                      {ev.date}
                    </span>
                  </div>
                  <p className="text-ivory/40 text-xs font-body leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnimalTimeline;
