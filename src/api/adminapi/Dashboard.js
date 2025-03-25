import axios from "axios";

import {BASE_URL} from "../config"// Backend URL

// Function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Refresh Access Token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null; // No refresh token available

  try {
    const response = await axios.post(`${BASE_URL}/token/refresh/`, { refresh: refreshToken });
    localStorage.setItem("accessToken", response.data.access); // Store new access token
    return response.data.access;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    localStorage.clear(); // Clear tokens on failure
    return null;
  }
};

// ✅ Fetch Dashboard Statistics with Auto Token Refresh
export const fetchDashboardStats = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admincount/`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Access token expired. Attempting refresh...");
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        return fetchDashboardStats(); // Retry request
      }
    }
    console.error("Error fetching dashboard stats:", error);
    return { employees: 0, hrUsers: 0, leaveRequests: 0, leaveCancellations: 0 };
  }
};

// ✅ Fetch Attendance Data with Auto Token Refresh
export const fetchAttendanceData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admstat/`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Access token expired. Attempting refresh...");
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        return fetchAttendanceData(); // Retry request
      }
    }
    console.error("Error fetching attendance data:", error);
    return [];
  }
};
