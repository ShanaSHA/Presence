import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, X, CheckCircle2 } from 'lucide-react';
import Header from '../../components/hrcomponents/hrHeader';
import Sidebar from '../../components/hrcomponents/hrSidebar';
import shiftApiService from '../../api/hrapi/shiftApiService';

const CompleteShiftCalendar = () => {
  // State management
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('calendar');
  const [showEmployeePopup, setShowEmployeePopup] = useState(false);
  const [selectedShiftType, setSelectedShiftType] = useState('morning');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [shiftsData, setShiftsData] = useState({});
  const [assignedEmployees, setAssignedEmployees] = useState({});
  
  // State for shift details view
  const [dailyAssignments, setDailyAssignments] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  // Shift type configuration
  const shiftTypes = useMemo(() => ({
    morning: { 
      name: 'Morning', 
      gradientClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200',
      textColor: 'text-emerald-900',
      iconBg: 'bg-emerald-100',
      icon: <Clock className="w-5 h-5 text-emerald-600" />
    },
    intermediate: { 
      name: 'Intermediate', 
      gradientClass: 'bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200',
      textColor: 'text-sky-900',
      iconBg: 'bg-sky-100',
      icon: <Clock className="w-5 h-5 text-sky-600" />
    },
    night: { 
      name: 'Night', 
      gradientClass: 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200',
      textColor: 'text-purple-900',
      iconBg: 'bg-purple-100',
      icon: <Clock className="w-5 h-5 text-purple-600" />
    }
  }), []);

  // Utility functions
  const formatDateForAPI = useCallback((date) => date.toISOString().split('T')[0], []);

  const createAssignedEmployeesMap = useCallback((assignments) => {
    const map = {};
    assignments.forEach(assignment => {
      const dateStr = assignment.date;
      map[dateStr] = map[dateStr] || new Set();
      if (assignment.employee) {
        map[dateStr].add(assignment.employee.id);
      }
    });
    return map;
  }, []);

  const transformAssignmentsToShiftsData = useCallback((assignments) => {
    const result = {};
    assignments.forEach(assignment => {
      const dateStr = assignment.date;
      if (!result[dateStr]) {
        result[dateStr] = { morning: [], intermediate: [], night: [] };
      }
      
      const shiftType = assignment.shift_type?.toLowerCase();
      if (shiftType && assignment.employee_name) {
        result[dateStr][shiftType].push({
          id: assignment.id,
          employee: {
            id: assignment.employee,
            name: assignment.employee_name
          },
          shift_roster: {
            id: assignment.shift,
            name: assignment.shift_type
          }
        });
      }
    });
    return result;
  }, []);

  // Data fetching
  const fetchAssignmentsForMonth = useCallback(async (month) => {
    const date = new Date(month.getFullYear(), month.getMonth(), 1);
    
    
    try {
      const assignments = await shiftApiService.getShiftAssignmentsByDateRange(
        formatDateForAPI(date),
        
      );
      return Array.isArray(assignments) ? assignments : [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }, [formatDateForAPI]);

  // Fetch daily assignments when in details view
  useEffect(() => {
    if (view === 'details') {
      const fetchDailyAssignments = async () => {
        try {
          setIsLoadingDetails(true);
          setErrorDetails(null);
          const assignments = await shiftApiService.getShiftAssignmentsByDate(
            formatDateForAPI(selectedDate)
          );
          console.log("assignments",assignments);
          
          setDailyAssignments(Array.isArray(assignments.assignments) ? assignments.assignments : []);
        } catch (error) {
          console.error('Error fetching daily assignments:', error);
          setErrorDetails('Failed to load shift details. Please try again.');
          setDailyAssignments([]);
        } finally {
          setIsLoadingDetails(false);
        }
      };
      
      fetchDailyAssignments();
    }
  }, [selectedDate, view, formatDateForAPI]);

  // Main data fetch
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [employeesData, assignments] = await Promise.all([
        shiftApiService.fetchEmployees(),
        fetchAssignmentsForMonth(currentMonth)
      ]);

      setEmployees(employeesData.map(emp => ({ ...emp, selected: false })));
      setShiftsData(transformAssignmentsToShiftsData(assignments));
      setAssignedEmployees(createAssignedEmployeesMap(assignments));
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, fetchAssignmentsForMonth, transformAssignmentsToShiftsData, createAssignedEmployeesMap]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Transform daily assignments for display
  const dailyShifts = useMemo(() => {
    const result = { morning: [], intermediate: [], night: [] };
    
    dailyAssignments.forEach(assignment => {
      const shiftType = assignment.shift_type?.toLowerCase();
      if (shiftType && assignment.employee_name) {
        result[shiftType].push({
          id: assignment.id,
          employee: {
            id: assignment.employee,
            name: assignment.employee_name
          },
          shift_roster: {
            id: assignment.shift,
            name: assignment.shift_type
          }
        });
      }
    });
    
    return result;
  }, [dailyAssignments]);
  useEffect(() => {
    console.log("dailyAssignments:",dailyAssignments)
    console.log("daiyshifts:",dailyShifts)

    
  }, [dailyAssignments])
  
  // Calendar generation
  const generateCalendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay();

    const days = [];
    
    // Previous month's days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDate = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push({
        date: prevMonthDate,
        day: prevMonthDate.getDate(),
        isCurrentMonth: false
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateForAPI(date);
      
      days.push({
        date,
        day,
        isCurrentMonth: true,
        shifts: shiftsData[dateStr] || {
          morning: [],
          intermediate: [],
          night: []
        }
      });
    }

    // Next month's days
    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDate,
        day: i,
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentMonth, shiftsData, formatDateForAPI]);

  const groupIntoWeeks = (days) => {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  // Event handlers
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowEmployeePopup(true);
    setEmployees(prev => prev.map(emp => ({ ...emp, selected: false })));
  };

  const handleCloseEmployeePopup = () => {
    setShowEmployeePopup(false);
  };

  const handleAddShift = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    const selectedEmployees = employees.filter(emp => emp.selected);
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    const dateStr = formatDateForAPI(selectedDate);
    const alreadyAssigned = selectedEmployees.filter(emp => 
      assignedEmployees[dateStr]?.has(emp.id)
    );

    if (alreadyAssigned.length > 0) {
      alert(`${alreadyAssigned.map(emp => emp.name).join(', ')} already assigned`);
      return;
    }

    try {
      await shiftApiService.assignShift({
        date: dateStr,
        shift_roster: shiftTypes[selectedShiftType].name,
        employees: selectedEmployees.map(emp => emp.id)
      });
      await fetchData();
      handleCloseEmployeePopup();
    } catch (error) {
      console.error('Failed to add shift:', error);
      alert(`Failed to add shift: ${error.message}`);
    }
  };

  // View components
  const renderCalendarView = () => {
    const weeks = groupIntoWeeks(generateCalendarDays);

    return (
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border-2 border-gray-100">
        {/* Month header */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-8 py-6 shadow-md">
          <div className="flex justify-between items-center">
            <button onClick={handlePreviousMonth} className="p-3 hover:bg-gray-300/30 rounded-full">
              <ChevronLeft className="w-8 h-8 text-gray-600" />
            </button>
            <h2 className="text-3xl font-bold text-gray-800">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={handleNextMonth} className="p-3 hover:bg-gray-300/30 rounded-full">
              <ChevronRight className="w-8 h-8 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4 text-center mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-semibold text-gray-500 uppercase text-sm">
                {day}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 text-center gap-4 mb-4">
              {week.map((day, dayIndex) => (
                <div 
                  key={dayIndex}
                  className={`relative border-2 rounded-2xl p-2 ${
                    day.isCurrentMonth 
                      ? 'bg-white hover:shadow-lg cursor-pointer border-gray-200' 
                      : 'bg-gray-50 text-gray-400 border-transparent'
                  }`}
                  onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
                >
                  <div className="justify-between items-center">
                    <span className={`text-sm font-bold ${
                      day.isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {day.day}
                    </span>
                    {day.isCurrentMonth && (
                      <div className="flex space-x-1">
                        {Object.keys(day.shifts).map(shiftType => 
                          day.shifts[shiftType].length > 0 && (
                            <div 
                              key={shiftType}
                              className={`w-2 h-2 rounded-full ${shiftTypes[shiftType].gradientClass}`}
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {day.isCurrentMonth && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(day.shifts).map(([shiftType, shiftEmployees]) => (
                        shiftEmployees.length > 0 && (
                          <div 
                            key={shiftType}
                            className={`text-xs p-1 rounded ${shiftTypes[shiftType].gradientClass}`}
                          >
                            {shiftTypes[shiftType].name}: {shiftEmployees.length}
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderShiftDetailsView = () => {
    if (isLoadingDetails) {
      return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      );
    }

    if (errorDetails) {
      return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-red-500 mb-2">{errorDetails}</p>
            <button 
              onClick={() => {
                const newDate = new Date(formatDateForAPI(selectedDate));
                if (!isNaN(newDate.getTime())) {
                  setSelectedDate(newDate);
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    const dateStr = formatDateForAPI(selectedDate);
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Shifts for {selectedDate.toLocaleDateString()}
          </h2>
          <div className="flex items-center">
            <label htmlFor="shift-date" className="mr-2 text-sm font-medium text-gray-700">
              Select Date:
            </label>
            <input
              type="date"
              id="shift-date"
              value={dateStr}
              onChange={(e) => {
                const newDate = new Date(year, month - 1, day+1);
                if (!isNaN(newDate.getTime())) {
                  setSelectedDate(newDate);
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
        </div>

        {Object.entries(shiftTypes).map(([shiftType, config]) => {
          const shiftEmployees = dailyShifts[shiftType] || [];
          console.log("shiftemployees",shiftEmployees)
          return shiftEmployees.length > 0 ? (
            <div key={shiftType} className={`mb-4 p-4 rounded-xl ${config.gradientClass}`}>
              <div className="flex items-center mb-2">
                {config.icon}
                <h3 className="ml-2 font-semibold">{config.name} Shift</h3>
                <span className="ml-auto text-sm">({shiftEmployees.length} staff)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {shiftEmployees.map((assignment) => (
                  <div key={assignment.employee.id} className="bg-white/70 p-2 rounded-lg shadow-sm">
                    <div className="font-medium">{assignment.employee.name}</div>
                    
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div key={shiftType} className={`mb-4 p-4 rounded-xl ${config.gradientClass} opacity-70`}>
              <div className="flex items-center">
                {config.icon}
                <h3 className="ml-2 font-semibold">{config.name} Shift</h3>
                <span className="ml-auto text-sm">(0 staff)</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">No employees assigned</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEmployeePopup = () => {
    if (!showEmployeePopup || !selectedDate) return null;

    const dateStr = formatDateForAPI(selectedDate);
    const assignedIds = assignedEmployees[dateStr] || new Set();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Assign Shift for {selectedDate.toLocaleDateString()}</h3>
            <button onClick={handleCloseEmployeePopup} className="text-gray-500">
              <X size={24} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Shift Type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(shiftTypes).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setSelectedShiftType(type)}
                  className={`p-2 rounded ${selectedShiftType === type ? config.gradientClass : 'bg-gray-100'}`}
                >
                  {config.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Select Employees</label>
            <div className="border rounded p-2 max-h-60 overflow-y-auto">
              {employees.map(employee => (
                <div key={employee.id} className="flex items-center p-1">
                  <input
                    type="checkbox"
                    checked={employee.selected}
                    disabled={assignedIds.has(employee.id)}
                    onChange={() => {
                      setEmployees(prev => 
                        prev.map(emp => 
                          emp.id === employee.id 
                            ? { ...emp, selected: !emp.selected } 
                            : emp
                        )
                      );
                    }}
                    className="mr-2"
                  />
                  <span className={assignedIds.has(employee.id) ? 'text-gray-400' : ''}>
                    {employee.name}
                    {assignedIds.has(employee.id) && ' (assigned)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button 
              onClick={handleCloseEmployeePopup}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddShift}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Assign Shift
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <Header title="Shift Calendar" />
        
        <div className="mb-4 flex space-x-2">
          <button 
            onClick={() => setView('calendar')} 
            className={`px-4 py-2 rounded-lg ${view === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Calendar View
          </button>
          <button 
            onClick={() => setView('details')} 
            className={`px-4 py-2 rounded-lg ${view === 'details' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Shift Details
          </button>
        </div>

        {view === 'calendar' ? renderCalendarView() : renderShiftDetailsView()}
        {renderEmployeePopup()}
      </div>
    </div>
  );
};

export default CompleteShiftCalendar;