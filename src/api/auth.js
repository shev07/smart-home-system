import { apiRequest } from "./client";
import { demoUsers, updateDemoUserPassword } from "../mock/auth";

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";
const DEMO_FALLBACK_ENABLED = import.meta.env.VITE_ENABLE_DEMO_FALLBACK === "true";

const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const createDemoToken = (username) => `demo-token-${username}`;

const findDemoUser = ({ username, phone }) =>
  demoUsers.find((user) => {
    const matchUsername = username ? user.username === username.trim() : true;
    const matchPhone = phone ? user.phone === phone.trim() : true;
    return matchUsername && matchPhone;
  });

export const loginUser = async ({ username, password }) => {
  clearSession();
  const email = username?.trim();

  try {
    if (!email?.includes("@")) {
      throw new Error("Please login with your account email.");
    }

    const payload = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password }
    });

    const data = payload?.data ?? payload;
    const token = data?.token || createDemoToken(username);
    const user = data?.user || data || { username: email, email };
    saveSession(token, user);

    return { data, fallback: false };
  } catch (error) {
    if (!DEMO_FALLBACK_ENABLED) {
      throw error;
    }

    const user = findDemoUser({ username });

    if (!user || user.password !== password) {
      throw new Error("Invalid username or password.");
    }

    saveSession(createDemoToken(user.username), {
      username: user.username,
      fullName: user.fullName,
      phone: user.phone
    });

    return {
      data: { token: createDemoToken(user.username), user },
      fallback: true,
      error
    };
  }
};

export const registerUser = async ({ name, email, password, phoneNumber }) => {
  const payload = await apiRequest("/auth/register", {
    method: "POST",
    body: { name, email, passwordHash: password, phoneNumber }
  });
  const data = payload?.data ?? payload;
  const token = data?.token;
  const user = data?.user || data;

  if (token) {
    saveSession(token, user);
  }

  return data;
};

export const getCurrentUser = async () => {
  const payload = await apiRequest("/auth/me");
  const data = payload?.data ?? payload;
  if (data) {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  }
  return data;
};

export const verifyRecoveryIdentity = async ({ username, phone }) => {
  try {
    const data = await apiRequest("/auth/forgot-password/verify", {
      method: "POST",
      body: { username, phone }
    });

    return { data, fallback: false };
  } catch (error) {
    const user = findDemoUser({ username, phone });

    if (!user) {
      throw new Error("Username and phone number do not match any account.");
    }

    return {
      data: {
        recoveryId: `demo-recovery-${user.username}`,
        username: user.username,
        email: user.email || `${user.username}@demo.local`,
        message: "Identity verified. You can set a new password now."
      },
      fallback: true,
      error
    };
  }
};

export const resetPassword = async ({ username, phone, newPassword }) => {
  try {
    const data = await apiRequest("/auth/reset-password", {
      method: "POST",
      body: { username, phone, newPassword }
    });

    return { data, fallback: false };
  } catch (error) {
    const user = findDemoUser({ username, phone });

    if (!user) {
      throw new Error("Username and phone number do not match any account.");
    }

    updateDemoUserPassword(user.username, newPassword);

    return {
      data: {
        message: "Password updated successfully. You can login with the new password now."
      },
      fallback: true,
      error
    };
  }
};

export const logoutUser = () => {
  clearSession();
};

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    clearSession();
    return null;
  }
};

export const isAuthenticated = () => Boolean(localStorage.getItem(TOKEN_KEY));
