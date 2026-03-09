/**
 * Escala de Músicos — PDF Report Generator
 * Clean, professional, light-themed layout (Word-to-PDF style).
 * One page per month with calendar, stats, positions, and detail table.
 */
import { jsPDF } from "jspdf";

// ─── PAGE CONFIG ─────────────────────────────────────────────────────────────
const W = 210, H = 297; // A4 mm
const ML = 18, MR = 18; // left/right margins
const CW = W - ML - MR; // content width = 174mm

// ─── COLOR PALETTE (professional light theme) ────────────────────────────────
const NAVY      = [30, 41, 59];
const NAVY_MED  = [51, 65, 85];
const NAVY_LT   = [100, 116, 139];
const GOLD_DARK = [161, 128, 68];
const GOLD      = [180, 144, 80];
const GOLD_LT   = [220, 195, 150];
const GRAY_900  = [30, 30, 35];
const GRAY_700  = [55, 65, 81];
const GRAY_500  = [107, 114, 128];
const GRAY_400  = [156, 163, 175];
const GRAY_200  = [229, 231, 235];
const GRAY_100  = [243, 244, 246];
const GRAY_50   = [249, 250, 251];
const WHITE     = [255, 255, 255];
const GREEN_D   = [22, 101, 52];
const GREEN_BG  = [220, 252, 231];
const RED_D     = [153, 27, 27];
const RED_BG    = [254, 226, 226];
const BLUE_D    = [30, 64, 175];
const BLUE_BG   = [219, 234, 254];
const AMBER_D   = [146, 64, 14];
const AMBER_BG  = [254, 243, 199];

// Accent colors per musician (for subtle header accent)
const VC_MAP = {
  hugo:     { accent: [180,130,40] },
  jokasta:  { accent: [130,100,200] },
  matheu:   { accent: [50,160,140] },
  leandro:  { accent: [60,130,210] },
  aline:    { accent: [200,80,130] },
  ana:      { accent: [200,155,60] },
  clivison: { accent: [80,170,90] },
  madalena: { accent: [210,110,70] },
};
const DEF_VC = { accent: GOLD };
function getVC(id) { return VC_MAP[id] || DEF_VC; }

const POS_META = {
  vocal_principal: { label: "Vocal Principal", color: [180,130,40] },
  vocal_back:      { label: "Back Vocal",      color: [110,90,190] },
  teclado:         { label: "Teclado",         color: [40,150,135] },
  violao:          { label: "Violão",          color: [200,110,60] },
  baixo:           { label: "Baixo",           color: [50,120,200] },
  guitarra:        { label: "Guitarra",        color: [190,60,130] },
  bateria:         { label: "Bateria",         color: [70,160,80] },
};

const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_PT = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
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
  const offset = firstDay === 0 ? 6 : firstDay - 1;
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

function nowStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// ─── DRAW: HEADER ────────────────────────────────────────────────────────────
function drawHeader(doc, musician, monthLabel, vc) {
  let y = 14;

  // Gold accent bar at very top
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, W, 3, "F");

  // Ministry name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY_400);
  doc.text("MINISTÉRIO DE LOUVOR  |  ESCALA DE MÚSICOS", ML, y);

  // Church name right
  doc.text("VERBO DA VIDA ORLANDO", W - MR, y, { align: "right" });

  // Thin line below
  y += 2.5;
  doc.setDrawColor(...GRAY_200);
  doc.setLineWidth(0.3);
  doc.line(ML, y, W - MR, y);

  // Musician name
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text(musician.name, ML, y);

  // Month/year right-aligned
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...GOLD_DARK);
  doc.text(monthLabel, W - MR, y, { align: "right" });

  // Colored accent line under name
  y += 3;
  doc.setDrawColor(...vc.accent);
  doc.setLineWidth(1);
  doc.line(ML, y, ML + 45, y);

  return y + 5;
}

// ─── DRAW: STATS ROW ─────────────────────────────────────────────────────────
function drawStats(doc, stats, startY) {
  const y = startY;
  const items = [
    { val: stats.scheduled, label: "Escalado", bg: GRAY_50,   border: GRAY_200, numColor: NAVY,   labelColor: GRAY_500 },
    { val: stats.folgas,    label: "Folgas",   bg: BLUE_BG,   border: [191,219,254], numColor: BLUE_D, labelColor: BLUE_D },
    { val: stats.leads,     label: "Lead",     bg: AMBER_BG,  border: [253,230,138], numColor: AMBER_D,labelColor: AMBER_D },
    { val: stats.blocked,   label: "Bloqueios",bg: RED_BG,    border: [254,202,202], numColor: RED_D,  labelColor: RED_D },
  ];
  const gap = 4;
  const cardW = (CW - gap * (items.length - 1)) / items.length;
  const cardH = 14;

  items.forEach((item, i) => {
    const x = ML + i * (cardW + gap);
    doc.setFillColor(...item.bg);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, "F");
    doc.setDrawColor(...item.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, "S");

    // Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...item.numColor);
    doc.text(String(item.val), x + 8, y + 9.5);

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...item.labelColor);
    doc.text(item.label, x + 22, y + 9.5);
  });

  return y + cardH + 4;
}

// ─── DRAW: CALENDAR ──────────────────────────────────────────────────────────
function drawCalendar(doc, year, monthIdx, sundays, musicianSundays, blockedDates, leadSundays, vc, startY) {
  const weeks = getMonthCalendar(year, monthIdx);
  const cellW = CW / 7;
  const cellH = 9.5;
  const headerH = 6;

  const sundayDays = new Set(sundays.map(s => s.getDate()));
  const musicianDays = new Set(musicianSundays.map(s => s.getDate()));
  const blockedDays = new Set(blockedDates.map(s => s.getDate()));
  const leadDays = new Set(leadSundays.map(s => s.getDate()));

  let y = startY;

  // Section title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text("CALENDÁRIO", ML, y);

  // Legend inline
  const legendItems = [
    { color: vc.accent, label: "Lead" },
    { color: [200,220,240], label: "Escalado" },
    { color: [254,202,202], label: "Bloqueado" },
  ];
  let lx = ML + 120;
  legendItems.forEach(item => {
    doc.setFillColor(...item.color);
    doc.rect(lx, y - 2.5, 3, 3, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY_500);
    doc.text(item.label, lx + 4.5, y);
    lx += 22;
  });

  y += 3;

  // Table border
  const totalH = headerH + weeks.length * cellH;
  doc.setDrawColor(...GRAY_200);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, CW, totalH);

  // Day headers background
  doc.setFillColor(...NAVY);
  doc.rect(ML, y, CW, headerH, "F");

  DAYS_PT.forEach((name, i) => {
    const cx = ML + i * cellW + cellW / 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...(i === 6 ? GOLD_LT : WHITE));
    doc.text(name, cx, y + 4.2, { align: "center" });
  });

  y += headerH;

  // Grid lines
  for (let i = 1; i < 7; i++) {
    doc.setDrawColor(...GRAY_200);
    doc.setLineWidth(0.15);
    doc.line(ML + i * cellW, y, ML + i * cellW, y + weeks.length * cellH);
  }

  // Draw days
  weeks.forEach((week, wi) => {
    if (wi > 0) {
      doc.setDrawColor(...GRAY_200);
      doc.setLineWidth(0.15);
      doc.line(ML, y, ML + CW, y);
    }

    week.forEach((day, i) => {
      if (day === 0) return;
      const cx = ML + i * cellW + cellW / 2;
      const cellX = ML + i * cellW;
      const isSunday = sundayDays.has(day);
      const isScheduled = musicianDays.has(day);
      const isBlocked = blockedDays.has(day);
      const isLead = leadDays.has(day);

      // Cell background
      if (isBlocked && isSunday) {
        doc.setFillColor(...RED_BG);
        doc.rect(cellX + 0.2, y + 0.2, cellW - 0.4, cellH - 0.4, "F");
      } else if (isLead) {
        doc.setFillColor(...vc.accent);
        doc.rect(cellX + 0.2, y + 0.2, cellW - 0.4, cellH - 0.4, "F");
      } else if (isScheduled) {
        doc.setFillColor(210, 225, 245);
        doc.rect(cellX + 0.2, y + 0.2, cellW - 0.4, cellH - 0.4, "F");
      }

      // Day number
      doc.setFont("helvetica", isSunday ? "bold" : "normal");
      doc.setFontSize(isSunday ? 8.5 : 7.5);
      if (isLead) doc.setTextColor(...WHITE);
      else if (isBlocked && isSunday) doc.setTextColor(...RED_D);
      else if (isScheduled) doc.setTextColor(...NAVY);
      else if (isSunday) doc.setTextColor(...NAVY_MED);
      else doc.setTextColor(...GRAY_400);
      doc.text(String(day), cx, y + 4.5, { align: "center" });

      // Sub-label
      if (isLead) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4);
        doc.setTextColor(...WHITE);
        doc.text("LEAD", cx, y + 7.8, { align: "center" });
      } else if (isBlocked && isSunday) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(3.5);
        doc.setTextColor(...RED_D);
        doc.text("BLOQ.", cx, y + 7.8, { align: "center" });
      } else if (isSunday && !isScheduled) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(3.5);
        doc.setTextColor(...GRAY_400);
        doc.text("Folga", cx, y + 7.8, { align: "center" });
      }
    });
    y += cellH;
  });

  return startY + 3 + headerH + weeks.length * cellH + 4;
}

// ─── DRAW: POSITIONS ─────────────────────────────────────────────────────────
function drawPositions(doc, positionsPlayed, musicianRoles, startY) {
  let y = startY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text("POSIÇÕES", ML, y);
  y += 4;

  const roles = Object.keys(POS_META).filter(pid => musicianRoles.includes(pid));
  const maxCount = Math.max(1, ...Object.values(positionsPlayed));
  const barMaxW = 50;
  const rowH = 6;

  roles.forEach(pid => {
    const meta = POS_META[pid];
    const cnt = positionsPlayed[pid] || 0;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_700);
    doc.text(meta.label, ML, y + 2);

    // Bar background
    const barX = ML + 42;
    doc.setFillColor(...GRAY_100);
    doc.roundedRect(barX, y - 0.5, barMaxW, 4, 1.5, 1.5, "F");

    // Bar fill
    if (cnt > 0) {
      const fillW = Math.max((cnt / maxCount) * barMaxW, 2);
      doc.setFillColor(...meta.color);
      doc.roundedRect(barX, y - 0.5, fillW, 4, 1.5, 1.5, "F");
    }

    // Count
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_700);
    doc.text(`${cnt}x`, barX + barMaxW + 4, y + 2);

    y += rowH;
  });

  return y + 2;
}

// ─── DRAW: FULL LINEUP PER SUNDAY ───────────────────────────────────────────
function drawDetailTable(doc, sundays, schedule, musicianId, musicians, startY) {
  let y = startY;

  const getName = (id) => {
    if (!id) return null;
    const m = musicians.find(x => x.id === id);
    return m ? m.short : id;
  };

  // Build entries only for Sundays where the musician is scheduled
  const entries = [];
  sundays.forEach((sun, si) => {
    let scheduled = false;
    Object.keys(POS_META).forEach(pid => {
      const maxSlots = pid === "vocal_back" ? 3 : 1;
      for (let s = 0; s < maxSlots; s++) {
        if (schedule[`${si}-${pid}-${s}`] === musicianId) scheduled = true;
      }
    });
    if (!scheduled) return;

    const isLead = schedule[`${si}-vocal_principal-0`] === musicianId;

    // Full lineup for this Sunday
    const lineup = {};
    Object.keys(POS_META).forEach(pid => {
      const maxSlots = pid === "vocal_back" ? 3 : 1;
      const names = [];
      for (let s = 0; s < maxSlots; s++) {
        const aid = schedule[`${si}-${pid}-${s}`];
        if (aid) names.push(getName(aid) + (aid === musicianId ? " *" : ""));
      }
      lineup[pid] = names.length > 0 ? names.join(", ") : "-";
    });

    entries.push({ sun, isLead, lineup });
  });

  if (entries.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_400);
    doc.text("Nenhuma escalação neste mês.", ML, y + 4);
    return y + 10;
  }

  // Section title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text("ESCALAÇÃO COMPLETA POR DOMINGO", ML, y);

  // Legend
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...GRAY_500);
  doc.text("* = você", ML + CW - 12, y, { align: "right" });
  y += 5;

  const posKeys = Object.keys(POS_META);
  const cols = 4;
  const colW = CW / cols;
  const rowH = 7;

  entries.forEach((entry) => {
    const { sun, isLead, lineup } = entry;
    const dateStr = `${String(sun.getDate()).padStart(2, "0")}/${String(sun.getMonth() + 1).padStart(2, "0")}/${sun.getFullYear()}`;

    // Date header bar
    doc.setFillColor(...NAVY);
    doc.roundedRect(ML, y, CW, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...WHITE);
    doc.text(`DOMINGO  ${dateStr}`, ML + 3, y + 3.8);

    if (isLead) {
      doc.setFillColor(...GOLD);
      doc.roundedRect(ML + CW - 22, y + 1, 18, 3.5, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.setTextColor(...NAVY);
      doc.text("LEAD", ML + CW - 13, y + 3.5, { align: "center" });
    }

    y += 6;

    // Position grid — 4 columns, ceil(7/4)=2 rows
    const rowCount = Math.ceil(posKeys.length / cols);
    for (let r = 0; r < rowCount; r++) {
      doc.setFillColor(...(r % 2 === 0 ? GRAY_50 : WHITE));
      doc.rect(ML, y, CW, rowH, "F");

      // Vertical column dividers
      for (let vc = 1; vc < cols; vc++) {
        const divX = ML + vc * colW;
        if (r * cols + vc < posKeys.length || r === 0) {
          doc.setDrawColor(...GRAY_200);
          doc.setLineWidth(0.1);
          doc.line(divX, y, divX, y + rowH);
        }
      }

      for (let c = 0; c < cols; c++) {
        const pi = r * cols + c;
        if (pi >= posKeys.length) break;

        const pid = posKeys[pi];
        const meta = POS_META[pid];
        const x = ML + c * colW + 2;

        // Position label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5);
        doc.setTextColor(...meta.color);
        doc.text(meta.label, x, y + 2.8);

        // Musician name(s)
        const nameStr = lineup[pid];
        const hasMe = nameStr.includes("*");
        doc.setFont("helvetica", hasMe ? "bold" : "normal");
        doc.setFontSize(6);
        doc.setTextColor(...(nameStr === "-" ? GRAY_400 : GRAY_700));

        // Truncate if too long for column
        const maxTextW = colW - 4;
        let display = nameStr;
        while (doc.getTextWidth(display) > maxTextW && display.length > 3) {
          display = display.slice(0, -2) + "...";
        }
        doc.text(display, x, y + 5.8);
      }

      // Bottom border of row
      doc.setDrawColor(...GRAY_200);
      doc.setLineWidth(0.1);
      doc.line(ML, y + rowH, ML + CW, y + rowH);

      y += rowH;
    }

    y += 2.5; // gap between Sundays
  });

  return y;
}

// ─── DRAW: FOOTER ────────────────────────────────────────────────────────────
function drawFooter(doc, pageNum) {
  const y = H - 8;
  doc.setDrawColor(...GRAY_200);
  doc.setLineWidth(0.2);
  doc.line(ML, y - 2, W - MR, y - 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...GRAY_400);
  doc.text(`Gerado em ${nowStr()}  |  Escala de Músicos  |  Verbo da Vida Orlando`, ML, y);
  doc.text(`Página ${pageNum}`, W - MR, y, { align: "right" });
}

// ─── COMPUTE MONTH DATA ─────────────────────────────────────────────────────
function computeMonthData(mid, sched, sundays, blockDates) {
  const scheduledSet = new Set();
  sundays.forEach((_, si) => {
    Object.keys(POS_META).forEach(pid => {
      const maxSlots = pid === "vocal_back" ? 3 : 1;
      for (let s = 0; s < maxSlots; s++) {
        if (sched[`${si}-${pid}-${s}`] === mid) scheduledSet.add(si);
      }
    });
  });

  const musicianSundays = [...scheduledSet].sort((a,b)=>a-b).map(si => sundays[si]);
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

  return {
    musicianSundays,
    blockedDatesList,
    leadSundays,
    positionsPlayed,
    stats: {
      scheduled: musicianSundays.length,
      folgas: sundays.length - musicianSundays.length,
      leads: leadSundays.length,
      blocked: blockedDatesList.length,
    },
  };
}

// ─── RENDER ONE MONTH PAGE ──────────────────────────────────────────────────
function renderMonthPage(doc, musician, yr, mo, sched, blockDates, pageNum, musicians) {
  const mid = musician.id;
  const vc = getVC(mid);
  const sundays = getSundays(yr, mo);
  const monthLabel = `${MONTHS_PT[mo]} ${yr}`;
  const data = computeMonthData(mid, sched, sundays, blockDates);

  let y = drawHeader(doc, musician, monthLabel, vc);
  y = drawStats(doc, data.stats, y);
  y = drawCalendar(doc, yr, mo, sundays, data.musicianSundays, data.blockedDatesList, data.leadSundays, vc, y);
  y = drawPositions(doc, data.positionsPlayed, musician.roles || [], y);
  y = drawDetailTable(doc, sundays, sched, mid, musicians, y);

  drawFooter(doc, pageNum);
}

// ─── GENERATE SINGLE MUSICIAN REPORT ────────────────────────────────────────
export function generateMusicianPDF(musician, allSchedules, blockDates, musicians) {
  const monthKeys = Object.keys(allSchedules)
    .filter(k => allSchedules[k] && Object.keys(allSchedules[k]).length > 0).sort();

  if (monthKeys.length === 0) return null;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setProperties({ title: `Relatório - ${musician.name}`, author: "Escala de Músicos — Verbo da Vida Orlando" });

  monthKeys.forEach((mk, idx) => {
    const [yStr, mStr] = mk.split("-");
    if (idx > 0) doc.addPage();
    renderMonthPage(doc, musician, parseInt(yStr), parseInt(mStr), allSchedules[mk], blockDates, idx + 1, musicians || []);
  });

  return doc;
}

// ─── GENERATE ALL MUSICIANS PDF (Combined) ──────────────────────────────────
export function generateAllMusiciansPDF(musicians, allSchedules, blockDates) {
  const active = musicians.filter(m => !m.manualOnly);
  const monthKeys = Object.keys(allSchedules)
    .filter(k => allSchedules[k] && Object.keys(allSchedules[k]).length > 0).sort();

  if (monthKeys.length === 0 || active.length === 0) return null;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setProperties({ title: "Relatório Completo — Todos os Músicos", author: "Escala de Músicos — Verbo da Vida Orlando" });

  let pageNum = 0;
  let isFirst = true;

  active.forEach(musician => {
    monthKeys.forEach(mk => {
      const [yStr, mStr] = mk.split("-");
      if (!isFirst) doc.addPage();
      isFirst = false;
      pageNum++;
      renderMonthPage(doc, musician, parseInt(yStr), parseInt(mStr), allSchedules[mk], blockDates, pageNum, active);
    });
  });

  return doc;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDSCAPE CALENDAR-ONLY PDF (general overview — no individual musician detail)
// ═══════════════════════════════════════════════════════════════════════════════

// RGB colors per musician (matching site VOCALIST_COLORS)
const MUSICIAN_COLORS = {
  hugo:     { bg: [232,168,56],  text: [232,168,56] },
  jokasta:  { bg: [168,130,255], text: [168,130,255] },
  matheu:   { bg: [91,200,175],  text: [91,200,175] },
  leandro:  { bg: [105,180,255], text: [105,180,255] },
  aline:    { bg: [255,130,180], text: [255,130,180] },
  ana:      { bg: [255,200,100], text: [255,200,100] },
  clivison: { bg: [152,217,130], text: [152,217,130] },
  madalena: { bg: [255,140,105], text: [255,140,105] },
  marcus:   { bg: [200,160,220], text: [200,160,220] },
  wendell:  { bg: [180,200,140], text: [180,200,140] },
  josh:     { bg: [140,190,210], text: [140,190,210] },
  asafe:    { bg: [168,130,255], text: [168,130,255] },
};
const DEF_MC = { bg: [201,169,110], text: [201,169,110] };
function getMC(id) { return MUSICIAN_COLORS[id] || DEF_MC; }

// Position colors for row headers (matching site POSITIONS)
const POS_COLORS = {
  vocal_principal: [232,168,56],
  vocal_back:      [155,138,255],
  teclado:         [91,200,175],
  violao:          [255,140,105],
  baixo:           [105,180,255],
  guitarra:        [255,105,180],
  bateria:         [152,217,130],
};

const LANDSCAPE_POSITIONS = [
  { id: "vocal_principal", label: "Vocal Principal", slots: 1 },
  { id: "vocal_back",      label: "Back Vocal #1",   parentId: "vocal_back", slot: 0 },
  { id: "vocal_back_1",    label: "Back Vocal #2",   parentId: "vocal_back", slot: 1 },
  { id: "vocal_back_2",    label: "Back Vocal #3",   parentId: "vocal_back", slot: 2 },
  { id: "teclado",         label: "Teclado" },
  { id: "violao",          label: "Violão" },
  { id: "baixo",           label: "Baixo" },
  { id: "guitarra",        label: "Guitarra" },
  { id: "bateria",         label: "Bateria" },
];

function fmt2(d) {
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
}

function renderCalendarPage(doc, yr, mo, sched, musicians, pageNum) {
  const LW = 297, LH = 210;
  const LML = 14, LMR = 14;
  const LCW = LW - LML - LMR;

  const sundays = getSundays(yr, mo);
  const monthLabel = `${MONTHS_PT[mo]} ${yr}`;
  const getName = (id) => {
    const m = musicians.find(x => x.id === id);
    return m ? m.short : (id || "");
  };

  // ── Gold top accent
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, LW, 2.5, "F");

  // ── Header
  let y = 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY_400);
  doc.text("MINISTÉRIO DE LOUVOR  |  ESCALA DE MÚSICOS", LML, y);
  doc.text("VERBO DA VIDA ORLANDO", LW - LMR, y, { align: "right" });

  y += 2;
  doc.setDrawColor(...GRAY_200);
  doc.setLineWidth(0.3);
  doc.line(LML, y, LW - LMR, y);

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text("Escala Geral", LML, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...GOLD_DARK);
  doc.text(monthLabel, LW - LMR, y, { align: "right" });

  y += 2.5;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(LML, y, LML + 38, y);

  y += 5;

  // ── Calendar grid
  const labelColW = 36;
  const numSundays = sundays.length;
  const sundayColW = (LCW - labelColW) / numSundays;
  const headerH = 14;
  const totalRows = LANDSCAPE_POSITIONS.length; // 9
  const availH = LH - y - 14; // footer space
  const rowH = Math.min(Math.floor(availH / totalRows * 10) / 10, 15);
  const tableH = headerH + totalRows * rowH;

  // Outer border
  doc.setDrawColor(...GRAY_200);
  doc.setLineWidth(0.4);
  doc.rect(LML, y, LCW, tableH);

  // ── Column headers (Sundays)
  doc.setFillColor(...NAVY);
  doc.rect(LML, y, LCW, headerH, "F");

  // Position label header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD_LT);
  doc.text("POSIÇÃO", LML + labelColW / 2, y + 8.5, { align: "center" });

  // Sunday column headers with lead color stripe
  sundays.forEach((s, i) => {
    const colX = LML + labelColW + i * sundayColW;
    const cx = colX + sundayColW / 2;

    // Lead vocalist color stripe
    const leadId = sched[`${i}-vocal_principal-0`];
    if (leadId) {
      const mc = getMC(leadId);
      doc.setFillColor(...mc.bg);
      doc.rect(colX, y + headerH - 2.5, sundayColW, 2.5, "F");
    }

    // Column dividers in header
    if (i > 0) {
      doc.setDrawColor(50, 60, 80);
      doc.setLineWidth(0.1);
      doc.line(colX, y, colX, y + headerH);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GOLD_LT);
    doc.text(`DOM ${i + 1}`, cx, y + 4.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...WHITE);
    doc.text(fmt2(s), cx, y + 10.5, { align: "center" });
  });

  y += headerH;

  // ── Data rows
  LANDSCAPE_POSITIONS.forEach((pos, ri) => {
    const rowY = y + ri * rowH;
    const posBaseId = pos.parentId || pos.id;
    const slotIdx = pos.slot !== undefined ? pos.slot : 0;
    const posColor = POS_COLORS[posBaseId] || GRAY_500;

    // Alternating row background
    doc.setFillColor(...(ri % 2 === 0 ? [248, 249, 251] : WHITE));
    doc.rect(LML, rowY, LCW, rowH, "F");

    // Row bottom border
    doc.setDrawColor(...GRAY_200);
    doc.setLineWidth(0.15);
    doc.line(LML, rowY + rowH, LML + LCW, rowY + rowH);

    // Position label with color accent bar
    doc.setFillColor(...posColor);
    doc.rect(LML, rowY, 2, rowH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...posColor);
    doc.text(pos.label, LML + 5, rowY + rowH / 2 + 1);

    // Vertical divider after label
    doc.setDrawColor(...GRAY_200);
    doc.setLineWidth(0.3);
    doc.line(LML + labelColW, rowY, LML + labelColW, rowY + rowH);

    // Cell values
    sundays.forEach((_, si) => {
      const cellX = LML + labelColW + si * sundayColW;
      const cx = cellX + sundayColW / 2;
      const assignedId = sched[`${si}-${posBaseId}-${slotIdx}`];

      // Vertical column divider
      if (si > 0) {
        doc.setDrawColor(...GRAY_200);
        doc.setLineWidth(0.1);
        doc.line(cellX, rowY, cellX, rowY + rowH);
      }

      if (assignedId) {
        const mc = getMC(assignedId);
        const name = getName(assignedId);

        // Colored cell background (light tint)
        doc.setFillColor(
          Math.round(255 - (255 - mc.bg[0]) * 0.15),
          Math.round(255 - (255 - mc.bg[1]) * 0.15),
          Math.round(255 - (255 - mc.bg[2]) * 0.15)
        );
        doc.rect(cellX + 0.5, rowY + 0.5, sundayColW - 1, rowH - 1, "F");

        // Left color accent in cell
        doc.setFillColor(...mc.bg);
        doc.rect(cellX + 0.5, rowY + 0.5, 1.5, rowH - 1, "F");

        // Musician name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(
          Math.round(mc.text[0] * 0.6),
          Math.round(mc.text[1] * 0.6),
          Math.round(mc.text[2] * 0.6)
        );

        let display = name;
        while (doc.getTextWidth(display) > sundayColW - 6 && display.length > 3) {
          display = display.slice(0, -2) + "..";
        }
        doc.text(display, cx + 1, rowY + rowH / 2 + 1, { align: "center" });

        // LEAD sub-label for vocal principal
        if (posBaseId === "vocal_principal") {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(5);
          doc.setTextColor(
            Math.round(mc.text[0] * 0.7),
            Math.round(mc.text[1] * 0.7),
            Math.round(mc.text[2] * 0.7)
          );
          doc.text("LEAD", cx + 1, rowY + rowH / 2 + 4.5, { align: "center" });
        }
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...GRAY_200);
        doc.text("-", cx, rowY + rowH / 2 + 1, { align: "center" });
      }
    });
  });

  // ── Footer
  const footerY = LH - 7;
  doc.setDrawColor(...GRAY_200);
  doc.setLineWidth(0.2);
  doc.line(LML, footerY - 2, LW - LMR, footerY - 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...GRAY_400);
  doc.text(`Gerado em ${nowStr()}  |  Escala de Músicos  |  Verbo da Vida Orlando`, LML, footerY);
  doc.text(`Página ${pageNum}`, LW - LMR, footerY, { align: "right" });
}

export function generateCalendarPDF(allSchedules, musicians) {
  const monthKeys = Object.keys(allSchedules)
    .filter(k => allSchedules[k] && Object.keys(allSchedules[k]).length > 0).sort();

  if (monthKeys.length === 0) return null;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setProperties({ title: "Escala Geral — Calendário", author: "Escala de Músicos — Verbo da Vida Orlando" });

  monthKeys.forEach((mk, idx) => {
    const [yStr, mStr] = mk.split("-");
    if (idx > 0) doc.addPage("a4", "landscape");
    renderCalendarPage(doc, parseInt(yStr), parseInt(mStr), allSchedules[mk], musicians, idx + 1);
  });

  return doc;
}
