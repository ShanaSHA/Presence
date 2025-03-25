import React, { useState } from 'react';
import Header from '../../components/empcomponents/empheader';
import Sidebar from '../../components/empcomponents/empSidear';

const EmpDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('Jan');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock data for the donut chart
  const attendanceData = {
    present: 24,
    late: 2,
    absent: 4
  };
  
  // Mock employee data
  const employees = [
    { id: 1, name: "Sarah Johnson", status: "Present", color: "#8b5cf6" },
    { id: 2, name: "Emma Thompson", status: "Present", color: "#ec4899" },
    { id: 3, name: "Olivia Williams", status: "Absent", color: "#f97316" },
    { id: 4, name: "Sophia Davis", status: "Present", color: "#14b8a6" },
    { id: 5, name: "Michael Brown", status: "Absent", color: "#3b82f6" }
  ].map(emp => ({
    ...emp,
    firstLetter: emp.name.charAt(0)  // Extracts the first letter
  }));
  
  // Calculate total days for percentages
  const totalDays = attendanceData.present + attendanceData.late + attendanceData.absent;
  const presentPercentage = Math.round((attendanceData.present / totalDays) * 100);
  
  // Calculate the stroke dash array and offset for each segment
  const calculateDonutSegment = (value, total, startOffset = 0) => {
    const circumference = 2 * Math.PI * 40; // 40 is the radius
    const segmentLength = (value / total) * circumference;
    return {
      strokeDasharray: `${segmentLength} ${circumference - segmentLength}`,
      strokeDashoffset: -startOffset
    };
  };
  
  // Calculate segments
  const presentSegment = calculateDonutSegment(attendanceData.present, totalDays);
  const lateSegment = calculateDonutSegment(attendanceData.late, totalDays, 
    (attendanceData.present / totalDays) * (2 * Math.PI * 40));
  const absentSegment = calculateDonutSegment(attendanceData.absent, totalDays,
    ((attendanceData.present + attendanceData.late) / totalDays) * (2 * Math.PI * 40));
  
  return (
    <div className="flex min-h-screen bg-gray-50 font-popins">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 p-6 transition-all duration-300">
        <Header title="Dashboard" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left panel - Stats */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Today's Activity</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Check In */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:shadow-md">
                <div className="text-purple-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Check In</p>
                <p className="text-2xl font-bold text-gray-800">9:00 AM</p>
              </div>
              
              {/* Check Out */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:shadow-md">
                <div className="text-indigo-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Check Out</p>
                <p className="text-2xl font-bold text-gray-800">-- : --</p>
              </div>
              
              {/* Over Time */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:shadow-md">
                <div className="text-yellow-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Over Time</p>
                <p className="text-2xl font-bold text-gray-800">0 hrs</p>
              </div>
              
              {/* Late Hours */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:shadow-md">
                <div className="text-red-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Late Hours</p>
                <p className="text-2xl font-bold text-gray-800">0 hrs</p>
              </div>
            </div>
            
            {/* Shift Card */}
            <div className="bg-gradient-to-r from-gray-600 to-gray-600 rounded-xl p-6 shadow-md text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white text-opacity-80 font-medium">Current Schedule</p>
                  <h3 className="text-2xl font-bold mt-1">Morning Shift</h3>
                  <p className="mt-2 text-white text-opacity-80">9:00 AM - 5:00 PM</p>
                </div>
               
              </div>
            </div>
          </div>
          
          {/* Right panel - Donut chart */}
          <div className="flex flex-col bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Attendance</h2>
            <div className="flex items-center justify-center flex-1">
              <div className="relative w-64 h-64">
                {/* SVG Donut Chart */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                  
                  {/* Present segment (purple) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="gray" 
                    strokeWidth="12" 
                    style={presentSegment} 
                  />
                  
                  {/* Late segment (yellow) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#9a9a9a" 
                    strokeWidth="12" 
                    style={lateSegment} 
                  />
                  
                  {/* Absent segment (red) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#e9e9e9" 
                    strokeWidth="12" 
                    style={absentSegment} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-bold text-gray-800">{presentPercentage}%</p>
                  <p className="text-gray-500">Present</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
                <span className="text-gray-600">Present ({attendanceData.present} days)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#9a9a9a] mr-2"></div>
                <span className="text-gray-600">Late ({attendanceData.late} days)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#e9e9e9] mr-2"></div>
                <span className="text-gray-600">Absent ({attendanceData.absent} days)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Shift Mates Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Shift Mates</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-gray-500 hover:text-gray-800 transition-colors flex items-center"
              aria-label="Show employee status"
            >
              <span className="mr-2 text-sm font-medium">View All</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto py-2">
            {employees.map(employee => (
              <div key={employee.id} className="flex flex-col items-center space-y-2">
                <div 
                  className="flex items-center justify-center w-14 h-14 rounded-full text-white font-semibold text-lg"
                  style={{ backgroundColor: employee.color }}
                >
                  {employee.firstLetter}
                </div>
                <p className="text-sm font-medium text-gray-700">{employee.name.split(' ')[0]}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  employee.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Modal Popup for Employee Status */}
        {isModalOpen && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in-down">
              <div className="flex justify-between items-center p-5 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Employee Status</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-96">
                <ul className="divide-y divide-gray-200">
                  {employees.map(employee => (
                    <li key={employee.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div 
                          className="flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold mr-4"
                          style={{ backgroundColor: employee.color }}
                        >
                          {employee.firstLetter}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{employee.name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          employee.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t border-gray-200 p-4 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpDashboard;