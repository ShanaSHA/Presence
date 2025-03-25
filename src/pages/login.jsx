import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff } from "lucide-react"; // Icons for password visibility
import { login } from "../api/auth"; // Login API function
import { loginSchema } from "../validations/authValidation";

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(loginSchema) });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  // ✅ Handle Login
  const handleLogin = async (data) => {
    setError("");
    try {
      const response = await login(data.email, data.password);
      console.log("🔵 Login response:", response);

      // ✅ Store tokens securely
      localStorage.setItem("accessToken", response.access);
      localStorage.setItem("refreshToken", response.refresh);
      localStorage.setItem("userRole", response.role);

      console.log("✅ Stored Access Token:", localStorage.getItem("accessToken"));

      // ✅ Redirect based on role
      if (response.role === "admin") navigate("/dashboard");
      else if (response.role === "hr") navigate("/hrDashboard");
      else navigate("/employeedashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-cover bg-center" style={{ backgroundImage: "url('/bg-image.png')" }}>
      <div className="bg-[#252525] p-8 rounded-2xl shadow-lg w-96 text-white bg-opacity-80">
        <h2 className="text-2xl font-bold text-center mb-4">Welcome Back</h2>
        <p className="text-center text-gray-400 mb-6">Enter your credentials</p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit(handleLogin)}>
          <div className="mb-4">
            <input
              type="email"
              className="w-full p-3 bg-white text-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Email"
              {...register("email")}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 bg-white text-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Password"
              {...register("password")}
            />
            <button 
              type="button" 
              className="absolute right-3 top-3 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <div className="mt-4 text-right">
            <button type="button" onClick={() => navigate("/forgot-password")} className="text-gray-400 hover:underline">
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="w-full  text-white p-3 rounded-lg hover:bg-gray-600">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
