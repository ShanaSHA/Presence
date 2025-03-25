import axios from "axios";
import {BASE_URL} from "../config"
// Base URL for API calls

// Authorization Header
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken"); // Standardized key name
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const overtimeService = {
  /**
   * Get overtime statistics grouped by month
   * @returns {Promise<Object>} Monthly overtime data
   */
  getOvertimeStats: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/empovertime/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching overtime stats:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get all overtime assignments (upcoming, missed, completed)
   * @returns {Promise<Object>} Overtime assignments data
   */
  getOvertimeAssignments: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/empoverstat/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching overtime assignments:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Format overtime data for chart display
   * @param {Object} data - Raw data from API
   * @returns {Array} Formatted data for chart
   */
  formatChartData: (data) => {
    if (!data || !data.monthly_overtime) return [];

    const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();

    return allMonths.map((month) => ({
      month,
      hours: data.monthly_overtime[month] || 0,
      year: currentYear,
      details: [] // Placeholder for future weekly details
    }));
  },

  /**
   * Format overtime assignments for display
   * @param {Object} data - Raw data from API
   * @returns {Object} Formatted upcoming, due, and completed overtime
   */
  formatAssignments: (data) => {
    if (!data) return { upcoming: [], due: [], completed: [] };

    const formatOvertimeItem = (item, status) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      hours: item.hours,
      time: `18:00-${(18 + item.hours).toString().padStart(2, "0")}:00`,
      reason: item.reason || "Not specified",
      status
    });

    return {
      upcoming: (data.upcoming_overtime || []).map((item) => formatOvertimeItem(item, "Upcoming")),
      due: (data.missed_overtime || []).map((item) => formatOvertimeItem(item, "Due")),
      completed: (data.completed_overtime || []).map((item) => ({
        period: new Date(item.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        hours: item.hours,
        
        status: item.reason 
      }))
    };
  }
};

export default overtimeService;
