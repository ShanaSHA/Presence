import React, { useState, useEffect } from 'react';
import Header from '../../components/empcomponents/empheader';
import Sidebar from '../../components/empcomponents/empSidear';

const AttendanceApp = () => {
  const [showModal, setShowModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [selectedAbsenceDate, setSelectedAbsenceDate] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('Jan');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [requestData, setRequestData] = useState({
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '17:00',
    workType: 'Field Work',
    location: '',
    image: null,
    absenceReason: ''
  });
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      id: 1,
      date: '2024-01-15',
      check_in: '09:15',
      check_out: '17:30',
      work_type: 'Field Work',
      location: 'Client Site A',
      status: 'Approved',
      image: null
    },
    {
      id: 2,
      date: '2024-01-16',
      check_in: '09:05',
      check_out: '17:00',
      work_type: 'Office Work',
      location: 'Main Office',
      status: 'Pending',
      image: null
    }
  ]);
  const [calendarData, setCalendarData] = useState(null);
  const [workTypes, setWorkTypes] = useState(['Field Work', 'Office Work', 'Remote Work', 'Meeting', 'Training']);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 12,
    late: 2,
    absent: 3,
    total: 17
  });
  const [editingRequest, setEditingRequest] = useState(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getMonthNumber = (monthName) => {
    return months.indexOf(monthName) + 1;
  };
  
  useEffect(() => {
    const generateCalendarData = () => {
      const monthIndex = months.indexOf(selectedMonth);
      const year = selectedYear;
      const firstDay = new Date(year, monthIndex, 1);
      const lastDay = new Date(year, monthIndex + 1, 0);
      
      const calendarDataMock = {
        startDay: firstDay.getDay(),
        days: lastDay.getDate(),
        dailyStatus: {},
        absenceReasons: {}
      };
      
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, monthIndex, day);
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          calendarDataMock.absenceReasons[day] = 'Weekend';
        } else {
          const randomStatus = Math.random() < 0.7 ? 'present' : 
                               Math.random() < 0.5 ? 'late' : 'absent';
          calendarDataMock.dailyStatus[day] = randomStatus;
        }
      }
      
      setCalendarData(calendarDataMock);
    };
    
    generateCalendarData();
  }, [selectedMonth, selectedYear]);
  
  const filteredHistory = attendanceRecords.filter(record => {
    if (!record.date) return false;
    const recordDate = new Date(record.date);
    const recordMonth = recordDate.getMonth();
    const recordYear = recordDate.getFullYear();
    const selectedMonthIndex = months.indexOf(selectedMonth);
    return recordMonth === selectedMonthIndex && recordYear === selectedYear;
  });
  
  const renderCalendar = () => {
    const days = [];
    
    if (!calendarData) {
      return <div className="text-center py-12">Loading calendar data...</div>;
    }
    
    const startDay = calendarData.startDay;
    const totalDays = calendarData.days;
    
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 bg-gray-100"></div>);
    }
    
    for (let day = 1; day <= totalDays; day++) {
      const status = calendarData.dailyStatus[day] || '';
      const isWeekend = calendarData.absenceReasons[day] === 'Weekend';
      
      let textColor = 'text-gray-800';
      if (status === 'present') {
        textColor = 'text-[#579c29] font-bold';
      } else if (status === 'late') {
        textColor = 'text-blue-900 font-bold';
      } else if (status === 'absent') {
        textColor = 'text-red-500 font-bold';
      } else if (isWeekend) {
        textColor = 'text-gray-700';
      }
      
      days.push(
        <div 
          key={day} 
          className={`h-10 flex items-center justify-center ${status === 'absent' || isWeekend ? 'cursor-pointer' : ''} ${textColor}`}
          onClick={() => {
            if (status === 'absent' || isWeekend) {
              const fullDate = new Date(selectedYear, months.indexOf(selectedMonth), day);
              setSelectedAbsenceDate({
                day,
                month: selectedMonth,
                year: selectedYear,
                fullDate: fullDate,
                reason: calendarData.absenceReasons[day] || 'No reason provided'
              });
              
              setRequestData({
                date: fullDate.toISOString().split('T')[0],
                checkIn: '09:00',
                checkOut: '17:00',
                workType: 'Field Work',
                location: '',
                image: null,
                absenceReason: ''
              });
              
              setShowModal(true);
            }
          }}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    setRequestData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const newRequest = {
        id: attendanceRecords.length + 1,
        date: requestData.date,
        check_in: requestData.checkIn,
        check_out: requestData.checkOut,
        work_type: requestData.workType,
        location: requestData.location || 'Not specified',
        status: 'Pending',
        image: requestData.image ? URL.createObjectURL(requestData.image) : null,
        absence_reason: requestData.absenceReason
      };
      
      if (editingRequest) {
        const updatedRecords = attendanceRecords.map(record => 
          record.id === editingRequest.id ? { ...record, ...newRequest } : record
        );
        setAttendanceRecords(updatedRecords);
      } else {
        setAttendanceRecords([...attendanceRecords, newRequest]);
      }
      
      alert(editingRequest ? 'Request updated successfully!' : 'Request submitted successfully!');
      setShowModal(false);
      setShowHistoryTab(true);
      setEditingRequest(null);
      setSelectedAbsenceDate(null);
      
      setRequestData({
        date: new Date().toISOString().split('T')[0],
        checkIn: '09:00',
        checkOut: '17:00',
        workType: workTypes[0],
        location: '',
        image: null,
        absenceReason: ''
      });
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to submit/update request');
      alert('Error submitting request. Please try again.');
      setIsLoading(false);
    }
  };
  
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const resetModal = () => {
    setShowModal(false);
    setSelectedAbsenceDate(null);
    setEditingRequest(null);
    setRequestData({
      date: new Date().toISOString().split('T')[0],
      checkIn: '09:00',
      checkOut: '17:00',
      workType: workTypes[0],
      location: '',
      image: null,
      absenceReason: ''
    });
  };

  return (
    <div className="flex min-h-screen bg-white relative">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 p-6 transition-all duration-300">
        <Header title="Attendance" />
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button 
              className="font-bold underline ml-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex space-x-4">
              <div className="relative w-32">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full appearance-none bg-gray-200 p-2 pr-8 rounded-md"
                  disabled={isLoading}
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative w-32">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full appearance-none bg-gray-200 p-2 pr-8 rounded-md"
                  disabled={isLoading}
                >
                  {[2023, 2024, 2025].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button 
                className={`px-4 py-2 ${!showHistoryTab ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setShowHistoryTab(false)}
                disabled={isLoading}
              >
                Attendance View
              </button>
              <button 
                className={`px-4 py-2 ${showHistoryTab ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setShowHistoryTab(true)}
                disabled={isLoading}
              >
                Request History
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {!showHistoryTab ? (
                <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="border border-gray-300 rounded shadow-sm">
                      <div className="grid grid-cols-7 bg-gray-200 rounded-t">
                        {weekdays.map(day => (
                          <div key={day} className="p-2 text-center font-medium">{day}</div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7">
                        {renderCalendar()}
                      </div>
                      
                      <div className="flex justify-end space-x-4 mt-2 p-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-[#579c29] mr-2 border border-[#579c29]"></div>
                          <span className="text-xs">Present</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-900 mr-2 border border-blue-300"></div>
                          <span className="text-xs">Late</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 mr-2 border border-red-300"></div>
                          <span className="text-xs">Absent</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-300 mr-2 border border-gray-400"></div>
                          <span className="text-xs">Weekend</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 h-24 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="font-bold text-[#579c29]">Total Attendance</h2>
                        <p className="text-2xl font-bold text-[#579c29]">{attendanceStats.present} days</p>
                      </div>
                      <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 h-24 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="font-bold text-blue-900">Late</h2>
                        <p className="text-2xl font-bold text-blue-600">{attendanceStats.late} days</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <div className="bg-red-100 border border-red-200 rounded-lg p-4 w-full h-24 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="font-bold text-red-500">Absent</h2>
                        <p className="text-2xl font-bold text-red-600">{attendanceStats.absent} days</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/2 flex flex-col items-center">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm w-full">
                      <h2 className="text-lg font-bold text-center mb-4">Attendance Overview</h2>
                      <div className="relative w-64 h-64 mx-auto">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          <circle 
                            cx="50" cy="50" r="40" 
                            fill="none" 
                            stroke="#579c29" 
                            strokeWidth="15"
                            strokeDasharray={`${(attendanceStats.present / attendanceStats.total || 0) * 251.2} ${251.2}`}
                            className="opacity-80"
                          />
                          <circle 
                            cx="50" cy="50" r="40" 
                            fill="none" 
                            stroke="#235d92" 
                            strokeWidth="15"
                            strokeDasharray={`${(attendanceStats.late / attendanceStats.total || 0) * 251.2} ${251.2}`}
                            strokeDashoffset={`${-(attendanceStats.present / attendanceStats.total || 0) * 251.2}`}
                            className="opacity-80"
                          />
                          <circle 
                            cx="50" cy="50" r="40" 
                            fill="none" 
                            stroke="#f72a1b" 
                            strokeWidth="15"
                            strokeDasharray={`${(attendanceStats.absent / attendanceStats.total || 0) * 251.2} ${251.2}`}
                            strokeDashoffset={`${-((attendanceStats.present + attendanceStats.late) / attendanceStats.total || 0) * 251.2}`}
                            className="opacity-80"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Total</div>
                              <div className="text-2xl font-bold">{attendanceStats.total} days</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-8 mt-6">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-[#579c29] mr-2"></div>
                          <span className="text-sm mr-2">Present</span>
                          <span className="text-sm font-medium">{attendanceStats.present} days</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-900 mr-2"></div>
                          <span className="text-sm mr-2">Late</span>
                          <span className="text-sm font-medium">{attendanceStats.late} days</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 mr-2"></div>
                          <span className="text-sm mr-2">Absent</span>
                          <span className="text-sm font-medium">{attendanceStats.absent} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Attendance Request History</h2>
                    <button 
                      onClick={() => {
                        setShowModal(true);
                        setRequestData({
                          date: new Date().toISOString().split('T')[0],
                          checkIn: '09:00',
                          checkOut: '17:00',
                          workType: 'Field Work',
                          location: '',
                          image: null,
                          absenceReason: ''
                        });
                      }}
                      className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                    >
                      New Request
                    </button>
                  </div>
                  
                  {filteredHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full rounded-lg overflow-hidden">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Check-in</th>
                            <th className="p-3 text-left">Check-out</th>
                            <th className="p-3 text-left">Work Type</th>
                            <th className="p-3 text-left">Location</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredHistory.map((request) => (
                            <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="p-3">{formatDate(request.date)}</td>
                              <td className="p-3">{request.check_in}</td>
                              <td className="p-3">{request.check_out}</td>
                              <td className="p-3">{request.work_type}</td>
                              <td className="p-3">{request.location || 'Not specified'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(request.status)}`}>
                                  {request.status}
                                </span>
                              </td>
                              <td className="p-3">
                                {request.status === 'Pending' && (
                                  <button 
                                    onClick={() => {
                                      setEditingRequest(request);
                                      setRequestData({
                                        date: request.date,
                                        checkIn: request.check_in,
                                        checkOut: request.check_out,
                                        workType: request.work_type,
                                        location: request.location || '',
                                        image: request.image || null,
                                        absenceReason: request.absence_reason || ''
                                      });
                                      setShowModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 mr-2"
                                  >
                                    Edit
                                  </button>
                                )}
                                {request.image && (
                                  <button 
                                    onClick={() => {
                                      window.open(request.image, '_blank');
                                    }}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    View Image
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg mb-4">No attendance requests for {selectedMonth}</p>
                      <button 
                        onClick={() => {
                          setShowModal(true);
                          setRequestData({
                            date: new Date().toISOString().split('T')[0],
                            checkIn: '09:00',
                            checkOut: '17:00',
                            workType: 'Field Work',
                            location: '',
                            image: null,
                            absenceReason: ''
                          });
                        }}
                        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                      >
                        Create Request
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg border border-blue-400 shadow-xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingRequest 
                      ? 'Edit Attendance Request' 
                      : (selectedAbsenceDate 
                        ? `Request for ${selectedAbsenceDate.day} ${selectedAbsenceDate.month}, ${selectedAbsenceDate.year}` 
                        : 'New Attendance Request')
                    }
                  </h3>
                  <button 
                    onClick={resetModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {selectedAbsenceDate && (
                      <div className="bg-gray-100 p-3 rounded-md mb-4">
                        <p className="font-medium">Original Status: {selectedAbsenceDate.reason}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          name="date"
                          value={requestData.date}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                        <input
                          type="time"
                          name="checkIn"
                          value={requestData.checkIn}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
                        <input
                          type="time"
                          name="checkOut"
                          value={requestData.checkOut}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
                      <select
                        name="workType"
                        value={requestData.workType}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {workTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                      <input
                        type="text"
                        name="location"
                        value={requestData.location}
                        onChange={handleInputChange}
                        placeholder="Enter location"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Image (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4 mt-6">
                      <button 
                        type="button"
                        onClick={resetModal}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {editingRequest ? 'Update Request' : 'Submit Request'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceApp;