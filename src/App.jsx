import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from "./api/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Console from "./pages/Console";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import History from "./pages/History";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import { applyThemeMode, loadUiSettings } from "./utils/settings";

const globalAppStyles = `
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
    margin: 0;
  }

  body {
    overflow-x: hidden;
  }

  img,
  svg,
  canvas {
    max-width: 100%;
  }

  section:has(table),
  div:has(table) {
    overflow-x: auto;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  [data-theme="dark"] div[style*="min-height: 100vh"] {
    background: linear-gradient(180deg, #020617 0%, #0f172a 54%, #111827 100%) !important;
    color: #e2e8f0 !important;
  }

  [data-theme="dark"] section[style*="rgba(255,255,255"],
  [data-theme="dark"] div[style*="rgba(255,255,255"],
  [data-theme="dark"] div[style*="background: #ffffff"],
  [data-theme="dark"] div[style*="background: rgb(255, 255, 255)"],
  [data-theme="dark"] section[style*="background: rgb(255, 255, 255)"] {
    background: rgba(15, 23, 42, 0.94) !important;
    color: #e2e8f0 !important;
    border-color: #334155 !important;
  }

  [data-theme="dark"] input,
  [data-theme="dark"] select,
  [data-theme="dark"] textarea {
    background: #020617 !important;
    color: #e2e8f0 !important;
    border-color: #475569 !important;
  }

  [data-theme="dark"] th {
    background: #1e293b !important;
    color: #e2e8f0 !important;
  }

  [data-theme="dark"] td {
    border-color: #334155 !important;
  }

  @media (max-width: 900px) {
    div[style*="max-width: 1320px"],
    div[style*="max-width: 1180px"],
    div[style*="max-width: 1120px"] {
      max-width: 100% !important;
    }

    div[style*="grid-template-columns"] {
      grid-template-columns: 1fr !important;
    }

    section[style*="display: flex"],
    div[style*="display: flex"] {
      min-width: 0;
    }
  }

  @media (max-width: 720px) {
    div[style*="min-height: 100vh"] {
      padding: 18px 12px 32px !important;
    }

    div[style*="padding: 20px"] {
      padding: 14px !important;
    }

    section[style*="padding: 28px"],
    section[style*="padding: 32px"],
    div[style*="padding: 28px"],
    div[style*="padding: 32px"] {
      padding: 18px !important;
    }

    section[style*="border-radius: 28px"],
    div[style*="border-radius: 28px"],
    section[style*="border-radius: 22px"],
    div[style*="border-radius: 22px"],
    section[style*="border-radius: 18px"],
    div[style*="border-radius: 18px"] {
      border-radius: 12px !important;
    }

    h1 {
      font-size: clamp(1.55rem, 8vw, 2rem) !important;
      line-height: 1.15 !important;
    }

    h2 {
      font-size: 1.2rem !important;
    }

    p {
      font-size: 0.95rem;
    }

    div[style*="min-height: 580px"],
    div[style*="min-height: 620px"] {
      min-height: auto !important;
    }

    div[style*="minmax(340px"],
    div[style*="minmax(360px"] {
      min-width: 0 !important;
    }

    input,
    select,
    textarea,
    button {
      min-height: 44px;
    }

    table {
      font-size: 0.92rem;
    }

    th,
    td {
      padding: 9px 10px !important;
      white-space: nowrap;
    }

    div[style*="height: 340px"],
    div[style*="height: 360px"] {
      height: 280px !important;
      min-width: 560px !important;
    }
  }

  @media (max-width: 480px) {
    div[style*="gap: 24px"],
    div[style*="gap: 20px"],
    div[style*="gap: 18px"],
    div[style*="gap: 16px"] {
      gap: 12px !important;
    }

    div[style*="display: flex"] {
      align-items: stretch !important;
    }

    a,
    button {
      overflow-wrap: anywhere;
    }

    div[style*="font-size: 2.4rem"],
    strong[style*="font-size: 2rem"],
    strong[style*="font-size: 1.4rem"],
    strong[style*="font-size: 1.35rem"] {
      font-size: 1.35rem !important;
    }
  }
`;

function App() {
  useEffect(() => {
    applyThemeMode(loadUiSettings().themeMode);

    const syncTheme = () => applyThemeMode(loadUiSettings().themeMode);
    window.addEventListener("storage", syncTheme);
    window.addEventListener("smart-home-settings-change", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("smart-home-settings-change", syncTheme);
    };
  }, []);

  return (
    <BrowserRouter>
      <style>{globalAppStyles}</style>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Console />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
