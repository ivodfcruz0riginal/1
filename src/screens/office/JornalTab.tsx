import React from 'react';
import { useGameState } from '../../store/gameState';
import { SectionTitle, Pill } from './OfficePrimitives';

interface Article {
  id: string;
  date: string;
  category: string;
  headline: string;
  subheadline?: string;
  body: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: 'a1',
    date: 'Março 1985',
    category: 'Tourada',
    headline: 'Ganaderias Portuguesas Conquistam Praças Espanholas',
    subheadline: 'Temporada de 1985 promete ser histórica para os criadores nacionais',
    body: 'A presença das ganaderias lusas nas principais praças de Espanha tem crescido de forma notável. A qualidade do touro bravo criado no Alentejo é hoje reconhecida pelos mais exigentes empresários taurinos de Sevilha e Madrid.',
    featured: true,
  },
  {
    id: 'a2',
    date: 'Março 1985',
    category: 'Regulamentação',
    headline: 'Nova Regulamentação de Bem-Estar Animal Entra em Vigor',
    body: 'A Federação Portuguesa de Tauromaquia publicou novas regras de maneio dos efetivos bravos. Os criadores terão seis meses para adaptar as suas instalações aos novos requisitos mínimos.',
  },
  {
    id: 'a3',
    date: 'Fevereiro 1985',
    category: 'Mercado',
    headline: 'Subsídios Agrícolas Aumentam 15% para Criadores de Touro Bravo',
    body: 'O governo anunciou um aumento de 15% nos apoios à criação de gado bravo. A medida visa preservar uma actividade secular que é parte fundamental do património cultural do Alentejo e do Ribatejo.',
  },
  {
    id: 'a4',
    date: 'Janeiro 1985',
    category: 'Agenda',
    headline: 'Calendário Taurino 1985: As Corridas a Não Perder',
    body: 'A temporada de 1985 conta com cartazes de excepção nas principais praças portuguesas e espanholas. Lisboa, Évora, a Moita e Santarém prometem espectáculos memoráveis.',
  },
  {
    id: 'a5',
    date: 'Dezembro 1984',
    category: 'Criação',
    headline: 'Tentaderos: A Selecção Rigorosa que Garante a Qualidade',
    body: 'Nos tentaderos das grandes ganaderias alentejanas, a selecção da futura classe é feita com rigor e profundo conhecimento da raça. Uma arte transmitida de geração em geração.',
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

const FeaturedArticle: React.FC<{ article: Article }> = ({ article }) => (
  <div className="relative bg-leather-800/50 border border-gold/20 rounded-lg overflow-hidden mb-4 hover:border-gold/40 transition-colors">
    {/* Image placeholder */}
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

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
  <div className="bg-leather-800/30 border border-leather-700/30 rounded-lg p-4 hover:border-gold/20 hover:bg-leather-800/50 transition-all duration-200">
    <div className="flex items-start gap-3">
      {/* Image placeholder */}
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
  const featured = ARTICLES.find(a => a.featured);
  const rest = ARTICLES.filter(a => !a.featured);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-baseline justify-between mb-4 shrink-0">
        <SectionTitle>Gazeta Taurina</SectionTitle>
        <span className="text-ivory/25 text-[10px] font-body ml-4">
          {state.month} {state.year}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {featured && <FeaturedArticle article={featured} />}
        {rest.map(a => <ArticleCard key={a.id} article={a} />)}
        <div className="text-center py-4">
          <p className="text-ivory/15 text-xs font-body italic">Mais edições em breve</p>
        </div>
      </div>
    </div>
  );
};

export default JornalTab;
