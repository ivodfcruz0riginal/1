import React from 'react';
import { useGameState } from '../store/gameState';
import { monthlyReportService } from '../core/reports/MonthlyReportService';
import type { MonthlyReport, ReportCategory, ReportSeverity } from '../core/reports/MonthlyReport';

// ── Category / severity display ───────────────────────────────────────────────

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  Animals:  'Animais',
  Ranch:    'Herdade',
  Economy:  'Economia',
  Weather:  'Meteorologia',
  Staff:    'Pessoal',
  General:  'Geral',
};

const SEVERITY_DOT: Record<ReportSeverity, string> = {
  Info:     'bg-emerald-500/70',
  Warning:  'bg-amber-500/70',
  Critical: 'bg-red-500/70',
};

// ── Maioral portrait (shared style with MaioralDialogue) ──────────────────────

const MaioralPortrait: React.FC = () => (
  <div className="relative shrink-0">
    <div className="w-10 h-10 rounded-full bg-leather-700/70 border-2 border-gold/30 flex items-center justify-center overflow-hidden">
      <div className="absolute bottom-0 inset-x-0 h-5 bg-leather-800/80" />
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-800/70 rounded-full" />
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-leather-900/80 rounded-full" />
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-leather-800/70 rounded-t-sm" />
    </div>
    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gold/80 border border-leather-900 flex items-center justify-center">
      <div className="w-1.5 h-1.5 rounded-full bg-leather-900" />
    </div>
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────────

const MonthlyReportCard: React.FC = () => {
  const { state, acknowledgeReport } = useGameState();

  const currentReport: MonthlyReport | null = monthlyReportService.getCurrentReport(state.monthlyReports);

  // Only show when the Maioral dialogue is done — avoid visual stack with z-40
  if (state.pendingDialogue || !currentReport) return null;

  const handleAcknowledge = () => acknowledgeReport(currentReport.id);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center px-6 pointer-events-none">
      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-leather-950/55" />

      <div
        className="relative pointer-events-auto w-full max-w-md rounded-lg shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1f1609 0%, #170e06 100%)',
          border: '1px solid rgba(180,140,55,0.38)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold/50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold/50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold/50 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-leather-700/40">
          <MaioralPortrait />

          <div>
            <p className="font-display text-sm text-gold tracking-widest uppercase leading-none">Manuel</p>
            <p className="text-ivory/35 text-[10px] font-body uppercase tracking-wider mt-0.5">
              Maioral · Herdade da Ferraria
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[currentReport.severity]}`} />
            <span className="text-ivory/30 text-[9px] font-body border border-ivory/10 rounded-full px-2 py-0.5 uppercase tracking-wider">
              {CATEGORY_LABELS[currentReport.category]}
            </span>
          </div>
        </div>

        {/* Report title */}
        <div className="px-5 pt-3.5 pb-1">
          <p className="font-display text-base text-ivory/90 tracking-wide leading-snug">
            {currentReport.title}
          </p>
          <p className="text-ivory/25 text-[10px] font-body mt-0.5">
            {currentReport.date.month} · {currentReport.date.year}
          </p>
        </div>

        {/* Ivory paper body */}
        <div
          className="mx-5 mb-4 mt-2 rounded border px-4 py-3"
          style={{
            background: 'rgba(245,234,210,0.05)',
            borderColor: 'rgba(212,180,131,0.12)',
          }}
        >
          <div className="relative pl-3 border-l-2 border-gold/20">
            <p className="text-ivory/75 text-sm font-body leading-relaxed italic">
              "{currentReport.message}"
            </p>
          </div>
        </div>

        {/* Entendido button */}
        <div className="px-5 pb-4">
          <button
            onClick={handleAcknowledge}
            className="w-full text-sm font-body text-gold border border-gold/40 rounded px-4 py-2.5 uppercase tracking-widest transition-all duration-200 hover:bg-gold/8 hover:border-gold/70"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportCard;
