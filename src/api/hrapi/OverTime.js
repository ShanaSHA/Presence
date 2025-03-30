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

// API Functions
export const getOvertimeDashboard = async () => {
  try {
    const response = await api.get('/overtimeoverview/');
    return response.data;
  } catch (error) {
    console.error('Error fetching overtime dashboard', error);
    throw error;
  }
};

export const getEmployeesList = async () => {
    try {
      const response = await api.get('/employees/');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees list', error);
      throw error;
    }
  };

export const assignOvertime = async (payload) => {
  try {
    const response = await api.post('/overtimeempassign/', payload);
    return response.data;
  } catch (error) {
    console.error('Error assigning overtime', error);
    throw error;
  }
};

export const getEmployeeOvertime = async (employee_id) => {
    try {
      const response = await api.get(`/employee/overtime/${employee_id}/`);
      console.log("Employee Overtime Response:", response.data); // Debugging
      return response.data;
    } catch (error) {
      console.error("Error fetching employee overtime data", error);
      throw error;
    }
  };
  
  
export const generateOvertimeReport = async (filters) => {
    try {
      const response = await api.get('/overtimeoverview/', filters);
      return response.data;
    } catch (error) {
      console.error('Error generating overtime report', error);
      throw error;
    }
  };

export default api;
