import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword, verifyRecoveryIdentity } from "../api/auth";

const pageStyle = {
  minHeight: "100vh",
  padding: "32px 20px 48px",
  background:
    "radial-gradient(circle at top, rgba(56,189,248,0.22), transparent 30%), linear-gradient(180deg, #e0f2fe 0%, #f8fafc 38%, #eef2ff 100%)",
  fontFamily: '"Segoe UI", sans-serif'
};

const shellStyle = {
  maxWidth: "1120px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.1fr) minmax(360px, 460px)",
  gap: "24px",
  alignItems: "stretch"
};

const heroStyle = {
  background: "#0f172a",
  color: "#f8fafc",
  borderRadius: "28px",
  padding: "32px",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: "620px"
};

const cardStyle = {
  borderRadius: "28px",
  padding: "28px",
  background: "rgba(255,255,255,0.94)",
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.14)"
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  marginTop: "8px",
  boxSizing: "border-box"
};

const buttonStyle = {
  width: "100%",
  border: "none",
  borderRadius: "12px",
  padding: "12px 16px",
  background: "#0284c7",
  color: "#f8fafc",
  fontWeight: 700,
  cursor: "pointer"
};

function ForgotPassword() {
  const [identityForm, setIdentityForm] = useState({ username: "", phone: "" });
  const [resetForm, setResetForm] = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setIdentityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const response = await verifyRecoveryIdentity(identityForm);
      setResult(response.data);
      setIsVerified(true);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setResult(null);

    if (resetForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      setIsSubmitting(false);
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError("Password confirmation does not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await resetPassword({
        ...identityForm,
        newPassword: resetForm.newPassword
      });
      setResult(response.data);
      setResetForm({ newPassword: "", confirmPassword: "" });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <section style={heroStyle}>
          <div>
            <div style={{ color: "#7dd3fc", fontWeight: 700, letterSpacing: "0.08em" }}>
              ACCOUNT RECOVERY
            </div>
            <h1 style={{ fontSize: "2.5rem", margin: "14px 0 12px", lineHeight: 1.1 }}>
              Reset password without exposing old credentials
            </h1>
            <p style={{ maxWidth: "620px", margin: 0, color: "#cbd5e1", lineHeight: 1.7 }}>
              This screen now follows a safer flow: verify identity first, then
              set a new password. It matches the rest of the dashboard visually
              and keeps the demo closer to a real product pattern.
            </p>
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            {[
              "Verify username and phone number.",
              "Unlock the reset form after identity is confirmed.",
              "Set a new password and login again with the updated value."
            ].map((text, index) => (
              <div
                key={text}
                style={{
                  borderRadius: "18px",
                  padding: "18px",
                  background: isVerified && index < 2 ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e2e8f0"
                }}
              >
                <strong style={{ color: "#7dd3fc" }}>Step {index + 1}</strong>
                <div style={{ marginTop: "8px" }}>{text}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={cardStyle}>
          <div style={{ color: "#0284c7", fontWeight: 700, letterSpacing: "0.08em" }}>
            PASSWORD RESET
          </div>
          <h2 style={{ margin: "12px 0 8px", color: "#0f172a", fontSize: "2rem" }}>Recover access</h2>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
            Verify the account first. After that, set a new password instead of requesting the current one.
          </p>

          <div
            style={{
              marginTop: "18px",
              borderRadius: "16px",
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "14px 16px"
            }}
          >
            <div style={{ fontWeight: 700 }}>Demo recovery numbers</div>
            <div style={{ marginTop: "6px" }}>`0901234567` and `0912345678`</div>
          </div>

          <form onSubmit={handleVerify} style={{ marginTop: "20px", display: "grid", gap: "16px" }}>
            <label>
              <div style={{ color: "#334155", fontWeight: 600 }}>Username</div>
              <input
                name="username"
                value={identityForm.username}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Enter username"
                disabled={isVerified}
              />
            </label>

            <label>
              <div style={{ color: "#334155", fontWeight: 600 }}>Phone number</div>
              <input
                name="phone"
                value={identityForm.phone}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Enter phone number"
                disabled={isVerified}
              />
            </label>

            {!isVerified && (
              <button type="submit" style={buttonStyle} disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify Account"}
              </button>
            )}
          </form>

          {isVerified && (
            <form onSubmit={handleReset} style={{ marginTop: "18px", display: "grid", gap: "16px" }}>
              <div
                style={{
                  borderRadius: "14px",
                  background: "#ecfdf5",
                  color: "#166534",
                  padding: "12px 14px"
                }}
              >
                <div style={{ fontWeight: 700 }}>Identity verified.</div>
                <div style={{ marginTop: "6px" }}>
                  Registered email: <strong>{result?.email || result?.username || "Not available"}</strong>
                </div>
                <div style={{ marginTop: "6px" }}>Set a new password below.</div>
              </div>

              <label>
                <div style={{ color: "#334155", fontWeight: 600 }}>New password</div>
                <input
                  type="password"
                  name="newPassword"
                  value={resetForm.newPassword}
                  onChange={handlePasswordChange}
                  style={inputStyle}
                  placeholder="Enter new password"
                />
              </label>

              <label>
                <div style={{ color: "#334155", fontWeight: 600 }}>Confirm password</div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={resetForm.confirmPassword}
                  onChange={handlePasswordChange}
                  style={inputStyle}
                  placeholder="Confirm new password"
                />
              </label>

              <button type="submit" style={buttonStyle} disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {error && (
            <div
              style={{
                borderRadius: "12px",
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "12px 14px",
                marginTop: "16px"
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div
              style={{
                borderRadius: "12px",
                background: "#ecfeff",
                color: "#155e75",
                padding: "12px 14px",
                marginTop: "16px"
              }}
            >
              {result.message}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "18px",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <Link to="/login">Back to login</Link>
            <span style={{ color: "#64748b" }}>Safer flow for production-style demos</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword;
