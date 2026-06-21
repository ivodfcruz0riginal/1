import type { StaffMember } from '../../types/staff';
import type { Season } from '../../store/gameTypes';
import type { LocationCondition } from '../../types/location';

// ── Context ───────────────────────────────────────────────────────────────────

export interface StaffContext {
  season: Season;
  economyProfit: number;       // positive = good month, negative = bad month
  northCondition: LocationCondition;
  southCondition: LocationCondition;
  hasBrokenFence: boolean;
  treasury: number;
  weatherFatigueDelta: number;
}

// ── Output ────────────────────────────────────────────────────────────────────

export interface StaffDiaryEvent {
  text: string;
  priority: number;
}

export interface StaffUpdateResult {
  staff: StaffMember[];
  diaryEvents: StaffDiaryEvent[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

// ── Maioral observation pool ──────────────────────────────────────────────────

const MAIORAL_OBSERVATIONS = {
  brokenFence: [
    'Não gosto do estado da vedação do Cercado Norte.',
    'A vedação precisa de atenção urgente, patrão.',
    'Enquanto a vedação não for reparada, os animais estão em risco.',
  ],
  summer: [
    'Este verão será exigente para o gado.',
    'O calor aperta. Redobrei a vigilância na aguada.',
    'Os animais pedem mais água do que o habitual neste calor.',
  ],
  winter: [
    'O frio chegou. Os mais novos precisam de cuidados.',
    'Inverno rigoroso este ano. Mais trabalho para todos.',
    'Já preparei abrigos para os animais mais jovens.',
  ],
  spring: [
    'Os novilhos estão a evoluir bem com as chuvas da primavera.',
    'Boa época para o gado. As pastagens estão em excelente estado.',
    'A primavera anima a herdade. Bons tempos pela frente.',
  ],
  autumn: [
    'Outono tranquilo. Tempo de preparar reservas.',
    'Estamos a acumular feno para o Inverno. Vai ser necessário.',
    'Os animais estão bem alimentados. Boa condição corporal.',
  ],
  lowTreasury: [
    'As contas preocupam-me, patrão. Devemos ser cuidadosos.',
    'Mês difícil para as finanças. Há que apertar o cinto.',
  ],
  goodEconomy: [
    'Bom mês para as contas da herdade.',
    'As receitas estão a compensar o trabalho.',
  ],
  barragem: [
    'A barragem precisa de atenção antes do verão.',
  ],
  normal: [
    'A herdade segue o seu rumo normal.',
    'Tudo em ordem por aqui, patrão.',
    'Nada de extraordinário a reportar.',
    'Os animais estão tranquilos. A semana correu bem.',
  ],
};

function pickFrom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMaioralNote(ctx: StaffContext): string {
  if (ctx.hasBrokenFence) return pickFrom(MAIORAL_OBSERVATIONS.brokenFence);
  if (ctx.treasury < 20_000) return pickFrom(MAIORAL_OBSERVATIONS.lowTreasury);
  if (ctx.season === 'Verão') return pickFrom(MAIORAL_OBSERVATIONS.summer);
  if (ctx.season === 'Inverno') return pickFrom(MAIORAL_OBSERVATIONS.winter);
  if (ctx.season === 'Primavera') return pickFrom(MAIORAL_OBSERVATIONS.spring);
  if (ctx.season === 'Outono') return pickFrom(MAIORAL_OBSERVATIONS.autumn);
  if (ctx.economyProfit > 3_000) return pickFrom(MAIORAL_OBSERVATIONS.goodEconomy);
  return pickFrom(MAIORAL_OBSERVATIONS.normal);
}

// ── Campino work reports ──────────────────────────────────────────────────────

const CAMPINO_REPORTS = {
  brokenFence: [
    'Vedação avariada detectada. Aguarda reparação.',
    'Animais inquietos perto da vedação danificada.',
  ],
  summer: [
    'Aguada verificada. Níveis suficientes por agora.',
    'Animais deslocados para sombra durante as horas mais quentes.',
  ],
  winter: [
    'Animais jovens verificados. Todos em ordem.',
    'Feno distribuído para os cercados.',
  ],
  normal: [
    'Sem ocorrências a reportar.',
    'Ronda de inspecção realizada. Tudo em ordem.',
    'Animais movimentados conforme o habitual.',
    'Nada de especial esta semana.',
  ],
};

function generateCampinoReport(ctx: StaffContext): string {
  if (ctx.hasBrokenFence) return pickFrom(CAMPINO_REPORTS.brokenFence);
  if (ctx.season === 'Verão') return pickFrom(CAMPINO_REPORTS.summer);
  if (ctx.season === 'Inverno') return pickFrom(CAMPINO_REPORTS.winter);
  return pickFrom(CAMPINO_REPORTS.normal);
}

// ── Per-member update ─────────────────────────────────────────────────────────

function updateMember(member: StaffMember, ctx: StaffContext): StaffMember {
  // ── Experience ──────────────────────────────────────────────────────────────
  // Grows slowly each month; slows after 80
  const expGain = member.experience < 80 ? 1 : 0.3;
  const experience = clamp(member.experience + expGain);

  // ── Fatigue ─────────────────────────────────────────────────────────────────
  // Summer and broken fence = more work; winter = moderate
  let fatigueDelta = 2; // baseline monthly fatigue increase
  if (ctx.season === 'Verão') fatigueDelta += 4;
  if (ctx.season === 'Inverno') fatigueDelta += 2;
  if (ctx.hasBrokenFence) fatigueDelta += 3;
  if (ctx.northCondition === 'Poor' || ctx.northCondition === 'Damaged') fatigueDelta += 2;
  fatigueDelta += ctx.weatherFatigueDelta;
  // High fatigue recovery is slower — recovery only happens when fatigue is high
  // but presently fatigue always increases (no rest mechanic yet); cap at 85
  const fatigue = clamp(member.fatigue + fatigueDelta, 0, 85);

  // ── Mood ────────────────────────────────────────────────────────────────────
  let moodDelta = 0;
  if (fatigue > 70) moodDelta -= 4;
  else if (fatigue > 50) moodDelta -= 2;
  else moodDelta += 1;
  if (ctx.northCondition === 'Excellent' || ctx.northCondition === 'Good') moodDelta += 2;
  if (ctx.hasBrokenFence) moodDelta -= 3;
  if (ctx.economyProfit > 3_000) moodDelta += 1;
  const mood = clamp(member.mood + moodDelta);

  // ── Loyalty ─────────────────────────────────────────────────────────────────
  let loyaltyDelta = 0;
  if (ctx.economyProfit > 2_000) loyaltyDelta += 1;
  else if (ctx.economyProfit < -3_000) loyaltyDelta -= 2;
  if (ctx.treasury < 20_000) loyaltyDelta -= 1;
  const loyalty = clamp(member.loyalty + loyaltyDelta);

  // ── Health ──────────────────────────────────────────────────────────────────
  let healthDelta = 0;
  if (fatigue > 75) healthDelta -= 2;
  else if (fatigue < 40) healthDelta += 1;
  if (ctx.season === 'Inverno') healthDelta -= 1;
  const health = clamp(member.health + healthDelta);

  // ── Monthly note ─────────────────────────────────────────────────────────────
  const monthlyNote = member.role === 'Maioral'
    ? generateMaioralNote(ctx)
    : generateCampinoReport(ctx);

  return { ...member, experience, fatigue, mood, loyalty, health, monthlyNote };
}

// ── Main entry point ──────────────────────────────────────────────────────────

export function updateStaff(
  staff: StaffMember[],
  ctx: StaffContext,
): StaffUpdateResult {
  const updated = staff.map(m => updateMember(m, ctx));

  const diaryEvents: StaffDiaryEvent[] = [];

  // Maioral observation always goes to diary
  const maioral = updated.find(m => m.role === 'Maioral');
  if (maioral) {
    diaryEvents.push({ text: `Manuel: "${maioral.monthlyNote}"`, priority: 2 });
  }

  // One campino report — only if it's not "nothing unusual"
  const unusualCampino = updated.find(
    m => m.role === 'Campino' && !m.monthlyNote.includes('a reportar') && !m.monthlyNote.includes('em ordem') && !m.monthlyNote.includes('especial'),
  );
  if (unusualCampino) {
    diaryEvents.push({ text: `${unusualCampino.name}: ${unusualCampino.monthlyNote}`, priority: 1 });
  }

  return { staff: updated, diaryEvents: diaryEvents.slice(0, 2) };
}
