const getDefaultApiBaseUrl = () => {
  const { protocol, hostname } = window.location;
  const backendProtocol = protocol === "https:" ? "https:" : "http:";
  return `${backendProtocol}//${hostname}:5000/api`;
};

const normalizeConfiguredApiBaseUrl = (value) => {
  if (!value) return "";

  const trimmed = value.replace(/\/+$/, "");
  const pageHostname = window.location.hostname;
  const isLanPage = pageHostname !== "localhost" && pageHostname !== "127.0.0.1";

  if (isLanPage) {
    return trimmed
      .replace("://localhost:", `://${pageHostname}:`)
      .replace("://127.0.0.1:", `://${pageHostname}:`);
  }

  return trimmed;
};

const API_BASE_URL =
  normalizeConfiguredApiBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
  getDefaultApiBaseUrl();

const buildHeaders = (hasBody) => {
  const headers = {};
  const token = localStorage.getItem("token");

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export async function apiRequest(path, options = {}) {
  const { body, headers, ...rest } = options;
  const hasBody = body !== undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...buildHeaders(hasBody),
      ...headers
    },
    body: hasBody ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const code = typeof payload === "string" ? "" : payload?.code;
    const messageFromPayload = typeof payload === "string" ? payload : payload?.message;
    if (response.status === 401 && /token/i.test(messageFromPayload || code || "")) {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
    }

    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || "Request failed";

    throw new Error(message);
  }

  return payload;
}

export { API_BASE_URL };
