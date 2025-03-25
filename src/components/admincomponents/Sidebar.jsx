import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, CalendarClock, Clock, FileText, ChevronLeft, ChevronRight, Camera, User, X } from "lucide-react";
import { logout } from "../../api/logout"; // Import logout API

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Load profile image from localStorage
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("profileImage") || null;
  });

  useEffect(() => {
    localStorage.setItem("profileImage", profileImage); // Save image to localStorage
  }, [profileImage]);

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];  
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); // Update state with new image
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logout with API
  const handleLogout = async () => {
    const isLoggedOut = await logout(); // Call API
    if (isLoggedOut) {
      localStorage.removeItem("profileImage"); // Remove image on logout
      navigate("/"); // Redirect to Login
    }
  };

  return (
    <>
      <div className={`${isSidebarOpen ? "w-64" : "w-20"} bg-gradient-to-b from-[#3a3839] to-[#494646] text-white transition-all duration-300 relative min-h-screen shadow-lg`}>
        
        {/* Profile Section */}
        <div className="p-6 flex flex-col items-center border-b border-gray-700/50">
          <div className="relative group mb-4 cursor-pointer" onClick={() => navigate("/profile")}>
            <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center border-2 border-gray-600 shadow-md transition-all duration-300 hover:border-gray-400">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>

            {/* Upload New Image */}
            <label className="absolute bottom-0 right-0 bg-gray-500 p-1.5 rounded-full cursor-pointer group-hover:bg-gray-600 transition-all duration-200 shadow-md transform group-hover:scale-110">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </label>
          </div>
        </div>

        {/* App Logo */}
        <div className="p-4 border-b border-gray-700/50">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 bg-gray-500 text-white text-xl font-bold rounded-full flex items-center justify-center shadow-md">
                P<sup className="text-xs">+</sup>
              </div>
              <h1 className="text-sm font-bold tracking-wider">PRESENCE</h1>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              P<sup className="text-xs">+</sup>
            </div>
          )}
        </div>

        {/* Sidebar Toggle Button */}
        <button 
          onClick={toggleSidebar} 
          className="absolute -right-3 top-32 bg-gray-500 text-white p-1.5 rounded-full shadow-lg hover:bg-gray-600 transition-colors duration-200 transform hover:scale-105"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Sidebar Navigation */}
        <nav className="py-6 space-y-1.5">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-gray-600/80 to-gray-500/40 border-l-4 border-gray-400" 
                  : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-400/50"
              }`
            }
          >
            <LayoutDashboard className={`w-5 h-5 transition-all ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
            {isSidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
          </NavLink>
          
          <NavLink 
            to="/hrUsers" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-gray-600/80 to-gray-500/40 border-l-4 border-gray-400" 
                  : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-400/50"
              }`
            }
          >
            <User className={`w-5 h-5 transition-all ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
            {isSidebarOpen && <span className="text-sm font-medium">HR Users</span>}
          </NavLink>
          
          <NavLink 
            to="/leaveRequest" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-gray-600/80 to-gray-500/40 border-l-4 border-gray-400" 
                  : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-400/50"
              }`
            }
          >
            <CalendarClock className={`w-5 h-5 transition-all ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
            {isSidebarOpen && <span className="text-sm font-medium">Leave Request</span>}
          </NavLink>
          
          <NavLink 
            to="/attendance" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-gray-600/80 to-gray-500/40 border-l-4 border-gray-400" 
                  : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-400/50"
              }`
            }
          >
            <Clock className={`w-5 h-5 transition-all ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
            {isSidebarOpen && <span className="text-sm font-medium">Attendance</span>}
          </NavLink>
          
          <NavLink 
            to="/policy" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-gray-600/80 to-gray-500/40 border-l-4 border-blue-400" 
                  : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-400/50"
              }`
            }
          >
            <FileText className={`w-5 h-5 transition-all ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
            {isSidebarOpen && <span className="text-sm font-medium">Policy Management</span>}
          </NavLink>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-8 left-0 right-0 px-4">
          <button 
            onClick={() => setShowLogoutPopup(true)} 
            className={`flex items-center text-gray-300 hover:text-white hover:bg-red-500/30 rounded-lg py-2.5 px-4 transition-all duration-200 w-full ${isSidebarOpen ? "justify-start" : "justify-center"}`}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl transform transition-all duration-300 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Confirm Logout</h2>
              <button 
                onClick={() => setShowLogoutPopup(false)} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="my-4 pb-4 border-b border-gray-100">
              <p className="text-sm text-gray-600">Are you sure you want to log out of your account?</p>
            </div>
            <div className="flex justify-end mt-2 gap-3">
              <button 
                onClick={() => setShowLogoutPopup(false)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-colors font-medium shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Sidebar;