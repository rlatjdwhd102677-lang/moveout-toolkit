import { useEffect, useMemo, useState } from "react";

export default function DepositDefender() {
  const STORAGE_KEY = "deposit-defender-v2";

  const defaultState = {
    tenantName: "",
    propertyAddress: "",
    landlordName: "",
    moveOutDate: "",
    depositAmount: "",
    email: "",
    stateName: "",
    notes: "",
    issues: [
      { id: 1, area: "Kitchen", amount: "", status: "Review", note: "" },
    ],
    communications: [
      { id: 1, date: "", channel: "Email", subject: "Move-out notice", summary: "" },
    ],
    evidence: [
      { id: 1, date: "", room: "Living Room", fileRef: "", note: "" },
    ],
  };

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultState;
    } catch {
      return defaultState;
    }
  };

  const [data, setData] = useState(loadState);
  const [tab, setTab] = useState("planner");
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!copyMessage) return undefined;
    const timer = setTimeout(() => setCopyMessage(""), 1800);
    return () => clearTimeout(timer);
  }, [copyMessage]);

  const timeline = useMemo(() => {
    if (!data.moveOutDate) return [];

    const move = new Date(data.moveOutDate);
    const tasks = [
      { daysBefore: 30, title: "Give written notice", detail: "Send a written move-out notice and keep a copy for your records." },
      { daysBefore: 21, title: "Review lease terms", detail: "Check cleaning, repainting, repair, and deposit deduction language in your lease." },
      { daysBefore: 14, title: "Start photo evidence", detail: "Take room-by-room photos and short videos. Name files clearly by room and date." },
      { daysBefore: 10, title: "Book cleaning or repair", detail: "Only fix what you actually owe. Save receipts for any professional cleaning or repairs." },
      { daysBefore: 7, title: "Prepare a handoff plan", detail: "Confirm utility shutoff, forwarding address, and key return process in writing." },
      { daysBefore: 3, title: "Final walkthrough prep", detail: "Prepare your evidence list and compare move-out condition against move-in notes or photos." },
      { daysBefore: 1, title: "Capture final condition", detail: "Take final timestamped photos, videos, appliance shots, and meter readings." },
      { daysBefore: 0, title: "Key handoff", detail: "Document the key return and ask for the deposit timeline in writing." },
      { daysAfter: 7, title: "Deposit follow-up", detail: "If there is no update, send a short written follow-up and log the response." },
      { daysAfter: 14, title: "Prepare demand letter", detail: "If deductions feel inflated or the deposit is overdue, prepare your evidence pack and demand letter." },
    ];

    return tasks.map((task, idx) => {
      const d = new Date(move);
      if (typeof task.daysBefore === "number") d.setDate(d.getDate() - task.daysBefore);
      if (typeof task.daysAfter === "number") d.setDate(d.getDate() + task.daysAfter);
      return { ...task, id: idx + 1, date: d.toISOString().slice(0, 10) };
    });
  }, [data.moveOutDate]);

  const totalClaimed = data.issues.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const deposit = parseFloat(data.depositAmount) || 0;
  const estimatedReturn = Math.max(deposit - totalClaimed, 0);

  const evidenceStrength = useMemo(() => {
    let score = 0;
    if (data.evidence.filter((x) => x.fileRef || x.note).length >= 3) score += 35;
    if (data.communications.filter((x) => x.subject || x.summary).length >= 2) score += 25;
    if (data.issues.filter((x) => x.status === "Disputed").length >= 1) score += 15;
    if (data.moveOutDate) score += 10;
    if (data.tenantName && data.landlordName && data.propertyAddress) score += 15;
    return Math.min(score, 100);
  }, [data]);

  const evidenceLabel = evidenceStrength >= 75 ? "Strong" : evidenceStrength >= 45 ? "Medium" : "Weak";

  const updateField = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const updateListItem = (list, id, field, value) => {
    setData((prev) => ({
      ...prev,
      [list]: prev[list].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addListItem = (list, template) => {
    setData((prev) => ({
      ...prev,
      [list]: [...prev[list], { id: Date.now(), ...template }],
    }));
  };

  const removeListItem = (list, id) => {
    setData((prev) => ({
      ...prev,
      [list]: prev[list].filter((item) => item.id !== id),
    }));
  };

  const resetAll = () => {
    if (window.confirm("Reset all saved data?")) {
      localStorage.removeItem(STORAGE_KEY);
      setData(defaultState);
      setTab("planner");
    }
  };

  const loadSampleData = () => {
    setData({
      tenantName: "Jordan Miller",
      propertyAddress: "1228 Maple Street, Apt 3B",
      landlordName: "Northview Property Group",
      moveOutDate: "2026-08-31",
      depositAmount: "1800",
      email: "jordan@example.com",
      stateName: "California",
      notes: "Landlord mentioned carpet cleaning and wall patching charges, but the apartment was returned in normal condition. I have move-in and move-out photos.",
      issues: [
        { id: 1, area: "Carpet cleaning", amount: "250", status: "Disputed", note: "Normal wear and no major stains in final photos." },
        { id: 2, area: "Wall patching", amount: "175", status: "Review", note: "Small nail holes only." },
      ],
      communications: [
        { id: 1, date: "2026-08-01", channel: "Email", subject: "Move-out notice", summary: "Gave written 30-day notice and asked about key return." },
        { id: 2, date: "2026-09-07", channel: "Email", subject: "Deposit follow-up", summary: "Asked for update on deposit and itemized deductions." },
      ],
      evidence: [
        { id: 1, date: "2026-08-30", room: "Living Room", fileRef: "living-room-final.jpg", note: "Walls and floors clean with no visible damage." },
        { id: 2, date: "2026-08-30", room: "Bedroom", fileRef: "bedroom-final.jpg", note: "Carpet vacuumed and no visible stains." },
        { id: 3, date: "2026-08-31", room: "Kitchen", fileRef: "kitchen-video.mp4", note: "Countertops, oven, and sink clean at handoff." },
      ],
    });
    setTab("planner");
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deposit-defender.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const demandLetter = useMemo(() => {
    const disputedItems = data.issues.filter(
      (item) => item.status === "Disputed" || item.status === "Review"
    );
  
    const disputedText = disputedItems.length
      ? disputedItems
          .map((item) => {
            const amountText = item.amount ? `: $${item.amount}` : "";
            const noteText = item.note ? ` (${item.note})` : "";
            return `- ${item.area}${amountText}${noteText}`;
          })
          .join("\n")
      : "- No disputed deductions entered yet.";
  
    const evidenceItems = data.evidence
      .filter((item) => item.fileRef || item.note)
      .slice(0, 5)
      .map((item) => {
        const dateText = item.date || "Date not added";
        const fileText = item.fileRef ? ` | ${item.fileRef}` : "";
        const noteText = item.note ? ` | ${item.note}` : "";
        return `- ${dateText}: ${item.room}${fileText}${noteText}`;
      });
  
    const evidenceText = evidenceItems.length
      ? evidenceItems.join("\n")
      : "- No evidence items listed yet.";
  
    return `Subject: Request for security deposit return
  
  ${data.landlordName || "Landlord / Property Manager"},
  
  I am writing regarding the security deposit for ${
      data.propertyAddress || "the rental property"
    }. I moved out on ${
      data.moveOutDate || "[move-out date]"
    } and I am requesting the prompt return of my deposit, or a clear itemized explanation for any deductions.
  
  Deposit amount: $${deposit.toLocaleString()}
  Claimed / disputed deductions currently tracked: $${totalClaimed.toLocaleString()}
  Estimated amount in dispute or expected return: $${estimatedReturn.toLocaleString()}
  
  Items I am currently questioning:
  ${disputedText}
  
  Evidence I have documented:
  ${evidenceText}
  
  Please send the deposit return and/or itemized deduction statement to ${
      data.email || "[your email]"
    }. If additional information is needed, I can provide supporting photos, videos, and written records.
  
  Thank you,
  ${data.tenantName || "Your name"}`;
  }, [data, deposit, totalClaimed, estimatedReturn]);

  const copyDemandLetter = async () => {
    try {
      await navigator.clipboard.writeText(demandLetter);
      setCopyMessage("Demand letter copied.");
    } catch {
      setCopyMessage("Copy failed. Try selecting the text manually.");
    }
  };

  const tabs = [
    ["planner", "Planner"],
    ["evidence", "Evidence Log"],
    ["deductions", "Deductions"],
    ["comms", "Comms Log"],
    ["letter", "Demand Letter"],
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f8fafc",
      color: "#0f172a",
      fontFamily: "Inter, Arial, sans-serif",
      padding: "24px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: "1240px",
      margin: "0 auto",
    },
    heroGrid: {
      display: "grid",
      gridTemplateColumns: "1.45fr 0.9fr",
      gap: "16px",
      marginBottom: "16px",
    },
    panel: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "22px",
      padding: "16px",
      boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
    },
    hero: {
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      color: "white",
      borderRadius: "28px",
      padding: "24px",
      boxShadow: "0 10px 25px rgba(15,23,42,0.16)",
    },
    badge: {
      display: "inline-block",
      background: "rgba(255,255,255,0.12)",
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      marginBottom: "12px",
    },
    h1: {
      fontSize: "42px",
      margin: "0 0 10px",
      lineHeight: 1.08,
    },
    mutedHero: {
      color: "#d7e0ee",
      fontSize: "16px",
      lineHeight: 1.65,
      maxWidth: "720px",
      marginBottom: "14px",
    },
    chipRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "14px",
    },
    chip: {
      background: "rgba(255,255,255,0.12)",
      borderRadius: "999px",
      padding: "7px 12px",
      fontSize: "12px",
      fontWeight: 600,
    },
    heroActions: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "12px",
    },
    quickGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginTop: "12px",
    },
    statBox: {
      borderRadius: "16px",
      padding: "14px",
      background: "#f1f5f9",
    },
    statLabel: {
      fontSize: "12px",
      color: "#64748b",
    },
    statValue: {
      marginTop: "6px",
      fontSize: "28px",
      fontWeight: 800,
    },
    scoreCard: {
      borderRadius: "16px",
      padding: "14px",
      background: "#fff7ed",
      marginTop: "12px",
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "1.2fr 0.78fr",
      gap: "16px",
    },
    tabRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "16px",
    },
    tabActive: {
      background: "#0f172a",
      color: "white",
      border: "none",
      borderRadius: "999px",
      padding: "10px 16px",
      fontWeight: 700,
      cursor: "pointer",
    },
    tabIdle: {
      background: "#e2e8f0",
      color: "#334155",
      border: "none",
      borderRadius: "999px",
      padding: "10px 16px",
      fontWeight: 700,
      cursor: "pointer",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "14px",
      marginBottom: "14px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 700,
      marginBottom: "6px",
      color: "#334155",
    },
    input: {
      width: "100%",
      padding: "11px 12px",
      borderRadius: "12px",
      border: "1px solid #cbd5e1",
      boxSizing: "border-box",
      fontSize: "14px",
      background: "white",
    },
    textarea: {
      width: "100%",
      minHeight: "100px",
      padding: "11px 12px",
      borderRadius: "12px",
      border: "1px solid #cbd5e1",
      boxSizing: "border-box",
      fontSize: "14px",
      background: "white",
      resize: "vertical",
    },
    timelineWrap: {
      background: "#f1f5f9",
      borderRadius: "16px",
      padding: "14px",
      marginTop: "8px",
    },
    timelineCard: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      padding: "12px",
      marginTop: "10px",
    },
    rowCard: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1.2fr",
      gap: "10px",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "12px",
      marginBottom: "10px",
      background: "white",
    },
    btn: {
      border: "1px solid #cbd5e1",
      background: "white",
      color: "#0f172a",
      borderRadius: "12px",
      padding: "10px 14px",
      fontWeight: 700,
      cursor: "pointer",
    },
    primaryBtn: {
      border: "none",
      background: "#0f172a",
      color: "white",
      borderRadius: "12px",
      padding: "10px 14px",
      fontWeight: 700,
      cursor: "pointer",
    },
    accentBtn: {
      border: "none",
      background: "#2563eb",
      color: "white",
      borderRadius: "12px",
      padding: "10px 14px",
      fontWeight: 700,
      cursor: "pointer",
    },
    sideTitle: {
      fontSize: "13px",
      fontWeight: 800,
      color: "#64748b",
      marginBottom: "10px",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    list: {
      margin: 0,
      paddingLeft: "18px",
      lineHeight: 1.75,
      color: "#334155",
      fontSize: "14px",
    },
    box: {
      borderRadius: "14px",
      padding: "12px",
      background: "#f1f5f9",
      marginBottom: "10px",
      fontSize: "14px",
      lineHeight: 1.6,
    },
    toolbar: {
      marginTop: "14px",
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    },
    letterBox: {
      width: "100%",
      minHeight: "360px",
      padding: "14px",
      borderRadius: "16px",
      border: "1px solid #cbd5e1",
      background: "#fff",
      boxSizing: "border-box",
      whiteSpace: "pre-wrap",
      lineHeight: 1.65,
      fontSize: "14px",
    },
    copyNote: {
      fontSize: "13px",
      color: "#0f766e",
      fontWeight: 700,
      marginTop: "8px",
    },
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 960;
  if (isMobile) {
    styles.heroGrid.gridTemplateColumns = "1fr";
    styles.mainGrid.gridTemplateColumns = "1fr";
    styles.formGrid.gridTemplateColumns = "1fr";
    styles.rowCard.gridTemplateColumns = "1fr";
    styles.h1.fontSize = "32px";
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.heroGrid}>
          <div style={styles.hero}>
            <div style={styles.badge}>Local-first MVP</div>
            <h1 style={styles.h1}>Deposit Defender</h1>
            <div style={styles.mutedHero}>
              Protect your security deposit with one simple tracker for move-out dates, evidence, deductions, and landlord communication.
            </div>
            <div style={styles.chipRow}>
              <span style={styles.chip}>Timeline generator</span>
              <span style={styles.chip}>Evidence log</span>
              <span style={styles.chip}>Deduction estimator</span>
              <span style={styles.chip}>Communication record</span>
              <span style={styles.chip}>Demand letter draft</span>
            </div>
            <div style={styles.heroActions}>
              <button style={styles.accentBtn} onClick={loadSampleData}>Try sample data</button>
              <button style={styles.btn} onClick={() => setTab("letter")}>Open demand letter</button>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.sideTitle}>Quick stats</div>
            <div style={styles.quickGrid}>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Deposit</div>
                <div style={styles.statValue}>${deposit.toLocaleString()}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Claimed</div>
                <div style={styles.statValue}>${totalClaimed.toLocaleString()}</div>
              </div>
              <div style={{ ...styles.statBox, background: "#ecfdf5" }}>
                <div style={{ ...styles.statLabel, color: "#047857" }}>Estimated return</div>
                <div style={{ ...styles.statValue, color: "#047857" }}>${estimatedReturn.toLocaleString()}</div>
              </div>
              <div style={{ ...styles.statBox, background: "#eff6ff" }}>
                <div style={{ ...styles.statLabel, color: "#0369a1" }}>Evidence items</div>
                <div style={{ ...styles.statValue, color: "#0369a1" }}>{data.evidence.length}</div>
              </div>
            </div>
            <div style={styles.scoreCard}>
              <div style={{ ...styles.statLabel, color: "#9a3412" }}>Evidence strength</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "6px" }}>
                <div style={{ fontSize: "30px", fontWeight: 800, color: "#9a3412" }}>{evidenceStrength}</div>
                <div style={{ fontWeight: 700, color: "#9a3412" }}>{evidenceLabel}</div>
              </div>
            </div>
            <div style={styles.toolbar}>
              <button style={styles.btn} onClick={downloadJson}>Export JSON</button>
              <button style={styles.btn} onClick={() => window.print()}>Print</button>
              <button style={styles.btn} onClick={resetAll}>Reset</button>
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.panel}>
            <div style={styles.tabRow}>
              {tabs.map(([key, name]) => (
                <button
                  key={key}
                  style={tab === key ? styles.tabActive : styles.tabIdle}
                  onClick={() => setTab(key)}
                >
                  {name}
                </button>
              ))}
            </div>

            {tab === "planner" && (
              <div>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Tenant name</label>
                    <input style={styles.input} value={data.tenantName} onChange={(e) => updateField("tenantName", e.target.value)} />
                  </div>
                  <div>
                    <label style={styles.label}>Landlord / manager</label>
                    <input style={styles.input} value={data.landlordName} onChange={(e) => updateField("landlordName", e.target.value)} />
                  </div>
                  <div>
                    <label style={styles.label}>Property address</label>
                    <input style={styles.input} value={data.propertyAddress} onChange={(e) => updateField("propertyAddress", e.target.value)} />
                  </div>
                  <div>
                    <label style={styles.label}>Move-out date</label>
                    <input type="date" style={styles.input} value={data.moveOutDate} onChange={(e) => updateField("moveOutDate", e.target.value)} />
                  </div>
                  <div>
                    <label style={styles.label}>Deposit amount ($)</label>
                    <input type="number" style={styles.input} value={data.depositAmount} onChange={(e) => updateField("depositAmount", e.target.value)} />
                  </div>
                  <div>
                    <label style={styles.label}>Email</label>
                    <input style={styles.input} value={data.email} onChange={(e) => updateField("email", e.target.value)} />
                  </div>
                  <div>
                    <label style={styles.label}>State</label>
                    <input style={styles.input} value={data.stateName} onChange={(e) => updateField("stateName", e.target.value)} placeholder="Example: California" />
                  </div>
                </div>

                <div>
                  <label style={styles.label}>Notes</label>
                  <textarea style={styles.textarea} value={data.notes} onChange={(e) => updateField("notes", e.target.value)} />
                </div>

                <div style={styles.timelineWrap}>
                  <div style={{ fontSize: "14px", fontWeight: 800, marginBottom: "6px" }}>Auto-generated timeline</div>
                  {!timeline.length ? (
                    <div style={{ color: "#64748b", fontSize: "14px" }}>Pick a move-out date to generate your timeline.</div>
                  ) : (
                    timeline.map((item) => (
                      <div key={item.id} style={styles.timelineCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                          <div style={{ fontWeight: 800 }}>{item.title}</div>
                          <div style={{ background: "#f1f5f9", borderRadius: "999px", padding: "4px 10px", fontSize: "12px", fontWeight: 800 }}>{item.date}</div>
                        </div>
                        <div style={{ marginTop: "6px", color: "#475569", fontSize: "14px" }}>{item.detail}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "evidence" && (
              <div>
                {data.evidence.map((item) => (
                  <div key={item.id} style={styles.rowCard}>
                    <input type="date" style={styles.input} value={item.date} onChange={(e) => updateListItem("evidence", item.id, "date", e.target.value)} />
                    <input style={styles.input} placeholder="Room / area" value={item.room} onChange={(e) => updateListItem("evidence", item.id, "room", e.target.value)} />
                    <input style={styles.input} placeholder="Photo/video file name" value={item.fileRef} onChange={(e) => updateListItem("evidence", item.id, "fileRef", e.target.value)} />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input style={styles.input} placeholder="Short note" value={item.note} onChange={(e) => updateListItem("evidence", item.id, "note", e.target.value)} />
                      <button style={styles.btn} onClick={() => removeListItem("evidence", item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
                <button style={styles.primaryBtn} onClick={() => addListItem("evidence", { date: "", room: "Bedroom", fileRef: "", note: "" })}>Add evidence item</button>
              </div>
            )}

            {tab === "deductions" && (
              <div>
                {data.issues.map((item) => (
                  <div key={item.id} style={styles.rowCard}>
                    <input style={styles.input} placeholder="Area" value={item.area} onChange={(e) => updateListItem("issues", item.id, "area", e.target.value)} />
                    <input type="number" style={styles.input} placeholder="Claimed amount" value={item.amount} onChange={(e) => updateListItem("issues", item.id, "amount", e.target.value)} />
                    <select style={styles.input} value={item.status} onChange={(e) => updateListItem("issues", item.id, "status", e.target.value)}>
                      <option>Review</option>
                      <option>Accepted</option>
                      <option>Disputed</option>
                      <option>Resolved</option>
                    </select>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input style={styles.input} placeholder="Note" value={item.note} onChange={(e) => updateListItem("issues", item.id, "note", e.target.value)} />
                      <button style={styles.btn} onClick={() => removeListItem("issues", item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
                <button style={styles.primaryBtn} onClick={() => addListItem("issues", { area: "Bathroom", amount: "", status: "Review", note: "" })}>Add deduction item</button>
              </div>
            )}

            {tab === "comms" && (
              <div>
                {data.communications.map((item) => (
                  <div key={item.id} style={styles.rowCard}>
                    <input type="date" style={styles.input} value={item.date} onChange={(e) => updateListItem("communications", item.id, "date", e.target.value)} />
                    <select style={styles.input} value={item.channel} onChange={(e) => updateListItem("communications", item.id, "channel", e.target.value)}>
                      <option>Email</option>
                      <option>Phone</option>
                      <option>Text</option>
                      <option>In person</option>
                    </select>
                    <input style={styles.input} placeholder="Subject" value={item.subject} onChange={(e) => updateListItem("communications", item.id, "subject", e.target.value)} />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input style={styles.input} placeholder="Summary" value={item.summary} onChange={(e) => updateListItem("communications", item.id, "summary", e.target.value)} />
                      <button style={styles.btn} onClick={() => removeListItem("communications", item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
                <button style={styles.primaryBtn} onClick={() => addListItem("communications", { date: "", channel: "Email", subject: "Follow-up", summary: "" })}>Add communication</button>
              </div>
            )}

            {tab === "letter" && (
              <div>
                <div style={{ marginBottom: "12px", color: "#475569", fontSize: "14px", lineHeight: 1.7 }}>
                  This draft turns your current tracker data into a simple deposit return request you can edit, copy, and send.
                </div>
                <textarea style={styles.letterBox} value={demandLetter} readOnly />
                <div style={styles.toolbar}>
                  <button style={styles.accentBtn} onClick={copyDemandLetter}>Copy demand letter</button>
                  <button style={styles.btn} onClick={() => window.print()}>Print draft</button>
                </div>
                {copyMessage ? <div style={styles.copyNote}>{copyMessage}</div> : null}
              </div>
            )}
          </div>

          <div>
            <div style={styles.panel}>
              <div style={styles.sideTitle}>Why renters would use this</div>
              <ul style={styles.list}>
                <li>Tracks the four things that actually matter in deposit disputes: dates, proof, deductions, and contact history.</li>
                <li>Everything saves locally, so it works fast without sign-up friction.</li>
                <li>Easy to expand into PDF export, state-specific guidance, and premium claim templates later.</li>
              </ul>
            </div>

            <div style={{ ...styles.panel, marginTop: "16px" }}>
              <div style={styles.sideTitle}>Simple pricing path</div>
              <div style={styles.box}><strong>Free:</strong> planner, evidence log, and deduction tracker</div>
              <div style={styles.box}><strong>$9 one-time:</strong> PDF export and dispute-ready templates</div>
              <div style={styles.box}><strong>$19 bundle:</strong> move-out pack, roommate split, and budget tools</div>
            </div>

            <div style={{ ...styles.panel, marginTop: "16px" }}>
              <div style={styles.sideTitle}>Best next steps</div>
              <ol style={styles.list}>
                <li>Keep the free tool simple and fast</li>
                <li>Publish and test search demand</li>
                <li>Add PDF export and premium upsell</li>
                <li>Expand into a full renter toolkit</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
