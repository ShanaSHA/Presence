
import axios from "axios";
import { BASE_URL } from "../config"; // Backend URL

// Function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Refresh Access Token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null; // No refresh token available

  try {
    const response = await axios.post(`${BASE_URL}/token/refresh/`, { refresh: refreshToken });
    localStorage.setItem("accessToken", response.data.access); // Store new access token
    return response.data.access;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    localStorage.clear(); // Clear tokens on failure
    return null;
  }
};

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Timeout to prevent hanging requests
});

// ✅ Add Axios Interceptor to Refresh Token on Expired Access
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(error.config); // Retry failed request with new token
      }
    }
    return Promise.reject(error);
  }
);

// ✅ Utility function to handle API errors
const handleApiError = (error) => {
  console.error("API Error:", error?.response?.data || error.message);
  throw new Error(error?.response?.data?.message || "Something went wrong");
};

// ✅ Fetch public holidays by year
export const fetchHolidays = async (year) => {
  try {
    const response = await api.get("/public-holidays/", { params: { year }, headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ✅ Create a new holiday
export const createHoliday = async (holidayData) => {
  try {
    const response = await api.post(
      "/public-holidays/",
      {
        name: holidayData.name,
        date: holidayData.date,
        status: holidayData.status.toLowerCase(),
        leave_type: holidayData.type,
        community: holidayData.community || "Other",
        description: holidayData.description || "",
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ✅ Fetch community list
export const getCommunities = async () => {
  try {
    const response = await api.get("/hrcommunity/", { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ✅ Fetch leave types
export const fetchLeaveTypes = async () => {
  try {
    const response = await api.get("/policyleavetype/", { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ✅ Create a new leave type
export const createLeaveType = async (leaveTypeData) => {
  try {
    const response = await api.post(
      "/policyleavetype/",
      {
        leave: leaveTypeData.name,
        color: leaveTypeData.color,
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export default api;
