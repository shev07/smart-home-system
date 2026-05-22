export const SETTINGS_KEY = "smart-home-ui-settings";
export const TEMP_THRESHOLD_KEY = "smart-home-temp-threshold";

export const defaultSettings = {
  temperatureThreshold: 32,
  refreshInterval: 5,
  chartPoints: 60,
  alertNotifications: true,
  themeMode: "light"
};

export const loadUiSettings = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const legacyThreshold = Number(localStorage.getItem(TEMP_THRESHOLD_KEY));

    return {
      ...defaultSettings,
      ...parsed,
      temperatureThreshold:
        Number.isFinite(legacyThreshold) && legacyThreshold > 0
          ? legacyThreshold
          : parsed.temperatureThreshold || defaultSettings.temperatureThreshold
    };
  } catch {
    return defaultSettings;
  }
};

export const applyThemeMode = (themeMode) => {
  document.documentElement.dataset.theme = themeMode;
  document.body.style.background = themeMode === "dark" ? "#020617" : "#f8fafc";
};
