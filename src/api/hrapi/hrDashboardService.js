import axios from "axios";

import {BASE_URL} from "../config"

const hrDashboardService = {
  /**
   * Get authentication headers
   * @returns {Object} Auth header
   */
  getAuthHeader: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("❌ No access token found.");
      return {}; // ✅ Fixed: Return an empty object instead of []
    }
    return { Authorization: `Bearer ${token}` }; // ✅ Fixed: Properly return the token
  },

  /**
   * Get dashboard statistics for HR
   * @returns {Promise<Object>} Dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const headers = hrDashboardService.getAuthHeader();
      console.log("Request Headers:", headers); // ✅ Debugging line

      const response = await axios.get(`${BASE_URL}/hrdashboard/`, { headers });
      return response.data;
    } catch (error) {
      console.error("Error fetching HR dashboard stats:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default hrDashboardService;
