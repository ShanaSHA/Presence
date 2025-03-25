import axios from "axios";
import {BASE_URL} from "./config"
// ✅ API Base URL

// ✅ Create an Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach Access Token to Every Request
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Auto-Refresh Token on Expiry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("⚠️ Access token expired. Attempting refresh...");
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        apiClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Refresh Access Token Function
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    console.error("🔴 No refresh token available. User may need to log in.");
    return null;
  }

  try {
    const response = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
    localStorage.setItem("accessToken", response.data.access);
    console.log("✅ Token refreshed successfully.");

    return response.data.access;
  } catch (error) {
    console.error("🔴 Failed to refresh token:", error.response?.data || error.message);

    // ❌ Log out user if refresh fails
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");

    return null;
  }
};

// ✅ Login Function (Optimized)
export const login = async (email, password) => {
  try {
    const response = await apiClient.post("/login/", { email, password });
    console.log("🔵 Login Response:", response.data);

    // Ensure backend returns tokens and role
    if (!response.data.access || !response.data.refresh) {
      throw new Error("⚠️ Access token not received from backend.");
    }

    // ✅ Store tokens securely
    localStorage.setItem("accessToken", response.data.access);
    localStorage.setItem("refreshToken", response.data.refresh);
    localStorage.setItem("userRole", response.data.role);

    console.log("✅ Stored Access Token:", localStorage.getItem("accessToken"));
    console.log("✅ Stored Refresh Token:", localStorage.getItem("refreshToken"));

    // ✅ Manually update Axios headers after login
    apiClient.defaults.headers.Authorization = `Bearer ${response.data.access}`;

    return response.data;
  } catch (error) {
    console.error("🔴 Login error:", error.response?.data || error.message);

    // ✅ If network issue, provide a meaningful error message
    if (!error.response) {
      throw new Error("⚠️ Network error. Please check your connection.");
    }

    throw error;
  }
};

// ✅ Forgot Password Function
export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post("/forgot-password/", { email });
    console.log("📩 Forgot password email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("🔴 Forgot Password Error:", error.response?.data || error.message);
    throw error;
  }
};

export default apiClient;
