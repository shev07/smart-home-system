import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { applyThemeMode, defaultSettings, loadUiSettings, SETTINGS_KEY, TEMP_THRESHOLD_KEY } from "../utils/settings";

const getPageStyle = (themeMode) => ({
  minHeight: "100vh",
  padding: "32px 20px 48px",
  background:
    themeMode === "dark"
      ? "linear-gradient(180deg, #020617 0%, #0f172a 50%, #111827 100%)"
      : "radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 30%), linear-gradient(180deg, #e9f6ff 0%, #f8fafc 42%, #eef2ff 100%)",
  color: themeMode === "dark" ? "#e2e8f0" : "#0f172a",
  fontFamily: '"Segoe UI", sans-serif'
});
const shellStyle = { maxWidth: "1120px", margin: "0 auto" };
const heroStyle = {
  background: "linear-gradient(135deg, #0f172a, #145ea8)",
  color: "#f8fafc",
  borderRadius: "18px",
  padding: "28px",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)"
};
const getCardStyle = (themeMode) => ({
  background: themeMode === "dark" ? "rgba(15,23,42,0.94)" : "rgba(255,255,255,0.94)",
  border: themeMode === "dark" ? "1px solid #334155" : "1px solid #dbe6f3",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
  marginTop: "18px"
});
const getInputStyle = (themeMode) => ({
  width: "100%",
  boxSizing: "border-box",
  border: themeMode === "dark" ? "1px solid #475569" : "1px solid #c7d2e4",
  borderRadius: 8,
  padding: "10px 12px",
  background: themeMode === "dark" ? "#020617" : "#fff",
  color: themeMode === "dark" ? "#e2e8f0" : "#0f172a"
});
const buttonStyle = {
  border: 0,
  borderRadius: 8,
  padding: "10px 14px",
  background: "#145ea8",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
};

function Settings() {
  const [settings, setSettings] = useState(loadUiSettings);
  const pageStyle = getPageStyle(settings.themeMode);
  const cardStyle = getCardStyle(settings.themeMode);
  const inputStyle = getInputStyle(settings.themeMode);
  const mutedColor = settings.themeMode === "dark" ? "#94a3b8" : "#475569";

  useEffect(() => {
    applyThemeMode(settings.themeMode);
  }, [settings.themeMode]);

  const saveSetting = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    if (key === "temperatureThreshold") {
      localStorage.setItem(TEMP_THRESHOLD_KEY, value);
    }
    window.dispatchEvent(new Event("smart-home-settings-change"));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    localStorage.setItem(TEMP_THRESHOLD_KEY, defaultSettings.temperatureThreshold);
    window.dispatchEvent(new Event("smart-home-settings-change"));
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
                These preferences are stored locally in the browser and keep the dashboard simple to tune.
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
            <div style={{ marginTop: 14, color: mutedColor }}>Behavior: <strong>{behaviorLabel}</strong></div>
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
            <h2 style={{ marginTop: 0 }}>Theme</h2>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Light or dark mode</div>
              <select
                value={settings.themeMode}
                onChange={(event) => saveSetting("themeMode", event.target.value)}
                style={inputStyle}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <div style={{ marginTop: 14, color: mutedColor }}>
              Theme applies immediately across the app.
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Alerts</h2>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <input
                type="checkbox"
                checked={settings.alertNotifications}
                onChange={(event) => saveSetting("alertNotifications", event.target.checked)}
              />
              Show alert notification cues
            </label>
          </section>
        </div>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Reset</h2>
          <div style={{ color: mutedColor }}>Restore the default threshold, refresh settings, alerts, and theme.</div>
          <button style={{ ...buttonStyle, marginTop: 16 }} onClick={resetSettings}>Reset defaults</button>
        </section>
      </div>
    </div>
  );
}

export default Settings;
