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

const demoHistory = Array.from({ length: 36 }, (_, index) => {
  const createdAt = new Date(Date.now() - (35 - index) * 5 * 60 * 1000).toISOString();
  const wave = Math.sin(index / 4) * 2.8;
  const drift = index > 18 ? (index - 18) * 0.08 : 0;
  return {
    _id: `demo-${index}`,
    createdAt,
    value: Number((29.5 + wave + drift).toFixed(1)),
    unit: "°C",
    isDemo: true
  };
});

const demoHumidityHistory = Array.from({ length: 36 }, (_, index) => {
  const createdAt = new Date(Date.now() - (35 - index) * 5 * 60 * 1000).toISOString();
  const wave = Math.cos(index / 5) * 4.5;
  const drift = index > 20 ? (index - 20) * 0.12 : 0;
  return {
    _id: `demo-humidity-${index}`,
    createdAt,
    value: Number((64 + wave - drift).toFixed(1)),
    unit: "%",
    isDemo: true
  };
});

const averageOf = (items) =>
  items.length ? items.reduce((sum, item) => sum + Number(item.value || 0), 0) / items.length : 0;

const getSensorType = (sensor) =>
  String(sensor?.sensorType || sensor?.type || sensor?.name || "sensor").toLowerCase();

const SENSOR_FACTOR_META = {
  temperature: { label: "Temperature", unit: "°C", color: "#dc2626", background: "#fff7f7", border: "#fee2e2" },
  humidity: { label: "Humidity", unit: "%", color: "#2563eb", background: "#eff6ff", border: "#dbeafe" },
  anomalyScore: { label: "Anomaly score", unit: "", color: "#9333ea", background: "#faf5ff", border: "#e9d5ff" },
  anomalyscore: { label: "Anomaly score", unit: "", color: "#9333ea", background: "#faf5ff", border: "#e9d5ff" },
  dataQuality: { label: "Data quality", unit: "", color: "#0f766e", background: "#f0fdfa", border: "#ccfbf1" },
  dataquality: { label: "Data quality", unit: "", color: "#0f766e", background: "#f0fdfa", border: "#ccfbf1" }
};

const factorMetaFor = (sensorType) =>
  SENSOR_FACTOR_META[sensorType] || {
    label: sensorType
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase()),
    unit: "",
    color: "#475569",
    background: "#f8fafc",
    border: "#e2e8f0"
  };

const buildSensorLogRows = (sensorDevices, metricHistory) => {
  const rows = sensorDevices.flatMap((sensor) => {
    const type = getSensorType(sensor);
    const meta = factorMetaFor(type);
    const historyRows = metricHistory[type] || [];

    return historyRows.map((item) => ({
      ...item,
      sensorId: getId(sensor),
      sensorLabel: sensor.name || meta.label,
      sensorType: type,
      unit: item.unit || sensor.unit || meta.unit
    }));
  });

  return rows.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
};

function History() {
  const [homes, setHomes] = useState([]);
  const [homeId, setHomeId] = useState("");
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [sensorDevices, setSensorDevices] = useState([]);
  const [sensorDeviceId, setSensorDeviceId] = useState("");
  const [history, setHistory] = useState([]);
  const [metricHistory, setMetricHistory] = useState({ temperature: [], humidity: [] });
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

  useEffect(() => {
    const sensorPairs = sensorDevices
      .map((sensor) => [getSensorType(sensor), sensor])
      .filter(([, sensor]) => getId(sensor));

    if (!sensorPairs.length) {
      const timeout = setTimeout(() => setMetricHistory({ temperature: [], humidity: [] }), 0);
      return () => clearTimeout(timeout);
    }

    const loadMetricHistory = async () => {
      try {
        const entries = await Promise.all(
          sensorPairs.map(async ([type, sensor]) => {
            const payload = await sensorsApi.history(getId(sensor), { limit: 60 });
            return [type, asList(payload, "data")];
          })
        );

        setMetricHistory(Object.fromEntries(entries));
      } catch (loadError) {
        setError(loadError.message);
      }
    };

    loadMetricHistory();
    const interval = setInterval(loadMetricHistory, 5000);
    return () => clearInterval(interval);
  }, [sensorDevices]);

  const visibleHistory = history.length ? history : demoHistory;
  const isDemoHistory = !history.length;
  const temperatureHistory = metricHistory.temperature || [];
  const humidityHistory = metricHistory.humidity || [];
  const visibleTemperatureHistory = temperatureHistory.length ? temperatureHistory : demoHistory;
  const visibleHumidityHistory = humidityHistory.length ? humidityHistory : demoHumidityHistory;
  const isDemoMetricHistory = !temperatureHistory.length || !humidityHistory.length;
  const combinedChartData = useMemo(() => {
    const rowsByTime = new Map();

    const addRows = (items, key) => {
      items
        .slice()
        .reverse()
        .forEach((item) => {
          const timestamp = item.createdAt || item.timestamp;
          const time = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const existing = rowsByTime.get(time) || { time };
          rowsByTime.set(time, { ...existing, [key]: Number(item.value) });
        });
    };

    addRows(visibleTemperatureHistory, "temperature");
    addRows(visibleHumidityHistory, "humidity");

    return Array.from(rowsByTime.values());
  }, [visibleTemperatureHistory, visibleHumidityHistory]);
  const factorSummaries = useMemo(
    () =>
      sensorDevices.map((sensor) => {
        const type = getSensorType(sensor);
        const meta = factorMetaFor(type);
        const rows = metricHistory[type] || [];
        const latest = rows[0];

        return {
          id: getId(sensor),
          type,
          label: sensor.name || meta.label,
          unit: sensor.unit || meta.unit,
          color: meta.color,
          background: meta.background,
          border: meta.border,
          latest,
          average: averageOf(rows),
          records: rows.length
        };
      }),
    [sensorDevices, metricHistory]
  );
  const sensorLogRows = useMemo(() => {
    const rows = buildSensorLogRows(sensorDevices, metricHistory);

    if (rows.length) {
      return rows;
    }

    return [
      ...demoHistory.map((item) => ({ ...item, sensorLabel: "Temperature", sensorType: "temperature" })),
      ...demoHumidityHistory.map((item) => ({ ...item, sensorLabel: "Humidity", sensorType: "humidity" }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sensorDevices, metricHistory]);
  const latestRecord = visibleHistory[0];
  const averageValue = useMemo(
    () => averageOf(visibleHistory),
    [visibleHistory]
  );
  const latestTemperature = visibleTemperatureHistory[0];
  const latestHumidity = visibleHumidityHistory[0];
  const averageTemperature = useMemo(() => averageOf(visibleTemperatureHistory), [visibleTemperatureHistory]);
  const averageHumidity = useMemo(() => averageOf(visibleHumidityHistory), [visibleHumidityHistory]);
  const minValue = visibleHistory.length ? Math.min(...visibleHistory.map((item) => Number(item.value))) : null;
  const maxValue = visibleHistory.length ? Math.max(...visibleHistory.map((item) => Number(item.value))) : null;

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
            <div><div style={{ color: "#64748b" }}>Records</div><strong style={{ fontSize: "2rem" }}>{visibleHistory.length}</strong></div>
            <div><div style={{ color: "#64748b" }}>Latest</div><strong>{latestRecord ? `${latestRecord.value} ${latestRecord.unit}` : "--"}</strong></div>
            <div><div style={{ color: "#64748b" }}>Average</div><strong>{visibleHistory.length ? averageValue.toFixed(2) : "--"}</strong></div>
            <div><div style={{ color: "#64748b" }}>Min / Max</div><strong>{visibleHistory.length ? `${minValue} / ${maxValue}` : "--"}</strong></div>
          </div>
          {isDemoHistory && (
            <div style={{ marginTop: 14, borderRadius: 10, background: "#fff7ed", color: "#9a3412", padding: "12px 14px" }}>
              No real sensor rows are available for the selected channel yet. The log below is demo data for layout and presentation only.
            </div>
          )}
        </section>

        <section style={{ ...cardStyle, overflowX: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ margin: "0 0 8px" }}>Sensor factors</h2>
              <div style={{ color: "#64748b" }}>Backend currently supports temperature, humidity, anomaly score, and data quality when the device sends them.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, flex: "1 1 520px" }}>
              <div style={{ border: "1px solid #fee2e2", borderRadius: 10, padding: "12px 14px", background: "#fff7f7" }}>
                <div style={{ color: "#991b1b", fontWeight: 700 }}>Temperature</div>
                <strong style={{ fontSize: "1.35rem" }}>{latestTemperature ? `${latestTemperature.value} ${latestTemperature.unit || "°C"}` : "--"}</strong>
                <div style={{ color: "#64748b", marginTop: 4 }}>Avg {visibleTemperatureHistory.length ? averageTemperature.toFixed(2) : "--"}</div>
              </div>
              <div style={{ border: "1px solid #dbeafe", borderRadius: 10, padding: "12px 14px", background: "#eff6ff" }}>
                <div style={{ color: "#1d4ed8", fontWeight: 700 }}>Humidity</div>
                <strong style={{ fontSize: "1.35rem" }}>{latestHumidity ? `${latestHumidity.value} ${latestHumidity.unit || "%"}` : "--"}</strong>
                <div style={{ color: "#64748b", marginTop: 4 }}>Avg {visibleHumidityHistory.length ? averageHumidity.toFixed(2) : "--"}</div>
              </div>
              {factorSummaries
                .filter((factor) => !["temperature", "humidity"].includes(factor.type))
                .map((factor) => (
                  <div key={factor.id} style={{ border: `1px solid ${factor.border}`, borderRadius: 10, padding: "12px 14px", background: factor.background }}>
                    <div style={{ color: factor.color, fontWeight: 700 }}>{factor.label}</div>
                    <strong style={{ fontSize: "1.35rem" }}>
                      {factor.latest ? `${factor.latest.value} ${factor.latest.unit || factor.unit}` : "--"}
                    </strong>
                    <div style={{ color: "#64748b", marginTop: 4 }}>
                      Avg {factor.records ? factor.average.toFixed(2) : "--"} · {factor.records} rows
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {isDemoMetricHistory && (
            <div style={{ marginTop: 14, borderRadius: 10, background: "#fff7ed", color: "#9a3412", padding: "12px 14px" }}>
              One or more sensor channels do not have backend rows yet. Missing lines use demo data for presentation only.
            </div>
          )}

          <div style={{ height: 340, minWidth: 680, marginTop: 18 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedChartData} margin={{ top: 14, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis yAxisId="temperature" stroke="#dc2626" />
                <YAxis yAxisId="humidity" orientation="right" stroke="#2563eb" />
                <Tooltip />
                <Line yAxisId="temperature" type="monotone" dataKey="temperature" name="Temperature" stroke="#dc2626" strokeWidth={3} dot={false} />
                <Line yAxisId="humidity" type="monotone" dataKey="humidity" name="Humidity" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section style={{ ...cardStyle, overflowX: "auto" }}>
          <h2 style={{ marginTop: 0 }}>Sensor log</h2>
          {sensorLogRows.length ? (
            <table style={tableStyle}>
              <thead><tr><th style={thStyle}>Time</th><th style={thStyle}>Sensor</th><th style={thStyle}>Value</th><th style={thStyle}>Unit</th><th style={thStyle}>Source</th></tr></thead>
              <tbody>
                {sensorLogRows.map((item) => (
                  <tr key={`${item.sensorType}-${getId(item) || item.createdAt}`}>
                    <td style={tdStyle}>{new Date(item.createdAt || item.timestamp).toLocaleString()}</td>
                    <td style={tdStyle}>{item.sensorLabel}</td>
                    <td style={tdStyle}>{item.value}</td>
                    <td style={tdStyle}>{item.unit}</td>
                    <td style={tdStyle}>{item.isDemo ? "Demo" : "Backend"}</td>
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
