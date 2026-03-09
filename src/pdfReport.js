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
        if (aid) names.push(getName(aid) + (aid === musicianId ? " \u2605" : ""));
      }
      lineup[pid] = names.length > 0 ? names.join(", ") : "\u2014";
    });

    entries.push({ sun, isLead, lineup });
  });

  if (entries.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_400);
    doc.text("Nenhuma escala\u00e7\u00e3o neste m\u00eas.", ML, y + 4);
    return y + 10;
  }

  // Section title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text("ESCALA\u00c7\u00c3O COMPLETA POR DOMINGO", ML, y);

  // Legend
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...GRAY_500);
  doc.text("\u2605 = voc\u00ea", ML + CW - 12, y, { align: "right" });
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
        const hasMe = nameStr.includes("\u2605");
        doc.setFont("helvetica", hasMe ? "bold" : "normal");
        doc.setFontSize(6);
        doc.setTextColor(...(nameStr === "\u2014" ? GRAY_400 : GRAY_700));

        // Truncate if too long for column
        const maxTextW = colW - 4;
        let display = nameStr;
        while (doc.getTextWidth(display) > maxTextW && display.length > 3) {
          display = display.slice(0, -2) + "\u2026";
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
