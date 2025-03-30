import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Users } from 'lucide-react';
import axios from 'axios';
import Header from '../../components/empcomponents/empheader';
import Sidebar from '../../components/empcomponents/empSidear';

const ShiftCalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showShiftMates, setShowShiftMates] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shiftData, setShiftData] = useState({
    morning: { days: [], color: 'bg-black text-white', label: 'Morning', mates: [] },
    intermediate: { days: [], color: 'bg-purple-200 text-purple-800', label: 'Intermediate', mates: [] },
    night: { days: [], color: 'bg-blue-100 text-blue-800', label: 'Night', mates: [] }
  });

  // API call to get monthly shift data
  const getMonthlyShiftData = async (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date parameter');
      }

      const token = localStorage.getItem("accessToken");
      const formattedDate = date.toISOString().split('T')[0];
      
      const response = await axios.get(`/shifts/?date=${formattedDate}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Default empty state
      const emptyState = {
        morning: { days: [], color: 'bg-black text-white', label: 'Morning', mates: [] },
        intermediate: { days: [], color: 'bg-purple-200 text-purple-800', label: 'Intermediate', mates: [] },
        night: { days: [], color: 'bg-blue-100 text-blue-800', label: 'Night', mates: [] }
      };

      if (!response.data?.shifts) {
        return emptyState;
      }

      // Process and categorize shifts
      const result = { ...emptyState };

      response.data.shifts.forEach(shift => {
        const day = new Date(shift.date).getDate();
        const type = shift.shift_type?.toLowerCase() || '';
        
        if (type.includes('morning')) {
          result.morning.days.push(day);
          result.morning.mates = shift.mates || [];
        } else if (type.includes('intermediate')) {
          result.intermediate.days.push(day);
          result.intermediate.mates = shift.mates || [];
        } else if (type.includes('night')) {
          result.night.days.push(day);
          result.night.mates = shift.mates || [];
        }
      });

      return result;
    } catch (error) {
      console.error('Shift API Error:', error);
      throw error;
    }
  };

  // Fetch shift data when month changes or when a day is selected
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMonthlyShiftData(currentDate);
        setShiftData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate]);

  // Handle day selection
  const handleDayClick = async (day) => {
    if (!day.currentMonth) return;
    
    setSelectedDay(day.day);
    
    // Create a new date object for the selected day
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day.day
    );
    
    try {
      setLoading(true);
      const data = await getMonthlyShiftData(selectedDate);
      setShiftData(data);
    } catch (err) {
      console.error('Error fetching shift data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = firstDay === 0 ? 6 : firstDay - 1;

    // Previous month days
    const prevDays = Array.from({ length: prevMonthDays }, (_, i) => ({
      day: getDaysInMonth(year, month - 1) - prevMonthDays + i + 1,
      currentMonth: false
    }));

    // Current month days
    const currentDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      currentMonth: true
    }));

    // Next month days
    const totalCells = Math.ceil((prevMonthDays + daysInMonth) / 7) * 7;
    const nextDays = Array.from(
      { length: totalCells - (prevMonthDays + daysInMonth) }, 
      (_, i) => ({ day: i + 1, currentMonth: false })
    );

    return [...prevDays, ...currentDays, ...nextDays];
  };

  const weeks = () => {
    const days = generateCalendarDays();
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  };

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  // Shift helpers
  const getShiftType = (day) => {
    if (shiftData.morning.days.includes(day)) return 'morning';
    if (shiftData.intermediate.days.includes(day)) return 'intermediate';
    if (shiftData.night.days.includes(day)) return 'night';
    return null;
  };

  const getShiftInfo = () => {
    if (!selectedDay) return null;
    
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    const type = getShiftType(selectedDay);
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      type: type ? shiftData[type].label : 'No shift',
      color: type ? shiftData[type].color : 'bg-gray-200 text-gray-800',
      mates: type ? shiftData[type].mates : []
    };
  };

  // Render
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <div className={`flex-1 transition-all flex flex-col overflow-hidden duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
          <Header title="Shift Calendar" />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 p-6">
          <Header title="Shift Calendar" />
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>Error loading shifts: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 p-6 transition-all duration-300">
        <Header title="Shift Calendar" />

        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Shift Legend */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {Object.values(shiftData).map((shift, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${shift.color.split(' ')[0]}`}></div>
              <span className="text-sm">{shift.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
      
          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {weeks().map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const shiftType = day.currentMonth ? getShiftType(day.day) : null;
                  const isSelected = day.currentMonth && selectedDay === day.day;
                  
                  return (
                    <div
                      key={dayIndex}
                      onClick={() => handleDayClick(day)}
                      className={`p-2 h-14 border border-gray-100 flex flex-col items-center justify-center ${
                        day.currentMonth 
                          ? 'cursor-pointer hover:bg-gray-50' 
                          : 'bg-gray-50 text-gray-400'
                      } ${
                        isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
                      }`}
                    >
                      <span 
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ${
                          shiftType ? shiftData[shiftType].color : ''
                        } ${
                          isSelected ? 'font-bold' : ''
                        }`}
                      >
                        {day.day}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Selected Day Info */}
        {selectedDay && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowShiftMates(true)}
            >
              <div>
                <h3 className="font-medium">{getShiftInfo().date}</h3>
                <p className="text-sm text-gray-500">Click to view shift mates</p>
              </div>
              <div className={`px-3 py-1 rounded-full ${getShiftInfo().color} flex items-center gap-2`}>
                <span>{getShiftInfo().type}</span>
                <Users size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Shift Mates Modal */}
        {showShiftMates && selectedDay && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium">Shift Mates</h3>
                <button 
                  onClick={() => setShowShiftMates(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4">
                <div className={`mb-4 p-3 rounded-lg ${getShiftInfo().color}`}>
                  <p className="font-medium">{getShiftInfo().date}</p>
                  <p className="font-bold">{getShiftInfo().type}</p>
                </div>
                
                {getShiftInfo().mates.length > 0 ? (
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {getShiftInfo().mates.map((mate, index) => (
                      <li key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <Users size={16} className="text-gray-600" />
                        </div>
                        <span>{mate}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No shift mates scheduled
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftCalendarApp;