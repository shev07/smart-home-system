import { useCallback, useEffect, useState } from "react";
import { controlDevice, getDeviceStatus } from "../api/device";

const panelStyle = { display: "grid", gap: "16px" };
const deviceCardStyle = {
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: "18px",
  padding: "18px",
  background: "#0f172a",
  color: "#e2e8f0"
};
const buttonRowStyle = { display: "flex", gap: "10px", marginTop: "12px" };
const baseButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  fontWeight: 700,
  cursor: "pointer"
};

function Control({ refreshKey = 0, onStatusChange, pendingDevice }) {
  const [status, setStatus] = useState({ fan: "off", light: "off" });
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getDeviceStatus();
      setStatus(res.data);
      onStatusChange?.(res.data);
      setError("");
    } catch (fetchError) {
      setError(fetchError.message);
    }
  }, [onStatusChange]);

  useEffect(() => {
    const timeout = setTimeout(fetchStatus, 0);
    return () => clearTimeout(timeout);
  }, [fetchStatus, refreshKey]);

  useEffect(() => {
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleClick = async (device, action) => {
    try {
      await controlDevice(device, action);
      await fetchStatus();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const renderDevice = (device, label, accent) => {
    const isOn = status[device] === "on";
    const isPending = pendingDevice === device;

    return (
      <div key={device} style={deviceCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{label}</div>
            <div style={{ color: "#94a3b8", marginTop: "6px" }}>
              Current status: <strong style={{ color: isOn ? accent : "#94a3b8" }}>{status[device] || "off"}</strong>
            </div>
          </div>
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "999px",
              background: isOn ? accent : "#475569",
              boxShadow: isOn ? `0 0 20px ${accent}` : "none"
            }}
          />
        </div>

        <div style={buttonRowStyle}>
          <button
            style={{ ...baseButtonStyle, background: "#dcfce7", color: "#166534", opacity: isPending ? 0.65 : 1 }}
            disabled={isPending}
            onClick={() => handleClick(device, "on")}
          >
            ON
          </button>
          <button
            style={{ ...baseButtonStyle, background: "#fee2e2", color: "#991b1b", opacity: isPending ? 0.65 : 1 }}
            disabled={isPending}
            onClick={() => handleClick(device, "off")}
          >
            OFF
          </button>
        </div>
      </div>
    );
  };

  return (
    <section style={panelStyle}>
      <div>
        <h2 style={{ margin: 0, color: "#0f172a" }}>Device Control</h2>
        <p style={{ margin: "6px 0 0", color: "#475569" }}>
          Click ON/OFF, frontend sends a control command, then fetches device state again.
        </p>
      </div>

      {error && <div style={{ borderRadius: "12px", background: "#fef2f2", color: "#991b1b", padding: "12px 14px" }}>{error}</div>}
      {renderDevice("fan", "Fan", "#22c55e")}
      {renderDevice("light", "Light", "#f59e0b")}
    </section>
  );
}

export default Control;
