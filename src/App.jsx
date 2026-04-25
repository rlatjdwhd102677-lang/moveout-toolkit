import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "deposit-defender-centered-final-v1";

const styles = `
:root{
  --bg:#dfe7f2;
  --panel:#f6f8fc;
  --line:#cbd7ea;
  --line-strong:#b8c7e2;
  --text:#16233f;
  --muted:#5d6d8f;
  --navy:#16327a;
  --blue:#3266ff;
  --blue-soft:#eaf0ff;
  --green:#1ea85c;
  --shadow:0 10px 30px rgba(20, 40, 90, 0.08);
}

*{box-sizing:border-box}
html,body,#root{
  margin:0;
  padding:0;
  min-height:100%;
  width:100%;
  background:var(--bg);
  color:var(--text);
  font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
button,input,textarea,select{font:inherit}
button{cursor:pointer;border:none}

.page-shell{
  width:100%;
  min-height:100vh;
  display:flex;
  justify-content:center;
  padding:24px;
  overflow-x:hidden;
  background:linear-gradient(180deg,#e7eef7 0%, #dfe7f2 100%);
}

.app-shell{
  width:100%;
  max-width:1440px;
  margin:0 auto;
}

.app-stack{
  display:flex;
  flex-direction:column;
  gap:20px;
}

.top-grid{
  display:grid;
  grid-template-columns:minmax(0,1.55fr) minmax(320px,0.95fr);
  gap:20px;
  align-items:stretch;
}

.hero-card{
  background:linear-gradient(145deg,#17306f 0%, #1f3780 55%, #20366f 100%);
  color:#fff;
  border-radius:28px;
  padding:28px;
  min-height:520px;
  box-shadow:var(--shadow);
  display:flex;
  flex-direction:column;
  justify-content:space-between;
}

.badge-row{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:14px;
}

.pill{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:34px;
  padding:8px 14px;
  border-radius:999px;
  font-size:12px;
  font-weight:800;
  letter-spacing:0.05em;
  text-transform:uppercase;
}

.pill.hero{background:rgba(255,255,255,0.14);color:#fff}

.hero-title{
  margin:0 0 18px;
  font-size:clamp(42px, 4.2vw, 68px);
  line-height:0.96;
  font-weight:900;
  letter-spacing:-0.04em;
  max-width:760px;
}

.hero-copy{
  margin:0;
  max-width:800px;
  font-size:18px;
  line-height:1.65;
  color:rgba(255,255,255,0.96);
}

.hero-benefits{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:12px;
  margin-top:24px;
}

.hero-benefit{
  padding:16px 14px;
  border-radius:18px;
  background:rgba(255,255,255,0.08);
  border:1px solid rgba(255,255,255,0.12);
  color:rgba(255,255,255,0.96);
  font-size:15px;
  line-height:1.52;
  font-weight:700;
  text-align:center;
}

.hero-actions{
  display:flex;
  gap:14px;
  flex-wrap:wrap;
  margin-top:22px;
}

.btn{
  min-height:50px;
  padding:14px 20px;
  border-radius:16px;
  font-weight:800;
  transition:transform .15s ease, box-shadow .15s ease;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  line-height:1.2;
}
.btn:hover{transform:translateY(-1px)}
.btn.primary{background:linear-gradient(180deg,#3a6bff 0%, #2754e9 100%);color:#fff;box-shadow:0 10px 20px rgba(50,102,255,0.24)}
.btn.secondary{background:#fff;color:var(--navy);border:1px solid rgba(255,255,255,0.2)}

.right-stack{display:grid;gap:18px}

.stat-card{
  background:var(--panel);
  border:1px solid var(--line);
  border-radius:26px;
  padding:22px 20px;
  box-shadow:var(--shadow);
  min-height:170px;
}

.kicker{
  font-size:13px;
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:0.12em;
  color:#445372;
  text-align:center;
  margin-bottom:12px;
}

.status-box{
  border:1px solid #acc2ff;
  background:var(--blue-soft);
  border-radius:20px;
  padding:18px;
  text-align:center;
}

.status-title{font-size:24px;font-weight:900;color:#2b58df;margin:0 0 8px}
.status-copy{margin:0;color:#34539c;line-height:1.55}
.snapshot-main{text-align:center;font-size:54px;line-height:1;font-weight:900;margin:10px 0 12px}
.snapshot-green{color:#0f8d51;font-weight:900;text-align:center;margin-bottom:12px;font-size:22px}
.metric-list{display:grid;gap:8px;margin-top:12px;color:var(--muted);line-height:1.4;text-align:center}
.recommend-box{text-align:center;padding:10px 10px 0}
.recommend-title{font-size:18px;font-weight:900;margin:6px 0 8px}
.recommend-copy{margin:0;color:#3050a2;font-weight:700;line-height:1.55}

.middle-grid{
  display:grid;
  grid-template-columns:minmax(0,1.75fr) minmax(250px,0.76fr) minmax(250px,0.82fr);
  gap:20px;
  align-items:start;
}

.card{
  background:var(--panel);
  border:1px solid var(--line);
  border-radius:26px;
  box-shadow:var(--shadow);
}

.section-card{padding:20px}
.section-title{margin:0 0 14px;text-align:center;font-size:14px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#465679}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.field-block{min-width:0}
.field-block.span-2{grid-column:1 / -1}
.field-label{display:block;text-align:center;font-size:14px;font-weight:900;color:#37486a;margin:0 0 8px}
.field-shell{position:relative}

.input,.textarea,.select{
  width:100%;
  background:#fff;
  border:1.5px solid var(--line-strong);
  color:#18233e;
  border-radius:16px;
  padding:12px 14px;
  outline:none;
  transition:border-color .15s ease, box-shadow .15s ease;
  font-size:13px;
}
.input::placeholder,.textarea::placeholder{color:#a7b4cb}
.input:focus,.textarea:focus,.select:focus{border-color:#7ea0ff;box-shadow:0 0 0 4px rgba(50,102,255,0.12)}
.textarea{min-height:132px;resize:vertical;line-height:1.58;padding-right:16px}
.valid{border-color:#82d8a3 !important;box-shadow:0 0 0 4px rgba(30,168,92,0.10)}
.input.with-check{padding-right:46px}
.checkmark{
  position:absolute;
  top:50%;
  right:8px;
  transform:translateY(-50%);
  width:20px;
  height:20px;
  border-radius:999px;
  background:var(--green);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
  font-weight:900;
  pointer-events:none;
}
.checkmark.notes{top:12px;transform:none}

.progress-wrap{margin-top:18px;background:#eef4ff;border:1px solid #bdd0f5;border-radius:18px;padding:12px 14px}
.progress-label{text-align:center;font-weight:800;color:#273657;margin-bottom:10px}
.progress-bar{width:100%;height:10px;border-radius:999px;background:#d6e4ff;overflow:hidden}
.progress-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#3b6cff 0%, #2b59ea 100%)}

.action-stack,.pricing-stack{display:grid;gap:14px}
.action-card{
  background:#fff;
  border:1px solid var(--line);
  border-radius:20px;
  padding:16px 14px;
  text-align:center;
  min-height:142px;
  display:flex;
  flex-direction:column;
  justify-content:center;
}
.action-card h4{margin:0 0 10px;font-size:20px;line-height:1.35;font-weight:900;color:#19284a}
.action-card p{margin:0;color:var(--muted);line-height:1.6}
.action-buttons-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px}
.small-btn{min-height:46px;padding:11px 13px;border-radius:14px;font-weight:900}
.small-btn.primary{background:linear-gradient(180deg,#3a6bff 0%, #2958eb 100%);color:#fff}
.small-btn.secondary{background:#fff;color:#152654;border:1px solid var(--line-strong)}

.plan-card{
  width:100%;
  text-align:center;
  padding:20px 18px 18px;
  background:#fff;
  border:2px solid #d4dff2;
  border-radius:24px;
  transition:border-color .15s ease, box-shadow .15s ease, transform .15s ease;
}
.plan-card:hover{transform:translateY(-1px)}
.plan-card.selected{border-color:#78a0ff;box-shadow:0 10px 25px rgba(50,102,255,0.12)}
.plan-card.popular{border-color:#7ca2ff}
.plan-top{display:flex;justify-content:center;margin-bottom:10px}
.plan-pill{display:inline-flex;align-items:center;justify-content:center;min-height:30px;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;background:#eff4ff;color:#2148b5}
.plan-name{font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:#495a7b;margin-bottom:8px}
.plan-title{font-size:20px;font-weight:900;line-height:1.15;margin-bottom:10px}
.plan-copy{color:var(--muted);line-height:1.6;min-height:60px}
.plan-features{margin-top:12px;display:grid;gap:8px;text-align:left;color:#556788;font-size:13px;line-height:1.55}
.plan-status{margin-top:16px;font-weight:900;color:#325fe7}

.timeline-card{padding:18px}
.timeline-empty{text-align:center;color:var(--muted);padding:24px 10px;line-height:1.6}
.timeline-list{display:grid;gap:14px}
.timeline-item{background:#fff;border:1px solid var(--line);border-radius:20px;padding:16px 18px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:start}
.timeline-item-title{font-weight:900;font-size:17px;margin-bottom:4px;color:#15244b}
.timeline-item-copy{color:var(--muted);line-height:1.5}
.timeline-date{white-space:nowrap;align-self:start;background:#eef3ff;color:#1a2d5f;border-radius:999px;padding:8px 12px;font-weight:900;font-size:14px}

.details-card{padding:18px}
.tabs{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
.tab{min-height:44px;padding:10px 16px;border-radius:14px;background:#e5ecf7;color:#415475;font-weight:900}
.tab.active{background:#0f1d42;color:#fff}
.tab-panel{display:grid;gap:14px}
.entry-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:14px}
.entry-grid{display:grid;grid-template-columns:1.05fr 1.05fr 1.4fr auto;gap:10px;align-items:start}
.entry-grid.triple{grid-template-columns:1fr 1fr 2fr auto}
.file-row{margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start}
.upload-label{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:10px 16px;border-radius:14px;font-weight:900;background:linear-gradient(180deg,#3a6bff 0%, #2857e9 100%);color:#fff;box-shadow:0 8px 16px rgba(50,102,255,0.18)}
.hidden-input{display:none}
.file-chip{display:inline-flex;align-items:center;gap:8px;padding:10px 12px;background:#eef3ff;color:#2648a9;border:1px solid #b8ccff;border-radius:999px;font-size:13px;font-weight:800}
.preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px, 1fr));gap:10px;margin-top:10px}
.preview-card{background:#f8fbff;border:1px solid var(--line);border-radius:16px;padding:8px}
.preview-thumb{width:100%;height:120px;object-fit:cover;border-radius:12px;background:#dfe9ff}
.preview-video{width:100%;height:120px;border-radius:12px;background:#dfe9ff}
.preview-caption{margin-top:8px;font-size:12px;font-weight:800;color:#37508d;word-break:break-word}
.wide-center{display:flex;justify-content:center;margin-top:12px}

.bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.info-card{background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:18px;box-shadow:var(--shadow)}
.info-card.large{grid-column:1 / -1}
.info-card .section-title{margin-bottom:10px}
.info-card ul{margin:0;padding-left:20px;color:#334565;line-height:1.75}
.snapshot-table{display:grid;gap:8px;text-align:center;color:#334565;line-height:1.5}
.bundle-toolkit{margin-top:18px}
.bundle-box{background:#edf4ff;border:1.5px solid #b8cdf8;border-radius:18px;padding:18px;text-align:center;color:#32529d;line-height:1.6}
.bundle-box strong{color:#17306f}
.locked{opacity:0.86}

@media (max-width: 1180px){
  .top-grid,.middle-grid,.bottom-grid{grid-template-columns:1fr}
  .hero-card{min-height:auto}
}
@media (max-width: 980px){
  .page-shell{padding:18px 12px 28px}
  .app-shell{max-width:760px}
  .hero-card{padding:22px 18px 20px}
  .hero-title{font-size:clamp(38px, 11vw, 62px)}
  .hero-copy{font-size:16px}
  .hero-benefits{grid-template-columns:1fr}
  .hero-actions{display:grid;grid-template-columns:1fr;gap:10px}
  .hero-actions .btn{width:100%}
  .middle-grid{grid-template-columns:1fr !important;gap:16px}
  .section-card{padding:18px}
  .form-grid{grid-template-columns:1fr !important;gap:14px}
  .action-card,.plan-card{min-height:auto}
  .plan-copy{min-height:auto}
  .action-buttons-grid{grid-template-columns:1fr 1fr;gap:10px}
  .timeline-item,.entry-grid,.entry-grid.triple{grid-template-columns:1fr}
  .timeline-date{justify-self:start}
}
@media (max-width: 680px){
  .page-shell{padding:14px 10px 24px}
  .badge-row{gap:8px}
  .pill{font-size:11px;padding:7px 12px;min-height:30px}
  .hero-title{font-size:clamp(34px, 12vw, 54px)}
  .hero-copy{font-size:15px;line-height:1.6}
  .hero-benefit{font-size:14px;padding:14px 12px}
  .snapshot-main{font-size:46px}
  .snapshot-green{font-size:18px}
  .section-title{font-size:13px}
  .field-label{font-size:13px}
  .input,.textarea,.select{font-size:14px;padding:13px 14px}
  .textarea{min-height:124px}
  .action-buttons-grid{grid-template-columns:1fr}
  .tabs{gap:8px}
  .tab{width:100%;justify-content:center}
  .wide-center{width:100%}
  .wide-center .btn{width:100%}
}
`;

const emptyForm = {
  tenantName: "",
  landlord: "",
  address: "",
  moveOutDate: "",
  depositAmount: "",
  email: "",
  state: "",
  notes: "",
};

const sampleForm = {
  tenantName: "Jordan Miller",
  landlord: "Northview Property Group",
  address: "1228 Maple Street, Apt 3B",
  moveOutDate: "2026-08-31",
  depositAmount: "1800",
  email: "jordan@example.com",
  state: "California",
  notes: "Landlord mentioned carpet cleaning and wall patching charges, but the apartment was returned in normal condition. I have move-in photos, move-out photos, and a written follow-up.",
};

const emptyEvidence = [{ date: "", area: "", note: "", files: [] }];
const sampleEvidence = [
  { date: "2026-08-30", area: "Living room", note: "Walls and floors clean with no visible damage. Final room photos captured before handoff.", files: [{ name: "living-room-final.jpg", type: "image/jpeg", url: "" }] },
  { date: "2026-08-30", area: "Bedroom", note: "Carpet vacuumed and no visible stains in the final walkthrough photo set.", files: [{ name: "bedroom-final.jpg", type: "image/jpeg", url: "" }] },
  { date: "2026-08-31", area: "Kitchen", note: "Countertops, oven, and sink cleaned. Short video recorded to document final condition.", files: [{ name: "kitchen-video.mp4", type: "video/mp4", url: "" }] },
];

const emptyDeductions = [{ item: "", amount: "", status: "Disputed" }];
const sampleDeductions = [
  { item: "Carpet cleaning", amount: "250", status: "Disputed" },
  { item: "Wall patching", amount: "175", status: "Disputed" },
];

const emptyComms = [{ date: "", channel: "", summary: "" }];
const sampleComms = [
  { date: "2026-08-20", channel: "Email", summary: "Landlord mentioned carpet cleaning and wall patching charges in writing." },
  { date: "2026-09-02", channel: "Email", summary: "Tenant requested an itemized explanation and attached move-out condition evidence." },
];

function formatCurrency(value) {
  const num = Number(value || 0);
  return `$${num.toLocaleString()}`;
}
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}
function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim())) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const [y, m, d] = value.split("-").map(Number);
  return date.getFullYear() === y && date.getMonth() + 1 === m && date.getDate() === d;
}
function shiftDate(baseDateString, offsetDays) {
  if (!isValidIsoDate(baseDateString)) return "";
  const date = new Date(`${baseDateString}T00:00:00`);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}
function generateTimeline(moveOutDate) {
  if (!isValidIsoDate(moveOutDate)) return [];
  return [
    { title: "Give written notice", copy: "Send written notice and keep a copy.", date: shiftDate(moveOutDate, -31) },
    { title: "Start evidence capture", copy: "Take room-by-room photos and short videos.", date: shiftDate(moveOutDate, -15) },
    { title: "Confirm handoff plan", copy: "Get key return and forwarding address steps in writing.", date: shiftDate(moveOutDate, -8) },
    { title: "Capture final condition", copy: "Take final photos, videos, and meter readings.", date: shiftDate(moveOutDate, -2) },
    { title: "Deposit follow-up", copy: "If there is no update, send a short written follow-up.", date: shiftDate(moveOutDate, 6) },
    { title: "Prepare demand letter", copy: "If deductions feel inflated or the process is slow, prepare your letter and evidence pack.", date: shiftDate(moveOutDate, 13) },
  ];
}
function daysUntil(dateString) {
  if (!isValidIsoDate(dateString)) return null;
  const target = new Date(`${dateString}T00:00:00`).getTime();
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((target - todayMidnight) / (1000 * 60 * 60 * 24));
}
function downloadFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
function sanitizeForStorage(evidenceRows) {
  return evidenceRows.map((row) => ({
    ...row,
    files: (row.files || []).map((file) => ({ name: file.name, type: file.type, size: file.size || 0, url: file.url || "" })),
  }));
}

export default function App() {
  const detailsRef = useRef(null);

  const heroBenefits = [
    "Track your move-out timeline and know what to do next",
    "Organize proof in one place with photos, videos, and notes",
    "Create a send-ready dispute summary when follow-up time comes",
  ];

  const featureList = [
    "Track move-out timing",
    "Log deductions",
    "Save communication history",
    "Upload evidence files",
    "Draft a demand letter",
    "Export a cleaner summary",
  ];

  const [selectedPlan, setSelectedPlan] = useState("free");
  const [activeTab, setActiveTab] = useState("evidence");
  const [form, setForm] = useState(emptyForm);
  const [evidence, setEvidence] = useState(sampleEvidence);
  const [deductions, setDeductions] = useState(sampleDeductions);
  const [comms, setComms] = useState(sampleComms);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setLoaded(true);
        return;
      }
      const saved = JSON.parse(raw);
      if (saved.form) setForm(saved.form);
      if (saved.evidence) setEvidence(saved.evidence);
      if (saved.deductions) setDeductions(saved.deductions);
      if (saved.comms) setComms(saved.comms);
      if (saved.selectedPlan) setSelectedPlan(saved.selectedPlan);
      if (saved.activeTab) setActiveTab(saved.activeTab);
    } catch {
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedPlan,
        activeTab,
        form,
        evidence: sanitizeForStorage(evidence),
        deductions,
        comms,
      })
    );
  }, [loaded, selectedPlan, activeTab, form, evidence, deductions, comms]);

  const isPro = selectedPlan === "pro";
  const isBundle = selectedPlan === "bundle";
  const isProPlus = isPro || isBundle;

  const validation = useMemo(() => ({
    tenantName: form.tenantName.trim().length >= 2,
    landlord: form.landlord.trim().length >= 2,
    address: form.address.trim().length >= 6,
    moveOutDate: isValidIsoDate(form.moveOutDate),
    depositAmount: Number(form.depositAmount) > 0,
    email: isValidEmail(form.email),
    state: form.state.trim().length >= 2,
    notes: form.notes.trim().length >= 15,
  }), [form]);

  const completedFields = Object.values(validation).filter(Boolean).length;
  const completionPct = Math.round((completedFields / Object.keys(validation).length) * 100);
  const depositNumber = Number(form.depositAmount || 0);
  const claimedTotal = deductions.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const evidenceItemCount = evidence.filter((row) => row.area.trim() || row.note.trim() || row.date.trim()).length;
  const evidenceFileCount = evidence.reduce((sum, row) => sum + (row.files?.length || 0), 0);
  const commCount = comms.filter((row) => row.date.trim() || row.channel.trim() || row.summary.trim()).length;
  const evidenceScore = Math.min(100, evidenceItemCount * 18 + evidenceFileCount * 10 + commCount * 12 + (validation.moveOutDate ? 10 : 0) + (validation.state ? 10 : 0));
  const evidenceStrength = evidenceScore >= 80 ? "Strong" : evidenceScore >= 50 ? "Moderate" : "Weak";
  const estimatedReturn = Math.max(0, depositNumber - claimedTotal);
  const depositRiskPct = depositNumber > 0 ? Math.min(100, Math.round((claimedTotal / depositNumber) * 100)) : 0;

  const statusInfo = useMemo(() => {
    if (!validation.moveOutDate) return { title: "No date yet", copy: "Add your move-out date so the tool can tell you when it is time to follow up." };
    const diff = daysUntil(form.moveOutDate);
    if (diff === null) return { title: "No date yet", copy: "Add your move-out date so the tool can judge timing and next steps." };
    if (diff > 45) return { title: "Upcoming", copy: `Move-out is ${diff} day(s) away. Keep collecting proof before handoff.` };
    if (diff >= 0) return { title: "Action window", copy: `Move-out is ${diff} day(s) away. Finalize evidence, notice, and handoff documentation now.` };
    if (diff >= -21) return { title: "Follow-up", copy: `Move-out happened ${Math.abs(diff)} day(s) ago. Track deductions and prepare follow-up communication.` };
    return { title: "Escalation window", copy: `Move-out happened ${Math.abs(diff)} day(s) ago. Review your demand letter and evidence pack now.` };
  }, [form.moveOutDate, validation.moveOutDate]);

  const timeline = useMemo(() => generateTimeline(form.moveOutDate), [form.moveOutDate]);

  const demandLetterText = useMemo(() => {
    const deductionLines = deductions
      .filter((d) => d.item.trim() || d.amount)
      .map((d) => `- ${d.item || "Unspecified deduction"}: ${formatCurrency(d.amount || 0)} (${d.status || "Disputed"})`)
      .join("\n");
    const evidenceLines = evidence
      .filter((e) => e.area.trim() || e.note.trim() || e.date.trim())
      .map((e) => `- ${e.date || "Undated"} | ${e.area || "Area not labeled"} | ${e.note || "No note"}`)
      .join("\n");
    return `Subject: Security Deposit Demand\n\nDear ${form.landlord || "Landlord / Manager"},\n\nI am writing regarding the return of my security deposit for ${form.address || "[property address]"}.\n\nMy move-out date was ${form.moveOutDate || "[move-out date]"}, and the original deposit amount was ${formatCurrency(form.depositAmount || 0)}.\n\nThe deductions currently in dispute are:\n${deductionLines || "- No deduction items entered yet"}\n\nI dispute these charges because the property was returned in acceptable condition and I have supporting documentation, including:\n${evidenceLines || "- No evidence items entered yet"}\n\nAdditional notes:\n${form.notes || "No additional notes provided."}\n\nPlease provide a clear itemized explanation and return any remaining deposit balance promptly. If needed, I can also provide supporting evidence and communication records for review.\n\nSincerely,\n${form.tenantName || "[tenant name]"}\n${form.email || "[email]"}`;
  }, [deductions, evidence, form]);

  const readinessChecklist = useMemo(() => [
    { label: "Move-out date added", done: validation.moveOutDate },
    { label: "Evidence file count looks strong", done: evidenceFileCount >= 3 },
    { label: "Communication history logged", done: commCount >= 1 },
    { label: "Disputed deduction identified", done: claimedTotal > 0 },
    { label: `State entered: ${form.state || "Missing"}`, done: validation.state },
  ], [validation.moveOutDate, validation.state, evidenceFileCount, commCount, claimedTotal, form.state]);

  function setSampleData() {
    setForm(sampleForm);
    setEvidence(sampleEvidence);
    setDeductions(sampleDeductions);
    setComms(sampleComms);
    setSelectedPlan("pro");
  }
  function resetAll() {
    setForm(emptyForm);
    setEvidence(emptyEvidence);
    setDeductions(emptyDeductions);
    setComms(emptyComms);
    setActiveTab("evidence");
    setSelectedPlan("free");
    localStorage.removeItem(STORAGE_KEY);
  }
  function updateForm(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }
  function updateEvidence(index, key, value) { setEvidence((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))); }
  function addEvidenceRow() { setEvidence((prev) => [...prev, { date: "", area: "", note: "", files: [] }]); }
  function deleteEvidenceRow(index) { setEvidence((prev) => prev.filter((_, i) => i !== index)); }
  function handleEvidenceFiles(index, fileList) {
    const uploaded = Array.from(fileList || []).map((file) => ({ name: file.name, type: file.type, size: file.size, url: URL.createObjectURL(file) }));
    setEvidence((prev) => prev.map((row, i) => (i === index ? { ...row, files: [...(row.files || []), ...uploaded] } : row)));
  }
  function removeEvidenceFile(rowIndex, fileIndex) {
    setEvidence((prev) => prev.map((row, i) => i === rowIndex ? { ...row, files: row.files.filter((_, idx) => idx !== fileIndex) } : row));
  }
  function updateDeductions(index, key, value) { setDeductions((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))); }
  function addDeductionRow() { setDeductions((prev) => [...prev, { item: "", amount: "", status: "Disputed" }]); }
  function deleteDeductionRow(index) { setDeductions((prev) => prev.filter((_, i) => i !== index)); }
  function updateComms(index, key, value) { setComms((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))); }
  function addCommsRow() { setComms((prev) => [...prev, { date: "", channel: "", summary: "" }]); }
  function deleteCommsRow(index) { setComms((prev) => prev.filter((_, i) => i !== index)); }
  function scrollToDetails(tabName) {
    setActiveTab(tabName);
    setTimeout(() => { detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
  }
  function openDemandLetter() {
    setActiveTab("demand");
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const popup = window.open("", "_blank", "width=900,height=900");
    if (!popup) return;
    popup.document.write(`
      <html><head><title>Demand Letter</title><style>body{font-family:Arial,sans-serif;padding:32px;line-height:1.7;color:#142347;}pre{white-space:pre-wrap;font-family:Arial,sans-serif;font-size:16px;}</style></head>
      <body><h1>Demand Letter</h1><pre>${demandLetterText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>
    `);
    popup.document.close();
  }
  function exportJSON() {
    downloadFile("deposit-defender-case.json", JSON.stringify({
      plan: selectedPlan, form, evidence: sanitizeForStorage(evidence), deductions, comms,
      summary: { deposit: depositNumber, claimed: claimedTotal, estimatedReturn, evidenceScore, evidenceStrength, evidenceFileCount },
    }, null, 2), "application/json;charset=utf-8");
  }
  function exportPDF() {
    if (!isProPlus) { alert("PDF export is a Pro feature. Switch to Pro or Bundle to unlock it."); return; }
    window.print();
  }
  function currentPlanLabel() { if (selectedPlan === "bundle") return "bundle"; if (selectedPlan === "pro") return "pro"; return "free"; }

  return (
    <>
      <style>{styles}</style>
      <div className="page-shell">
        <div className="app-shell">
          <div className="app-stack">
            <div className="top-grid">
              <section className="hero-card">
                <div>
                  <div className="badge-row">
                    <span className="pill hero">Outcome-first build</span>
                    <span className="pill hero">Current plan · {currentPlanLabel()}</span>
                  </div>

                  <h1 className="hero-title">Get your deposit back with a cleaner case file.</h1>

                  <p className="hero-copy">
                    Deposit Defender helps renters organize move-out dates, evidence, deductions, and landlord communication in one place, so they can follow up faster and dispute unfair charges with more confidence.
                  </p>

                  <div className="hero-benefits">
                    {heroBenefits.map((item) => (
                      <div key={item} className="hero-benefit">{item}</div>
                    ))}
                  </div>
                </div>

                <div className="hero-actions">
                  <button className="btn primary" onClick={setSampleData}>Try sample data</button>
                  <button className="btn secondary" onClick={exportPDF}>{isProPlus ? "Export PDF" : "Export PDF · Pro"}</button>
                  <button className="btn secondary" onClick={openDemandLetter}>Open demand letter</button>
                </div>
              </section>

              <div className="right-stack">
                <section className="stat-card">
                  <div className="kicker">1. Timing status</div>
                  <div className="status-box">
                    <h3 className="status-title">{statusInfo.title}</h3>
                    <p className="status-copy">{statusInfo.copy}</p>
                  </div>
                </section>

                <section className="stat-card">
                  <div className="kicker">2. Risk snapshot</div>
                  <div className="snapshot-main">{formatCurrency(estimatedReturn)}</div>
                  <div className="snapshot-green">Estimated amount you may still recover.</div>
                  <div className="metric-list">
                    <div>Claimed deductions: <strong>{formatCurrency(claimedTotal)}</strong></div>
                    <div>Deposit at risk: <strong>{depositRiskPct}%</strong></div>
                    <div>Evidence score: <strong>{evidenceScore} ({evidenceStrength})</strong></div>
                    <div>Attached files: <strong>{evidenceFileCount}</strong></div>
                  </div>
                </section>

                <section className="stat-card">
                  <div className="kicker">3. Your next best move</div>
                  <div className="recommend-box">
                    <div className="recommend-title">Your next best move</div>
                    <p className="recommend-copy">Deposit Defender highlights the next best action based on your timing, deductions, and evidence.</p>
                  </div>
                </section>
              </div>
            </div>

            <div className="middle-grid">
              <section className="card section-card">
                <h2 className="section-title">Quick case intake</h2>
                <div className="form-grid">
                  {[
                    ["Tenant name", "tenantName", "Enter tenant name", validation.tenantName],
                    ["Landlord / manager", "landlord", "Enter landlord or manager", validation.landlord],
                    ["Property address", "address", "Enter property address", validation.address],
                    ["Move-out date", "moveOutDate", "YYYY-MM-DD", validation.moveOutDate],
                    ["Deposit amount ($)", "depositAmount", "Enter deposit amount", validation.depositAmount],
                    ["Email", "email", "Enter email address", validation.email],
                    ["State", "state", "Enter state", validation.state],
                  ].map(([label, key, placeholder, isValid]) => (
                    <div className="field-block" key={key}>
                      <label className="field-label">{label}</label>
                      <div className="field-shell">
                        <input
                          className={`input ${isValid ? "valid with-check" : ""}`}
                          value={form[key]}
                          onChange={(e) => updateForm(key, key === "depositAmount" ? e.target.value.replace(/[^\d]/g, "") : key === "moveOutDate" ? e.target.value.replace(/[^\d-]/g, "").slice(0, 10) : e.target.value)}
                          placeholder={placeholder}
                          inputMode={key === "depositAmount" || key === "moveOutDate" ? "numeric" : undefined}
                        />
                        {isValid && <span className="checkmark">✓</span>}
                      </div>
                    </div>
                  ))}

                  <div className="field-block span-2">
                    <label className="field-label">Notes</label>
                    <div className="field-shell">
                      <textarea className={`textarea ${validation.notes ? "valid" : ""}`} value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder="Briefly describe the issue, your evidence, and any landlord messages here." />
                      {validation.notes && <span className="checkmark notes">✓</span>}
                    </div>
                  </div>
                </div>

                <div className="progress-wrap">
                  <div className="progress-label">Case completion: {completionPct}% complete</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${completionPct}%` }} /></div>
                </div>
              </section>

              <section className="card section-card">
                <h2 className="section-title">Action center</h2>
                <div className="action-stack">
                  <div className="action-card">
                    <h4>Turn notes into a stronger case</h4>
                    <p>Clean up messy move-out details into a more usable dispute record.</p>
                  </div>
                  <div className="action-card">
                    <h4>Build a send-ready case pack</h4>
                    <p>Prepare a summary you can print, save, or send when needed.</p>
                  </div>
                  <div className="action-card">
                    <h4>Attach real proof files</h4>
                    <p>Add photos and videos so your case feels documented, not vague.</p>
                  </div>

                  <div className="action-buttons-grid">
                    <button className="small-btn primary" onClick={exportPDF}>{isProPlus ? "Export PDF" : "Export PDF · Pro"}</button>
                    <button className="small-btn secondary" onClick={openDemandLetter}>Open demand letter</button>
                    <button className="small-btn secondary" onClick={exportJSON}>Export JSON</button>
                    <button className="small-btn secondary" onClick={() => scrollToDetails("evidence")}>Evidence log</button>
                    <button className="small-btn secondary" onClick={setSampleData}>Load sample</button>
                    <button className="small-btn secondary" onClick={resetAll}>Reset case</button>
                  </div>
                </div>
              </section>

              <section className="card section-card">
                <h2 className="section-title">Upgrade path</h2>
                <div className="pricing-stack">
                  <button className={`plan-card ${selectedPlan === "free" ? "selected" : ""}`} onClick={() => setSelectedPlan("free")}>
                    <div className="plan-name">Free</div>
                    <div className="plan-title">Track your case</div>
                    <div className="plan-copy">Planner, evidence log, deductions, communication history, and draft letter.</div>
                    <div className="plan-features">
                      <span>• Track dates and deductions</span>
                      <span>• Organize proof and notes</span>
                      <span>• Draft a basic demand letter</span>
                    </div>
                    <div className="plan-status">{selectedPlan === "free" ? "Current free mode" : "Use Free"}</div>
                  </button>

                  <button className={`plan-card popular ${selectedPlan === "pro" ? "selected" : ""}`} onClick={() => setSelectedPlan("pro")}>
                    <div className="plan-top"><span className="plan-pill">Most popular</span></div>
                    <div className="plan-name">Pro · $9</div>
                    <div className="plan-title">Send-ready output</div>
                    <div className="plan-copy">PDF export, cleaner demand letter formatting, and stronger dispute-ready summaries.</div>
                    <div className="plan-features">
                      <span>• Export a send-ready PDF</span>
                      <span>• Use a cleaner demand letter format</span>
                      <span>• Package your case more clearly</span>
                    </div>
                    <div className="plan-status">{selectedPlan === "pro" ? "Using Pro" : "Unlock Pro"}</div>
                  </button>

                  <button className={`plan-card ${selectedPlan === "bundle" ? "selected" : ""}`} onClick={() => setSelectedPlan("bundle")}>
                    <div className="plan-name">Bundle · $19</div>
                    <div className="plan-title">Full renter toolkit</div>
                    <div className="plan-copy">Everything in Pro, plus extra printable renter tools and move-out templates.</div>
                    <div className="plan-features">
                      <span>• Everything in Pro</span>
                      <span>• Extra printable tools</span>
                      <span>• Full toolkit for a move-out workflow</span>
                    </div>
                    <div className="plan-status">{selectedPlan === "bundle" ? "Using Bundle" : "Get bundle"}</div>
                  </button>
                </div>
              </section>
            </div>

            <section className="card timeline-card">
              <h2 className="section-title">Move-out timeline</h2>
              {timeline.length === 0 ? (
                <div className="timeline-empty">Add a move-out date to generate your follow-up timeline.</div>
              ) : (
                <div className="timeline-list">
                  {timeline.map((step, index) => (
                    <div className="timeline-item" key={`${step.title}-${index}`}>
                      <div>
                        <div className="timeline-item-title">{step.title}</div>
                        <div className="timeline-item-copy">{step.copy}</div>
                      </div>
                      <div className="timeline-date">{step.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card details-card" ref={detailsRef}>
              <h2 className="section-title">Case details</h2>
              <div className="tabs">
                <button className={`tab ${activeTab === "evidence" ? "active" : ""}`} onClick={() => setActiveTab("evidence")}>Evidence Log</button>
                <button className={`tab ${activeTab === "deductions" ? "active" : ""}`} onClick={() => setActiveTab("deductions")}>Deductions</button>
                <button className={`tab ${activeTab === "comms" ? "active" : ""}`} onClick={() => setActiveTab("comms")}>Comms Log</button>
                <button className={`tab ${activeTab === "demand" ? "active" : ""}`} onClick={() => setActiveTab("demand")}>Demand Letter</button>
              </div>

              {activeTab === "evidence" && (
                <div className="tab-panel">
                  {evidence.map((row, index) => (
                    <div className="entry-card" key={`evidence-${index}`}>
                      <div className="entry-grid">
                        <input className="input" value={row.date} onChange={(e) => updateEvidence(index, "date", e.target.value.replace(/[^\d-]/g, "").slice(0, 10))} placeholder="YYYY-MM-DD" />
                        <input className="input" value={row.area} onChange={(e) => updateEvidence(index, "area", e.target.value)} placeholder="Area / room" />
                        <input className="input" value={row.note} onChange={(e) => updateEvidence(index, "note", e.target.value)} placeholder="Short note about the condition" />
                        <button className="small-btn secondary" onClick={() => deleteEvidenceRow(index)}>Delete evidence</button>
                      </div>
                      <div className="file-row">
                        <label className="upload-label" htmlFor={`evidence-upload-${index}`}>Upload photo / video</label>
                        <input id={`evidence-upload-${index}`} className="hidden-input" type="file" accept="image/*,video/*" multiple onChange={(e) => handleEvidenceFiles(index, e.target.files)} />
                        {(row.files || []).map((file, fileIndex) => (
                          <div key={`${file.name}-${fileIndex}`} className="file-row" style={{marginTop:0}}>
                            <span className="file-chip">{file.name}</span>
                            <button className="small-btn secondary" onClick={() => removeEvidenceFile(index, fileIndex)}>Remove file</button>
                          </div>
                        ))}
                      </div>
                      {row.files && row.files.length > 0 && (
                        <div className="preview-grid">
                          {row.files.map((file, fileIndex) => {
                            const isImage = file.type?.startsWith("image");
                            const isVideo = file.type?.startsWith("video");
                            return (
                              <div className="preview-card" key={`${file.name}-${fileIndex}-preview`}>
                                {file.url ? (isImage ? <img src={file.url} alt={file.name} className="preview-thumb" /> : isVideo ? <video src={file.url} className="preview-video" controls /> : <div className="preview-thumb" />) : <div className="preview-thumb" />}
                                <div className="preview-caption">{file.name}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="wide-center"><button className="btn primary" onClick={addEvidenceRow}>Add evidence item</button></div>
                </div>
              )}

              {activeTab === "deductions" && (
                <div className="tab-panel">
                  {deductions.map((row, index) => (
                    <div className="entry-card" key={`deduction-${index}`}>
                      <div className="entry-grid triple">
                        <input className="input" value={row.item} onChange={(e) => updateDeductions(index, "item", e.target.value)} placeholder="Deduction item" />
                        <input className="input" value={row.amount} onChange={(e) => updateDeductions(index, "amount", e.target.value.replace(/[^\d]/g, ""))} placeholder="Amount" />
                        <select className="select" value={row.status} onChange={(e) => updateDeductions(index, "status", e.target.value)}>
                          <option>Disputed</option><option>Needs review</option><option>Accepted</option>
                        </select>
                        <button className="small-btn secondary" onClick={() => deleteDeductionRow(index)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  <div className="wide-center"><button className="btn primary" onClick={addDeductionRow}>Add deduction item</button></div>
                </div>
              )}

              {activeTab === "comms" && (
                <div className="tab-panel">
                  {comms.map((row, index) => (
                    <div className="entry-card" key={`comm-${index}`}>
                      <div className="entry-grid triple">
                        <input className="input" value={row.date} onChange={(e) => updateComms(index, "date", e.target.value.replace(/[^\d-]/g, "").slice(0, 10))} placeholder="YYYY-MM-DD" />
                        <input className="input" value={row.channel} onChange={(e) => updateComms(index, "channel", e.target.value)} placeholder="Email / Text / Phone" />
                        <input className="input" value={row.summary} onChange={(e) => updateComms(index, "summary", e.target.value)} placeholder="What was said?" />
                        <button className="small-btn secondary" onClick={() => deleteCommsRow(index)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  <div className="wide-center"><button className="btn primary" onClick={addCommsRow}>Add communication</button></div>
                </div>
              )}

              {activeTab === "demand" && (
                <div className="tab-panel">
                  <div className="entry-card">
                    <textarea className="textarea" value={demandLetterText} onChange={() => {}} readOnly style={{ minHeight: 340 }} />
                    <div className="file-row">
                      <button className="small-btn primary" onClick={openDemandLetter}>Open in new window</button>
                      <button className="small-btn secondary" onClick={() => downloadFile("demand-letter.txt", demandLetterText)}>Download .txt</button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="bottom-grid">
              <section className="info-card">
                <h2 className="section-title">State guidance</h2>
                <ul>
                  <li>State entered: <strong>{form.state || "Missing"}</strong>. Treat this as a reminder layer, not legal advice.</li>
                  <li>Check your state's usual deposit-return timeline and itemized deduction rules.</li>
                  <li>Confirm whether written notice, mailing address, or certified delivery matters where you are.</li>
                </ul>
              </section>

              <section className="info-card">
                <h2 className="section-title">Case snapshot</h2>
                <div className="snapshot-table">
                  <div>Deposit: <strong>{formatCurrency(depositNumber)}</strong></div>
                  <div>Claimed: <strong>{formatCurrency(claimedTotal)}</strong></div>
                  <div>Estimated return: <strong>{formatCurrency(estimatedReturn)}</strong></div>
                  <div>Evidence score: <strong>{evidenceScore} ({evidenceStrength})</strong></div>
                </div>
              </section>

              <section className="info-card large">
                <h2 className="section-title">Dispute readiness checklist</h2>
                <ul>
                  {readinessChecklist.map((item, index) => (
                    <li key={`${item.label}-${index}`}>{item.done ? "✓" : "•"} {item.label}</li>
                  ))}
                </ul>
              </section>

              <section className="info-card large">
                <h2 className="section-title">Why renters use this</h2>
                <p style={{margin:0, textAlign:"center", color:"#334565", lineHeight:1.8}}>
                  Security deposit disputes often go bad for simple reasons: missing dates, weak proof, scattered notes, and no clear follow-up record. Deposit Defender helps you keep those pieces together before the situation gets messy.
                </p>
              </section>

              <section className="info-card">
                <h2 className="section-title">What you can do with it</h2>
                <ul>
                  {featureList.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>

              <section className="info-card">
                <h2 className="section-title">Important note</h2>
                <p style={{margin:0, textAlign:"center", color:"#334565", lineHeight:1.8}}>
                  Deposit Defender is an organization tool, not legal advice. Rules vary by state, so users should always check local requirements before sending formal demands or relying on deadlines.
                </p>
              </section>

              <section className="info-card large">
                <h2 className="section-title">Start free. Upgrade when you need a send-ready case pack.</h2>
                <p style={{margin:"0 0 16px", textAlign:"center", color:"#334565", lineHeight:1.8}}>
                  Use Deposit Defender to organize the messy parts first, then unlock Pro or Bundle when you are ready to export, print, or send your case.
                </p>
                <div className="wide-center" style={{marginTop:0, gap:"12px", flexWrap:"wrap"}}>
                  <button className="btn primary" onClick={() => setSelectedPlan("free")}>Start free</button>
                  <button className="btn secondary" onClick={() => setSelectedPlan("pro")}>Upgrade to Pro</button>
                </div>
              </section>
            </div>

            <section className="info-card bundle-toolkit">
              <h2 className="section-title">Bundle-only toolkit</h2>
              {isBundle ? (
                <div className="bundle-box"><strong>Bundle unlocked.</strong><br />Move-out pack, roommate split sheet, budget planner, and printable case pack are available in this mode.</div>
              ) : (
                <div className="bundle-box locked"><strong>Locked on {isPro ? "Pro" : "Free"}.</strong><br />Switch to <strong>Bundle mode</strong> to unlock extra printable tools and worksheets.</div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
