import axios from "axios";
import {BASE_URL} from "./config"
// Your backend URL

export const resetPassword = async (uid, token, newPassword, confirmPassword) => {
  try {
    const response = await axios.post(`${BASE_URL}/reset-password/`, {
      uid: uid,  // Match Django field name
      token: token,  // Match Django field name
      new_password: newPassword,  // Match Django field name
      confirm_password: confirmPassword,  // Match Django field name
    });

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "Server error" };
  }
};
