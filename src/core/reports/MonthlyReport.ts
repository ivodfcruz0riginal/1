export type ReportCategory = 'Animals' | 'Ranch' | 'Economy' | 'Weather' | 'Staff' | 'General';
export type ReportSeverity = 'Info' | 'Warning' | 'Critical';

export interface MonthlyReport {
  id: string;
  date: { month: string; year: number };
  title: string;
  message: string;
  category: ReportCategory;
  severity: ReportSeverity;
  relatedLocationId?: string;
  relatedAnimalId?: string;
  acknowledged: boolean;
}
