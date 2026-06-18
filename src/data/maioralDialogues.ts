export interface DialogueTemplate {
  id: string;
  text: string;
  choices: string[];
}

export const GREETING_DIALOGUE: DialogueTemplate = {
  id: 'greet_start',
  text: 'Bom dia, patrão. Bem-vindo à Herdade da Ferraria. É uma honra servir a esta casa.',
  choices: ['Bom dia, Manuel.', 'Tem novidades para mim?', 'Que comece o trabalho.'],
};

const MONTHLY_DIALOGUES: DialogueTemplate[] = [
  {
    id: 'monthly_1',
    text: 'Passado mais um mês, patrão. A herdade segue o seu rumo.',
    choices: ['Muito bem.', 'Alguma preocupação?', 'Precisamos de falar sobre o efectivo.'],
  },
  {
    id: 'monthly_spring',
    text: 'A Primavera está a chegar. As pastagens estão a reviver. Bom tempo para os animais.',
    choices: ['Excelente notícia.', 'Aproveitemos a época.', 'Algum nascimento esperado?'],
  },
  {
    id: 'monthly_summer',
    text: 'O calor aperta, patrão. Os animais precisam de mais água e sombra.',
    choices: ['Trata disso.', 'Quantas reses têm acesso à aguada?', 'Obrigado pelo aviso.'],
  },
  {
    id: 'monthly_autumn',
    text: 'O Outono chegou. Altura de preparar o Inverno e garantir reservas de feno.',
    choices: ['Que tudo fique preparado.', 'As reservas estão garantidas?', 'Bem notado, Manuel.'],
  },
  {
    id: 'monthly_winter',
    text: 'O frio chegou. Os animais mais novos precisam de vigilância constante.',
    choices: ['Redobra a atenção.', 'Chama o veterinário para inspecção.', 'Entendido.'],
  },
];

const ANIMAL_DIALOGUES: DialogueTemplate[] = [
  {
    id: 'animal_1',
    text: 'O Bravio 18 anda demasiado agressivo. Convém vigiar de perto.',
    choices: ['Chama o veterinário.', 'Vou ver pessoalmente.', 'Que fique isolado.', 'Ignorar por agora.'],
  },
  {
    id: 'animal_2',
    text: 'As vacas do Cercado Sul estão muito tranquilas esta semana.',
    choices: ['Boa notícia.', 'Devemos aproveitar para a tienta?', 'Continuem a vigiar.'],
  },
  {
    id: 'animal_3',
    text: 'Nasceram dois vitelos no Cercado Norte. Os dois saudáveis, patrão.',
    choices: ['Excelente notícia.', 'Vamos registar no livro.', 'Que os vigiem de perto.'],
  },
  {
    id: 'animal_4',
    text: 'Um dos novilhos mostrou boa bravura no treino de ontem. Promissor.',
    choices: ['Promissor.', 'Marca-o para a próxima tienta.', 'Quero vê-lo trabalhar.'],
  },
  {
    id: 'animal_5',
    text: 'Um dos toiros do Cercado Norte está com pouco apetite. Pode ser coisa passageira.',
    choices: ['Chama o veterinário.', 'Vigiem durante dois dias.', 'Isola-o por precaução.'],
  },
];

const INFRA_DIALOGUES: DialogueTemplate[] = [
  {
    id: 'infra_1',
    text: 'A vedação do Cercado Norte precisa de reparação urgente. Há um troço cedido.',
    choices: ['Vou tratar disso.', 'Quanto custa a reparação?', 'Ignorar por agora.', 'Contrata quem for preciso.'],
  },
  {
    id: 'infra_2',
    text: 'O tentadero precisa de manutenção antes da próxima tienta.',
    choices: ['Trata disso.', 'Quando é a próxima tienta?', 'Deixa para depois.'],
  },
  {
    id: 'infra_3',
    text: 'O celeiro está com pouco espaço. Precisamos de organizar antes do Inverno.',
    choices: ['Que arranjem espaço.', 'Vejo isso mais tarde.', 'Quanto espaço falta?'],
  },
];

const NEWS_DIALOGUES: DialogueTemplate[] = [
  {
    id: 'news_1',
    text: 'Recebemos uma carta da Moita, patrão. Parece urgente.',
    choices: ['Quero ver primeiro.', 'O que diz?', 'Deixa em cima da secretária.'],
  },
  {
    id: 'news_2',
    text: 'Um ganadeiro espanhol perguntou pelos nossos sementais.',
    choices: ['Responde com interesse.', 'Não estamos disponíveis.', 'Marca uma reunião.'],
  },
  {
    id: 'news_3',
    text: 'O jornal de Lisboa mencionou a nossa ganaderia esta semana.',
    choices: ['Com bom ou mau tom?', 'Traz-me o jornal.', 'Que bom.'],
  },
  {
    id: 'news_4',
    text: 'Chegou um convite para corrida em Vila Franca de Xira no próximo mês.',
    choices: ['Aceitamos.', 'Precisamos de ver o calendário.', 'Recusamos por agora.'],
  },
  {
    id: 'news_5',
    text: 'O veterinário mandou dizer que pode visitar a herdade na próxima semana.',
    choices: ['Que venha.', 'Não é necessário por agora.', 'Combina para a semana a seguir.'],
  },
];

export const ALL_MONTHLY_POOL: DialogueTemplate[] = [
  ...MONTHLY_DIALOGUES,
  ...ANIMAL_DIALOGUES,
  ...INFRA_DIALOGUES,
  ...NEWS_DIALOGUES,
];

export function pickMonthlyDialogue(): DialogueTemplate {
  return ALL_MONTHLY_POOL[Math.floor(Math.random() * ALL_MONTHLY_POOL.length)];
}
