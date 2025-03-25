import React, { useState, useEffect } from 'react';
import { Bell, Clock, Timer, AlertCircle, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/hrcomponents/hrSidebar';
import Header from '../../components/hrcomponents/hrHeader';
import hrAttendanceService from '../../api/hrapi/hrAttendanceService';

const SelfPortal = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    checkIn: "0 hrs",
    checkOut: "0 hrs",
    overTime: "0 hrs",
    lateHours: "0 hrs",
    attendancePercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch attendance data when component mounts
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        const data = await hrAttendanceService.getMonthlyAttendanceStats();
        setAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, []);

  // Card configuration for consistent styling
  const timeCards = [
    { title: "Check In", value: attendanceData.checkIn, icon: <Clock size={24} />, color: "bg-blue-50 text-blue-600 border-blue-200" },
    { title: "Check Out", value: attendanceData.checkOut, icon: <Clock size={24} />, color: "bg-green-50 text-green-600 border-green-200" },
    { title: "Over Time", value: attendanceData.overTime, icon: <Timer size={24} />, color: "bg-purple-50 text-purple-600 border-purple-200" },
    { title: "Late Hours", value: attendanceData.lateHours, icon: <AlertCircle size={24} />, color: "bg-amber-50 text-amber-600 border-amber-200" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <div className="p-6">
          <Header title="Self Portal" />
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              {/* Main Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {timeCards.map((card, index) => (
                  <div key={index} className={`${card.color} p-6 rounded-lg shadow-sm border transition-all hover:shadow-md`}>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <div className="text-lg font-medium mb-2">{card.title}</div>
                        <div className="text-3xl font-bold">{card.value}</div>
                      </div>
                      <div className="p-3 rounded-full bg-white/80 shadow-sm">
                        {card.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Request Leave Button */}
              <div
                className="bg-gray-600 hover:bg-gray-700 text-white p-6 flex justify-between items-center mb-6 rounded-lg shadow-sm cursor-pointer transition-all"
                onClick={() => navigate('/hrleave')}
              >
                <div className="flex items-center">
                  <CalendarDays size={24} className="mr-3" />
                  <span className="text-xl font-bold">Request Leave</span>
                </div>
                <div className="text-lg">→</div>
              </div>
              
              {/* Progress Circle with Label */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-4 text-center">Attendance Rate</h3>
                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="12"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="12"
                        strokeDasharray="251.2"
                        strokeDashoffset={`${251.2 * (1 - attendanceData.attendancePercentage / 100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-indigo-600">{attendanceData.attendancePercentage}%</div>
                      <div className="text-sm text-gray-500 mt-1">Present</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>This Month</span>
                    <span>Target: 95%</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfPortal;