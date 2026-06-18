import React, { useMemo, useState } from 'react';
import { useGameState } from '../store/gameState';
import { useGoals, selectGoalsByTimeframe } from '../store/goalStore';
import {
  TIMEFRAME_LABELS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  REWARD_ICONS,
  DIFFICULTY_STARS,
  DIFFICULTY_COLOR,
  monthsPlayed,
} from '../services/goalService';
import type { Goal, GoalTimeframe } from '../types/goal';

// ── Goal card ─────────────────────────────────────────────────────────────────

const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
  const stars = DIFFICULTY_STARS[goal.difficulty];

  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-300 ${
        goal.completed
          ? 'opacity-80'
          : 'hover:border-gold/30'
      }`}
      style={{
        background: goal.completed
          ? 'linear-gradient(160deg, rgba(201,162,39,0.08) 0%, rgba(26,17,8,0.95) 100%)'
          : 'rgba(26,17,8,0.85)',
        border: `1px solid ${goal.completed ? 'rgba(201,162,39,0.35)' : 'rgba(90,60,30,0.35)'}`,
      }}
    >
      {/* Progress bar — top edge */}
      <div className="h-0.5 w-full bg-leather-700/30">
        <div
          className={`h-full transition-all duration-700 ${
            goal.completed
              ? 'bg-gold/70'
              : goal.progress > 66
              ? 'bg-amber-500/60'
              : goal.progress > 33
              ? 'bg-amber-600/50'
              : 'bg-leather-500/40'
          }`}
          style={{ width: `${goal.progress}%` }}
        />
      </div>

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base leading-none shrink-0">{CATEGORY_ICONS[goal.category]}</span>
            <p className={`font-display text-sm tracking-wide leading-snug ${goal.completed ? 'text-gold' : 'text-ivory/85'}`}>
              {goal.title}
            </p>
          </div>
          {goal.completed && (
            <span className="text-gold text-base shrink-0 leading-none">✓</span>
          )}
        </div>

        {/* Description */}
        <p className="text-ivory/40 text-[11px] font-body leading-relaxed mb-3">
          {goal.description}
        </p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-ivory/30 text-[9px] font-body uppercase tracking-wider">Progresso</span>
            <span className={`text-[10px] font-body tabular-nums ${goal.completed ? 'text-gold' : 'text-ivory/50'}`}>
              {goal.progress}%
            </span>
          </div>
          <div className="h-1 bg-leather-700/40 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                goal.completed ? 'bg-gold/60' :
                goal.progress > 66 ? 'bg-amber-500/70' :
                goal.progress > 33 ? 'bg-amber-700/60' :
                'bg-leather-500/50'
              }`}
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {/* Footer: difficulty + reward */}
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={`text-[10px] ${i < stars ? DIFFICULTY_COLOR[goal.difficulty] : 'text-leather-600/30'}`}
              >
                ★
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px]">{REWARD_ICONS[goal.reward.type]}</span>
            <span className="text-ivory/25 text-[9px] font-body truncate max-w-[120px]">
              {goal.reward.description}
            </span>
          </div>
        </div>

        {/* Completed date */}
        {goal.completed && goal.completedDate && (
          <p className="text-gold/40 text-[9px] font-body mt-2 pt-2 border-t border-gold/15">
            Concluído em {goal.completedDate.month} {goal.completedDate.year}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Timeline event ────────────────────────────────────────────────────────────

const TimelineEvent: React.FC<{ text: string; month: string; year: number; isLast: boolean }> = ({
  text, month, year, isLast,
}) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-gold/50 border border-gold/30 mt-1" />
      {!isLast && <div className="w-px flex-1 bg-gold/10 mt-1" />}
    </div>
    <div className="pb-4 min-w-0">
      <p className="text-ivory/20 text-[9px] font-body uppercase tracking-wider mb-0.5">
        {month} {year}
      </p>
      <p className="text-ivory/55 text-xs font-body leading-relaxed">{text}</p>
    </div>
  </div>
);

// ── Legacy stat card ──────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string; sub?: string; icon: string }> = ({
  label, value, sub, icon,
}) => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-lg"
    style={{ background: 'rgba(26,17,8,0.7)', border: '1px solid rgba(90,60,30,0.35)' }}
  >
    <span className="text-2xl shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-ivory/35 text-[9px] font-body uppercase tracking-wider">{label}</p>
      <p className="text-ivory/85 text-sm font-display tracking-wide truncate">{value}</p>
      {sub && <p className="text-ivory/30 text-[10px] font-body">{sub}</p>}
    </div>
  </div>
);

// ── LegacyScreen ──────────────────────────────────────────────────────────────

const TABS: GoalTimeframe[] = ['ShortTerm', 'MediumTerm', 'LongTerm'];

const LegacyScreen: React.FC = () => {
  const { state: gameState } = useGameState();
  const { state: goalState } = useGoals();
  const [activeTab, setActiveTab] = useState<GoalTimeframe>('ShortTerm');

  const tabGoals = selectGoalsByTimeframe(goalState, activeTab);

  const yearsManaged = gameState.year - 1985;
  const totalMonths = monthsPlayed(gameState);

  const completedCount = goalState.goals.filter(g => g.completed).length;
  const totalCount = goalState.goals.length;

  // Best animal stats
  const { bestBull, bestCow, bestBloodline } = useMemo(() => {
    const activeAnimals = gameState.animals.filter(a => a.status === 'Ativo');
    const bulls = activeAnimals.filter(a => a.sex === 'Macho');
    const cows = activeAnimals.filter(a => a.sex === 'Fêmea');

    const score = (a: typeof bulls[0]) => a.bravery + a.nobility + a.stamina;
    const cowScore = (a: typeof cows[0]) => a.transmission + a.fertility + a.nobility;

    const bestBull = bulls.sort((a, b) => score(b) - score(a))[0] ?? null;
    const bestCow = cows.sort((a, b) => cowScore(b) - cowScore(a))[0] ?? null;

    const lineageMap: Record<string, number> = {};
    activeAnimals.forEach(a => {
      if (a.bloodline) lineageMap[a.bloodline] = (lineageMap[a.bloodline] ?? 0) + 1;
    });
    const bestBloodline = Object.entries(lineageMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

    return { bestBull, bestCow, bestBloodline };
  }, [gameState.animals]);

  const recentEvents = gameState.eventLog.slice(0, 8);

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #0f0905 0%, #130d06 100%)' }}
    >
      {/* Page header */}
      <div
        className="px-8 py-6 sticky top-0 z-10"
        style={{
          background: 'linear-gradient(90deg, #1a1108 0%, #1f1409 50%, #1a1108 100%)',
          borderBottom: '1px solid rgba(201,162,39,0.2)',
        }}
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-ivory/30 text-[10px] font-body uppercase tracking-[0.3em] mb-1">
              Herdade da Ferraria
            </p>
            <h1 className="font-display text-2xl text-gold tracking-widest uppercase">Legado</h1>
          </div>
          <div className="text-right">
            <p className="text-ivory/35 text-[10px] font-body uppercase tracking-wider">
              1ª Geração · {gameState.year}
            </p>
            <p className="text-ivory/20 text-[9px] font-body mt-0.5">
              {yearsManaged > 0 ? `${yearsManaged} ano${yearsManaged !== 1 ? 's' : ''} geridos` : 'Primeiro ano'}
              {totalMonths > 0 ? ` · ${totalMonths} mes${totalMonths !== 1 ? 'es' : ''}` : ''}
            </p>
          </div>
        </div>

        {/* Overall progress */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-1 bg-leather-700/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold/50 rounded-full transition-all duration-700"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount * 100) : 0}%` }}
            />
          </div>
          <span className="text-ivory/35 text-[10px] font-body whitespace-nowrap">
            {completedCount}/{totalCount} objectivos
          </span>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Legacy stats grid */}
        <section>
          <p className="text-ivory/25 text-[10px] font-body uppercase tracking-[0.2em] mb-3">
            Estatísticas da Herdade
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Geração" value="1ª Geração" sub="Fundada em 1947" icon="🏛️" />
            <StatCard
              label="Prestígio"
              value="250 pts"
              sub="Em crescimento"
              icon="👑"
            />
            <StatCard
              label="Melhor Touro"
              value={bestBull?.name ?? '—'}
              sub={bestBull ? `${bestBull.bloodline} · ${bestBull.bravery + bestBull.nobility + bestBull.stamina} pts` : undefined}
              icon="🐂"
            />
            <StatCard
              label="Melhor Vaca"
              value={bestCow?.name ?? '—'}
              sub={bestCow ? `${bestCow.bloodline} · ${bestCow.transmission + bestCow.fertility} pts` : undefined}
              icon="🐄"
            />
            <StatCard
              label="Melhor Linhagem"
              value={bestBloodline}
              icon="🧬"
            />
          </div>
        </section>

        {/* Goals section */}
        <section>
          <p className="text-ivory/25 text-[10px] font-body uppercase tracking-[0.2em] mb-3">
            Objectivos
          </p>

          {/* Timeframe tabs */}
          <div
            className="flex mb-5 rounded-lg overflow-hidden"
            style={{ border: '1px solid rgba(90,60,30,0.35)' }}
          >
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-[10px] font-body uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gold/15 text-gold border-b border-gold/40'
                    : 'text-ivory/30 hover:text-ivory/50 hover:bg-leather-800/30'
                }`}
              >
                {TIMEFRAME_LABELS[tab]}
                <span className="ml-2 text-[8px] opacity-60">
                  ({selectGoalsByTimeframe(goalState, tab).filter(g => g.completed).length}/
                  {selectGoalsByTimeframe(goalState, tab).length})
                </span>
              </button>
            ))}
          </div>

          {/* Goal cards grid */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tabGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>

        {/* Historic timeline */}
        {recentEvents.length > 0 && (
          <section>
            <p className="text-ivory/25 text-[10px] font-body uppercase tracking-[0.2em] mb-3">
              Cronologia Recente
            </p>
            <div
              className="rounded-lg p-5"
              style={{ background: 'rgba(26,17,8,0.6)', border: '1px solid rgba(90,60,30,0.25)' }}
            >
              {recentEvents.map((ev, i) => (
                <TimelineEvent
                  key={ev.id}
                  text={ev.text}
                  month={ev.month}
                  year={ev.year}
                  isLast={i === recentEvents.length - 1}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default LegacyScreen;
