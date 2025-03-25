import axios from "axios";

import {BASE_URL} from "../config" // Your backend URL

// ✅ Helper Function: Get Authorization Headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Fetch HR Users (GET Request)
export const fetchHrUsers = async () => {
  try {
    console.log("📤 Fetching HR Users...");

    const response = await axios.get(`${BASE_URL}/hr-list/`, {
      headers: getAuthHeaders(),
    });

    console.log("✅ HR Users Fetched Successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error Fetching HR Users:", error.response?.data || error.message);

    // Handle Unauthorized (401) - Token might be expired
    if (error.response?.status === 401) {
      alert("❌ Unauthorized! Please log in again.");
      localStorage.clear();
      window.location.href = "/";
    }

    return [];
  }
};

// ✅ Add HR User (POST Request)
export const addHrUser = async (userData) => {
  try {
    // ✅ Ensure the request body matches backend expectations
    const requestBody = {
      email: userData.email,
      password: userData.password || "", // Send empty string if not provided
      role: userData.role.toLowerCase(), // Convert role to lowercase
      department: userData.department,
      name: userData.name,
    };

    console.log("📤 Adding HR User:", requestBody); // Debugging log

    const response = await axios.post(`${BASE_URL}/userview/`, requestBody, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    console.log("✅ HR User Added Successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error Adding HR User:", error.response?.data || error.message);

    // Handle Bad Request (400) - Likely missing fields
    if (error.response?.status === 400) {
      alert(`❌ Bad Request: ${error.response.data.error || "Please check your input fields."}`);
    }

    // Handle Unauthorized (401)
    if (error.response?.status === 401) {
      alert("❌ Unauthorized! Please log in again.");
      localStorage.clear();
      window.location.href = "/";
    }

    // Handle Internal Server Error (500)
    if (error.response?.status === 500) {
      alert("❌ Server Error! Please try again later.");
    }

    throw error;
  }
};
