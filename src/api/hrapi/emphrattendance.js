import axios from "axios";
import { BASE_URL } from "../config"; // Update if needed

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

// Attendance API calls
const attendanceAPI = {
  // Get attendance dashboard data with optional date filtering
  getDashboard: async (startDate, endDate, department) => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (department) params.department = department;

      const response = await api.get('/attendancedashboard/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance dashboard:', error);
      throw error;
    }
  },

  // Get pending attendance requests
  getRequests: async () => {
    try {
      const response = await api.get('/attendance/requests/');
      return response.data.pending_attendance_requests || [];
    } catch (error) {
      console.error('Error fetching attendance requests:', error);
      throw error;
    }
  },

  // Generate reports based on type and date range
  generateReport: async (reportType, startDate, endDate) => {
    try {
      const params = {
        type: reportType,
        start_date: startDate,
        end_date: endDate
      };

      const response = await api.get('/attendancereports/', { params });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  // Get employee's attendance details
  getEmployeeAttendance: async (employeeId) => {
    try {
      const response = await api.get(`/employee/${employeeId}/attendance/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee ${employeeId} attendance:`, error);
      throw error;
    }
  },

  // Add attendance record for an employee
  // api/hrapi/emphrattendance.js
addAttendanceRecord: async (employee_id, recordData) => {
    try {
      const response = await api.post(`/attendance/add/${employee_id}/`, recordData);
      return response.data;
    } catch (error) {
      console.error('Error adding attendance record:', error);
      throw error;
    }
  },

  // Update attendance request status (approve/reject)
  updateRequestStatus: async (leave_id, status) => {
    try {
      const response = await api.post(`/approve-reject-leave/${leave_id}/`, {
        status: status // 'approved' or 'rejected'
      });
      return response.data;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }
};

export default attendanceAPI;
