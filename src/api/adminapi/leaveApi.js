import axios from "axios";

// Set your backend base URL
import {BASE_URL} from "../config"

// Create an Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found. Request may be unauthorized.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Function to get all leave requests
export const fetchLeaveRequests = async () => {
  try {
    const response = await api.get("/leave-requests/");
    return response.data;
  } catch (error) {
    console.error("Error fetching leave requests:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to approve or reject a leave request

export const  manageLeaveRequest = async (leaveId, action) => {
  try {
    const response = await api.post(
      `/leave-requests/${leaveId}/`, 
      JSON.stringify({ action }), 
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating leave request:", error.response ? error.response.data : error.message);
    throw error;
  }
};


// Function to approve or reject a cancellation request
export const manageCancellationRequest = async (leaveId, action) => {
  try {
    const response = await api.post(`/leave-requests/${leaveId}/cancel/`, { action });
    return response.data;
  } catch (error) {
    console.error("Error updating cancellation request:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default api;
