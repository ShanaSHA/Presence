import axios from "axios";

import {BASE_URL} from "../config" // Update if needed

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
      // window.location.href = "/login"; // Uncomment if you want to redirect
    }
    return Promise.reject(error);
  }
);

// Employee services
export const employeeService = {
  // Get all employees
  getAllEmployees: async () => {
    try {
      const response = await api.get("/employees/");
      return response.data;
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },
};

// Leave services
export const leaveService = {
  // Get available leave types for an employee
  getAvailableLeaveTypes: async (employeeId) => {
    try {
      const response = await api.get("/leave-types/dropdown/", {
        params: { employee_id: employeeId }, // Pass required params
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching leave types:", error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ FIXED: Submit new leave request
  // In leaveService.js
  createLeaveRequest: async (leaveData) => {
    try {
      const response = await api.post("/hrempleavecreate/", leaveData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("Backend Error Response:", error.response.data);
      }
      console.error("Error creating leave request:", error);
      throw error;
    }
  },
  // Approve or reject leave request
  approveRejectLeave: async (leaveId, action, rejectReason = "") => {
    try {
      const response = await api.post(`/approve-reject-leave/${leaveId}/`, {
        action, // 'approve' or 'reject'
        reject_reason: rejectReason,
      });
      return response.data;
    } catch (error) {
      console.error("Error approving/rejecting leave:", error);
      throw error;
    }
  },

  // Approve or reject leave cancellation
  approveRejectCancellation: async (leaveId, action, rejectReason = "") => {
    try {
      const response = await api.post(`/approve-reject-cancellation/${leaveId}/`, {
        action, // 'approve' or 'reject'
        reject_reason: rejectReason,
      });
      return response.data;
    } catch (error) {
      console.error("Error handling cancellation:", error);
      throw error;
    }
  },

  // Get leave history
  getLeaveHistory: async () => {
    try {
      const response = await api.get("/leave-history/");
      return response.data;
    } catch (error) {
      console.error("Error fetching leave history:", error);
      throw error;
    }
  },

  // Get pending leave requests
  getPendingLeaves: async () => {
    try {
      const response = await api.get("/hrleaverequestview/");
      return response.data;
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
      throw error;
    }
  },

  // Get pending cancellation requests
  getPendingCancellations: async () => {
    try {
      const response = await api.get("/leavecancellationview/");
      return response.data;
    } catch (error) {
      console.error("Error fetching cancellation requests:", error);
      throw error;
    }
  },
};

export default api;
