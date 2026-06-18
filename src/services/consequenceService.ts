import type { Consequence, ConsequenceCategory, ConsequenceSeverity, GameDate } from '../types/consequence';

// ── Date utilities ────────────────────────────────────────────────────────────

const MONTH_ORDER = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function addMonths(date: GameDate, count: number): GameDate {
  const idx = MONTH_ORDER.indexOf(date.month);
  const totalMonths = idx + count;
  const newIdx = ((totalMonths % 12) + 12) % 12;
  const yearOffset = Math.floor(totalMonths / 12);
  return { month: MONTH_ORDER[newIdx], year: date.year + yearOffset };
}

export function dateToOrdinal(date: GameDate): number {
  return date.year * 12 + MONTH_ORDER.indexOf(date.month);
}

export function shouldTrigger(c: Consequence, month: string, year: number): boolean {
  return !c.triggered && dateToOrdinal({ month, year }) >= dateToOrdinal(c.triggerDate);
}

export function processConsequences(
  consequences: Consequence[],
  month: string,
  year: number,
): Consequence[] {
  return consequences.map(c => shouldTrigger(c, month, year) ? { ...c, triggered: true } : c);
}

export function resolveConsequence(consequences: Consequence[], id: string): Consequence[] {
  return consequences.map(c => c.id === id ? { ...c, resolved: true } : c);
}

// ── ID generation ─────────────────────────────────────────────────────────────

let _counter = 0;

function nextId(): string {
  return `con-${++_counter}-${Date.now()}`;
}

// ── Template builder ──────────────────────────────────────────────────────────

function make(
  title: string,
  description: string,
  category: ConsequenceCategory,
  severity: ConsequenceSeverity,
  delayMonths: number,
  creationDate: GameDate,
  sourceDecision: string,
  relatedLocationId?: string,
): Consequence {
  return {
    id: nextId(),
    creationDate,
    triggerDate: addMonths(creationDate, delayMonths),
    title,
    description,
    category,
    severity,
    triggered: false,
    resolved: false,
    sourceDecision,
    relatedLocationId,
  };
}

// ── Decision consequence templates ───────────────────────────────────────────
// Each entry maps: decisionId → (choiceIndex, date) → Consequence | null

type TemplateMap = Record<string, (i: number, d: GameDate) => Consequence | null>;

const TEMPLATES: TemplateMap = {
  // Touro Agressivo
  sa_01: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Touro em observação', 'O Bravio 18 continua agitado. A situação requer atenção continuada.', 'Animals', 'Low', 1],
      ['Separação concluída', 'Bravio 18 separado com sucesso. A tensão no cercado diminuiu visivelmente.', 'Animals', 'Low', 2],
      ['Vedação danificada', 'O Bravio 18 forçou a vedação. Reparação urgente necessária no Cercado Norte.', 'Buildings', 'High', 2],
      ['Animal vendido', 'Venda do Bravio 18 processada. Receita registada na contabilidade.', 'Economy', 'Medium', 1],
    ];
    const o = outcomes[i] ?? outcomes[2];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'sa_01', i === 2 ? 'cercado_norte' : undefined);
  },

  // Doença Respiratória
  sa_02: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Efetivo tratado com sucesso', 'Tratamento preventivo concluído. Todos os animais saudáveis.', 'Health', 'Low', 2],
      ['Dois animais recuperados', 'Os animais afectados recuperaram. Monitorização continua.', 'Health', 'Medium', 2],
      ['Doença alastrou', 'A doença respiratória espalhou-se para mais três animais no Cercado Norte.', 'Health', 'High', 1],
      ['Surto grave', 'Surto severo de doença respiratória. Cinco animais em estado crítico.', 'Health', 'Critical', 1],
    ];
    const o = outcomes[i] ?? outcomes[3];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'sa_02');
  },

  // Lesão no Tentadero
  sa_03: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Animal recuperado', 'Novilho tratado pelo veterinário e a recuperar bem. Pronto em breve.', 'Health', 'Low', 2],
      ['Lesão agravou', 'Sem tratamento, a lesão agravou. Veterinário chamado de emergência.', 'Health', 'Medium', 1],
      ['Recuperação lenta', 'Animal isolado e a recuperar lentamente. Situação estável.', 'Health', 'Medium', 2],
    ];
    const o = outcomes[i] ?? outcomes[1];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'sa_03');
  },

  // Feira da Moita
  ct_01: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Corrida da Moita realizada', 'Seis touros foram lidados com destaque. Pagamento recebido conforme contrato.', 'Contracts', 'Low', 3],
      ['Contrato negociado assinado', 'Negociação com a Moita concluída com melhores condições. Contrato assinado.', 'Contracts', 'Low', 2],
      ['Ganaderia rival contratada', 'A Feira da Moita contratou outra ganaderia. Oportunidade perdida.', 'Economy', 'Low', 1],
    ];
    const o = outcomes[i] ?? outcomes[2];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'ct_01');
  },

  // Parceria Espanhola
  ct_02: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Escuro 7 em Salamanca', 'Parceria activa. Escuro 7 transferido temporariamente para Salamanca.', 'Animals', 'Medium', 2],
      ['Garantias a aguardar', 'Ganaderia de Salamanca a preparar documentação de garantia.', 'Contracts', 'Low', 1],
      ['Parceria recusada', 'Proposta recusada. Reputação de independência mantida.', 'Contracts', 'Low', 1],
      ['Contraproposta enviada', 'Contraproposta enviada para Salamanca. A aguardar resposta.', 'Contracts', 'Low', 1],
    ];
    const o = outcomes[i] ?? outcomes[0];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'ct_02');
  },

  // Direitos de Reprodução
  ct_03: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Receita de direitos recebida', 'Venda dos direitos de reprodução confirmada. Receita extraordinária registada.', 'Economy', 'High', 1],
      ['Acordo de partilha activo', 'Acordo de uso partilhado em vigor. Receita mensal garantida.', 'Economy', 'Medium', 2],
      ['Direitos mantidos', 'Proposta recusada. Linha genética permanece exclusiva da herdade.', 'Contracts', 'Low', 1],
    ];
    const o = outcomes[i] ?? outcomes[0];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'ct_03');
  },

  // Escassez de Forragem
  ge_02: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Feno de emergência adquirido', 'Reservas de feno repostas. Custo adicional registado na contabilidade.', 'Economy', 'Medium', 1],
      ['Animais com stress nutricional', 'Restrição alimentar causou stress nos animais. Estado físico afectado.', 'Health', 'High', 2],
      ['Animais transferidos', 'Transferência para pastagem concluída sem incidentes.', 'Animals', 'Low', 1],
      ['Reservas esgotadas', 'As reservas chegaram ao fim. Animais em risco de subnutrição.', 'Health', 'Critical', 1],
    ];
    const o = outcomes[i] ?? outcomes[3];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'ge_02');
  },

  // Expansão das Instalações
  ge_03: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Obras no Cercado Sul iniciadas', 'Expansão aprovada. Obras iniciadas no Cercado Sul. Custo de construção em curso.', 'Buildings', 'High', 2],
      ['Expansão adiada', 'Decisão de expansão adiada para o próximo ciclo orçamental.', 'Buildings', 'Low', 1],
      ['Orçamento detalhado recebido', 'Orçamento completo entregue. Projecto aguarda aprovação final.', 'Buildings', 'Low', 1],
    ];
    const o = outcomes[i] ?? outcomes[1];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'ge_03', i === 0 ? 'cercado_sul' : undefined);
  },

  // Festival Taurino
  ev_01: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Festival de Évora concluído', 'Participação com destaque no Festival de Évora. Prestígio da ganaderia cresceu.', 'Contracts', 'Low', 2],
      ['Participação no festival confirmada', 'Presença no Festival de Évora confirmada. Preparação em curso.', 'Contracts', 'Low', 2],
      ['Festival sem participação', 'Ganaderia ausente do Festival de Évora este ano.', 'Economy', 'Low', 1],
    ];
    const o = outcomes[i] ?? outcomes[2];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'ev_01');
  },

  // Pedido de Reportagem
  ev_02: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Documentário concluído', 'Equipa de filmagem partiu. Documentário sobre a herdade em pós-produção.', 'Staff', 'Low', 2],
      ['Filmagens dentro do acordo', 'Reportagem concluída respeitando todas as condições acordadas.', 'Staff', 'Low', 2],
      ['Proposta de reportagem recusada', 'Produtora informada da recusa. Outro ganadeiro será abordado.', 'Economy', 'Low', 1],
    ];
    const o = outcomes[i] ?? outcomes[2];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'ev_02');
  },

  // Visita de Ganadeiros
  ev_03: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Relações internacionais fortalecidas', 'Visita foi um êxito. Ganadeiros de Castilla y León impressionados com a herdade.', 'Contracts', 'Low', 1],
      ['Visita concluída', 'Visita decorreu sem incidentes. Relações mantidas cordialmente.', 'Contracts', 'Low', 1],
      ['Ganadeiros insatisfeitos', 'Adiamento deixou os visitantes sem boa impressão. Relação fragilizada.', 'Staff', 'Low', 1],
      ['Convite recusado', 'Recusa do convite ofendeu a delegação. Relação internacional comprometida.', 'Contracts', 'Medium', 1],
    ];
    const o = outcomes[i] ?? outcomes[3];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'ev_03');
  },

  // Reforma de Campino
  pe_01: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Reforma generosa paga', 'António reformado com reconhecimento justo. Moral da equipa elevado.', 'Economy', 'Medium', 1],
      ['António reformado', 'António saiu com reforma standard. Transição concluída com normalidade.', 'Staff', 'Low', 1],
      ['António continua na herdade', 'António aceitou ficar mais um ano. Continuidade garantida mas moral diminuída.', 'Staff', 'Medium', 1],
    ];
    const o = outcomes[i] ?? outcomes[1];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'pe_01');
  },

  // Novo Campino
  pe_02: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Novo campino integrado', 'Jovem de Coruche integrado na equipa. Adaptação em curso.', 'Staff', 'Low', 2],
      ['Período de experiência concluído', 'Período de experiência superado. Campino contratado efectivo.', 'Staff', 'Low', 2],
      ['Vaga por preencher', 'Candidato recusado. Herdade com necessidade de campino por colmatar.', 'Staff', 'Low', 1],
      ['Referências a verificar', 'Referências enviadas para verificação. Decisão pendente.', 'Staff', 'Low', 1],
    ];
    const o = outcomes[i] ?? outcomes[2];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'pe_02');
  },

  // Pedido de Aumento
  pe_03: (i, d) => {
    const outcomes: [string, string, ConsequenceCategory, ConsequenceSeverity, number][] = [
      ['Aumentos concedidos', 'Aumentos aprovados. Custos mensais de pessoal subiram. Moral elevado.', 'Economy', 'High', 1],
      ['Aumento parcial concedido', 'Aumento parcial aceite pelos campinos. Situação estabilizou.', 'Economy', 'Medium', 1],
      ['Tensão entre campinos', 'Aumento recusado. Insatisfação crescente afecta o trabalho diário.', 'Staff', 'Medium', 2],
      ['Insatisfação crescente', 'Adiamento da decisão gerou mais ressentimento na equipa.', 'Staff', 'Medium', 1],
    ];
    const o = outcomes[i] ?? outcomes[2];
    return make(o[0], o[1], o[2], o[3], o[4], d, 'pe_03');
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

export function generateConsequencesFromDecision(
  decisionId: string,
  choiceIndex: number,
  creationDate: GameDate,
): Consequence[] {
  const template = TEMPLATES[decisionId];
  if (!template) return [];
  const result = template(choiceIndex, creationDate);
  return result ? [result] : [];
}

// Display helpers
export const CATEGORY_ICONS: Record<string, string> = {
  Animals:   '🐂',
  Economy:   '💰',
  Health:    '🩺',
  Buildings: '🏗',
  Staff:     '👤',
  Weather:   '🌦',
  Contracts: '📜',
};

export const SEVERITY_COLOR: Record<string, string> = {
  Low:      'text-green-400 border-green-500/30 bg-green-500/10',
  Medium:   'text-amber-400 border-amber-500/30 bg-amber-500/10',
  High:     'text-orange-400 border-orange-500/30 bg-orange-500/10',
  Critical: 'text-red-400 border-red-500/30 bg-red-500/10',
};

export const SEVERITY_DOT: Record<string, string> = {
  Low:      'bg-green-500',
  Medium:   'bg-amber-500',
  High:     'bg-orange-500',
  Critical: 'bg-red-500',
};
