import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, X, Clock, Calendar, User, Plus, Check, AlertTriangle } from 'lucide-react';
import Sidebar from "../../components/hrcomponents/hrSidebar";

const EmployeeAttendanceDetail = () => {
  const { id } = useParams();
  const [month, setMonth] = useState('January');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    checkIn: '',
    checkOut: ''
  });

  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];

  // Employee data
  const employeeData = {
    name: "Sarah Johnson",
    designation: "Senior UI/UX Designer",
    id: "EMP-2023-0042",
    department: "Design",
    unpaidLeave: 2,
    overtime: 14
  };

  // Modified to use state for attendance data
  const [attendanceData, setAttendanceData] = useState([
    { date: 'Today', fullDate: '05-01-2025', checkIn: '09:00am', checkOut: '07:00pm', overtime: '2 hrs', status: 'present' },
    { date: 'Friday', fullDate: '04-01-2025', checkIn: '09:10am', checkOut: '07:00pm', overtime: '-', status: 'late' },
    { date: 'Thursday', fullDate: '03-01-2025', checkIn: '07:00am', checkOut: '04:00pm', overtime: '6 hrs', status: 'present' },
    { date: 'Wednesday', fullDate: '02-01-2025', checkIn: '-', checkOut: '-', overtime: '-', status: 'absent' },
    { date: 'Tuesday', fullDate: '01-01-2025', checkIn: '08:55am', checkOut: '06:00pm', overtime: '-', status: 'present' }
  ]);

  const stats = { present: 24, late: 2, absent: 5 };
  const totalDays = stats.present + stats.late + stats.absent;
  
  const selectMonth = (selectedMonth) => {
    setMonth(selectedMonth);
    setIsDropdownOpen(false);
  };

  const openModal = () => {
    // Reset form fields when opening modal
    setFormData({
      date: '',
      checkIn: '',
      checkOut: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to calculate overtime
  const calculateOvertime = (checkIn, checkOut) => {
    if (!checkIn || !checkOut || checkIn === '-' || checkOut === '-') return '-';
    
    // Convert time strings to Date objects for calculation
    const checkInTime = parseTimeString(checkIn);
    const checkOutTime = parseTimeString(checkOut);
    
    if (!checkInTime || !checkOutTime) return '-';
    
    // Calculate hours difference
    const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    const regularHours = 8; // Assuming 8 hours is a regular day
    
    const overtime = Math.max(0, diffHours - regularHours);
    return overtime > 0 ? `${Math.round(overtime)} hrs` : '-';
  };

  // Helper to parse time strings like "09:00am" to Date objects
  const parseTimeString = (timeStr) => {
    if (!timeStr || timeStr === '-') return null;
    
    try {
      const [time, period] = timeStr.split(/([ap]m)/i);
      let [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
      
      if (period.toLowerCase() === 'pm' && hours < 12) hours += 12;
      if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
      
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    } catch (e) {
      return null;
    }
  };

  // Function to format time input to AM/PM format
  const formatTimeToAMPM = (time) => {
    if (!time) return '-';
    
    try {
      const [hours, minutes] = time.split(':');
      let h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);
      const period = h >= 12 ? 'pm' : 'am';
      
      h = h % 12;
      h = h ? h : 12; // Convert 0 to 12
      
      return `${h}:${minutes.padStart(2, '0')}${period}`;
    } catch (e) {
      return time;
    }
  };

  // Function to format date to display format
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return { date: '-', fullDate: '-' };
    
    try {
      const date = new Date(dateStr);
      
      // Check if today
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      
      // Get day name
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = isToday ? 'Today' : days[date.getDay()];
      
      // Format the full date as MM-DD-YYYY
      const fullDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;
      
      return { date: dayName, fullDate };
    } catch (e) {
      return { date: '-', fullDate: '-' };
    }
  };

  // Determine attendance status based on check-in time
  const determineStatus = (checkIn) => {
    if (!checkIn || checkIn === '-') return 'absent';
    
    try {
      const [time, period] = checkIn.split(/([ap]m)/i);
      let [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
      
      if (period.toLowerCase() === 'pm' && hours < 12) hours += 12;
      if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
      
      // Assuming 9:00 AM is the start time, anyone checking in after 9:05 is late
      if (hours > 9 || (hours === 9 && minutes > 5)) {
        return 'late';
      }
      
      return 'present';
    } catch (e) {
      return 'present'; // Default to present if parsing fails
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.checkIn || !formData.checkOut) {
      alert('Please fill in all fields');
      return;
    }
    
    // Format the date
    const { date: displayDate, fullDate } = formatDateDisplay(formData.date);
    
    // Format times to AM/PM
    const formattedCheckIn = formatTimeToAMPM(formData.checkIn);
    const formattedCheckOut = formatTimeToAMPM(formData.checkOut);
    
    // Calculate overtime
    const overtime = calculateOvertime(formattedCheckIn, formattedCheckOut);
    
    // Determine status
    const status = determineStatus(formattedCheckIn);
    
    // Create new attendance record
    const newAttendance = {
      date: displayDate,
      fullDate,
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
      overtime,
      status
    };
    
    // Add to the attendance data
    setAttendanceData(prevData => [newAttendance, ...prevData]);
    
    // Close the modal
    closeModal();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header with Month Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Attendance Dashboard</h1>
          <div className="relative" ref={dropdownRef}>
            <div
              className="bg-white rounded-lg border border-gray-200 px-4 py-2 flex items-center cursor-pointer shadow-sm hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              tabIndex={0}
            >
              <Calendar size={18} className="text-gray-500 mr-2" />
              <span className="mr-2 font-medium text-gray-700">{month}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white shadow-xl rounded-lg z-10 border border-gray-100 py-1 overflow-hidden">
                {months.map((m) => (
                  <div
                    key={m}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors text-gray-700 hover:text-blue-600"
                    onClick={() => selectMonth(m)}
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Employee Info & Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Side - Employee Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full mr-4 flex items-center justify-center">
                <User size={32} className="text-blue-500" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-800">{employeeData.name}</h2>
                <p className="text-gray-600">{employeeData.designation}</p>
                <div className="flex gap-4 mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">ID: {employeeData.id}</span>
                  <span className="text-xs bg-blue-50 px-2 py-1 rounded-full text-blue-600">{employeeData.department}</span>
                </div>
              </div>
            </div>

            {/* Attendance Status Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <span className="block text-amber-600 font-medium">Unpaid Leave</span>
                <span className="text-2xl font-bold text-gray-800">{employeeData.unpaidLeave} days</span>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                <span className="block text-emerald-600 font-medium">Overtime</span>
                <span className="text-2xl font-bold text-gray-800">{employeeData.overtime} hrs</span>
              </div>
            </div>

            {/* Add Attendance Button */}
            <button 
              className="bg-blue-600 text-white rounded-lg py-2.5 px-4 w-full font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
              onClick={openModal}
            >
              <Plus size={18} className="mr-2" /> Add Attendance Record
            </button>
          </div>

          {/* Right Side - Donut Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-800 mb-4">Monthly Overview</h2>
            <DonutChart stats={stats} totalDays={totalDays} />
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-800">Attendance Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Check-in</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Check-out</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Overtime</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((day, index) => (
                  <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{day.date}</div>
                      <div className="text-xs text-gray-500">{day.fullDate}</div>
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {day.checkIn !== '-' ? (
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-2" />
                          {day.checkIn}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {day.checkOut !== '-' ? (
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-2" />
                          {day.checkOut}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-6">
                      {day.overtime !== '-' ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {day.overtime}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-6">
                      {day.status === 'present' ? (
                        <span className="flex items-center text-green-600">
                          <Check size={16} className="mr-1" /> Present
                        </span>
                      ) : day.status === 'late' ? (
                        <span className="flex items-center text-amber-600">
                          <Clock size={16} className="mr-1" /> Late
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <AlertTriangle size={16} className="mr-1" /> Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Modal */}
        {isModalOpen && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md modal-content relative overflow-hidden" ref={modalRef}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl text-gray-800">Add Attendance Record</h2>
                <button 
                  onClick={closeModal} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Date Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="date" 
                      name="date"
                      className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" 
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Check In Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Check In Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="time" 
                      name="checkIn"
                      className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Check Out Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Check Out Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="time" 
                      name="checkOut"
                      className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      value={formData.checkOut}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-100 text-gray-700 font-medium py-2.5 px-5 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced DonutChart Component
const DonutChart = ({ stats, totalDays }) => {
  // Calculate percentages and stroke offsets
  const presentPercent = Math.round((stats.present / totalDays) * 100);
  const latePercent = Math.round((stats.late / totalDays) * 100);
  const absentPercent = Math.round((stats.absent / totalDays) * 100);
  
  const circumference = 2 * Math.PI * 40; // 2πr where r=40
  
  const presentOffset = (stats.present / totalDays) * circumference;
  const lateOffset = (stats.late / totalDays) * circumference;
  const absentOffset = (stats.absent / totalDays) * circumference;
  
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-40 h-40">
        {/* Circle background */}
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {/* Present segment - green */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" />
          
          {/* Late segment - amber */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke="#f59e0b" 
            strokeWidth="12" 
            strokeDasharray={circumference} 
            strokeDashoffset={circumference - presentOffset} 
          />
          
          {/* Absent segment - red */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="12" 
            strokeDasharray={circumference} 
            strokeDashoffset={circumference - presentOffset - lateOffset} 
          />
          
          {/* Inner circle - white */}
          <circle cx="50" cy="50" r="30" fill="white" />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl font-bold text-gray-800">{presentPercent}%</span>
          <span className="text-xs text-gray-500">Attendance</span>
        </div>
      </div>

      {/* Legend */}
      <div className="ml-6 space-y-3">
        {[
          { label: "Present", color: "bg-green-500", count: stats.present },
          { label: "Late", color: "bg-amber-500", count: stats.late },
          { label: "Absent", color: "bg-red-500", count: stats.absent }
        ].map((item) => (
          <div key={item.label} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
            <span className="text-gray-600">{item.label}</span>
            <span className="ml-auto font-medium text-gray-800">{item.count} days</span>
          </div>
        ))}
        
        <div className="pt-2 border-t border-gray-100 mt-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-gray-800">{totalDays} days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceDetail;