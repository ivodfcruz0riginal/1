import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../store/gameState';
import { formatEuro, lastNMonths } from '../store/economyEngine';
import EconomyScreen from './EconomyScreen';

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabKey = 'diario' | 'jornal' | 'economia' | 'calendario' | 'convites' | 'contratos' | 'livro' | 'estatisticas';

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'diario',        icon: '📋', label: 'Diário' },
  { key: 'jornal',        icon: '📰', label: 'Jornal' },
  { key: 'economia',      icon: '💰', label: 'Economia' },
  { key: 'calendario',    icon: '📅', label: 'Calendário' },
  { key: 'convites',      icon: '✉️',  label: 'Convites' },
  { key: 'contratos',     icon: '📜', label: 'Contratos' },
  { key: 'livro',         icon: '📖', label: 'Livro da Casa' },
  { key: 'estatisticas',  icon: '📊', label: 'Estatísticas' },
];

// ── Diário tab ────────────────────────────────────────────────────────────────

const DiarioTab: React.FC = () => {
  const { state } = useGameState();
  const { eventLog } = state;

  return (
    <div className="space-y-2 overflow-y-auto flex-1">
      {eventLog.length === 0 ? (
        <p className="text-ivory/30 text-sm font-body text-center py-12">Sem entradas no diário.</p>
      ) : (
        eventLog.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
              idx === 0
                ? 'bg-gold/8 border-gold/25'
                : 'bg-leather-800/30 border-leather-700/30 hover:bg-leather-800/50'
            }`}
          >
            <div className="shrink-0 text-right">
              <p className="text-gold/70 text-[10px] font-body uppercase tracking-wider">{item.month.slice(0, 3)}</p>
              <p className="text-ivory/50 text-xs font-display">{item.year}</p>
            </div>
            <div className="w-px self-stretch bg-leather-600/40 shrink-0" />
            <p className={`text-sm font-body leading-relaxed ${idx === 0 ? 'text-ivory' : 'text-ivory/80'}`}>
              {item.text}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

// ── Jornal tab ────────────────────────────────────────────────────────────────

const JORNAL_ITEMS = [
  { date: 'Mar 1985', title: 'Ganaderia portuguesa destaca-se em Sevilha', body: 'A presença lusa nas praças espanholas cresce a cada temporada.' },
  { date: 'Fev 1985', title: 'Novo regulamento de bem-estar animal aprovado', body: 'A federação taurina publicou novas regras de maneio dos efetivos.' },
  { date: 'Jan 1985', title: 'Época taurina de 1985 promete ser histórica', body: 'Várias ganaderias já confirmaram presença nos principais cartazes.' },
  { date: 'Dez 1984', title: 'Subsídios agrícolas para criadores aumentados', body: 'O governo amplia o apoio à criação de touro bravo no Alentejo.' },
];

const JornalTab: React.FC = () => (
  <div className="space-y-3 overflow-y-auto flex-1">
    {JORNAL_ITEMS.map((item, i) => (
      <div key={i} className="bg-leather-800/30 border border-leather-700/30 rounded-lg p-4 hover:border-gold/20 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-ivory/30 text-xs font-body">{item.date}</span>
          <div className="h-px flex-1 bg-leather-600/30" />
        </div>
        <h4 className="font-display text-sm text-gold/90 tracking-wide mb-1">{item.title}</h4>
        <p className="text-ivory/60 text-xs font-body leading-relaxed">{item.body}</p>
      </div>
    ))}
    <div className="text-center py-4">
      <p className="text-ivory/20 text-xs font-body">Mais notícias em breve</p>
    </div>
  </div>
);

// ── Calendário tab ────────────────────────────────────────────────────────────

const CALENDAR_EVENTS = [
  { date: '15 Mar 1985', type: 'Tienta', title: 'Tienta — Cercado Norte', icon: '🎯' },
  { date: '18 Mar 1985', type: 'Corrida', title: 'Corrida de Touros — Lisboa', icon: '🏟️' },
  { date: '22 Mar 1985', type: 'Leilão', title: 'Leilão — Évora', icon: '💰' },
  { date: '25 Mar 1985', type: 'Reprodução', title: 'Início da Temporada de Reprodução', icon: '❤️' },
  { date: '10 Abr 1985', type: 'Corrida', title: 'Corrida de Touros — Moita', icon: '🏟️' },
  { date: '20 Abr 1985', type: 'Visita', title: 'Visita de Ganadeiro Espanhol', icon: '🤝' },
];

const typeColors: Record<string, string> = {
  Tienta: 'border-amber-500/40 text-amber-400',
  Corrida: 'border-red-500/40 text-red-400',
  Leilão: 'border-emerald-500/40 text-emerald-400',
  Reprodução: 'border-rose-500/40 text-rose-400',
  Visita: 'border-sky-500/40 text-sky-400',
};

const CalendarioTab: React.FC = () => (
  <div className="space-y-2 overflow-y-auto flex-1">
    {CALENDAR_EVENTS.map((ev, i) => (
      <div key={i} className="flex items-center gap-4 p-3 bg-leather-800/30 border border-leather-700/30 rounded-lg hover:border-gold/20 transition-colors">
        <span className="text-xl shrink-0">{ev.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-ivory/90 text-sm font-body truncate">{ev.title}</p>
          <p className="text-ivory/40 text-xs font-body mt-0.5">{ev.date}</p>
        </div>
        <span className={`text-[10px] font-body px-2 py-0.5 rounded-full border shrink-0 ${typeColors[ev.type] ?? 'border-leather-500/40 text-ivory/50'}`}>
          {ev.type}
        </span>
      </div>
    ))}
  </div>
);

// ── Convites tab ──────────────────────────────────────────────────────────────

const CONVITES = [
  { from: 'Praça de Touros de Lisboa', date: 'Jun 1985', desc: 'Corrida de gala. Dois toiros da ganaderia.', status: 'Pendente' },
  { from: 'Ganadería San Marcos (Sevilha)', date: 'Abr 1985', desc: 'Convite para tienta cruzada.', status: 'Pendente' },
  { from: 'Município de Évora', date: 'Mai 1985', desc: 'Corrida de Festas da Cidade.', status: 'Aceite' },
];

const ConvitesTab: React.FC = () => (
  <div className="space-y-3 overflow-y-auto flex-1">
    {CONVITES.map((c, i) => (
      <div key={i} className="bg-leather-800/30 border border-leather-700/30 rounded-lg p-4 hover:border-gold/20 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-gold/80 text-sm font-display tracking-wide truncate">{c.from}</p>
            <p className="text-ivory/60 text-xs font-body mt-1 leading-relaxed">{c.desc}</p>
            <p className="text-ivory/30 text-[10px] font-body mt-1">{c.date}</p>
          </div>
          <span className={`text-[10px] font-body px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${
            c.status === 'Aceite' ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400'
          }`}>
            {c.status}
          </span>
        </div>
      </div>
    ))}
    {CONVITES.length === 0 && (
      <p className="text-ivory/30 text-sm font-body text-center py-12">Nenhum convite pendente.</p>
    )}
  </div>
);

// ── Livro da Casa tab ─────────────────────────────────────────────────────────

const LivroTab: React.FC = () => {
  const { state } = useGameState();
  return (
    <div className="space-y-4 overflow-y-auto flex-1">
      <div className="bg-leather-800/30 border border-leather-700/30 rounded-lg p-4">
        <h4 className="font-display text-xs text-gold/70 uppercase tracking-widest mb-3">Fundação</h4>
        <p className="text-ivory/70 text-sm font-body leading-relaxed">
          A Herdade da Ferraria foi fundada em 1947 na Província do Alentejo. Com 1.250 hectares,
          a ganaderia dedica-se à criação de touro bravo das mais nobres castas portuguesas e espanholas.
          Em {state.year}, o efetivo conta com {state.animals.length} animais.
        </p>
      </div>
      <div className="bg-leather-800/30 border border-leather-700/30 rounded-lg p-4">
        <h4 className="font-display text-xs text-gold/70 uppercase tracking-widest mb-3">Castas Presentes</h4>
        <div className="flex flex-wrap gap-2">
          {['Miura', 'Pablo Romero', 'Concha y Sierra', 'Cruzado'].map(b => (
            <span key={b} className="text-xs font-body text-ivory/70 px-3 py-1 bg-leather-700/40 border border-leather-600/30 rounded-full">
              {b}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-leather-800/30 border border-leather-700/30 rounded-lg p-4">
        <h4 className="font-display text-xs text-gold/70 uppercase tracking-widest mb-3">Marcos Históricos</h4>
        <div className="space-y-2">
          {[
            { year: 1947, text: 'Fundação da Herdade da Ferraria.' },
            { year: 1952, text: 'Primeira corrida com animais da ganaderia em Lisboa.' },
            { year: 1968, text: 'Introdução da casta Miura no efetivo.' },
            { year: 1975, text: 'Maior temporada da história: 24 toiros lidados.' },
            { year: 1985, text: 'Nova geração de sementais assume o protagonismo.' },
          ].map((m, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-gold/50 font-display text-xs w-10 shrink-0">{m.year}</span>
              <p className="text-ivory/60 text-xs font-body leading-relaxed">{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Estatísticas tab ──────────────────────────────────────────────────────────

const EstatisticasTab: React.FC = () => {
  const { state } = useGameState();
  const { animals, economy } = state;

  const active = animals.filter(a => a.status === 'Ativo').length;
  const machos = animals.filter(a => a.sex === 'Macho' && a.status !== 'Morto' && a.status !== 'Vendido').length;
  const femeas = animals.filter(a => a.sex === 'Fêmea' && a.status !== 'Morto' && a.status !== 'Vendido').length;
  const avgBravery = animals.length > 0
    ? Math.round(animals.reduce((s, a) => s + a.bravery, 0) / animals.length)
    : 0;
  const last12 = lastNMonths(economy.history, 12);
  const totalIncome = last12.reduce((s, r) => s + r.income, 0);
  const totalExpenses = last12.reduce((s, r) => s + r.expenses, 0);

  return (
    <div className="space-y-4 overflow-y-auto flex-1">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total de Animais', value: animals.length, icon: '🐂' },
          { label: 'Animais Ativos', value: active, icon: '✅' },
          { label: 'Machos', value: machos, icon: '🐂' },
          { label: 'Fêmeas', value: femeas, icon: '🐄' },
          { label: 'Bravura Média', value: `${avgBravery}/100`, icon: '⚔️' },
          { label: 'Meses Registados', value: economy.history.length, icon: '📅' },
        ].map(s => (
          <div key={s.label} className="bg-leather-800/30 border border-leather-700/30 rounded-lg p-3 flex items-center gap-3">
            <span className="text-xl">{s.icon}</span>
            <div>
              <p className="text-ivory/40 text-[10px] font-body uppercase tracking-wider">{s.label}</p>
              <p className="font-display text-lg text-ivory">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      {last12.length > 0 && (
        <div className="bg-leather-800/30 border border-leather-700/30 rounded-lg p-4">
          <h4 className="font-display text-xs text-gold/70 uppercase tracking-widest mb-3">Últimos 12 Meses</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-l-2 border-emerald-500/40 pl-3">
              <p className="text-ivory/40 text-[10px] font-body uppercase">Receitas Totais</p>
              <p className="font-display text-base text-emerald-400">{formatEuro(totalIncome)}</p>
            </div>
            <div className="border-l-2 border-red-500/40 pl-3">
              <p className="text-ivory/40 text-[10px] font-body uppercase">Despesas Totais</p>
              <p className="font-display text-base text-red-400">{formatEuro(totalExpenses)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Contratos tab ─────────────────────────────────────────────────────────────

const CONTRATOS = [
  { title: 'Fornecimento de feno — Cooperativa do Alentejo', value: '1.200€/mês', status: 'Ativo', expires: 'Dez 1985' },
  { title: 'Serviços veterinários — Dr. António Ferreira', value: '800€/mês', status: 'Ativo', expires: 'Jun 1986' },
  { title: 'Transporte de animais — Transportes Ibéricos', value: 'Por viagem', status: 'Ativo', expires: 'Mar 1986' },
  { title: 'Seguro de efetivo — Seguradora Nacional', value: '2.400€/ano', status: 'Em renovação', expires: 'Abr 1985' },
];

const ContratosTab: React.FC = () => (
  <div className="space-y-3 overflow-y-auto flex-1">
    {CONTRATOS.map((c, i) => (
      <div key={i} className="bg-leather-800/30 border border-leather-700/30 rounded-lg p-4 hover:border-gold/20 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-ivory/90 text-sm font-body truncate">{c.title}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-gold/70 text-xs font-body">{c.value}</span>
              <span className="text-ivory/30 text-xs">·</span>
              <span className="text-ivory/40 text-[10px] font-body">Expira: {c.expires}</span>
            </div>
          </div>
          <span className={`text-[10px] font-body px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${
            c.status === 'Ativo' ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400'
          }`}>
            {c.status}
          </span>
        </div>
      </div>
    ))}
    <div className="text-center py-4">
      <p className="text-ivory/20 text-xs font-body">Gestão completa de contratos em breve</p>
    </div>
  </div>
);

// ── Main Screen ───────────────────────────────────────────────────────────────

const EscritorioScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('diario');
  const navigate = useNavigate();
  const { dismissNotification } = useGameState();

  // Dismiss escritório notification when entering this screen
  useEffect(() => {
    dismissNotification('escritorio');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-full flex flex-col overflow-hidden bg-leather-900">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-leather-700/40 bg-leather-900/80 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/herdade')}
            className="text-ivory/40 hover:text-gold transition-colors text-sm font-body flex items-center gap-1.5"
          >
            ← Herdade
          </button>
          <div className="h-4 w-px bg-leather-600/50" />
          <div>
            <h2 className="font-display text-2xl text-gold tracking-widest uppercase">Escritório</h2>
            <p className="text-ivory/50 text-sm font-body mt-0.5">Gestão da Herdade da Ferraria</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-6 border-b border-leather-700/30 bg-leather-900/60 shrink-0">
        <div className="flex items-end gap-0.5 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-body whitespace-nowrap border-b-2 transition-all duration-150 ${
                activeTab === tab.key
                  ? 'border-gold text-gold bg-gold/5'
                  : 'border-transparent text-ivory/50 hover:text-ivory/80 hover:border-leather-500/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        {activeTab === 'diario' && <DiarioTab />}
        {activeTab === 'jornal' && <JornalTab />}
        {activeTab === 'economia' && (
          <div className="flex-1 -m-6 overflow-hidden">
            <EconomyScreen />
          </div>
        )}
        {activeTab === 'calendario' && <CalendarioTab />}
        {activeTab === 'convites' && <ConvitesTab />}
        {activeTab === 'contratos' && <ContratosTab />}
        {activeTab === 'livro' && <LivroTab />}
        {activeTab === 'estatisticas' && <EstatisticasTab />}
      </div>
    </div>
  );
};

export default EscritorioScreen;
