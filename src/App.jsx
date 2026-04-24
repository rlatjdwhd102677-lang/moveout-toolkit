import { useEffect, useMemo, useState } from "react";

export default function App() {
  const STORAGE_KEY = "deposit-defender-v11";

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

  const PLAN_ORDER = { free: 0, pro: 1, bundle: 2 };

  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultState;
    } catch {
      return defaultState;
    }
  });

  const [tab, setTab] = useState("evidence");
  const [copyMessage, setCopyMessage] = useState("");
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!copyMessage) return undefined;
    const timer = setTimeout(() => setCopyMessage(""), 1800);
    return () => clearTimeout(timer);
  }, [copyMessage]);

  const isPlanAtLeast = (target) => PLAN_ORDER[plan] >= PLAN_ORDER[target];

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
      setTab("evidence");
      setPlan("free");
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
      notes:
        "Landlord mentioned carpet cleaning and wall patching charges, but the apartment was returned in normal condition. I have move-in photos, move-out photos, and a written follow-up.",
      issues: [
        {
          id: 1,
          area: "Carpet cleaning",
          amount: "250",
          status: "Disputed",
          note: "Normal wear and no major stains in final photos.",
        },
        {
          id: 2,
          area: "Wall patching",
          amount: "175",
          status: "Review",
          note: "Small nail holes only.",
        },
      ],
      communications: [
        {
          id: 1,
          date: "2026-08-01",
          channel: "Email",
          subject: "Move-out notice",
          summary: "Gave written 30-day notice and asked about key return.",
        },
        {
          id: 2,
          date: "2026-09-07",
          channel: "Email",
          subject: "Deposit follow-up",
          summary: "Asked for update on deposit and itemized deductions.",
        },
      ],
      evidence: [
        {
          id: 1,
          date: "2026-08-30",
          room: "Living Room",
          fileRef: "living-room-final.jpg",
          note: "Walls and floors clean with no visible damage.",
        },
        {
          id: 2,
          date: "2026-08-30",
          room: "Bedroom",
          fileRef: "bedroom-final.jpg",
          note: "Carpet vacuumed and no visible stains.",
        },
        {
          id: 3,
          date: "2026-08-31",
          room: "Kitchen",
          fileRef: "kitchen-video.mp4",
          note: "Countertops, oven, and sink clean at handoff.",
        },
      ],
    });
    setTab("evidence");
  };

  const deposit = parseFloat(data.depositAmount) || 0;
  const totalClaimed = data.issues.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const estimatedReturn = Math.max(deposit - totalClaimed, 0);
  const evidenceCount = data.evidence.filter((item) => item.fileRef || item.note).length;
  const commsCount = data.communications.filter((item) => item.subject || item.summary).length;
  const disputedCount = data.issues.filter((item) => item.status === "Disputed").length;

  const daysSinceMoveOut = useMemo(() => {
    if (!data.moveOutDate) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const move = new Date(data.moveOutDate);
    const moveDate = new Date(move.getFullYear(), move.getMonth(), move.getDate());
    return Math.floor((today.getTime() - moveDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [data.moveOutDate]);

  const evidenceStrength = useMemo(() => {
    let score = 0;
    if (evidenceCount >= 3) score += 35;
    if (commsCount >= 2) score += 25;
    if (disputedCount >= 1) score += 15;
    if (data.moveOutDate) score += 10;
    if (data.tenantName && data.landlordName && data.propertyAddress) score += 15;
    return Math.min(score, 100);
  }, [
    evidenceCount,
    commsCount,
    disputedCount,
    data.moveOutDate,
    data.tenantName,
    data.landlordName,
    data.propertyAddress,
  ]);

  const evidenceLabel = evidenceStrength >= 75 ? "Strong" : evidenceStrength >= 45 ? "Medium" : "Weak";
  const depositRiskPercent = deposit > 0 ? Math.min(100, Math.round((totalClaimed / deposit) * 100)) : 0;

  const overdueStatus = useMemo(() => {
    if (!data.moveOutDate) {
      return {
        label: "No date yet",
        tone: "neutral",
        message: "Add your move-out date so the tool can tell you whether it is time to follow up.",
      };
    }
    if (daysSinceMoveOut < 0) {
      return {
        label: "Upcoming",
        tone: "neutral",
        message: `Move-out is ${Math.abs(daysSinceMoveOut)} day(s) away. Keep collecting proof before handoff.`,
      };
    }
    if (daysSinceMoveOut <= 21) {
      return {
        label: "On track",
        tone: "good",
        message: `${daysSinceMoveOut} day(s) since move-out. This is the normal window to monitor updates and keep records clean.`,
      };
    }
    if (daysSinceMoveOut <= 30) {
      return {
        label: "Follow up now",
        tone: "warn",
        message: `${daysSinceMoveOut} day(s) since move-out. If you still have no clear update, you should probably follow up now.`,
      };
    }
    return {
      label: "Potentially overdue",
      tone: "risk",
      message: `${daysSinceMoveOut} day(s) since move-out. You may need a stronger follow-up and a dispute-ready summary.`,
    };
  }, [data.moveOutDate, daysSinceMoveOut]);

  const recommendedNextStep = useMemo(() => {
    if (!data.moveOutDate) return "Add your move-out date first so the tool can judge follow-up urgency.";
    if (evidenceCount < 3) return "Add more photos, videos, or file references before relying on your case summary.";
    if (daysSinceMoveOut !== null && daysSinceMoveOut > 21 && commsCount < 2) return "Log a follow-up communication now so your timeline is easier to defend.";
    if (disputedCount > 0) return "Review the demand letter and export a dispute-ready summary next.";
    return "You are in decent shape. Keep tracking updates and export a summary if the delay continues.";
  }, [data.moveOutDate, evidenceCount, daysSinceMoveOut, commsCount, disputedCount]);

  const timeline = useMemo(() => {
    if (!data.moveOutDate) return [];
    const move = new Date(data.moveOutDate);
    const tasks = [
      { daysBefore: 30, title: "Give written notice", detail: "Send written notice and keep a copy." },
      { daysBefore: 14, title: "Start evidence capture", detail: "Take room-by-room photos and short videos." },
      { daysBefore: 7, title: "Confirm handoff plan", detail: "Get key return and forwarding address steps in writing." },
      { daysBefore: 1, title: "Capture final condition", detail: "Take final photos, videos, and meter readings." },
      { daysAfter: 7, title: "Deposit follow-up", detail: "If there is no update, send a short written follow-up." },
      { daysAfter: 14, title: "Prepare demand letter", detail: "If deductions feel inflated or the process is slow, prepare your letter and evidence pack." },
    ];

    return tasks.map((task, index) => {
      const d = new Date(move);
      if (typeof task.daysBefore === "number") d.setDate(d.getDate() - task.daysBefore);
      if (typeof task.daysAfter === "number") d.setDate(d.getDate() + task.daysAfter);
      return { ...task, id: index + 1, date: d.toISOString().slice(0, 10) };
    });
  }, [data.moveOutDate]);

  const stateGuidance = useMemo(() => {
    if (!data.stateName) {
      return [
        "Add your state so this case can later show state-specific reminders.",
        "Rules often vary on timing, itemized deductions, and delivery method.",
        "For now, keep every message, photo, and receipt in one place.",
      ];
    }
    return [
      `State entered: ${data.stateName}. Treat this as a reminder layer, not legal advice.`,
      "Check your state's usual deposit-return timeline and itemized deduction rules.",
      "Confirm whether written notice, mailing address, or certified delivery matters where you are.",
    ];
  }, [data.stateName]);

  const summaryHighlights = [
    `Deposit: $${deposit.toLocaleString()}`,
    `Claimed: $${totalClaimed.toLocaleString()}`,
    `Estimated return: $${estimatedReturn.toLocaleString()}`,
    `Evidence score: ${evidenceStrength} (${evidenceLabel})`,
  ];

  const caseCompletion = useMemo(() => {
    let count = 0;
    if (data.moveOutDate) count += 1;
    if (deposit > 0) count += 1;
    if (evidenceCount >= 3) count += 1;
    if (commsCount >= 2) count += 1;
    if (disputedCount >= 1 || totalClaimed > 0) count += 1;
    return Math.round((count / 5) * 100);
  }, [data.moveOutDate, deposit, evidenceCount, commsCount, disputedCount, totalClaimed]);

  const checklistItems = [
    data.moveOutDate ? "Move-out date added" : "Add your move-out date",
    evidenceCount >= 3 ? "Evidence log is building well" : "Add at least 3 evidence entries",
    commsCount >= 2 ? "Communication history logged" : "Log at least 2 landlord contacts",
    disputedCount >= 1 ? "Disputed deduction identified" : "Mark any questionable deduction as Disputed",
    data.stateName ? `State entered: ${data.stateName}` : "Add your state for later legal guidance",
  ];

  const bundleTools = [
    "Move-out checklist pack",
    "Roommate split worksheet",
    "Budget planner",
    "Printable dispute pack cover sheet",
  ];

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deposit-defender.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatIssueLine = (item) => {
    const notePart = item.note ? ` | ${item.note}` : "";
    return `- ${item.area} | $${item.amount || 0} | ${item.status}${notePart}`;
  };

  const formatEvidenceLine = (item) => {
    const filePart = item.fileRef ? ` | ${item.fileRef}` : "";
    const notePart = item.note ? ` | ${item.note}` : "";
    return `- ${item.date || "No date"} | ${item.room}${filePart}${notePart}`;
  };

  const formatCommunicationLine = (item) => {
    const summaryPart = item.summary ? ` | ${item.summary}` : "";
    return `- ${item.date || "No date"} | ${item.channel} | ${item.subject || "No subject"}${summaryPart}`;
  };

  const demandLetter = useMemo(() => {
    const NL = String.fromCharCode(10);
    const disputedItems = data.issues.filter((item) => item.status === "Disputed" || item.status === "Review");

    const disputedText = disputedItems.length
      ? disputedItems
          .map((item) => {
            const amountText = item.amount ? `: $${item.amount}` : "";
            const noteText = item.note ? ` (${item.note})` : "";
            return `- ${item.area}${amountText}${noteText}`;
          })
          .join(NL)
      : "- No disputed deductions entered yet.";

    const evidenceRows = data.evidence
      .filter((item) => item.fileRef || item.note)
      .slice(0, 5)
      .map((item) => {
        const dateText = item.date || "Date not added";
        const fileText = item.fileRef ? ` | ${item.fileRef}` : "";
        const noteText = item.note ? ` | ${item.note}` : "";
        return `- ${dateText}: ${item.room}${fileText}${noteText}`;
      });

    const evidenceText = evidenceRows.length ? evidenceRows.join(NL) : "- No evidence items listed yet.";

    const introLine = isPlanAtLeast("pro")
      ? `I am writing regarding the security deposit for ${data.propertyAddress || "the rental property"}. I moved out on ${data.moveOutDate || "[move-out date]"} and I request the prompt return of my deposit, or a detailed itemized explanation for any deductions claimed.`
      : `I am writing regarding the security deposit for ${data.propertyAddress || "the rental property"}. I moved out on ${data.moveOutDate || "[move-out date]"} and I am requesting the prompt return of my deposit, or a clear itemized explanation for any deductions.`;

    const parts = [
      "Subject: Request for security deposit return",
      "",
      `${data.landlordName || "Landlord / Property Manager"},`,
      "",
      introLine,
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
  }, [data, deposit, totalClaimed, estimatedReturn, isPlanAtLeast]);

  const buildCaseSummary = () => {
    const NL = String.fromCharCode(10);
    const issueLines = data.issues.length ? data.issues.map(formatIssueLine) : ["- None"];
    const evidenceLines = data.evidence.length ? data.evidence.map(formatEvidenceLine) : ["- None"];
    const communicationLines = data.communications.length ? data.communications.map(formatCommunicationLine) : ["- None"];

    const header = isPlanAtLeast("pro")
      ? "Deposit Defender — Send-Ready Case Summary"
      : "Deposit Defender — Case Summary";

    return [
      header,
      "",
      `Plan: ${plan.toUpperCase()}`,
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
    ].join(NL);
  };

  const exportPdfSummary = () => {
    if (!isPlanAtLeast("pro")) {
      window.alert("Export PDF is available on Pro.");
      return;
    }

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

  const handlePlanClick = (selectedPlan) => {
    setPlan(selectedPlan);
    if (selectedPlan === "free") {
      window.alert("Switched to Free mode.");
      return;
    }
    if (selectedPlan === "pro") {
      window.alert("Pro mode enabled for demo. PDF export is now unlocked.");
      return;
    }
    window.alert("Bundle mode enabled for demo. Bundle-only tools are now unlocked.");
  };

  const tabs = [
    ["evidence", "Evidence Log"],
    ["deductions", "Deductions"],
    ["comms", "Comms Log"],
    ["letter", "Demand Letter"],
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        .dd-page {
          min-height: 100vh;
          padding: 28px;
          background: linear-gradient(180deg, #eef4fb 0%, #f7fafc 100%);
          color: #0f172a;
          font-family: Inter, Arial, sans-serif;
        }
        .dd-shell { max-width: 1280px; margin: 0 auto; }
        .dd-top {
          display: grid;
          grid-template-columns: 1.65fr 0.95fr;
          gap: 18px;
          margin-bottom: 18px;
        }
        .dd-hero {
          background: linear-gradient(135deg, #0f172a 0%, #172554 45%, #1e293b 100%);
          color: white;
          border-radius: 30px;
          padding: 30px;
          box-shadow: 0 18px 45px rgba(15,23,42,0.22);
          min-height: 280px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .dd-badge {
          display: inline-block;
          background: rgba(255,255,255,0.14);
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .dd-plan-chip {
          display: inline-block;
          margin-left: 10px;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .dd-hero h1 {
          font-size: 56px;
          line-height: 0.98;
          margin: 0 0 14px;
          letter-spacing: -0.04em;
          max-width: 700px;
        }
        .dd-hero p {
          color: #dbe7ff;
          font-size: 16px;
          line-height: 1.75;
          margin: 0;
          max-width: 690px;
        }
        .dd-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }
        .dd-right-stack { display: grid; gap: 18px; }
        .dd-panel {
          background: rgba(255,255,255,0.92);
          border: 1px solid #dde6f1;
          border-radius: 24px;
          padding: 18px;
          box-shadow: 0 14px 36px rgba(15,23,42,0.08);
          backdrop-filter: blur(6px);
        }
        .dd-section-title {
          font-size: 12px;
          font-weight: 900;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }
        .dd-card-title {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .dd-body { display: grid; gap: 18px; }
        .dd-main-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 18px;
          align-items: start;
        }
        .dd-left-stack, .dd-right-col { display: grid; gap: 18px; }
        .dd-split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .dd-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .dd-label {
          display: block;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 7px;
          color: #334155;
        }
        .dd-input, .dd-textarea, .dd-select {
          width: 100%;
          padding: 12px 13px;
          border-radius: 14px;
          border: 1px solid #d3ddea;
          font-size: 14px;
          background: white;
          outline: none;
        }
        .dd-textarea {
          min-height: 110px;
          resize: vertical;
        }
        .dd-box {
          border-radius: 16px;
          padding: 14px;
          background: #f4f7fb;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          line-height: 1.65;
        }
        .dd-progress-wrap {
          margin-top: 8px;
          width: 100%;
          height: 10px;
          border-radius: 999px;
          background: #dbeafe;
          overflow: hidden;
        }
        .dd-progress-bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #2563eb, #1d4ed8);
        }
        .dd-timeline {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }
        .dd-timeline-item {
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 5px 14px rgba(15,23,42,0.04);
        }
        .dd-timeline-head {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: center;
          margin-bottom: 6px;
        }
        .dd-date-chip {
          background: #f1f5f9;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 800;
        }
        .dd-actions {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }
        .dd-action-card {
          border-radius: 18px;
          padding: 14px;
          border: 1px solid #dce6f3;
          background: white;
          box-shadow: 0 6px 16px rgba(15,23,42,0.05);
        }
        .dd-action-card strong {
          display: block;
          font-size: 18px;
          margin-bottom: 6px;
        }
        .dd-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }
        .dd-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }
        .dd-tab-active, .dd-tab-idle, .dd-btn, .dd-btn-primary, .dd-btn-accent {
          border-radius: 14px;
          padding: 10px 14px;
          font-weight: 800;
          cursor: pointer;
          font-size: 14px;
        }
        .dd-tab-active {
          background: #0f172a;
          color: white;
          border: none;
        }
        .dd-tab-idle {
          background: #e9eff6;
          color: #334155;
          border: 1px solid #d8e2ef;
        }
        .dd-btn {
          border: 1px solid #cfd9e7;
          background: white;
          color: #0f172a;
        }
        .dd-btn-primary {
          border: none;
          background: #0f172a;
          color: white;
          box-shadow: 0 10px 18px rgba(15,23,42,0.12);
        }
        .dd-btn-accent {
          border: none;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          box-shadow: 0 10px 20px rgba(37,99,235,0.2);
        }
        .dd-btn-locked {
          border: 1px dashed #93c5fd;
          background: #eff6ff;
          color: #1d4ed8;
        }
        .dd-row-card {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1.2fr;
          gap: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 12px;
          margin-bottom: 10px;
          background: white;
          box-shadow: 0 5px 14px rgba(15,23,42,0.04);
        }
        .dd-letter {
          width: 100%;
          min-height: 330px;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid #d3ddea;
          background: #fff;
          white-space: pre-wrap;
          line-height: 1.7;
          font-size: 14px;
        }
        .dd-signal-list {
          margin: 8px 0 0;
          padding-left: 18px;
          line-height: 1.8;
          color: #334155;
          font-size: 14px;
        }
        .dd-upgrade-grid { display: grid; gap: 12px; }
        .dd-upgrade-card {
          border-radius: 20px;
          padding: 16px;
          border: 1px solid #dde6f2;
          background: #ffffff;
          box-shadow: 0 8px 22px rgba(15,23,42,0.05);
          cursor: pointer;
          transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
        }
        .dd-upgrade-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(15,23,42,0.09);
          border-color: #93c5fd;
        }
        .dd-upgrade-card--pro {
          border: 2px solid #60a5fa;
          background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
          box-shadow: 0 18px 36px rgba(37,99,235,0.16);
        }
        .dd-upgrade-pill {
          display: inline-block;
          margin-bottom: 10px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #2563eb;
          color: white;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .dd-plan-active {
          outline: 3px solid rgba(37,99,235,0.16);
        }
        .dd-upgrade-cta {
          margin-top: 12px;
          font-size: 13px;
          font-weight: 800;
          color: #1d4ed8;
        }
        .dd-muted { color: #475569; font-size: 14px; line-height: 1.65; }
        .dd-copy-note { font-size: 13px; color: #0f766e; font-weight: 800; margin-top: 8px; }
        .dd-status-neutral { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
        .dd-status-good { background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; }
        .dd-status-warn { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }
        .dd-status-risk { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        @media (max-width: 1200px) {
          .dd-main-grid, .dd-split-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 1100px) {
          .dd-top { grid-template-columns: 1fr; }
        }
        @media (max-width: 760px) {
          .dd-page { padding: 16px; }
          .dd-form-grid, .dd-row-card { grid-template-columns: 1fr; }
          .dd-hero h1 { font-size: 38px; }
        }
      `}</style>

      <div className="dd-page">
        <div className="dd-shell">
          <div className="dd-top">
            <div className="dd-hero">
              <div>
                <div className="dd-badge">Outcome-first build</div>
                <span className="dd-plan-chip">Current plan · {plan}</span>
                <h1>Get your deposit back faster.</h1>
                <p>
                  Stop guessing what to do next. Deposit Defender turns your move-out details into a cleaner dispute case with timing, proof, communication history, and exportable outputs.
                </p>
              </div>
              <div className="dd-hero-actions">
                <button className="dd-btn-accent" onClick={loadSampleData}>Try sample data</button>
                <button className={isPlanAtLeast("pro") ? "dd-btn" : "dd-btn-locked dd-btn"} onClick={exportPdfSummary}>
                  {isPlanAtLeast("pro") ? "Export PDF" : "Export PDF · Pro"}
                </button>
                <button className="dd-btn" onClick={() => setTab("letter")}>Open demand letter</button>
              </div>
            </div>

            <div className="dd-right-stack">
              <div className="dd-panel">
                <div className="dd-section-title">1. Timing status</div>
                <div className={`dd-box dd-status-${overdueStatus.tone}`}>
                  <div className="dd-card-title">{overdueStatus.label}</div>
                  <div className="dd-muted" style={{ color: "inherit" }}>{overdueStatus.message}</div>
                </div>
              </div>

              <div className="dd-panel">
                <div className="dd-section-title">2. Risk snapshot</div>
                <div className="dd-card-title">${estimatedReturn.toLocaleString()}</div>
                <div className="dd-muted" style={{ color: "#047857", fontWeight: 600 }}>
                  Estimated amount you may still recover.
                </div>
                <div className="dd-muted" style={{ marginTop: 12 }}>
                  Claimed deductions: <strong>${totalClaimed.toLocaleString()}</strong><br />
                  Deposit at risk: <strong>{depositRiskPercent}%</strong><br />
                  Evidence score: <strong>{evidenceStrength} ({evidenceLabel})</strong>
                </div>
              </div>

              <div className="dd-panel">
                <div className="dd-section-title">3. Recommended next step</div>
                <div className="dd-card-title" style={{ fontSize: 22 }}>
                  {daysSinceMoveOut !== null && daysSinceMoveOut > 21 ? "Follow up and prepare your case" : "Complete your case file"}
                </div>
                <div className="dd-muted" style={{ color: "#1e3a8a", fontWeight: 600 }}>
                  {recommendedNextStep}
                </div>
              </div>
            </div>
          </div>

          <div className="dd-body">
            <div className="dd-main-grid">
              <div className="dd-left-stack">
                <div className="dd-panel">
                  <div className="dd-section-title">Quick case intake</div>
                  <div className="dd-form-grid">
                    <div>
                      <label className="dd-label">Tenant name</label>
                      <input className="dd-input" value={data.tenantName} onChange={(e) => updateField("tenantName", e.target.value)} />
                    </div>
                    <div>
                      <label className="dd-label">Landlord / manager</label>
                      <input className="dd-input" value={data.landlordName} onChange={(e) => updateField("landlordName", e.target.value)} />
                    </div>
                    <div>
                      <label className="dd-label">Property address</label>
                      <input className="dd-input" value={data.propertyAddress} onChange={(e) => updateField("propertyAddress", e.target.value)} />
                    </div>
                    <div>
                      <label className="dd-label">Move-out date</label>
                      <input className="dd-input" type="date" value={data.moveOutDate} onChange={(e) => updateField("moveOutDate", e.target.value)} />
                    </div>
                    <div>
                      <label className="dd-label">Deposit amount ($)</label>
                      <input className="dd-input" type="number" value={data.depositAmount} onChange={(e) => updateField("depositAmount", e.target.value)} />
                    </div>
                    <div>
                      <label className="dd-label">Email</label>
                      <input className="dd-input" value={data.email} onChange={(e) => updateField("email", e.target.value)} />
                    </div>
                    <div>
                      <label className="dd-label">State</label>
                      <input className="dd-input" value={data.stateName} onChange={(e) => updateField("stateName", e.target.value)} placeholder="Example: California" />
                    </div>
                  </div>

                  <div>
                    <label className="dd-label">Notes</label>
                    <textarea className="dd-textarea" value={data.notes} onChange={(e) => updateField("notes", e.target.value)} />
                  </div>

                  <div className="dd-box" style={{ marginTop: 14, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                    <strong>Case completion:</strong> {caseCompletion}% complete
                    <div className="dd-progress-wrap">
                      <div className="dd-progress-bar" style={{ width: `${caseCompletion}%` }} />
                    </div>
                  </div>
                </div>

                <div className="dd-panel">
                  <div className="dd-section-title">Move-out timeline</div>
                  {!timeline.length ? (
                    <div className="dd-muted">Add a move-out date to generate your follow-up timeline.</div>
                  ) : (
                    <div className="dd-timeline">
                      {timeline.map((item) => (
                        <div key={item.id} className="dd-timeline-item">
                          <div className="dd-timeline-head">
                            <strong>{item.title}</strong>
                            <div className="dd-date-chip">{item.date}</div>
                          </div>
                          <div className="dd-muted">{item.detail}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="dd-right-col">
                <div className="dd-split-grid">
                  <div className="dd-panel">
                    <div className="dd-section-title">Action center</div>
                    <div className="dd-actions">
                      <div className="dd-action-card">
                        <strong>Generate a stronger paper trail</strong>
                        <div className="dd-muted">Use the communication log and evidence log to turn loose notes into a cleaner dispute record.</div>
                      </div>
                      <div className="dd-action-card">
                        <strong>Export your case pack</strong>
                        <div className="dd-muted">Create a print-friendly summary when you are ready to escalate or organize your case.</div>
                      </div>
                      <div className="dd-action-card">
                        <strong>Send your demand letter</strong>
                        <div className="dd-muted">Open the letter tab, review the wording, and copy it when you are ready to send.</div>
                      </div>
                    </div>
                    <div className="dd-toolbar">
                      <button className={isPlanAtLeast("pro") ? "dd-btn-accent" : "dd-btn-locked dd-btn"} onClick={exportPdfSummary}>
                        {isPlanAtLeast("pro") ? "Export PDF" : "Export PDF · Pro"}
                      </button>
                      <button className="dd-btn" onClick={() => setTab("letter")}>Open demand letter</button>
                      <button className="dd-btn" onClick={downloadJson}>Export JSON</button>
                      <button className="dd-btn" onClick={resetAll}>Reset</button>
                    </div>
                  </div>

                  <div className="dd-panel">
                    <div className="dd-section-title">Upgrade path</div>
                    <div className="dd-upgrade-grid">
                      <div className={`dd-upgrade-card ${plan === "free" ? "dd-plan-active" : ""}`} onClick={() => handlePlanClick("free") }>
                        <div className="dd-section-title" style={{ marginBottom: 6 }}>Free</div>
                        <div className="dd-card-title" style={{ fontSize: 24 }}>Track your case</div>
                        <div className="dd-muted">Planner, evidence log, deductions, communication history, and draft letter.</div>
                        <div className="dd-upgrade-cta" style={{ color: "#475569" }}>Current free mode</div>
                      </div>

                      <div className={`dd-upgrade-card dd-upgrade-card--pro ${plan === "pro" ? "dd-plan-active" : ""}`} onClick={() => handlePlanClick("pro") }>
                        <div className="dd-upgrade-pill">Most popular</div>
                        <div className="dd-section-title" style={{ marginBottom: 6, color: "#1d4ed8" }}>Pro · $9</div>
                        <div className="dd-card-title" style={{ fontSize: 28 }}>Send-ready output</div>
                        <div className="dd-muted" style={{ color: "#1e3a8a", fontWeight: 600 }}>Polished PDF export, cleaner demand letter formatting, and stronger dispute templates.</div>
                        <div className="dd-upgrade-cta">Unlock Pro</div>
                      </div>

                      <div className={`dd-upgrade-card ${plan === "bundle" ? "dd-plan-active" : ""}`} onClick={() => handlePlanClick("bundle") }>
                        <div className="dd-section-title" style={{ marginBottom: 6 }}>Bundle · $19</div>
                        <div className="dd-card-title" style={{ fontSize: 24 }}>Full renter toolkit</div>
                        <div className="dd-muted">Move-out pack, roommate split tools, budget planner, and printable case pack.</div>
                        <div className="dd-upgrade-cta">Get bundle</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dd-panel">
              <div className="dd-section-title">Case details</div>
              <div className="dd-tabs">
                {tabs.map(([key, name]) => (
                  <button key={key} className={tab === key ? "dd-tab-active" : "dd-tab-idle"} onClick={() => setTab(key)}>
                    {name}
                  </button>
                ))}
              </div>

              {tab === "evidence" && (
                <div>
                  {data.evidence.map((item) => (
                    <div key={item.id} className="dd-row-card">
                      <input className="dd-input" type="date" value={item.date} onChange={(e) => updateListItem("evidence", item.id, "date", e.target.value)} />
                      <input className="dd-input" placeholder="Room / area" value={item.room} onChange={(e) => updateListItem("evidence", item.id, "room", e.target.value)} />
                      <input className="dd-input" placeholder="Photo/video file name" value={item.fileRef} onChange={(e) => updateListItem("evidence", item.id, "fileRef", e.target.value)} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <input className="dd-input" placeholder="Short note" value={item.note} onChange={(e) => updateListItem("evidence", item.id, "note", e.target.value)} />
                        <button className="dd-btn" onClick={() => removeListItem("evidence", item.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  <button className="dd-btn-primary" onClick={() => addListItem("evidence", { date: "", room: "Bedroom", fileRef: "", note: "" })}>Add evidence item</button>
                </div>
              )}

              {tab === "deductions" && (
                <div>
                  {data.issues.map((item) => (
                    <div key={item.id} className="dd-row-card">
                      <input className="dd-input" placeholder="Area" value={item.area} onChange={(e) => updateListItem("issues", item.id, "area", e.target.value)} />
                      <input className="dd-input" type="number" placeholder="Claimed amount" value={item.amount} onChange={(e) => updateListItem("issues", item.id, "amount", e.target.value)} />
                      <select className="dd-select" value={item.status} onChange={(e) => updateListItem("issues", item.id, "status", e.target.value)}>
                        <option>Review</option>
                        <option>Accepted</option>
                        <option>Disputed</option>
                        <option>Resolved</option>
                      </select>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input className="dd-input" placeholder="Note" value={item.note} onChange={(e) => updateListItem("issues", item.id, "note", e.target.value)} />
                        <button className="dd-btn" onClick={() => removeListItem("issues", item.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  <button className="dd-btn-primary" onClick={() => addListItem("issues", { area: "Bathroom", amount: "", status: "Review", note: "" })}>Add deduction item</button>
                </div>
              )}

              {tab === "comms" && (
                <div>
                  {data.communications.map((item) => (
                    <div key={item.id} className="dd-row-card">
                      <input className="dd-input" type="date" value={item.date} onChange={(e) => updateListItem("communications", item.id, "date", e.target.value)} />
                      <select className="dd-select" value={item.channel} onChange={(e) => updateListItem("communications", item.id, "channel", e.target.value)}>
                        <option>Email</option>
                        <option>Phone</option>
                        <option>Text</option>
                        <option>In person</option>
                      </select>
                      <input className="dd-input" placeholder="Subject" value={item.subject} onChange={(e) => updateListItem("communications", item.id, "subject", e.target.value)} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <input className="dd-input" placeholder="Summary" value={item.summary} onChange={(e) => updateListItem("communications", item.id, "summary", e.target.value)} />
                        <button className="dd-btn" onClick={() => removeListItem("communications", item.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  <button className="dd-btn-primary" onClick={() => addListItem("communications", { date: "", channel: "Email", subject: "Follow-up", summary: "" })}>Add communication</button>
                </div>
              )}

              {tab === "letter" && (
                <div>
                  <textarea className="dd-letter" value={demandLetter} readOnly />
                  <div className="dd-toolbar">
                    <button className="dd-btn-accent" onClick={copyDemandLetter}>Copy demand letter</button>
                    <button className="dd-btn" onClick={() => window.print()}>Print draft</button>
                  </div>
                  {copyMessage ? <div className="dd-copy-note">{copyMessage}</div> : null}
                </div>
              )}
            </div>

            <div className="dd-split-grid">
              <div className="dd-panel">
                <div className="dd-section-title">State guidance</div>
                <ul className="dd-signal-list">
                  {stateGuidance.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="dd-panel">
                <div className="dd-section-title">Case snapshot</div>
                <ul className="dd-signal-list">
                  {summaryHighlights.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="dd-panel">
              <div className="dd-section-title">Dispute readiness checklist</div>
              <ul className="dd-signal-list">
                {checklistItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="dd-panel">
              <div className="dd-section-title">Bundle-only toolkit</div>
              {isPlanAtLeast("bundle") ? (
                <ul className="dd-signal-list">
                  {bundleTools.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <div className="dd-box dd-status-neutral">
                  <strong>Locked on Free / Pro</strong>
                  <div className="dd-muted" style={{ color: "inherit", marginTop: 8 }}>
                    Switch to Bundle mode to unlock extra printable tools and worksheets.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
