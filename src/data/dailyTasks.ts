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
  { label: 'Observar o Bravio 18', type: 'Animais', destination: { kind: 'building', name: 'Currais', hint: 'Os currais alojam os animais em confinamento. Consulte o Efectivo para ver o estado individual de cada animal.' } },
  { label: 'Verificar vacas do Cercado Sul', type: 'Animais', destination: { kind: 'building', name: 'Cercado Sul', hint: 'O Cercado Sul é onde as vacas e crias passam a maior parte do ano. Consulte o Efectivo para acompanhar a condição do efectivo.' } },
  { label: 'Inspeccionar vitelos recém-nascidos', type: 'Animais', destination: { kind: 'building', name: 'Cercado Norte', hint: 'O Cercado Norte serve de pastagem principal. Consulte o Efectivo para ver o estado dos vitelos.' } },
  { label: 'Controlar saúde do efectivo', type: 'Animais', destination: { kind: 'route', path: '/efetivo' } },
  { label: 'Avaliar sementais', type: 'Animais', destination: { kind: 'route', path: '/efetivo' } },
  { label: 'Verificar alimentação dos animais', type: 'Animais', destination: { kind: 'building', name: 'Currais', hint: 'A alimentação é gerida automaticamente pela simulação mensal. Veja o Efectivo para acompanhar o estado nutricional dos animais.' } },

  // Facilities
  { label: 'Reparar vedação do Cercado Norte', type: 'Instalações', destination: { kind: 'building', name: 'Cercado Norte', hint: 'As vedações são mantidas pelo capataz. O estado das pastagens é actualizado no final de cada mês.' } },
  { label: 'Preparar o tentadero', type: 'Instalações', destination: { kind: 'building', name: 'Tentadero', hint: 'O tentadero é usado para as tentas. Por enquanto, acompanhe os animais candidatos no Efectivo.' } },
  { label: 'Verificar reservatório de água', type: 'Instalações', destination: { kind: 'building', name: 'Cercado Sul', hint: 'Os níveis de água são actualizados mensalmente. Em períodos de seca o consumo aumenta — acompanhe no Diário.' } },
  { label: 'Inspeccionar currais', type: 'Instalações', destination: { kind: 'building', name: 'Currais', hint: 'Os currais estão operacionais. Consulte o Efectivo para ver quais os animais em confinamento.' } },
  { label: 'Manutenção das instalações', type: 'Instalações', destination: { kind: 'building', name: 'Currais', hint: 'A manutenção mensal é processada automaticamente. Acompanhe os custos na tab Economia do Escritório.' } },

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
  { label: 'Preparar envio para corrida', type: 'Eventos', destination: { kind: 'building', name: 'Parque de Embarque', hint: 'O parque de embarque é usado quando os animais partem para uma corrida. Consulte os Contratos no Escritório.' } },
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
