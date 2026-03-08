import { useState, useEffect, useCallback } from "react";
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
  { id: "violao", label: "Viol\u00e3o", count: 1, icon: "\u{1F3B8}", color: "#ff8c69", required: false },
  { id: "baixo", label: "Baixo", count: 1, icon: "\u{1F3BC}", color: "#69b4ff", required: false },
  { id: "guitarra", label: "Guitarra", count: 1, icon: "\u26A1", color: "#ff69b4", required: false },
  { id: "bateria", label: "Bateria", count: 1, icon: "\u{1F941}", color: "#98d982", required: true },
];
const MONTHS = ["Janeiro","Fevereiro","Mar\u00e7o","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
// ─── HELPERS ────────────────────────────────────────────────────────────────
function getSundays(year, month) {
  const sundays = [];
  const d = new Date(year, month, 1);
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  while (d.getMonth() === month) { sundays.push(new Date(d)); d.setDate(d.getDate() + 7); }
  return sundays;
}
function fmt(date) { return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}`; }
// ─── SMART SCHEDULER ────────────────────────────────────────────────────────
function generateSchedule(sundays, leadRotation, musicians, leadVocalists) {
  const totalSundays = sundays.length;
  const schedule = {};
  const musicianSundayCount = {};
  const getMusicianById = (id) => musicians.find(m => m.id === id);
  musicians.forEach(m => { musicianSundayCount[m.id] = 0; });
  let leadQueue = [...leadRotation];
  const newRotation = [...leadRotation];
  for (let si = 0; si < totalSundays; si++) {
    const dayAssignments = {};
    const usedThisSunday = new Set();
    function canSchedule(musicianId, positionId) {
      const m = getMusicianById(musicianId);
      if (!m) return false;
      if (usedThisSunday.has(musicianId)) return false;
      if (!m.roles.includes(positionId)) return false;
      if (m.maxPerMonth && musicianSundayCount[musicianId] >= m.maxPerMonth) return false;
      if (m.alternating) {
        const lastOn = Object.keys(schedule).filter(k => {
          const [s] = k.split("-");
          return parseInt(s) === si - 1 && schedule[k] === musicianId;
        });
        if (lastOn.length > 0) return false;
      }
      return true;
    }
    // ── STEP 1: Assign Lead Vocalist (rotation) ──
    let leadAssigned = null;
    for (let attempt = 0; attempt < leadQueue.length; attempt++) {
      const candidate = leadQueue[attempt];
      const m = getMusicianById(candidate);
      if (!m) continue;
      if (m.maxPerMonth && musicianSundayCount[candidate] >= m.maxPerMonth) continue;
      if (m.alternating) {
        const wasLastSunday = si > 0 && Object.keys(schedule).some(k => k.startsWith(`${si-1}-`) && schedule[k] === candidate);
        if (wasLastSunday) continue;
      }
      leadAssigned = candidate;
      leadQueue.splice(attempt, 1);
      newRotation.push(candidate);
      break;
    }
    if (!leadAssigned) {
      const fallbacks = leadVocalists.filter(id => {
        const m = getMusicianById(id);
        if (!m) return false;
        if (m.maxPerMonth && musicianSundayCount[id] >= m.maxPerMonth) return false;
        if (m.alternating) {
          const wasLast = si > 0 && Object.keys(schedule).some(k => k.startsWith(`${si-1}-`) && schedule[k] === id);
          if (wasLast) return false;
        }
        return true;
      });
      if (fallbacks.length > 0) leadAssigned = fallbacks[0];
    }
    if (leadAssigned) {
      schedule[`${si}-vocal_principal-0`] = leadAssigned;
      usedThisSunday.add(leadAssigned);
      musicianSundayCount[leadAssigned]++;
      dayAssignments["vocal_principal"] = [leadAssigned];
      const leadM = getMusicianById(leadAssigned);
      if ((leadAssigned === "hugo" || leadAssigned === "leandro") && leadM?.canDoubleVocalViolao) {
        schedule[`${si}-violao-0`] = leadAssigned;
      }
      if (leadM?.coupleId) {
        const partner = getMusicianById(leadM.coupleId);
        if (partner && partner.roles.includes("vocal_back")) {
          if (!(partner.maxPerMonth && musicianSundayCount[partner.id] >= partner.maxPerMonth)) {
            usedThisSunday.add(partner.id);
            if (!dayAssignments["vocal_back"]) dayAssignments["vocal_back"] = [];
            dayAssignments["vocal_back"].push(partner.id);
          }
        }
      }
    }
    // ── STEP 2: Back Vocals (3 slots, min 2) ──
    const backVocalCandidates = musicians.filter(m =>
      m.roles.includes("vocal_back") &&
      !usedThisSunday.has(m.id) &&
      !(m.maxPerMonth && musicianSundayCount[m.id] >= m.maxPerMonth) &&
      !(m.alternating && si > 0 && Object.keys(schedule).some(k => k.startsWith(`${si-1}-`) && schedule[k] === m.id))
    ).sort((a, b) => musicianSundayCount[a.id] - musicianSundayCount[b.id]);
    const existingBack = dayAssignments["vocal_back"] || [];
    let backSlot = existingBack.length;
    for (const bv of backVocalCandidates) {
      if (backSlot >= 3) break;
      const bvM = getMusicianById(bv.id);
      if (bvM?.coupleId && !usedThisSunday.has(bvM.coupleId) && !existingBack.includes(bvM.coupleId)) {
        const coupleM = getMusicianById(bvM.coupleId);
        const coupleOk = coupleM && !usedThisSunday.has(coupleM.id) &&
          !(coupleM.maxPerMonth && musicianSundayCount[coupleM.id] >= coupleM.maxPerMonth);
        if (!coupleOk) continue;
        if (backSlot < 3) {
          existingBack.push(bv.id);
          usedThisSunday.add(bv.id);
          schedule[`${si}-vocal_back-${backSlot}`] = bv.id;
          musicianSundayCount[bv.id]++;
          backSlot++;
        }
        if (backSlot < 3 && coupleM.roles.includes("vocal_back") && !usedThisSunday.has(coupleM.id)) {
          existingBack.push(coupleM.id);
          usedThisSunday.add(coupleM.id);
          schedule[`${si}-vocal_back-${backSlot}`] = coupleM.id;
          musicianSundayCount[coupleM.id]++;
          backSlot++;
        }
        continue;
      }
      existingBack.push(bv.id);
      usedThisSunday.add(bv.id);
      schedule[`${si}-vocal_back-${backSlot}`] = bv.id;
      musicianSundayCount[bv.id]++;
      backSlot++;
    }
    existingBack.forEach((id, idx) => {
      if (!schedule[`${si}-vocal_back-${idx}`]) {
        schedule[`${si}-vocal_back-${idx}`] = id;
        if (!usedThisSunday.has(id)) {
          usedThisSunday.add(id);
          musicianSundayCount[id]++;
        }
      }
    });
    // ── STEP 3: Instruments ──
    const instrumentPositions = ["teclado","bateria","violao","baixo","guitarra"];
    for (const posId of instrumentPositions) {
      if (posId === "violao" && schedule[`${si}-violao-0`]) continue;
      const candidates = musicians.filter(m =>
        m.roles.includes(posId) &&
        !usedThisSunday.has(m.id) &&
        !(m.maxPerMonth && musicianSundayCount[m.id] >= m.maxPerMonth)
      ).sort((a, b) => musicianSundayCount[a.id] - musicianSundayCount[b.id]);
      if (candidates.length > 0) {
        const chosen = candidates[0].id;
        schedule[`${si}-${posId}-0`] = chosen;
        usedThisSunday.add(chosen);
        musicianSundayCount[chosen]++;
      }
    }
  }
  return { schedule, newLeadQueue: leadQueue };
}
// ─── CONFLICT ANALYZER ──────────────────────────────────────────────────────
function analyzeConflicts(schedule, sundays, leadRotationHistory, musicians, leadVocalists) {
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
      conflicts.push({ type: "missing_required", severity: "error", msg: `Domingo ${si+1}: sem Vocal Principal (obrigat\u00f3rio)` });
    }
    if (!schedule[`${si}-teclado-0`]) {
      conflicts.push({ type: "missing_required", severity: "error", msg: `Domingo ${si+1}: sem Teclado (obrigat\u00f3rio)` });
    }
    if (!schedule[`${si}-bateria-0`]) {
      conflicts.push({ type: "missing_required", severity: "error", msg: `Domingo ${si+1}: sem Bateria (obrigat\u00f3rio)` });
    }
    const backCount = [0,1,2].filter(s => schedule[`${si}-vocal_back-${s}`]).length;
    if (backCount < 2) {
      conflicts.push({ type: "low_back", severity: "warning", msg: `Domingo ${si+1}: apenas ${backCount} back vocal (m\u00ednimo recomendado: 2)` });
    }
    const lead = schedule[`${si}-vocal_principal-0`];
    if ((lead === "hugo" || lead === "leandro") && schedule[`${si}-violao-0`] !== lead) {
      const m = getMusicianById(lead);
      conflicts.push({ type: "vocal_violao", severity: "warning", msg: `Domingo ${si+1}: ${m?.name} \u00e9 lead mas n\u00e3o est\u00e1 no viol\u00e3o` });
    }
  }
  musicians.forEach(m => {
    const count = (sundaysByMusician[m.id] || []).length;
    const offWeeks = totalSundays - count;
    if (offWeeks === 0 && totalSundays >= 4 && !m.noFolgaRequired) {
      conflicts.push({ type: "no_folga", severity: "error", msg: `${m.name} n\u00e3o tem nenhuma folga este m\u00eas` });
    }
    if (m.maxPerMonth && count > m.maxPerMonth) {
      conflicts.push({ type: "ana_limit", severity: "error", msg: `${m.name} escalada ${count}x (m\u00e1ximo ${m.maxPerMonth}x/m\u00eas)` });
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
    if (m.coupleId) {
      const partnerSuns = sundaysByMusician[m.coupleId] || [];
      const mySuns = sundaysByMusician[m.id] || [];
      sundays.forEach((_, si) => {
        const mOn = mySuns.includes(si);
        const partOn = partnerSuns.includes(si);
        if (mOn !== partOn) {
          const partner = getMusicianById(m.coupleId);
          const alreadyReported = conflicts.some(c => c.type === "couple" && c.ids?.includes(m.id));
          if (!alreadyReported) {
            conflicts.push({ type: "couple", severity: "warning", ids: [m.id, m.coupleId],
              msg: `Casal ${m.name} & ${partner?.name}: folgas diferentes no domingo ${si+1}` });
          }
        }
      });
    }
  });
  const leads = sundays.map((_, si) => schedule[`${si}-vocal_principal-0`]).filter(Boolean);
  for (let i = 0; i < leads.length; i++) {
    for (let j = i+1; j < leads.length; j++) {
      if (leads[i] === leads[j]) {
        const between = leads.slice(i+1, j);
        const allLeads = leadVocalists.filter(id => {
          const m = getMusicianById(id);
          return !(m?.maxPerMonth && (sundaysByMusician[id]||[]).length >= m.maxPerMonth);
        });
        const notYetLed = allLeads.filter(id => !between.includes(id) && id !== leads[i]);
        if (notYetLed.length > 0) {
          const m = getMusicianById(leads[i]);
          conflicts.push({ type: "lead_repeat", severity: "warning",
            msg: `${m?.name} lidera 2x antes de todos vocais liderarem (dom ${i+1} e ${j+1})` });
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
  const [musicians, setMusicians] = useState(DEFAULT_MUSICIANS);
  const [editingMusician, setEditingMusician] = useState(null);
  const monthKey = `${year}-${month}`;
  const sundays = getSundays(year, month);
  // Derived
  const leadVocalists = musicians.filter(m => m.roles.includes("vocal_principal")).map(m => m.id);
  const getMusicianById = (id) => musicians.find(m => m.id === id);
  // ── Storage ──
  useEffect(() => {
    try {
      const s = localStorage.getItem("escala_schedules");
      const r = localStorage.getItem("escala_lead_rotation");
      const m = localStorage.getItem("escala_musicians");
      if (s) setAllSchedules(JSON.parse(s));
      if (m) {
        setMusicians(JSON.parse(m));
        const parsed = JSON.parse(m);
        const lv = parsed.filter(x => x.roles.includes("vocal_principal")).map(x => x.id);
        if (r) setLeadRotation(JSON.parse(r));
        else setLeadRotation(lv);
      } else {
        const lv = DEFAULT_MUSICIANS.filter(x => x.roles.includes("vocal_principal")).map(x => x.id);
        if (r) setLeadRotation(JSON.parse(r));
        else setLeadRotation(lv);
      }
    } catch(e) { console.error("Error loading data:", e); }
    setLoaded(true);
  }, []);
  function persist(schedules, rotation) {
    try {
      localStorage.setItem("escala_schedules", JSON.stringify(schedules));
      localStorage.setItem("escala_lead_rotation", JSON.stringify(rotation));
    } catch(e) { console.error("Error saving data:", e); }
  }
  function persistMusicians(newMusicians) {
    try {
      localStorage.setItem("escala_musicians", JSON.stringify(newMusicians));
    } catch(e) { console.error("Error saving musicians:", e); }
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
    if (posId === "vocal_principal" && (musicianId === "hugo" || musicianId === "leandro")) {
      updated[`${si}-violao-0`] = musicianId;
    }
    setSchedule(updated);
    setActiveCell(null);
  }
  function clearCell(si, posId, slot) {
    const updated = { ...schedule };
    const wasLead = posId === "vocal_principal" ? updated[`${si}-vocal_principal-0`] : null;
    delete updated[`${si}-${posId}-${slot}`];
    if (posId === "vocal_principal" && (wasLead === "hugo" || wasLead === "leandro")) {
      if (updated[`${si}-violao-0`] === wasLead) {
        delete updated[`${si}-violao-0`];
      }
    }
    setSchedule(updated);
  }
  function autoGenerate() {
    setGenerating(true);
    setTimeout(() => {
      const { schedule: newSched, newLeadQueue } = generateSchedule(sundays, leadRotation, musicians, leadVocalists);
      const updatedSchedules = { ...allSchedules, [monthKey]: newSched };
      const updatedRotation = newLeadQueue;
      setAllSchedules(updatedSchedules);
      setLeadRotation(updatedRotation);
      persist(updatedSchedules, updatedRotation);
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
    const newM = { id: newId, name: "Novo M\u00fasico", short: "Novo", roles: [] };
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

  const conflicts = analyzeConflicts(schedule, sundays, leadRotation, musicians, leadVocalists);
  const errors = conflicts.filter(c => c.severity === "error");
  const warnings = conflicts.filter(c => c.severity === "warning");
  const stats = musicians.map(m => {
    const suns = getMusicianSundays(m.id);
    const leadsThisMonth = sundays.filter((_, si) => schedule[`${si}-vocal_principal-0`] === m.id).length;
    return { ...m, count: suns.size, offWeeks: sundays.length - suns.size, sundays: suns, leadsThisMonth };
  });
  const hasData = Object.keys(schedule).length > 0;
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
          <div style={{ fontSize:"10px", letterSpacing:"8px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"6px" }}>Minist\u00e9rio de Louvor</div>
          <h1 style={{ fontSize:"clamp(26px,5vw,40px)", fontWeight:"900", margin:"0 0 4px", color:"#f0e6d3", letterSpacing:"-1px" }}>
            {"\u2726"} Escala de M\u00fasicos {"\u2726"}
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
        </div>
        {/* ── VOCALIST COLOR LEGEND ── */}
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center", marginBottom:"16px" }}>
          {leadVocalists.map(id => {
            const m = getMusicianById(id);
            const vc = getVocalistColor(id);
            return (
              <div key={id} style={{
                padding:"4px 12px", borderRadius:"16px", fontSize:"11px", fontWeight:"600",
                background: vc.bg, border: `1px solid ${vc.border}`, color: vc.text
              }}>
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
            {generating ? "\u23F3 Gerando..." : "\u2728 Gerar Escala Autom\u00e1tica"}
          </button>
          {hasData && (
            <button onClick={clearMonth} style={{ ...actionBtnStyle, background:"rgba(220,80,80,0.15)", border:"1px solid rgba(220,80,80,0.3)", color:"#ff9999" }}>
              {"\u{1F5D1}"} Limpar M\u00eas
            </button>
          )}
        </div>
        {/* ── CONFLICT BANNER (only when there's schedule data) ── */}
        {hasData && conflicts.length > 0 && (
          <div style={{ marginBottom:"20px", borderRadius:"12px", overflow:"hidden", border:"1px solid rgba(220,80,80,0.3)" }}>
            {errors.map((c,i) => (
              <div key={i} style={{ padding:"10px 16px", background:"rgba(220,60,60,0.15)", fontSize:"13px", color:"#ffaaaa", borderBottom: i < errors.length-1 ? "1px solid rgba(220,80,80,0.2)" : "none" }}>
                {"\u{1F534}"} {c.msg}
              </div>
            ))}
            {warnings.map((c,i) => (
              <div key={i} style={{ padding:"10px 16px", background:"rgba(240,160,40,0.12)", fontSize:"13px", color:"#ffd080", borderTop: errors.length > 0 && i === 0 ? "1px solid rgba(240,160,40,0.2)" : "none", borderBottom: i < warnings.length-1 ? "1px solid rgba(240,160,40,0.15)" : "none" }}>
                {"\u{1F7E1}"} {c.msg}
              </div>
            ))}
          </div>
        )}
        {hasData && conflicts.length === 0 && (
          <div style={{ marginBottom:"20px", padding:"10px 16px", borderRadius:"10px", background:"rgba(80,180,100,0.12)", border:"1px solid rgba(80,180,100,0.25)", fontSize:"13px", color:"#80e880", textAlign:"center" }}>
            {"\u2705"} Nenhum conflito encontrado {"\u2014"} escala v\u00e1lida!
          </div>
        )}
        {/* ── TABS ── */}
        <div style={{ display:"flex", gap:"4px", marginBottom:"20px", background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"4px" }}>
          {[["escala","\u{1F4CB} Escala"],["resumo","\u{1F4CA} Resumo"],["musicos","\u{1F3B6} M\u00fasicos"],["conflitos",`\u26A0\uFE0F Conflitos ${conflicts.length > 0 ? `(${conflicts.length})` : ""}`]].map(([t,label]) => (
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
                Clique em <strong style={{color:"#c9a96e"}}>{"\u2728"} Gerar Escala Autom\u00e1tica</strong> ou atribua m\u00fasicos manualmente
              </div>
            )}
            {hasData && (
              <div style={{ display:"grid", gridTemplateColumns:`160px repeat(${sundays.length},1fr)`, gap:"3px", minWidth:"500px" }}>
                <div style={headerCellStyle} />
                {sundays.map((s,i) => {
                  const leadId = schedule[`${i}-vocal_principal-0`];
                  const vc = leadId ? getVocalistColor(leadId) : null;
                  return (
                    <div key={i} style={{
                      ...headerCellStyle, textAlign:"center",
                      borderRadius: i===0?"8px 0 0 0":i===sundays.length-1?"0 8px 0 0":"0",
                      borderBottom: vc ? `3px solid ${vc.tag}` : "3px solid transparent"
                    }}>
                      <div style={{ fontSize:"10px", color:"#c9a96e", letterSpacing:"2px", textTransform:"uppercase" }}>Dom {i+1}</div>
                      <div style={{ fontSize:"17px", fontWeight:"700" }}>{fmt(s)}</div>
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
                          {pos.count > 1 && <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)" }}>#{slot+1}</div>}
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
                        const isDoubling = pos.id === "violao" && assigned && (assigned === "hugo" || assigned === "leandro") && schedule[`${si}-vocal_principal-0`] === assigned;
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
                                  return (
                                    <button key={m.id} onClick={() => assign(si, pos.id, slot, m.id)} style={{
                                      width:"100%", padding:"9px 14px", background: m.id===assigned ? (mVc ? mVc.bg : "rgba(201,169,110,0.15)") : "transparent",
                                      border:"none", borderBottom:"1px solid rgba(255,255,255,0.05)", color: overLimit?"#666": (mVc ? mVc.text : "#f0e6d3"),
                                      cursor:"pointer", textAlign:"left", fontSize:"12px", display:"flex", justifyContent:"space-between",
                                      fontFamily:"Georgia, serif"
                                    }}>
                                      <span style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                                        {mVc && <span style={{ width:"8px", height:"8px", borderRadius:"50%", background: mVc.tag, display:"inline-block" }} />}
                                        {m.name}
                                      </span>
                                      <span style={{ fontSize:"10px", color:"#c9a96e", opacity:0.6 }}>{suns.size}x</span>
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
          </div>
        )}
        {/* ── TAB: RESUMO ── */}
        {activeTab === "resumo" && (
          <div>
            <div style={{ marginBottom:"20px", background:"rgba(232,168,56,0.08)", border:"1px solid rgba(232,168,56,0.2)", borderRadius:"12px", padding:"16px 20px" }}>
              <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px" }}>{"\u{1F3A4}"} Fila de Rota\u00e7\u00e3o dos Leads</div>
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
                O pr\u00f3ximo a ser escalado como lead come\u00e7a do in\u00edcio ap\u00f3s todos passarem pela rota\u00e7\u00e3o
              </div>
            </div>
            <div style={{ marginBottom:"20px", background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"16px 20px" }}>
              <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px" }}>Leads Este M\u00eas</div>
              <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                {sundays.map((_,si) => {
                  const leadId = schedule[`${si}-vocal_principal-0`];
                  const m = leadId ? getMusicianById(leadId) : null;
                  const vc = leadId ? getVocalistColor(leadId) : null;
                  return (
                    <div key={si} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginBottom:"4px" }}>Dom {si+1}</div>
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
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))", gap:"10px" }}>
              {stats.map(m => {
                const hasFolga = m.offWeeks >= 1;
                const color = hasFolga ? "#5bc85b" : "#ff6060";
                const vc = getVocalistColor(m.id);
                const isVocalist = leadVocalists.includes(m.id);
                return (
                  <div key={m.id} style={{
                    background:"rgba(255,255,255,0.03)",
                    border: isVocalist ? `1px solid ${vc.border}` : `1px solid ${hasFolga?"rgba(91,200,91,0.2)":"rgba(255,96,96,0.2)"}`,
                    borderRadius:"12px", padding:"14px",
                    borderLeft: isVocalist ? `3px solid ${vc.tag}` : undefined
                  }}>
                    <div style={{ fontSize:"13px", fontWeight:"700", color: isVocalist ? vc.text : "#f0e6d3", marginBottom:"2px" }}>{m.short}</div>
                    <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginBottom:"10px" }}>
                      {m.name !== m.short ? m.name.replace(m.short,"").trim() : ""}
                      {m.maxPerMonth && <span style={{ color:"#c9a96e" }}> {"\u2022"} m\u00e1x {m.maxPerMonth}x</span>}
                      {m.alternating && <span style={{ color:"#c9a96e" }}> {"\u2022"} alternado</span>}
                      {m.coupleId && <span style={{ color:"#aaa8ff" }}> {"\u2022"} casal</span>}
                    </div>
                    <div style={{ display:"flex", gap:"4px", marginBottom:"8px" }}>
                      {sundays.map((_,i) => {
                        const isLeadHere = schedule[`${i}-vocal_principal-0`] === m.id;
                        return (
                          <div key={i} style={{
                            width:"20px", height:"20px", borderRadius:"5px", fontSize:"9px", fontWeight:"700",
                            background: isOnSunday(m.id,i) ? (isLeadHere ? vc.tag : (isVocalist ? `${vc.tag}88` : "#c9a96e")) : "rgba(255,255,255,0.07)",
                            color: isOnSunday(m.id,i) ? "#0d0b1e" : "rgba(255,255,255,0.25)",
                            display:"flex", alignItems:"center", justifyContent:"center"
                          }}>{isLeadHere ? "L" : i+1}</div>
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
        {/* ── TAB: MÚSICOS ── */}
        {activeTab === "musicos" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase" }}>{"\u{1F3B6}"} Gerenciar M\u00fasicos ({musicians.length})</div>
              <button onClick={addMusician} style={{
                ...actionBtnStyle, background:"linear-gradient(135deg,#c9a96e,#a07840)", color:"#0d0b1e", fontWeight:"700", padding:"8px 18px", fontSize:"12px"
              }}>+ Adicionar M\u00fasico</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {musicians.map(m => {
                const isEditing = editingMusician === m.id;
                const vc = getVocalistColor(m.id);
                const isVocalist = m.roles.includes("vocal_principal");
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
                    {/* Roles / Positions */}
                    {isEditing && (
                      <div>
                        <div style={{ fontSize:"9px", color:"#c9a96e", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Posi\u00e7\u00f5es</div>
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
                      </div>
                    )}
                    {/* Show roles summary when not editing */}
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
                        {m.roles.length === 0 && <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.2)", fontStyle:"italic" }}>Nenhuma posi\u00e7\u00e3o definida</span>}
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
                <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.3)", display:"block", marginTop:"8px" }}>A escala est\u00e1 respeitando todas as regras</span>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {errors.map((c,i) => (
                  <div key={i} style={{ padding:"14px 18px", borderRadius:"10px", background:"rgba(220,60,60,0.12)", border:"1px solid rgba(220,60,60,0.3)", display:"flex", gap:"12px", alignItems:"flex-start" }}>
                    <span style={{ fontSize:"18px" }}>{"\u{1F534}"}</span>
                    <div>
                      <div style={{ fontSize:"11px", color:"rgba(255,150,150,0.6)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"2px" }}>Erro</div>
                      <div style={{ fontSize:"13px", color:"#ffaaaa" }}>{c.msg}</div>
                    </div>
                  </div>
                ))}
                {warnings.map((c,i) => (
                  <div key={i} style={{ padding:"14px 18px", borderRadius:"10px", background:"rgba(240,160,40,0.1)", border:"1px solid rgba(240,160,40,0.25)", display:"flex", gap:"12px", alignItems:"flex-start" }}>
                    <span style={{ fontSize:"18px" }}>{"\u{1F7E1}"}</span>
                    <div>
                      <div style={{ fontSize:"11px", color:"rgba(240,200,100,0.6)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"2px" }}>Aten\u00e7\u00e3o</div>
                      <div style={{ fontSize:"13px", color:"#ffd080" }}>{c.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop:"24px", background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"16px 20px" }}>
              <div style={{ fontSize:"11px", letterSpacing:"3px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px" }}>Regras do Sistema</div>
              {[
                "Cada m\u00fasico deve ter pelo menos 1 folga por m\u00eas (exceto Hugo Luigi)",
                "Ana Tiscianeli: m\u00e1ximo 1x por m\u00eas",
                "Madalena: domingos alternados (1 sim, 1 n\u00e3o)",
                "Casais Asafe/Jokasta e Leandro/Aline: sempre folga juntos",
                "Lead Vocal: rota\u00e7\u00e3o completa antes de repetir",
                "Hugo e Leandro: quando vocal, automaticamente no viol\u00e3o",
                "Teclado e Bateria: SEMPRE obrigat\u00f3rios",
                "Baixo, Guitarra e Viol\u00e3o: podem ficar vazios se necess\u00e1rio",
                "M\u00ednimo 2 back vocals por domingo",
              ].map((r,i) => (
                <div key={i} style={{ padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:"12px", color:"rgba(240,230,211,0.6)", display:"flex", gap:"8px" }}>
                  <span style={{ color:"#c9a96e", fontSize:"14px" }}>{"\u2726"}</span>{r}
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ textAlign:"center", marginTop:"24px", fontSize:"10px", color:"rgba(255,255,255,0.2)", letterSpacing:"1px" }}>
          Dados salvos automaticamente {"\u2022"} HLSS Prime Services
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
