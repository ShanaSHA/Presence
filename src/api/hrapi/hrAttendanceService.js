import axios from "axios";

import {BASE_URL} from"../config"// Update if needed

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
const transformAttendanceData = (data) => {
    const todayRecord = data.today_record || {};
    return {
      checkIn: data.check_in || 0,
      checkOut: data.check_out || 0,
      overTime: `${data.total_overtime_hours || 0} hrs`,
      lateHours: `${data.late_days || 0} hrs`,
      attendancePercentage: data.attendance_percentage || 0,
      presentDays: data.present_days || 0,
      absentDays: data.absent_days || 0,
      lateDays: data.late_days || 0,
      totalDays: data.total_days || 0,
    };
  };
  

  
  // ✅ Default Data in Case of API Failure
  const getDefaultAttendanceData = () => ({
    checkIn: "0 hrs",
    checkOut: "0 hrs",
    overTime: "0 hrs",
    lateHours: "0 hrs",
    attendancePercentage: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalDays: 0,
  });
  
  /**
   * 📊 Fetch Monthly Attendance Stats
   */
  const getMonthlyAttendanceStats = async () => {
    try {
      const response = await api.get("/hr/attendance-stats/");
      return transformAttendanceData(response.data);
    } catch (error) {
      console.error("❌ Error fetching attendance data:", error);
      return getDefaultAttendanceData();
    }
  };
  
  // ✅ Export Service
  const hrAttendanceService = { getMonthlyAttendanceStats };
  export default hrAttendanceService;