import type { Animal } from '../../types/animal';

/**
 * AnimalManager owns all animal data access and mutations.
 * Screens should call these methods instead of reading state.animals directly.
 * Logic migration from store/gameState.tsx planned for Alpha 0.3.
 */
export class AnimalManager {
  private animals: Animal[];

  constructor(animals: Animal[]) {
    this.animals = animals;
  }

  getAnimals(): Animal[] {
    return this.animals;
  }

  getAnimalById(id: string): Animal | undefined {
    return this.animals.find(a => a.id === id);
  }

  updateAnimal(id: string, updates: Partial<Animal>): Animal[] {
    this.animals = this.animals.map(a =>
      a.id === id ? { ...a, ...updates } : a,
    );
    return this.animals;
  }

  getActive(): Animal[] {
    return this.animals.filter(a => a.status === 'Ativo');
  }

  getByBloodline(bloodline: string): Animal[] {
    return this.animals.filter(a => a.bloodline === bloodline);
  }
}
