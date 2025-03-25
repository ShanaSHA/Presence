import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Eye, X } from 'lucide-react';
import Header from '../../components/hrcomponents/hrHeader';
import Sidebar from '../../components/hrcomponents/hrSidebar';
import shiftApiService from '../../api/hrapi/shiftApiService';

const CompleteShiftCalendar = () => {
  // State variables
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('calendar');
  const [showEmployeePopup, setShowEmployeePopup] = useState(false);
  const [selectedShiftType, setSelectedShiftType] = useState('morning');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data state
  const [employees, setEmployees] = useState([]);
  const [shiftsData, setShiftsData] = useState({});
  const [workingHours, setWorkingHours] = useState([]);
  const [shiftRosters, setShiftRosters] = useState([]);

  // Shift type configuration
  const shiftTypes = {
    morning: { 
      name: 'Morning', 
      color: 'blue',
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500'
    },
    intermediate: { 
      name: 'Intermediate', 
      color: 'amber',
      bgColor: 'bg-amber-500',
      textColor: 'text-amber-500',
      borderColor: 'border-amber-500'
    },
    night: { 
      name: 'Night', 
      color: 'purple',
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-500'
    }
  };

  // Fetch all required data
  useEffect(() => {
    const fetchData = async (date) => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [employeesData, workingHoursData, shiftRostersData, assignmentsData] = await Promise.all([
          shiftApiService.fetchEmployees(),
          shiftApiService.fetchWorkingHours(),
          shiftApiService.fetchShiftRosters(),
          shiftApiService.fetchEmployeeAssignments({
            start_date: formatDateForAPI(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)),
            end_date: formatDateForAPI(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0))
          })
        ]);

        setEmployees(employeesData);
        setWorkingHours(workingHoursData);
        setShiftRosters(shiftRostersData);
        setShiftsData(transformAssignmentsToShiftsData(assignmentsData));
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentMonth]);

  // Helper functions
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  const transformAssignmentsToShiftsData = (assignments) => {
    const result = {};
    
    assignments.forEach(assignment => {
      const dateStr = assignment.date;
      if (!result[dateStr]) {
        result[dateStr] = {
          morning: [],
          intermediate: [],
          night: []
        };
      }
      
      // Map shift roster to shift type
      const shiftType = getShiftTypeFromRoster(assignment.shift_roster);
      if (shiftType && assignment.employee) {
        result[dateStr][shiftType].push({
          id: assignment.id,
          employee: assignment.employee,
          shift_roster: assignment.shift_roster
        });
      }
    });
    
    return result;
  };

  const getShiftTypeFromRoster = (roster) => {
    if (!roster) return null;
    // Match shift types based on roster name
    if (roster.name.includes('Morning')) return 'morning';
    if (roster.name.includes('Intermediate')) return 'intermediate';
    if (roster.name.includes('Night')) return 'night';
    return null;
  };

  // Calendar generation functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Adjust for Monday as first day of week
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    
    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        currentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        currentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Next month days to fill the grid
    const totalDaysDisplayed = 42; // 6 rows of 7 days
    const daysNeeded = totalDaysDisplayed - days.length;
    for (let i = 1; i <= daysNeeded; i++) {
      days.push({
        day: i,
        currentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const groupIntoWeeks = (days) => {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const getShiftTypesForDate = (date) => {
    const dateStr = formatDateForAPI(date);
    const shifts = shiftsData[dateStr] || {};
    
    const activeShifts = [];
    if (shifts.morning && shifts.morning.length > 0) activeShifts.push('morning');
    if (shifts.intermediate && shifts.intermediate.length > 0) activeShifts.push('intermediate');
    if (shifts.night && shifts.night.length > 0) activeShifts.push('night');
    
    return activeShifts;
  };

  // Event handlers
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setView('shifts');
  };

  const handleViewShifts = () => {
    const today = new Date();
    setSelectedDate(today);
    setView('shifts');
  };

  const handleBackToCalendar = () => {
    setView('calendar');
    setSelectedDate(null);
  };

  const changeMonth = (increment) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const toggleEmployeeSelection = (employeeId) => {
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp.id === employeeId ? { ...emp, selected: !emp.selected } : emp
      )
    );
  };

  // Shift assignment functions
  const handleEditShift = (shiftType) => {
    setSelectedShiftType(shiftType);
    
    // Pre-select employees already assigned to this shift
    if (selectedDate) {
      const dateStr = formatDateForAPI(selectedDate);
      const currentShift = shiftsData[dateStr]?.[shiftType] || [];
      const assignedEmployeeIds = currentShift.map(assignment => assignment.employee.id);
      
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => ({
          ...emp,
          selected: assignedEmployeeIds.includes(emp.id)
        }))
      ); // Added missing closing parenthesis here
    }
    
    setShowEmployeePopup(true);
  };

  const saveEmployeeSelection = async () => {
    if (!selectedDate) return;
    
    const dateStr = formatDateForAPI(selectedDate);
    const selectedEmployeeIds = employees.filter(emp => emp.selected).map(emp => emp.id);
    
    try {
      // Get the shift roster ID for the selected shift type
      const shiftRoster = shiftRosters.find(roster => 
        roster.name.includes(shiftTypes[selectedShiftType].name)
      );
      
      if (!shiftRoster) {
        throw new Error(`No shift roster found for ${selectedShiftType} shift`);
      }
      
      // First, remove any existing assignments for this date and shift type
      const currentAssignments = shiftsData[dateStr]?.[selectedShiftType] || [];
      await Promise.all(
        currentAssignments.map(assignment => 
          shiftApiService.deleteAssignment(assignment.id)
        )
      );
      
      // Then create new assignments for selected employees
      const newAssignments = await Promise.all(
        selectedEmployeeIds.map(employeeId => 
          shiftApiService.assignShift({
            employee: employeeId,
            shift_roster: shiftRoster.id,
            date: dateStr
          })
        )
      );
      
      // Update local state
      setShiftsData(prev => ({
        ...prev,
        [dateStr]: {
          ...(prev[dateStr] || { morning: [], intermediate: [], night: [] }),
          [selectedShiftType]: newAssignments.map(assignment => ({
            id: assignment.id,
            employee: employees.find(e => e.id === assignment.employee),
            shift_roster: shiftRoster
          }))
        }
      }));
      
      // Reset selection
      setEmployees(employees.map(emp => ({ ...emp, selected: false })));
      setShowEmployeePopup(false);
    } catch (error) {
      console.error("Failed to save shift assignments:", error);
      setError("Failed to save assignments. Please try again.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading shift data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate calendar data
  const calendarDays = generateCalendarDays();
  const weeks = groupIntoWeeks(calendarDays);

  return (
    <div className="flex min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <Header title="Shift Calendar" />
       
        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} className="p-1">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="text-lg font-medium">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button onClick={() => changeMonth(1)} className="p-1">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            {/* Shift Legend */}
            <div className="flex gap-4 mb-4 justify-end">
              {Object.entries(shiftTypes).map(([key, { name, bgColor }]) => (
                <div key={key} className="flex items-center">
                  <div className={`w-3 h-3 ${bgColor} rounded-full mr-2`}></div>
                  <span className="text-sm">{name}</span>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 mb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div key={day} className={`text-center font-medium ${index === 6 ? 'text-red-500' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
            
            {weeks.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="grid grid-cols-7">
                {week.map((dayObj, dayIndex) => {
                  const isWeekend = dayIndex === 6; // Sunday
                  const activeShifts = getShiftTypesForDate(dayObj.date);
                  
                  return (
                    <div 
                      key={`day-${weekIndex}-${dayIndex}`} 
                      className={`
                        py-3 px-2 text-center border relative
                        ${dayObj.currentMonth ? 'bg-gray-100' : 'bg-white text-gray-400'}
                        ${isWeekend ? 'text-red-500' : ''}
                        ${selectedDate && selectedDate.getTime() === dayObj.date.getTime() ? 'ring-2 ring-blue-500' : ''}
                        hover:bg-gray-200 cursor-pointer
                      `}
                      onClick={() => handleDateClick(dayObj.date)}
                    >
                      <div className="flex items-center justify-center">
                        <span>{dayObj.day}</span>
                      </div>
                      {activeShifts.length > 0 && (
                        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                          {activeShifts.map((shift) => (
                            <div 
                              key={shift} 
                              className={`w-2 h-2 rounded-full ${shiftTypes[shift].bgColor}`}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            
            <div className="flex justify-center mt-8">
              <button 
                className="bg-black text-white rounded-full px-8 py-2 flex items-center space-x-2"
                onClick={handleViewShifts}
              >
                <Eye className="w-5 h-5" />
                <span>VIEW SHIFTS</span>
              </button>
            </div>
          </div>
        )}

        {/* Shift details panel */}
        {view === 'shifts' && selectedDate && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/5">
              <div className="mb-4">
                <button 
                  onClick={handleBackToCalendar}
                  className="mb-4 text-blue-500 flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to calendar
                </button>
                
                <div className="text-lg mb-4 font-semibold">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                
                {/* Mini calendar for reference */}
                <div className="bg-white shadow rounded-lg p-4">
                  <div className="text-center font-medium mb-2">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  
                  <div className="grid grid-cols-7 mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                      <div key={day} className={`text-center text-xs ${index === 6 ? 'text-red-500' : ''}`}>
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {weeks.map((week, weekIndex) => (
                    <div key={`mini-week-${weekIndex}`} className="grid grid-cols-7">
                      {week.map((dayObj, dayIndex) => {
                        const isWeekend = dayIndex === 6;
                        const activeShifts = getShiftTypesForDate(dayObj.date);
                        const isSelected = selectedDate && selectedDate.getTime() === dayObj.date.getTime();
                        
                        return (
                          <div 
                            key={`mini-day-${weekIndex}-${dayIndex}`} 
                            className={`
                              py-1 text-center text-xs relative
                              ${dayObj.currentMonth ? '' : 'text-gray-400'}
                              ${isWeekend ? 'text-red-500' : ''}
                              ${isSelected ? 'bg-blue-500 text-white rounded-full' : ''}
                              hover:bg-gray-200 cursor-pointer
                            `}
                            onClick={() => handleDateClick(dayObj.date)}
                          >
                            <div className="flex items-center justify-center">
                              <span>{dayObj.day}</span>
                            </div>
                            {activeShifts.length > 0 && !isSelected && (
                              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-px">
                                {activeShifts.map((shift) => (
                                  <div 
                                    key={shift} 
                                    className={`w-1 h-1 rounded-full ${shiftTypes[shift].bgColor}`}
                                  ></div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                {/* Shift Legend */}
                <div className="mt-4 flex flex-col gap-2 bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium">Shift Types</h3>
                  {Object.entries(shiftTypes).map(([key, { name, bgColor }]) => {
                    const shiftHours = workingHours.find(wh => wh.shift_type === key);
                    return (
                      <div key={key} className="flex items-center">
                        <div className={`w-3 h-3 ${bgColor} rounded-full mr-2`}></div>
                        <span>{name} Shift ({shiftHours?.time_range || ''})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-3/5 bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-6">
                Assigned Staff for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h2>
              
              {/* Shift details for the selected date */}
              <div className="space-y-8">
                {Object.entries(shiftTypes).map(([shiftType, { name, textColor, borderColor }]) => {
                  const dateStr = formatDateForAPI(selectedDate);
                  const assignments = shiftsData[dateStr]?.[shiftType] || [];
                  const shiftHours = workingHours.find(wh => wh.shift_type === shiftType);
                  
                  return (
                    <div key={shiftType} className={`border-l-4 ${borderColor} pl-4 py-2`}>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className={`text-lg font-semibold ${textColor}`}>
                          {name} Shift ({shiftHours?.time_range || ''})
                        </h3>
                        <button 
                          className={`p-1 ${textColor} hover:bg-${shiftType}-50 rounded`}
                          onClick={() => handleEditShift(shiftType)}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="pl-4 space-y-1">
                        {assignments.length > 0 ? (
                          assignments.map((assignment, index) => (
                            <div key={`${shiftType}-${index}`} className="flex items-center">
                              <span className={`w-2 h-2 ${shiftTypes[shiftType].bgColor} rounded-full mr-2`}></span>
                              <span>{assignment.employee.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">No employees assigned</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Employee selection popup */}
        {showEmployeePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  <span className={`${shiftTypes[selectedShiftType].textColor}`}>
                    {shiftTypes[selectedShiftType].name} Shift
                  </span> - Assign Staff
                </h3>
                <button 
                  onClick={() => setShowEmployeePopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-sm font-medium">
                  Shift Time: {workingHours.find(wh => wh.shift_type === selectedShiftType)?.time_range || ''}
                </div>
              </div>
              
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {employees.map(emp => (
                  <div key={emp.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input 
                      type="checkbox" 
                      id={`emp-${emp.id}`}
                      checked={emp.selected || false}
                      onChange={() => toggleEmployeeSelection(emp.id)}
                      className="mr-3 h-5 w-5"
                    />
                    <label htmlFor={`emp-${emp.id}`} className="flex-grow cursor-pointer">
                      {emp.name}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowEmployeePopup(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveEmployeeSelection}
                  className={`px-4 py-2 text-white rounded-lg ${shiftTypes[selectedShiftType].bgColor} hover:opacity-90`}
                >
                  Save Assignments
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteShiftCalendar;