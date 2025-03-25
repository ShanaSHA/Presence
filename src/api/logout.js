import axios from "axios";
import {BASE_URL} from "./config"

// ✅ Function to Log Out User
export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    console.log("🔎 Refresh Token Before Logout:", refreshToken);
    console.log("🔎 Access Token Before Logout:", accessToken);

    if (!refreshToken) {
      console.error("❌ No refresh token found! User might already be logged out.");
      return false;
    }

    const response = await axios.post(
      `${BASE_URL}/logout/`,
      { refresh: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, 
        },
      }
    );

    if (response.status === 200) {
      console.log("✅ Logout Successful");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      return true;
    }
  } catch (error) {
    console.error("🔴 Logout Error:", error.response?.data || error.message);
    return false;
  }
};

