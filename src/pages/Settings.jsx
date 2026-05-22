import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const SETTINGS_KEY = "smart-home-ui-settings";
const TEMP_THRESHOLD_KEY = "smart-home-temp-threshold";

const defaults = {
  temperatureThreshold: 32,
  refreshInterval: 5,
  chartPoints: 60,
  alertNotifications: true,
  compactMode: false,
  accentColor: "#145ea8",
  defaultTab: "overview"
};

const pageStyle = {
  minHeight: "100vh",
  padding: "32px 20px 48px",
  background:
    "radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 30%), linear-gradient(180deg, #e9f6ff 0%, #f8fafc 42%, #eef2ff 100%)",
  fontFamily: '"Segoe UI", sans-serif'
};
const shellStyle = { maxWidth: "1120px", margin: "0 auto" };
const heroStyle = {
  background: "linear-gradient(135deg, #0f172a, #145ea8)",
  color: "#f8fafc",
  borderRadius: "18px",
  padding: "28px",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)"
};
const cardStyle = {
  background: "rgba(255,255,255,0.94)",
  border: "1px solid #dbe6f3",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
  marginTop: "18px"
};
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #c7d2e4",
  borderRadius: 8,
  padding: "10px 12px",
  background: "#fff"
};
const buttonStyle = {
  border: 0,
  borderRadius: 8,
  padding: "10px 14px",
  background: "#145ea8",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
};

const loadSettings = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const legacyThreshold = Number(localStorage.getItem(TEMP_THRESHOLD_KEY));
    return {
      ...defaults,
      ...parsed,
      temperatureThreshold:
        Number.isFinite(legacyThreshold) && legacyThreshold > 0
          ? legacyThreshold
          : parsed.temperatureThreshold || defaults.temperatureThreshold
    };
  } catch {
    return defaults;
  }
};

function Settings() {
  const [settings, setSettings] = useState(loadSettings);

  const saveSetting = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    if (key === "temperatureThreshold") {
      localStorage.setItem(TEMP_THRESHOLD_KEY, value);
    }
  };

  const resetSettings = () => {
    setSettings(defaults);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaults));
    localStorage.setItem(TEMP_THRESHOLD_KEY, defaults.temperatureThreshold);
  };

  const behaviorLabel = useMemo(() => {
    const value = Number(settings.temperatureThreshold);
    if (value >= 35) return "High tolerance";
    if (value >= 30) return "Balanced";
    return "Sensitive";
  }, [settings.temperatureThreshold]);

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <section style={heroStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#7dd3fc", fontWeight: 800, letterSpacing: "0.08em" }}>SETTINGS</div>
              <h1 style={{ fontSize: "2.1rem", margin: "10px 0 12px" }}>Personalize dashboard behavior</h1>
              <p style={{ maxWidth: 720, margin: 0, color: "#dbeafe", lineHeight: 1.6 }}>
                These preferences are stored locally in the browser and affect dashboard defaults, charts, and visual density.
              </p>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link to="/" style={{ color: "#f8fafc" }}>Dashboard</Link>
              <Link to="/history" style={{ color: "#f8fafc" }}>History</Link>
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Automation</h2>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Temperature threshold</div>
              <input
                type="number"
                min="10"
                max="60"
                value={settings.temperatureThreshold}
                onChange={(event) => saveSetting("temperatureThreshold", Number(event.target.value))}
                style={inputStyle}
              />
            </label>
            <div style={{ marginTop: 14, color: "#475569" }}>Behavior: <strong>{behaviorLabel}</strong></div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Data refresh</h2>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Refresh interval seconds</div>
              <input
                type="number"
                min="2"
                max="60"
                value={settings.refreshInterval}
                onChange={(event) => saveSetting("refreshInterval", Number(event.target.value))}
                style={inputStyle}
              />
            </label>
            <label style={{ display: "block", marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Chart points</div>
              <input
                type="number"
                min="10"
                max="200"
                value={settings.chartPoints}
                onChange={(event) => saveSetting("chartPoints", Number(event.target.value))}
                style={inputStyle}
              />
            </label>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Display</h2>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Accent color</div>
              <input
                type="color"
                value={settings.accentColor}
                onChange={(event) => saveSetting("accentColor", event.target.value)}
                style={{ ...inputStyle, height: 44, padding: 6 }}
              />
            </label>
            <label style={{ display: "block", marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Default dashboard tab</div>
              <select
                value={settings.defaultTab}
                onChange={(event) => saveSetting("defaultTab", event.target.value)}
                style={inputStyle}
              >
                <option value="overview">Overview</option>
                <option value="homes">Homes</option>
                <option value="devices">Devices</option>
                <option value="automation">Automation</option>
                <option value="alerts">Alerts</option>
              </select>
            </label>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Toggles</h2>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <input
                type="checkbox"
                checked={settings.alertNotifications}
                onChange={(event) => saveSetting("alertNotifications", event.target.checked)}
              />
              Show alert notification cues
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(event) => saveSetting("compactMode", event.target.checked)}
              />
              Compact dashboard layout
            </label>
          </section>
        </div>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Current preference payload</h2>
          <pre style={{ margin: 0, overflowX: "auto", background: "#0f172a", color: "#e2e8f0", padding: 16, borderRadius: 10 }}>
            {JSON.stringify(settings, null, 2)}
          </pre>
          <button style={{ ...buttonStyle, marginTop: 16 }} onClick={resetSettings}>Reset defaults</button>
        </section>
      </div>
    </div>
  );
}

export default Settings;
