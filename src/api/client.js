const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

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
