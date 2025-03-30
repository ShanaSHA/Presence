import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, X, Clock, Calendar, User, Plus, Check, AlertTriangle } from 'lucide-react';
import Sidebar from "../../components/hrcomponents/hrSidebar";
import attendanceAPI from '../../api/hrapi/emphrattendance';

const EmployeeAttendanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [month, setMonth] = useState('March');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data states with proper initial structure
  const [employeeData, setEmployeeData] = useState({
    employee_details: {
      name: "",
      designation: "",
      department: "",
      emp_num: ""
    },
    unpaid_leaves: 0,
    total_overtime: 0,
    attendance_records: [],
    attendance_summary: { present: 0, late: 0, absent: 0, total: 0 }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state with consistent naming
  const [formData, setFormData] = useState({
    date: '',
    check_in: '',
    check_out: ''
  });
  
  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];
  
  // Enhanced data fetching with validation
  useEffect(() => {
    const fetchEmployeeAttendance = async () => {
      if (!id) {
        setError('Employee ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await attendanceAPI.getEmployeeAttendance(id);
        
        // Validate and normalize the API response
        const validatedData = {
          employee_details: {
            name: data.employee_details?.name || "Unknown",
            designation: data.employee_details?.designation || "",
            department: data.employee_details?.department || "",
            emp_num: data.employee_details?.emp_num || id
          },
          unpaid_leaves: Number(data.unpaid_leaves) || 0,
          total_overtime: data.total_overtime || "0:00",
          attendance_records: Array.isArray(data.attendance_records) 
            ? data.attendance_records.map(record => ({
                ...record,
                date: record.date || "",
                check_in: record.check_in || "",
                check_out: record.check_out || "",
                status: record.status || "unknown",
                working_hours: record.total_hours || ""
              }))
            : [],
          attendance_summary: {
            present: Number(data.attendance_summary?.present) || 0,
            late: Number(data.attendance_summary?.late) || 0,
            absent: Number(data.attendance_summary?.absent) || 0,
            total: Number(data.attendance_summary?.total) || 0
          }
        };

        setEmployeeData(validatedData);
      } catch (err) {
        console.error('Failed to load employee data:', err);
        setError(err.message || 'Failed to load employee attendance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeAttendance();
  }, [id]);

  // Close dropdowns/modals when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      
      if (modalRef.current && !modalRef.current.contains(event.target) && isModalOpen) {
        closeModal();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isModalOpen]);

  // Safe date formatting with validation
  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return '-';
    
    // If already in YYYY-MM-DD format, just return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Otherwise, try to convert
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${month}-${day}-${year}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };
  // Robust time formatting
  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return '-';
    
    try {
      // Handle various time formats (HH:MM, HH:MM:SS, etc.)
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      
      if (isNaN(hour)) return timeString;
      
      const period = hour >= 12 ? '' : '';
      const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
      
      return `${displayHour}:${minutes?.padStart(2, '0') || '00'} ${period}`;
    } catch (error) {
      console.error('Time formatting error:', error);
      return timeString;
    }
  };

  // Status styling helper
  const getStatusClass = (status) => {
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Modal handlers
  const openModal = () => {
    setFormData({
      date: '',
      check_in: '',
      check_out: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.date || !formData.check_in || !formData.check_out) {
      alert('Please fill in all required fields');
      return;
    }
  
    // Validate check-out is after check-in
    if (formData.check_out <= formData.check_in) {
      alert('Check-out time must be after check-in time');
      return;
    }
  
    try {
      setIsSubmitting(true);
      
      const recordData = {
        date: formData.date,
        check_in: formData.check_in,
        check_out: formData.check_out
        // employee_id is now passed separately
      };
      
      // Call the API with both employee_id and recordData
      await attendanceAPI.addAttendanceRecord(id, recordData);
      
      // Refresh the data
      const updatedData = await attendanceAPI.getEmployeeAttendance(id);
      setEmployeeData(updatedData);
      
      closeModal();
    } catch (err) {
      console.error('Failed to add record:', err);
      alert(`Failed to add record: ${err.response?.data?.message || err.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className={`flex-1 transition-all ${isSidebarOpen ? 'ml-64' : 'ml-16'} p-8 flex items-center justify-center`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employee data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className={`flex-1 transition-all ${isSidebarOpen ? 'ml-64' : 'ml-16'} p-8 flex items-center justify-center`}>
          <div className="max-w-md w-full bg-red-50 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/attendance')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Back to Attendance
              </button>
              <button
                onClick={() => window.location('/attendances')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { employee_details, attendance_records, attendance_summary, unpaid_leaves, total_overtime } = employeeData;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className={`flex-1 transition-all ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header with back button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <button 
                onClick={() => navigate('/attendances')}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
              >
                <ChevronDown className="h-4 w-4 rotate-90 mr-1" />
                Back to Attendance
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Employee Attendance</h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded hover:bg-gray-200 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          
          {/* Employee Details Card */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold">{employee_details.name}</h2>
                <div className="text-sm text-gray-500 mt-1">
                  <p>{employee_details.designation} • {employee_details.department}</p>
                  <p>Employee ID: {employee_details.emp_num}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{attendance_summary.present}</div>
                  <div className="text-xs uppercase text-gray-500">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{attendance_summary.late}</div>
                  <div className="text-xs uppercase text-gray-500">Late</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{attendance_summary.absent}</div>
                  <div className="text-xs uppercase text-gray-500">Absent</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Total Working Days</div>
                <div className="text-lg font-semibold">{attendance_summary.total} days</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Unpaid Leaves</div>
                <div className="text-lg font-semibold">{unpaid_leaves} days</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Total Overtime</div>
                <div className="text-lg font-semibold">{total_overtime}</div>
              </div>
            </div>
          </div>
          
          {/* Month Selector and Add Record Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button 
                className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center w-full justify-between"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  {month}
                </div>
                <ChevronDown className={`h-4 w-4 ml-2 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div 
                  className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                  role="listbox"
                >
                  {months.map((m) => (
                    <button
                      key={m}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${m === month ? 'bg-gray-100 font-medium' : ''}`}
                      onClick={() => {
                        setMonth(m);
                        setIsDropdownOpen(false);
                      }}
                      role="option"
                      aria-selected={m === month}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center w-full sm:w-auto justify-center"
              onClick={openModal}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </button>
          </div>
          
          {/* Attendance Records Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Working Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance_records.length > 0 ? (
                    attendance_records.map((record, index) => (
                      <tr key={`${record.date}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(record.check_in)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(record.check_out)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.total_hours ? `${record.total_hours} hrs` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                        No attendance records found for this employee.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add Attendance Record</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="check_in" className="block text-sm font-medium text-gray-700 mb-1">
                  Check In Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="check_in"
                  name="check_in"
                  value={formData.check_in}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="check_out" className="block text-sm font-medium text-gray-700 mb-1">
                  Check Out Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="check_out"
                  name="check_out"
                  value={formData.check_out}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={formData.check_in} // Ensure check-out is after check-in
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Record
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendanceDetail;