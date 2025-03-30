import React, { useState, useEffect } from 'react';
import Header from '../../components/hrcomponents/hrHeader';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/hrcomponents/hrSidebar";
import { X, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import attendanceAPI from '../../api/hrapi/emphrattendance';

const AttendanceTracker = () => {
  const navigate = useNavigate();
  
  // Initialize state with proper structure and default values
  const defaultDashboardData = {
    summary: {
      total_employees: 0,
      attendance_percentage: 0,
      present_days: 0,
      absent_days: 0,
      late_days: 0,
      pending_attendance_requests: 0,
      
    },
    employees: []
  };

  const [dashboardData, setDashboardData] = useState(defaultDashboardData);
  const [attendanceRequests, setAttendanceRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [currentRequest, setCurrentRequest] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showEmployeeTable, setShowEmployeeTable] = useState(true);
  const [showRequestsTable, setShowRequestsTable] = useState(true);

  // Helper function to safely set dashboard data
  const setSafeDashboardData = (data) => {
    setDashboardData({
      summary: {
        total_employees: data?.summary?.total_employees ?? 0,
        attendance_percentage: data?.summary?.attendance_percentage ?? 0,
        present_days: data?.summary?.present_days ?? 0,
        absent_days: data?.summary?.absent_days ?? 0,
        late_days: data?.summary?.late_days ?? 0,
        pending_attendance_requests: data?.summary?.pending_attendance_requests ?? 0
      },
      employees: data?.employees ?? []
    });
    
  };

  // Fetch dashboard data with proper error handling
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await attendanceAPI.getDashboard(startDate, endDate);
        setSafeDashboardData(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setDashboardData(defaultDashboardData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [startDate, endDate]);

  // Fetch attendance requests with error handling
  useEffect(() => {
    const fetchAttendanceRequests = async () => {
      try {
        const requests = await attendanceAPI.getRequests();
        setAttendanceRequests(Array.isArray(requests) ? requests : []);
      } catch (err) {
        console.error('Requests fetch error:', err);
        setAttendanceRequests([]);
      }
    };

    fetchAttendanceRequests();
  }, []);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates for the report');
      return;
    }

    try {
      const reportData = await attendanceAPI.generateReport('attendance', startDate, endDate);
      console.log('Report generated:', reportData);
      alert('Report generated successfully');
    } catch (err) {
      console.error('Report generation error:', err);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleApplyFilters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await attendanceAPI.getDashboard(startDate, endDate, department);
      setSafeDashboardData(data);
    } catch (err) {
      console.error('Filter application error:', err);
      setError('Failed to apply filters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestApproval = async (requestId, approved) => {
    if (!requestId) return;

    try {
      await attendanceAPI.updateRequestStatus(requestId, approved ? 'approved' : 'rejected');
      
      setAttendanceRequests(prevRequests => 
        prevRequests.map(request => 
          request?.id === requestId 
            ? { ...request, status: approved ? 'Approved' : 'Rejected' } 
            : request
        ).filter(Boolean)
      );
      
      setCurrentRequest(null);
      setIsRequestModalOpen(false);
    } catch (err) {
      console.error('Request approval error:', err);
      alert('Failed to update request status. Please try again.');
    }
  };

  const openRequestDetailsModal = (request) => {
    if (!request) return;
    setCurrentRequest(request);
    setIsRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setCurrentRequest(null);
    setIsRequestModalOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className={`${isSidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-indigo-800 text-white h-full fixed shadow-lg z-20`}>
          <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"} flex items-center justify-center`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className={`${isSidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-indigo-800 text-white h-full fixed shadow-lg z-20`}>
          <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"} flex items-center justify-center`}>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md w-full">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Try again →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-indigo-800 text-white h-full fixed shadow-lg z-20`}>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header */}
        <div className="flex-1 transition-all duration-300">
          <div className="mx-4 md:mx-6 py-4">
            <Header title="Attendance Tracker" />
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 md:p-6">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-green-500">
              <h3 className="text-gray-500 text-xs md:text-sm font-semibold mb-1">TOTAL EMPLOYEES</h3>
              <p className="text-2xl md:text-3xl font-bold">{dashboardData.summary.total_employees}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-xs md:text-sm font-semibold mb-1">ATTENDANCE RATE</h3>
              <p className="text-2xl md:text-3xl font-bold">{dashboardData.summary.attendance_percentage}%</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-amber-500">
              <h3 className="text-gray-500 text-xs md:text-sm font-semibold mb-1">PENDING APPROVALS</h3>
              <p className="text-2xl md:text-3xl font-bold">
                {dashboardData.summary.pending_attendance_requests }
              </p>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base md:text-lg font-semibold">Filter Attendance Data</h2>
              <button 
                className="md:hidden text-indigo-600 flex items-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className="mr-1" />
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            
            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    className="w-full p-2 text-xs md:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    className="w-full p-2 text-xs md:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    className="w-full p-2 text-xs md:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    <option value="hr">HR</option>
                    <option value="it">IT</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    className="bg-indigo-600 text-white px-4 py-2 text-xs md:text-sm rounded-md hover:bg-indigo-700 transition-colors w-full"
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Attendance Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div 
              className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center cursor-pointer"
              onClick={() => setShowEmployeeTable(!showEmployeeTable)}
            >
              <h2 className="text-base md:text-lg font-semibold">Employee Attendance</h2>
              <button className="md:hidden text-gray-500">
                {showEmployeeTable ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {showEmployeeTable && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Employee</th>
                        <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Work Days</th>
                        <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Leaves</th>
                        <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Overtime</th>
                        <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.employees.length > 0 ? (
                        dashboardData.employees.map((employee) => (
                          <tr 
                            key={employee?.emp_id || Math.random()} 
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 md:px-6 text-xs md:text-sm font-medium text-indigo-600">
                              {employee?.name || 'N/A'}
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                                {employee?.work_days || 0} days
                              </span>
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              {employee?.approved_leaves > 0 ? (
                                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">
                                  {employee.approved_leaves} days
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs md:text-sm">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              {employee?.total_overtime && employee.total_overtime !== '0:00' ? (
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                                  {employee.total_overtime}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs md:text-sm">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              <button 
                                onClick={() => navigate(`/employee/${employee?.emp_id}/attendance`)}
                                className="text-indigo-600 hover:text-indigo-900 text-xs md:text-sm font-medium"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-4 text-center text-gray-500">
                            No employee data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Generate Report Button */}
                <div className="p-4 md:p-6 border-t border-gray-200 flex justify-end">
                  <button 
                    className="bg-indigo-600 text-white px-4 md:px-6 py-2 text-xs md:text-sm rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                    onClick={handleGenerateReport}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Generate Report
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Attendance Requests Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center cursor-pointer"
              onClick={() => setShowRequestsTable(!showRequestsTable)}
            >
              <h2 className="text-base md:text-lg font-semibold">Attendance Requests</h2>
              <button className="md:hidden text-gray-500">
                {showRequestsTable ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {showRequestsTable && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Date</th>
                      <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Employee</th>
                      <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Check-in</th>
                      <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Check-out</th>
                      <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Image</th>
                      <th className="py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRequests.length > 0 ? (
                      attendanceRequests.map((request) => (
                        <tr key={request?.id || Math.random()} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 md:px-6 text-xs md:text-sm font-medium text-gray-800">
                            {request?.date || 'N/A'}
                          </td>
                          <td className="py-3 px-4 md:px-6 text-xs md:text-sm">
                            {request?.employee_name || 'N/A'}
                          </td>
                          <td className="py-3 px-4 md:px-6 text-xs md:text-sm">
                            {request?.check_in || '-'}
                          </td>
                          <td className="py-3 px-4 md:px-6 text-xs md:text-sm">
                            {request?.check_out || '-'}
                          </td>
                          <td className="py-3 px-4 md:px-6 text-xs md:text-sm">
                            {request?.image ? (
                              <div className="h-8 w-8 md:h-10 md:w-10 bg-gray-200 rounded overflow-hidden">
                                <img 
                                  src={request.image} 
                                  alt="Attendance proof" 
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/api/placeholder/40/40";
                                  }}
                                />
                              </div>
                            ) : (
                              <span className="text-gray-500">No image</span>
                            )}
                          </td>
                          <td className="py-3 px-4 md:px-6">
                            <button 
                              onClick={() => openRequestDetailsModal(request)}
                              className="text-indigo-600 hover:text-indigo-800 transition-colors text-xs md:text-sm font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-gray-500">
                          No pending requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {isRequestModalOpen && currentRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="font-bold text-lg md:text-xl text-gray-800">Request Details</h2>
              <button 
                onClick={closeRequestModal} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700">Date</label>
                <p className="text-gray-900 text-sm md:text-base">{currentRequest?.date || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700">Employee</label>
                <p className="text-gray-900 text-sm md:text-base">{currentRequest?.employee_name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700">Check-in Time</label>
                <p className="text-gray-900 text-sm md:text-base">{currentRequest?.check_in || '-'}</p>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700">Check-out Time</label>
                <p className="text-gray-900 text-sm md:text-base">{currentRequest?.check_out || '-'}</p>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700">Image</label>
                {currentRequest?.image ? (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={currentRequest.image} 
                      alt="Attendance proof" 
                      className="w-full h-auto max-h-48 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/300/200";
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm md:text-base">No image provided</p>
                )}
              </div>
             
             

              {currentRequest?.status !== 'Approved' && currentRequest?.status !== 'Rejected' && (
                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 md:mt-6">
                  <button 
                    onClick={() => handleRequestApproval(currentRequest.id, false)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 py-2 px-3 sm:py-2.5 sm:px-5 rounded-lg flex items-center justify-center text-sm sm:text-base"
                  >
                    <ThumbsDown size={14} className="mr-1 sm:mr-2" /> 
                    <span>Reject</span>
                  </button>
                  <button 
                    onClick={() => handleRequestApproval(currentRequest.id, true)}
                    className="bg-green-50 text-green-600 hover:bg-green-100 py-2 px-3 sm:py-2.5 sm:px-5 rounded-lg flex items-center justify-center text-sm sm:text-base"
                  >
                    <ThumbsUp size={14} className="mr-1 sm:mr-2" /> 
                    <span>Approve</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;