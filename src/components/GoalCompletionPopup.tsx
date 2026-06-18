import React from 'react';
import { useGoals } from '../store/goalStore';
import { REWARD_ICONS, DIFFICULTY_STARS, DIFFICULTY_COLOR, CATEGORY_ICONS } from '../services/goalService';

const GoalCompletionPopup: React.FC = () => {
  const { state, dismissCompletion } = useGoals();
  const { pendingCompletion } = state;

  if (!pendingCompletion) return null;

  const goal = pendingCompletion;
  const stars = DIFFICULTY_STARS[goal.difficulty];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismissCompletion}
      />

      <div
        className="relative w-full max-w-sm shadow-2xl rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a1108 0%, #130d06 100%)',
          border: '1px solid rgba(201,162,39,0.6)',
          boxShadow: '0 0 40px rgba(201,162,39,0.15)',
        }}
      >
        {/* Decorative top band */}
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.8), transparent)' }}
        />

        {/* Trophy header */}
        <div className="flex flex-col items-center pt-6 pb-4 px-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg"
            style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.25) 0%, rgba(201,162,39,0.05) 100%)', border: '2px solid rgba(201,162,39,0.4)' }}
          >
            <span className="text-3xl leading-none">🏆</span>
          </div>
          <p className="text-ivory/40 text-[9px] font-body uppercase tracking-[0.3em]">
            Objetivo Concluído
          </p>
          <h2 className="font-display text-xl text-gold tracking-widest uppercase text-center leading-tight mt-1">
            {goal.title}
          </h2>
        </div>

        {/* Separator */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Category + difficulty */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{CATEGORY_ICONS[goal.category]}</span>
              <span className="text-ivory/40 text-[10px] font-body uppercase tracking-wider">
                {goal.category}
              </span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < stars ? DIFFICULTY_COLOR[goal.difficulty] : 'text-leather-600/40'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-ivory/60 text-xs font-body leading-relaxed">
            {goal.description}
          </p>

          {/* Reward */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded"
            style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <span className="text-xl">{REWARD_ICONS[goal.reward.type]}</span>
            <div>
              <p className="text-ivory/30 text-[9px] font-body uppercase tracking-wider">Recompensa</p>
              <p className="text-gold text-xs font-body mt-0.5">{goal.reward.description}</p>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="px-6 pb-6">
          <button
            onClick={dismissCompletion}
            className="w-full py-2.5 rounded font-display text-sm tracking-widest uppercase transition-all duration-200"
            style={{
              background: 'linear-gradient(90deg, rgba(201,162,39,0.15) 0%, rgba(201,162,39,0.25) 50%, rgba(201,162,39,0.15) 100%)',
              border: '1px solid rgba(201,162,39,0.5)',
              color: 'rgba(201,162,39,0.9)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(90deg, rgba(201,162,39,0.25) 0%, rgba(201,162,39,0.4) 50%, rgba(201,162,39,0.25) 100%)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(90deg, rgba(201,162,39,0.15) 0%, rgba(201,162,39,0.25) 50%, rgba(201,162,39,0.15) 100%)';
            }}
          >
            Celebrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCompletionPopup;
