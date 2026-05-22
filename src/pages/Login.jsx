import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/auth";

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
  gridTemplateColumns: "minmax(0, 1.15fr) minmax(340px, 420px)",
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
  minHeight: "580px"
};

const authCardStyle = {
  borderRadius: "28px",
  padding: "28px",
  background: "rgba(255,255,255,0.92)",
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
  background: "#0f172a",
  color: "#f8fafc",
  fontWeight: 700,
  cursor: "pointer"
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modeLabel, setModeLabel] = useState("");

  const redirectTo = location.state?.from?.pathname || "/";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await loginUser(form);
      setModeLabel(result.fallback ? "Logged in with demo data fallback." : "");
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await registerUser(registerForm);
      navigate(redirectTo, { replace: true });
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
              SMART HOME ACCESS
            </div>
            <h1 style={{ fontSize: "2.6rem", margin: "14px 0 12px", lineHeight: 1.1 }}>
              Access panel for the full backend console
            </h1>
            <p style={{ maxWidth: "620px", margin: 0, color: "#cbd5e1", lineHeight: 1.7 }}>
              Sign in with backend email/password or create a new account through
              `POST /api/auth/register`. Demo fallback still works when the API is offline.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px"
            }}
          >
            <div
              style={{
                borderRadius: "18px",
                padding: "18px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)"
              }}
            >
              <div style={{ color: "#7dd3fc", fontWeight: 700 }}>Step 1</div>
              <div style={{ marginTop: "8px", color: "#e2e8f0" }}>Login stores a token in `localStorage`.</div>
            </div>

            <div
              style={{
                borderRadius: "18px",
                padding: "18px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)"
              }}
            >
              <div style={{ color: "#7dd3fc", fontWeight: 700 }}>Step 2</div>
              <div style={{ marginTop: "8px", color: "#e2e8f0" }}>Protected routes open dashboard, history, and settings.</div>
            </div>

            <div
              style={{
                borderRadius: "18px",
                padding: "18px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)"
              }}
            >
              <div style={{ color: "#7dd3fc", fontWeight: 700 }}>Step 3</div>
              <div style={{ marginTop: "8px", color: "#e2e8f0" }}>Forgot password verifies identity before reset.</div>
            </div>
          </div>
        </section>

        <section style={authCardStyle}>
          <div style={{ color: "#0ea5e9", fontWeight: 700, letterSpacing: "0.08em" }}>
            {mode === "login" ? "SIGN IN" : "REGISTER"}
          </div>
          <h2 style={{ margin: "12px 0 8px", color: "#0f172a", fontSize: "2rem" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
            Use a demo account or your backend account if the auth API is available.
          </p>

          {import.meta.env.VITE_ENABLE_DEMO_FALLBACK === "true" && (
            <div
              style={{
                marginTop: "18px",
                borderRadius: "16px",
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "14px 16px"
              }}
            >
              <div style={{ fontWeight: 700 }}>Demo accounts</div>
              <div style={{ marginTop: "6px" }}>`admin / admin123`</div>
              <div>`khanh / khanh123`</div>
            </div>
          )}

          {mode === "login" ? (
          <form onSubmit={handleSubmit} style={{ marginTop: "20px", display: "grid", gap: "16px" }}>
            <label>
              <div style={{ color: "#334155", fontWeight: 600 }}>Email</div>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                style={inputStyle}
                placeholder="user@example.com"
              />
            </label>

            <label>
              <div style={{ color: "#334155", fontWeight: 600 }}>Password</div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Enter password"
              />
            </label>

            {error && (
              <div style={{ borderRadius: "12px", background: "#fef2f2", color: "#b91c1c", padding: "12px 14px" }}>
                {error}
              </div>
            )}

            {modeLabel && (
              <div style={{ borderRadius: "12px", background: "#ecfeff", color: "#155e75", padding: "12px 14px" }}>
                {modeLabel}
              </div>
            )}

            <button type="submit" style={buttonStyle} disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </form>
          ) : (
          <form onSubmit={handleRegister} style={{ marginTop: "20px", display: "grid", gap: "16px" }}>
            <label>
              <div style={{ color: "#334155", fontWeight: 600 }}>Name</div>
              <input name="name" value={registerForm.name} onChange={handleRegisterChange} style={inputStyle} placeholder="Nguyen Van A" required />
            </label>
            <label>
              <div style={{ color: "#334155", fontWeight: 600 }}>Email</div>
              <input type="email" name="email" value={registerForm.email} onChange={handleRegisterChange} style={inputStyle} placeholder="user@example.com" required />
            </label>
            <label>
              <div style={{ color: "#334155", fontWeight: 600 }}>Phone number</div>
              <input name="phoneNumber" value={registerForm.phoneNumber} onChange={handleRegisterChange} style={inputStyle} placeholder="0901234567" />
            </label>
            <label>
              <div style={{ color: "#334155", fontWeight: 600 }}>Password</div>
              <input type="password" name="password" value={registerForm.password} onChange={handleRegisterChange} style={inputStyle} placeholder="At least 6 characters" required />
            </label>
            {error && (
              <div style={{ borderRadius: "12px", background: "#fef2f2", color: "#b91c1c", padding: "12px 14px" }}>
                {error}
              </div>
            )}
            <button type="submit" style={buttonStyle} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
          </form>
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
            <Link to="/forgot-password">Forgot password?</Link>
            <button
              type="button"
              onClick={() => {
                setError("");
                setMode((current) => (current === "login" ? "register" : "login"));
              }}
              style={{ border: 0, background: "transparent", color: "#2563eb", cursor: "pointer", padding: 0 }}
            >
              {mode === "login" ? "Create account" : "Back to login"}
            </button>
            <Link to="/">Back to app</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
