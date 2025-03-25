import axios from "axios";
import {BASE_URL} from "./config"
// Update if needed

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important if using session-based authentication
});

// Request Interceptor - Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found. Request may be unauthorized.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle Unauthorized (401) Errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("Token expired, logging out...");
      localStorage.removeItem("accessToken"); // Remove invalid token
    //   window.location.href = "/login"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

// Policy related API calls
const policyService = {
  // Get all policies (leave, holidays, shifts)
  getAllPolicies: async () => {
    try {
      const response = await api.get("/policy-view/"); // Use `api` instead of `apiClient`
      return response.data;
    } catch (error) {
      console.error("Error fetching policies:", error.response?.data || error.message);
      throw error;
    }
  }
};

export { policyService };
