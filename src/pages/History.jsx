import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { devicesApi, homesApi, sensorsApi } from "../api/platform";

const pageStyle = {
  minHeight: "100vh",
  padding: "32px 20px 48px",
  background:
    "radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 30%), linear-gradient(180deg, #e9f6ff 0%, #f8fafc 42%, #eef2ff 100%)",
  fontFamily: '"Segoe UI", sans-serif'
};
const shellStyle = { maxWidth: "1180px", margin: "0 auto" };
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
const tableStyle = { width: "100%", borderCollapse: "collapse", minWidth: 720 };
const thStyle = { textAlign: "left", padding: "12px 14px", background: "#eaf2fb", color: "#172033" };
const tdStyle = { padding: "12px 14px", borderTop: "1px solid #e2e8f0" };

const getId = (value) => value?._id || value?.id || value;
const asList = (value, key) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

function History() {
  const [homes, setHomes] = useState([]);
  const [homeId, setHomeId] = useState("");
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [sensorDevices, setSensorDevices] = useState([]);
  const [sensorDeviceId, setSensorDeviceId] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHomes = async () => {
      try {
        const nextHomes = asList(await homesApi.listMine());
        setHomes(nextHomes);
        setHomeId((current) => current || getId(nextHomes[0]) || "");
      } catch (loadError) {
        setError(loadError.message);
      }
    };
    loadHomes();
  }, []);

  useEffect(() => {
    if (!homeId) {
      const timeout = setTimeout(() => {
        setDevices([]);
        setDeviceId("");
      }, 0);
      return () => clearTimeout(timeout);
    }

    const loadDevices = async () => {
      try {
        const nextDevices = asList(await devicesApi.list(homeId));
        setDevices(nextDevices);
        setDeviceId(getId(nextDevices[0]) || "");
      } catch (loadError) {
        setError(loadError.message);
      }
    };
    loadDevices();
  }, [homeId]);

  useEffect(() => {
    if (!deviceId) {
      const timeout = setTimeout(() => {
        setSensorDevices([]);
        setSensorDeviceId("");
      }, 0);
      return () => clearTimeout(timeout);
    }

    const loadSensors = async () => {
      try {
        const nextSensors = asList(await sensorsApi.devices(deviceId));
        setSensorDevices(nextSensors);
        setSensorDeviceId(getId(nextSensors[0]) || "");
      } catch (loadError) {
        setError(loadError.message);
      }
    };
    loadSensors();
  }, [deviceId]);

  useEffect(() => {
    if (!sensorDeviceId) {
      const timeout = setTimeout(() => setHistory([]), 0);
      return () => clearTimeout(timeout);
    }

    const loadHistory = async () => {
      try {
        const payload = await sensorsApi.history(sensorDeviceId, { limit: 60 });
        setHistory(asList(payload, "data"));
        setError("");
      } catch (loadError) {
        setError(loadError.message);
      }
    };

    loadHistory();
    const interval = setInterval(loadHistory, 5000);
    return () => clearInterval(interval);
  }, [sensorDeviceId]);

  const selectedSensor = sensorDevices.find((item) => getId(item) === sensorDeviceId);
  const chartData = history
    .slice()
    .reverse()
    .map((item) => ({
      time: new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: Number(item.value),
      unit: item.unit || selectedSensor?.unit || ""
    }));
  const latestRecord = history[0];
  const averageValue = useMemo(
    () => history.length ? history.reduce((sum, item) => sum + Number(item.value || 0), 0) / history.length : 0,
    [history]
  );
  const minValue = history.length ? Math.min(...history.map((item) => Number(item.value))) : null;
  const maxValue = history.length ? Math.max(...history.map((item) => Number(item.value))) : null;

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <section style={heroStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#7dd3fc", fontWeight: 800, letterSpacing: "0.08em" }}>SENSOR HISTORY</div>
              <h1 style={{ fontSize: "2.1rem", margin: "10px 0 12px" }}>Live sensor trend chart</h1>
              <p style={{ maxWidth: 720, margin: 0, color: "#dbeafe", lineHeight: 1.6 }}>
                Select a home, device, and sensor channel to view real backend readings as a line chart and log table.
              </p>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link to="/" style={{ color: "#f8fafc" }}>Dashboard</Link>
              <Link to="/settings" style={{ color: "#f8fafc" }}>Settings</Link>
            </div>
          </div>
        </section>

        {error && <section style={{ ...cardStyle, borderColor: "#fecaca", color: "#991b1b" }}>{error}</section>}

        <section style={cardStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Home</div>
              <select style={inputStyle} value={homeId} onChange={(event) => setHomeId(event.target.value)}>
                <option value="">Choose home</option>
                {homes.map((home) => <option key={getId(home)} value={getId(home)}>{home.name}</option>)}
              </select>
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Device</div>
              <select style={inputStyle} value={deviceId} onChange={(event) => setDeviceId(event.target.value)}>
                <option value="">Choose device</option>
                {devices.map((device) => <option key={getId(device)} value={getId(device)}>{device.name}</option>)}
              </select>
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Sensor channel</div>
              <select style={inputStyle} value={sensorDeviceId} onChange={(event) => setSensorDeviceId(event.target.value)}>
                <option value="">Choose sensor</option>
                {sensorDevices.map((sensor) => <option key={getId(sensor)} value={getId(sensor)}>{sensor.name || sensor.sensorType}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section style={cardStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
            <div><div style={{ color: "#64748b" }}>Records</div><strong style={{ fontSize: "2rem" }}>{history.length}</strong></div>
            <div><div style={{ color: "#64748b" }}>Latest</div><strong>{latestRecord ? `${latestRecord.value} ${latestRecord.unit}` : "--"}</strong></div>
            <div><div style={{ color: "#64748b" }}>Average</div><strong>{history.length ? averageValue.toFixed(2) : "--"}</strong></div>
            <div><div style={{ color: "#64748b" }}>Min / Max</div><strong>{history.length ? `${minValue} / ${maxValue}` : "--"}</strong></div>
          </div>
        </section>

        <section style={{ ...cardStyle, overflowX: "auto" }}>
          <h2 style={{ marginTop: 0 }}>Trend chart</h2>
          {chartData.length ? (
            <div style={{ height: 360, minWidth: 680 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 14, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip formatter={(value, _name, item) => [`${value} ${item.payload.unit || ""}`, selectedSensor?.name || "Value"]} />
                  <Line type="monotone" dataKey="value" stroke="#145ea8" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ color: "#64748b" }}>No sensor readings yet.</div>
          )}
        </section>

        <section style={{ ...cardStyle, overflowX: "auto" }}>
          <h2 style={{ marginTop: 0 }}>Sensor log</h2>
          {history.length ? (
            <table style={tableStyle}>
              <thead><tr><th style={thStyle}>Time</th><th style={thStyle}>Value</th><th style={thStyle}>Unit</th></tr></thead>
              <tbody>
                {history.map((item) => (
                  <tr key={getId(item) || item.createdAt}>
                    <td style={tdStyle}>{new Date(item.createdAt).toLocaleString()}</td>
                    <td style={tdStyle}>{item.value}</td>
                    <td style={tdStyle}>{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: "#64748b" }}>No log rows to display.</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default History;
