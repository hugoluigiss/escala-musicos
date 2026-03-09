/**
 * Escala de Músicos — PDF Report Generator (Client-side)
 * Professional reports with calendar view, stats, and position details.
 * Ported from Python reportlab to jsPDF.
 */
import { jsPDF } from "jspdf";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const W = 210; // A4 width mm
const H = 297; // A4 height mm
const MX = 30; // margin X in mm

// Colors [R, G, B] 0-255
const BG        = [13, 11, 30];
const CARD_BG   = [20, 16, 40];
const CARD_BD   = [30, 24, 64];
const GOLD      = [201, 169, 110];
const GOLD_DIM  = [138, 109, 59];
const TXT       = [240, 230, 211];
const TXT_DIM   = [138, 128, 144];
const TXT_DMR   = [90, 80, 96];
const GREEN     = [91, 200, 91];
const GREEN_BG  = [26, 46, 26];
const RED       = [255, 96, 96];
const RED_BG    = [46, 26, 26];
const BLUE      = [105, 180, 255];
const BLUE_BG   = [26, 30, 46];
const ORANGE    = [255, 140, 105];
const ORANGE_BG = [46, 30, 26];

const VC_MAP = {
  hugo:     { tag: [232,168,56],  bg: [46,37,16] },
  jokasta:  { tag: [168,130,255], bg: [30,21,48] },
  matheu:   { tag: [91,200,175],  bg: [21,37,32] },
  leandro:  { tag: [105,180,255], bg: [21,30,46] },
  aline:    { tag: [255,130,180], bg: [46,21,32] },
  ana:      { tag: [255,200,100], bg: [46,34,16] },
  clivison: { tag: [152,217,130], bg: [26,46,24] },
  madalena: { tag: [255,140,105], bg: [46,30,21] },
};
const DEF_VC = { tag: [201,169,110], bg: [30,26,16] };
function getVC(id) { return VC_MAP[id] || DEF_VC; }

const POS_META = {
  vocal_principal: { label: "Vocal Principal", color: [232,168,56] },
  vocal_back:      { label: "Back Vocal",      color: [155,138,255] },
  teclado:         { label: "Teclado",         color: [91,200,175] },
  violao:          { label: "Violão",          color: [255,140,105] },
  baixo:           { label: "Baixo",           color: [105,180,255] },
  guitarra:        { label: "Guitarra",        color: [255,105,180] },
  bateria:         { label: "Bateria",         color: [152,217,130] },
};

const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_PT = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function blend(color, alpha) {
  return color.map((c, i) => Math.round(c * alpha + BG[i] * (1 - alpha)));
}

function getSundays(year, month) {
  const sundays = [];
  const d = new Date(year, month, 1);
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  while (d.getMonth() === month) { sundays.push(new Date(d)); d.setDate(d.getDate() + 7); }
  return sundays;
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getMonthCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday-first
  const weeks = [];
  let week = new Array(7).fill(0);
  let day = 1;
  for (let i = offset; i < 7 && day <= daysInMonth; i++) { week[i] = day++; }
  weeks.push(week);
  while (day <= daysInMonth) {
    week = new Array(7).fill(0);
    for (let i = 0; i < 7 && day <= daysInMonth; i++) { week[i] = day++; }
    weeks.push(week);
  }
  return weeks;
}

function rr(doc, x, y, w, h, r, fill, stroke, sw) {
  if (fill) {
    doc.setFillColor(...fill);
    doc.roundedRect(x, y, w, h, r, r, "F");
  }
  if (stroke) {
    doc.setDrawColor(...stroke);
    doc.setLineWidth(sw || 0.15);
    doc.roundedRect(x, y, w, h, r, r, "S");
  }
}

function nowStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// ─── DRAW BACKGROUND ────────────────────────────────────────────────────────
function drawBackground(doc) {
  doc.setFillColor(...BG);
  doc.rect(0, 0, W, H, "F");
  // Subtle glow top-left
  doc.setFillColor(...blend(GOLD, 0.04));
  doc.circle(W * 0.2, H * 0.15, 70, "F");
  // Subtle glow bottom-right
  doc.setFillColor(...blend([100, 80, 180], 0.05));
  doc.circle(W * 0.8, H * 0.85, 85, "F");
}

// ─── DRAW HEADER ─────────────────────────────────────────────────────────────
function drawHeader(doc, musician, monthLabel, vc) {
  let y = 25;
  // Ministry subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD_DIM);
  doc.text("MINISTÉRIO DE LOUVOR", W / 2, y, { align: "center" });

  // Name
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...TXT);
  doc.text(`✦  ${musician.name}  ✦`, W / 2, y, { align: "center" });

  // Gold line
  y += 4;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.2);
  doc.line(W / 2 - 22, y, W / 2 + 22, y);

  // Month/year
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text(monthLabel, W / 2, y, { align: "center" });

  // Colored accent
  y += 4;
  doc.setDrawColor(...vc.tag);
  doc.setLineWidth(0.7);
  doc.line(W / 2 - 28, y, W / 2 + 28, y);

  return y + 6;
}

// ─── DRAW LEGEND ─────────────────────────────────────────────────────────────
function drawLegend(doc, vc, startY) {
  let y = startY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...GOLD_DIM);
  doc.text("LEGENDA:", MX, y);

  const items = [
    { color: vc.tag, label: "Lead Vocal" },
    { color: vc.bg,  label: "Escalado" },
    { color: BLUE,   label: "Folga" },
    { color: RED,    label: "Bloqueado" },
  ];
  let x = MX + 28;
  items.forEach(item => {
    doc.setFillColor(...item.color);
    doc.circle(x + 1.5, y - 1.2, 1.2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...TXT_DIM);
    doc.text(item.label, x + 4.5, y);
    x += 26;
  });

  return y + 5;
}

// ─── DRAW CALENDAR ──────────────────────────────────────────────────────────
function drawCalendar(doc, year, monthIdx, sundays, musicianSundays, blockedDates, leadSundays, vc, startY) {
  const weeks = getMonthCalendar(year, monthIdx);
  const calW = W - 2 * MX;
  const cellW = calW / 7;
  const cellH = 13;
  const headerH = 8;

  const sundayDays = new Set(sundays.map(s => s.getDate()));
  const musicianDays = new Set(musicianSundays.map(s => s.getDate()));
  const blockedDays = new Set(blockedDates.map(s => s.getDate()));
  const leadDays = new Set(leadSundays.map(s => s.getDate()));

  // Card background
  const totalH = headerH + weeks.length * cellH + 5;
  rr(doc, MX - 2, startY - 2, calW + 4, totalH + 4, 3, CARD_BG, CARD_BD, 0.15);

  // Day headers
  let y = startY + headerH - 2;
  DAYS_PT.forEach((name, i) => {
    const cx = MX + i * cellW + cellW / 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...(i === 6 ? GOLD : TXT_DIM));
    doc.text(name, cx, y, { align: "center" });
  });

  // Separator
  y += 2;
  doc.setDrawColor(...blend(GOLD, 0.15));
  doc.setLineWidth(0.1);
  doc.line(MX, y, MX + calW, y);

  // Draw days
  y += 3;
  weeks.forEach(week => {
    week.forEach((day, i) => {
      if (day === 0) return;
      const cx = MX + i * cellW + cellW / 2;
      const cy = y + cellH / 2;
      const rx = MX + i * cellW + 1;
      const ry = y + 0.5;
      const rw = cellW - 2;
      const rh = cellH - 1;

      const isSunday = sundayDays.has(day);
      const isScheduled = musicianDays.has(day);
      const isBlocked = blockedDays.has(day);
      const isLead = leadDays.has(day);

      // Cell backgrounds
      if (isBlocked && isSunday) {
        rr(doc, rx, ry, rw, rh, 2, RED_BG, blend(RED, 0.4), 0.15);
      } else if (isLead) {
        rr(doc, rx, ry, rw, rh, 2, vc.tag, null);
      } else if (isScheduled) {
        rr(doc, rx, ry, rw, rh, 2, vc.bg, blend(vc.tag, 0.4), 0.15);
      } else if (isSunday && !isScheduled) {
        rr(doc, rx, ry, rw, rh, 2, blend([255,255,255], 0.03), null);
      }

      // Day number
      doc.setFont("helvetica", isSunday ? "bold" : "normal");
      doc.setFontSize(isSunday ? 10 : 8);
      if (isLead) doc.setTextColor(...BG);
      else if (isBlocked && isSunday) doc.setTextColor(...RED);
      else if (isScheduled) doc.setTextColor(...vc.tag);
      else if (isSunday) doc.setTextColor(...TXT_DIM);
      else doc.setTextColor(...TXT_DMR);
      doc.text(String(day), cx, cy + 0.5, { align: "center" });

      // Labels
      if (isLead) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.5);
        doc.setTextColor(...BG);
        doc.text("LEAD", cx, cy + 4, { align: "center" });
      } else if (isBlocked && isSunday) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(4);
        doc.setTextColor(...RED);
        doc.text("BLOQUEADO", cx, cy + 4, { align: "center" });
      } else if (isScheduled) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(4);
        doc.setTextColor(...blend(vc.tag, 0.6));
        doc.text("ESCALADO", cx, cy + 4, { align: "center" });
      } else if (isSunday && !isScheduled) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(4);
        doc.setTextColor(...TXT_DMR);
        doc.text("FOLGA", cx, cy + 4, { align: "center" });
      }
    });
    y += cellH;
  });

  return startY + totalH + 4;
}

// ─── DRAW STATS CARDS ───────────────────────────────────────────────────────
function drawStatsCards(doc, stats, vc, startY) {
  const totalW = W - 2 * MX;
  const gap = 2.5;
  const count = 4;
  const cardW = (totalW - gap * (count - 1)) / count;
  const cardH = 18;
  let y = startY;

  const items = [
    { val: stats.scheduled, label: "ESCALADO", color: vc.tag, bg: vc.bg },
    { val: stats.folgas,    label: "FOLGAS",   color: BLUE,   bg: BLUE_BG },
    { val: stats.leads,     label: "LEAD VOCAL", color: GOLD, bg: [46,37,16] },
    { val: stats.blocked,   label: "BLOQUEIOS", color: ORANGE, bg: ORANGE_BG },
  ];

  items.forEach((item, i) => {
    const x = MX + i * (cardW + gap);
    rr(doc, x, y, cardW, cardH, 2.5, item.bg, blend(item.color, 0.2), 0.12);

    // Big number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...item.color);
    doc.text(String(item.val), x + cardW / 2, y + 10, { align: "center" });

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(...TXT_DIM);
    doc.text(item.label, x + cardW / 2, y + 15.5, { align: "center" });
  });

  return y + cardH + 5;
}

// ─── DRAW POSITION BREAKDOWN ────────────────────────────────────────────────
function drawPositions(doc, positionsPlayed, musicianRoles, vc, startY) {
  const totalW = W - 2 * MX;
  const rowH = 8;

  // Section title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  let y = startY;
  doc.text("ATUAÇÃO POR POSIÇÃO", MX, y);
  y += 3;

  const roles = Object.keys(POS_META).filter(pid => musicianRoles.includes(pid));
  const cardH = roles.length * rowH + 6;
  rr(doc, MX - 2, y - 1, totalW + 4, cardH + 2, 3, CARD_BG, CARD_BD, 0.15);

  y += 3;
  const maxCount = Math.max(1, ...Object.values(positionsPlayed));

  roles.forEach(pid => {
    const meta = POS_META[pid];
    const cnt = positionsPlayed[pid] || 0;

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...meta.color);
    doc.text(meta.label, MX + 2, y + 2);

    // Count
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${cnt}x`, MX + totalW - 2, y + 2, { align: "right" });

    // Bar background
    const barX = MX + 40;
    const barW = totalW - 55;
    const barH = 3;
    const barY = y;
    rr(doc, barX, barY, barW, barH, 1.5, blend([255,255,255], 0.04), null);

    // Bar fill
    if (cnt > 0 && maxCount > 0) {
      const fillW = Math.max((cnt / maxCount) * barW, 2);
      rr(doc, barX, barY, fillW, barH, 1.5, blend(meta.color, 0.55), null);
    }

    y += rowH;
  });

  return y + 4;
}

// ─── DRAW SUNDAY DETAIL TABLE ───────────────────────────────────────────────
function drawSundayDetails(doc, sundays, schedule, musicianId, vc, startY) {
  const totalW = W - 2 * MX;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  let y = startY;
  doc.text("DETALHAMENTO POR DOMINGO", MX, y);
  y += 3;

  const rowH = 7.5;
  const headerH = 6;
  const cardH = headerH + sundays.length * rowH + 4;
  rr(doc, MX - 2, y - 1, totalW + 4, cardH + 2, 3, CARD_BG, CARD_BD, 0.15);

  // Table header
  y += headerH - 1;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(...GOLD_DIM);
  doc.text("DOMINGO", MX + 4, y);
  doc.text("DATA", MX + 24, y);
  doc.text("POSIÇÃO", MX + 48, y);
  doc.text("STATUS", MX + totalW - 16, y);

  doc.setDrawColor(...blend(GOLD, 0.1));
  doc.setLineWidth(0.08);
  y += 1.5;
  doc.line(MX, y, MX + totalW, y);

  sundays.forEach((sun, si) => {
    y += rowH;
    // Find positions
    const posList = [];
    let isLead = false;
    Object.keys(POS_META).forEach(pid => {
      const maxSlots = pid === "vocal_back" ? 3 : 1;
      for (let slot = 0; slot < maxSlots; slot++) {
        if (schedule[`${si}-${pid}-${slot}`] === musicianId) {
          posList.push(POS_META[pid].label);
          if (pid === "vocal_principal") isLead = true;
        }
      }
    });
    const isOff = posList.length === 0;

    // Sunday number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...(isOff ? TXT_DMR : vc.tag));
    doc.text(String(si + 1), MX + 8, y, { align: "center" });

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...(isOff ? TXT_DMR : TXT));
    doc.text(`${String(sun.getDate()).padStart(2,"0")}/${String(sun.getMonth()+1).padStart(2,"0")}/${sun.getFullYear()}`, MX + 24, y);

    // Position
    if (posList.length > 0) {
      doc.setFont("helvetica", isLead ? "bold" : "normal");
      doc.setFontSize(8);
      doc.setTextColor(...(isLead ? vc.tag : TXT));
      doc.text(posList.join(", "), MX + 48, y);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TXT_DMR);
      doc.text("—", MX + 48, y);
    }

    // Status badge
    let badgeText, badgeColor, badgeBg;
    if (isLead) { badgeText = "LEAD"; badgeColor = GOLD; badgeBg = [46,37,16]; }
    else if (posList.length > 0) { badgeText = "ATIVO"; badgeColor = GREEN; badgeBg = GREEN_BG; }
    else { badgeText = "FOLGA"; badgeColor = TXT_DIM; badgeBg = blend([255,255,255], 0.03); }

    const bx = MX + totalW - 22;
    rr(doc, bx, y - 3, 18, 4.5, 1.5, badgeBg, blend(badgeColor, 0.3), 0.08);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(...badgeColor);
    doc.text(badgeText, bx + 9, y - 0.5, { align: "center" });

    // Row separator
    if (si < sundays.length - 1) {
      doc.setDrawColor(...blend([255,255,255], 0.03));
      doc.setLineWidth(0.05);
      doc.line(MX + 2, y + 2, MX + totalW - 2, y + 2);
    }
  });

  return y + 6;
}

// ─── DRAW FOOTER ─────────────────────────────────────────────────────────────
function drawFooter(doc, pageNum) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...TXT_DMR);
  doc.text(
    `Gerado pelo sistema Escala de Músicos  •  HLSS Prime Services  •  ${nowStr()}`,
    W / 2, H - 8, { align: "center" }
  );
  doc.text(`Pág ${pageNum}`, W - MX, H - 8, { align: "right" });
}

// ─── GENERATE SINGLE MUSICIAN REPORT ────────────────────────────────────────
export function generateMusicianPDF(musician, allSchedules, blockDates) {
  const mid = musician.id;
  const vc = getVC(mid);
  const monthKeys = Object.keys(allSchedules).filter(k => allSchedules[k] && Object.keys(allSchedules[k]).length > 0).sort();

  if (monthKeys.length === 0) return null;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setProperties({ title: `Relatório - ${musician.name}`, author: "Escala de Músicos — HLSS Prime Services" });

  let pageNum = 0;

  monthKeys.forEach((mk, mkIdx) => {
    const [yStr, mStr] = mk.split("-");
    const yr = parseInt(yStr), mo = parseInt(mStr);
    const sched = allSchedules[mk];
    const sundays = getSundays(yr, mo);
    const monthLabel = `${MONTHS_PT[mo]} ${yr}  •  ${sundays.length} domingos`;

    // Determine musician's participation
    const scheduledSet = new Set();
    sundays.forEach((_, si) => {
      Object.keys(POS_META).forEach(pid => {
        const maxSlots = pid === "vocal_back" ? 3 : 1;
        for (let s = 0; s < maxSlots; s++) {
          if (sched[`${si}-${pid}-${s}`] === mid) scheduledSet.add(si);
        }
      });
    });

    const musicianSundays = [...scheduledSet].sort((a,b) => a-b).map(si => sundays[si]);
    const blockedKeys = blockDates[mid] || [];
    const blockedDatesList = sundays.filter(s => blockedKeys.includes(dateKey(s)));
    const leadSundays = sundays.filter((_, si) => sched[`${si}-vocal_principal-0`] === mid);

    const positionsPlayed = {};
    sundays.forEach((_, si) => {
      Object.keys(POS_META).forEach(pid => {
        const maxSlots = pid === "vocal_back" ? 3 : 1;
        for (let s = 0; s < maxSlots; s++) {
          if (sched[`${si}-${pid}-${s}`] === mid) {
            positionsPlayed[pid] = (positionsPlayed[pid] || 0) + 1;
          }
        }
      });
    });

    const stats = {
      scheduled: musicianSundays.length,
      folgas: sundays.length - musicianSundays.length,
      leads: leadSundays.length,
      blocked: blockedDatesList.length,
    };

    // New page (except first)
    if (mkIdx > 0) doc.addPage();
    pageNum++;

    // Page 1: Calendar + Stats
    drawBackground(doc);
    let y = drawHeader(doc, musician, monthLabel, vc);
    y = drawLegend(doc, vc, y);
    y = drawCalendar(doc, yr, mo, sundays, musicianSundays, blockedDatesList, leadSundays, vc, y);
    y = drawStatsCards(doc, stats, vc, y);

    // Check space for positions + table
    const rolesInPos = Object.keys(POS_META).filter(pid => (musician.roles || []).includes(pid));
    const posH = rolesInPos.length * 8 + 16;
    const tableH = sundays.length * 7.5 + 20;

    if (y + posH + tableH < H - 15) {
      // All fits on one page
      y = drawPositions(doc, positionsPlayed, musician.roles || [], vc, y);
      y = drawSundayDetails(doc, sundays, sched, mid, vc, y);
      drawFooter(doc, pageNum);
    } else {
      // Positions on page 1, table on page 2
      if (y + posH < H - 15) {
        y = drawPositions(doc, positionsPlayed, musician.roles || [], vc, y);
      }
      drawFooter(doc, pageNum);

      // Page 2
      doc.addPage();
      pageNum++;
      drawBackground(doc);

      // Mini header
      let y2 = 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...TXT);
      doc.text(`✦  ${musician.short}  ✦`, W / 2, y2, { align: "center" });
      y2 += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...GOLD);
      doc.text(monthLabel, W / 2, y2, { align: "center" });
      y2 += 8;

      if (y + posH >= H - 15) {
        y2 = drawPositions(doc, positionsPlayed, musician.roles || [], vc, y2);
      }
      y2 = drawSundayDetails(doc, sundays, sched, mid, vc, y2);
      drawFooter(doc, pageNum);
    }
  });

  return doc;
}

// ─── GENERATE ALL MUSICIANS PDF (Combined) ──────────────────────────────────
export function generateAllMusiciansPDF(musicians, allSchedules, blockDates) {
  const active = musicians.filter(m => !m.manualOnly);
  const monthKeys = Object.keys(allSchedules).filter(k => allSchedules[k] && Object.keys(allSchedules[k]).length > 0).sort();

  if (monthKeys.length === 0 || active.length === 0) return null;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setProperties({ title: "Relatório Completo — Todos os Músicos", author: "Escala de Músicos — HLSS Prime Services" });

  let pageNum = 0;
  let isFirst = true;

  active.forEach(musician => {
    const mid = musician.id;
    const vc = getVC(mid);

    monthKeys.forEach(mk => {
      const [yStr, mStr] = mk.split("-");
      const yr = parseInt(yStr), mo = parseInt(mStr);
      const sched = allSchedules[mk];
      const sundays = getSundays(yr, mo);
      const monthLabel = `${MONTHS_PT[mo]} ${yr}  •  ${sundays.length} domingos`;

      const scheduledSet = new Set();
      sundays.forEach((_, si) => {
        Object.keys(POS_META).forEach(pid => {
          const maxSlots = pid === "vocal_back" ? 3 : 1;
          for (let s = 0; s < maxSlots; s++) {
            if (sched[`${si}-${pid}-${s}`] === mid) scheduledSet.add(si);
          }
        });
      });

      const musicianSundays = [...scheduledSet].sort((a,b) => a-b).map(si => sundays[si]);
      const blockedKeys = blockDates[mid] || [];
      const blockedDatesList = sundays.filter(s => blockedKeys.includes(dateKey(s)));
      const leadSundays = sundays.filter((_, si) => sched[`${si}-vocal_principal-0`] === mid);

      const positionsPlayed = {};
      sundays.forEach((_, si) => {
        Object.keys(POS_META).forEach(pid => {
          const maxSlots = pid === "vocal_back" ? 3 : 1;
          for (let s = 0; s < maxSlots; s++) {
            if (sched[`${si}-${pid}-${s}`] === mid) {
              positionsPlayed[pid] = (positionsPlayed[pid] || 0) + 1;
            }
          }
        });
      });

      const stats = {
        scheduled: musicianSundays.length,
        folgas: sundays.length - musicianSundays.length,
        leads: leadSundays.length,
        blocked: blockedDatesList.length,
      };

      if (!isFirst) doc.addPage();
      isFirst = false;
      pageNum++;

      drawBackground(doc);
      let y = drawHeader(doc, musician, monthLabel, vc);
      y = drawLegend(doc, vc, y);
      y = drawCalendar(doc, yr, mo, sundays, musicianSundays, blockedDatesList, leadSundays, vc, y);
      y = drawStatsCards(doc, stats, vc, y);

      const rolesInPos = Object.keys(POS_META).filter(pid => (musician.roles || []).includes(pid));
      const posH = rolesInPos.length * 8 + 16;
      const tableH = sundays.length * 7.5 + 20;

      if (y + posH + tableH < H - 15) {
        y = drawPositions(doc, positionsPlayed, musician.roles || [], vc, y);
        y = drawSundayDetails(doc, sundays, sched, mid, vc, y);
        drawFooter(doc, pageNum);
      } else {
        if (y + posH < H - 15) {
          y = drawPositions(doc, positionsPlayed, musician.roles || [], vc, y);
        }
        drawFooter(doc, pageNum);

        doc.addPage();
        pageNum++;
        drawBackground(doc);

        let y2 = 20;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...TXT);
        doc.text(`✦  ${musician.short}  ✦`, W / 2, y2, { align: "center" });
        y2 += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...GOLD);
        doc.text(monthLabel, W / 2, y2, { align: "center" });
        y2 += 8;

        if (y + posH >= H - 15) {
          y2 = drawPositions(doc, positionsPlayed, musician.roles || [], vc, y2);
        }
        y2 = drawSundayDetails(doc, sundays, sched, mid, vc, y2);
        drawFooter(doc, pageNum);
      }
    });
  });

  return doc;
}
