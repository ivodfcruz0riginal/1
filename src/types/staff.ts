export type StaffRole = 'Maioral' | 'Campino';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  experience: number;  // 0–100
  fatigue: number;     // 0–100
  mood: number;        // 0–100
  loyalty: number;     // 0–100
  health: number;      // 0–100
  monthlyNote: string; // latest observation or report
}
