import type { GameState } from '../../store/gameState';
import type { MonthlyReport, ReportCategory, ReportSeverity } from './MonthlyReport';

// ── ID generation ─────────────────────────────────────────────────────────────

let _counter = 0;
function nextReportId(): string {
  return `rpt-${++_counter}-${Date.now()}`;
}

// ── Template types ────────────────────────────────────────────────────────────

interface ReportTemplate {
  title: string;
  message: string;
  category: ReportCategory;
  severity: ReportSeverity;
  relatedLocationId?: string;
  condition?: (gs: GameState) => boolean;
}

// ── Conditional reports ───────────────────────────────────────────────────────
// These are checked first. If the condition is met, they are preferred.

const CONDITIONAL_REPORTS: ReportTemplate[] = [
  {
    title: 'Vedação a Necessitar de Reparação',
    message: 'Patrão, não gosto do estado da vedação no Cercado Norte. Convém reparar antes que algum animal escape pelos buracos.',
    category: 'Ranch', severity: 'Warning',
    relatedLocationId: 'cercado_norte',
    condition: gs => gs.locations.some(l => l.id === 'cercado_norte' && l.notifications.includes('BrokenFence')),
  },
  {
    title: 'Currais a Precisar de Limpeza',
    message: 'Os currais estão a precisar de uma limpeza a fundo, patrão. Vou tratar disso esta semana, mas que o patrão fique a saber.',
    category: 'Ranch', severity: 'Warning',
    relatedLocationId: 'currais',
    condition: gs => gs.locations.some(l => l.id === 'currais' && l.notifications.includes('NeedsCleaning')),
  },
  {
    title: 'Barragem em Vigilância',
    message: 'Não gosto do estado da barragem, patrão. O nível baixou com o calor. Convém vigiar nas próximas semanas.',
    category: 'Ranch', severity: 'Warning',
    relatedLocationId: 'barragem',
    condition: gs => gs.locations.some(l => l.id === 'barragem' && l.notifications.includes('WaitingInspection')),
  },
  {
    title: 'Cercado Sul a Inspecionar',
    message: 'O Cercado Sul está a aguardar inspecção, patrão. Nada grave, mas convém não deixar andar.',
    category: 'Ranch', severity: 'Warning',
    relatedLocationId: 'cercado_sul',
    condition: gs => gs.locations.some(l => l.id === 'cercado_sul' && l.notifications.includes('WaitingInspection')),
  },
];

// ── Weather reports by season ─────────────────────────────────────────────────

const WEATHER_BY_SEASON: Record<string, ReportTemplate[]> = {
  Primavera: [
    {
      title: 'Primavera Favorável',
      message: 'Bom dia, patrão. A primavera está a chegar bem. As pastagens renascem e os animais estão activos. Bom sinal para a temporada.',
      category: 'Weather', severity: 'Info',
    },
    {
      title: 'Chuvas de Primavera',
      message: 'As chuvas desta semana fizeram bem às pastagens, patrão. Podemos poupar algum custo de alimentação este mês. Boa notícia.',
      category: 'Weather', severity: 'Info',
    },
  ],
  Verão: [
    {
      title: 'Calor Intenso',
      message: 'Patrão, o calor está forte. Os animais foram transferidos para zonas com mais sombra. Há que vigiar os níveis de água.',
      category: 'Weather', severity: 'Warning',
    },
    {
      title: 'Verão Seco',
      message: 'A seca está a fazer-se sentir nas pastagens, patrão. Estamos a gerir as reservas de feno com cuidado para chegar ao Outono.',
      category: 'Weather', severity: 'Warning',
    },
  ],
  Outono: [
    {
      title: 'Outono Temperado',
      message: 'Bom dia, patrão. O outono está a tratar bem a herdade. Temperaturas amenas e alguma chuva. Os animais estão bem e calmos.',
      category: 'Weather', severity: 'Info',
    },
    {
      title: 'Primeiras Chuvas de Outono',
      message: 'As primeiras chuvas chegaram, patrão. As pastagens vão recuperar bem. É boa altura para preparar as reservas de Inverno.',
      category: 'Weather', severity: 'Info',
    },
  ],
  Inverno: [
    {
      title: 'Frio de Inverno',
      message: 'Noites frias, patrão. Os animais estão abrigados e as reservas de feno chegam bem. Por enquanto não há preocupações.',
      category: 'Weather', severity: 'Info',
    },
    {
      title: 'Inverno Rigoroso',
      message: 'Este Inverno está a puxar pelas reservas, patrão. Os animais aguentam, mas convém estar atento aos gastos de alimentação.',
      category: 'Weather', severity: 'Warning',
    },
  ],
};

// ── General report pool ───────────────────────────────────────────────────────

const GENERAL_REPORTS: ReportTemplate[] = [
  // Animals
  {
    title: 'Efectivo em Boa Forma',
    message: 'Bom dia, patrão. Os novilhos evoluíram bem este mês. A bravura está a fazer-se notar no Cercado Sul. Bom sinal para a temporada.',
    category: 'Animals', severity: 'Info',
  },
  {
    title: 'Vitelos com Boa Evolução',
    message: 'Os vitelos nascidos este Inverno ganharam muito peso, patrão. A linha genética está a dar os seus frutos. Podemos estar satisfeitos.',
    category: 'Animals', severity: 'Info',
  },
  {
    title: 'Animal Agressivo nos Currais',
    message: 'Patrão, o Bravio 18 anda demasiado agressivo nos currais. Há que separar antes que haja acidentes com os trabalhadores.',
    category: 'Animals', severity: 'Warning',
  },
  {
    title: 'Visita Veterinária',
    message: 'O veterinário esteve cá ontem, patrão. Efectivo em boa saúde, sem anomalias graves. Podemos ficar descansados por agora.',
    category: 'Animals', severity: 'Info',
  },
  {
    title: 'Inspecção ao Efectivo',
    message: 'Fiz uma volta pelo efectivo esta manhã, patrão. Os animais estão calmos e bem alimentados. A temporada começa com bom pé.',
    category: 'Animals', severity: 'Info',
  },
  {
    title: 'Novilhos com Potencial',
    message: 'Há dois novilhos no Cercado Norte a mostrar muito carácter, patrão. Vale a pena marcá-los para a próxima tienta.',
    category: 'Animals', severity: 'Info',
  },
  // Ranch
  {
    title: 'Pastagens a Recuperar',
    message: 'As pastagens estão em bom estado depois das últimas chuvas, patrão. Podemos reduzir algum custo de alimentação este mês.',
    category: 'Ranch', severity: 'Info',
  },
  {
    title: 'Tentadero Pronto',
    message: 'O tentadero está em bom estado, patrão. Podemos começar as tientas assim que o patrão quiser marcar as datas.',
    category: 'Ranch', severity: 'Info',
  },
  {
    title: 'Manutenção Preventiva',
    message: 'Aproveitei para fazer umas reparações menores este mês, patrão. Tudo em ordem. Melhor prevenir que remediar na herdade.',
    category: 'Ranch', severity: 'Info',
  },
  // Economy
  {
    title: 'Reservas de Feno Suficientes',
    message: 'O feno ainda chega para outro mês, patrão. Não precisamos de comprar de momento. Podemos esperar por melhores preços.',
    category: 'Economy', severity: 'Info',
  },
  {
    title: 'Consulta de Preços',
    message: 'Recebemos uma consulta de preços para a venda de um novilho, patrão. Deixo ao critério do patrão se vale a pena negociar.',
    category: 'Economy', severity: 'Info',
  },
  {
    title: 'Gastos de Manutenção Elevados',
    message: 'Patrão, os gastos com manutenção subiram um pouco este mês. Nada de grave, mas convém estar atento à tendência.',
    category: 'Economy', severity: 'Warning',
  },
  // Staff
  {
    title: 'Trabalhador de Baixa',
    message: 'O João está de baixa esta semana, patrão. Os outros estão a cobrir sem problemas. Não há atrasos no trabalho.',
    category: 'Staff', severity: 'Info',
  },
  {
    title: 'Equipa em Ordem',
    message: 'A equipa está a trabalhar bem este mês, patrão. Sem problemas de pessoal. Bom ambiente na herdade. É como deve ser.',
    category: 'Staff', severity: 'Info',
  },
  {
    title: 'Novo Trabalhador',
    message: 'Entrou um novo trabalhador esta semana, patrão. Parece competente e trabalhador. Vamos ver o que sabe fazer com o tempo.',
    category: 'Staff', severity: 'Info',
  },
  // General
  {
    title: 'Relatório Mensal',
    message: 'Bom dia, patrão. Tudo calmo na herdade. As rotinas estão a correr como deve ser. Nada de especial a relatar este mês.',
    category: 'General', severity: 'Info',
  },
  {
    title: 'Herdade em Ordem',
    message: 'Nada de especial para relatar, patrão. A herdade segue o seu curso normal. Podemos estar descansados por agora.',
    category: 'General', severity: 'Info',
  },
  {
    title: 'Início do Mês',
    message: 'Bom dia, patrão. Começamos mais um mês na herdade. Nada de urgente. Aproveite para dar uma volta pelos cercados.',
    category: 'General', severity: 'Info',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── MonthlyReportService ──────────────────────────────────────────────────────

export class MonthlyReportService {
  /**
   * Generates a new report based on the current game state.
   * Prefers context-sensitive templates; falls back to random general pool.
   */
  generateMonthlyReport(gameState: GameState): MonthlyReport {
    const { month, year, season } = gameState;

    // 1. Conditional reports (react to actual game state)
    const applicable = CONDITIONAL_REPORTS.filter(t => !t.condition || t.condition(gameState));
    if (applicable.length > 0 && Math.random() < 0.55) {
      return this._build(pick(applicable), month, year);
    }

    // 2. Seasonal weather report (~25% chance)
    if (Math.random() < 0.25) {
      const pool = WEATHER_BY_SEASON[season] ?? WEATHER_BY_SEASON['Primavera'];
      return this._build(pick(pool), month, year);
    }

    // 3. General pool
    return this._build(pick(GENERAL_REPORTS), month, year);
  }

  /**
   * Returns a new array with the target report marked as acknowledged.
   * Pure — does not mutate the input.
   */
  acknowledgeReport(reports: MonthlyReport[], reportId: string): MonthlyReport[] {
    return reports.map(r => r.id === reportId ? { ...r, acknowledged: true } : r);
  }

  /** Returns the first unacknowledged report, or null if none exist. */
  getCurrentReport(reports: MonthlyReport[]): MonthlyReport | null {
    return reports.find(r => !r.acknowledged) ?? null;
  }

  /** Returns a copy of all reports in reverse-chronological order. */
  getReportHistory(reports: MonthlyReport[]): MonthlyReport[] {
    return [...reports];
  }

  private _build(template: ReportTemplate, month: string, year: number): MonthlyReport {
    return {
      id: nextReportId(),
      date: { month, year },
      title: template.title,
      message: template.message,
      category: template.category,
      severity: template.severity,
      relatedLocationId: template.relatedLocationId,
      acknowledged: false,
    };
  }
}

export const monthlyReportService = new MonthlyReportService();
