import axios from "axios";

import {BASE_URL} from"../config" // Update if needed

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Fetch all leave policies
const fetchLeavePolicies = async () => {
    try {
        const response = await axios.get('http://192.168.251.51:8000/leave-policy');
        console.log(response.data);
        setPolicies(response.data);
    } catch (error) {
        console.error("Error fetching leave policies:", error);
    }
};


// Create a new leave policy
export const createLeavePolicy = async (policyData) => {
    try {
      console.log("Sending leave policy data:", policyData); // Log payload
      const response = await api.post("/leave-policy", policyData);
      console.log("Leave Policy Created:", response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("Error creating leave policy:", error.response.data);
      } else {
        console.error("Error:", error.message);
      }
      throw error;
    }
  };
  

// Update a leave policy
export const updateLeavePolicy = async (policyId, policyData) => {
  try {
    const response = await api.put(`/leave-requests/${policyId}/`, policyData);
    return response.data;
  } catch (error) {
    console.error("Error updating leave policy:", error);
    throw error;
  }
};

// Delete a leave policy
export const deleteLeavePolicy = async (policyId) => {
  try {
    await api.delete(`/leave-policy/${policyId}/`);
  } catch (error) {
    console.error("Error deleting leave policy:", error);
    throw error;
  }
};

export default api;
