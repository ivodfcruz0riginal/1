import React, { useMemo } from 'react';
import { useGameState } from '../../store/gameState';
import { SectionTitle, PaperCard } from './OfficePrimitives';
import type { GameState } from '../../store/gameTypes';

// ── Item types ────────────────────────────────────────────────────────────────

interface BoardItem {
  id: string;
  text: string;
  icon: string;
}

// ── Derive board items from state ─────────────────────────────────────────────

function derivePriorities(s: GameState): BoardItem[] {
  const items: BoardItem[] = [];

  // Fence problem pending
  if (s.pendingFenceConsequence) {
    items.push({ id: 'p-fence', icon: '🪵', text: 'Reparar a vedação do Cercado Norte.' });
  }

  // Animals with poor health
  const sickCount = s.animals.filter(a => a.health === 'Fraco' || a.health === 'Doente').length;
  if (sickCount > 0) {
    items.push({ id: 'p-health', icon: '🩺', text: `Inspeccionar ${sickCount} animal${sickCount > 1 ? 'is' : ''} com saúde degradada.` });
  }

  // Upcoming contract
  const nextContract = s.contracts.find(c => c.status === 'Aceite');
  if (nextContract) {
    items.push({ id: 'p-contract', icon: '📜', text: `Preparar toiros para a ${nextContract.placeName} — ${nextContract.performanceMonth}.` });
  }

  // Low treasury (less than 2 months of expenses ~17k)
  if (s.economy.treasury < 17000) {
    items.push({ id: 'p-treasury', icon: '💰', text: 'Rever despesas: tesouraria abaixo do mínimo recomendado.' });
  }

  // Young bulls ready for tentadero (male, 2–3 years, not yet fought)
  const readyBulls = s.animals.filter(
    a => a.sex === 'Macho' && a.ageYears >= 2 && a.ageYears <= 3 && !a.hasFought && a.status === 'Ativo',
  );
  if (readyBulls.length > 0) {
    items.push({ id: 'p-tentadero', icon: '🐂', text: `Avaliar ${readyBulls.length} novilho${readyBulls.length > 1 ? 's' : ''} prontos para o tentadero.` });
  }

  // Pasture needs attention
  const poorPasture = s.locations.find(
    l => l.type === 'Pasture' && (l.condition === 'Poor' || l.condition === 'Damaged'),
  );
  if (poorPasture) {
    items.push({ id: 'p-pasture', icon: '🌿', text: `Melhorar condição das pastagens: ${poorPasture.name}.` });
  }

  // Breeding season (Outono = best time for covering)
  if (s.season === 'Outono' && s.animals.some(a => a.category === 'Semental' && a.status === 'Ativo')) {
    items.push({ id: 'p-breeding', icon: '🔁', text: 'Época de cobrição — planear cruzamentos do efectivo.' });
  }

  return items.slice(0, 4);
}

function deriveWarnings(s: GameState): BoardItem[] {
  const items: BoardItem[] = [];

  // Drought / water stress
  if (s.weather.type === 'drought') {
    items.push({ id: 'w-drought', icon: '☀️', text: 'Seca prolongada — reservas de água e feno em risco.' });
  }

  // Low water level
  const barragem = s.locations.find(l => l.id === 'barragem');
  if (barragem && (barragem.waterLevel ?? 100) < 30) {
    items.push({ id: 'w-water', icon: '💧', text: `Nível da barragem baixo (${barragem.waterLevel ?? '?'}%). Monitorizar consumo.` });
  }

  // High staff fatigue
  const fatiguedStaff = s.staff.filter(m => (m.fatigue ?? 0) > 70).length;
  if (fatiguedStaff > 0) {
    items.push({ id: 'w-fatigue', icon: '😓', text: `${fatiguedStaff} trabalhador${fatiguedStaff > 1 ? 'es' : ''} com fadiga elevada.` });
  }

  // Animal losing weight (bodyCondition < 40)
  const thinAnimals = s.animals.filter(a => (a.bodyCondition ?? 100) < 40 && a.status === 'Ativo').length;
  if (thinAnimals > 0) {
    items.push({ id: 'w-weight', icon: '⚖️', text: `${thinAnimals} animal${thinAnimals > 1 ? 'is' : ''} com condição corporal abaixo do normal.` });
  }

  // Poor fence condition in any pasture
  const brokenFence = s.locations.find(
    l => (l.fenceCondition ?? 100) < 30 && l.type === 'Pasture',
  );
  if (brokenFence) {
    items.push({ id: 'w-fence', icon: '⚠️', text: `Vedação em mau estado: ${brokenFence.name}.` });
  }

  // Low prestige
  if (s.prestige < 20) {
    items.push({ id: 'w-prestige', icon: '📉', text: 'Prestígio da ganaderia abaixo do esperado. Rever qualidade.' });
  }

  // Treasury deficit risk
  if (s.economy.treasury < 5000) {
    items.push({ id: 'w-deficit', icon: '🚨', text: 'Tesouraria crítica — risco de não cobrir as despesas mensais.' });
  }

  return items.slice(0, 4);
}

function deriveOpportunities(s: GameState): BoardItem[] {
  const items: BoardItem[] = [];

  // Excellent pasture quality
  const excellentPasture = s.locations.find(
    l => l.type === 'Pasture' && l.condition === 'Excellent',
  );
  if (excellentPasture) {
    items.push({ id: 'o-pasture', icon: '🌱', text: `Pastagens excelentes em ${excellentPasture.name} — bom momento para engorda.` });
  }

  // Bull with high bravery, ready for contract
  const starBull = s.animals
    .filter(a => a.sex === 'Macho' && a.bravery >= 80 && a.status === 'Ativo' && a.category === 'Macho de Corrida')
    .sort((a, b) => b.bravery - a.bravery)[0];
  if (starBull) {
    items.push({ id: 'o-bull', icon: '🏅', text: `${starBull.name} (bravura ${starBull.bravery}) pronto para praça de primeira categoria.` });
  }

  // Breeding candidate female
  const breedingFemale = s.animals.find(
    a => a.sex === 'Fêmea' && a.fertility >= 75 && a.approvedForBreeding && a.status === 'Ativo',
  );
  if (breedingFemale) {
    items.push({ id: 'o-breeding', icon: '🐄', text: `${breedingFemale.name} é candidata de excelência para reprodução.` });
  }

  // High prestige → better contracts available
  if (s.prestige >= 70) {
    items.push({ id: 'o-prestige', icon: '⭐', text: 'Prestígio elevado — praças de maior renome poderão contactar a ganaderia.' });
  }

  // Spring rain = pasture growth opportunity
  if (s.season === 'Primavera' && s.weather.type === 'rain') {
    items.push({ id: 'o-spring', icon: '🌧️', text: 'Chuvas de Primavera favoráveis ao crescimento das pastagens.' });
  }

  // No contract yet — opportunity to seek one
  if (s.contracts.filter(c => c.status === 'Aceite').length === 0 && s.simulatedMonths >= 1) {
    items.push({ id: 'o-contract', icon: '📋', text: 'Nenhum contrato activo — boa altura para abordar praças para a próxima temporada.' });
  }

  return items.slice(0, 4);
}

function maioralRecommendation(s: GameState): string {
  if (s.pendingFenceConsequence) {
    return 'Patrão, se tivesse de escolher apenas uma tarefa este mês, tratava da vedação. Um toiro solto na estrada é um problema que não tem preço.';
  }
  const sickCount = s.animals.filter(a => a.health === 'Fraco' || a.health === 'Doente').length;
  if (sickCount > 0) {
    return `Patrão, há ${sickCount} animal${sickCount > 1 ? 'is' : ''} que não estão bem. Chamava o veterinário antes que passe para os outros.`;
  }
  if (s.economy.treasury < 5000) {
    return 'Patrão, a caixa está muito fraca. Devia rever as despesas antes de comprometer mais dinheiro.';
  }
  const nextContract = s.contracts.find(c => c.status === 'Aceite');
  if (nextContract) {
    return `Patrão, a corrida na ${nextContract.placeName} está a chegar. Devia começar a separar os toiros ainda este mês.`;
  }
  if (s.weather.type === 'drought') {
    return 'Patrão, a seca preocupa-me. Os animais estão a beber mais do que o habitual e as pastagens estão a secar.';
  }
  if (s.season === 'Outono') {
    return 'Patrão, é a época das cobrições. Vale a pena planear os cruzamentos com cuidado — é nisto que se faz o futuro da ganaderia.';
  }
  return 'Patrão, este mês está relativamente calmo. Aproveite para inspeccionar os cercados e falar com os campinos.';
}

// ── Sub-components ────────────────────────────────────────────────────────────

const ItemRow: React.FC<{
  item: BoardItem;
  isPinned: boolean;
  canPin: boolean;
  onPin: () => void;
}> = ({ item, isPinned, canPin, onPin }) => (
  <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
    isPinned
      ? 'bg-gold/8 border-gold/35'
      : 'bg-leather-800/25 border-leather-700/25 hover:border-leather-600/40'
  }`}>
    <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
    <p className="flex-1 text-xs font-body leading-relaxed text-ivory/75">{item.text}</p>
    {canPin && (
      <button
        onClick={onPin}
        title={isPinned ? 'Desafixar objectivo' : 'Fixar como objectivo do mês'}
        className={`shrink-0 w-6 h-6 rounded flex items-center justify-center border transition-all duration-150 ${
          isPinned
            ? 'bg-gold/20 border-gold/50 text-gold'
            : 'bg-leather-800/40 border-leather-600/30 text-ivory/30 hover:text-gold/60 hover:border-gold/30'
        }`}
      >
        <span className="text-[11px]">{isPinned ? '★' : '☆'}</span>
      </button>
    )}
  </div>
);

// ── Main tab ──────────────────────────────────────────────────────────────────

const PlaneamentoTab: React.FC = () => {
  const { state, pinObjective } = useGameState();

  const priorities    = useMemo(() => derivePriorities(state),    [state]);
  const warnings      = useMemo(() => deriveWarnings(state),      [state]);
  const opportunities = useMemo(() => deriveOpportunities(state), [state]);
  const recommendation = useMemo(() => maioralRecommendation(state), [state]);

  const handlePin = (text: string) => {
    pinObjective(state.pinnedObjective === text ? null : text);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SectionTitle>Planeamento — {state.month} {state.year}</SectionTitle>

      <div className="flex-1 overflow-y-auto pr-1 space-y-5">

        {/* Maioral recommendation */}
        <PaperCard className="border-gold/20">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-leather-700/60 border border-gold/25 flex items-center justify-center">
              <span className="text-sm">🤠</span>
            </div>
            <div className="flex-1">
              <p className="text-ivory/30 text-[9px] font-body uppercase tracking-widest mb-1">Maioral · Recomendação do mês</p>
              <p className="text-ivory/70 text-xs font-body italic leading-relaxed">"{recommendation}"</p>
            </div>
          </div>
        </PaperCard>

        {/* Priorities */}
        <div>
          <SectionTitle>Prioridades</SectionTitle>
          {priorities.length === 0 ? (
            <p className="text-ivory/25 text-xs font-body italic px-1">Nenhuma prioridade identificada este mês.</p>
          ) : (
            <div className="space-y-2">
              {priorities.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  isPinned={state.pinnedObjective === item.text}
                  canPin
                  onPin={() => handlePin(item.text)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Warnings */}
        <div>
          <SectionTitle>Avisos</SectionTitle>
          {warnings.length === 0 ? (
            <p className="text-ivory/25 text-xs font-body italic px-1">Sem avisos activos.</p>
          ) : (
            <div className="space-y-2">
              {warnings.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-amber-900/10 border-amber-600/20"
                >
                  <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                  <p className="flex-1 text-xs font-body leading-relaxed text-amber-300/80">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opportunities */}
        <div>
          <SectionTitle>Oportunidades</SectionTitle>
          {opportunities.length === 0 ? (
            <p className="text-ivory/25 text-xs font-body italic px-1">Nenhuma oportunidade identificada.</p>
          ) : (
            <div className="space-y-2">
              {opportunities.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-emerald-900/10 border-emerald-600/20"
                >
                  <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                  <p className="flex-1 text-xs font-body leading-relaxed text-emerald-300/80">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pinned objective reminder */}
        {state.pinnedObjective && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gold/20 bg-gold/5">
            <span className="text-gold text-sm">★</span>
            <p className="text-ivory/50 text-[11px] font-body flex-1">
              Objectivo fixado — também visível na Herdade.
            </p>
            <button
              onClick={() => pinObjective(null)}
              className="text-ivory/25 hover:text-ivory/55 text-[10px] font-body transition-colors"
            >
              remover
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaneamentoTab;
