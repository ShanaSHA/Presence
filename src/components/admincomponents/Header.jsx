import React from "react";
import { Bell } from "lucide-react";

const Header = ({ title }) => {
  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="relative">
        <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
          1
        </div>
      </div>
    </div>
  );
};

export default Header;
