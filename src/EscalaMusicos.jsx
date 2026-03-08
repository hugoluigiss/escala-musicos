import { useState, useEffect, useCallback } from "react";
// ─── DATA ───────────────────────────────────────────────────────────────────
const MUSICIANS = [
  { id: "hugo", name: "Hugo Luigi", short: "Hugo", roles: ["vocal_principal","vocal_back","teclado","violao"], canDoubleVocalViolao: true },
  { id: "asafe", name: "Asafe", short: "Asafe", roles: ["teclado","violao","baixo","bateria"], coupleId: "jokasta" },
  { id: "jokasta", name: "Jokasta", short: "Jokasta", roles: ["vocal_principal","vocal_back"], coupleId: "asafe" },
  { id: "matheu", name: "Matheu Emanuel", short: "Matheu", roles: ["vocal_principal","vocal_back","bateria"] },
  { id: "leandro", name: "Leandro Guimarães", short: "Leandro", roles: ["vocal_principal","vocal_back","violao","baixo"], coupleId: "aline", canDoubleVocalViolao: true },
  { id: "aline", name: "Aline Guimarães", short: "Aline", roles: ["vocal_principal","vocal_back"], coupleId: "leandro" },
  { id: "marcus", name: "Marcus", short: "Marcus", roles: ["guitarra"] },
  { id: "wendell", name: "Wendell", short: "Wendell", roles: ["violao"] },
  { id: "josh", name: "Josh", short: "Josh", roles: ["bateria"] },
  { id: "ana", name: "Ana Tiscianeli", short: "Ana", roles: ["vocal_principal","vocal_back"], maxPerMonth: 1 },
  { id: "clivison", name: "Clivison", short: "Clivison", roles: ["vocal_principal","vocal_back"] },
  { id: "madalena", name: "Madalena", short: "Madalena", roles: ["vocal_principal","vocal_back"], alternating: true },
];
const LEAD_VOCALISTS = ["hugo","jokasta","matheu","leandro","aline","ana","clivison","madalena"];
const POSITIONS = [
  { id: "vocal_principal", label: "Vocal Principal", count: 1, icon: "🎤", color: "#e8a838" },
  { id: "vocal_back", label: "Back Vocal", count: 3, icon: "🎵", color: "#9b8aff" },
  { id: "teclado", label: "Teclado", count: 1, icon: "🎹", color: "#5bc8af" },
  { id: "violao", label: "Violão", count: 1, icon: "🎸", color: "#ff8c69" },
  { id: "baixo", label: "Baixo", count: 1, icon: "🎼", color: "#69b4ff" },
  { id: "guitarra", label: "Guitarra", count: 1, icon: "⚡", color: "#ff69b4" },
  { id: "bateria", label: "Bateria", count: 1, icon: "🥁", color: "#98d982" },
];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
function getSundays(year, month) {
  const sundays = [];
  const d = new Date(year, month, 1);
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  while (d.getMonth() === month) { sundays.push(new Date(d)); d.setDate(d.getDate() + 7); }
  return sundays;
}
function fmt(date) { return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}`; }
function getMusicianById(id) { return MUSICIANS.find(m => m.id === id); }
function generateSchedule(sundays, leadRotation) {
  const totalSundays = sundays.length;
  const schedule = {};
  const musicianSundayCount = {};
  MUSICIANS.forEach(m => { musicianSundayCount[m.id] = 0; });
  let leadQueue = [...leadRotation];
  const newRotation = [...leadRotation];
  for (let si = 0; si < totalSundays; si++) {
    const dayAssignments = {};
    const usedThisSunday = new Set();
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
      const fallbacks = LEAD_VOCALISTS.filter(id => {
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
    const backVocalCandidates = MUSICIANS.filter(m =>
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
    const instrumentPositions = ["teclado","violao","baixo","guitarra","bateria"];
    for (const posId of instrumentPositions) {
      const candidates = MUSICIANS.filter(m =>
        m.roles.includes(posId) &&
        !usedThisSunday.has(m.id) &&
        !(m.maxPerMonth && musicianSundayCount[m.id] >= m.maxPerMonth)
      ).sort((a, b) => musicianSundayCount[a.id] - musicianSundayCount[b.id]);
      if (candidates.length > 0) {
        const doubler = candidates.find(c => {
          const m = getMusicianById(c.id);
          return m?.canDoubleVocalViolao && posId === "violao" && usedThisSunday.has(c.id) &&
            (schedule[`${si}-vocal_principal-0`] === c.id || existingBack.includes(c.id));
        });
        if (doubler && posId === "violao") {
          schedule[`${si}-${posId}-0`] = doubler.id;
          musicianSundayCount[doubler.id]++;
        } else {
          schedule[`${si}-${posId}-0`] = candidates[0].id;
          usedThisSunday.add(candidates[0].id);
          musicianSundayCount[candidates[0].id]++;
        }
      }
    }
  }
  return { schedule, newLeadQueue: leadQueue };
}
function analyzeConflicts(schedule, sundays, leadRotationHistory) {
  const conflicts = [];
  const totalSundays = sundays.length;
  const counts = {};
  const sundaysByMusician = {};
  MUSICIANS.forEach(m => { counts[m.id] = 0; sundaysByMusician[m.id] = []; });
  Object.entries(schedule).forEach(([key, val]) => {
    const si = parseInt(key.split("-")[0]);
    if (!counts[val] && counts[val] !== 0) return;
    counts[val]++;
    if (!sundaysByMusician[val].includes(si)) sundaysByMusician[val].push(si);
  });
  MUSICIANS.forEach(m => {
    const count = (sundaysByMusician[m.id] || []).length;
    const offWeeks = totalSundays - count;
    if (offWeeks === 0 && totalSundays >= 4) {
      conflicts.push({ type: "no_folga", severity: "error", msg: `${m.name} não tem nenhuma folga este mês` });
    }
    if (m.maxPerMonth && count > m.maxPerMonth) {
      conflicts.push({ type: "ana_limit", severity: "error", msg: `${m.name} escalada ${count}x (máximo ${m.maxPerMonth}x/mês)` });
    }
    if (m.alternating) {
      const suns = (sundaysByMusician[m.id] || []).sort();
      for (let i = 1; i < suns.length; i++) {
        if (suns[i] - suns[i-1] === 1) {
          conflicts.push({ type: "madalena", severity: "error", msg: `Madalena escalada em domingos consecutivos (dom ${suns[i-1]+1} e ${suns[i]+1})` });
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
        const allLeads = LEAD_VOCALISTS.filter(id => {
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
export default function EscalaMusicos() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [allSchedules, setAllSchedules] = useState({});
  const [leadRotation, setLeadRotation] = useState([...LEAD_VOCALISTS]);
  const [activeCell, setActiveCell] = useState(null);
  const [activeTab, setActiveTab] = useState("escala");
  const [generating, setGenerating] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const monthKey = `${year}-${month}`;
  const sundays = getSundays(year, month);
  useEffect(() => {
    try {
      const s = localStorage.getItem("escala_schedules");
      const r = localStorage.getItem("escala_lead_rotation");
      if (s) setAllSchedules(JSON.parse(s));
      if (r) setLeadRotation(JSON.parse(r));
    } catch(e) { console.error("Error loading data:", e); }
    setLoaded(true);
  }, []);
  function persist(schedules, rotation) {
    try {
      localStorage.setItem("escala_schedules", JSON.stringify(schedules));
      localStorage.setItem("escala_lead_rotation", JSON.stringify(rotation));
    } catch(e) { console.error("Error saving data:", e); }
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
    setSchedule(updated);
    setActiveCell(null);
  }
  function clearCell(si, posId, slot) {
    const updated = { ...schedule };
    delete updated[`${si}-${posId}-${slot}`];
    setSchedule(updated);
  }
  function autoGenerate() {
    setGenerating(true);
    setTimeout(() => {
      const { schedule: newSched, newLeadQueue } = generateSchedule(sundays, leadRotation);
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
  const conflicts = analyzeConflicts(schedule, sundays, leadRotation);
  const errors = conflicts.filter(c => c.severity === "error");
  const warnings = conflicts.filter(c => c.severity === "warning");
  const stats = MUSICIANS.map(m => {
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
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"8px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"6px" }}>Ministério de Louvor</div>
          <h1 style={{ fontSize:"clamp(26px,5vw,40px)", fontWeight:"900", margin:"0 0 4px", color:"#f0e6d3", letterSpacing:"-1px" }}>
            ✦ Escala de Músicos ✦
          </h1>
          <div style={{ width:"80px", height:"1px", background:"linear-gradient(90deg,transparent,#c9a96e,transparent)", margin:"10px auto 16px" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"16px" }}>
            <button onClick={prevMonth} style={navBtnStyle}>‹</button>
            <span style={{ fontSize:"20px", fontWeight:"700", minWidth:"220px", textAlign:"center", color:"#f0e6d3" }}>
              {MONTHS[month]} {year}
              <span style={{ fontSize:"12px", color:"#c9a96e", marginLeft:"8px" }}>({sundays.length} domingos)</span>
            </span>
            <button onClick={nextMonth} style={navBtnStyle}>›</button>
          </div>
        </div>
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center", marginBottom:"24px" }}>
          <button onClick={autoGenerate} disabled={generating} style={{
            ...actionBtnStyle, background:"linear-gradient(135deg,#c9a96e,#a07840)", color:"#0d0b1e", fontWeight:"700"
          }}>
            {generating ? "⏳ Gerando..." : "✨ Gerar Escala Automática"}
          </button>
          {hasData && (
            <button onClick={clearMonth} style={{ ...actionBtnStyle, background:"rgba(220,80,80,0.15)", border:"1px solid rgba(220,80,80,0.3)", color:"#ff9999" }}>
              🗑 Limpar Mês
            </button>
          )}
        </div>
        {conflicts.length > 0 && (
          <div style={{ marginBottom:"20px", borderRadius:"12px", overflow:"hidden", border:"1px solid rgba(220,80,80,0.3)" }}>
            {errors.map((c,i) => (
              <div key={i} style={{ padding:"10px 16px", background:"rgba(220,60,60,0.15)", fontSize:"13px", color:"#ffaaaa", borderBottom: i < errors.length-1 ? "1px solid rgba(220,80,80,0.2)" : "none" }}>
                🔴 {c.msg}
              </div>
            ))}
            {warnings.map((c,i) => (
              <div key={i} style={{ padding:"10px 16px", background:"rgba(240,160,40,0.12)", fontSize:"13px", color:"#ffd080", borderTop: errors.length > 0 && i === 0 ? "1px solid rgba(240,160,40,0.2)" : "none", borderBottom: i < warnings.length-1 ? "1px solid rgba(240,160,40,0.15)" : "none" }}>
                🟡 {c.msg}
              </div>
            ))}
          </div>
        )}
        {hasData && conflicts.length === 0 && (
          <div style={{ marginBottom:"20px", padding:"10px 16px", borderRadius:"10px", background:"rgba(80,180,100,0.12)", border:"1px solid rgba(80,180,100,0.25)", fontSize:"13px", color:"#80e880", textAlign:"center" }}>
            ✅ Nenhum conflito encontrado — escala válida!
          </div>
        )}
        <div style={{ display:"flex", gap:"4px", marginBottom:"20px", background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"4px" }}>
          {[["escala","📋 Escala"],["resumo","📊 Resumo"],["conflitos",`⚠️ Conflitos ${conflicts.length > 0 ? `(${conflicts.length})` : ""}`]].map(([t,label]) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex:1, padding:"10px 8px", border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"13px", fontWeight:"600", fontFamily:"Georgia, serif", transition:"all 0.2s",
              background: activeTab === t ? "rgba(201,169,110,0.2)" : "transparent",
              color: activeTab === t ? "#c9a96e" : "rgba(240,230,211,0.5)",
              borderBottom: activeTab === t ? "2px solid #c9a96e" : "2px solid transparent"
            }}>{label}</button>
          ))}
        </div>
        {activeTab === "escala" && (
          <div style={{ overflowX:"auto", marginBottom:"24px" }}>
            {!hasData && (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(240,230,211,0.3)", fontSize:"15px" }}>
                Clique em <strong style={{color:"#c9a96e"}}>✨ Gerar Escala Automática</strong> ou atribua músicos manualmente
              </div>
            )}
            {hasData && (
              <div style={{ display:"grid", gridTemplateColumns:`160px repeat(${sundays.length},1fr)`, gap:"3px", minWidth:"500px" }}>
                <div style={headerCellStyle} />
                {sundays.map((s,i) => (
                  <div key={i} style={{ ...headerCellStyle, textAlign:"center", borderRadius: i===0?"8px 0 0 0":i===sundays.length-1?"0 8px 0 0":"0" }}>
                    <div style={{ fontSize:"10px", color:"#c9a96e", letterSpacing:"2px", textTransform:"uppercase" }}>Dom {i+1}</div>
                    <div style={{ fontSize:"17px", fontWeight:"700" }}>{fmt(s)}</div>
                  </div>
                ))}
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
                          <div style={{ fontSize:"12px", fontWeight:"600", color:pos.color }}>{pos.label}</div>
                          {pos.count > 1 && <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)" }}>#{slot+1}</div>}
                        </div>
                      </div>,
                      ...sundays.map((_,si) => {
                        const assigned = getAssigned(si, pos.id, slot);
                        const musician = assigned ? getMusicianById(assigned) : null;
                        const cellKey = `${si}-${pos.id}-${slot}`;
                        const isActive = activeCell === cellKey;
                        const isLead = pos.id === "vocal_principal";
                        return (
                          <div key={`cell-${cellKey}`} style={{ position:"relative", background:"rgba(255,255,255,0.02)", borderTop:slotIdx===0?"1px solid rgba(255,255,255,0.06)":"none" }}>
                            <button onClick={() => setActiveCell(isActive ? null : cellKey)} style={{
                              width:"100%", minHeight:"50px", padding:"6px 4px", background: musician ? `${pos.color}18` : "transparent",
                              border: isActive ? `1px solid ${pos.color}` : "1px solid transparent",
                              borderRadius:"4px", cursor:"pointer", color:"#f0e6d3", fontSize:"11px", textAlign:"center", fontFamily:"Georgia, serif", transition:"all 0.15s"
                            }}>
                              {musician ? (
                                <div>
                                  <div style={{ fontWeight:"700", color: isLead ? "#e8a838" : pos.color, fontSize:"12px" }}>{musician.short}</div>
                                  {isLead && <div style={{ fontSize:"9px", color:"rgba(232,168,56,0.6)", letterSpacing:"1px" }}>LEAD</div>}
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
                                  }}>✕ Remover</button>
                                )}
                                {MUSICIANS.filter(m => m.roles.includes(pos.id)).map(m => {
                                  const suns = getMusicianSundays(m.id);
                                  const overLimit = m.maxPerMonth && suns.size >= m.maxPerMonth;
                                  return (
                                    <button key={m.id} onClick={() => assign(si, pos.id, slot, m.id)} style={{
                                      width:"100%", padding:"9px 14px", background: m.id===assigned?"rgba(201,169,110,0.15)":"transparent",
                                      border:"none", borderBottom:"1px solid rgba(255,255,255,0.05)", color: overLimit?"#666":"#f0e6d3",
                                      cursor:"pointer", textAlign:"left", fontSize:"12px", display:"flex", justifyContent:"space-between",
                                      fontFamily:"Georgia, serif"
                                    }}>
                                      <span>{m.name}</span>
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
        {activeTab === "resumo" && (
          <div>
            <div style={{ marginBottom:"20px", background:"rgba(232,168,56,0.08)", border:"1px solid rgba(232,168,56,0.2)", borderRadius:"12px", padding:"16px 20px" }}>
              <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px" }}>🎤 Fila de Rotação dos Leads</div>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {leadRotation.slice(0,8).map((id,i) => {
                  const m = getMusicianById(id);
                  return (
                    <div key={`${id}-${i}`} style={{
                      padding:"6px 12px", borderRadius:"20px", fontSize:"12px",
                      background: i===0?"rgba(232,168,56,0.3)":"rgba(255,255,255,0.06)",
                      border: i===0?"1px solid rgba(232,168,56,0.5)":"1px solid rgba(255,255,255,0.1)",
                      color: i===0?"#e8a838":"rgba(240,230,211,0.7)"
                    }}>
                      {i===0 && "→ "}{m?.short}
                    </div>
                  );
                })}
                {leadRotation.length > 8 && <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"12px", padding:"6px" }}>+{leadRotation.length-8} mais</div>}
              </div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"8px" }}>
                O próximo a ser escalado como lead começa do início após todos passarem pela rotação
              </div>
            </div>
            <div style={{ marginBottom:"20px", background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"16px 20px" }}>
              <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#c9a96e", textTransform:"uppercase", marginBottom:"12px" }}>Leads Este Mês</div>
              <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                {sundays.map((_,si) => {
                  const leadId = schedule[`${si}-vocal_principal-0`];
                  const m = leadId ? getMusicianById(leadId) : null;
                  return (
                    <div key={si} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginBottom:"4px" }}>Dom {si+1}</div>
                      <div style={{
                        padding:"8px 12px", borderRadius:"8px", fontSize:"13px", fontWeight:"700",
                        background: m ? "rgba(232,168,56,0.2)" : "rgba(255,255,255,0.04)",
                        color: m ? "#e8a838" : "rgba(255,255,255,0.2)",
                        border: m ? "1px solid rgba(232,168,56,0.3)" : "1px solid rgba(255,255,255,0.08)"
                      }}>
                        {m ? m.short : "—"}
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
                return (
                  <div key={m.id} style={{
                    background:"rgba(255,255,255,0.03)", border:`1px solid ${hasFolga?"rgba(91,200,91,0.2)":"rgba(255,96,96,0.2)"}`,
                    borderRadius:"12px", padding:"14px"
                  }}>
                    <div style={{ fontSize:"13px", fontWeight:"700", color:"#f0e6d3", marginBottom:"2px" }}>{m.short}</div>
                    <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginBottom:"10px" }}>
                      {m.name !== m.short ? m.name.replace(m.short,"").trim() : ""}
                      {m.maxPerMonth && <span style={{ color:"#c9a96e" }}> • máx {m.maxPerMonth}x</span>}
                      {m.alternating && <span style={{ color:"#c9a96e" }}> • alternado</span>}
                      {m.coupleId && <span style={{ color:"#aaa8ff" }}> • casal</span>}
                    </div>
                    <div style={{ display:"flex", gap:"4px", marginBottom:"8px" }}>
                      {sundays.map((_,i) => (
                        <div key={i} style={{
                          width:"20px", height:"20px", borderRadius:"5px", fontSize:"9px", fontWeight:"700",
                          background: isOnSunday(m.id,i) ? (schedule[`${i}-vocal_principal-0`]===m.id?"#e8a838":"#c9a96e") : "rgba(255,255,255,0.07)",
                          color: isOnSunday(m.id,i) ? "#0d0b1e" : "rgba(255,255,255,0.25)",
                          display:"flex", alignItems:"center", justifyContent:"center"
                        }}>{schedule[`${i}-vocal_principal-0`]===m.id?"L":i+1}</div>
                      ))}
                    </div>
                    <div style={{ fontSize:"11px", color }}>
                      {m.count}x escalado • {m.offWeeks}x folga
                    </div>
                    {m.leadsThisMonth > 0 && (
                      <div style={{ fontSize:"10px", color:"#e8a838", marginTop:"2px" }}>🎤 Lead {m.leadsThisMonth}x</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {activeTab === "conflitos" && (
          <div>
            {conflicts.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"#5bc85b", fontSize:"16px" }}>
                ✅ Nenhum conflito encontrado!<br/>
                <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.3)", display:"block", marginTop:"8px" }}>A escala está respeitando todas as regras</span>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {errors.map((c,i) => (
                  <div key={i} style={{ padding:"14px 18px", borderRadius:"10px", background:"rgba(220,60,60,0.12)", border:"1px solid rgba(220,60,60,0.3)", display:"flex", gap:"12px", alignItems:"flex-start" }}>
                    <span style={{ fontSize:"18px" }}>🔴</span>
                    <div>
                      <div style={{ fontSize:"11px", color:"rgba(255,150,150,0.6)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"2px" }}>Erro</div>
                      <div style={{ fontSize:"13px", color:"#ffaaaa" }}>{c.msg}</div>
                    </div>
                  </div>
                ))}
                {warnings.map((c,i) => (
                  <div key={i} style={{ padding:"14px 18px", borderRadius:"10px", background:"rgba(240,160,40,0.1)", border:"1px solid rgba(240,160,40,0.25)", display:"flex", gap:"12px", alignItems:"flex-start" }}>
                    <span style={{ fontSize:"18px" }}>🟡</span>
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
                "Cada músico deve ter pelo menos 1 folga por mês",
                "Ana Tiscianeli: máximo 1x por mês",
                "Madalena: domingos alternados (1 sim, 1 não)",
                "Casais Asafe/Jokasta e Leandro/Aline: sempre folga juntos",
                "Lead Vocal: rotação completa antes de repetir",
                "Hugo Luigi e Leandro podem acumular Vocal + Violão",
              ].map((r,i) => (
                <div key={i} style={{ padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:"12px", color:"rgba(240,230,211,0.6)", display:"flex", gap:"8px" }}>
                  <span style={{ color:"#c9a96e", fontSize:"14px" }}>✦</span>{r}
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ textAlign:"center", marginTop:"24px", fontSize:"10px", color:"rgba(255,255,255,0.2)", letterSpacing:"1px" }}>
          Dados salvos automaticamente • HLSS Prime Services
        </div>
      </div>
    </div>
  );
}
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
