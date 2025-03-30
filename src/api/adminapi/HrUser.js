import axios from "axios";
import { BASE_URL } from "../config";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (token expired)
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const fetchHrUsers = async () => {
  try {
    const response = await apiClient.get("/hr-list/");
    return response.data;
  } catch (error) {
    console.error("Error fetching HR users:", error);
    throw error;
  }
};

export const getDesignations = async () => {
  try {
    const response = await apiClient.get("/hrdesignation/");
    return response.data;
  } catch (error) {
    console.error("Error fetching designations:", error);
    throw error;
  }
};

export const getCommunities = async () => {
  try {
    const response = await apiClient.get("/hrcommunity/");
    return response.data;
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
};

export const addHrUser = async (userData) => {
  try {
    const requestBody = {
      name: userData.name,
      email: userData.email,
      role: userData.role.toLowerCase(),
      department: userData.department,
      community: userData.community_id,
      emp_num: userData.emp_num,
      designation: userData.designation_id,
      hire_date: userData.hire_date,
     
    };

    const response = await apiClient.post("/userview/", requestBody);
    return response.data;
  } catch (error) {
    console.error("Error adding HR user:", error);
    throw error;
  }
};