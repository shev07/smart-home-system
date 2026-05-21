import { apiRequest } from "./client";

const unwrap = (payload) => payload?.data ?? payload;
const query = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined);
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : "";
};

export const homesApi = {
  listMine: () => apiRequest("/homes/mine").then(unwrap),
  create: (body) => apiRequest("/homes", { method: "POST", body }).then(unwrap),
  detail: (homeId) => apiRequest(`/homes/${homeId}`).then(unwrap),
  areas: (homeId) => apiRequest(`/homes/${homeId}/areas`).then(unwrap),
  createArea: (homeId, body) => apiRequest(`/homes/${homeId}/areas`, { method: "POST", body }).then(unwrap),
  updateArea: (homeId, areaId, body) =>
    apiRequest(`/homes/${homeId}/areas/${areaId}`, { method: "PATCH", body }).then(unwrap),
  deleteArea: (homeId, areaId) =>
    apiRequest(`/homes/${homeId}/areas/${areaId}`, { method: "DELETE" }).then(unwrap)
};

export const devicesApi = {
  list: (homeId, params = {}) => apiRequest(`/devices${query({ homeId, ...params })}`).then(unwrap),
  create: (body) => apiRequest("/devices", { method: "POST", body }).then(unwrap),
  control: (id, action) => apiRequest(`/devices/${id}/status`, { method: "PATCH", body: { action } }).then(unwrap),
  updateArea: (id, areaId) => apiRequest(`/devices/${id}/area`, { method: "PATCH", body: { areaId } }).then(unwrap),
  remove: (id) => apiRequest(`/devices/${id}`, { method: "DELETE" }).then(unwrap)
};

export const sensorsApi = {
  latest: (deviceId) => apiRequest(`/sensors/latest${query({ deviceId })}`).then(unwrap),
  devices: (deviceId) => apiRequest(`/sensors/devices${query({ deviceId })}`).then(unwrap),
  history: (sensorDeviceId, params = {}) =>
    apiRequest(`/sensors/history${query({ sensorDeviceId, ...params })}`).then(unwrap),
  updateStatus: (id, body) =>
    apiRequest(`/sensors/devices/${id}/status`, { method: "PATCH", body }).then(unwrap)
};

export const schedulesApi = {
  list: () => apiRequest("/schedules").then(unwrap),
  create: (body) => apiRequest("/schedules", { method: "POST", body }).then(unwrap),
  update: (id, body) => apiRequest(`/schedules/${id}`, { method: "PATCH", body }).then(unwrap),
  toggle: (id) => apiRequest(`/schedules/${id}/toggle`, { method: "PATCH" }).then(unwrap),
  remove: (id) => apiRequest(`/schedules/${id}`, { method: "DELETE" }).then(unwrap)
};

export const thresholdApi = {
  list: (params = {}) => apiRequest(`/threshold-rules${query(params)}`).then(unwrap),
  create: (body) => apiRequest("/threshold-rules", { method: "POST", body }).then(unwrap),
  update: (id, body) => apiRequest(`/threshold-rules/${id}`, { method: "PATCH", body }).then(unwrap),
  toggle: (id) => apiRequest(`/threshold-rules/${id}/toggle`, { method: "PATCH" }).then(unwrap),
  remove: (id) => apiRequest(`/threshold-rules/${id}`, { method: "DELETE" }).then(unwrap)
};

export const alertsApi = {
  list: (params = {}) => apiRequest(`/alerts${query(params)}`).then(unwrap),
  read: (id) => apiRequest(`/alerts/${id}/read`, { method: "PATCH" }).then(unwrap),
  readAll: (homeId) => apiRequest(`/alerts/read-all${query({ homeId })}`, { method: "PATCH" }).then(unwrap)
};

export const adminApi = {
  users: (params = {}) => apiRequest(`/admin/users${query(params)}`).then(unwrap),
  changeRole: (id, role) => apiRequest(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }).then(unwrap),
  homes: (params = {}) => apiRequest(`/admin/homes${query(params)}`).then(unwrap),
  createHome: (body) => apiRequest("/admin/homes", { method: "POST", body }).then(unwrap),
  addUserToHome: (homeId, body) => apiRequest(`/admin/homes/${homeId}/users`, { method: "POST", body }).then(unwrap),
  removeUserFromHome: (homeId, userId) =>
    apiRequest(`/admin/homes/${homeId}/users/${userId}`, { method: "DELETE" }).then(unwrap),
  devices: (params = {}) => apiRequest(`/admin/devices${query(params)}`).then(unwrap),
  unassignedDevices: () => apiRequest("/admin/devices/unassigned").then(unwrap),
  assignDevice: (id, body) => apiRequest(`/admin/devices/${id}/assign`, { method: "PATCH", body }).then(unwrap)
};
