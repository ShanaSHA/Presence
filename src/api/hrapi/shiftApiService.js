import axios from "axios";
import { BASE_URL } from "../config";

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
      // window.location.href = "/login"; // Uncomment if you want an auto-redirect
    }
    return Promise.reject(error);
  }
);

const shiftApiService = {
  fetchEmployees: async () => {
    try {
      const response = await api.get("/employees/");
      return response.data;
    } catch (error) {
      console.error("Error fetching employees:", error.response?.data?.message || error.message);
      throw error;
    }
  },

  fetchWorkingHours: async () => {
    try {
      const response = await api.get("/working-hours/");
      return response.data;
    } catch (error) {
      console.error("Error fetching working hours:", error.response?.data?.message || error.message);
      throw error;
    }
  },

  assignShift: async (shiftData) => {
    try { 
      console.log('Sending shiftData:', shiftData);

      console.log("Sending Shift Data:", JSON.stringify(shiftData));
      const response = await api.post("/assign-shift/", shiftData);
      console.log("Response from Backend:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error assigning shift:", error.response?.data || error.message);
      throw error;
    }
    
  },
     
  updateShiftAssignment: async (assignmentId, updateData) => {
    try {
      const response = await api.put(`/assign-shift/${assignmentId}/`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating shift assignment:", error.response?.data?.message || error.message);
      throw error;
    }
  },

  deleteAssignment: async (assignmentId) => {
    try {
      const response = await api.delete(`/assign-shift/${assignmentId}/`);
      return response.data;
    } catch (error) {
      console.error("Error deleting shift assignment:", error.response?.data?.message || error.message);
      throw error;
    }
  },

  getShiftAssignmentsByDate: async (date) => {
    try {
      const response = await api.get("/assignview/", {
        params: { date },
      });
      return response.data;
    } catch (error) {
      return []; // Return empty array if no shifts
    }
  },
};

export default shiftApiService;
