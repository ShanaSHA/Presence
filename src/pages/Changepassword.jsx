import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Import API function
import { Eye, EyeOff } from "lucide-react"; // Icons for password visibility

const ChangePassword = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleChangePassword = async () => {
    setError("");
    setMessage("");

    if (newPassword !== confirmNewPassword) {
      setError("❌ New passwords do not match!");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword, confirmNewPassword);
      setMessage("✅ Password changed successfully!");

      // Redirect to profile after success
      setTimeout(() => {
        navigate("/profile");
      }, 3000);
    } catch (err) {
      setError(err.message || "❌ Failed to change password.");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-cover bg-center" style={{ backgroundImage: "url('/bg-image.png')" }}>
      <div className="bg-[#252525] p-8 rounded-2xl shadow-lg w-96 text-white bg-opacity-80">
        <h2 className="text-2xl font-bold text-center mb-4">Change Password</h2>
        <p className="text-center text-gray-400 mb-6">Update your account password.</p>

        {/* Error / Success Messages */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}

        {/* Current Password Input */}
        <div className="mb-4 relative">
          <input
            type={showCurrentPassword ? "text" : "password"}
            className="w-full p-3 bg-gray-200 text-black border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 pr-10"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <button 
            type="button" 
            className="absolute inset-y-0 right-3 flex items-center text-gray-600"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* New Password Input */}
        <div className="mb-4 relative">
          <input
            type={showNewPassword ? "text" : "password"}
            className="w-full p-3 bg-gray-200 text-black border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 pr-10"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button 
            type="button" 
            className="absolute inset-y-0 right-3 flex items-center text-gray-600"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Confirm New Password Input */}
        <div className="mb-4 relative">
          <input
            type={showConfirmNewPassword ? "text" : "password"}
            className="w-full p-3 bg-gray-200 text-black border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 pr-10"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          <button 
            type="button" 
            className="absolute inset-y-0 right-3 flex items-center text-gray-600"
            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
          >
            {showConfirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Change Password Button */}
        <button 
          onClick={handleChangePassword} 
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Change Password
        </button>

        {/* Back to Profile */}
        <div className="mt-4 text-center">
          <button onClick={() => navigate("/profile")} className="text-gray-400 hover:underline">
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
