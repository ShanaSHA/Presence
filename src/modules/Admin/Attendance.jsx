import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from "../../components/admincomponents/Sidebar";
import Header from "../../components/admincomponents/Header";
import { 
  
  setDateRange, 
  fetchAttendanceData,
  generateAttendanceReport 
} from "../../redux/admredux/attendanceSlice";

const Attendance = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const dispatch = useDispatch();
      
  // Select data from Redux store
  const { 
    data: attendanceData, 
    filters, 
    status, 
    error,
    reportStatus 
  } = useSelector((state) => state.attendance);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    if (!isInitialLoad) {
      dispatch(fetchAttendanceData(filters)).catch(err => {
        console.error("Failed to fetch attendance data:", err);
      });
    }
  }, [dispatch, filters]);  // Removed `isInitialLoad` from dependencies
  

  // Handle department selection
  

  // Handle date range changes
  const handleFromDateChange = (e) => {
    dispatch(setDateRange({
      fromDate: e.target.value,
      toDate: filters.toDate
    }));
  };

  const handleToDateChange = (e) => {
    dispatch(setDateRange({
      fromDate: filters.fromDate,
      toDate: e.target.value
    }));
  };

  // Handle report generation
  const handleGenerateReport = () => {
    dispatch(generateAttendanceReport(filters))
      .catch(err => {
        console.error("Failed to generate report:", err);
        alert("Failed to generate report. Please try again.");
      });
  };

  // Loading and error states
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg font-semibold">Loading attendance data...</div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow">
          <p className="font-bold">Error loading attendance data</p>
          <p>{error || "Unknown error occurred"}</p>
        </div>
      </div>
    );
  }

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
          <Header title="Attendance Management" />
          
          {/* Card container */}
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            {/* Filter section with improved layout */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Filter Attendance Records</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">From Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={filters.fromDate}
                    onChange={handleFromDateChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">To Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={filters.toDate}
                    onChange={handleToDateChange}
                  />
                </div>
                
                
              </div>
            </div>

            {/* Attendance table with improved styling */}
            <div className="overflow-x-auto mb-6">
              <h2 className="text-lg font-semibold mb-4">Attendance Summary</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-4 rounded-tl-lg">Employee Name</th>
                    <th className="p-4">Work Days</th>
                    <th className="p-4">Leaves Taken</th>
                    <th className="p-4 rounded-tr-lg">Overtime Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">
                        No attendance records found for the selected filters
                      </td>
                    </tr>
                  ) : (
                    attendanceData.map((employee, index) => (
                      <tr 
                        key={index} 
                        className={`hover:bg-gray-50 transition ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                      >
                        <td className="p-4 border-t">{employee.name}</td>
                        <td className="p-4 border-t">{employee.workDays}</td>
                        <td className="p-4 border-t">{employee.leaves}</td>
                        <td className="p-4 border-t">{employee.overtime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Generate Report Button with improved styling */}
            <div className="flex justify-end">
              <button 
                onClick={handleGenerateReport} 
                className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md flex items-center space-x-2 ${
                  reportStatus === 'loading' ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={reportStatus === 'loading'}
              >
                {reportStatus === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;