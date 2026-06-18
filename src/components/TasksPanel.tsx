import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../store/gameState';
import type { DailyTask, TaskType } from '../data/dailyTasks';

// ── Type dot colours ──────────────────────────────────────────────────────────

const TYPE_DOT: Record<TaskType, string> = {
  'Animais':       'bg-amber-500/80',
  'Instalações':   'bg-stone-400/80',
  'Economia':      'bg-yellow-400/80',
  'Administração': 'bg-sky-400/80',
  'Eventos':       'bg-emerald-500/80',
};

const TYPE_LABEL: Record<TaskType, string> = {
  'Animais':       'Animais',
  'Instalações':   'Inst.',
  'Economia':      'Econ.',
  'Administração': 'Admin.',
  'Eventos':       'Eventos',
};

// ── Task row ──────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: DailyTask;
  onAction: (task: DailyTask) => void;
  onIgnore: (id: string) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, onAction, onIgnore }) => {
  const isPending  = task.status === 'pending';
  const isDone     = task.status === 'completed';
  const isIgnored  = task.status === 'ignored';

  return (
    <div
      className={`group flex items-start gap-2 px-2 py-1.5 rounded transition-all duration-150 ${isPending ? 'cursor-pointer hover:bg-leather-700/40' : ''}`}
      onClick={isPending ? () => onAction(task) : undefined}
      title={isPending ? (task.destination.kind === 'route' ? `Abrir ${task.destination.path.replace('/', '')}` : task.destination.name) : undefined}
    >
      {/* Type dot */}
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${TYPE_DOT[task.type]}`} />

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-body leading-tight ${
          isDone    ? 'text-ivory/35 line-through' :
          isIgnored ? 'text-ivory/25' :
                      'text-ivory/75'
        }`}>
          {task.label}
        </p>
        <p className={`text-[9px] font-body uppercase tracking-wider mt-0.5 ${
          isDone    ? 'text-emerald-500/40' :
          isIgnored ? 'text-ivory/20' :
                      'text-ivory/25'
        }`}>
          {TYPE_LABEL[task.type]}
        </p>
      </div>

      {/* Status / actions */}
      <div className="shrink-0 flex items-center">
        {isDone && (
          <span className="text-emerald-500/70 text-[11px]">✓</span>
        )}
        {isIgnored && (
          <span className="text-ivory/20 text-[11px]">—</span>
        )}
        {isPending && (
          <button
            className="text-ivory/15 hover:text-ivory/50 text-xs leading-none transition-colors opacity-0 group-hover:opacity-100 px-1"
            title="Ignorar"
            onClick={e => { e.stopPropagation(); onIgnore(task.id); }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main panel ────────────────────────────────────────────────────────────────

const TasksPanel: React.FC = () => {
  const { state, completeTask, ignoreTask } = useGameState();
  const navigate = useNavigate();
  const { dailyTasks } = state;

  const [expanded, setExpanded]   = useState(true);
  const [buildingMsg, setBuildingMsg] = useState<string | null>(null);

  const completedCount = dailyTasks.filter(t => t.status === 'completed').length;
  const allResolved    = dailyTasks.every(t => t.status !== 'pending');

  const handleAction = (task: DailyTask) => {
    completeTask(task.id);
    if (task.destination.kind === 'route') {
      setBuildingMsg(null);
      navigate(task.destination.path);
    } else {
      setBuildingMsg(`${task.destination.name} — ${task.destination.hint}`);
    }
  };

  const handleIgnore = (id: string) => {
    ignoreTask(id);
    setBuildingMsg(null);
  };

  return (
    <div className="absolute top-5 left-4 z-30 w-52">
      <div
        className="rounded-lg overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, #1f1609 0%, #170e06 100%)',
          border: '1px solid rgba(90,60,30,0.55)',
        }}
      >
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-4 py-2.5 border-b border-leather-700/50 hover:bg-leather-700/20 transition-colors"
          onClick={() => setExpanded(v => !v)}
        >
          <p className="font-display text-[10px] text-gold tracking-widest uppercase">Tarefas do Dia</p>
          <div className="flex items-center gap-2">
            <span className="text-ivory/30 text-[9px] font-body">{completedCount}/{dailyTasks.length}</span>
            <span className={`text-ivory/25 text-[9px] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
          </div>
        </button>

        {/* Task list */}
        {expanded && (
          <>
            <div className="py-1.5">
              {dailyTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onAction={handleAction}
                  onIgnore={handleIgnore}
                />
              ))}
            </div>

            {/* Building coming-soon message */}
            {buildingMsg && (
              <div className="mx-3 mb-2 px-3 py-2 bg-leather-800/50 border border-leather-600/30 rounded">
                <p className="text-ivory/45 text-[10px] font-body leading-snug">{buildingMsg}</p>
                <button
                  className="text-ivory/20 text-[9px] font-body hover:text-ivory/40 mt-1 transition-colors"
                  onClick={() => setBuildingMsg(null)}
                >
                  Fechar
                </button>
              </div>
            )}

            {/* Day complete */}
            {allResolved && (
              <div className="mx-3 mb-3 mt-1 px-3 py-2 bg-gold/8 border border-gold/25 rounded text-center">
                <p className="text-gold text-[11px] font-display tracking-wider">O dia está completo.</p>
                <p className="text-ivory/30 text-[9px] font-body mt-0.5">Pode avançar o mês.</p>
              </div>
            )}

            {/* Progress bar */}
            {!allResolved && (
              <div className="mx-3 mb-3 mt-1">
                <div className="h-0.5 bg-leather-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold/50 rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / dailyTasks.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TasksPanel;
