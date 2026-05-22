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
import { applyThemeMode, loadUiSettings, SETTINGS_KEY } from "./utils/settings";

const globalThemeStyles = `
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
      <style>{globalThemeStyles}</style>
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
