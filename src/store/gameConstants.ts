import type { Month, Season, BuildingNotification } from './gameTypes';

export const MONTHS: Month[] = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const SEASON_MAP: Record<Month, Season> = {
  'Março': 'Primavera', 'Abril': 'Primavera', 'Maio': 'Primavera',
  'Junho': 'Verão',     'Julho': 'Verão',     'Agosto': 'Verão',
  'Setembro': 'Outono', 'Outubro': 'Outono',  'Novembro': 'Outono',
  'Dezembro': 'Inverno','Janeiro': 'Inverno', 'Fevereiro': 'Inverno',
};

export const EVENTS_POOL: string[] = [
  'Nasceram 3 vitelos saudáveis no Cercado Norte.',
  'Nasceram 5 vitelos — excelente época de partos.',
  'Nasceram 2 vitelos. Um deles já mostra sinais de bravura.',
  'Grande seca. As pastagens ressentem-se.',
  'Primavera muito húmida. Pastagens exuberantes.',
  'Excelente produção de pastagens este mês.',
  'Um trabalhador reformou-se após 30 anos de serviço.',
  'Veterinário visitou a herdade. Efetivo em boa saúde.',
  'Recebido convite para tienta em Salamanca.',
  'Recebido convite para corrida em Lisboa.',
  'Recebido convite para corrida na Moita.',
  'Recebido convite para corrida em Espanha.',
  'Excelente evolução dos novilhos do Cercado Sul.',
  'Problemas na vedação do Cercado Norte. Reparação urgente.',
  'Pequena doença respiratória detetada. Veterinário em vigilância.',
  'Boa produção de feno. Reservas para o Inverno asseguradas.',
  'Comprado novo cavalo para trabalho na herdade.',
  'Visita de um ganadeiro espanhol interessado em reprodução.',
  'Chuvas intensas causaram alagamento parcial das pastagens.',
  'Tempo seco e quente. Animais transferidos para Cercado Norte.',
  'Um novilho distinguiu-se durante o treino no tentadero.',
  'Acordo de parceria assinado com ganaderia vizinha.',
  'Festival taurino em Évora — boa visibilidade para a ganaderia.',
  'Recebido relatório veterinário anual. Sem anomalias graves.',
  'Trabalhos de manutenção concluídos no tentadero.',
];

export const ESCRITORIO_NOTIFICATIONS: BuildingNotification[] = [
  { icon: '📰', label: 'Nova notícia' },
  { icon: '💰', label: 'Atualização económica' },
  { icon: '📬', label: 'Novo convite' },
  { icon: '📜', label: 'Contrato pendente' },
];

export const CERCADO_NOTIFICATIONS: BuildingNotification[] = [
  { icon: '🐂', label: 'Animais activos' },
  { icon: '⚠️', label: 'Alerta veterinário' },
  { icon: '🐂', label: 'Nascimentos' },
];
