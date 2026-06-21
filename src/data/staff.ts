import type { StaffMember } from '../types/staff';

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff_maioral',
    name: 'Manuel Cardoso',
    role: 'Maioral',
    experience: 72,
    fatigue: 35,
    mood: 68,
    loyalty: 85,
    health: 78,
    monthlyNote: 'A herdade segue o seu rumo normal.',
  },
  {
    id: 'staff_campino_1',
    name: 'António Ferreira',
    role: 'Campino',
    experience: 58,
    fatigue: 42,
    mood: 65,
    loyalty: 74,
    health: 82,
    monthlyNote: 'Sem ocorrências a reportar.',
  },
  {
    id: 'staff_campino_2',
    name: 'João da Silva',
    role: 'Campino',
    experience: 31,
    fatigue: 50,
    mood: 60,
    loyalty: 68,
    health: 90,
    monthlyNote: 'Sem ocorrências a reportar.',
  },
];
