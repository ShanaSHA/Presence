import axios from "axios";

import {BASE_URL} from "../config"

// ✅ Create axios instance with authentication
const apiClient = axios.create({
  baseURL:BASE_URL,
});

// ✅ Attach Authorization Token to Every Request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No access token found. Requests may fail.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle API Response & Errors
const handleApiError = (error, context = "API Request") => {
  console.error(`❌ ${context} Error:`, error.response?.data || error.message);
  return null; // Prevent crashes by returning null instead of throwing errors
};

const leaveService = {
  /**
   * 📝 Get Leave Types
   */
  getLeaveTypes: async () => {
    try {
      const response = await apiClient.get("/leave-type/");
      return response.data || [];
    } catch (error) {
      return handleApiError(error, "Fetching Leave Types");
    }
  },

  /**
   * 📊 Get Leave Balance
   */
  getLeaveBalance: async () => {
    try {
      const response = await apiClient.get("/leavesummary/");
      return {
        balanceLeave: response.data?.available_leave || 0,
        usedLeave: response.data?.used_leave || 0,
      };
    } catch (error) {
      return handleApiError(error, "Fetching Leave Balance") || { balanceLeave: 0, usedLeave: 0 };
    }
  },

  /**
   * 📜 Get Leave History
   */
  getLeaveHistory: async () => {
    try {
      const response = await apiClient.get("/empleave/");
      console.log("🚀 API Response for Leave History:", response.data); // Debugging

      // Ensure response.data is an array before mapping
      if (!response.data || !Array.isArray(response.data)) {
        console.warn("⚠️ Unexpected response format:", response.data);
        return [];
      }

      return response.data.map((leave) => ({
        id: leave.id,
        type: leave.name,
        date: `${new Date(leave.start_date).toLocaleDateString("en-US")} - ${new Date(
          leave.end_date
        ).toLocaleDateString("en-US")}`,
        status: leave.status,
        reason: leave.reason,
        imageUrl: leave.image,
        cancellationRequest: leave.cancellation_request,
      }));
    } catch (error) {
      return handleApiError(error, "Fetching Leave History") || [];
    }
  }, // ✅ Added missing comma here

  /**
   * 📥 Submit Leave Request
   */
  submitLeaveRequest: async (leaveData) => {
    try {
      const formData = new FormData();
      formData.append("start_date", leaveData.startDate);
      formData.append("end_date", leaveData.endDate);
      formData.append("leave_type", leaveData.leaveType);
      formData.append("reason", leaveData.reason);

      if (leaveData.file) {
        formData.append("image", leaveData.file);
      }

      const response = await apiClient.post("/empleave/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      return handleApiError(error, "Submitting Leave Request");
    }
  },

  /**
   * ❌ Cancel Leave Request
   */
  cancelLeaveRequest: async (leaveId, reason) => {
    if (!reason || reason.trim() === "") {
      console.error("❌ Cancellation reason is required!");
      return Promise.reject({ error: "Cancellation reason is required!" });
    }

    try {
      const response = await apiClient.put(
        `/leave/cancel/${leaveId}/`,  // Changed the endpoint path format
        { cancellation_reason: reason },  // Changed the key to match what the API expects
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("✅ Leave Cancellation Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Cancellation Error Response:", error.response?.data);
      throw error; // Re-throw to allow proper error handling in component
    }
  },


  
  };
  

export default leaveService;
