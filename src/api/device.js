import { apiRequest } from "./client";
import { normalizeDevices } from "../utils/normalize";
import { deviceStatus } from "../mock/device";

const unwrap = (payload) => payload?.data ?? payload;
const asList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const getFirstHomeId = async () => {
  const homes = asList(unwrap(await apiRequest("/homes/mine")));
  return homes[0]?._id || homes[0]?.id || "";
};

const getHomeDevices = async () => {
  const homeId = await getFirstHomeId();
  if (!homeId) return [];

  return asList(unwrap(await apiRequest(`/devices?homeId=${encodeURIComponent(homeId)}`)));
};

const resolveDeviceId = async (deviceIdOrType) => {
  if (!["fan", "light"].includes(deviceIdOrType)) {
    return deviceIdOrType;
  }

  const devices = await getHomeDevices();
  const device = devices.find((item) => item.type === deviceIdOrType || item.name?.toLowerCase() === deviceIdOrType);
  return device?._id || device?.id || deviceIdOrType;
};

export const getDeviceStatus = async () => {
  try {
    const data = await getHomeDevices();
    return { data: normalizeDevices(data) };
  } catch (error) {
    return { data: { ...deviceStatus }, fallback: true, error };
  }
};

export const controlDevice = async (deviceId, action) => {
  try {
    const resolvedDeviceId = await resolveDeviceId(deviceId);
    const data = await apiRequest(`/devices/${resolvedDeviceId}/status`, {
      method: "PATCH",
      body: { action }
    });

    if (["fan", "light"].includes(deviceId)) {
      deviceStatus[deviceId] = action;
    }

    return { data };
  } catch (error) {
    deviceStatus[deviceId] = action;
    return { data: { deviceId, status: action }, fallback: true, error };
  }
};
