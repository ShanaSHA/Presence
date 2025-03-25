import React, { useState, useEffect } from "react";
import Sidebar from "../../components/hrcomponents/hrSidebar";
import Header from "../../components/hrcomponents/hrHeader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Users, UserCheck, Calendar, ClockAlert, FileWarning } from "lucide-react";
import hrDashboardService from "../../api/hrapi/hrDashboardService";

const HrDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    employees: 0,
    onLeave: 0,
    leaveRequests: 0,
    leaveCancellations: 0,
    attendanceRequest: 0,
  });
  const [attendanceData, setAttendanceData] = useState([]);

  // Fetch Dashboard Statistics
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const stats = await hrDashboardService.getDashboardStats();
        console.log("Fetched Stats:", stats); // Debugging Line
  
        if (!stats || typeof stats !== "object") {
          throw new Error("Invalid API response");
        }
  
        setDashboardStats({
          employees: stats.total_employees.length ? stats.total_employees.length :0,
          onLeave: typeof stats.on_leave_today === "number" ? stats.on_leave_today : 0,
          leaveRequests: typeof stats.leave_requests === "number" ? stats.leave_requests : 0,
          leaveCancellations: typeof stats.leave_cancellations === "number" ? stats.leave_cancellations : 0,
          attendanceRequest: typeof stats.attendance_request === "number" ? stats.attendance_request : 0,
        });
  
        setAttendanceData([
          { name: "Present", value: stats.present ?? 0, color: "#4ade80" },
          { name: "Absent", value: stats.absent ?? 0, color: "#f87171" },
          { name: "Late", value: stats.late ?? 0, color: "#facc15" },
        ]);
      } catch (error) {
        console.error("❌ Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  
  

  const statsCards = [
    { title: "Total Employees", value: dashboardStats.employees, icon: <Users size={24} />, color: "bg-blue-50 text-blue-700" },
    { title: "On Leave Today", value: dashboardStats.onLeave, icon: <UserCheck size={24} />, color: "bg-purple-50 text-purple-700" },
    { title: "Leave Requests", value: dashboardStats.leaveRequests, icon: <Calendar size={24} />, color: "bg-green-50 text-green-700" },
    { title: "Leave Cancellations", value: dashboardStats.leaveCancellations, icon: <FileWarning size={24} />, color: "bg-red-50 text-red-700" },
    { title: "Attendance Requests", value: dashboardStats.attendanceRequest, icon: <ClockAlert size={24} />, color: "bg-amber-50 text-amber-700" },
  ];

  // Loading state display
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
          <Header title="Dashboard" />
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <div className="p-6">
          <Header title="Dashboard" />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {statsCards.map((card, index) => (
              <div key={index} className={`${card.color} rounded-lg p-4 shadow-sm transition-all hover:shadow-md`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium mb-1">{card.title}</h3>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <div className="mt-1">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Attendance Chart */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Attendance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData} barSize={60} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.9)", 
                    border: "none", 
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
                  }} 
                />
                <Legend />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;