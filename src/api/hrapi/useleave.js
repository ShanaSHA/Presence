import axios from "axios";

import {BASE_URL } from "../config"

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add Authorization header dynamically
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("❌ No access token found.");
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

const leaveService = {
  /**
   * Get available leave types
   */
  getLeaveTypes: async () => {
    try {
      const response = await axiosInstance.get("/leave-types/", {
        headers: getAuthHeader()
      });
      console.log("✅ Fetched Leave Types:", response.data);
      return response.data; // Ensure this returns an array
    } catch (error) {
      console.error("❌ Error fetching leave types:", error);
      throw error;
    }
  },

  /**
   * Get employee leave balances
   */
  getLeaveBalances: async () => {
    try {
      const response = await axiosInstance.get("/empleavebalance/", {
        headers: getAuthHeader()
      });
      return response.data.leave_balance;
    } catch (error) {
      console.error("❌ Error fetching leave balances:", error);
      throw error;
    }
  },

  /**
   * Submit a leave request
   */
  submitLeaveRequest: async (leaveData) => {
    try {
      const response = await axiosInstance.post("/employee/leave-request/", leaveData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error submitting leave request:", error);
      throw error;
    }
  }
};

export default leaveService;
