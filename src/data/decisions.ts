export type DecisionCategory =
  | 'Saúde Animal'
  | 'Contrato'
  | 'Gestão'
  | 'Evento'
  | 'Pessoal';

export interface Decision {
  id: string;
  title: string;
  category: DecisionCategory;
  description: string;
  imageHint: string;
  choices: string[];
  consequences?: string[];
  important?: boolean;
}

export const DECISION_POOL: Decision[] = [
  // ── Saúde Animal ──────────────────────────────────────────────────────────
  {
    id: 'sa_01',
    title: 'Relatório do Maioral',
    category: 'Saúde Animal',
    description: 'Patrão... o Bravio 18 anda demasiado agressivo. Ontem tentou carregar contra a vedação três vezes. O campino ficou assustado.',
    imageHint: 'Toiro bravo em cercado',
    choices: ['Observar mais alguns dias.', 'Separar imediatamente.', 'Ignorar por agora.', 'Vender o animal.'],
    consequences: [
      'O animal continua a ser monitorizado de perto.',
      'O Bravio 18 foi isolado. Situação controlada.',
      'Nenhuma medida tomada. O risco persiste.',
      'O animal foi vendido. Situação encerrada.',
    ],
  },
  {
    id: 'sa_02',
    title: 'Relatório Veterinário',
    category: 'Saúde Animal',
    description: 'O veterinário suspeita de uma doença respiratória no Cercado Norte. Dois animais apresentam sintomas. O risco de contágio é real.',
    imageHint: 'Veterinário a examinar toiro',
    choices: ['Tratar todos os animais.', 'Tratar apenas os afectados.', 'Aguardar evolução.', 'Ignorar.'],
    consequences: [
      'Tratamento geral iniciado. Custo elevado mas risco minimizado.',
      'Dois animais em tratamento. Situação controlada.',
      'Evolução monitorizada. Risco de contágio ainda presente.',
      'Nenhuma medida tomada. Situação pode agravar-se.',
    ],
    important: true,
  },
  {
    id: 'sa_03',
    title: 'Incidente no Tentadero',
    category: 'Saúde Animal',
    description: 'Um novilho sofreu uma lesão na pata durante o treino de ontem. O veterinário está disponível mas a consulta tem custo.',
    imageHint: 'Novilho em repouso no curral',
    choices: ['Chamar o veterinário.', 'Aguardar recuperação natural.', 'Isolar o animal.'],
    consequences: [
      'Veterinário chamado. Lesão avaliada e tratada.',
      'Animal em repouso. Recuperação esperada em alguns dias.',
      'Animal isolado no curral de recuperação.',
    ],
  },

  // ── Contrato ──────────────────────────────────────────────────────────────
  {
    id: 'ct_01',
    title: 'Proposta da Feira da Moita',
    category: 'Contrato',
    description: 'A Feira da Moita quer seis touros para a corrida de Setembro. A oferta é boa mas a data é muito próxima.',
    imageHint: 'Carta com selo oficial da Moita',
    choices: ['Aceitar.', 'Negociar condições.', 'Recusar.'],
    consequences: [
      'Contrato aceite. Seis touros reservados para Setembro.',
      'Negociação iniciada. Condições a ser acordadas.',
      'Proposta recusada. Relação com a Feira da Moita pode ser afectada.',
    ],
    important: true,
  },
  {
    id: 'ct_02',
    title: 'Parceria Espanhola',
    category: 'Contrato',
    description: 'Uma ganaderia de Salamanca propõe uma parceria de reprodução. Querem acesso ao nosso Escuro 7 durante dois meses.',
    imageHint: 'Documentos de contrato em papel timbrado',
    choices: ['Aceitar a parceria.', 'Pedir mais garantias.', 'Recusar.', 'Propor condições diferentes.'],
    consequences: [
      'Parceria aceite. Escuro 7 enviado para Salamanca por dois meses.',
      'Pedidas garantias adicionais. Acordo pendente.',
      'Parceria recusada. Ganaderia espanhola agradeceu a resposta.',
      'Contra-proposta enviada. Aguarda resposta da ganaderia espanhola.',
    ],
    important: true,
  },
  {
    id: 'ct_03',
    title: 'Pedido de Direitos de Reprodução',
    category: 'Contrato',
    description: 'Um ganadeiro português quer comprar os direitos de reprodução do nosso melhor seminal. A oferta financeira é considerável.',
    imageHint: 'Selos e documentos oficiais',
    choices: ['Vender os direitos.', 'Negociar um acordo de uso partilhado.', 'Recusar.'],
    consequences: [
      'Direitos de reprodução vendidos. Receita considerável obtida.',
      'Acordo de uso partilhado em negociação.',
      'Proposta recusada. Linha genética mantida em exclusivo.',
    ],
    important: true,
  },

  // ── Gestão ────────────────────────────────────────────────────────────────
  {
    id: 'ge_01',
    title: 'Início da Época',
    category: 'Gestão',
    description: 'Começa uma nova temporada na Herdade da Ferraria. É altura de definir a orientação estratégica para os próximos meses.',
    imageHint: 'Vista aérea da herdade ao amanhecer',
    choices: ['Com rigor e disciplina.', 'Com abertura à inovação.', 'À maneira tradicional.', 'Conforme as circunstâncias.'],
    consequences: [
      'Nova época orientada com rigor e disciplina.',
      'Nova época marcada pela abertura à inovação.',
      'Nova época conduzida à maneira tradicional.',
      'Nova época a decorrer conforme as circunstâncias.',
    ],
    important: true,
  },
  {
    id: 'ge_02',
    title: 'Escassez de Forragem',
    category: 'Gestão',
    description: 'As reservas de feno estão a terminar mais cedo do que o previsto. O Inverno ainda tem dois meses. Precisamos de tomar uma decisão.',
    imageHint: 'Celeiro com reservas a diminuir',
    choices: ['Comprar feno de emergência.', 'Reduzir a alimentação gradualmente.', 'Transferir animais para pastagem.', 'Aguardar e monitorizar.'],
    consequences: [
      'Feno de emergência adquirido. Reservas repostas com custo adicional.',
      'Alimentação reduzida gradualmente. Animais em monitorização.',
      'Animais transferidos para pastagem disponível.',
      'Situação monitorizada. Decisão adiada.',
    ],
    important: true,
  },
  {
    id: 'ge_03',
    title: 'Expansão das Instalações',
    category: 'Gestão',
    description: 'O Manuel sugere ampliar o Cercado Sul antes do Verão. O custo é elevado mas a necessidade é real com o aumento do efectivo.',
    imageHint: 'Planta de arquitectura do cercado',
    choices: ['Aprovar a obra.', 'Adiar para o próximo ano.', 'Pedir um orçamento mais detalhado.'],
    consequences: [
      'Obra aprovada. Ampliação do Cercado Sul iniciada.',
      'Obra adiada para o próximo ano.',
      'Orçamento mais detalhado solicitado ao Manuel.',
    ],
    important: true,
  },

  // ── Evento ────────────────────────────────────────────────────────────────
  {
    id: 'ev_01',
    title: 'Convite para Festival Taurino',
    category: 'Evento',
    description: 'O Festival Taurino de Évora convida a Herdade da Ferraria a participar com dois toiros de elite. A visibilidade seria enorme.',
    imageHint: 'Cartaz do Festival Taurino de Évora',
    choices: ['Aceitar com entusiasmo.', 'Aceitar com reservas.', 'Declinar educadamente.'],
    consequences: [
      'Participação confirmada com entusiasmo. Dois toiros de elite seleccionados.',
      'Participação confirmada com reservas. Condições a verificar.',
      'Convite declinado com cortesia.',
    ],
    important: true,
  },
  {
    id: 'ev_02',
    title: 'Pedido de Reportagem',
    category: 'Evento',
    description: 'Uma produtora de televisão quer filmar um documentário sobre a vida numa ganaderia portuguesa. Passariam três dias na herdade.',
    imageHint: 'Câmara de filmagem e equipa técnica',
    choices: ['Aceitar.', 'Aceitar com condições.', 'Recusar.'],
    consequences: [
      'Reportagem aceite. Equipa de filmagem prevista para breve.',
      'Reportagem aceite com condições definidas.',
      'Reportagem recusada.',
    ],
  },
  {
    id: 'ev_03',
    title: 'Visita de Ganadeiros',
    category: 'Evento',
    description: 'Um grupo de ganadeiros de Castilla y León quer visitar a herdade na próxima semana. Seriam oito pessoas por dois dias.',
    imageHint: 'Grupo de ganadeiros em visita',
    choices: ['Receber com toda a hospitalidade.', 'Receber de forma simples.', 'Adiar a visita.', 'Recusar.'],
    consequences: [
      'Visita acolhida com toda a hospitalidade.',
      'Visita acolhida de forma simples e cordial.',
      'Visita adiada para data mais conveniente.',
      'Visita recusada.',
    ],
  },

  // ── Pessoal ───────────────────────────────────────────────────────────────
  {
    id: 'pe_01',
    title: 'Reforma de Campino',
    category: 'Pessoal',
    description: 'O António, campino há 28 anos na herdade, pediu a reforma. Merece uma saída digna. Como devemos honrar a sua dedicação?',
    imageHint: 'Campino mais velho com cavalo',
    choices: ['Oferecer uma reforma generosa.', 'Reforma standard.', 'Pedir que fique mais um ano.'],
    consequences: [
      'O António recebeu uma reforma generosa. Saiu com honra e gratidão.',
      'O António recebeu a reforma standard.',
      'O António concordou em ficar mais um ano.',
    ],
    important: true,
  },
  {
    id: 'pe_02',
    title: 'Novo Campino',
    category: 'Pessoal',
    description: 'O Manuel traz um jovem de Coruche que quer aprender o ofício. Tem boas referências mas sem experiência com toiros bravos.',
    imageHint: 'Jovem campino junto ao cercado',
    choices: ['Contratar imediatamente.', 'Período de experiência de um mês.', 'Recusar.', 'Pedir mais referências.'],
    consequences: [
      'Jovem campino contratado de imediato.',
      'Período de experiência iniciado. Avaliação em curso.',
      'Candidato recusado.',
      'Pedidas mais referências ao Manuel.',
    ],
  },
  {
    id: 'pe_03',
    title: 'Pedido de Aumento',
    category: 'Pessoal',
    description: 'Três campinos pediram um aumento de salário. Alegam que os custos de vida subiram e que a herdade tem tido bons resultados.',
    imageHint: 'Campinos reunidos junto ao escritório',
    choices: ['Conceder o aumento.', 'Conceder aumento parcial.', 'Recusar.', 'Adiar a decisão.'],
    consequences: [
      'Aumento concedido na totalidade. Campinos satisfeitos.',
      'Aumento parcial concedido.',
      'Pedido de aumento recusado.',
      'Decisão adiada. Campinos aguardam resposta.',
    ],
    important: true,
  },
];

let _decisionCounter = 0;

export function pickDecision(excludeIds: string[] = []): Decision {
  const available = DECISION_POOL.filter(d => !excludeIds.includes(d.id));
  const pool = available.length > 0 ? available : DECISION_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const OPENING_DECISION: Decision = DECISION_POOL.find(d => d.id === 'ge_01')!;

export function nextDecisionInstanceId(): string {
  return `dec-${++_decisionCounter}-${Date.now()}`;
}
