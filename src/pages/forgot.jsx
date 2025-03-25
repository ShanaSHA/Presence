import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/auth"; // Import forgot password API function

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      await forgotPassword(email);
      alert("📩 A reset link has been sent to your email.");
      
      // ✅ Redirect to Login after success
      setTimeout(() => {
        navigate("/");
      }, 3000);
      
    } catch (err) {
      alert(err.response?.data?.message || "❌ Email does not exist. Please enter a valid email.");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-cover bg-center" style={{ backgroundImage: "url('/bg-image.png')" }}>
      <div className="bg-[#252525] p-8 rounded-2xl shadow-lg w-96 text-white bg-opacity-80">
        <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>
        <p className="text-center text-gray-400 mb-6">Enter your email to receive a reset link.</p>

        <div className="mb-4">
          <input
            type="email"
            className="w-full p-3 bg-white text-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button onClick={handleForgotPassword} className="w-full text-white p-3 rounded-lg hover:bg-gray-600">
          Send Reset Link
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

export default ForgotPassword;
