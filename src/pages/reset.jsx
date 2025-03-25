import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/Reset"; // Import API function
import { Eye, EyeOff } from "lucide-react"; // Icons for password visibility

const ResetPassword = () => {
  const { uid, token } = useParams(); 
  console.log("Extracted uidb64:", uid, "Extracted token:", token);// Get uidb64 and token from URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async () => {
    setError("");
    setMessage("");
  
    if (password !== confirmPassword) {
      setError("❌ Passwords do not match!");
      return;
    }
  
    try {
      await resetPassword(uid, token, password, confirmPassword);
      setMessage("✅ Password reset successfully!");
  
      // Redirect to login after success
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.message || "❌ Failed to reset password.");
    }
  };
  
  return (
    <div className="flex h-screen justify-center items-center bg-cover bg-center" style={{ backgroundImage: "url('/bg-image.png')" }}>
      <div className="bg-[#252525] p-8 rounded-2xl shadow-lg w-96 text-white bg-opacity-80">
        <h2 className="text-2xl font-bold text-center mb-4">Reset Your Password</h2>
        <p className="text-center text-gray-400 mb-6">Enter a new password for your account.</p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}

        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-3 bg-white text-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="button" 
            className="absolute right-3 top-3 text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="mb-4 relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="w-full p-3 bg-white text-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button 
            type="button" 
            className="absolute right-3 top-3 text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button onClick={handleResetPassword} className="w-full text-white p-3 rounded-lg hover:bg-gray-600">
          Reset Password
        </button>

        <div className="mt-4 text-center">
          <button onClick={() => navigate("/")} className="text-gray-400 hover:underline">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
