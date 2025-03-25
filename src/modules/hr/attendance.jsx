import React, { useState } from 'react';
import Header from '../../components/hrcomponents/hrHeader';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/hrcomponents/hrSidebar";
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';

const AttendanceTracker = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Shana Yasmin', workDays: 26, leaves: '-', overtime: '2 hrs' },
    { id: 2, name: 'Farha Cheroor', workDays: 21, leaves: 4, overtime: '6 hrs' },
    { id: 3, name: 'Jadeera P', workDays: 26, leaves: '-', overtime: '-' },
    { id: 4, name: 'Nishida', workDays: 25, leaves: 1, overtime: '-' },
    { id: 5, name: 'Huda Fathima', workDays: 20, leaves: 4, overtime: '-' },
    { id: 6, name: 'Riswana', workDays: 24, leaves: 2, overtime: '1 hr' }
  ]);

  // Attendance Requests State
  const [attendanceRequests, setAttendanceRequests] = useState([
    {
      id: 1,
      date: '02-01-2025',
      type: 'Leave',
      reason: 'Personal Medical Appointment',
      status: 'Pending'
    },
    {
      id: 2,
      date: '15-01-2025',
      type: 'Overtime',
      reason: 'Project Deadline Extension',
      status: 'Pending'
    }
  ]);

  // Request Modal State
  const [currentRequest, setCurrentRequest] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const [toDate, setToDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [department, setDepartment] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleGenerateReport = () => {
    alert('Generating attendance report...');
  };

  // Method to handle request approval
  const handleRequestApproval = (requestId, approved) => {
    setAttendanceRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: approved ? 'Approved' : 'Rejected' } 
          : request
      )
    );
    
    // Close the modal
    setCurrentRequest(null);
    setIsRequestModalOpen(false);
  };

  // Method to open request details modal
  const openRequestDetailsModal = (request) => {
    setCurrentRequest(request);
    setIsRequestModalOpen(true);
  };

  // Method to close request details modal
  const closeRequestModal = () => {
    setCurrentRequest(null);
    setIsRequestModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-indigo-800 text-white h-full fixed shadow-lg`}>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header */}
        <div className="flex-1 transition-all duration-300 ">
          <div className="mx-6 py-4">
            <Header title="Attendance Tracker" />
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm font-semibold mb-1">TOTAL EMPLOYEES</h3>
              <p className="text-3xl font-bold">{employees.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-sm font-semibold mb-1">ATTENDANCE RATE</h3>
              <p className="text-3xl font-bold">92%</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
              <h3 className="text-gray-500 text-sm font-semibold mb-1">PENDING APPROVALS</h3>
              <p className="text-3xl font-bold">3</p>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Filter Attendance Data</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Employee Attendance Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Employee Attendance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="py-3 px-6 font-semibold text-gray-700">Employee Name</th>
                    <th className="py-3 px-6 font-semibold text-gray-700">Work Days</th>
                    <th className="py-3 px-6 font-semibold text-gray-700">Leaves</th>
                    <th className="py-3 px-6 font-semibold text-gray-700">Overtime</th>
                    <th className="py-3 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr 
                      key={employee.id} 
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors`}
                    >
                      <td className="py-4 px-6 font-medium text-indigo-600">{employee.name}</td>
                      <td className="py-4 px-6">
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {employee.workDays} days
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {employee.leaves !== '-' ? (
                          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {employee.leaves} days
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {employee.overtime !== '-' ? (
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {employee.overtime}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => navigate(`/details`)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Generate Report Button */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button 
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                onClick={handleGenerateReport}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>

          {/* Attendance Requests Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Attendance Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="py-3 px-6 font-semibold text-gray-700">Date</th>
                    <th className="py-3 px-6 font-semibold text-gray-700">Type</th>
                    <th className="py-3 px-6 font-semibold text-gray-700">Reason</th>
                    <th className="py-3 px-6 font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-800">{request.date}</td>
                      <td className="py-4 px-6">{request.type}</td>
                      <td className="py-4 px-6">{request.reason}</td>
                      <td className="py-4 px-6">
                        <span 
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                            request.status === 'Approved' ? 'bg-green-50 text-green-600' :
                            'bg-red-50 text-red-600'
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => openRequestDetailsModal(request)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {isRequestModalOpen && currentRequest && (
        <div className="fixed inset-0 bg--opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-gray-800">Request Details</h2>
              <button 
                onClick={closeRequestModal} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="text-gray-900">{currentRequest.date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="text-gray-900">{currentRequest.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <p className="text-gray-900">{currentRequest.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Status</label>
                <span 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentRequest.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                    currentRequest.status === 'Approved' ? 'bg-green-50 text-green-600' :
                    'bg-red-50 text-red-600'
                  }`}
                >
                  {currentRequest.status}
                </span>
              </div>

              {currentRequest.status === 'Pending' && (
                <div className="flex justify-between mt-6">
                  <button 
                    onClick={() => handleRequestApproval(currentRequest.id, false)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 py-2.5 px-5 rounded-lg flex items-center"
                  >
                    <ThumbsDown size={16} className="mr-2" /> Reject
                  </button>
                  <button 
                    onClick={() => handleRequestApproval(currentRequest.id, true)}
                    className="bg-green-50 text-green-600 hover:bg-green-100 py-2.5 px-5 rounded-lg flex items-center"
                  >
                    <ThumbsUp size={16} className="mr-2" /> Approve
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