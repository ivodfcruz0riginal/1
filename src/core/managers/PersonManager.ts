import type { PersonEntity } from '../types/person';

/**
 * PersonManager owns all person data access and mutations.
 * Logic migration from store/gameState.tsx planned for Alpha 0.3.
 */
export class PersonManager {
  private people: PersonEntity[];

  constructor(people: PersonEntity[] = []) {
    this.people = [...people];
  }

  getPeople(): PersonEntity[] {
    return [...this.people];
  }

  getPersonById(id: string): PersonEntity | undefined {
    return this.people.find(p => p.id === id);
  }

  updatePerson(id: string, updates: Partial<PersonEntity>): PersonEntity[] {
    this.people = this.people.map(p =>
      p.id === id ? { ...p, ...updates } : p,
    );
    return this.getPeople();
  }

  getByRole(role: PersonEntity['role']): PersonEntity[] {
    return this.people.filter(p => p.role === role);
  }

  getActive(): PersonEntity[] {
    return this.people.filter(p => p.status === 'Active');
  }
}
