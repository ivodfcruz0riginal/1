import React from 'react';
import { useGameState, MONTHS } from '../../store/gameState';
import type { Month } from '../../store/gameState';
import { SectionTitle, Pill } from './OfficePrimitives';

interface ArticleTemplate {
  id: string;
  category: string;
  headline: string;
  subheadline?: string;
  body: string;
  featured?: boolean;
}

// Pool of 20 article templates — dates are derived from game state at render time
const ARTICLE_POOL: ArticleTemplate[] = [
  {
    id: 'a01',
    category: 'Tourada',
    headline: 'Ganaderias Portuguesas Conquistam Praças Espanholas',
    subheadline: 'Temporada promete ser histórica para os criadores nacionais',
    body: 'A presença das ganaderias lusas nas principais praças de Espanha tem crescido de forma notável. A qualidade do touro bravo criado no Alentejo é hoje reconhecida pelos mais exigentes empresários taurinos de Sevilha e Madrid.',
    featured: true,
  },
  {
    id: 'a02',
    category: 'Regulamentação',
    headline: 'Nova Regulamentação de Bem-Estar Animal Entra em Vigor',
    body: 'A Federação Portuguesa de Tauromaquia publicou novas regras de maneio dos efetivos bravos. Os criadores terão seis meses para adaptar as suas instalações aos novos requisitos mínimos.',
  },
  {
    id: 'a03',
    category: 'Mercado',
    headline: 'Subsídios Agrícolas Aumentam para Criadores de Touro Bravo',
    body: 'O governo anunciou um aumento nos apoios à criação de gado bravo. A medida visa preservar uma actividade secular que é parte fundamental do património cultural do Alentejo e do Ribatejo.',
  },
  {
    id: 'a04',
    category: 'Agenda',
    headline: 'Calendário Taurino: As Corridas a Não Perder Esta Temporada',
    body: 'A temporada conta com cartazes de excepção nas principais praças portuguesas e espanholas. Lisboa, Évora, a Moita e Santarém prometem espectáculos memoráveis.',
  },
  {
    id: 'a05',
    category: 'Criação',
    headline: 'Tentaderos: A Selecção Rigorosa que Garante a Qualidade',
    body: 'Nos tentaderos das grandes ganaderias alentejanas, a selecção da futura classe é feita com rigor e profundo conhecimento da raça. Uma arte transmitida de geração em geração.',
  },
  {
    id: 'a06',
    category: 'Criação',
    headline: 'A Linha Genética que Define o Touro de Hoje',
    body: 'Os encerros do sul continuam a produzir animais de excepção. A combinação de pastagem alentejana com décadas de selecção rigorosa resulta em touros de nobre raça e temperamento único.',
  },
  {
    id: 'a07',
    category: 'Mercado',
    headline: 'Preços no Mercado de Touros Bravas Mantêm Tendência de Alta',
    body: 'Os valores praticados nas negociações entre ganaderias e empresas taurinas registam nova subida. A escassez de touros de primera classe e o crescimento das praças de categoria impulsionam os preços.',
  },
  {
    id: 'a08',
    category: 'Tourada',
    headline: 'Corrida Extraordinária em Évora Bate Recordes de Bilheteira',
    body: 'A praça de Évora recebeu uma das mais memoráveis corridas dos últimos anos. O comportamento exemplar dos touros e a bravura demonstrada na arena entusiasmaram o exigente público alentejano.',
  },
  {
    id: 'a09',
    category: 'Agenda',
    headline: 'Feira Nacional da Criação de Gado Bravo Aproxima-se',
    body: 'A feira anual reúne os principais criadores nacionais para exposição e negociação de efectivos. A participação de compradores espanhóis e franceses valoriza o evento que este ano atinge a sua décima edição.',
  },
  {
    id: 'a10',
    category: 'Regulamentação',
    headline: 'Associação Nacional de Criadores Debate Novas Normas de Identificação',
    body: 'A rastreabilidade dos efectivos bravos ganha importância crescente. As novas regras propostas visam garantir maior transparência no mercado e proteger a certificação de origem dos touros portugueses.',
  },
  {
    id: 'a11',
    category: 'Criação',
    headline: 'Primavera Favorável Anuncia Boa Época de Partos',
    body: 'As condições climáticas benignas e as pastagens em excelente estado auguram um período de partos sem problemas. Os veterinários das principais ganaderias apontam para índices de natalidade acima da média.',
  },
  {
    id: 'a12',
    category: 'Tourada',
    headline: 'Novilhos Alentejanos Impressionam na Temporada Espanhola',
    body: 'Os novilhos oriundos das herdades do Alentejo têm causado sensação nas praças de menor dimensão em Espanha. A sua bravura e conformação física são elogiadas pela crítica taurina especializada.',
  },
  {
    id: 'a13',
    category: 'Mercado',
    headline: 'Exportações de Touro Bravo Crescem Para Novos Mercados',
    body: 'Além de Espanha, mercados como a França e o México começam a mostrar interesse crescente no touro bravo de origem portuguesa. Os criadores nacionais exploram novas parcerias comerciais internacionais.',
  },
  {
    id: 'a14',
    category: 'Criação',
    headline: 'Alimentação Suplementar no Inverno: Estratégias das Ganaderias',
    body: 'Com a escassez de pasto nas épocas mais frias, os criadores adoptam soluções diversificadas para manter o efectivo em boa condição. A feno prensado e os concentrados proteicos ganham cada vez mais espaço.',
  },
  {
    id: 'a15',
    category: 'Agenda',
    headline: 'Temporada de Outono Traz Corridas de Grande Prestígio',
    body: 'O mês de Outubro concentra algumas das corridas mais aguardadas do calendário taurino. As empresas de Lisboa e Setúbal preparam cartazes de excepção com a participação das mais conceituadas ganaderias.',
  },
  {
    id: 'a16',
    category: 'Tourada',
    headline: 'Debate Sobre o Futuro da Tauromaquia Reúne Especialistas',
    body: 'Criadores, toreiros e críticos taurinos reuniram-se para debater os desafios da actividade. A preservação das raças, a viabilidade económica das ganaderias e o interesse do público jovem foram os temas centrais.',
  },
  {
    id: 'a17',
    category: 'Regulamentação',
    headline: 'Veterinários Certificados Passam a Acompanhar Todos os Efectivos',
    body: 'A nova legislação obriga à presença de veterinário habilitado em todas as explorações com efectivo bravo. A medida visa elevar os padrões sanitários e assegurar o bem-estar dos animais em todo o território nacional.',
  },
  {
    id: 'a18',
    category: 'Criação',
    headline: 'A Arte do Tentadero: Tradição e Ciência ao Serviço da Selecção',
    body: 'O tentadero continua a ser o momento mais revelador da vida de um animal bravo. É nos currais de prova que a qualidade da criação se confirma e o futuro da ganaderia se define para os anos vindouros.',
  },
  {
    id: 'a19',
    category: 'Mercado',
    headline: 'Touros de Segunda Linha Encontram Mercado nas Praças de Categoria B',
    body: 'Os animais que não alcançam os requisitos das grandes praças encontram escoamento nas corridas de categoria inferior. Este segmento crescente do mercado oferece oportunidades para as ganaderias de dimensão média.',
  },
  {
    id: 'a20',
    category: 'Agenda',
    headline: 'Concurso de Ganaderías Premeia os Melhores Criadores do País',
    body: 'A cerimónia anual de entrega de prémios às melhores ganaderías nacionais reúne a elite da criação de touro bravo. O reconhecimento público é um estímulo fundamental para a manutenção dos altos padrões da raça.',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Tourada: 'red',
  Regulamentação: 'amber',
  Mercado: 'green',
  Agenda: 'sky',
  Criação: 'gold',
};

const categoryVariant = (cat: string) => (CATEGORY_COLORS[cat] as 'red' | 'amber' | 'green' | 'sky' | 'gold') ?? 'muted';

// Derive a display date N months before the current game date
function dateNMonthsAgo(month: Month, year: number, n: number): string {
  const idx = MONTHS.indexOf(month);
  const targetIdx = ((idx - n) % 12 + 12) % 12;
  const yearOffset = Math.floor((idx - n) / 12);
  const targetYear = year + (idx - n < 0 ? Math.floor((idx - n) / 12) : yearOffset);
  return `${MONTHS[targetIdx]} ${targetYear}`;
}

// Pick 5 articles from the pool cycling based on simulated months, always starting fresh
function pickArticles(simulatedMonths: number): ArticleTemplate[] {
  const offset = (simulatedMonths * 3) % ARTICLE_POOL.length;
  const result: ArticleTemplate[] = [];
  for (let i = 0; i < 5; i++) {
    result.push(ARTICLE_POOL[(offset + i) % ARTICLE_POOL.length]);
  }
  // Ensure first article is marked featured, rest are not
  return result.map((a, i) => ({ ...a, featured: i === 0 }));
}

interface ArticleWithDate extends ArticleTemplate {
  date: string;
}

const FeaturedArticle: React.FC<{ article: ArticleWithDate }> = ({ article }) => (
  <div className="relative bg-leather-800/50 border border-gold/20 rounded-lg overflow-hidden mb-4 hover:border-gold/40 transition-colors">
    <div className="h-40 bg-gradient-to-br from-leather-700/60 via-amber-950/40 to-leather-900/80 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-leather-900/80 to-transparent" />
      <div className="text-6xl opacity-15">🐂</div>
      <div className="absolute bottom-3 left-4 right-4">
        <div className="flex items-center gap-2 mb-1">
          <Pill label={article.category} variant={categoryVariant(article.category)} />
          <span className="text-ivory/30 text-[10px] font-body">{article.date}</span>
        </div>
        <h3 className="font-display text-base text-ivory tracking-wide leading-tight">{article.headline}</h3>
        {article.subheadline && (
          <p className="text-ivory/60 text-xs font-body mt-1">{article.subheadline}</p>
        )}
      </div>
    </div>
    <div className="p-4">
      <p className="text-ivory/70 text-sm font-body leading-relaxed">{article.body}</p>
    </div>
  </div>
);

const ArticleCard: React.FC<{ article: ArticleWithDate }> = ({ article }) => (
  <div className="bg-leather-800/30 border border-leather-700/30 rounded-lg p-4 hover:border-gold/20 hover:bg-leather-800/50 transition-all duration-200">
    <div className="flex items-start gap-3">
      <div className="w-16 h-16 shrink-0 rounded bg-leather-700/50 border border-leather-600/30 flex items-center justify-center overflow-hidden">
        <span className="text-2xl opacity-20">🐂</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Pill label={article.category} variant={categoryVariant(article.category)} />
          <span className="text-ivory/25 text-[10px] font-body">{article.date}</span>
        </div>
        <h4 className="font-display text-sm text-gold/90 tracking-wide leading-snug mb-1">{article.headline}</h4>
        <p className="text-ivory/55 text-xs font-body leading-relaxed line-clamp-2">{article.body}</p>
      </div>
    </div>
  </div>
);

const JornalTab: React.FC = () => {
  const { state } = useGameState();

  const articles: ArticleWithDate[] = pickArticles(state.simulatedMonths).map((a, i) => ({
    ...a,
    date: dateNMonthsAgo(state.month, state.year, i),
  }));

  const featured = articles.find(a => a.featured);
  const rest = articles.filter(a => !a.featured);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-baseline justify-between mb-4 shrink-0">
        <SectionTitle>Jornal Taurino</SectionTitle>
        <span className="text-ivory/25 text-[10px] font-body ml-4">
          {state.month} {state.year}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {featured && <FeaturedArticle article={featured} />}
        {rest.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  );
};

export default JornalTab;
