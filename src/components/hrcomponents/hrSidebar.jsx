import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, CalendarClock, Clock, ChevronLeft, ChevronRight, Camera, User, X, AlarmClock, Users } from "lucide-react";
import { logout } from "../../api/logout";

const HrSidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("profileImage") || null;
  });

  useEffect(() => {
    localStorage.setItem("profileImage", profileImage);
  }, [profileImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    const isLoggedOut = await logout();
    if (isLoggedOut) {
      localStorage.removeItem("profileImage");
      navigate("/");
    }
  };

  return (
    <>
      <div className={`fixed left-0 top-0 h-full ${isSidebarOpen ? "w-64" : "w-20"} bg-gradient-to-b from-[#3a3839] to-[#494646] text-white transition-all duration-300 shadow-lg z-40 flex flex-col`}>
        
        {/* Profile Section */}
        <div className="p-6 flex flex-col items-center border-b border-gray-700/50">
          <div className="relative group mb-4 cursor-pointer" onClick={() => navigate("/hrprofile")}>
            <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center border-2 border-gray-600 shadow-md transition-all duration-300 hover:border-gray-400">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>

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
          
          {isSidebarOpen && (
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Hr User</p>
              <p className="text-xs text-gray-400">Human Resources</p>
            </div>
          )}
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
          className="absolute -right-3 top-32 bg-gray-500 text-white p-1.5 rounded-full shadow-lg hover:bg-gray-600 transition-colors duration-200 transform hover:scale-105 z-10"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <NavLink 
            to="/hrDashboard" 
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
            to="/selfportal" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-gray-600/80 to-gray-500/40 border-l-4 border-gray-400" 
                  : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-400/50"
              }`
            }
          >
            <User className={`w-5 h-5 transition-all ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
            {isSidebarOpen && <span className="text-sm font-medium">Self Portal</span>}
          </NavLink>
          
          <NavLink 
            to="/leaveRequests" 
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
            to="/attendances" 
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
            to="/shift" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-gray-600/80 to-gray-500/40 border-l-4 border-gray-400" 
                  : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-400/50"
              }`
            }
          >
            <CalendarClock className={`w-5 h-5 transition-all ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
            {isSidebarOpen && <span className="text-sm font-medium">Shift</span>}
          </NavLink>
          
          <NavLink 
            to="/overtime" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-gray-600/80 to-gray-500/40 border-l-4 border-gray-400" 
                  : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-400/50"
              }`
            }
          >
            <AlarmClock className={`w-5 h-5 transition-all ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
            {isSidebarOpen && <span className="text-sm font-medium">Overtime</span>}
          </NavLink>
          
          <NavLink 
            to="/usedleave" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-gray-600/80 to-gray-500/40 border-l-4 border-gray-400" 
                  : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-400/50"
              }`
            }
          >
            <CalendarClock className={`w-5 h-5 transition-all ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
            {isSidebarOpen && <span className="text-sm font-medium">Leaves</span>}
          </NavLink>
          
          <NavLink 
            to="/employees" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-gray-600/80 to-gray-500/40 border-l-4 border-gray-400" 
                  : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-400/50"
              }`
            }
          >
            <Users className={`w-5 h-5 transition-all ${isSidebarOpen ? "mr-3" : "mx-auto"}`} />
            {isSidebarOpen && <span className="text-sm font-medium">Employees</span>}
          </NavLink>
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="mt-auto p-4 border-t border-gray-700/50">
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

export default HrSidebar;