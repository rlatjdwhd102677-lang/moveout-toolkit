import { useEffect, useMemo, useState } from "react";

export default function App() {
  const STORAGE_KEY = "deposit-defender-v6";

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
      const date = new Date(move);
      if (typeof task.daysBefore === "number") date.setDate(date.getDate() - task.daysBefore);
      if (typeof task.daysAfter === "number") date.setDate(date.getDate() + task.daysAfter);
      return { ...task, id: idx + 1, date: date.toISOString().slice(0, 10) };
    });
  }, [data.moveOutDate]);

  const totalClaimed = data.issues.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const deposit = parseFloat(data.depositAmount) || 0;
  const estimatedReturn = Math.max(deposit - totalClaimed, 0);
  const evidenceCount = data.evidence.filter((x) => x.fileRef || x.note).length;
  const commsCount = data.communications.filter((x) => x.subject || x.summary).length;

  const evidenceStrength = useMemo(() => {
    let score = 0;
    if (evidenceCount >= 3) score += 35;
    if (commsCount >= 2) score += 25;
    if (data.issues.some((x) => x.status === "Disputed")) score += 15;
    if (data.moveOutDate) score += 10;
    if (data.tenantName && data.landlordName && data.propertyAddress) score += 15;
    return Math.min(score, 100);
  }, [data, evidenceCount, commsCount]);

  const evidenceLabel = evidenceStrength >= 75 ? "Strong" : evidenceStrength >= 45 ? "Medium" : "Weak";
  const depositRiskPercent = deposit > 0 ? Math.min(100, Math.round((totalClaimed / deposit) * 100)) : 0;

  const daysSinceMoveOut = useMemo(() => {
    if (!data.moveOutDate) return null;
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const move = new Date(data.moveOutDate);
    const moveOnly = new Date(move.getFullYear(), move.getMonth(), move.getDate());
    const ms = todayOnly.getTime() - moveOnly.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }, [data.moveOutDate]);

  const overdueStatus = useMemo(() => {
    if (!data.moveOutDate) {
      return {
        label: "No date yet",
        tone: "neutral",
        message: "Add your move-out date to track follow-up timing and possible delay risk.",
      };
    }

    if (daysSinceMoveOut < 0) {
      return {
        label: "Upcoming",
        tone: "neutral",
        message: `Move-out is ${Math.abs(daysSinceMoveOut)} day(s) away. Keep collecting evidence before handoff.`,
      };
    }

    if (daysSinceMoveOut <= 21) {
      return {
        label: "On track",
        tone: "good",
        message: `${daysSinceMoveOut} day(s) since move-out. This is the normal window to monitor updates and keep records organized.`,
      };
    }

    if (daysSinceMoveOut <= 30) {
      return {
        label: "Follow up now",
        tone: "warn",
        message: `${daysSinceMoveOut} day(s) since move-out. If you still have no clear update, a follow-up message is probably due now.`,
      };
    }

    return {
      label: "Potentially overdue",
      tone: "risk",
      message: `${daysSinceMoveOut} day(s) since move-out. You may need to send a stronger follow-up and prepare a demand letter.`,
    };
  }, [data.moveOutDate, daysSinceMoveOut]);

  const disputeChecklist = [
    data.moveOutDate ? "Move-out date added" : "Add your move-out date",
    evidenceCount >= 3 ? "Evidence log is building well" : "Add at least 3 evidence entries",
    commsCount >= 2 ? "Communication history logged" : "Log at least 2 landlord contacts",
    data.issues.some((x) => x.status === "Disputed") ? "Disputed deduction identified" : "Mark any questionable deduction as Disputed",
    data.stateName ? `State entered: ${data.stateName}` : "Add your state for later legal guidance",
  ];

  const stateGuidance = useMemo(() => {
    if (!data.stateName) {
      return [
        "Add your state so this case can later show state-specific reminders.",
        "Rules often vary on timing, itemized deductions, and delivery method.",
        "For now, keep every message, photo, and receipt in one place.",
      ];
    }

    return [
      `State entered: ${data.stateName}. Treat this as an organizational reminder, not legal advice.`,
      "Check your state's deadline expectations for deposit return and itemized deductions.",
      "Confirm whether written notice, mailing address, or certified delivery matters in your area.",
    ];
  }, [data.stateName]);

  const summaryHighlights = [
    `Deposit: $${deposit.toLocaleString()}`,
    `Claimed: $${totalClaimed.toLocaleString()}`,
    `Estimated return: $${estimatedReturn.toLocaleString()}`,
    `Evidence score: ${evidenceStrength} (${evidenceLabel})`,
  ];

  const recommendedNextStep = useMemo(() => {
    if (!data.moveOutDate) return "Add your move-out date first so the tool can calculate timing and follow-up urgency.";
    if (evidenceCount < 3) return "Add more photos, videos, or file references before relying on your case summary.";
    if (daysSinceMoveOut !== null && daysSinceMoveOut > 21 && commsCount < 2) return "Log a follow-up communication now so you have a clearer record if the deposit stays delayed.";
    if (data.issues.some((x) => x.status === "Disputed")) return "Your next best move is to review the demand letter and export a clean case summary.";
    return "You are in decent shape. Keep logging updates and export a summary if you need to escalate.";
  }, [data.moveOutDate, evidenceCount, daysSinceMoveOut, commsCount, data.issues]);

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
    const NL = String.fromCharCode(10);

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
          .join(NL)
      : "- No disputed deductions entered yet.";

    const evidenceLines = data.evidence
      .filter((item) => item.fileRef || item.note)
      .slice(0, 5)
      .map((item) => {
        const dateText = item.date || "Date not added";
        const fileText = item.fileRef ? ` | ${item.fileRef}` : "";
        const noteText = item.note ? ` | ${item.note}` : "";
        return `- ${dateText}: ${item.room}${fileText}${noteText}`;
      });

    const evidenceText = evidenceLines.length
      ? evidenceLines.join(NL)
      : "- No evidence items listed yet.";

    const parts = [
      "Subject: Request for security deposit return",
      "",
      `${data.landlordName || "Landlord / Property Manager"},`,
      "",
      `I am writing regarding the security deposit for ${data.propertyAddress || "the rental property"}. I moved out on ${data.moveOutDate || "[move-out date]"} and I am requesting the prompt return of my deposit, or a clear itemized explanation for any deductions.`,
      "",
      `Deposit amount: $${deposit.toLocaleString()}`,
      `Claimed / disputed deductions currently tracked: $${totalClaimed.toLocaleString()}`,
      `Estimated amount in dispute or expected return: $${estimatedReturn.toLocaleString()}`,
      "",
      "Items I am currently questioning:",
      disputedText,
      "",
      "Evidence I have documented:",
      evidenceText,
      "",
      `Please send the deposit return and/or itemized deduction statement to ${data.email || "[your email]"}. If additional information is needed, I can provide supporting photos, videos, and written records.`,
      "",
      "Thank you,",
      data.tenantName || "Your name",
    ];

    return parts.join(NL);
  }, [data, deposit, totalClaimed, estimatedReturn]);

  const buildCaseSummary = () => {
    const NL = String.fromCharCode(10);

    const issueLines = data.issues.length
      ? data.issues.map(
          (item) =>
            `- ${item.area} | $${item.amount || 0} | ${item.status}${item.note ? ` | ${item.note}` : ""}`
        )
      : ["- None"];

    const evidenceLines = data.evidence.length
      ? data.evidence.map(
          (item) =>
            `- ${item.date || "No date"} | ${item.room}${item.fileRef ? ` | ${item.fileRef}` : ""}${item.note ? ` | ${item.note}` : ""}`
        )
      : ["- None"];

    const communicationLines = data.communications.length
      ? data.communications.map(
          (item) =>
            `- ${item.date || "No date"} | ${item.channel} | ${item.subject || "No subject"}${item.summary ? ` | ${item.summary}` : ""}`
        )
      : ["- None"];

    const lines = [
      "Deposit Defender — Case Summary",
      "",
      `Tenant: ${data.tenantName || "Not added"}`,
      `Property: ${data.propertyAddress || "Not added"}`,
      `Landlord / manager: ${data.landlordName || "Not added"}`,
      `Move-out date: ${data.moveOutDate || "Not added"}`,
      `State: ${data.stateName || "Not added"}`,
      `Deposit amount: $${deposit.toLocaleString()}`,
      `Claimed deductions tracked: $${totalClaimed.toLocaleString()}`,
      `Estimated return: $${estimatedReturn.toLocaleString()}`,
      `Evidence strength: ${evidenceStrength} (${evidenceLabel})`,
      `Timing status: ${overdueStatus.label}`,
      "",
      "Disputed / review deductions:",
      ...issueLines,
      "",
      "Evidence log:",
      ...evidenceLines,
      "",
      "Communication log:",
      ...communicationLines,
      "",
      "Notes:",
      data.notes || "None",
      "",
      "Generated demand letter:",
      demandLetter,
    ];

    return lines.join(NL);
  };

  const exportPdfSummary = () => {
    const htmlSummary = buildCaseSummary()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .split(String.fromCharCode(10))
      .join("<br>");

    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Deposit Defender Case Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111827; line-height: 1.55; }
            h1 { font-size: 24px; margin-bottom: 16px; }
            .meta { margin-bottom: 20px; color: #4b5563; }
            .box { border: 1px solid #d1d5db; border-radius: 12px; padding: 18px; background: #fff; }
            @media print { body { padding: 18px; } }
          </style>
        </head>
        <body>
          <h1>Deposit Defender Case Summary</h1>
          <div class="meta">Use your browser's Save as PDF option in the print dialog.</div>
          <div class="box">${htmlSummary}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

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
      background: "linear-gradient(180deg, #eef4fb 0%, #f7fafc 100%)",
      color: "#0f172a",
      fontFamily: "Inter, Arial, sans-serif",
      padding: "28px",
      boxSizing: "border-box",
    },
    shell: {
      maxWidth: "1280px",
      margin: "0 auto",
    },
    heroGrid: {
      display: "grid",
      gridTemplateColumns: "1.5fr 0.92fr",
      gap: "18px",
      marginBottom: "18px",
    },
    panel: {
      background: "rgba(255,255,255,0.92)",
      border: "1px solid #dde6f1",
      borderRadius: "26px",
      padding: "18px",
      boxShadow: "0 14px 36px rgba(15,23,42,0.08)",
      backdropFilter: "blur(6px)",
    },
    hero: {
      background: "linear-gradient(135deg, #0f172a 0%, #172554 45%, #1e293b 100%)",
      color: "white",
      borderRadius: "30px",
      padding: "28px",
      boxShadow: "0 18px 45px rgba(15,23,42,0.22)",
    },
    badge: {
      display: "inline-block",
      background: "rgba(255,255,255,0.14)",
      padding: "7px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 800,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      marginBottom: "14px",
    },
    h1: {
      fontSize: "50px",
      lineHeight: 1.02,
      margin: "0 0 12px",
      letterSpacing: "-0.03em",
    },
    mutedHero: {
      color: "#dbe7ff",
      fontSize: "16px",
      lineHeight: 1.75,
      maxWidth: "760px",
      marginBottom: "16px",
    },
    chipRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "18px",
    },
    chip: {
      background: "rgba(255,255,255,0.12)",
      borderRadius: "999px",
      padding: "8px 12px",
      fontSize: "12px",
      fontWeight: 700,
      border: "1px solid rgba(255,255,255,0.08)",
    },
    heroActions: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "10px",
    },
    quickGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginTop: "12px",
    },
    statBox: {
      borderRadius: "18px",
      padding: "16px",
      background: "#f3f7fb",
      border: "1px solid #e5edf6",
    },
    statLabel: {
      fontSize: "12px",
      color: "#64748b",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    statValue: {
      marginTop: "8px",
      fontSize: "30px",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    scoreCard: {
      borderRadius: "18px",
      padding: "16px",
      background: "#fff7ed",
      marginTop: "12px",
      border: "1px solid #fed7aa",
    },
    warningCard: {
      borderRadius: "18px",
      padding: "16px",
      marginTop: "12px",
      border: "1px solid transparent",
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "1.2fr 0.8fr",
      gap: "18px",
    },
    tabRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "18px",
    },
    tabActive: {
      background: "#0f172a",
      color: "white",
      border: "none",
      borderRadius: "999px",
      padding: "10px 16px",
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 8px 18px rgba(15,23,42,0.18)",
    },
    tabIdle: {
      background: "#e9eff6",
      color: "#334155",
      border: "1px solid #d8e2ef",
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
      fontWeight: 800,
      marginBottom: "7px",
      color: "#334155",
    },
    input: {
      width: "100%",
      padding: "12px 13px",
      borderRadius: "14px",
      border: "1px solid #d3ddea",
      boxSizing: "border-box",
      fontSize: "14px",
      background: "white",
      outline: "none",
    },
    textarea: {
      width: "100%",
      minHeight: "110px",
      padding: "12px 13px",
      borderRadius: "16px",
      border: "1px solid #d3ddea",
      boxSizing: "border-box",
      fontSize: "14px",
      background: "white",
      resize: "vertical",
      outline: "none",
    },
    timelineWrap: {
      background: "#f4f7fb",
      borderRadius: "18px",
      padding: "16px",
      marginTop: "10px",
      border: "1px solid #e2e8f0",
    },
    timelineCard: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "14px",
      marginTop: "10px",
      boxShadow: "0 5px 14px rgba(15,23,42,0.04)",
    },
    rowCard: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1.2fr",
      gap: "10px",
      border: "1px solid #e2e8f0",
      borderRadius: "18px",
      padding: "12px",
      marginBottom: "10px",
      background: "white",
      boxShadow: "0 5px 14px rgba(15,23,42,0.04)",
    },
    btn: {
      border: "1px solid #cfd9e7",
      background: "white",
      color: "#0f172a",
      borderRadius: "14px",
      padding: "10px 14px",
      fontWeight: 800,
      cursor: "pointer",
    },
    primaryBtn: {
      border: "none",
      background: "#0f172a",
      color: "white",
      borderRadius: "14px",
      padding: "11px 15px",
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 10px 18px rgba(15,23,42,0.12)",
    },
    accentBtn: {
      border: "none",
      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      color: "white",
      borderRadius: "14px",
      padding: "11px 15px",
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 10px 20px rgba(37,99,235,0.2)",
    },
    sideTitle: {
      fontSize: "12px",
      fontWeight: 800,
      color: "#64748b",
      marginBottom: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    list: {
      margin: 0,
      paddingLeft: "18px",
      lineHeight: 1.8,
      color: "#334155",
      fontSize: "14px",
    },
    box: {
      borderRadius: "16px",
      padding: "14px",
      background: "#f4f7fb",
      marginBottom: "10px",
      fontSize: "14px",
      lineHeight: 1.65,
      border: "1px solid #e2e8f0",
    },
    pricingGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "12px",
    },
    pricingCard: {
      borderRadius: "20px",
      padding: "16px",
      border: "1px solid #dde6f2",
      background: "#ffffff",
      boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
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
      borderRadius: "18px",
      border: "1px solid #d3ddea",
      background: "#fff",
      boxSizing: "border-box",
      whiteSpace: "pre-wrap",
      lineHeight: 1.7,
      fontSize: "14px",
    },
    copyNote: {
      fontSize: "13px",
      color: "#0f766e",
      fontWeight: 700,
      marginTop: "8px",
    },
  };

  const warningStyle =
    overdueStatus.tone === "risk"
      ? { ...styles.warningCard, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }
      : overdueStatus.tone === "warn"
      ? { ...styles.warningCard, background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa" }
      : overdueStatus.tone === "good"
      ? { ...styles.warningCard, background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }
      : { ...styles.warningCard, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 960;
  if (isMobile) {
    styles.heroGrid.gridTemplateColumns = "1fr";
    styles.mainGrid.gridTemplateColumns = "1fr";
    styles.formGrid.gridTemplateColumns = "1fr";
    styles.rowCard.gridTemplateColumns = "1fr";
    styles.h1.fontSize = "34px";
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.heroGrid}>
          <div style={styles.hero}>
            <div style={styles.badge}>Local-first MVP</div>
            <h1 style={styles.h1}>Get your deposit back with a cleaner case file.</h1>
            <div style={styles.mutedHero}>
              Deposit Defender helps renters turn messy move-out details into a tighter case with proof, timing, communication history, and exportable summaries.
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
              <button style={styles.btn} onClick={exportPdfSummary}>Export PDF</button>
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
              <div style={{ ...styles.statBox, background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                <div style={{ ...styles.statLabel, color: "#047857" }}>Estimated return</div>
                <div style={{ ...styles.statValue, color: "#047857" }}>${estimatedReturn.toLocaleString()}</div>
              </div>
              <div style={{ ...styles.statBox, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
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
              <div style={{ marginTop: "10px", fontSize: "12px", color: "#9a3412" }}>
                Claimed vs deposit risk: {depositRiskPercent}%
              </div>
            </div>
            <div style={warningStyle}>
              <div style={{ fontSize: "12px", fontWeight: 800, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Timing status
              </div>
              <div style={{ marginTop: "6px", fontSize: "22px", fontWeight: 800 }}>{overdueStatus.label}</div>
              <div style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.55 }}>{overdueStatus.message}</div>
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

                <div style={{ ...styles.box, marginTop: "14px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <strong>Recommended next step:</strong> {recommendedNextStep}
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
              <div style={styles.sideTitle}>Dispute readiness checklist</div>
              <ul style={styles.list}>
                {disputeChecklist.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ ...styles.panel, marginTop: "16px" }}>
              <div style={styles.sideTitle}>State guidance reminder</div>
              <ul style={styles.list}>
                {stateGuidance.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ ...styles.panel, marginTop: "16px" }}>
              <div style={styles.sideTitle}>Case snapshot</div>
              <ul style={styles.list}>
                {summaryHighlights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ ...styles.panel, marginTop: "16px" }}>
              <div style={styles.sideTitle}>Upgrade path</div>
              <div style={styles.pricingGrid}>
                <div style={styles.pricingCard}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Free</div>
                  <div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 800 }}>Track your case</div>
                  <div style={{ marginTop: "8px", fontSize: "14px", color: "#475569", lineHeight: 1.7 }}>Planner, evidence log, deductions, communication history, and draft letter.</div>
                </div>
                <div style={{ ...styles.pricingCard, border: "1px solid #93c5fd", background: "#eff6ff" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase" }}>Pro · $9</div>
                  <div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 800 }}>Send-ready output</div>
                  <div style={{ marginTop: "8px", fontSize: "14px", color: "#1e3a8a", lineHeight: 1.7 }}>Polished PDF export, cleaner demand letter formatting, and stronger dispute templates.</div>
                </div>
                <div style={styles.pricingCard}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Bundle · $19</div>
                  <div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 800 }}>Full renter toolkit</div>
                  <div style={{ marginTop: "8px", fontSize: "14px", color: "#475569", lineHeight: 1.7 }}>Move-out pack, roommate split tools, budget planner, and printable case pack.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}