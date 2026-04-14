import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   Omar — Performance Recovery Tracker
   iOS-native PWA · Dark Mode Performance Lab Aesthetic
   ═══════════════════════════════════════════════════════════════ */

// ── Theme System ────────────────────────────────────────────
const THEMES = {
  dark: {
    primary: "#3B6BFF",
    primarySolid: "#004DFF",
    accent: "#00D8EA",
    bg: "#0A0C1A",
    card: "#111428",
    elevated: "#161A33",
    text: "#FFFFFF",
    textSecondary: "#AAB0C5",
    textMuted: "#6B7280",
    border: "#1F2440",
    divider: "#1A1F36",
    glowBlue: "rgba(0, 77, 255, 0.35)",
    glowAccent: "rgba(0, 216, 234, 0.25)",
    gradient: "linear-gradient(135deg, #00D8EA 0%, #3B6BFF 100%)",
    gradientBtn: "linear-gradient(135deg, #00D8EA 0%, #004DFF 100%)",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    inputBg: "#161A33",
    inputBorder: "#1F2440",
    navBg: "rgba(10, 12, 26, 0.92)",
    progressTrack: "#1F2440",
  },
  light: {
    primary: "#004DFF",
    primarySolid: "#004DFF",
    accent: "#00D8EA",
    bg: "#F5F9FF",
    card: "#FFFFFF",
    elevated: "#EEF3FF",
    text: "#0F1123",
    textSecondary: "#6E7385",
    textMuted: "#A0A4B8",
    border: "#E3E8F2",
    divider: "#E3E8F2",
    glowBlue: "rgba(0, 77, 255, 0.12)",
    glowAccent: "rgba(0, 216, 234, 0.1)",
    gradient: "linear-gradient(135deg, #00D8EA 0%, #004DFF 100%)",
    gradientBtn: "linear-gradient(135deg, #00D8EA 0%, #004DFF 100%)",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    inputBg: "#FFFFFF",
    inputBorder: "#D9E2F1",
    navBg: "rgba(245, 249, 255, 0.92)",
    progressTrack: "#E3E8F2",
  },
};

// ── Categories ──────────────────────────────────────────────
const CATEGORIES = [
  { id: "recovery", label: "Recovery", emoji: "💧", icon: "recovery" },
  { id: "training", label: "Training", emoji: "⚡", icon: "training" },
  { id: "sleep", label: "Sleep", emoji: "🌙", icon: "sleep" },
  { id: "nutrition", label: "Nutrition", emoji: "🥗", icon: "nutrition" },
  { id: "hydration", label: "Hydration", emoji: "💦", icon: "hydration" },
  { id: "mindset", label: "Mindset", emoji: "🧠", icon: "mindset" },
];

// ── Helpers ──────────────────────────────────────────────────
const getToday = () => new Date().toISOString().split("T")[0];
const formatDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const getLast7 = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
};

// ── SVG Icons ───────────────────────────────────────────────
const NavIcons = {
  dashboard: (c) => <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2" stroke={c} strokeWidth="1.6"/><rect x="13" y="3" width="8" height="4" rx="2" stroke={c} strokeWidth="1.6"/><rect x="13" y="9" width="8" height="12" rx="2" stroke={c} strokeWidth="1.6"/><rect x="3" y="13" width="8" height="8" rx="2" stroke={c} strokeWidth="1.6"/></svg>,
  log: (c) => <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.6"/><path d="M12 8v8M8 12h8" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  stats: (c) => <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M3 20h18M5 20V13M9 20V10M13 20V14M17 20V8M21 20V5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  profile: (c) => <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.6"/><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
};

const Trash = (c) => <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2M19 6l-1 14c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2L5 6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>;

// ═════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════
export default function RecovrdApp() {
  const [mode, setMode] = useState("dark");
  const [tab, setTab] = useState("dashboard");
  const [entries, setEntries] = useState(() => {
    try { const d = localStorage.getItem("recovrd-data"); return d ? JSON.parse(d) : []; } catch { return []; }
  });
  const [mounted, setMounted] = useState(false);
  const t = THEMES[mode];

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    try { localStorage.setItem("recovrd-data", JSON.stringify(entries)); } catch {}
  }, [entries]);

  const addEntry = useCallback((entry) => {
    setEntries(prev => [{ ...entry, id: Date.now(), date: getToday(), ts: Date.now() }, ...prev]);
    setTab("dashboard");
  }, []);
  const deleteEntry = useCallback((id) => setEntries(prev => prev.filter(e => e.id !== id)), []);
  const clearAll = useCallback(() => setEntries([]), []);

  const todayEntries = useMemo(() => entries.filter(e => e.date === getToday()), [entries]);

  // Dynamic styles
  const shell = {
    fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif',
    WebkitFontSmoothing: "antialiased",
    background: t.bg,
    minHeight: "100vh",
    maxWidth: 430,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    color: t.text,
    overflow: "hidden",
  };

  const navStyle = {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    background: t.navBg,
    backdropFilter: "saturate(180%) blur(24px)",
    WebkitBackdropFilter: "saturate(180%) blur(24px)",
    borderTop: `0.5px solid ${t.border}`,
    zIndex: 100,
    paddingBottom: "env(safe-area-inset-bottom, 8px)",
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: NavIcons.dashboard },
    { id: "log", label: "Log", icon: NavIcons.log },
    { id: "stats", label: "Stats", icon: NavIcons.stats },
    { id: "profile", label: "Profile", icon: NavIcons.profile },
  ];

  return (
    <div style={shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, button { font-family: "DM Sans", -apple-system, system-ui, sans-serif; }
        input::placeholder, textarea::placeholder { color: ${t.textMuted}; }
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 20px ${t.glowAccent}, 0 0 40px ${t.glowBlue}; } 50% { box-shadow: 0 0 30px ${t.glowAccent}, 0 0 60px ${t.glowBlue}; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .glow-card { box-shadow: 0 0 0 0.5px ${t.border}, 0 4px 24px ${t.glowBlue}, 0 1px 4px rgba(0,0,0,0.2); }
        .glow-accent { box-shadow: 0 0 20px ${t.glowAccent}, 0 0 40px ${t.glowBlue}; }
      `}</style>

      {/* Safe area top */}
      <div style={{ height: "env(safe-area-inset-top, 20px)", flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", paddingBottom: 110 }}>
        {tab === "dashboard" && <Dashboard t={t} entries={entries} todayEntries={todayEntries} deleteEntry={deleteEntry} mounted={mounted} mode={mode} />}
        {tab === "log" && <LogEntry t={t} onAdd={addEntry} mode={mode} />}
        {tab === "stats" && <Stats t={t} entries={entries} mode={mode} />}
        {tab === "profile" && <Profile t={t} mode={mode} setMode={setMode} clearAll={clearAll} count={entries.length} />}
      </div>

      {/* Bottom Nav */}
      <div style={navStyle}>
        <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0 4px" }}>
          {tabs.map(item => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} style={{
                background: "none", border: "none", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 18px",
                WebkitTapHighlightColor: "transparent", position: "relative",
              }}>
                {active && <div style={{
                  position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                  width: 20, height: 3, borderRadius: 2, background: t.gradient,
                  boxShadow: `0 0 8px ${t.glowAccent}`,
                }} />}
                {item.icon(active ? t.accent : t.textMuted)}
                <span style={{
                  fontSize: 10, fontWeight: active ? 600 : 400,
                  color: active ? t.accent : t.textMuted,
                  fontFamily: '"DM Sans", sans-serif',
                }}>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ width: 134, height: 5, borderRadius: 100, background: t.text, margin: "4px auto", opacity: 0.12 }} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════
function Dashboard({ t, entries, todayEntries, deleteEntry, mounted, mode }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Recovery score (simple algo)
  const score = Math.min(100, Math.round(todayEntries.length * 15 + 25));
  const scoreColor = score >= 80 ? t.success : score >= 50 ? t.warning : t.danger;

  return (
    <div style={{ padding: "12px 0", animation: "fadeUp 0.5s ease both" }}>
      {/* Header */}
      <div style={{ padding: "0 20px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 15, color: t.textSecondary, fontWeight: 500, fontFamily: '"DM Sans"', marginBottom: 4 }}>{greeting}</p>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, fontFamily: '"DM Sans"', color: t.text }}>Omar</h1>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: t.elevated, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            ⚡
          </div>
        </div>
        <p style={{ fontSize: 13, color: t.textMuted, fontFamily: '"DM Sans"', marginTop: 2 }}>{formatDate(getToday())}</p>
      </div>

      {/* Recovery Score Card */}
      <div style={{
        margin: "0 20px 20px", padding: 24, borderRadius: 24,
        background: mode === "dark" ? t.card : t.card,
        border: `1px solid ${t.border}`,
        position: "relative", overflow: "hidden",
      }} className="glow-card">
        {/* Gradient accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: t.gradient }} />
        {/* Subtle glow orb */}
        <div style={{
          position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%",
          background: `radial-gradient(circle, ${t.glowAccent} 0%, transparent 70%)`, pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div>
            <p style={{ fontSize: 13, color: t.textSecondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1.2, fontFamily: '"DM Sans"' }}>Recovery Score</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 56, fontWeight: 700, fontFamily: '"DM Sans"', color: t.text, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 20, fontWeight: 500, color: t.textMuted }}>/100</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: scoreColor, boxShadow: `0 0 8px ${scoreColor}` }} />
              <span style={{ fontSize: 13, color: scoreColor, fontWeight: 600, fontFamily: '"DM Sans"' }}>
                {score >= 80 ? "Optimal" : score >= 50 ? "Moderate" : "Low"} Recovery
              </span>
            </div>
          </div>

          {/* Circular gauge */}
          <div style={{ position: "relative", width: 80, height: 80 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke={t.progressTrack} strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="url(#recovrdGrad)" strokeWidth="6"
                strokeDasharray={`${(score / 100) * 213.6} 213.6`}
                strokeLinecap="round" transform="rotate(-90 40 40)"
                style={{ filter: `drop-shadow(0 0 6px ${t.glowAccent})`, transition: "stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)" }} />
              <defs>
                <linearGradient id="recovrdGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00D8EA" />
                  <stop offset="100%" stopColor={mode === "dark" ? "#3B6BFF" : "#004DFF"} />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: t.accent, fontFamily: '"DM Sans"' }}>{todayEntries.length} logs</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 20, height: 6, borderRadius: 3, background: t.progressTrack, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3, background: t.gradient, width: `${score}%`,
            transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: `0 0 12px ${t.glowAccent}`,
          }} />
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 20px", marginBottom: 24 }}>
        {[
          { label: "Today", val: todayEntries.length, icon: "📊" },
          { label: "This Week", val: entries.filter(e => { const d = new Date(); d.setDate(d.getDate() - 7); return new Date(e.date) >= d; }).length, icon: "📅" },
          { label: "Streak", val: (() => { let s = 0; const d = new Date(); while (entries.some(e => e.date === d.toISOString().split("T")[0])) { s++; d.setDate(d.getDate() - 1); } return s; })(), icon: "🔥" },
        ].map(s => (
          <div key={s.label} style={{
            background: t.card, border: `1px solid ${t.border}`, borderRadius: 18,
            padding: "16px 14px", textAlign: "center",
          }}>
            <p style={{ fontSize: 20, margin: "0 0 6px" }}>{s.icon}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: t.text, fontFamily: '"DM Sans"', margin: 0 }}>{s.val}</p>
            <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, marginTop: 2, fontFamily: '"DM Sans"' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category Chips */}
      <div style={{ padding: "0 20px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: '"DM Sans"' }}>Categories</p>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "0 20px", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
        {CATEGORIES.map(cat => {
          const count = todayEntries.filter(e => e.category === cat.id).length;
          return (
            <div key={cat.id} style={{
              minWidth: 82, background: t.card, border: `1px solid ${count > 0 ? t.accent + "40" : t.border}`,
              borderRadius: 16, padding: "14px 10px", textAlign: "center",
              boxShadow: count > 0 ? `0 0 16px ${t.glowAccent}` : "none",
              transition: "all 0.3s ease",
            }}>
              <span style={{ fontSize: 24 }}>{cat.emoji}</span>
              <p style={{ fontSize: 18, fontWeight: 700, margin: "6px 0 2px", color: count > 0 ? t.accent : t.text, fontFamily: '"DM Sans"' }}>{count}</p>
              <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 500, fontFamily: '"DM Sans"' }}>{cat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Entries */}
      <div style={{ padding: "24px 20px 8px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, fontFamily: '"DM Sans"' }}>Recent Activity</p>
      </div>

      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: t.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 12, filter: "grayscale(0.3)" }}>⚡</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: t.textSecondary, fontFamily: '"DM Sans"' }}>No entries yet</p>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4, fontFamily: '"DM Sans"' }}>Tap Log to start tracking</p>
        </div>
      ) : (
        <div style={{ padding: "0 20px 20px" }}>
          {entries.slice(0, 25).map((entry, i) => {
            const cat = CATEGORIES.find(c => c.id === entry.category) || CATEGORIES[0];
            return (
              <div key={entry.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: t.card, border: `1px solid ${t.border}`, borderRadius: 16,
                padding: "14px 16px", marginBottom: 8,
                animation: "fadeUp 0.4s ease both", animationDelay: `${i * 30}ms`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: `${t.accent}12`, border: `1px solid ${t.accent}20`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                  }}>{cat.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: t.text, fontFamily: '"DM Sans"', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.title}</p>
                    <p style={{ fontSize: 12, color: t.textMuted, marginTop: 2, fontFamily: '"DM Sans"' }}>
                      {cat.label} · <span style={{ color: t.accent, fontWeight: 600 }}>{entry.value}</span> {entry.unit}
                      {entry.date !== getToday() && <span> · {formatDate(entry.date)}</span>}
                    </p>
                  </div>
                </div>
                <button onClick={() => deleteEntry(entry.id)} style={{
                  background: "none", border: "none", padding: 8, cursor: "pointer",
                  WebkitTapHighlightColor: "transparent", opacity: 0.5, flexShrink: 0,
                }}>{Trash(t.danger)}</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// LOG ENTRY
// ═════════════════════════════════════════════════════════════
function LogEntry({ t, onAdd, mode }) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [notes, setNotes] = useState("");
  const [intensity, setIntensity] = useState(5);
  const titleRef = useRef(null);
  const canSave = category && title && value;

  const inputStyle = {
    flex: 1, border: "none", background: "none", fontSize: 16, color: t.text,
    textAlign: "right", outline: "none", padding: "16px 0", fontFamily: '"DM Sans"',
    WebkitAppearance: "none", fontWeight: 500,
  };

  return (
    <div style={{ padding: "12px 0", animation: "fadeUp 0.4s ease both" }}>
      <div style={{ padding: "0 20px", marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, fontFamily: '"DM Sans"', color: t.text }}>New Entry</h1>
        <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4, fontFamily: '"DM Sans"' }}>Track your performance & recovery</p>
      </div>

      {/* Category Grid */}
      <div style={{ padding: "0 20px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: '"DM Sans"' }}>Category</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.id;
            return (
              <button key={cat.id} onClick={() => { setCategory(cat.id); setTimeout(() => titleRef.current?.focus(), 150); }} style={{
                background: active ? t.card : t.elevated,
                border: `1.5px solid ${active ? t.accent : t.border}`,
                borderRadius: 18, padding: "18px 10px", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 6, cursor: "pointer",
                WebkitTapHighlightColor: "transparent", transition: "all 0.2s ease",
                boxShadow: active ? `0 0 20px ${t.glowAccent}, 0 0 40px ${t.glowBlue}` : "none",
                transform: active ? "scale(0.97)" : "scale(1)",
              }}>
                <span style={{ fontSize: 28 }}>{cat.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: active ? t.accent : t.textSecondary, fontFamily: '"DM Sans"' }}>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ padding: "28px 20px 0" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: '"DM Sans"' }}>Details</p>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, overflow: "hidden" }}>
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", padding: "4px 18px", minHeight: 54 }}>
            <label style={{ fontSize: 15, color: t.textSecondary, fontWeight: 500, flexShrink: 0, marginRight: 12, fontFamily: '"DM Sans"' }}>Title</label>
            <input ref={titleRef} type="text" placeholder="e.g. Morning run" value={title}
              onChange={e => setTitle(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ height: 0.5, background: t.divider, marginLeft: 18 }} />

          {/* Value */}
          <div style={{ display: "flex", alignItems: "center", padding: "4px 18px", minHeight: 54 }}>
            <label style={{ fontSize: 15, color: t.textSecondary, fontWeight: 500, flexShrink: 0, marginRight: 12, fontFamily: '"DM Sans"' }}>Value</label>
            <input type="number" inputMode="decimal" placeholder="0" value={value}
              onChange={e => setValue(e.target.value)} style={{ ...inputStyle, fontSize: 24, fontWeight: 700, color: t.accent, flex: "0 0 120px" }} />
          </div>
          <div style={{ height: 0.5, background: t.divider, marginLeft: 18 }} />

          {/* Unit */}
          <div style={{ display: "flex", alignItems: "center", padding: "4px 18px", minHeight: 54 }}>
            <label style={{ fontSize: 15, color: t.textSecondary, fontWeight: 500, flexShrink: 0, marginRight: 12, fontFamily: '"DM Sans"' }}>Unit</label>
            <input type="text" placeholder="km, reps, hrs, ml" value={unit}
              onChange={e => setUnit(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Intensity Slider */}
      <div style={{ padding: "24px 20px 0" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: '"DM Sans"' }}>Intensity</p>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: t.textSecondary, fontFamily: '"DM Sans"' }}>Level</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: t.accent, fontFamily: '"DM Sans"' }}>{intensity}/10</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} onClick={() => setIntensity(n)} style={{
                flex: 1, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
                background: n <= intensity ? t.gradient : t.progressTrack,
                opacity: n <= intensity ? 1 : 0.4,
                boxShadow: n <= intensity ? `0 0 8px ${t.glowAccent}` : "none",
                transition: "all 0.15s ease",
                WebkitTapHighlightColor: "transparent",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div style={{ padding: "24px 20px 0" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: '"DM Sans"' }}>Notes</p>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, overflow: "hidden" }}>
          <textarea placeholder="Additional details..." value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            style={{ width: "100%", border: "none", background: "none", fontSize: 15, color: t.text,
              outline: "none", padding: "16px 18px", fontFamily: '"DM Sans"', resize: "none", minHeight: 90 }} />
        </div>
      </div>

      {/* Save */}
      <div style={{ padding: "32px 20px 48px" }}>
        <button onClick={() => canSave && onAdd({ category, title, value, unit: unit || "units", notes, intensity })}
          disabled={!canSave} style={{
            width: "100%", padding: "18px", borderRadius: 16, border: "none",
            background: canSave ? t.gradientBtn : t.progressTrack,
            color: canSave ? "#fff" : t.textMuted, fontSize: 17, fontWeight: 700, cursor: canSave ? "pointer" : "default",
            fontFamily: '"DM Sans"', letterSpacing: -0.2, WebkitTapHighlightColor: "transparent",
            boxShadow: canSave ? `0 0 24px ${t.glowAccent}, 0 4px 16px ${t.glowBlue}` : "none",
            transition: "all 0.3s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
          <span style={{ fontSize: 20 }}>⚡</span> Save Entry
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// STATS
// ═════════════════════════════════════════════════════════════
function Stats({ t, entries, mode }) {
  const last7 = getLast7();
  const daily = last7.map(d => ({
    date: d, count: entries.filter(e => e.date === d).length,
    label: new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }),
  }));
  const max = Math.max(...daily.map(d => d.count), 1);

  const catStats = CATEGORIES.map(c => ({
    ...c, total: entries.filter(e => e.category === c.id).length,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const totalEntries = entries.length;

  return (
    <div style={{ padding: "12px 0", animation: "fadeUp 0.4s ease both" }}>
      <div style={{ padding: "0 20px", marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, fontFamily: '"DM Sans"', color: t.text }}>Statistics</h1>
        <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4, fontFamily: '"DM Sans"' }}>Performance overview</p>
      </div>

      {/* Weekly Chart */}
      <div style={{ padding: "0 20px", marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: '"DM Sans"' }}>Last 7 Days</p>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 22, padding: "24px 18px" }} className="glow-card">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 160, gap: 8 }}>
            {daily.map(d => {
              const isToday = d.date === getToday();
              const h = Math.max((d.count / max) * 100, 4);
              return (
                <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isToday ? t.accent : t.text, fontFamily: '"DM Sans"' }}>{d.count}</span>
                  <div style={{
                    width: "100%", maxWidth: 36, height: `${h}%`, borderRadius: 10,
                    background: isToday ? t.gradient : `${t.accent}20`,
                    boxShadow: isToday ? `0 0 16px ${t.glowAccent}` : "none",
                    transition: "height 0.8s cubic-bezier(0.16,1,0.3,1)",
                    border: isToday ? "none" : `1px solid ${t.accent}15`,
                  }} />
                  <span style={{ fontSize: 11, color: isToday ? t.accent : t.textMuted, fontWeight: 600, fontFamily: '"DM Sans"' }}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {catStats.length > 0 && (
        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: '"DM Sans"' }}>By Category</p>
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 22, overflow: "hidden" }}>
            {catStats.map((cat, i) => (
              <div key={cat.id}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${t.accent}12`, border: `1px solid ${t.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{cat.emoji}</div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: t.text, fontFamily: '"DM Sans"' }}>{cat.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 80, height: 6, borderRadius: 3, background: t.progressTrack, overflow: "hidden" }}>
                      <div style={{ width: `${(cat.total / totalEntries) * 100}%`, height: "100%", borderRadius: 3, background: t.gradient, boxShadow: `0 0 8px ${t.glowAccent}`, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: t.accent, minWidth: 30, textAlign: "right", fontFamily: '"DM Sans"' }}>{cat.total}</span>
                  </div>
                </div>
                {i < catStats.length - 1 && <div style={{ height: 0.5, background: t.divider, marginLeft: 72 }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Average Intensity */}
      {entries.length > 0 && (
        <div style={{ padding: "0 20px 30px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: '"DM Sans"' }}>Average Intensity</p>
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 22, padding: "24px 20px", textAlign: "center" }} className="glow-card">
            <span style={{ fontSize: 48, fontWeight: 700, fontFamily: '"DM Sans"', background: t.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {(entries.reduce((a, e) => a + (e.intensity || 5), 0) / entries.length).toFixed(1)}
            </span>
            <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4, fontFamily: '"DM Sans"' }}>out of 10</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PROFILE / SETTINGS
// ═════════════════════════════════════════════════════════════
function Profile({ t, mode, setMode, clearAll, count }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div style={{ padding: "12px 0", animation: "fadeUp 0.4s ease both" }}>
      <div style={{ padding: "0 20px", marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, fontFamily: '"DM Sans"', color: t.text }}>Profile</h1>
        <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4, fontFamily: '"DM Sans"' }}>Settings & preferences</p>
      </div>

      {/* Avatar */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24, margin: "0 auto",
          background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, boxShadow: `0 0 30px ${t.glowAccent}, 0 0 60px ${t.glowBlue}`,
        }}>⚡</div>
        <p style={{ fontSize: 20, fontWeight: 700, color: t.text, marginTop: 14, fontFamily: '"DM Sans"' }}>Athlete</p>
        <p style={{ fontSize: 13, color: t.textMuted, fontFamily: '"DM Sans"' }}>Omar Performance Tracker</p>
      </div>

      {/* Appearance */}
      <div style={{ padding: "0 20px", marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: '"DM Sans"' }}>Appearance</p>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{mode === "dark" ? "🌙" : "☀️"}</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: t.text, fontFamily: '"DM Sans"' }}>
                {mode === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            {/* Toggle */}
            <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} style={{
              width: 52, height: 32, borderRadius: 16, border: "none", cursor: "pointer",
              background: mode === "dark" ? t.gradient : t.progressTrack,
              position: "relative", WebkitTapHighlightColor: "transparent",
              boxShadow: mode === "dark" ? `0 0 12px ${t.glowAccent}` : "none",
              transition: "all 0.3s ease",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 13, background: "#fff",
                position: "absolute", top: 3,
                left: mode === "dark" ? 23 : 3,
                transition: "left 0.3s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* Data */}
      <div style={{ padding: "0 20px", marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: '"DM Sans"' }}>Data</p>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
            <span style={{ fontSize: 15, color: t.text, fontFamily: '"DM Sans"' }}>Total Entries</span>
            <span style={{ fontSize: 15, color: t.textMuted, fontWeight: 600, fontFamily: '"DM Sans"' }}>{count}</span>
          </div>
          <div style={{ height: 0.5, background: t.divider, marginLeft: 18 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
            <span style={{ fontSize: 15, color: t.text, fontFamily: '"DM Sans"' }}>Storage</span>
            <span style={{ fontSize: 15, color: t.textMuted, fontWeight: 600, fontFamily: '"DM Sans"' }}>Local Device</span>
          </div>
          <div style={{ height: 0.5, background: t.divider, marginLeft: 18 }} />
          <button onClick={() => setShowConfirm(true)} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px", background: "none", border: "none", cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}>
            <span style={{ fontSize: 15, color: t.danger, fontWeight: 500, fontFamily: '"DM Sans"' }}>Clear All Data</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 20px 40px" }}>
        <p style={{ fontSize: 18, fontWeight: 700, fontFamily: '"DM Sans"', background: t.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2 }}>Omar</p>
        <p style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontFamily: '"DM Sans"' }}>v1.0 · Performance Recovery Tracker</p>
        <p style={{ fontSize: 11, color: t.textMuted, marginTop: 2, fontFamily: '"DM Sans"' }}>Optimised for iPhone · Add to Home Screen</p>
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(8px)" }}
          onClick={() => setShowConfirm(false)}>
          <div style={{ background: mode === "dark" ? "rgba(22,26,51,0.98)" : "rgba(255,255,255,0.98)", backdropFilter: "blur(40px)", borderRadius: 16, width: 280, overflow: "hidden", border: `1px solid ${t.border}` }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "22px 22px 18px", textAlign: "center" }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: t.text, fontFamily: '"DM Sans"' }}>Clear All Data?</p>
              <p style={{ fontSize: 13, color: t.textMuted, marginTop: 8, lineHeight: 1.5, fontFamily: '"DM Sans"' }}>
                This will permanently delete all {count} entries. This cannot be undone.
              </p>
            </div>
            <div style={{ borderTop: `0.5px solid ${t.divider}` }}>
              <button onClick={() => setShowConfirm(false)} style={{
                width: "100%", padding: "14px", background: "none", border: "none",
                borderBottom: `0.5px solid ${t.divider}`, fontSize: 17, fontWeight: 600,
                color: t.accent, cursor: "pointer", fontFamily: '"DM Sans"',
                WebkitTapHighlightColor: "transparent",
              }}>Cancel</button>
              <button onClick={() => { clearAll(); setShowConfirm(false); }} style={{
                width: "100%", padding: "14px", background: "none", border: "none",
                fontSize: 17, fontWeight: 400, color: t.danger, cursor: "pointer",
                fontFamily: '"DM Sans"', WebkitTapHighlightColor: "transparent",
              }}>Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
