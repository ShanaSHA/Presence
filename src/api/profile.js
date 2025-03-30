import axios from "axios";
import { BASE_URL } from "./config";

class ProfileService {
  // ✅ Get authenticated user's profile
  static async getProfile() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await axios.get(`${BASE_URL}/empprofile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Update profile image
  static async updateProfileImage(imageFile) {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await axios.patch(`${BASE_URL}/empprofile/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Error handling method
  static handleError(error) {
    if (error.response) {
      console.error("Profile API Error:", error.response.data);

      if (error.response.status === 401) {
        console.warn("⚠️ Unauthorized: Logging out...");
        localStorage.clear();
      
      }

      throw error.response.data;
    } else if (error.request) {
      console.error("❌ No response received from server:", error.request);
      throw new Error("No response from server. Please try again later.");
    } else {
      console.error("❌ Error setting up request:", error.message);
      throw new Error("An error occurred. Please try again.");
    }
  }
}

export default ProfileService;
