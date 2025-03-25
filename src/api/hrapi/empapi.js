import axios from "axios";

// Backend URL
import {BASE_URL} from "../config"

// Centralized Logout Function
export const handleLogout = () => {
  console.warn("🔴 Logging out user...");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/"; // Redirect to login
};

// Helper function to get auth token
export const getAuthToken = () => localStorage.getItem("accessToken");

// Create axios instance with default config
const apiClient = axios.create({
  baseURL:BASE_URL,
});

// Add request interceptor to attach the token automatically
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await getNewAccessToken();
        if (newToken) {
          // Update the original request with the new token
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Refresh Token Function
export const getNewAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.error("❌ No refresh token available. Logging out...");
    handleLogout();
    return null;
  }

  try {
    const response = await axios.post(`${BASE_URL}/token/refresh/`, { refresh: refreshToken });
    const newAccessToken = response.data.access;

    if (newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken); // Store new token
      return newAccessToken;
    }
  } catch (error) {
    console.error("❌ Failed to refresh token:", error.response?.data || error.message);
    handleLogout();
  }

  return null;
};

// API Functions
// Fetch Employees
export const getEmployees = async () => {
  try {
    const response = await apiClient.get("/hrempview/");
    console.log("✅ Employees Data:", response.data); // Debugging
    return response.data || [];
  } catch (error) {
    console.error("❌ Error fetching employees:", error.response?.data || error.message);
    return [];
  }
};

// Add Employee
export const addEmployee = async (employeeData) => {
  if (!employeeData.email || !employeeData.department || !employeeData.name || !employeeData.emp_num || !employeeData.hire_date) {
    console.error("❌ Missing required fields: email, department, name, emp_num, hire_date");
    return null;
  }

  console.log("📤 Sending employeeData:", employeeData); // Debugging

  try {
    const response = await apiClient.post("/userview/", employeeData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Employee added:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding employee:", error.response?.data || error.message);
    return null;
  }
};

// Get Designations
export const getDesignations = async () => {
  try {
    const response = await apiClient.get("/hrdesignation/");
    return response.data;
  } catch (error) {
    console.error("Error fetching designations:", error);
    return [];
  }
};

// Get Communities
export const getCommunities = async () => {
  try {
    const response = await apiClient.get("/hrcommunity/");
    return response.data;
  } catch (error) {
    console.error("Error fetching communities:", error);
    return [];
  }
};

// Export API functions
export default {
  getEmployees,
  addEmployee,
  getDesignations,
  getCommunities,
  handleLogout,
  getAuthToken,
  getNewAccessToken,
};