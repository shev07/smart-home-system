import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getCurrentUser, getStoredUser, logoutUser } from "../api/auth";
import {
  adminApi,
  alertsApi,
  devicesApi,
  homesApi,
  schedulesApi,
  sensorsApi,
  thresholdApi
} from "../api/platform";

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 12% 8%, rgba(20, 94, 168, 0.16), transparent 28%), radial-gradient(circle at 88% 12%, rgba(16, 185, 129, 0.14), transparent 24%), linear-gradient(180deg, #f7fbff 0%, #eef4fb 46%, #f8fafc 100%)",
  color: "#172033",
  fontFamily: "Segoe UI, Arial, sans-serif"
};

const shell = { maxWidth: 1320, margin: "0 auto", padding: "20px" };
const topbar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  padding: "16px 0"
};
const panel = {
  background: "#ffffff",
  border: "1px solid #d9e2ef",
  borderRadius: 10,
  padding: 18,
  boxShadow: "0 12px 30px rgba(20, 34, 56, 0.06)"
};
const heroPanel = {
  ...panel,
  background:
    "linear-gradient(135deg, #0f2440 0%, #145ea8 54%, #0f766e 100%)",
  color: "#f8fafc",
  border: 0,
  overflow: "hidden",
  position: "relative"
};
const sectionEyebrow = {
  color: "#4f7da8",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase"
};
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 };
const input = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #c7d2e4",
  borderRadius: 8,
  padding: "10px 12px",
  background: "#fff"
};
const button = {
  border: 0,
  borderRadius: 8,
  padding: "10px 12px",
  background: "#145ea8",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
};
const subtleButton = { ...button, background: "#eef4fb", color: "#174269", border: "1px solid #cfe0f3" };
const dangerButton = { ...button, background: "#b42318" };
const disabledButton = { ...subtleButton, opacity: 0.55, cursor: "not-allowed" };
const table = { width: "100%", borderCollapse: "collapse", minWidth: 760 };
const th = { textAlign: "left", padding: "10px 12px", background: "#edf3fa", color: "#24364f" };
const td = { padding: "10px 12px", borderTop: "1px solid #e3e9f2", verticalAlign: "top" };
const tabs = ["overview", "homes", "devices", "automation", "alerts", "admin"];

const getId = (value) => value?._id || value?.id || value;
const asList = (value, key) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};
const today = new Date().toISOString().slice(0, 10);

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6, color: "#334155", fontWeight: 600 }}>
      {label}
      {children}
    </label>
  );
}

function Empty({ text }) {
  return <div style={{ color: "#64748b", padding: "12px 0" }}>{text}</div>;
}

function StepBadge({ number, title, active }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: 10,
        background: active ? "#e8f3ff" : "#f4f7fb",
        color: active ? "#145ea8" : "#64748b",
        border: `1px solid ${active ? "#b8d7f6" : "#e2e8f0"}`
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: active ? "#145ea8" : "#cbd5e1",
          color: "#fff",
          fontWeight: 800
        }}
      >
        {number}
      </span>
      <strong>{title}</strong>
    </div>
  );
}

function Console() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [activeTab, setActiveTab] = useState("overview");
  const [homes, setHomes] = useState([]);
  const [homeId, setHomeId] = useState("");
  const [areas, setAreas] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sensorDevices, setSensorDevices] = useState([]);
  const [latestSensors, setLatestSensors] = useState([]);
  const [history, setHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [rules, setRules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [adminData, setAdminData] = useState({ users: [], homes: [], devices: [], unassigned: [] });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forms, setForms] = useState({
    homeName: "",
    areaName: "",
    areaDescription: "",
    deviceName: "",
    deviceType: "light",
    deviceAreaId: "",
    scheduleName: "",
    scheduleAction: "on",
    scheduleDeviceId: "",
    startDay: today,
    endDay: today,
    startTime: "18:00",
    endTime: "23:00",
    scheduledDays: "1,2,3,4,5",
    ruleName: "",
    ruleDeviceId: "",
    ruleType: "AUTO_CONTROL",
    dataType: "temperature",
    thresholdValue: "32",
    thresholdUnit: "C",
    alertValue: "32",
    alertUnit: "C",
    ruleAction: "on",
    cooldownTime: "300",
    assignDeviceId: "",
    assignHomeId: "",
    assignAreaId: "",
    adminHomeName: "",
    adminOwnerUserId: "",
    adminMemberHomeId: "",
    adminMemberUserId: "",
    adminMemberAsOwner: false
  });

  const selectedHome = homes.find((home) => getId(home) === homeId);
  const selectedDeviceId = forms.ruleDeviceId || forms.scheduleDeviceId || getId(devices[0]) || "";
  const selectedSensorId = getId(sensorDevices[0]) || "";
  const canUseAdmin = (profile = user) => profile?.role === "admin" || profile?.username === "admin";
  const isAdmin = canUseAdmin();
  const currentHomeDevices = devices.filter((device) => getId(device.homeId) === homeId || !device.homeId);
  const historyChartData = history
    .slice()
    .reverse()
    .map((item) => ({
      time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      value: Number(item.value),
      unit: item.unit || ""
    }));

  const updateForm = (key, value) => setForms((prev) => ({ ...prev, [key]: value }));

  const run = async (fn, successMessage = "Updated") => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      setMessage(successMessage);
    } catch (runError) {
      setError(runError.message);
    } finally {
      setBusy(false);
    }
  };

  const loadHomes = async () => {
    const nextHomes = asList(await homesApi.listMine());
    setHomes(nextHomes);
    const nextHomeId = homeId || getId(nextHomes[0]) || "";
    setHomeId(nextHomeId);
    return nextHomeId;
  };

  const loadHomeScope = async (nextHomeId = homeId) => {
    if (!nextHomeId) {
      setAreas([]);
      setDevices([]);
      setLatestSensors([]);
      setSensorDevices([]);
      setHistory([]);
      setAlerts([]);
      return;
    }
    const [nextAreas, nextDevices, nextSchedules, nextRules, nextAlerts] = await Promise.all([
      homesApi.areas(nextHomeId).catch(() => []),
      devicesApi.list(nextHomeId).catch(() => []),
      schedulesApi.list().catch(() => []),
      thresholdApi.list().catch(() => []),
      alertsApi.list({ homeId: nextHomeId, limit: 20 }).catch(() => ({ alerts: [] }))
    ]);
    setAreas(asList(nextAreas));
    const deviceList = asList(nextDevices);
    setDevices(deviceList);
    setSchedules(asList(nextSchedules));
    setRules(asList(nextRules));
    setAlerts(asList(nextAlerts, "alerts"));

    const firstDeviceId = getId(deviceList[0]);
    if (firstDeviceId) {
      const [latest, sensors] = await Promise.all([
        sensorsApi.latest(firstDeviceId).catch(() => []),
        sensorsApi.devices(firstDeviceId).catch(() => [])
      ]);
      const sensorList = asList(sensors);
      setLatestSensors(asList(latest));
      setSensorDevices(sensorList);
      const firstSensorId = getId(sensorList[0]);
      if (firstSensorId) {
        const sensorHistory = await sensorsApi.history(firstSensorId, { limit: 20 }).catch(() => ({ data: [] }));
        setHistory(asList(sensorHistory, "data"));
      }
    } else {
      setLatestSensors([]);
      setSensorDevices([]);
      setHistory([]);
    }
  };

  const loadAdmin = async (profile = user) => {
    if (!canUseAdmin(profile)) return;
    const [users, adminHomes, adminDevices, unassigned] = await Promise.all([
      adminApi.users().catch(() => ({ users: [] })),
      adminApi.homes().catch(() => ({ homes: [] })),
      adminApi.devices().catch(() => ({ devices: [] })),
      adminApi.unassignedDevices().catch(() => [])
    ]);
    setAdminData({
      users: asList(users, "users"),
      homes: asList(adminHomes, "homes"),
      devices: asList(adminDevices, "devices"),
      unassigned: asList(unassigned)
    });
  };

  const refreshAll = async () => {
    setError("");
    try {
      const profile = await getCurrentUser().catch(() => user);
      if (profile) setUser(profile);
      const nextHomeId = await loadHomes();
      await loadHomeScope(nextHomeId);
      await loadAdmin(profile);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    loadHomeScope(homeId);
  }, [homeId]);

  const totals = useMemo(
    () => ({
      onlineSensors: sensorDevices.filter((item) => item.connectionStatus === "online").length,
      unreadAlerts: alerts.filter((item) => !item.isRead).length,
      activeSchedules: schedules.filter((item) => item.activeStatus).length,
      activeRules: rules.filter((item) => item.isActive).length
    }),
    [alerts, rules, schedules, sensorDevices]
  );

  const createHome = () =>
    run(async () => {
      const home = await homesApi.create({ name: forms.homeName });
      const nextHomeId = getId(home);
      updateForm("homeName", "");
      if (nextHomeId) setHomeId(nextHomeId);
      await loadHomes();
      await loadHomeScope(nextHomeId);
    }, "Home created");

  const createArea = () =>
    run(async () => {
      await homesApi.createArea(homeId, { name: forms.areaName, description: forms.areaDescription });
      updateForm("areaName", "");
      updateForm("areaDescription", "");
      await loadHomeScope(homeId);
    }, "Area created");

  const createDevice = () =>
    run(async () => {
      await devicesApi.create({
        homeId,
        name: forms.deviceName,
        type: forms.deviceType,
        areaId: forms.deviceAreaId || undefined
      });
      updateForm("deviceName", "");
      await loadHomeScope(homeId);
    }, "Device added");

  const createSchedule = () =>
    run(async () => {
      await schedulesApi.create({
        name: forms.scheduleName,
        action: forms.scheduleAction,
        startDay: forms.startDay,
        endDay: forms.endDay,
        startTime: forms.startTime,
        endTime: forms.endTime,
        scheduledDays: forms.scheduledDays.split(",").map((day) => Number(day.trim())).filter(Number.isFinite),
        deviceIds: [forms.scheduleDeviceId].filter(Boolean)
      });
      updateForm("scheduleName", "");
      await loadHomeScope(homeId);
    }, "Schedule created");

  const createRule = () =>
    run(async () => {
      await thresholdApi.create({
        deviceId: forms.ruleDeviceId,
        name: forms.ruleName,
        ruleType: forms.ruleType,
        dataType: forms.dataType,
        thresholdValue: Number(forms.thresholdValue),
        thresholdUnit: forms.thresholdUnit,
        alertValue: Number(forms.alertValue),
        alertUnit: forms.alertUnit,
        action: forms.ruleType === "AUTO_CONTROL" ? forms.ruleAction : "",
        cooldownTime: Number(forms.cooldownTime)
      });
      updateForm("ruleName", "");
      await loadHomeScope(homeId);
    }, "Threshold rule created");

  const addUserToHome = () =>
    run(async () => {
      await adminApi.addUserToHome(forms.adminMemberHomeId, {
        userId: forms.adminMemberUserId,
        asOwner: forms.adminMemberAsOwner
      });
      updateForm("adminMemberUserId", "");
      await loadAdmin();
    }, "User added to home");

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <div style={page}>
      <div style={shell}>
        <header style={topbar}>
          <div>
            <div style={{ color: "#145ea8", fontWeight: 800, letterSpacing: "0.06em" }}>SMART HOME OPERATIONS</div>
            <h1 style={{ margin: "6px 0 0", fontSize: "1.8rem" }}>Smart Home Control Center</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <select value={homeId} onChange={(event) => setHomeId(event.target.value)} style={{ ...input, minWidth: 220 }}>
              <option value="">No home selected</option>
              {homes.map((home) => (
                <option key={getId(home)} value={getId(home)}>
                  {home.name}
                </option>
              ))}
            </select>
            <button style={subtleButton} onClick={refreshAll} disabled={busy}>Refresh</button>
            <button style={dangerButton} onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {tabs.filter((tab) => tab !== "admin" || isAdmin).map((tab) => (
            <button
              key={tab}
              style={activeTab === tab ? button : subtleButton}
              onClick={() => setActiveTab(tab)}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <Link to="/history" style={{ ...subtleButton, textDecoration: "none" }}>History page</Link>
          <Link to="/settings" style={{ ...subtleButton, textDecoration: "none" }}>Settings</Link>
        </nav>

        {(message || error) && (
          <div style={{ ...panel, marginBottom: 16, borderColor: error ? "#fecaca" : "#bbf7d0", color: error ? "#991b1b" : "#166534" }}>
            {error || message}
          </div>
        )}

        {activeTab === "overview" && (
          <div style={{ display: "grid", gap: 16 }}>
            <section style={heroPanel}>
              <div style={{ color: "#bfdbfe", fontWeight: 700 }}>Signed in as {user?.name || user?.email || user?.username || "user"}</div>
              <h2 style={{ margin: "8px 0", fontSize: "2.2rem" }}>{selectedHome?.name || "Create your first home"}</h2>
              <p style={{ margin: 0, color: "#dbeafe", maxWidth: 760, lineHeight: 1.6, fontSize: 0 }}>
                <span style={{ fontSize: 16 }}>
                  Manage homes, rooms, devices, sensor readings, schedules, threshold rules, alerts, and admin assignments from one connected UI.
                </span>
                UI này đã nối các nhóm API chính của backend: homes, areas, devices, sensors, schedules, threshold rules, alerts và admin.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 18 }}>
                <StepBadge number="1" title="Create or select a Home" active={Boolean(homeId)} />
                <StepBadge number="2" title="Add Areas inside that Home" active={Boolean(homeId && areas.length)} />
                <StepBadge number="3" title="Attach Devices and Automation" active={Boolean(homeId && devices.length)} />
              </div>
            </section>
            <div style={grid}>
              {[
                ["Homes", homes.length],
                ["Areas", areas.length],
                ["Devices", devices.length],
                ["Sensor channels", sensorDevices.length],
                ["Online sensors", totals.onlineSensors],
                ["Active schedules", totals.activeSchedules],
                ["Active rules", totals.activeRules],
                ["Unread alerts", totals.unreadAlerts]
              ].map(([label, value]) => (
                <section key={label} style={panel}>
                  <div style={{ color: "#64748b" }}>{label}</div>
                  <strong style={{ fontSize: "2rem" }}>{value}</strong>
                </section>
              ))}
            </div>
            <section style={panel}>
              <h2 style={{ marginTop: 0 }}>Latest sensor values</h2>
              {latestSensors.length ? (
                <div style={grid}>
                  {latestSensors.map((item) => (
                    <div key={getId(item)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
                      <strong>{item.name || item.sensorType}</strong>
                      <div style={{ fontSize: "1.8rem", marginTop: 8 }}>
                        {item.latestData ? `${item.latestData.value} ${item.latestData.unit || item.unit || ""}` : "--"}
                      </div>
                      <div style={{ color: "#64748b" }}>{item.connectionStatus || "offline"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty text="No sensor data yet. ESP32 data will appear after a device is assigned to this home." />
              )}
            </section>
          </div>
        )}

        {activeTab === "homes" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 16 }}>
            <section style={panel}>
              <div style={sectionEyebrow}>Step 1</div>
              <h2 style={{ margin: "6px 0 12px" }}>Create or choose a Home</h2>
              <p style={{ margin: "0 0 16px", color: "#64748b", lineHeight: 1.6 }}>
                A Home is the top-level place. Areas can only be created inside the selected Home.
              </p>
              <Field label="New home name">
                <input style={input} value={forms.homeName} onChange={(e) => updateForm("homeName", e.target.value)} placeholder="Apartment, family house, office..." />
              </Field>
              <button style={{ ...button, marginTop: 12, width: "100%" }} onClick={createHome} disabled={!forms.homeName || busy}>Create home</button>
              <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                {homes.map((home) => (
                  <button
                    key={getId(home)}
                    style={{
                      textAlign: "left",
                      border: getId(home) === homeId ? "1px solid #145ea8" : "1px solid #d9e2ef",
                      borderRadius: 10,
                      padding: 14,
                      background: getId(home) === homeId ? "linear-gradient(135deg, #e8f3ff, #f0fdfa)" : "#fff",
                      color: "#172033",
                      cursor: "pointer"
                    }}
                    onClick={() => setHomeId(getId(home))}
                  >
                    <strong style={{ display: "block", fontSize: "1rem" }}>{home.name}</strong>
                    <span style={{ color: "#64748b" }}>{getId(home) === homeId ? "Selected home" : "Click to manage areas and devices"}</span>
                  </button>
                ))}
              </div>
              {!homes.length && <Empty text="No homes yet. Create one first, then Area management will unlock." />}
            </section>
            <section style={panel}>
              <div style={sectionEyebrow}>Step 2</div>
              <h2 style={{ margin: "6px 0 12px" }}>Areas in {selectedHome?.name || "selected Home"}</h2>
              {!homeId ? (
                <div style={{ border: "1px dashed #b8c7da", borderRadius: 10, padding: 24, background: "#f8fbff", color: "#64748b" }}>
                  Create or select a Home on the left before adding rooms or zones.
                </div>
              ) : (
                <>
              <div style={{ display: "grid", gap: 10 }}>
                <Field label="Area name"><input style={input} value={forms.areaName} onChange={(e) => updateForm("areaName", e.target.value)} placeholder="Living room, bedroom, kitchen..." /></Field>
                <Field label="Description"><input style={input} value={forms.areaDescription} onChange={(e) => updateForm("areaDescription", e.target.value)} placeholder="Optional note" /></Field>
                <button style={!forms.areaName || busy ? disabledButton : button} onClick={createArea} disabled={!forms.areaName || busy}>Create area in this Home</button>
              </div>
              </>
              )}
              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {areas.map((area) => (
                  <div key={getId(area)} style={{ border: "1px solid #dce6f2", borderRadius: 10, padding: 14, background: "linear-gradient(180deg, #ffffff, #f8fbff)" }}>
                    <strong style={{ display: "block", fontSize: "1.05rem" }}>{area.name}</strong>
                    <div style={{ color: "#64748b" }}>{area.description || "No description"} · {area.deviceCount || 0} devices</div>
                    <button
                      style={{ ...dangerButton, marginTop: 10 }}
                      onClick={() => run(async () => { await homesApi.deleteArea(homeId, getId(area)); await loadHomeScope(homeId); }, "Area deleted")}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              {homeId && !areas.length && <Empty text="This Home has no areas yet." />}
              {homeId && (
                <div style={{ marginTop: 22, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                  <div style={sectionEyebrow}>Devices in this Home</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 10 }}>
                    {currentHomeDevices.map((device) => {
                      const area = areas.find((item) => getId(item) === getId(device.areaId));
                      return (
                        <div key={getId(device)} style={{ border: "1px solid #dce6f2", borderRadius: 10, padding: 14, background: "#fff" }}>
                          <strong style={{ display: "block" }}>{device.name}</strong>
                          <div style={{ color: "#64748b", marginTop: 6 }}>{device.type} / {area?.name || "No area"}</div>
                          <div style={{ marginTop: 10, color: device.status === "on" ? "#15803d" : "#64748b", fontWeight: 800 }}>
                            {device.status || "off"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!currentHomeDevices.length && <Empty text="No devices in this Home yet. Admin can assign discovered devices from the Admin tab." />}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "devices" && (
          <div style={{ display: "grid", gap: 16 }}>
            {isAdmin ? (
            <section style={panel}>
              <h2 style={{ marginTop: 0 }}>Add device</h2>
              <div style={grid}>
                <Field label="Name"><input style={input} value={forms.deviceName} onChange={(e) => updateForm("deviceName", e.target.value)} /></Field>
                <Field label="Type">
                  <select style={input} value={forms.deviceType} onChange={(e) => updateForm("deviceType", e.target.value)}>
                    <option value="light">Light</option>
                    <option value="fan">Fan</option>
                  </select>
                </Field>
                <Field label="Area">
                  <select style={input} value={forms.deviceAreaId} onChange={(e) => updateForm("deviceAreaId", e.target.value)}>
                    <option value="">Unassigned area</option>
                    {areas.map((area) => <option key={getId(area)} value={getId(area)}>{area.name}</option>)}
                  </select>
                </Field>
              </div>
              <button style={{ ...button, marginTop: 12 }} onClick={createDevice} disabled={!homeId || !forms.deviceName || busy}>Add device</button>
            </section>
            ) : (
            <section style={panel}>
              <div style={sectionEyebrow}>User permission</div>
              <h2 style={{ margin: "6px 0 8px" }}>Device list only</h2>
              <p style={{ margin: 0, color: "#64748b" }}>
                User accounts can create areas in assigned homes. Device assignment is handled by admin.
              </p>
            </section>
            )}

            <section style={{ ...panel, overflowX: "auto" }}>
              <h2 style={{ marginTop: 0 }}>Devices</h2>
              {devices.length ? (
                <table style={table}>
                  <thead><tr><th style={th}>Name</th><th style={th}>Type</th><th style={th}>Status</th><th style={th}>Area</th><th style={th}>Actions</th></tr></thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={getId(device)}>
                        <td style={td}>{device.name}<div style={{ color: "#64748b" }}>{device.externalId || getId(device)}</div></td>
                        <td style={td}>{device.type}</td>
                        <td style={td}>{device.status}</td>
                        <td style={td}>
                          <select
                            style={input}
                            value={getId(device.areaId) || ""}
                            onChange={(e) => run(async () => { await devicesApi.updateArea(getId(device), e.target.value || null); await loadHomeScope(homeId); }, "Device area updated")}
                          >
                            <option value="">No area</option>
                            {areas.map((area) => <option key={getId(area)} value={getId(area)}>{area.name}</option>)}
                          </select>
                        </td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button style={subtleButton} onClick={() => run(async () => { await devicesApi.control(getId(device), "on"); await loadHomeScope(homeId); }, "Command queued")}>On</button>
                            <button style={subtleButton} onClick={() => run(async () => { await devicesApi.control(getId(device), "off"); await loadHomeScope(homeId); }, "Command queued")}>Off</button>
                            <button style={dangerButton} onClick={() => run(async () => { await devicesApi.remove(getId(device)); await loadHomeScope(homeId); }, "Device deleted")}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <Empty text="No devices in this home." />}
            </section>

            <section style={{ ...panel, overflowX: "auto" }}>
              <h2 style={{ marginTop: 0 }}>Sensor history for first device channel</h2>
              {history.length ? (
                <>
                  <div style={{ height: 280, minWidth: 520, marginBottom: 18 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyChartData} margin={{ top: 12, right: 20, left: 0, bottom: 8 }}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                        <XAxis dataKey="time" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip formatter={(value, _name, item) => [`${value} ${item.payload.unit || ""}`, "Value"]} />
                        <Line type="monotone" dataKey="value" stroke="#145ea8" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <table style={table}>
                    <thead><tr><th style={th}>Time</th><th style={th}>Value</th><th style={th}>Unit</th></tr></thead>
                    <tbody>{history.map((item) => <tr key={getId(item) || item.createdAt}><td style={td}>{new Date(item.createdAt).toLocaleString()}</td><td style={td}>{item.value}</td><td style={td}>{item.unit}</td></tr>)}</tbody>
                  </table>
                </>
              ) : <Empty text={selectedSensorId ? "No readings for this sensor channel yet." : "No sensor channel found for this device."} />}
            </section>
          </div>
        )}

        {activeTab === "automation" && (
          <div style={{ display: "grid", gap: 16 }}>
            <section style={grid}>
              <div style={panel}>
                <h2 style={{ marginTop: 0 }}>Create schedule</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  <Field label="Name"><input style={input} value={forms.scheduleName} onChange={(e) => updateForm("scheduleName", e.target.value)} /></Field>
                  <Field label="Device"><select style={input} value={forms.scheduleDeviceId || selectedDeviceId} onChange={(e) => updateForm("scheduleDeviceId", e.target.value)}>{devices.map((device) => <option key={getId(device)} value={getId(device)}>{device.name}</option>)}</select></Field>
                  <Field label="Action"><select style={input} value={forms.scheduleAction} onChange={(e) => updateForm("scheduleAction", e.target.value)}><option value="on">On</option><option value="off">Off</option></select></Field>
                  <div style={grid}>
                    <Field label="Start day"><input type="date" style={input} value={forms.startDay} onChange={(e) => updateForm("startDay", e.target.value)} /></Field>
                    <Field label="End day"><input type="date" style={input} value={forms.endDay} onChange={(e) => updateForm("endDay", e.target.value)} /></Field>
                    <Field label="Start time"><input type="time" style={input} value={forms.startTime} onChange={(e) => updateForm("startTime", e.target.value)} /></Field>
                    <Field label="End time"><input type="time" style={input} value={forms.endTime} onChange={(e) => updateForm("endTime", e.target.value)} /></Field>
                  </div>
                  <Field label="Scheduled days, 0=Sun"><input style={input} value={forms.scheduledDays} onChange={(e) => updateForm("scheduledDays", e.target.value)} /></Field>
                  <button style={button} onClick={createSchedule} disabled={!forms.scheduleName || !selectedDeviceId || busy}>Create schedule</button>
                </div>
              </div>
              <div style={panel}>
                <h2 style={{ marginTop: 0 }}>Create threshold rule</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  <Field label="Name"><input style={input} value={forms.ruleName} onChange={(e) => updateForm("ruleName", e.target.value)} /></Field>
                  <Field label="Device"><select style={input} value={forms.ruleDeviceId || selectedDeviceId} onChange={(e) => updateForm("ruleDeviceId", e.target.value)}>{devices.map((device) => <option key={getId(device)} value={getId(device)}>{device.name}</option>)}</select></Field>
                  <Field label="Rule type"><select style={input} value={forms.ruleType} onChange={(e) => updateForm("ruleType", e.target.value)}><option value="AUTO_CONTROL">Auto control</option><option value="ALERT_ONLY">Alert only</option></select></Field>
                  <div style={grid}>
                    <Field label="Data type"><input style={input} value={forms.dataType} onChange={(e) => updateForm("dataType", e.target.value)} /></Field>
                    <Field label="Threshold"><input type="number" style={input} value={forms.thresholdValue} onChange={(e) => updateForm("thresholdValue", e.target.value)} /></Field>
                    <Field label="Alert value"><input type="number" style={input} value={forms.alertValue} onChange={(e) => updateForm("alertValue", e.target.value)} /></Field>
                    <Field label="Cooldown seconds"><input type="number" style={input} value={forms.cooldownTime} onChange={(e) => updateForm("cooldownTime", e.target.value)} /></Field>
                  </div>
                  <Field label="Action"><select style={input} value={forms.ruleAction} onChange={(e) => updateForm("ruleAction", e.target.value)}><option value="on">On</option><option value="off">Off</option></select></Field>
                  <button style={button} onClick={createRule} disabled={!forms.ruleName || !selectedDeviceId || busy}>Create rule</button>
                </div>
              </div>
            </section>

            <section style={{ ...panel, overflowX: "auto" }}>
              <h2 style={{ marginTop: 0 }}>Schedules</h2>
              {schedules.length ? <table style={table}><thead><tr><th style={th}>Name</th><th style={th}>Action</th><th style={th}>Window</th><th style={th}>Active</th><th style={th}>Actions</th></tr></thead><tbody>
                {schedules.map((item) => <tr key={getId(item)}><td style={td}>{item.name}</td><td style={td}>{item.action}</td><td style={td}>{item.startTime} - {item.endTime}</td><td style={td}>{item.activeStatus ? "Yes" : "No"}</td><td style={td}><button style={subtleButton} onClick={() => run(async () => { await schedulesApi.toggle(getId(item)); await loadHomeScope(homeId); }, "Schedule toggled")}>Toggle</button> <button style={dangerButton} onClick={() => run(async () => { await schedulesApi.remove(getId(item)); await loadHomeScope(homeId); }, "Schedule deleted")}>Delete</button></td></tr>)}
              </tbody></table> : <Empty text="No schedules yet." />}
            </section>

            <section style={{ ...panel, overflowX: "auto" }}>
              <h2 style={{ marginTop: 0 }}>Threshold rules</h2>
              {rules.length ? <table style={table}><thead><tr><th style={th}>Name</th><th style={th}>Type</th><th style={th}>Condition</th><th style={th}>Active</th><th style={th}>Actions</th></tr></thead><tbody>
                {rules.map((item) => <tr key={getId(item)}><td style={td}>{item.name}</td><td style={td}>{item.ruleType}</td><td style={td}>{item.dataType} ≥ {item.thresholdValue} {item.thresholdUnit}</td><td style={td}>{item.isActive ? "Yes" : "No"}</td><td style={td}><button style={subtleButton} onClick={() => run(async () => { await thresholdApi.toggle(getId(item)); await loadHomeScope(homeId); }, "Rule toggled")}>Toggle</button> <button style={dangerButton} onClick={() => run(async () => { await thresholdApi.remove(getId(item)); await loadHomeScope(homeId); }, "Rule deleted")}>Delete</button></td></tr>)}
              </tbody></table> : <Empty text="No threshold rules yet." />}
            </section>
          </div>
        )}

        {activeTab === "alerts" && (
          <section style={{ ...panel, overflowX: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <h2 style={{ marginTop: 0 }}>Alerts</h2>
              <button style={subtleButton} onClick={() => run(async () => { await alertsApi.readAll(homeId); await loadHomeScope(homeId); }, "All alerts marked as read")} disabled={!homeId}>Mark all read</button>
            </div>
            {alerts.length ? <table style={table}><thead><tr><th style={th}>Content</th><th style={th}>Device</th><th style={th}>Time</th><th style={th}>Read</th><th style={th}>Action</th></tr></thead><tbody>
              {alerts.map((item) => <tr key={getId(item)}><td style={td}>{item.alertContent}</td><td style={td}>{item.deviceId?.name || getId(item.deviceId)}</td><td style={td}>{new Date(item.timestamp).toLocaleString()}</td><td style={td}>{item.isRead ? "Yes" : "No"}</td><td style={td}><button style={subtleButton} onClick={() => run(async () => { await alertsApi.read(getId(item)); await loadHomeScope(homeId); }, "Alert marked as read")}>Read</button></td></tr>)}
            </tbody></table> : <Empty text="No alerts for this home." />}
          </section>
        )}

        {activeTab === "admin" && isAdmin && (
          <div style={{ display: "grid", gap: 16 }}>
            <section style={grid}>
              <div style={panel}>
                <h2 style={{ marginTop: 0 }}>Admin create home</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  <Field label="Home name"><input style={input} value={forms.adminHomeName} onChange={(e) => updateForm("adminHomeName", e.target.value)} /></Field>
                  <Field label="Owner user">
                    <select style={input} value={forms.adminOwnerUserId} onChange={(e) => updateForm("adminOwnerUserId", e.target.value)}>
                      <option value="">Choose owner</option>
                      {adminData.users.map((item) => <option key={getId(item)} value={getId(item)}>{item.name || item.email}</option>)}
                    </select>
                  </Field>
                  <button style={button} onClick={() => run(async () => { await adminApi.createHome({ name: forms.adminHomeName, ownerUserId: forms.adminOwnerUserId }); await loadAdmin(); }, "Admin home created")} disabled={!forms.adminHomeName || !forms.adminOwnerUserId}>Create</button>
                </div>
              </div>
              <div style={panel}>
                <h2 style={{ marginTop: 0 }}>Assign discovered device</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  <Field label="Device">
                    <select style={input} value={forms.assignDeviceId} onChange={(e) => updateForm("assignDeviceId", e.target.value)}>
                      <option value="">Choose unassigned device</option>
                      {adminData.unassigned.map((item) => <option key={getId(item)} value={getId(item)}>{item.name || item.externalId}</option>)}
                    </select>
                  </Field>
                  <Field label="Home">
                    <select style={input} value={forms.assignHomeId} onChange={(e) => updateForm("assignHomeId", e.target.value)}>
                      <option value="">Choose home</option>
                      {adminData.homes.map((item) => <option key={getId(item)} value={getId(item)}>{item.name}</option>)}
                    </select>
                  </Field>
                  <button style={button} onClick={() => run(async () => { await adminApi.assignDevice(forms.assignDeviceId, { homeId: forms.assignHomeId }); await loadAdmin(); await refreshAll(); }, "Device assigned")} disabled={!forms.assignDeviceId || !forms.assignHomeId}>Assign</button>
                </div>
              </div>
              <div style={panel}>
                <h2 style={{ marginTop: 0 }}>Add user to home</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  <Field label="Home">
                    <select style={input} value={forms.adminMemberHomeId} onChange={(e) => updateForm("adminMemberHomeId", e.target.value)}>
                      <option value="">Choose home</option>
                      {adminData.homes.map((item) => <option key={getId(item)} value={getId(item)}>{item.name}</option>)}
                    </select>
                  </Field>
                  <Field label="User">
                    <select style={input} value={forms.adminMemberUserId} onChange={(e) => updateForm("adminMemberUserId", e.target.value)}>
                      <option value="">Choose user</option>
                      {adminData.users.map((item) => <option key={getId(item)} value={getId(item)}>{item.name || item.email}</option>)}
                    </select>
                  </Field>
                  <label style={{ display: "flex", gap: 10, alignItems: "center", color: "#334155", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={forms.adminMemberAsOwner}
                      onChange={(e) => updateForm("adminMemberAsOwner", e.target.checked)}
                    />
                    Add as owner
                  </label>
                  <button style={button} onClick={addUserToHome} disabled={!forms.adminMemberHomeId || !forms.adminMemberUserId}>Add user</button>
                </div>
              </div>
            </section>
            <section style={{ ...panel, overflowX: "auto" }}>
              <h2 style={{ marginTop: 0 }}>Users</h2>
              <table style={table}><thead><tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Role</th><th style={th}>Action</th></tr></thead><tbody>
                {adminData.users.map((item) => <tr key={getId(item)}><td style={td}>{item.name}</td><td style={td}>{item.email}</td><td style={td}>{item.role}</td><td style={td}><button style={subtleButton} onClick={() => run(async () => { await adminApi.changeRole(getId(item), item.role === "admin" ? "user" : "admin"); await loadAdmin(); }, "Role updated")}>Make {item.role === "admin" ? "user" : "admin"}</button></td></tr>)}
              </tbody></table>
            </section>
            <section style={{ ...panel, overflowX: "auto" }}>
              <h2 style={{ marginTop: 0 }}>All homes</h2>
              <table style={table}><thead><tr><th style={th}>Home</th><th style={th}>Owners</th><th style={th}>Members</th></tr></thead><tbody>
                {adminData.homes.map((item) => (
                  <tr key={getId(item)}>
                    <td style={td}>{item.name}</td>
                    <td style={td}>{asList(item.ownerIds).map((owner) => owner.name || owner.email || getId(owner)).join(", ") || "-"}</td>
                    <td style={td}>{asList(item.memberIds).map((member) => member.name || member.email || getId(member)).join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody></table>
            </section>
            <section style={{ ...panel, overflowX: "auto" }}>
              <h2 style={{ marginTop: 0 }}>All devices</h2>
              <table style={table}><thead><tr><th style={th}>Name</th><th style={th}>Home</th><th style={th}>Area</th><th style={th}>Status</th></tr></thead><tbody>
                {adminData.devices.map((item) => <tr key={getId(item)}><td style={td}>{item.name}</td><td style={td}>{item.homeId?.name || "-"}</td><td style={td}>{item.areaId?.name || "-"}</td><td style={td}>{item.status}</td></tr>)}
              </tbody></table>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default Console;
