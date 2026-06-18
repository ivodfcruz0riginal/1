export type TaskType = 'Animais' | 'Instalações' | 'Economia' | 'Administração' | 'Eventos';
export type TaskStatus = 'pending' | 'completed' | 'ignored';

export type TaskDestination =
  | { kind: 'route'; path: string }
  | { kind: 'building'; name: string; hint: string };

export interface DailyTask {
  id: string;
  label: string;
  type: TaskType;
  status: TaskStatus;
  destination: TaskDestination;
}

interface TaskTemplate {
  label: string;
  type: TaskType;
  destination: TaskDestination;
}

const TASK_POOL: TaskTemplate[] = [
  // Animals
  { label: 'Observar o Bravio 18', type: 'Animais', destination: { kind: 'building', name: 'Currais', hint: 'Gestão de currais em desenvolvimento.' } },
  { label: 'Verificar vacas do Cercado Sul', type: 'Animais', destination: { kind: 'building', name: 'Cercado Sul', hint: 'Gestão de cercados em desenvolvimento.' } },
  { label: 'Inspeccionar vitelos recém-nascidos', type: 'Animais', destination: { kind: 'building', name: 'Cercado Norte', hint: 'Gestão de cercados em desenvolvimento.' } },
  { label: 'Controlar saúde do efectivo', type: 'Animais', destination: { kind: 'route', path: '/efetivo' } },
  { label: 'Avaliar sementais', type: 'Animais', destination: { kind: 'route', path: '/efetivo' } },
  { label: 'Verificar alimentação dos animais', type: 'Animais', destination: { kind: 'building', name: 'Currais', hint: 'Gestão de currais em desenvolvimento.' } },

  // Facilities
  { label: 'Reparar vedação do Cercado Norte', type: 'Instalações', destination: { kind: 'building', name: 'Cercado Norte', hint: 'Gestão de cercados em desenvolvimento.' } },
  { label: 'Preparar o tentadero', type: 'Instalações', destination: { kind: 'building', name: 'Tentadero', hint: 'Tentadero em desenvolvimento.' } },
  { label: 'Verificar reservatório de água', type: 'Instalações', destination: { kind: 'building', name: 'Cercado Sul', hint: 'Gestão de cercados em desenvolvimento.' } },
  { label: 'Inspeccionar currais', type: 'Instalações', destination: { kind: 'building', name: 'Currais', hint: 'Gestão de currais em desenvolvimento.' } },
  { label: 'Manutenção das instalações', type: 'Instalações', destination: { kind: 'building', name: 'Currais', hint: 'Gestão de currais em desenvolvimento.' } },

  // Economy
  { label: 'Rever contas mensais', type: 'Economia', destination: { kind: 'route', path: '/escritorio' } },
  { label: 'Analisar despesas do mês', type: 'Economia', destination: { kind: 'route', path: '/escritorio' } },
  { label: 'Verificar tesouraria', type: 'Economia', destination: { kind: 'route', path: '/escritorio' } },

  // Administration
  { label: 'Ler novo contrato', type: 'Administração', destination: { kind: 'route', path: '/escritorio' } },
  { label: 'Marcar tienta', type: 'Administração', destination: { kind: 'route', path: '/escritorio' } },
  { label: 'Responder correspondência', type: 'Administração', destination: { kind: 'route', path: '/escritorio' } },
  { label: 'Actualizar registos da casa', type: 'Administração', destination: { kind: 'route', path: '/escritorio' } },

  // Events
  { label: 'Preparar envio para corrida', type: 'Eventos', destination: { kind: 'building', name: 'Parque de Embarque', hint: 'Parque de embarque em desenvolvimento.' } },
  { label: 'Receber veterinário', type: 'Eventos', destination: { kind: 'route', path: '/efetivo' } },
  { label: 'Reunião com ganadeiro visitante', type: 'Eventos', destination: { kind: 'route', path: '/escritorio' } },
];

let _taskCounter = 0;

export function generateDailyTasks(): DailyTask[] {
  const shuffled = [...TASK_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).map((template, i) => ({
    id: `task-${++_taskCounter}-${i}`,
    label: template.label,
    type: template.type,
    status: 'pending',
    destination: template.destination,
  }));
}
