import React, { useState, useMemo } from 'react';
import { Animal, AnimalCategory } from '../types/animal';
import { useGameState } from '../store/gameState';
import AnimalCard from '../components/AnimalCard';
import AnimalDetailPanel from '../components/AnimalDetailPanel';

type FilterKey =
  | 'todos'
  | 'machos'
  | 'femeas'
  | 'sementais'
  | 'vacas'
  | 'novilhas'
  | 'prontos'
  | 'aprovados'
  | 'rejeitados';

type SortKey = 'name' | 'age' | 'bravery' | 'weight' | 'bloodline';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'machos', label: 'Machos' },
  { key: 'femeas', label: 'Fêmeas' },
  { key: 'sementais', label: 'Sementais' },
  { key: 'vacas', label: 'Vacas' },
  { key: 'novilhas', label: 'Novilhas' },
  { key: 'prontos', label: 'Prontos para Corrida' },
  { key: 'aprovados', label: 'Aprovados' },
  { key: 'rejeitados', label: 'Rejeitados' },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Nome' },
  { key: 'age', label: 'Idade' },
  { key: 'bravery', label: 'Bravura' },
  { key: 'weight', label: 'Peso' },
  { key: 'bloodline', label: 'Casta' },
];

function applyFilter(animal: Animal, filter: FilterKey): boolean {
  switch (filter) {
    case 'todos': return true;
    case 'machos': return animal.sex === 'Macho';
    case 'femeas': return animal.sex === 'Fêmea';
    case 'sementais': return animal.category === 'Semental';
    case 'vacas': return animal.category === 'Vaca';
    case 'novilhas': return animal.category === 'Novilha' || animal.category === 'Bezerra' || animal.category === 'Novilho';
    case 'prontos': return animal.category === 'Macho de Corrida' && animal.status === 'Ativo';
    case 'aprovados': return animal.approvedForBreeding;
    case 'rejeitados': return animal.rejected;
  }
}

function applySort(a: Animal, b: Animal, sort: SortKey): number {
  switch (sort) {
    case 'name': return a.name.localeCompare(b.name);
    case 'age': return b.exactAgeMonths - a.exactAgeMonths;
    case 'bravery': return b.bravery - a.bravery;
    case 'weight': return b.weight - a.weight;
    case 'bloodline': return a.bloodline.localeCompare(b.bloodline);
  }
}

const EfetivoScreen: React.FC = () => {
  const { state } = useGameState();
  const allAnimals = state.animals;

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('todos');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const animalById = useMemo(() => {
    const map: Record<string, Animal> = {};
    allAnimals.forEach(a => { map[a.id] = a; });
    return map;
  }, [allAnimals]);

  const categoryCounters = useMemo(() => ({
    total: allAnimals.length,
    Semental: allAnimals.filter(a => a.category === 'Semental').length,
    Vaca: allAnimals.filter(a => a.category === 'Vaca').length,
    Novilha: allAnimals.filter(a => a.category === 'Novilha' || a.category === 'Bezerra' || a.category === 'Novilho').length,
    'Macho de Corrida': allAnimals.filter(a => a.category === 'Macho de Corrida' || a.category === 'Utrero').length,
    Cabresto: allAnimals.filter(a => a.category === 'Cabresto').length,
  } satisfies Record<AnimalCategory | 'total' | 'Novilha', number>), [allAnimals]);

  const filtered = useMemo(() => {
    return allAnimals
      .filter(a => applyFilter(a, activeFilter))
      .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => applySort(a, b, sortKey));
  }, [allAnimals, search, activeFilter, sortKey]);

  const selected = selectedId ? animalById[selectedId] : null;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-leather-900">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-leather-700/40 bg-leather-900/80 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gold tracking-widest uppercase">Efetivo</h2>
            <p className="text-ivory/50 text-sm font-body mt-0.5">Gestão do efetivo da Herdade da Ferraria</p>
          </div>
          {/* Summary chips */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {[
              { label: 'Total', value: categoryCounters.total, color: 'border-gold/30 text-gold' },
              { label: 'Sementais', value: categoryCounters.Semental, color: 'border-amber-600/30 text-amber-400' },
              { label: 'Vacas', value: categoryCounters.Vaca, color: 'border-rose-600/30 text-rose-300' },
              { label: 'Novilhas', value: categoryCounters.Novilha, color: 'border-emerald-600/30 text-emerald-300' },
              { label: 'Corrida', value: categoryCounters['Macho de Corrida'], color: 'border-leather-500/50 text-ivory/60' },
              { label: 'Cabrestos', value: categoryCounters.Cabresto, color: 'border-leather-500/50 text-ivory/60' },
            ].map(chip => (
              <div key={chip.label} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-body ${chip.color}`}>
                <span className="font-display font-semibold">{chip.value}</span>
                <span className="opacity-70">{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-3 border-b border-leather-700/30 bg-leather-900/60 shrink-0 space-y-3">
        {/* Search + Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar animal..."
              className="w-full bg-leather-800/60 border border-leather-600/50 rounded-md pl-9 pr-4 py-2 text-ivory/90 text-sm font-body placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-gold transition-colors text-sm"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-ivory/40 text-xs font-body uppercase tracking-wider">Ordenar:</span>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="bg-leather-800/60 border border-leather-600/50 rounded-md px-3 py-2 text-ivory/80 text-sm font-body focus:outline-none focus:border-gold/50 transition-colors"
            >
              {SORTS.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-ivory/40 text-xs font-body">
            {filtered.length} de {allAnimals.length} animais
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-body border transition-all duration-150
                ${activeFilter === f.key
                  ? 'bg-gold/20 border-gold/50 text-gold'
                  : 'bg-leather-800/40 border-leather-600/40 text-ivory/60 hover:border-gold/30 hover:text-ivory/80'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-ivory/30 text-4xl mb-3">🐂</p>
              <p className="text-ivory/50 font-display text-lg tracking-wider">Nenhum animal encontrado</p>
              <p className="text-ivory/30 text-sm font-body mt-1">Tente ajustar os filtros ou a pesquisa</p>
            </div>
          ) : (
            <div className={`grid gap-3 ${selected ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}`}>
              {filtered.map(animal => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  isSelected={animal.id === selectedId}
                  onClick={() => setSelectedId(animal.id === selectedId ? null : animal.id)}
                  fatherName={animal.fatherId ? animalById[animal.fatherId]?.name : undefined}
                  motherName={animal.motherId ? animalById[animal.motherId]?.name : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 shrink-0 overflow-hidden">
            <AnimalDetailPanel
              animal={selected}
              fatherName={selected.fatherId ? animalById[selected.fatherId]?.name : undefined}
              motherName={selected.motherId ? animalById[selected.motherId]?.name : undefined}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EfetivoScreen;
