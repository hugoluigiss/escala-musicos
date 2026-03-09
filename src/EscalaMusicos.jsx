import { useState, useEffect, useRef } from "react";
import { generateMusicianPDF, generateAllMusiciansPDF } from "./pdfReport.js";
// ─── DEFAULT DATA ────────────────────────────────────────────────────────────
const DEFAULT_MUSICIANS = [
  { id: "hugo", name: "Hugo Luigi", short: "Hugo", roles: ["vocal_principal","vocal_back","teclado","violao"], canDoubleVocalViolao: true, noFolgaRequired: true },
  { id: "asafe", name: "Asafe", short: "Asafe", roles: ["teclado","violao","baixo","bateria"], coupleId: "jokasta" },
  { id: "jokasta", name: "Jokasta", short: "Jokasta", roles: ["vocal_principal","vocal_back"], coupleId: "asafe" },
  { id: "matheu", name: "Matheu Emanuel", short: "Matheu", roles: ["vocal_principal","vocal_back","bateria"] },
  { id: "leandro", name: "Leandro Guimarães", short: "Leandro", roles: ["vocal_principal","vocal_back","violao","baixo"], canDoubleVocalViolao: true, coupleId: "aline" },
  { id: "aline", name: "Aline Guimarães", short: "Aline", roles: ["vocal_principal","vocal_back"], coupleId: "leandro" },
  { id: "marcus", name: "Marcus", short: "Marcus", roles: ["guitarra"] },
  { id: "wendell", name: "Wendell", short: "Wendell", roles: ["violao"] },
  { id: "josh", name: "Josh", short: "Josh", roles: ["bateria"] },
  { id: "ana", name: "Ana Tiscianeli", short: "Ana", roles: ["vocal_principal","vocal_back"], maxPerMonth: 1 },
  { id: "clivison", name: "Clivison", short: "Clivison", roles: ["vocal_principal","vocal_back"] },
  { id: "madalena", name: "Madalena", short: "Madalena", roles: ["vocal_principal","vocal_back"], alternating: true },
];
// ─── VOCALIST COLORS ────────────────────────────────────────────────────────
const VOCALIST_COLORS = {
  hugo:     { bg: "rgba(232,168,56,0.20)",  border: "rgba(232,168,56,0.45)",  text: "#e8a838", tag: "#e8a838" },
  jokasta:  { bg: "rgba(168,130,255,0.20)", border: "rgba(168,130,255,0.45)", text: "#a882ff", tag: "#a882ff" },
  matheu:   { bg: "rgba(91,200,175,0.20)",  border: "rgba(91,200,175,0.45)",  text: "#5bc8af", tag: "#5bc8af" },
  leandro:  { bg: "rgba(105,180,255,0.20)", border: "rgba(105,180,255,0.45)", text: "#69b4ff", tag: "#69b4ff" },
  aline:    { bg: "rgba(255,130,180,0.20)", border: "rgba(255,130,180,0.45)", text: "#ff82b4", tag: "#ff82b4" },
  ana:      { bg: "rgba(255,200,100,0.20)", border: "rgba(255,200,100,0.45)", text: "#ffc864", tag: "#ffc864" },
  clivison: { bg: "rgba(152,217,130,0.20)", border: "rgba(152,217,130,0.45)", text: "#98d982", tag: "#98d982" },
  madalena: { bg: "rgba(255,140,105,0.20)", border: "rgba(255,140,105,0.45)", text: "#ff8c69", tag: "#ff8c69" },
};
const DEFAULT_VOCALIST_COLOR = { bg: "rgba(201,169,110,0.15)", border: "rgba(201,169,110,0.3)", text: "#c9a96e", tag: "#c9a96e" };
function getVocalistColor(id) { return VOCALIST_COLORS[id] || DEFAULT_VOCALIST_COLOR; }

const POSITIONS = [
  { id: "vocal_principal", label: "Vocal Principal", count: 1, icon: "\u{1F3A4}", color: "#e8a838", required: true },
  { id: "vocal_back", label: "Back Vocal", count: 3, icon: "\u{1F3B5}", color: "#9b8aff", required: false, minCount: 2 },
  { id: "teclado", label: "Teclado", count: 1, icon: "\u{1F3B9}", color: "#5bc8af", required: true },
  { id: "violao", label: "Violão", count: 1, icon: "\u{1F3B8}", color: "#ff8c69", required: false },
  { id: "baixo", label: "Baixo", count: 1, icon: "\u{1F3BC}", color: "#69b4ff", required: false },
  { id: "guitarra", label: "Guitarra", count: 1, icon: "\u26A1", color: "#ff69b4", required: false },
  { id: "bateria", label: "Bateria", count: 1, icon: "\u{1F941}", color: "#98d982", required: true },
];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
// ─── API HELPERS ─────────────────────────────────────────────────────────────
async function apiGet(key) {
  try {
    const res = await fetch(`/api/data/${key}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`API GET ${key} failed, trying localStorage:`, e.message);
    try { const v = localStorage.getItem(`escala_${key}`); return v ? JSON.parse(v) : null; }
    catch { return null; }
  }
}
async function apiPut(key, value) {
  try {
    const res = await fetch(`/api/data/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.warn(`API PUT ${key} failed, saving to localStorage:`, e.message);
    try { localStorage.setItem(`escala_${key}`, JSON.stringify(value)); } catch {}
  }
}
// ─── HELPERS ────────────────────────────────────────────────────────────────
function getSundays(year, month) {
  const sundays = [];
  const d = new Date(year, month, 1);
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  while (d.getMonth() === month) { sundays.push(new Date(d)); d.setDate(d.getDate() + 7); }
  return sundays;
}
function fmt(date) { return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}`; }
function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

// ─── PREVIOUS MONTH STATS ─────────────────────────────────────────────────
// Extracts participation counts from a previous month's schedule
function getPrevMonthStats(prevSchedule, prevSundays, musicians) {
  if (!prevSchedule || Object.keys(prevSchedule).length === 0) return null;
  const total = prevSundays.length;
  const counts = {};
  const folgaCounts = {};
  const lastLeadId = null;
  musicians.forEach(m => { counts[m.id] = 0; folgaCounts[m.id] = 0; });
  // Count participations
  const sundaysByMusician = {};
  musicians.forEach(m => { sundaysByMusician[m.id] = new Set(); });
  Object.entries(prevSchedule).forEach(([key, val]) => {
    const si = parseInt(key.split("-")[0]);
    if (sundaysByMusician[val]) sundaysByMusician[val].add(si);
  });
  musicians.forEach(m => {
    counts[m.id] = sundaysByMusician[m.id]?.size || 0;
    folgaCounts[m.id] = total - (sundaysByMusician[m.id]?.size || 0);
  });
  // Get last lead of previous month
  let lastLead = null;
  for (let si = total - 1; si >= 0; si--) {
    const lid = prevSchedule[`${si}-vocal_principal-0`];
    if (lid) { lastLead = lid; break; }
  }
  return { counts, folgaCounts, lastLead, totalSundays: total };
}

// ─── SMART SCHEDULER v4 ────────────────────────────────────────────────────
// Phase 1: Plan folgas (who is OFF each Sunday)
// Phase 2: Assign positions from available musicians
// Now accepts blockDates and prevMonthStats for continuity
function generateSchedule(sundays, inputLeadRotation, musicians, leadVocalists, blockDates, prevMonthStats) {
  const total = sundays.length;
  const schedule = {};
  const getM = (id) => musicians.find(m => m.id === id);

  // Filter out manualOnly musicians — they are NEVER auto-assigned
  const autoMusicians = musicians.filter(m => !m.manualOnly);
  const autoLeadVocalists = leadVocalists.filter(id => !getM(id)?.manualOnly);

  // ═══ PHASE 1: Plan availability per Sunday ═══
  const avail = Array.from({ length: total }, () => new Set(autoMusicians.map(m => m.id)));

  // 1a. BLOCK DATES — remove musicians on their blocked Sundays
  if (blockDates && typeof blockDates === "object") {
    for (let si = 0; si < total; si++) {
      const dk = dateKey(sundays[si]);
      autoMusicians.forEach(m => {
        const blocked = blockDates[m.id];
        if (Array.isArray(blocked) && blocked.includes(dk)) {
          avail[si].delete(m.id);
        }
      });
    }
  }

  // 1b. Alternating musicians (e.g., Madalena): off every other Sunday
  autoMusicians.filter(m => m.alternating).forEach(m => {
    for (let si = 1; si < total; si += 2) avail[si].delete(m.id);
  });

  // 1c. maxPerMonth musicians (e.g., Ana: plays only 1 Sunday)
  autoMusicians.filter(m => m.maxPerMonth).forEach(m => {
    const plays = new Set();
    for (let i = 0; i < Math.min(m.maxPerMonth, total); i++) {
      plays.add(Math.round(i * total / m.maxPerMonth));
    }
    for (let si = 0; si < total; si++) {
      if (!plays.has(si)) avail[si].delete(m.id);
    }
  });

  // 1d. Build couple/individual groups that need folga
  const groups = [];
  const seen = new Set();
  autoMusicians.forEach(m => {
    if (seen.has(m.id) || m.noFolgaRequired || m.alternating || m.maxPerMonth) {
      seen.add(m.id);
      return;
    }
    if (m.coupleId && !seen.has(m.coupleId)) {
      groups.push([m.id, m.coupleId]);
      seen.add(m.id);
      seen.add(m.coupleId);
    } else if (!m.coupleId) {
      groups.push([m.id]);
      seen.add(m.id);
    }
  });

  // Sort: couples first (bigger impact), then individuals
  groups.sort((a, b) => b.length - a.length);

  // Assign 1 folga per group, spreading across Sundays evenly
  // Consider previous month: groups with more plays last month get priority folga on busier Sundays
  groups.forEach((group, gi) => {
    // Skip groups that already have block-date absences this month
    const hasBlockedSunday = group.some(id => {
      for (let si = 0; si < total; si++) {
        if (!avail[si].has(id)) return true;
      }
      return false;
    });
    if (hasBlockedSunday) return; // They already have forced absences

    // Use previous month stats to influence folga assignment
    let bestSi = gi % total;
    let bestScore = Infinity;
    for (let si = 0; si < total; si++) {
      const offCount = autoMusicians.length - avail[si].size;
      // If prev month stats available, prefer giving folga to groups that played more
      let prevBonus = 0;
      if (prevMonthStats) {
        const groupPlays = group.reduce((sum, id) => sum + (prevMonthStats.counts[id] || 0), 0);
        prevBonus = -groupPlays * 0.1; // More plays last month → lower score → higher priority
      }
      const score = offCount + prevBonus;
      if (score < bestScore) {
        bestScore = score;
        bestSi = si;
      }
    }
    group.forEach(id => avail[bestSi].delete(id));
  });

  // 1e. ENFORCE couple constraint: if one partner is off, the other MUST be off too
  for (let si = 0; si < total; si++) {
    autoMusicians.forEach(m => {
      if (!m.coupleId) return;
      const iIn = avail[si].has(m.id);
      const partnerIn = avail[si].has(m.coupleId);
      if (iIn && !partnerIn) avail[si].delete(m.id);
      if (!iIn && partnerIn) avail[si].delete(m.coupleId);
    });
  }

  // ═══ PHASE 2: Assign positions ═══
  // Build robust lead rotation queue (only auto musicians)
  let leadQ = Array.isArray(inputLeadRotation) && inputLeadRotation.length > 0
    ? [...inputLeadRotation] : [...autoLeadVocalists];
  // Keep only valid auto vocalist IDs
  leadQ = leadQ.filter(id => autoLeadVocalists.includes(id));
  // Make sure all auto vocalists are in the queue
  autoLeadVocalists.forEach(id => { if (!leadQ.includes(id)) leadQ.push(id); });

  // If we have previous month stats, ensure the last lead doesn't lead first this month
  if (prevMonthStats?.lastLead && leadQ[0] === prevMonthStats.lastLead) {
    const idx = leadQ.indexOf(prevMonthStats.lastLead);
    if (idx === 0 && leadQ.length > 1) {
      // Move last month's final lead to end of queue
      leadQ.push(leadQ.shift());
    }
  }

  // Initialize sundayCount with previous month awareness
  const sundayCount = {};
  autoMusicians.forEach(m => {
    // Start with a small bias from previous month to balance across months
    sundayCount[m.id] = prevMonthStats ? Math.round((prevMonthStats.counts[m.id] || 0) * 0.3) : 0;
  });

  for (let si = 0; si < total; si++) {
    const pool = avail[si];
    const used = new Set();

    // ── 1. Lead Vocal (round-robin rotation) ──
    let lead = null;
    for (let i = 0; i < leadQ.length; i++) {
      if (pool.has(leadQ[i])) {
        lead = leadQ.splice(i, 1)[0];
        break;
      }
    }
    // Only refill queue when ALL vocalists have had their turn (queue empty)
    // If queue still has people (just blocked this Sunday), don't refill — keep them for next Sunday
    if (!lead && leadQ.length === 0) {
      leadQ = [...autoLeadVocalists];
      for (let i = 0; i < leadQ.length; i++) {
        if (pool.has(leadQ[i])) {
          lead = leadQ.splice(i, 1)[0];
          break;
        }
      }
    }

    if (lead) {
      schedule[`${si}-vocal_principal-0`] = lead;
      used.add(lead);
      sundayCount[lead]++;

      // Partner of lead → auto back vocal
      const leadM = getM(lead);
      if (leadM?.coupleId && pool.has(leadM.coupleId)) {
        const partner = getM(leadM.coupleId);
        if (partner?.roles.includes("vocal_back") && !used.has(partner.id)) {
          schedule[`${si}-vocal_back-0`] = partner.id;
          used.add(partner.id);
          sundayCount[partner.id]++;
        }
      }
    }

    // ── 2. Teclado (REQUIRED — assign before violão so Hugo can cover) ──
    {
      const cands = autoMusicians
        .filter(m => pool.has(m.id) && m.roles.includes("teclado") && !used.has(m.id))
        .sort((a, b) => sundayCount[a.id] - sundayCount[b.id]);
      if (cands.length > 0) {
        schedule[`${si}-teclado-0`] = cands[0].id;
        used.add(cands[0].id);
        sundayCount[cands[0].id]++;
      } else if (lead) {
        // If no one else can play teclado, check if lead can
        const leadM = getM(lead);
        if (leadM?.roles.includes("teclado")) {
          schedule[`${si}-teclado-0`] = lead;
        }
      }
    }

    // ── 3. Bateria (REQUIRED) ──
    {
      const cands = autoMusicians
        .filter(m => pool.has(m.id) && m.roles.includes("bateria") && !used.has(m.id))
        .sort((a, b) => sundayCount[a.id] - sundayCount[b.id]);
      if (cands.length > 0) {
        schedule[`${si}-bateria-0`] = cands[0].id;
        used.add(cands[0].id);
        sundayCount[cands[0].id]++;
      }
    }

    // ── 4. Violão (Hugo/Leandro double only if they're lead AND not needed for teclado) ──
    if (lead) {
      const leadM = getM(lead);
      if (leadM?.canDoubleVocalViolao && schedule[`${si}-teclado-0`] !== lead) {
        schedule[`${si}-violao-0`] = lead;
      }
    }
    if (!schedule[`${si}-violao-0`]) {
      const cands = autoMusicians
        .filter(m => pool.has(m.id) && m.roles.includes("violao") && !used.has(m.id))
        .sort((a, b) => sundayCount[a.id] - sundayCount[b.id]);
      if (cands.length > 0) {
        schedule[`${si}-violao-0`] = cands[0].id;
        used.add(cands[0].id);
        sundayCount[cands[0].id]++;
      }
    }

    // ── 5. Back Vocals (target: 2 minimum, 3rd is bonus) ──
    let bSlot = [0, 1, 2].filter(s => schedule[`${si}-vocal_back-${s}`]).length;
    const backPool = autoMusicians
      .filter(m => pool.has(m.id) && m.roles.includes("vocal_back") && !used.has(m.id))
      .sort((a, b) => sundayCount[a.id] - sundayCount[b.id]);

    for (const bv of backPool) {
      if (bSlot >= 3) break;
      schedule[`${si}-vocal_back-${bSlot}`] = bv.id;
      used.add(bv.id);
      sundayCount[bv.id]++;
      bSlot++;
    }

    // ── 6. Remaining instruments (baixo, guitarra) ──
    for (const posId of ["baixo", "guitarra"]) {
      if (schedule[`${si}-${posId}-0`]) continue;
      const cands = autoMusicians
        .filter(m => pool.has(m.id) && m.roles.includes(posId) && !used.has(m.id))
        .sort((a, b) => sundayCount[a.id] - sundayCount[b.id]);
      if (cands.length > 0) {
        schedule[`${si}-${posId}-0`] = cands[0].id;
        used.add(cands[0].id);
        sundayCount[cands[0].id]++;
      }
    }
  }

  // Return remaining queue (if empty, refill)
  if (leadQ.length === 0) leadQ = [...autoLeadVocalists];
  return { schedule, newLeadQueue: leadQ };
}

// ─── CONFLICT ANALYZER ──────────────────────────────────────────────────────
function analyzeConflicts(schedule, sundays, leadRotationHistory, musicians, leadVocalists, blockDates) {
  const conflicts = [];
  const totalSundays = sundays.length;
  const getMusicianById = (id) => musicians.find(m => m.id === id);
  const counts = {};
  const sundaysByMusician = {};
  musicians.forEach(m => { counts[m.id] = 0; sundaysByMusician[m.id] = []; });
  Object.entries(schedule).forEach(([key, val]) => {
    const si = parseInt(key.split("-")[0]);
    if (!counts[val] && counts[val] !== 0) return;
    counts[val]++;
    if (!sundaysByMusician[val].includes(si)) sundaysByMusician[val].push(si);
  });
  for (let si = 0; si < totalSundays; si++) {
    if (!schedule[`${si}-vocal_principal-0`]) {
      conflicts.push({ type: "missing_required", severity: "error", msg: `Domingo ${si+1}: sem Vocal Principal (obrigatório)` });
    }
    if (!schedule[`${si}-teclado-0`]) {
      conflicts.push({ type: "missing_required", severity: "error", msg: `Domingo ${si+1}: sem Teclado (obrigatório)` });
    }
    if (!schedule[`${si}-bateria-0`]) {
      conflicts.push({ type: "missing_required", severity: "error", msg: `Domingo ${si+1}: sem Bateria (obrigatório)` });
    }
    const backCount = [0,1,2].filter(s => schedule[`${si}-vocal_back-${s}`]).length;
    if (backCount < 2) {
      conflicts.push({ type: "low_back", severity: "warning", msg: `Domingo ${si+1}: apenas ${backCount} back vocal (mínimo recomendado: 2)` });
    }
    // Check couple consistency
    musicians.forEach(m => {
      if (!m.coupleId) return;
      const mySuns = sundaysByMusician[m.id] || [];
      const partnerSuns = sundaysByMusician[m.coupleId] || [];
      const mOn = mySuns.includes(si);
      const partOn = partnerSuns.includes(si);
      if (mOn !== partOn) {
        const partner = getMusicianById(m.coupleId);
        const alreadyReported = conflicts.some(c => c.type === "couple" && c.si === si && c.ids?.includes(m.id));
        if (!alreadyReported) {
          conflicts.push({ type: "couple", severity: "warning", si, ids: [m.id, m.coupleId],
            msg: `Casal ${m.name} & ${partner?.name}: folgas diferentes no domingo ${si+1}` });
        }
      }
    });
    // Check if someone is scheduled on a blocked date
    if (blockDates && typeof blockDates === "object") {
      const dk = dateKey(sundays[si]);
      musicians.forEach(m => {
        const blocked = blockDates[m.id];
        if (Array.isArray(blocked) && blocked.includes(dk)) {
          const isAssigned = Object.entries(schedule).some(([k, v]) => {
            const parts = k.split("-");
            return parseInt(parts[0]) === si && v === m.id;
          });
          if (isAssigned) {
            conflicts.push({ type: "blocked_date", severity: "error",
              msg: `${m.name} está escalado(a) no domingo ${si+1} (${fmt(sundays[si])}) mas marcou como indisponível!` });
          }
        }
      });
    }
  }
  musicians.forEach(m => {
    const count = (sundaysByMusician[m.id] || []).length;
    const offWeeks = totalSundays - count;
    if (offWeeks === 0 && totalSundays >= 4 && !m.noFolgaRequired) {
      conflicts.push({ type: "no_folga", severity: "error", msg: `${m.name} não tem nenhuma folga este mês` });
    }
    if (m.maxPerMonth && count > m.maxPerMonth) {
      conflicts.push({ type: "ana_limit", severity: "error", msg: `${m.name} escalada ${count}x (máximo ${m.maxPerMonth}x/mês)` });
    }
    if (m.alternating) {
      const suns = (sundaysByMusician[m.id] || []).sort();
      for (let i = 1; i < suns.length; i++) {
        if (suns[i] - suns[i-1] === 1) {
          conflicts.push({ type: "madalena", severity: "error", msg: `${m.name} escalada em domingos consecutivos (dom ${suns[i-1]+1} e ${suns[i]+1})` });
          break;
        }
      }
    }
  });
  // Build leads with Sunday indices for block-date aware checking
  const leadsWithSi = sundays.map((_, si) => ({ si, lead: schedule[`${si}-vocal_principal-0`] })).filter(x => x.lead);
  for (let i = 0; i < leadsWithSi.length; i++) {
    for (let j = i+1; j < leadsWithSi.length; j++) {
      if (leadsWithSi[i].lead === leadsWithSi[j].lead) {
        const between = leadsWithSi.slice(i+1, j).map(x => x.lead);
        // Sunday indices between the two lead appearances (where someone else could have led)
        const sundayIndicesBetween = leadsWithSi.slice(i+1, j).map(x => x.si);
        // Include the Sunday j itself as a slot where they could have been assigned
        const availableSlots = [...sundayIndicesBetween, leadsWithSi[j].si];

        const allLeads = leadVocalists.filter(id => {
          const m = getMusicianById(id);
          if (m?.manualOnly) return false; // Exclude manual-only musicians
          return !(m?.maxPerMonth && (sundaysByMusician[id]||[]).length >= m.maxPerMonth);
        });
        const notYetLed = allLeads.filter(id => {
          if (between.includes(id) || id === leadsWithSi[i].lead) return false;
          // If this person was blocked on ALL available slots, they couldn't have led — don't flag
          if (blockDates && typeof blockDates === "object") {
            const blocked = blockDates[id];
            if (Array.isArray(blocked) && blocked.length > 0) {
              const wasBlockedOnAll = availableSlots.every(si => {
                const dk = dateKey(sundays[si]);
                return blocked.includes(dk);
              });
              if (wasBlockedOnAll) return false;
            }
          }
          return true;
        });
        if (notYetLed.length > 0) {
          const m = getMusicianById(leadsWithSi[i].lead);
          const skippedNames = notYetLed.map(id => getMusicianById(id)?.short).filter(Boolean).join(", ");
          conflicts.push({ type: "lead_repeat", severity: "warning",
            msg: `${m?.name} lidera 2x antes de todos vocais liderarem (dom ${leadsWithSi[i].si+1} e ${leadsWithSi[j].si+1}) — faltam: ${skippedNames}` });
        }
      }
    }
  }
  return conflicts;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function EscalaMusicos() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [allSchedules, setAllSchedules] = useState({});
  const [leadRotation, setLeadRotation] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [activeTab, setActiveTab] = useState("escala");
  const [generating, setGenerating] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [musicians, setMusicians] = useState(DEFAULT_MUSICIANS);
  const [editingMusician, setEditingMusician] = useState(null);
  const [blockDates, setBlockDates] = useState({});
  const [showExport, setShowExport] = useState(false);
  const [exportRange, setExportRange] = useState("current"); // "current" | "custom"
  const [exportType, setExportType] = useState("complete"); // "schedule" | "complete"
  const [exportFromMonth, setExportFromMonth] = useState(today.getMonth());
  const [exportFromYear, setExportFromYear] = useState(today.getFullYear());
  const [exportToMonth, setExportToMonth] = useState(today.getMonth());
  const [exportToYear, setExportToYear] = useState(today.getFullYear());
  const [reportSelectedMonths, setReportSelectedMonths] = useState(null); // null = all, or Set of month keys
  const saveTimers = useRef({});
  const monthKey = `${year}-${month}`;
  const sundays = getSundays(year, month);
  const leadVocalists = musicians.filter(m => m.roles.includes("vocal_principal")).map(m => m.id);
  const getMusicianById = (id) => musicians.find(m => m.id === id);

  // ── Load from API on mount ──
  useEffect(() => {
    async function loadData() {
      try {
        const [schedules, rotation, musicianData, blockDatesData] = await Promise.all([
          apiGet("schedules"),
          apiGet("lead_rotation"),
          apiGet("musicians"),
          apiGet("block_dates"),
        ]);
        if (schedules) setAllSchedules(schedules);
        if (blockDatesData) setBlockDates(blockDatesData);
        if (musicianData) {
          setMusicians(musicianData);
          const lv = musicianData.filter(x => x.roles.includes("vocal_principal")).map(x => x.id);
          setLeadRotation(rotation && rotation.length > 0 ? rotation : lv);
        } else {
          const lv = DEFAULT_MUSICIANS.filter(x => x.roles.includes("vocal_principal")).map(x => x.id);
          setLeadRotation(rotation && rotation.length > 0 ? rotation : lv);
        }
      } catch(e) { console.error("Error loading data:", e); }
      setLoaded(true);
    }
    loadData();
  }, []);

  // ── Debounced save to API (per-key timers to avoid cancellation) ──
  function debouncedSave(key, value) {
    setSaving(true);
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(async () => {
      await apiPut(key, value);
      delete saveTimers.current[key];
      if (Object.keys(saveTimers.current).length === 0) setSaving(false);
    }, 500);
  }
  function persist(schedules, rotation) {
    debouncedSave("schedules", schedules);
    debouncedSave("lead_rotation", rotation);
  }
  function persistMusicians(newMusicians) {
    debouncedSave("musicians", newMusicians);
  }
  function persistBlockDates(newBlockDates) {
    debouncedSave("block_dates", newBlockDates);
  }

  const schedule = allSchedules[monthKey] || {};
  function setSchedule(newSched) {
    const updated = { ...allSchedules, [monthKey]: newSched };
    setAllSchedules(updated);
    persist(updated, leadRotation);
  }
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y-1); }
    else setMonth(m => m-1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y+1); }
    else setMonth(m => m+1);
  }
  function getMusicianSundays(musicianId, sched) {
    const s = sched || schedule;
    const present = new Set();
    Object.entries(s).forEach(([k,v]) => { if (v === musicianId) present.add(parseInt(k.split("-")[0])); });
    return present;
  }
  function isOnSunday(musicianId, si) { return getMusicianSundays(musicianId).has(si); }
  function getAssigned(si, posId, slot) { return schedule[`${si}-${posId}-${slot}`] || null; }
  function assign(si, posId, slot, musicianId) {
    const updated = { ...schedule, [`${si}-${posId}-${slot}`]: musicianId };
    if (posId === "vocal_principal" && getMusicianById(musicianId)?.canDoubleVocalViolao) {
      if (!updated[`${si}-teclado-0`] || updated[`${si}-teclado-0`] !== musicianId) {
        updated[`${si}-violao-0`] = musicianId;
      }
    }
    setSchedule(updated);
    setActiveCell(null);
  }
  function clearCell(si, posId, slot) {
    const updated = { ...schedule };
    const wasLead = posId === "vocal_principal" ? updated[`${si}-vocal_principal-0`] : null;
    delete updated[`${si}-${posId}-${slot}`];
    if (posId === "vocal_principal" && wasLead) {
      const m = getMusicianById(wasLead);
      if (m?.canDoubleVocalViolao && updated[`${si}-violao-0`] === wasLead) {
        delete updated[`${si}-violao-0`];
      }
    }
    setSchedule(updated);
  }

  // ── Block Dates helpers ──
  function toggleBlockDate(musicianId, sundayDate) {
    const dk = dateKey(sundayDate);
    const current = blockDates[musicianId] || [];
    const isBlocked = current.includes(dk);
    const updated = {
      ...blockDates,
      [musicianId]: isBlocked ? current.filter(d => d !== dk) : [...current, dk]
    };
    setBlockDates(updated);
    persistBlockDates(updated);
  }
  function isDateBlocked(musicianId, sundayDate) {
    const dk = dateKey(sundayDate);
    const blocked = blockDates[musicianId];
    return Array.isArray(blocked) && blocked.includes(dk);
  }
  function getBlockedCountForMonth(musicianId) {
    const blocked = blockDates[musicianId];
    if (!Array.isArray(blocked)) return 0;
    return blocked.filter(dk => {
      return sundays.some(s => dateKey(s) === dk);
    }).length;
  }
  function getMusiciansBlockedOnSunday(si) {
    if (si >= sundays.length) return [];
    const dk = dateKey(sundays[si]);
    return musicians.filter(m => {
      const blocked = blockDates[m.id];
      return Array.isArray(blocked) && blocked.includes(dk);
    });
  }

  // ── Export helpers ──
  function buildExportHTML(monthsToExport, includeStats = true) {
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Escala de Músicos</title>
<style>
  body { font-family: Georgia, serif; background: #fff; color: #222; padding: 20px; max-width: 900px; margin: 0 auto; }
  h1 { text-align: center; color: #333; font-size: 24px; margin-bottom: 4px; }
  .subtitle { text-align: center; color: #888; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 24px; }
  h2 { color: #8a6d3b; font-size: 18px; border-bottom: 2px solid #d4a84e; padding-bottom: 6px; margin-top: 30px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
  th { background: #f5f0e5; color: #8a6d3b; padding: 10px 6px; text-align: center; border: 1px solid #ddd; font-weight: 700; }
  td { padding: 8px 6px; text-align: center; border: 1px solid #ddd; }
  .pos-label { text-align: left; font-weight: 600; color: #555; background: #fafafa; }
  .lead { font-weight: 700; color: #d4a84e; }
  .folga { color: #aaa; font-style: italic; font-size: 11px; }
  .blocked { color: #cc4444; font-size: 10px; }
  .footer { text-align: center; color: #bbb; font-size: 10px; margin-top: 30px; letter-spacing: 1px; }
  .stats { margin: 10px 0 20px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
  .stat-card { border: 1px solid #eee; border-radius: 8px; padding: 8px 10px; font-size: 11px; }
  .stat-name { font-weight: 700; font-size: 12px; }
  @media print { body { padding: 0; } h2 { page-break-before: auto; } table { page-break-inside: avoid; } }
</style></head><body>
<h1>\u2726 Escala de Músicos \u2726</h1>
<div class="subtitle">Ministério de Louvor</div>`;

    for (const { y, m } of monthsToExport) {
      const mk = `${y}-${m}`;
      const sched = allSchedules[mk];
      if (!sched || Object.keys(sched).length === 0) continue;
      const suns = getSundays(y, m);

      html += `<h2>${MONTHS[m]} ${y} (${suns.length} domingos)</h2>`;
      html += `<table><thead><tr><th>Posição</th>`;
      suns.forEach((s, i) => {
        html += `<th>Dom ${i+1}<br>${fmt(s)}</th>`;
      });
      html += `</tr></thead><tbody>`;

      POSITIONS.forEach(pos => {
        for (let slot = 0; slot < pos.count; slot++) {
          const label = pos.count > 1 ? `${pos.icon} ${pos.label} #${slot+1}` : `${pos.icon} ${pos.label}`;
          html += `<tr><td class="pos-label">${label}</td>`;
          suns.forEach((_, si) => {
            const mid = sched[`${si}-${pos.id}-${slot}`];
            const mus = mid ? getMusicianById(mid) : null;
            const isLead = pos.id === "vocal_principal";
            html += `<td class="${isLead && mus ? 'lead' : ''}">${mus ? mus.short : '\u2014'}</td>`;
          });
          html += `</tr>`;
        }
      });

      // Folga row
      html += `<tr><td class="pos-label">\u{1F4A4} Folga</td>`;
      suns.forEach((_, si) => {
        const off = musicians.filter(mus => {
          const present = new Set();
          Object.entries(sched).forEach(([k, v]) => { if (v === mus.id) present.add(parseInt(k.split("-")[0])); });
          return !present.has(si);
        });
        html += `<td class="folga">${off.map(o => o.short).join(", ") || "\u2014"}</td>`;
      });
      html += `</tr></tbody></table>`;

      // Stats (only if includeStats)
      if (includeStats) {
        html += `<div class="stats"><div class="stats-grid">`;
        musicians.forEach(mus => {
          const present = new Set();
          Object.entries(sched).forEach(([k, v]) => { if (v === mus.id) present.add(parseInt(k.split("-")[0])); });
          const count = present.size;
          const leads = suns.filter((_, si) => sched[`${si}-vocal_principal-0`] === mus.id).length;
          html += `<div class="stat-card"><div class="stat-name">${mus.short}</div>${count}x escalado \u2022 ${suns.length - count}x folga${leads > 0 ? ` \u2022 ${leads}x lead` : ''}</div>`;
        });
        html += `</div></div>`;
      }
    }

    html += `<div class="footer">Gerado pelo sistema Escala de Músicos \u2022 HLSS Prime Services \u2022 ${new Date().toLocaleDateString("pt-BR")}</div>`;
    html += `</body></html>`;
    return html;
  }

  function exportSchedule() {
    let monthsToExport = [];
    if (exportRange === "current") {
      monthsToExport = [{ y: year, m: month }];
    } else {
      let cy = exportFromYear, cm = exportFromMonth;
      const endKey = `${exportToYear}-${exportToMonth}`;
      while (true) {
        monthsToExport.push({ y: cy, m: cm });
        if (`${cy}-${cm}` === endKey) break;
        cm++;
        if (cm > 11) { cm = 0; cy++; }
        if (monthsToExport.length > 24) break; // safety limit
      }
    }

    const includeStats = exportType === "complete";
    const html = buildExportHTML(monthsToExport, includeStats);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const prefix = includeStats ? "Relatorio_Completo" : "Escala";
    const title = monthsToExport.length === 1
      ? `${prefix}_${MONTHS[monthsToExport[0].m]}_${monthsToExport[0].y}`
      : `${prefix}_${MONTHS[monthsToExport[0].m]}${monthsToExport[0].y}_a_${MONTHS[monthsToExport[monthsToExport.length-1].m]}${monthsToExport[monthsToExport.length-1].y}`;
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExport(false);
  }

  function printSchedule() {
    let monthsToExport = [];
    if (exportRange === "current") {
      monthsToExport = [{ y: year, m: month }];
    } else {
      let cy = exportFromYear, cm = exportFromMonth;
      const endKey = `${exportToYear}-${exportToMonth}`;
      while (true) {
        monthsToExport.push({ y: cy, m: cm });
        if (`${cy}-${cm}` === endKey) break;
        cm++;
        if (cm > 11) { cm = 0; cy++; }
        if (monthsToExport.length > 24) break;
      }
    }

    const includeStats = exportType === "complete";
    const html = buildExportHTML(monthsToExport, includeStats);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 300);
    setShowExport(false);
  }

  // ── Get previous month info for scheduling ──
  function getPrevMonthKey() {
    let pm = month - 1, py = year;
    if (pm < 0) { pm = 11; py--; }
    return `${py}-${pm}`;
  }
  function getPrevMonthSundays() {
    let pm = month - 1, py = year;
    if (pm < 0) { pm = 11; py--; }
    return getSundays(py, pm);
  }

  function autoGenerate() {
    setGenerating(true);
    setTimeout(() => {
      const currentRotation = leadRotation.length > 0 ? leadRotation : leadVocalists;
      // Get previous month's schedule for continuity
      const prevKey = getPrevMonthKey();
      const prevSchedule = allSchedules[prevKey] || null;
      const prevSundays = getPrevMonthSundays();
      const prevStats = prevSchedule ? getPrevMonthStats(prevSchedule, prevSundays, musicians) : null;

      const { schedule: newSched, newLeadQueue } = generateSchedule(
        sundays, currentRotation, musicians, leadVocalists, blockDates, prevStats
      );
      const updatedSchedules = { ...allSchedules, [monthKey]: newSched };
      setAllSchedules(updatedSchedules);
      setLeadRotation(newLeadQueue);
      persist(updatedSchedules, newLeadQueue);
      setGenerating(false);
      setActiveTab("escala");
    }, 400);
  }
  function clearMonth() {
    const updated = { ...allSchedules };
    delete updated[monthKey];
    setAllSchedules(updated);
    persist(updated, leadRotation);
  }
  // ── Musicians management ──
  function updateMusician(id, changes) {
    const updated = musicians.map(m => m.id === id ? { ...m, ...changes } : m);
    setMusicians(updated);
    persistMusicians(updated);
  }
  function toggleRole(musicianId, roleId) {
    const m = musicians.find(x => x.id === musicianId);
    if (!m) return;
    const hasRole = m.roles.includes(roleId);
    const newRoles = hasRole ? m.roles.filter(r => r !== roleId) : [...m.roles, roleId];
    updateMusician(musicianId, { roles: newRoles });
  }
  function addMusician() {
    const newId = `musico_${Date.now()}`;
    const newM = { id: newId, name: "Novo Músico", short: "Novo", roles: [] };
    const updated = [...musicians, newM];
    setMusicians(updated);
    persistMusicians(updated);
    setEditingMusician(newId);
  }
  function removeMusician(id) {
    const updated = musicians.filter(m => m.id !== id);
    setMusicians(updated);
    persistMusicians(updated);
    if (editingMusician === id) setEditingMusician(null);
  }

  const conflicts = analyzeConflicts(schedule, sundays, leadRotation, musicians, leadVocalists, blockDates);
  const errors = conflicts.filter(c => c.severity === "error");
  const warnings = conflicts.filter(c => c.severity === "warning");
  const stats = musicians.map(m => {
    const suns = getMusicianSundays(m.id);
    const leadsThisMonth = sundays.filter((_, si) => schedule[`${si}-vocal_principal-0`] === m.id).length;
    return { ...m, count: suns.size, offWeeks: sundays.length - suns.size, sundays: suns, leadsThisMonth };
  });
  const hasData = Object.keys(schedule).length > 0;
  const totalBlockedThisMonth = musicians.reduce((sum, m) => sum + getBlockedCountForMonth(m.id), 0);

  // Check if previous month has schedule
  const prevKey = getPrevMonthKey();
  const hasPrevMonthSchedule = allSchedules[prevKey] && Object.keys(allSchedules[prevKey]).length > 0;

  if (!loaded) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0d0b1e", color:"#c9a96e", fontFamily:"Georgia, serif", fontSize:"18px" }}>
      Carregando escala...
    </div>
  );

  return (
    <div style={{ fontFamily:"'Georgia', serif", minHeight:"100vh", background:"#0d0b1e", color:"#f0e6d3" }}>
      <div style={{ position:"fixed", inset:0, backgroundImage:"radial-gradient(ellipse at 20% 20%, rgba(201,169,110,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(100,80,180,0.1) 0%, transparent 60%)", pointerEvents:"none" }} />
      <div style={{ position:"relative", maxWidth:"1100px", margin:"0 auto", padding:"24px 16px" }}>
        {/* ── HEADER ── */}
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"8px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"6px" }}>Ministério de Louvor</div>
          <h1 style={{ fontSize:"clamp(26px,5vw,40px)", fontWeight:"900", margin:"0 0 4px", color:"#f0e6d3", letterSpacing:"-1px" }}>
            {"\u2726"} Escala de Músicos {"\u2726"}
          </h1>
          <div style={{ width:"80px", height:"1px", background:"linear-gradient(90deg,transparent,#c9a96e,transparent)", margin:"10px auto 16px" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"16px" }}>
            <button onClick={prevMonth} style={navBtnStyle}>{"\u2039"}</button>
            <span style={{ fontSize:"20px", fontWeight:"700", minWidth:"220px", textAlign:"center", color:"#f0e6d3" }}>
              {MONTHS[month]} {year}
              <span style={{ fontSize:"12px", color:"#c9a96e", marginLeft:"8px" }}>({sundays.length} domingos)</span>
            </span>
            <button onClick={nextMonth} style={navBtnStyle}>{"\u203A"}</button>
          </div>
          {saving && <div style={{ fontSize:"10px", color:"#c9a96e", marginTop:"8px", opacity:0.7 }}>Salvando...</div>}
        </div>
        {/* ── VOCALIST COLOR LEGEND ── */}
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center", marginBottom:"16px" }}>
          {leadVocalists.map(id => {
            const m = getMusicianById(id);
            const vc = getVocalistColor(id);
            return (
              <div key={id} style={{ padding:"4px 12px", borderRadius:"16px", fontSize:"11px", fontWeight:"600", background: vc.bg, border: `1px solid ${vc.border}`, color: vc.text }}>
                {m?.short}
              </div>
            );
          })}
        </div>
        {/* ── ACTION BAR ── */}
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center", marginBottom:"24px" }}>
          <button onClick={autoGenerate} disabled={generating} style={{
            ...actionBtnStyle, background:"linear-gradient(135deg,#c9a96e,#a07840)", color:"#0d0b1e", fontWeight:"700"
          }}>
            {generating ? "\u23F3 Gerando..." : "\u2728 Gerar Escala Automática"}
          </button>
          {hasData && (
            <button onClick={clearMonth} style={{ ...actionBtnStyle, background:"rgba(220,80,80,0.15)", border:"1px solid rgba(220,80,80,0.3)", color:"#ff9999" }}>
              {"\u{1F5D1}"} Limpar Mês
            </button>
          )}
          <button onClick={() => { setExportFromMonth(month); setExportFromYear(year); setExportToMonth(month); setExportToYear(year); setShowExport(true); }} style={{
            ...actionBtnStyle, background:"rgba(105,180,255,0.15)", border:"1px solid rgba(105,180,255,0.3)", color:"#69b4ff"
          }}>
            {"\u{1F4E4}"} Exportar
          </button>
        </div>
        {/* ── EXPORT MODAL ── */}
        {showExport && (
          <div style={{ position:"fixed", inset:0, zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.7)" }} onClick={() => setShowExport(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background:"#1a1635", border:"1px solid rgba(201,169,110,0.3)", borderRadius:"16px", padding:"28px", maxWidth:"420px", width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize:"18px", fontWeight:"700", color:"#f0e6d3", marginBottom:"4px" }}>{"\u{1F4E4}"} Exportar Escala</div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", marginBottom:"20px" }}>Gere um arquivo HTML para imprimir ou salvar</div>

              <div style={{ marginBottom:"16px" }}>
                <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"8px" }}>Tipo de Relatório</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={() => setExportType("schedule")} style={{
                    flex:1, padding:"10px", borderRadius:"8px", cursor:"pointer", fontSize:"12px", fontFamily:"Georgia, serif",
                    background: exportType==="schedule" ? "rgba(105,180,255,0.2)" : "rgba(255,255,255,0.04)",
                    border: exportType==="schedule" ? "1px solid rgba(105,180,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    color: exportType==="schedule" ? "#69b4ff" : "rgba(255,255,255,0.5)"
                  }}>{"\u{1F4CB}"} Só Escalas</button>
                  <button onClick={() => setExportType("complete")} style={{
                    flex:1, padding:"10px", borderRadius:"8px", cursor:"pointer", fontSize:"12px", fontFamily:"Georgia, serif",
                    background: exportType==="complete" ? "rgba(105,180,255,0.2)" : "rgba(255,255,255,0.04)",
                    border: exportType==="complete" ? "1px solid rgba(105,180,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    color: exportType==="complete" ? "#69b4ff" : "rgba(255,255,255,0.5)"
                  }}>{"\u{1F4CA}"} Completo</button>
                </div>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginTop:"6px", textAlign:"center" }}>
                  {exportType === "schedule" ? "Apenas o calendário das escalas" : "Calendário + resumo estatístico de cada músico"}
                </div>
              </div>

              <div style={{ marginBottom:"16px" }}>
                <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"8px" }}>Período</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={() => setExportRange("current")} style={{
                    flex:1, padding:"10px", borderRadius:"8px", cursor:"pointer", fontSize:"12px", fontFamily:"Georgia, serif",
                    background: exportRange==="current" ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.04)",
                    border: exportRange==="current" ? "1px solid rgba(201,169,110,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    color: exportRange==="current" ? "#c9a96e" : "rgba(255,255,255,0.5)"
                  }}>Mês Atual</button>
                  <button onClick={() => setExportRange("custom")} style={{
                    flex:1, padding:"10px", borderRadius:"8px", cursor:"pointer", fontSize:"12px", fontFamily:"Georgia, serif",
                    background: exportRange==="custom" ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.04)",
                    border: exportRange==="custom" ? "1px solid rgba(201,169,110,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    color: exportRange==="custom" ? "#c9a96e" : "rgba(255,255,255,0.5)"
                  }}>Vários Meses</button>
                </div>
              </div>

              {exportRange === "current" && (
                <div style={{ padding:"12px", borderRadius:"10px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", marginBottom:"16px", textAlign:"center", fontSize:"14px", color:"#f0e6d3" }}>
                  {MONTHS[month]} {year}
                  {!hasData && <div style={{ fontSize:"11px", color:"#ff8c69", marginTop:"4px" }}>Sem escala gerada neste mês</div>}
                </div>
              )}

              {exportRange === "custom" && (
                <div style={{ marginBottom:"16px" }}>
                  <div style={{ display:"flex", gap:"12px", alignItems:"center", marginBottom:"8px" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"9px", color:"#c9a96e", letterSpacing:"1px", marginBottom:"4px" }}>DE</div>
                      <div style={{ display:"flex", gap:"4px" }}>
                        <select value={exportFromMonth} onChange={e => setExportFromMonth(parseInt(e.target.value))} style={selectStyle}>
                          {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <input type="number" value={exportFromYear} onChange={e => setExportFromYear(parseInt(e.target.value))} style={{...selectStyle, width:"70px"}} />
                      </div>
                    </div>
                    <div style={{ color:"#c9a96e", fontSize:"16px", marginTop:"16px" }}>{"\u2192"}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"9px", color:"#c9a96e", letterSpacing:"1px", marginBottom:"4px" }}>ATÉ</div>
                      <div style={{ display:"flex", gap:"4px" }}>
                        <select value={exportToMonth} onChange={e => setExportToMonth(parseInt(e.target.value))} style={selectStyle}>
                          {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <input type="number" value={exportToYear} onChange={e => setExportToYear(parseInt(e.target.value))} style={{...selectStyle, width:"70px"}} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display:"flex", gap:"10px" }}>
                <button onClick={exportSchedule} style={{
                  flex:1, padding:"12px", borderRadius:"10px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:"700",
                  fontFamily:"Georgia, serif", background:"linear-gradient(135deg,#c9a96e,#a07840)", color:"#0d0b1e"
                }}>{"\u{1F4E5}"} Baixar HTML</button>
                <button onClick={printSchedule} style={{
                  flex:1, padding:"12px", borderRadius:"10px", border:"1px solid rgba(201,169,110,0.3)", cursor:"pointer", fontSize:"13px", fontWeight:"600",
                  fontFamily:"Georgia, serif", background:"rgba(201,169,110,0.1)", color:"#c9a96e"
                }}>{"\u{1F5A8}"} Imprimir</button>
              </div>
              <button onClick={() => setShowExport(false)} style={{
                width:"100%", marginTop:"10px", padding:"10px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.1)",
                background:"transparent", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:"12px", fontFamily:"Georgia, serif"
              }}>Cancelar</button>
            </div>
          </div>
        )}
        {/* ── PREVIOUS MONTH INFO BANNER ── */}
        {hasPrevMonthSchedule && (
          <div style={{ marginBottom:"12px", padding:"8px 16px", borderRadius:"10px", background:"rgba(105,180,255,0.08)", border:"1px solid rgba(105,180,255,0.2)", fontSize:"11px", color:"#69b4ff", textAlign:"center" }}>
            {"\u{1F4C6}"} Mês anterior tem escala salva — a geração automática vai considerar continuidade de rotação e folgas
          </div>
        )}
        {/* ── BLOCK DATES BANNER ── */}
        {totalBlockedThisMonth > 0 && (
          <div style={{ marginBottom:"12px", padding:"8px 16px", borderRadius:"10px", background:"rgba(255,140,105,0.1)", border:"1px solid rgba(255,140,105,0.25)", fontSize:"11px", color:"#ff8c69", textAlign:"center" }}>
            {"\u{1F6AB}"} {totalBlockedThisMonth} bloqueio{totalBlockedThisMonth > 1 ? "s" : ""} de data neste mês — músicos indisponíveis serão respeitados na geração
          </div>
        )}
        {/* ── CONFLICT BANNER ── */}
        {hasData && conflicts.length > 0 && (
          <div style={{ marginBottom:"20px", borderRadius:"12px", overflow:"hidden", border:"1px solid rgba(220,80,80,0.3)" }}>
            {errors.map((c,i) => (
              <div key={`e${i}`} style={{ padding:"10px 16px", background:"rgba(220,60,60,0.15)", fontSize:"13px", color:"#ffaaaa", borderBottom: i < errors.length-1 ? "1px solid rgba(220,80,80,0.2)" : "none" }}>
                {"\u{1F534}"} {c.msg}
              </div>
            ))}
            {warnings.map((c,i) => (
              <div key={`w${i}`} style={{ padding:"10px 16px", background:"rgba(240,160,40,0.12)", fontSize:"13px", color:"#ffd080", borderTop: errors.length > 0 && i === 0 ? "1px solid rgba(240,160,40,0.2)" : "none", borderBottom: i < warnings.length-1 ? "1px solid rgba(240,160,40,0.15)" : "none" }}>
                {"\u{1F7E1}"} {c.msg}
              </div>
            ))}
          </div>
        )}
        {hasData && conflicts.length === 0 && (
          <div style={{ marginBottom:"20px", padding:"10px 16px", borderRadius:"10px", background:"rgba(80,180,100,0.12)", border:"1px solid rgba(80,180,100,0.25)", fontSize:"13px", color:"#80e880", textAlign:"center" }}>
            {"\u2705"} Nenhum conflito encontrado {"\u2014"} escala válida!
          </div>
        )}
        {/* ── TABS ── */}
        <div style={{ display:"flex", gap:"4px", marginBottom:"20px", background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"4px" }}>
          {[
            ["escala","\u{1F4CB} Escala"],
            ["resumo","\u{1F4CA} Resumo"],
            ["dashboard","\u{1F4C8} Dashboard"],
            ["bloqueios",`\u{1F6AB} Datas${totalBlockedThisMonth > 0 ? ` (${totalBlockedThisMonth})` : ""}`],
            ["musicos","\u{1F3B6} Músicos"],
            ["conflitos",`\u26A0\uFE0F Conflitos ${conflicts.length > 0 ? `(${conflicts.length})` : ""}`]
          ].map(([t,label]) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex:1, padding:"10px 8px", border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"13px", fontWeight:"600", fontFamily:"Georgia, serif", transition:"all 0.2s",
              background: activeTab === t ? "rgba(201,169,110,0.2)" : "transparent",
              color: activeTab === t ? "#c9a96e" : "rgba(240,230,211,0.5)",
              borderBottom: activeTab === t ? "2px solid #c9a96e" : "2px solid transparent"
            }}>{label}</button>
          ))}
        </div>

        {/* ── TAB: ESCALA ── */}
        {activeTab === "escala" && (
          <div style={{ overflowX:"auto", marginBottom:"24px" }}>
            {!hasData && (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(240,230,211,0.3)", fontSize:"15px" }}>
                Clique em <strong style={{color:"#c9a96e"}}>{"\u2728"} Gerar Escala Automática</strong> ou atribua músicos manualmente
              </div>
            )}
            {hasData && (
              <div style={{ display:"grid", gridTemplateColumns:`160px repeat(${sundays.length},1fr)`, gap:"3px", minWidth:"500px" }}>
                <div style={headerCellStyle} />
                {sundays.map((s,i) => {
                  const leadId = schedule[`${i}-vocal_principal-0`];
                  const vc = leadId ? getVocalistColor(leadId) : null;
                  const blockedMusicians = getMusiciansBlockedOnSunday(i);
                  return (
                    <div key={i} style={{
                      ...headerCellStyle, textAlign:"center",
                      borderRadius: i===0?"8px 0 0 0":i===sundays.length-1?"0 8px 0 0":"0",
                      borderBottom: vc ? `3px solid ${vc.tag}` : "3px solid transparent"
                    }}>
                      <div style={{ fontSize:"10px", color:"#c9a96e", letterSpacing:"2px", textTransform:"uppercase" }}>Dom {i+1}</div>
                      <div style={{ fontSize:"17px", fontWeight:"700" }}>{fmt(s)}</div>
                      {blockedMusicians.length > 0 && (
                        <div style={{ fontSize:"8px", color:"#ff8c69", marginTop:"2px" }}>
                          {"\u{1F6AB}"} {blockedMusicians.map(m => m.short).join(", ")}
                        </div>
                      )}
                    </div>
                  );
                })}
                {POSITIONS.map((pos, posIdx) => {
                  const slots = Array.from({length:pos.count},(_,i)=>i);
                  return slots.map((slot, slotIdx) => {
                    const isLastRow = posIdx === POSITIONS.length-1 && slotIdx === slots.length-1;
                    return [
                      <div key={`lbl-${pos.id}-${slot}`} style={{
                        padding:"10px 12px", background:"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", gap:"8px",
                        borderTop: slotIdx===0?"1px solid rgba(255,255,255,0.06)":"none",
                        borderRadius: isLastRow?"0 0 0 8px":"0"
                      }}>
                        <span style={{ fontSize:"18px" }}>{pos.icon}</span>
                        <div>
                          <div style={{ fontSize:"12px", fontWeight:"600", color:pos.color }}>
                            {pos.label}
                            {!pos.required && pos.id !== "vocal_back" && (
                              <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", marginLeft:"4px" }}>opcional</span>
                            )}
                          </div>
                          {pos.count > 1 && <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)" }}>#{slot+1}{slot === 2 && " (opcional)"}</div>}
                        </div>
                      </div>,
                      ...sundays.map((_,si) => {
                        const assigned = getAssigned(si, pos.id, slot);
                        const musician = assigned ? getMusicianById(assigned) : null;
                        const cellKey = `${si}-${pos.id}-${slot}`;
                        const isActive = activeCell === cellKey;
                        const isVocal = pos.id === "vocal_principal" || pos.id === "vocal_back";
                        const isLead = pos.id === "vocal_principal";
                        const vc = isVocal && assigned ? getVocalistColor(assigned) : null;
                        const cellBg = vc ? vc.bg : (musician ? `${pos.color}18` : "transparent");
                        const cellTextColor = vc ? vc.text : (isLead ? "#e8a838" : pos.color);
                        const isDoubling = pos.id === "violao" && assigned && getMusicianById(assigned)?.canDoubleVocalViolao && schedule[`${si}-vocal_principal-0`] === assigned;
                        return (
                          <div key={`cell-${cellKey}`} style={{ position:"relative", background:"rgba(255,255,255,0.02)", borderTop:slotIdx===0?"1px solid rgba(255,255,255,0.06)":"none" }}>
                            <button onClick={() => setActiveCell(isActive ? null : cellKey)} style={{
                              width:"100%", minHeight:"50px", padding:"6px 4px", background: cellBg,
                              border: isActive ? `1px solid ${vc ? vc.border : pos.color}` : (vc ? `1px solid ${vc.border}44` : "1px solid transparent"),
                              borderRadius:"4px", cursor:"pointer", color:"#f0e6d3", fontSize:"11px", textAlign:"center", fontFamily:"Georgia, serif", transition:"all 0.15s"
                            }}>
                              {musician ? (
                                <div>
                                  <div style={{ fontWeight:"700", color: cellTextColor, fontSize:"12px" }}>{musician.short}</div>
                                  {isLead && <div style={{ fontSize:"9px", color: vc ? `${vc.text}99` : "rgba(232,168,56,0.6)", letterSpacing:"1px" }}>LEAD</div>}
                                  {isDoubling && <div style={{ fontSize:"8px", color:"#ff8c69", letterSpacing:"0.5px", marginTop:"1px" }}>+ vocal</div>}
                                </div>
                              ) : (
                                <span style={{ color:"rgba(255,255,255,0.15)", fontSize:"20px" }}>+</span>
                              )}
                            </button>
                            {isActive && (
                              <div style={{
                                position:"absolute", top:"100%", left:"0", zIndex:200, minWidth:"190px",
                                background:"#1a1635", border:`1px solid ${pos.color}55`, borderRadius:"10px",
                                boxShadow:"0 12px 40px rgba(0,0,0,0.7)", overflow:"hidden"
                              }}>
                                {musician && (
                                  <button onClick={() => clearCell(si, pos.id, slot)} style={{
                                    width:"100%", padding:"10px 14px", background:"rgba(220,80,80,0.15)", border:"none",
                                    borderBottom:"1px solid rgba(255,255,255,0.08)", color:"#ff9999", cursor:"pointer",
                                    textAlign:"left", fontSize:"12px", fontFamily:"Georgia, serif"
                                  }}>{"\u2715"} Remover</button>
                                )}
                                {musicians.filter(m => m.roles.includes(pos.id)).map(m => {
                                  const suns = getMusicianSundays(m.id);
                                  const overLimit = m.maxPerMonth && suns.size >= m.maxPerMonth;
                                  const mVc = isVocal ? getVocalistColor(m.id) : null;
                                  const blocked = isDateBlocked(m.id, sundays[si]);
                                  return (
                                    <button key={m.id} onClick={() => !blocked && assign(si, pos.id, slot, m.id)} style={{
                                      width:"100%", padding:"9px 14px", background: m.id===assigned ? (mVc ? mVc.bg : "rgba(201,169,110,0.15)") : "transparent",
                                      border:"none", borderBottom:"1px solid rgba(255,255,255,0.05)",
                                      color: blocked ? "#ff4444" : (overLimit ? "#666" : (mVc ? mVc.text : "#f0e6d3")),
                                      cursor: blocked ? "not-allowed" : "pointer", textAlign:"left", fontSize:"12px", display:"flex", justifyContent:"space-between",
                                      fontFamily:"Georgia, serif", opacity: blocked ? 0.5 : 1
                                    }}>
                                      <span style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                                        {mVc && <span style={{ width:"8px", height:"8px", borderRadius:"50%", background: mVc.tag, display:"inline-block" }} />}
                                        {m.name}
                                        {blocked && <span style={{ fontSize:"9px", color:"#ff4444" }}>{"\u{1F6AB}"}</span>}
                                      </span>
                                      <span style={{ fontSize:"10px", color: blocked ? "#ff4444" : "#c9a96e", opacity:0.6 }}>
                                        {blocked ? "indisponível" : `${suns.size}x`}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ];
                  });
                })}
              </div>
            )}
            {/* ── RESUMO INLINE (below schedule grid) ── */}
            {hasData && (
              <div style={{ marginTop:"24px" }}>
                <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px", padding:"0 4px" }}>{"\u{1F4CA}"} Resumo do Mês</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))", gap:"10px" }}>
                  {stats.map(m => {
                    const hasFolga = m.offWeeks >= 1;
                    const color = hasFolga ? "#5bc85b" : (m.noFolgaRequired ? "#c9a96e" : "#ff6060");
                    const vc = getVocalistColor(m.id);
                    const isVocalist = leadVocalists.includes(m.id);
                    const blockedCount = getBlockedCountForMonth(m.id);
                    return (
                      <div key={m.id} style={{
                        background:"rgba(255,255,255,0.03)",
                        border: isVocalist ? `1px solid ${vc.border}` : `1px solid ${hasFolga||m.noFolgaRequired?"rgba(91,200,91,0.2)":"rgba(255,96,96,0.2)"}`,
                        borderRadius:"12px", padding:"14px",
                        borderLeft: isVocalist ? `3px solid ${vc.tag}` : undefined
                      }}>
                        <div style={{ fontSize:"13px", fontWeight:"700", color: isVocalist ? vc.text : "#f0e6d3", marginBottom:"2px" }}>{m.short}</div>
                        <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginBottom:"10px" }}>
                          {m.name !== m.short ? m.name.replace(m.short,"").trim() : ""}
                          {m.maxPerMonth && <span style={{ color:"#c9a96e" }}> {"\u2022"} máx {m.maxPerMonth}x</span>}
                          {m.alternating && <span style={{ color:"#c9a96e" }}> {"\u2022"} alternado</span>}
                          {m.coupleId && <span style={{ color:"#aaa8ff" }}> {"\u2022"} casal</span>}
                          {blockedCount > 0 && <span style={{ color:"#ff8c69" }}> {"\u2022"} {blockedCount} bloqueio{blockedCount>1?"s":""}</span>}
                          {m.manualOnly && <span style={{ color:"#ff8c69" }}> {"\u2022"} manual</span>}
                        </div>
                        <div style={{ display:"flex", gap:"4px", marginBottom:"8px" }}>
                          {sundays.map((_,i) => {
                            const isLeadHere = schedule[`${i}-vocal_principal-0`] === m.id;
                            const isBlocked = isDateBlocked(m.id, sundays[i]);
                            return (
                              <div key={i} style={{
                                width:"20px", height:"20px", borderRadius:"5px", fontSize:"9px", fontWeight:"700",
                                background: isBlocked ? "rgba(255,68,68,0.3)" : (isOnSunday(m.id,i) ? (isLeadHere ? vc.tag : (isVocalist ? `${vc.tag}88` : "#c9a96e")) : "rgba(255,255,255,0.07)"),
                                color: isBlocked ? "#ff4444" : (isOnSunday(m.id,i) ? "#0d0b1e" : "rgba(255,255,255,0.25)"),
                                display:"flex", alignItems:"center", justifyContent:"center",
                                border: isBlocked ? "1px solid rgba(255,68,68,0.5)" : "none"
                              }}>{isBlocked ? "\u2715" : (isLeadHere ? "L" : i+1)}</div>
                            );
                          })}
                        </div>
                        <div style={{ fontSize:"11px", color }}>
                          {m.count}x escalado {"\u2022"} {m.offWeeks}x folga
                        </div>
                        {m.leadsThisMonth > 0 && (
                          <div style={{ fontSize:"10px", color: vc.tag, marginTop:"2px" }}>{"\u{1F3A4}"} Lead {m.leadsThisMonth}x</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: RESUMO (month summary) ── */}
        {activeTab === "resumo" && (
          <div>
            {!hasData && (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(240,230,211,0.3)", fontSize:"15px" }}>
                Gere a escala para ver o resumo do mês
              </div>
            )}
            {hasData && (<>
              {/* Leads per Sunday */}
              <div style={{ marginBottom:"20px", background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"16px 20px" }}>
                <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px" }}>{"\u{1F3A4}"} Leads do Mês — {MONTHS[month]} {year}</div>
                <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                  {sundays.map((s,si) => {
                    const leadId = schedule[`${si}-vocal_principal-0`];
                    const m = leadId ? getMusicianById(leadId) : null;
                    const vc = leadId ? getVocalistColor(leadId) : null;
                    return (
                      <div key={si} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginBottom:"4px" }}>Dom {si+1} — {fmt(s)}</div>
                        <div style={{
                          padding:"8px 12px", borderRadius:"8px", fontSize:"13px", fontWeight:"700",
                          background: vc ? vc.bg : "rgba(255,255,255,0.04)",
                          color: vc ? vc.text : "rgba(255,255,255,0.2)",
                          border: vc ? `1px solid ${vc.border}` : "1px solid rgba(255,255,255,0.08)"
                        }}>
                          {m ? m.short : "\u2014"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-Sunday mini summary */}
              <div style={{ marginBottom:"20px" }}>
                <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px", padding:"0 4px" }}>{"\u{1F4C5}"} Escalação por Domingo</div>
                <div style={{ display:"grid", gridTemplateColumns:`repeat(auto-fill, minmax(180px, 1fr))`, gap:"10px" }}>
                  {sundays.map((s, si) => {
                    const leadId = schedule[`${si}-vocal_principal-0`];
                    const vc = leadId ? getVocalistColor(leadId) : null;
                    const blockedHere = getMusiciansBlockedOnSunday(si);
                    return (
                      <div key={si} style={{ background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"14px", borderTop: vc ? `3px solid ${vc.tag}` : "3px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize:"13px", fontWeight:"700", marginBottom:"8px", color:"#f0e6d3" }}>Dom {si+1} — {fmt(s)}</div>
                        {POSITIONS.map(pos => {
                          const slots = Array.from({length: pos.count}, (_, i) => i);
                          const assigned = slots.map(slot => schedule[`${si}-${pos.id}-${slot}`]).filter(Boolean);
                          if (assigned.length === 0) return null;
                          return (
                            <div key={pos.id} style={{ marginBottom:"4px", display:"flex", gap:"4px", alignItems:"center", flexWrap:"wrap" }}>
                              <span style={{ fontSize:"12px" }}>{pos.icon}</span>
                              {assigned.map((id, idx) => {
                                const m = getMusicianById(id);
                                return <span key={idx} style={{ fontSize:"11px", color: pos.color }}>{m?.short}{idx < assigned.length - 1 ? "," : ""}</span>;
                              })}
                            </div>
                          );
                        })}
                        {/* Folgas */}
                        <div style={{ marginTop:"6px", fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>
                          Folga: {musicians.filter(m => !isOnSunday(m.id, si)).map(m => m.short).join(", ") || "ninguém"}
                        </div>
                        {blockedHere.length > 0 && (
                          <div style={{ marginTop:"4px", fontSize:"9px", color:"#ff8c69" }}>
                            {"\u{1F6AB}"} Indisponíveis: {blockedHere.map(m => m.short).join(", ")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lead rotation queue */}
              <div style={{ marginBottom:"20px", background:"rgba(232,168,56,0.08)", border:"1px solid rgba(232,168,56,0.2)", borderRadius:"12px", padding:"16px 20px" }}>
                <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px" }}>{"\u{1F504}"} Próxima Rotação de Leads</div>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                  {leadRotation.slice(0,8).map((id,i) => {
                    const m = getMusicianById(id);
                    const vc = getVocalistColor(id);
                    return (
                      <div key={`${id}-${i}`} style={{
                        padding:"6px 12px", borderRadius:"20px", fontSize:"12px",
                        background: i===0 ? vc.bg : "rgba(255,255,255,0.06)",
                        border: i===0 ? `1px solid ${vc.border}` : "1px solid rgba(255,255,255,0.1)",
                        color: i===0 ? vc.text : "rgba(240,230,211,0.7)"
                      }}>
                        {i===0 && "\u2192 "}{m?.short}
                      </div>
                    );
                  })}
                  {leadRotation.length > 8 && <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"12px", padding:"6px" }}>+{leadRotation.length-8} mais</div>}
                </div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"8px" }}>
                  Próximos meses começarão daqui na rotação
                </div>
              </div>

              {/* Per-musician stats */}
              <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px", padding:"0 4px" }}>{"\u{1F4CA}"} Estatísticas dos Músicos</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))", gap:"10px" }}>
                {stats.map(m => {
                  const hasFolga = m.offWeeks >= 1;
                  const color = hasFolga ? "#5bc85b" : (m.noFolgaRequired ? "#c9a96e" : "#ff6060");
                  const vc = getVocalistColor(m.id);
                  const isVocalist = leadVocalists.includes(m.id);
                  const blockedCount = getBlockedCountForMonth(m.id);
                  return (
                    <div key={m.id} style={{
                      background:"rgba(255,255,255,0.03)",
                      border: isVocalist ? `1px solid ${vc.border}` : `1px solid ${hasFolga||m.noFolgaRequired?"rgba(91,200,91,0.2)":"rgba(255,96,96,0.2)"}`,
                      borderRadius:"12px", padding:"14px",
                      borderLeft: isVocalist ? `3px solid ${vc.tag}` : undefined
                    }}>
                      <div style={{ fontSize:"13px", fontWeight:"700", color: isVocalist ? vc.text : "#f0e6d3", marginBottom:"2px" }}>{m.short}</div>
                      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginBottom:"10px" }}>
                        {m.name !== m.short ? m.name.replace(m.short,"").trim() : ""}
                        {m.maxPerMonth && <span style={{ color:"#c9a96e" }}> {"\u2022"} máx {m.maxPerMonth}x</span>}
                        {m.alternating && <span style={{ color:"#c9a96e" }}> {"\u2022"} alternado</span>}
                        {m.coupleId && <span style={{ color:"#aaa8ff" }}> {"\u2022"} casal</span>}
                        {blockedCount > 0 && <span style={{ color:"#ff8c69" }}> {"\u2022"} {blockedCount} bloqueio{blockedCount>1?"s":""}</span>}
                        {m.manualOnly && <span style={{ color:"#ff8c69" }}> {"\u2022"} manual</span>}
                      </div>
                      <div style={{ display:"flex", gap:"4px", marginBottom:"8px" }}>
                        {sundays.map((_,i) => {
                          const isLeadHere = schedule[`${i}-vocal_principal-0`] === m.id;
                          const isBlocked = isDateBlocked(m.id, sundays[i]);
                          return (
                            <div key={i} style={{
                              width:"20px", height:"20px", borderRadius:"5px", fontSize:"9px", fontWeight:"700",
                              background: isBlocked ? "rgba(255,68,68,0.3)" : (isOnSunday(m.id,i) ? (isLeadHere ? vc.tag : (isVocalist ? `${vc.tag}88` : "#c9a96e")) : "rgba(255,255,255,0.07)"),
                              color: isBlocked ? "#ff4444" : (isOnSunday(m.id,i) ? "#0d0b1e" : "rgba(255,255,255,0.25)"),
                              display:"flex", alignItems:"center", justifyContent:"center",
                              border: isBlocked ? "1px solid rgba(255,68,68,0.5)" : "none"
                            }}>{isBlocked ? "\u2715" : (isLeadHere ? "L" : i+1)}</div>
                          );
                        })}
                      </div>
                      <div style={{ fontSize:"11px", color }}>
                        {m.count}x escalado {"\u2022"} {m.offWeeks}x folga
                      </div>
                      {m.leadsThisMonth > 0 && (
                        <div style={{ fontSize:"10px", color: vc.tag, marginTop:"2px" }}>{"\u{1F3A4}"} Lead {m.leadsThisMonth}x</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>)}
          </div>
        )}

        {/* ── TAB: DASHBOARD ── */}
        {activeTab === "dashboard" && (() => {
          // ── Compute multi-month data across ALL saved schedules ──
          const allMonthKeys = Object.keys(allSchedules).filter(k => Object.keys(allSchedules[k]).length > 0).sort();
          const monthData = allMonthKeys.map(mk => {
            const [y, m] = mk.split("-").map(Number);
            const suns = getSundays(y, m);
            const sched = allSchedules[mk];
            const perMusician = {};
            musicians.forEach(mus => {
              const present = new Set();
              Object.entries(sched).forEach(([k, v]) => { if (v === mus.id) present.add(parseInt(k.split("-")[0])); });
              const leads = suns.filter((_, si) => sched[`${si}-vocal_principal-0`] === mus.id).length;
              const positions = {};
              POSITIONS.forEach(pos => {
                let count = 0;
                for (let slot = 0; slot < pos.count; slot++) {
                  for (let si = 0; si < suns.length; si++) {
                    if (sched[`${si}-${pos.id}-${slot}`] === mus.id) count++;
                  }
                }
                if (count > 0) positions[pos.id] = count;
              });
              perMusician[mus.id] = { count: present.size, folgas: suns.length - present.size, leads, sundays: suns.length, positions };
            });
            return { key: mk, y, m, label: `${MONTHS[m].substring(0,3)} ${y}`, sundays: suns.length, perMusician };
          });

          // ── Global totals ──
          const globalTotals = {};
          musicians.forEach(mus => {
            let totalPlays = 0, totalLeads = 0, totalFolgas = 0, totalSundays = 0, lastLeadMonth = null, lastLeadSi = -1;
            const positionTotals = {};
            monthData.forEach(md => {
              const d = md.perMusician[mus.id];
              if (!d) return;
              totalPlays += d.count;
              totalLeads += d.leads;
              totalFolgas += d.folgas;
              totalSundays += d.sundays;
              Object.entries(d.positions || {}).forEach(([posId, cnt]) => {
                positionTotals[posId] = (positionTotals[posId] || 0) + cnt;
              });
              if (d.leads > 0) lastLeadMonth = md;
            });
            // Find exact last lead Sunday across all months
            let lastLeadDate = null;
            for (let mi = allMonthKeys.length - 1; mi >= 0; mi--) {
              const mk = allMonthKeys[mi];
              const sched = allSchedules[mk];
              const [y2, m2] = mk.split("-").map(Number);
              const suns2 = getSundays(y2, m2);
              for (let si = suns2.length - 1; si >= 0; si--) {
                if (sched[`${si}-vocal_principal-0`] === mus.id) {
                  lastLeadDate = suns2[si];
                  break;
                }
              }
              if (lastLeadDate) break;
            }
            globalTotals[mus.id] = {
              totalPlays, totalLeads, totalFolgas, totalSundays, positionTotals, lastLeadMonth, lastLeadDate,
              avgPerMonth: monthData.length > 0 ? (totalPlays / monthData.length).toFixed(1) : "0",
              participationRate: totalSundays > 0 ? Math.round((totalPlays / totalSundays) * 100) : 0
            };
          });

          // ── Lead drought ranking (vocalists only, sorted by longest without leading) ──
          const vocalistDrought = musicians
            .filter(m => m.roles.includes("vocal_principal") && !m.manualOnly)
            .map(m => {
              const g = globalTotals[m.id];
              const daysSinceLastLead = g.lastLeadDate
                ? Math.floor((new Date() - g.lastLeadDate) / (1000 * 60 * 60 * 24))
                : 9999;
              return { ...m, ...g, daysSinceLastLead };
            })
            .sort((a, b) => b.daysSinceLastLead - a.daysSinceLastLead);

          // ── Most/least active musicians ──
          const activeRanking = musicians
            .filter(m => !m.manualOnly)
            .map(m => ({ ...m, ...globalTotals[m.id] }))
            .sort((a, b) => b.participationRate - a.participationRate);

          // ── Position coverage per month ──
          const positionCoverage = monthData.map(md => {
            const sched = allSchedules[md.key];
            const coverage = {};
            POSITIONS.forEach(pos => {
              let filled = 0, total = md.sundays * (pos.id === "vocal_back" ? pos.minCount || 2 : 1);
              for (let si = 0; si < md.sundays; si++) {
                if (pos.id === "vocal_back") {
                  const bCount = [0,1,2].filter(s => sched[`${si}-vocal_back-${s}`]).length;
                  filled += Math.min(bCount, pos.minCount || 2);
                } else {
                  if (sched[`${si}-${pos.id}-0`]) filled++;
                }
              }
              coverage[pos.id] = { filled, total, pct: total > 0 ? Math.round((filled / total) * 100) : 0 };
            });
            return { ...md, coverage };
          });

          const cardStyle = { background:"rgba(255,255,255,0.03)", borderRadius:"14px", padding:"18px 20px", border:"1px solid rgba(255,255,255,0.06)" };
          const sectionTitle = (icon, text) => (
            <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ fontSize:"16px" }}>{icon}</span>{text}
            </div>
          );
          const statNum = (val, label, color = "#f0e6d3") => (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"26px", fontWeight:"900", color, lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.35)", letterSpacing:"1px", textTransform:"uppercase", marginTop:"4px" }}>{label}</div>
            </div>
          );

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
              {/* ── TOP SUMMARY CARDS ── */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"12px" }}>
                <div style={cardStyle}>{statNum(allMonthKeys.length, "Meses com escala", "#c9a96e")}</div>
                <div style={cardStyle}>{statNum(monthData.reduce((s, md) => s + md.sundays, 0), "Total de domingos", "#69b4ff")}</div>
                <div style={cardStyle}>{statNum(musicians.filter(m => !m.manualOnly).length, "Músicos ativos", "#5bc8af")}</div>
                <div style={cardStyle}>{statNum(musicians.filter(m => m.roles.includes("vocal_principal") && !m.manualOnly).length, "Vocalistas", "#e8a838")}</div>
                <div style={cardStyle}>{statNum(
                  monthData.length > 0 ? (monthData.reduce((s, md) => {
                    const sched = allSchedules[md.key];
                    let cnt = 0;
                    for (let si = 0; si < md.sundays; si++) { if (sched[`${si}-vocal_principal-0`]) cnt++; }
                    return s + cnt;
                  }, 0)) : 0,
                  "Total de leads", "#ff8c69"
                )}</div>
              </div>

              {/* ── LEAD DROUGHT ── */}
              <div style={cardStyle}>
                {sectionTitle("\u{1F525}", "Tempo sem Liderar")}
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginBottom:"14px", marginTop:"-8px" }}>
                  Quem está há mais tempo sem ser vocal principal
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {vocalistDrought.map((v, idx) => {
                    const vc = getVocalistColor(v.id);
                    const isOverdue = v.daysSinceLastLead > 30;
                    const droughtLabel = v.daysSinceLastLead >= 9999
                      ? "Nunca liderou"
                      : v.daysSinceLastLead === 0 ? "Hoje" : `${v.daysSinceLastLead} dias`;
                    const barWidth = v.daysSinceLastLead >= 9999 ? 100 : Math.min((v.daysSinceLastLead / 90) * 100, 100);
                    return (
                      <div key={v.id} style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                        <div style={{ width:"24px", textAlign:"center", fontSize:"14px", fontWeight:"900", color: idx === 0 ? "#ff6060" : "rgba(255,255,255,0.2)" }}>
                          {idx + 1}
                        </div>
                        <div style={{ width:"10px", height:"10px", borderRadius:"50%", background: vc.tag, flexShrink:0 }} />
                        <div style={{ width:"80px", fontWeight:"700", fontSize:"13px", color: vc.text }}>{v.short}</div>
                        <div style={{ flex:1, position:"relative", height:"24px", background:"rgba(255,255,255,0.04)", borderRadius:"12px", overflow:"hidden" }}>
                          <div style={{
                            position:"absolute", left:0, top:0, height:"100%", borderRadius:"12px",
                            width: `${barWidth}%`,
                            background: isOverdue ? "linear-gradient(90deg, rgba(255,96,96,0.3), rgba(255,96,96,0.5))"
                              : v.daysSinceLastLead >= 9999 ? "linear-gradient(90deg, rgba(255,68,68,0.4), rgba(255,68,68,0.7))"
                              : "linear-gradient(90deg, rgba(201,169,110,0.2), rgba(201,169,110,0.4))",
                            transition:"width 0.3s"
                          }} />
                          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"600",
                            color: isOverdue || v.daysSinceLastLead >= 9999 ? "#ff8080" : "#c9a96e" }}>
                            {droughtLabel}
                          </div>
                        </div>
                        <div style={{ width:"60px", fontSize:"10px", color:"rgba(255,255,255,0.3)", textAlign:"right" }}>
                          {v.totalLeads}x total
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── PARTICIPAÇÃO MENSAL POR MÚSICO (HEATMAP) ── */}
              {monthData.length > 0 && (
                <div style={cardStyle}>
                  {sectionTitle("\u{1F4C5}", "Participação Mensal")}
                  <div style={{ overflowX:"auto" }}>
                    <div style={{ display:"grid", gridTemplateColumns:`120px repeat(${monthData.length}, minmax(55px, 1fr))`, gap:"2px", minWidth: monthData.length > 6 ? `${120 + monthData.length * 58}px` : "auto" }}>
                      {/* Header */}
                      <div style={{ padding:"8px 4px", fontSize:"9px", color:"#c9a96e", fontWeight:"700", letterSpacing:"1px" }}>MÚSICO</div>
                      {monthData.map(md => (
                        <div key={md.key} style={{ padding:"8px 4px", fontSize:"10px", color:"#c9a96e", fontWeight:"600", textAlign:"center" }}>{md.label}</div>
                      ))}
                      {/* Rows */}
                      {musicians.filter(m => !m.manualOnly).map(mus => {
                        const vc = getVocalistColor(mus.id);
                        const isVocalist = mus.roles.includes("vocal_principal");
                        return [
                          <div key={`name-${mus.id}`} style={{ padding:"6px 8px", fontSize:"12px", fontWeight:"600", color: isVocalist ? vc.text : "#f0e6d3", display:"flex", alignItems:"center", gap:"6px", borderLeft: isVocalist ? `3px solid ${vc.tag}` : "3px solid transparent" }}>
                            {mus.short}
                          </div>,
                          ...monthData.map(md => {
                            const d = md.perMusician[mus.id];
                            if (!d) return <div key={`${mus.id}-${md.key}`} style={{ padding:"6px", textAlign:"center" }}>—</div>;
                            const intensity = d.sundays > 0 ? d.count / d.sundays : 0;
                            const bg = intensity > 0.8 ? "rgba(91,200,91,0.25)" : intensity > 0.5 ? "rgba(201,169,110,0.2)" : intensity > 0 ? "rgba(255,140,105,0.15)" : "rgba(255,255,255,0.02)";
                            return (
                              <div key={`${mus.id}-${md.key}`} style={{ padding:"6px 4px", textAlign:"center", background: bg, borderRadius:"6px", fontSize:"11px" }}>
                                <div style={{ fontWeight:"700", color:"#f0e6d3" }}>{d.count}<span style={{ color:"rgba(255,255,255,0.3)", fontWeight:"400" }}>/{d.sundays}</span></div>
                                {d.leads > 0 && <div style={{ fontSize:"8px", color: vc.tag, fontWeight:"700", marginTop:"1px" }}>{"\u{1F3A4}"}{d.leads}</div>}
                              </div>
                            );
                          })
                        ];
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── RANKING DE PARTICIPAÇÃO ── */}
              <div style={cardStyle}>
                {sectionTitle("\u{1F3C6}", "Ranking de Participação")}
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginBottom:"14px", marginTop:"-8px" }}>
                  Taxa de participação geral (considerando todos os meses com escala)
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {activeRanking.map((m, idx) => {
                    const vc = getVocalistColor(m.id);
                    const isVocalist = m.roles.includes("vocal_principal");
                    const rateColor = m.participationRate > 80 ? "#5bc85b" : m.participationRate > 60 ? "#c9a96e" : m.participationRate > 40 ? "#ff8c69" : "#ff6060";
                    return (
                      <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 12px", background:"rgba(255,255,255,0.02)", borderRadius:"10px", borderLeft: isVocalist ? `3px solid ${vc.tag}` : "3px solid transparent" }}>
                        <div style={{ width:"22px", fontSize:"13px", fontWeight:"900", color: idx < 3 ? "#c9a96e" : "rgba(255,255,255,0.2)", textAlign:"center" }}>{idx+1}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:"13px", fontWeight:"700", color: isVocalist ? vc.text : "#f0e6d3" }}>{m.short}</div>
                          <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>
                            {m.totalPlays}x em {m.totalSundays} dom · {m.totalFolgas} folgas · média {m.avgPerMonth}/mês
                            {m.totalLeads > 0 && <span style={{ color: vc.tag }}> · {m.totalLeads}x lead</span>}
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <div style={{ width:"80px", height:"8px", background:"rgba(255,255,255,0.06)", borderRadius:"4px", overflow:"hidden" }}>
                            <div style={{ width:`${m.participationRate}%`, height:"100%", background: rateColor, borderRadius:"4px" }} />
                          </div>
                          <div style={{ width:"40px", fontSize:"13px", fontWeight:"700", color: rateColor, textAlign:"right" }}>{m.participationRate}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── COBERTURA DE POSIÇÕES POR MÊS ── */}
              {positionCoverage.length > 0 && (
                <div style={cardStyle}>
                  {sectionTitle("\u{1F3AF}", "Cobertura de Posições")}
                  <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginBottom:"14px", marginTop:"-8px" }}>
                    Percentual de preenchimento das posições obrigatórias por mês
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <div style={{ display:"grid", gridTemplateColumns:`120px repeat(${positionCoverage.length}, minmax(55px, 1fr))`, gap:"2px" }}>
                      <div style={{ padding:"8px 4px", fontSize:"9px", color:"#c9a96e", fontWeight:"700", letterSpacing:"1px" }}>POSIÇÃO</div>
                      {positionCoverage.map(md => (
                        <div key={md.key} style={{ padding:"8px 4px", fontSize:"10px", color:"#c9a96e", fontWeight:"600", textAlign:"center" }}>{md.label}</div>
                      ))}
                      {POSITIONS.filter(p => p.required || p.id === "vocal_back").map(pos => [
                        <div key={`pos-${pos.id}`} style={{ padding:"6px 8px", fontSize:"12px", fontWeight:"600", color: pos.color, display:"flex", alignItems:"center", gap:"6px" }}>
                          <span>{pos.icon}</span>{pos.label}
                        </div>,
                        ...positionCoverage.map(md => {
                          const cov = md.coverage[pos.id];
                          if (!cov) return <div key={`${pos.id}-${md.key}`} />;
                          const color = cov.pct === 100 ? "#5bc85b" : cov.pct >= 80 ? "#c9a96e" : "#ff6060";
                          return (
                            <div key={`${pos.id}-${md.key}`} style={{ padding:"6px 4px", textAlign:"center", borderRadius:"6px", background: cov.pct === 100 ? "rgba(91,200,91,0.1)" : cov.pct >= 80 ? "rgba(201,169,110,0.1)" : "rgba(255,96,96,0.1)" }}>
                              <div style={{ fontSize:"13px", fontWeight:"700", color }}>{cov.pct}%</div>
                              <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.25)" }}>{cov.filled}/{cov.total}</div>
                            </div>
                          );
                        })
                      ])}
                    </div>
                  </div>
                </div>
              )}

              {/* ── DETALHAMENTO POR POSIÇÃO (totais globais) ── */}
              <div style={cardStyle}>
                {sectionTitle("\u{1F3B6}", "Atuação por Posição")}
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginBottom:"14px", marginTop:"-8px" }}>
                  Quantas vezes cada músico atuou em cada posição (todos os meses)
                </div>
                <div style={{ overflowX:"auto" }}>
                  <div style={{ display:"grid", gridTemplateColumns:`120px repeat(${POSITIONS.length}, minmax(70px, 1fr))`, gap:"2px" }}>
                    <div style={{ padding:"8px 4px", fontSize:"9px", color:"#c9a96e", fontWeight:"700" }}>MÚSICO</div>
                    {POSITIONS.map(pos => (
                      <div key={pos.id} style={{ padding:"8px 4px", fontSize:"9px", color: pos.color, fontWeight:"600", textAlign:"center" }}>
                        {pos.icon} {pos.label.split(" ").pop()}
                      </div>
                    ))}
                    {musicians.filter(m => !m.manualOnly).map(mus => {
                      const vc = getVocalistColor(mus.id);
                      const isVocalist = mus.roles.includes("vocal_principal");
                      const g = globalTotals[mus.id];
                      return [
                        <div key={`pn-${mus.id}`} style={{ padding:"6px 8px", fontSize:"12px", fontWeight:"600", color: isVocalist ? vc.text : "#f0e6d3", borderLeft: isVocalist ? `3px solid ${vc.tag}` : "3px solid transparent" }}>
                          {mus.short}
                        </div>,
                        ...POSITIONS.map(pos => {
                          const cnt = g.positionTotals[pos.id] || 0;
                          const hasRole = mus.roles.includes(pos.id);
                          return (
                            <div key={`${mus.id}-${pos.id}`} style={{
                              padding:"6px 4px", textAlign:"center", borderRadius:"6px", fontSize:"12px", fontWeight: cnt > 0 ? "700" : "400",
                              color: !hasRole ? "rgba(255,255,255,0.08)" : cnt > 0 ? pos.color : "rgba(255,255,255,0.2)",
                              background: cnt > 0 ? `${pos.color}12` : "transparent"
                            }}>
                              {hasRole ? (cnt || "—") : ""}
                            </div>
                          );
                        })
                      ];
                    })}
                  </div>
                </div>
              </div>

              {/* ── LEAD DISTRIBUTION PIE (text-based) ── */}
              <div style={cardStyle}>
                {sectionTitle("\u{1F3A4}", "Distribuição de Leads")}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:"10px" }}>
                  {vocalistDrought.sort((a, b) => b.totalLeads - a.totalLeads).map(v => {
                    const vc = getVocalistColor(v.id);
                    const totalLeadsAll = vocalistDrought.reduce((s, x) => s + x.totalLeads, 0);
                    const pct = totalLeadsAll > 0 ? Math.round((v.totalLeads / totalLeadsAll) * 100) : 0;
                    return (
                      <div key={v.id} style={{ padding:"14px", borderRadius:"12px", background:"rgba(255,255,255,0.02)", border: `1px solid ${vc.border}`, borderLeft: `3px solid ${vc.tag}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                          <span style={{ fontWeight:"700", fontSize:"14px", color: vc.text }}>{v.short}</span>
                          <span style={{ fontSize:"20px", fontWeight:"900", color: vc.tag }}>{v.totalLeads}x</span>
                        </div>
                        <div style={{ height:"6px", background:"rgba(255,255,255,0.06)", borderRadius:"3px", overflow:"hidden", marginBottom:"6px" }}>
                          <div style={{ width:`${pct}%`, height:"100%", background: vc.tag, borderRadius:"3px" }} />
                        </div>
                        <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)" }}>
                          {pct}% dos leads · última: {v.lastLeadDate ? `${fmt(v.lastLeadDate)}` : "nunca"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── PDF REPORTS SECTION ── */}
              {allMonthKeys.length > 0 && (() => {
                const selectedMK = reportSelectedMonths || new Set(allMonthKeys);
                const filteredSchedules = {};
                allMonthKeys.forEach(mk => { if (selectedMK.has(mk)) filteredSchedules[mk] = allSchedules[mk]; });
                const hasSelection = Object.keys(filteredSchedules).length > 0;
                const selCount = selectedMK.size;
                const selLabel = selCount === allMonthKeys.length ? "todos os meses" : `${selCount} ${selCount === 1 ? "mês" : "meses"}`;

                return (
                <div style={cardStyle}>
                  {sectionTitle("\u{1F4C4}", "Relatórios PDF por Músico")}
                  <div style={{ fontSize:"12px", color:"rgba(240,230,211,0.5)", marginBottom:"14px" }}>
                    Gere relatórios profissionais em PDF com calendário, estatísticas e detalhamento por domingo.
                  </div>

                  {/* ── MONTH SELECTOR ── */}
                  <div style={{ marginBottom:"16px" }}>
                    <div style={{ fontSize:"9px", letterSpacing:"3px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"8px" }}>
                      Selecione os meses
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"8px" }}>
                      {allMonthKeys.map(mk => {
                        const [y, m] = mk.split("-").map(Number);
                        const isSelected = selectedMK.has(mk);
                        return (
                          <button key={mk} onClick={() => {
                            const next = new Set(selectedMK);
                            if (next.has(mk)) next.delete(mk); else next.add(mk);
                            setReportSelectedMonths(next.size === allMonthKeys.length ? null : next.size > 0 ? next : new Set([mk]));
                          }} style={{
                            padding:"8px 14px", borderRadius:"8px", cursor:"pointer", fontSize:"12px", fontWeight:"600",
                            fontFamily:"Georgia, serif", transition:"all 0.2s",
                            background: isSelected ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.03)",
                            border: isSelected ? "1px solid rgba(201,169,110,0.5)" : "1px solid rgba(255,255,255,0.08)",
                            color: isSelected ? "#c9a96e" : "rgba(255,255,255,0.35)"
                          }}>
                            {MONTHS[m]} {y}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                      <button onClick={() => setReportSelectedMonths(null)} style={{
                        padding:"4px 10px", borderRadius:"6px", border:"1px solid rgba(201,169,110,0.2)", background:"transparent",
                        color:"#c9a96e", fontSize:"10px", cursor:"pointer", fontFamily:"Georgia, serif"
                      }}>Todos</button>
                      <div style={{ fontSize:"10px", color:"rgba(240,230,211,0.35)" }}>
                        {selLabel} selecionado{selCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  {/* ── MUSICIAN GRID ── */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:"8px", marginBottom:"16px" }}>
                    {musicians.filter(m => !m.manualOnly).map(m => {
                      const vc = getVocalistColor(m.id);
                      return (
                        <button key={m.id} disabled={!hasSelection} onClick={() => {
                          try {
                            const doc = generateMusicianPDF(m, filteredSchedules, blockDates || {});
                            if (doc) doc.save(`Relatorio_${m.short.replace(/\s+/g,"_")}.pdf`);
                          } catch(e) { console.error("PDF error:", e); alert("Erro ao gerar PDF: " + e.message); }
                        }} style={{
                          padding:"10px 12px", borderRadius:"10px", border:`1px solid ${vc.border}`, borderLeft:`3px solid ${vc.tag}`,
                          background:"rgba(255,255,255,0.02)", cursor: hasSelection ? "pointer" : "not-allowed", textAlign:"left",
                          fontFamily:"Georgia, serif", transition:"all 0.2s", opacity: hasSelection ? 1 : 0.4
                        }}
                        onMouseEnter={e => { if (hasSelection) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                        >
                          <div style={{ fontSize:"13px", fontWeight:"700", color: vc.text, marginBottom:"4px" }}>{m.short}</div>
                          <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)" }}>{"\u{1F4E5}"} Baixar PDF</div>
                        </button>
                      );
                    })}
                  </div>
                  <button disabled={!hasSelection} onClick={() => {
                    try {
                      const doc = generateAllMusiciansPDF(musicians, filteredSchedules, blockDates || {});
                      if (doc) doc.save("Relatorio_Completo_Todos_Musicos.pdf");
                    } catch(e) { console.error("PDF error:", e); alert("Erro ao gerar PDF: " + e.message); }
                  }} style={{
                    width:"100%", padding:"14px", borderRadius:"12px", border:"none", cursor: hasSelection ? "pointer" : "not-allowed",
                    fontSize:"14px", fontWeight:"700", fontFamily:"Georgia, serif",
                    background: hasSelection ? "linear-gradient(135deg,#c9a96e,#a07840)" : "rgba(255,255,255,0.08)",
                    color: hasSelection ? "#0d0b1e" : "rgba(255,255,255,0.3)", transition:"all 0.2s"
                  }}
                  onMouseEnter={e => { if (hasSelection) e.currentTarget.style.opacity = "0.9"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                  >
                    {"\u{1F4E5}"} Baixar Relatório Completo ({selLabel})
                  </button>
                </div>
                );
              })()}

              {allMonthKeys.length === 0 && (
                <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(240,230,211,0.3)", fontSize:"15px" }}>
                  Gere escalas para visualizar o dashboard com estatísticas do time
                </div>
              )}
            </div>
          );
        })()}

        {/* ── TAB: BLOQUEIOS (Block Dates) ── */}
        {activeTab === "bloqueios" && (
          <div>
            <div style={{ marginBottom:"16px" }}>
              <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"8px" }}>
                {"\u{1F6AB}"} Datas Indisponíveis — {MONTHS[month]} {year}
              </div>
              <div style={{ fontSize:"12px", color:"rgba(240,230,211,0.5)", marginBottom:"16px" }}>
                Marque os domingos em que cada músico está indisponível. Clique para bloquear/desbloquear.
              </div>
            </div>
            <div style={{ overflowX:"auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:`180px repeat(${sundays.length}, 1fr)`, gap:"3px", minWidth:"400px" }}>
                {/* Header row */}
                <div style={{ ...headerCellStyle, fontSize:"11px", fontWeight:"700", color:"#c9a96e" }}>Músico</div>
                {sundays.map((s, i) => (
                  <div key={i} style={{ ...headerCellStyle, textAlign:"center" }}>
                    <div style={{ fontSize:"10px", color:"#c9a96e", letterSpacing:"2px" }}>Dom {i+1}</div>
                    <div style={{ fontSize:"14px", fontWeight:"700" }}>{fmt(s)}</div>
                  </div>
                ))}
                {/* One row per musician */}
                {musicians.map(m => {
                  const vc = getVocalistColor(m.id);
                  const isVocalist = m.roles.includes("vocal_principal");
                  return [
                    <div key={`name-${m.id}`} style={{
                      padding:"10px 12px", background:"rgba(255,255,255,0.03)", display:"flex", alignItems:"center", gap:"8px",
                      borderLeft: isVocalist ? `3px solid ${vc.tag}` : "3px solid transparent"
                    }}>
                      <span style={{ fontSize:"13px", fontWeight:"600", color: isVocalist ? vc.text : "#f0e6d3" }}>{m.short}</span>
                      {getBlockedCountForMonth(m.id) > 0 && (
                        <span style={{ fontSize:"9px", color:"#ff8c69", background:"rgba(255,140,105,0.15)", padding:"2px 6px", borderRadius:"8px" }}>
                          {getBlockedCountForMonth(m.id)}
                        </span>
                      )}
                    </div>,
                    ...sundays.map((s, si) => {
                      const blocked = isDateBlocked(m.id, s);
                      return (
                        <button key={`block-${m.id}-${si}`} onClick={() => toggleBlockDate(m.id, s)} style={{
                          background: blocked ? "rgba(255,68,68,0.2)" : "rgba(255,255,255,0.02)",
                          border: blocked ? "1px solid rgba(255,68,68,0.4)" : "1px solid rgba(255,255,255,0.06)",
                          borderRadius:"6px", padding:"8px 4px", cursor:"pointer", minHeight:"44px",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"all 0.15s", fontFamily:"Georgia, serif"
                        }}>
                          {blocked ? (
                            <span style={{ fontSize:"16px", color:"#ff4444" }}>{"\u{1F6AB}"}</span>
                          ) : (
                            <span style={{ fontSize:"14px", color:"rgba(255,255,255,0.1)" }}>{"\u2713"}</span>
                          )}
                        </button>
                      );
                    })
                  ];
                })}
              </div>
            </div>
            {totalBlockedThisMonth > 0 && (
              <div style={{ marginTop:"16px", padding:"12px 16px", borderRadius:"10px", background:"rgba(255,140,105,0.08)", border:"1px solid rgba(255,140,105,0.2)" }}>
                <div style={{ fontSize:"11px", color:"#ff8c69", fontWeight:"600", marginBottom:"8px" }}>Resumo de Bloqueios</div>
                {musicians.filter(m => getBlockedCountForMonth(m.id) > 0).map(m => {
                  const blocked = (blockDates[m.id] || []).filter(dk => sundays.some(s => dateKey(s) === dk));
                  return (
                    <div key={m.id} style={{ fontSize:"12px", color:"rgba(240,230,211,0.6)", padding:"4px 0", display:"flex", gap:"8px" }}>
                      <span style={{ fontWeight:"600", color:"#f0e6d3", minWidth:"80px" }}>{m.short}:</span>
                      <span>{blocked.map(dk => {
                        const parts = dk.split("-");
                        return `${parts[2]}/${parts[1]}`;
                      }).join(", ")}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: MÚSICOS ── */}
        {activeTab === "musicos" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase" }}>{"\u{1F3B6}"} Gerenciar Músicos ({musicians.length})</div>
              <button onClick={addMusician} style={{
                ...actionBtnStyle, background:"linear-gradient(135deg,#c9a96e,#a07840)", color:"#0d0b1e", fontWeight:"700", padding:"8px 18px", fontSize:"12px"
              }}>+ Adicionar Músico</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {musicians.map(m => {
                const isEditing = editingMusician === m.id;
                const vc = getVocalistColor(m.id);
                const isVocalist = m.roles.includes("vocal_principal");
                const blockedCount = getBlockedCountForMonth(m.id);
                return (
                  <div key={m.id} style={{
                    background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"16px 20px",
                    border: isVocalist ? `1px solid ${vc.border}` : "1px solid rgba(255,255,255,0.08)",
                    borderLeft: isVocalist ? `3px solid ${vc.tag}` : "3px solid rgba(255,255,255,0.1)"
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: isEditing ? "14px" : "0" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"12px", flex:1 }}>
                        {isVocalist && <span style={{ width:"10px", height:"10px", borderRadius:"50%", background: vc.tag, flexShrink:0 }} />}
                        {isEditing ? (
                          <div style={{ display:"flex", gap:"10px", flex:1, flexWrap:"wrap" }}>
                            <div>
                              <div style={{ fontSize:"9px", color:"#c9a96e", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>Nome Completo</div>
                              <input value={m.name} onChange={e => updateMusician(m.id, { name: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                              <div style={{ fontSize:"9px", color:"#c9a96e", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>Nome Curto</div>
                              <input value={m.short} onChange={e => updateMusician(m.id, { short: e.target.value })} style={{...inputStyle, width:"120px"}} />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontWeight:"700", fontSize:"14px", color: isVocalist ? vc.text : "#f0e6d3" }}>{m.short}</span>
                            {m.name !== m.short && <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginLeft:"8px" }}>{m.name}</span>}
                            {blockedCount > 0 && (
                              <span style={{ fontSize:"10px", color:"#ff8c69", marginLeft:"8px" }}>
                                {"\u{1F6AB}"} {blockedCount} data{blockedCount>1?"s":""} bloqueada{blockedCount>1?"s":""}
                              </span>
                            )}
                            {m.manualOnly && (
                              <span style={{ fontSize:"10px", color:"#ff8c69", marginLeft:"8px", background:"rgba(255,140,105,0.12)", padding:"2px 8px", borderRadius:"10px", border:"1px solid rgba(255,140,105,0.25)" }}>
                                {"\u{270B}"} somente manual
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:"6px", flexShrink:0, marginLeft:"12px" }}>
                        <button onClick={() => setEditingMusician(isEditing ? null : m.id)} style={{
                          background: isEditing ? "rgba(80,180,100,0.2)" : "rgba(201,169,110,0.15)", border: isEditing ? "1px solid rgba(80,180,100,0.3)" : "1px solid rgba(201,169,110,0.25)",
                          color: isEditing ? "#80e880" : "#c9a96e", padding:"6px 14px", borderRadius:"8px", cursor:"pointer", fontSize:"11px", fontFamily:"Georgia, serif"
                        }}>{isEditing ? "\u2713 Fechar" : "\u270E Editar"}</button>
                        <button onClick={() => removeMusician(m.id)} style={{
                          background:"rgba(220,80,80,0.1)", border:"1px solid rgba(220,80,80,0.2)",
                          color:"#ff8080", padding:"6px 10px", borderRadius:"8px", cursor:"pointer", fontSize:"11px", fontFamily:"Georgia, serif"
                        }}>{"\u2715"}</button>
                      </div>
                    </div>
                    {isEditing && (
                      <div>
                        <div style={{ fontSize:"9px", color:"#c9a96e", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Posições</div>
                        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                          {POSITIONS.map(pos => {
                            const hasRole = m.roles.includes(pos.id);
                            return (
                              <button key={pos.id} onClick={() => toggleRole(m.id, pos.id)} style={{
                                padding:"6px 14px", borderRadius:"20px", fontSize:"11px", fontWeight:"600", cursor:"pointer",
                                fontFamily:"Georgia, serif", transition:"all 0.15s",
                                background: hasRole ? `${pos.color}25` : "rgba(255,255,255,0.04)",
                                border: hasRole ? `1px solid ${pos.color}55` : "1px solid rgba(255,255,255,0.1)",
                                color: hasRole ? pos.color : "rgba(255,255,255,0.3)"
                              }}>
                                {pos.icon} {pos.label}
                              </button>
                            );
                          })}
                        </div>
                        {/* Manual Only toggle */}
                        <div style={{ marginTop:"14px" }}>
                          <div style={{ fontSize:"9px", color:"#c9a96e", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Opções</div>
                          <button onClick={() => updateMusician(m.id, { manualOnly: !m.manualOnly })} style={{
                            padding:"8px 16px", borderRadius:"20px", fontSize:"11px", fontWeight:"600", cursor:"pointer",
                            fontFamily:"Georgia, serif", transition:"all 0.15s", display:"flex", alignItems:"center", gap:"8px",
                            background: m.manualOnly ? "rgba(255,140,105,0.2)" : "rgba(80,180,100,0.15)",
                            border: m.manualOnly ? "1px solid rgba(255,140,105,0.4)" : "1px solid rgba(80,180,100,0.3)",
                            color: m.manualOnly ? "#ff8c69" : "#80e880"
                          }}>
                            <span style={{ width:"18px", height:"18px", borderRadius:"4px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px",
                              background: m.manualOnly ? "rgba(255,140,105,0.3)" : "rgba(80,180,100,0.25)",
                              border: m.manualOnly ? "1px solid rgba(255,140,105,0.5)" : "1px solid rgba(80,180,100,0.4)"
                            }}>
                              {m.manualOnly ? "\u{270B}" : "\u{2728}"}
                            </span>
                            {m.manualOnly ? "Somente manual — não incluir na geração automática" : "Incluído na geração automática"}
                          </button>
                        </div>
                      </div>
                    )}
                    {!isEditing && (
                      <div style={{ display:"flex", gap:"4px", flexWrap:"wrap", marginTop:"8px" }}>
                        {m.roles.map(roleId => {
                          const pos = POSITIONS.find(p => p.id === roleId);
                          return pos ? (
                            <span key={roleId} style={{
                              padding:"2px 8px", borderRadius:"12px", fontSize:"9px",
                              background: `${pos.color}15`, border: `1px solid ${pos.color}33`, color: pos.color
                            }}>
                              {pos.icon} {pos.label}
                            </span>
                          ) : null;
                        })}
                        {m.roles.length === 0 && <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.2)", fontStyle:"italic" }}>Nenhuma posição definida</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB: CONFLITOS ── */}
        {activeTab === "conflitos" && (
          <div>
            {conflicts.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"#5bc85b", fontSize:"16px" }}>
                {"\u2705"} Nenhum conflito encontrado!<br/>
                <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.3)", display:"block", marginTop:"8px" }}>A escala está respeitando todas as regras</span>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {errors.map((c,i) => (
                  <div key={`e${i}`} style={{ padding:"14px 18px", borderRadius:"10px", background:"rgba(220,60,60,0.12)", border:"1px solid rgba(220,60,60,0.3)", display:"flex", gap:"12px", alignItems:"flex-start" }}>
                    <span style={{ fontSize:"18px" }}>{"\u{1F534}"}</span>
                    <div>
                      <div style={{ fontSize:"11px", color:"rgba(255,150,150,0.6)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"2px" }}>Erro</div>
                      <div style={{ fontSize:"13px", color:"#ffaaaa" }}>{c.msg}</div>
                    </div>
                  </div>
                ))}
                {warnings.map((c,i) => (
                  <div key={`w${i}`} style={{ padding:"14px 18px", borderRadius:"10px", background:"rgba(240,160,40,0.1)", border:"1px solid rgba(240,160,40,0.25)", display:"flex", gap:"12px", alignItems:"flex-start" }}>
                    <span style={{ fontSize:"18px" }}>{"\u{1F7E1}"}</span>
                    <div>
                      <div style={{ fontSize:"11px", color:"rgba(240,200,100,0.6)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"2px" }}>Atenção</div>
                      <div style={{ fontSize:"13px", color:"#ffd080" }}>{c.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop:"24px", background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"16px 20px" }}>
              <div style={{ fontSize:"11px", letterSpacing:"3px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px" }}>Regras do Sistema</div>
              {[
                "Cada músico deve ter pelo menos 1 folga por mês (exceto Hugo Luigi)",
                "Ana Tiscianeli: máximo 1x por mês",
                "Madalena: domingos alternados (1 sim, 1 não)",
                "Casais Asafe/Jokasta e Leandro/Aline: SEMPRE folga juntos",
                "Lead Vocal: todos devem liderar antes de alguém repetir (bloqueados não contam como pulados)",
                "Hugo e Leandro: quando vocal, automaticamente no violão (se não precisar cobrir teclado)",
                "Teclado e Bateria: SEMPRE obrigatórios",
                "Back Vocal #3: pode ficar vazio quando necessário",
                "Baixo, Guitarra e Violão: podem ficar vazios se necessário",
                "Mínimo 2 back vocals por domingo",
                "Datas bloqueadas: músicos indisponíveis são removidos automaticamente",
                "Mês anterior: quando existe, a rotação de leads e folgas considera continuidade",
                "Somente manual: músicos com esta opção só podem ser escalados manualmente pelo usuário",
              ].map((r,i) => (
                <div key={i} style={{ padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:"12px", color:"rgba(240,230,211,0.6)", display:"flex", gap:"8px" }}>
                  <span style={{ color:"#c9a96e", fontSize:"14px" }}>{"\u2726"}</span>{r}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign:"center", marginTop:"24px", fontSize:"10px", color:"rgba(255,255,255,0.2)", letterSpacing:"1px" }}>
          Dados sincronizados com o servidor {"\u2022"} HLSS Prime Services
        </div>
      </div>
    </div>
  );
}
// ─── STYLE CONSTANTS ────────────────────────────────────────────────────────
const navBtnStyle = {
  background:"rgba(201,169,110,0.12)", border:"1px solid rgba(201,169,110,0.25)",
  color:"#c9a96e", width:"38px", height:"38px", borderRadius:"50%",
  cursor:"pointer", fontSize:"20px", display:"flex", alignItems:"center", justifyContent:"center"
};
const actionBtnStyle = {
  padding:"11px 22px", borderRadius:"25px", border:"none", cursor:"pointer",
  fontSize:"13px", fontFamily:"Georgia, serif", letterSpacing:"0.5px", transition:"all 0.2s"
};
const headerCellStyle = {
  padding:"12px 8px", background:"rgba(201,169,110,0.1)"
};
const inputStyle = {
  background:"rgba(255,255,255,0.08)", border:"1px solid rgba(201,169,110,0.3)", borderRadius:"8px",
  padding:"8px 12px", color:"#f0e6d3", fontSize:"13px", fontFamily:"Georgia, serif", outline:"none", width:"200px"
};
const selectStyle = {
  background:"rgba(255,255,255,0.08)", border:"1px solid rgba(201,169,110,0.3)", borderRadius:"8px",
  padding:"8px 10px", color:"#f0e6d3", fontSize:"12px", fontFamily:"Georgia, serif", outline:"none", flex:1
};
