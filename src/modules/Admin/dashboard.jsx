// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from "../../components/admincomponents/Sidebar";
import Header from "../../components/admincomponents/Header";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchDashboardData } from "../../redux/admredux/dashboardSlice";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  
  // Select data from Redux store
  const {
    employees,
    hrUsers,
    leaveRequests,
    leaveCancellations,
    attendanceData,
    status,
    error
  } = useSelector((state) => state.dashboard);

  // Fetch data on component mount
  useEffect(() => {
    // Only fetch if not already loaded
    if (status === 'idle') {
      dispatch(fetchDashboardData());
    }
  }, [status, dispatch]);

  // Render loading state
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (status === 'failed') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md max-w-md">
          <h3 className="text-xl font-bold mb-2">Dashboard Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => dispatch(fetchDashboardData())}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Total Employees", 
      value: employees,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      color: "bg-blue-50 border-blue-200"
    },
    { 
      label: "HR Users", 
      value: hrUsers,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-purple-50 border-purple-200"
    },
    { 
      label: "Leave Requests", 
      value: leaveRequests,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-green-50 border-green-200"
    },
    { 
      label: "Leave Cancellations", 
      value: leaveCancellations,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-red-50 border-red-200"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
     
      {/* Main Content */}
      <div className="flex-1 transition-all duration-300">
        <div className="p-6">
          <Header title="Dashboard" />
          
          <div className="mt-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl shadow-lg p-6 mb-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h2>
              <p className="opacity-90">Here's what's happening with your team today</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {statCards.map((stat, index) => (
                <div 
                  key={index} 
                  className={`${stat.color} border rounded-xl p-6 shadow-sm hover:shadow-md transition`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                    </div>
                    <div>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
           
            {/* Data Visualization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Attendance Chart */}
              <div className="lg:col-span-15 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Attendance Overview</h3>
                  <select className="border rounded-lg p-2 text-sm">
                    <option value="thisWeek">This Week</option>
                    <option value="lastWeek">Last Week</option>
                    <option value="thisMonth">This Month</option>
                  </select>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData} barSize={30}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Attendance" 
                      fill="#4f46e5" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              
                </div>
              </div>
            </div>
          </div>
        </div>
    
    
  );
};

export default Dashboard;