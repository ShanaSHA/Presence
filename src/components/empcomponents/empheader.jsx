import React from "react";
import { Bell, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ title }) => {
  const navigate = useNavigate();

  const handleInfoClick = () => {
    navigate("/policyview");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
     
      {/* Notification & Info Icons */}
      <div className="relative flex items-center space-x-4">
        {/* Bell Icon with Badge */}
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            1
          </div>
        </div>
        {/* Info Icon - Clickable to navigate to policy management */}
        <div onClick={handleInfoClick} className="cursor-pointer hover:text-gray-800">
          <Info className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </div>
  );
}; 

export default Header;