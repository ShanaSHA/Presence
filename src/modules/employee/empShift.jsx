import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, X, Users } from 'lucide-react';
import Header from '../../components/empcomponents/empheader';
import Sidebar from '../../components/empcomponents/empSidear';

const ShiftCalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0)); // January 2025
  const [selectedDay, setSelectedDay] = useState(5); // Default selected day (05 Jan)
  const [showShiftMatesPopup, setShowShiftMatesPopup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar data
  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Adjust first day to make Monday the first day of the week (0 = Monday, 6 = Sunday)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Get days from previous month to fill the first week
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    const prevMonthDays = Array.from({ length: adjustedFirstDay }, (_, i) => ({
      day: daysInPrevMonth - adjustedFirstDay + i + 1,
      currentMonth: false,
      prevMonth: true,
    }));
    
    // Current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      currentMonth: true,
      prevMonth: false,
    }));
    
    // Determine how many days from next month are needed to complete the grid
    const totalDaysDisplayed = Math.ceil((adjustedFirstDay + daysInMonth) / 7) * 7;
    const nextMonthDays = Array.from(
      { length: totalDaysDisplayed - (adjustedFirstDay + daysInMonth) },
      (_, i) => ({
        day: i + 1,
        currentMonth: false,
        prevMonth: false,
      })
    );
    
    // Combine all days
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  // Split calendar data into weeks
  const weeks = () => {
    const days = generateCalendarData();
    const result = [];
    
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    
    return result;
  };
  
  // Go to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDay(null); // Reset selected day when changing month
  };
  
  // Go to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDay(null); // Reset selected day when changing month
  };
  
  // Month and year formatted
  const formattedMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };
  
  // Mock shift data for visualization
  const shiftTypes = {
    morning: { 
      days: [5, 12, 19, 26], 
      color: 'bg-black text-white',
      label: 'Morning shift',
      mates: ['John Smith', 'Sarah Johnson', 'Michael Lee']
    },
    intermediate: { 
      days: [2, 8, 9, 10, 16, 17, 21, 22, 28, 29], 
      color: 'bg-purple-200 text-purple-800',
      label: 'Intermediate shift',
      mates: ['Emma Davis', 'Robert Wilson', 'Kelly Martinez', 'Thomas Brown']
    },
    night: { 
      days: [3, 4, 11, 18, 25], 
      color: 'bg-blue-100 text-blue-800',
      label: 'Night shift',
      mates: ['David Garcia', 'Jennifer Miller', 'James Rodriguez']
    },
  };
  
  // Get shift type for a given day
  const getShiftType = (day) => {
    if (shiftTypes.morning.days.includes(day)) return 'morning';
    if (shiftTypes.intermediate.days.includes(day)) return 'intermediate';
    if (shiftTypes.night.days.includes(day)) return 'night';
    return null;
  };
  
  // Get text color for a day
  const getDayColor = (day, currentMonth) => {
    if (!currentMonth) return 'text-gray-400';
    if ([1, 4, 11, 18, 25].includes(day)) return 'text-red-500';
    if ([2, 3, 8, 9, 10, 16, 17, 21, 22, 28, 29].includes(day)) return 'text-purple-500';
    return 'text-black';
  };
  
  // Get the week number for a specific day
  const getWeekNumber = (index) => {
    return index.toString().padStart(2, '0');
  };
  
  // Format date for detail card
  const formatSelectedDate = () => {
    if (!selectedDay) return '';
    
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    const day = date.toLocaleDateString('en-US', { day: '2-digit' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    return {
      formatted: `${day} ${month}`,
      weekday: weekday.toLowerCase()
    };
  };
  
  // Handle day click
  const handleDayClick = (day, isCurrentMonth) => {
    if (isCurrentMonth) {
      setSelectedDay(day);
    }
  };
  
  // Toggle shift mates popup
  const toggleShiftMatesPopup = () => {
    setShowShiftMatesPopup(!showShiftMatesPopup);
  };
  
  // Get shift mates for selected day
  const getShiftMates = () => {
    const shiftType = getShiftType(selectedDay);
    return shiftType ? shiftTypes[shiftType].mates : [];
  };
  
  // Get shift label for selected day
  const getShiftLabel = () => {
    const shiftType = getShiftType(selectedDay);
    return shiftType ? shiftTypes[shiftType].label : 'No shift';
  };
  
  // Get shift background color class
  const getShiftBackground = () => {
    const shiftType = getShiftType(selectedDay);
    if (shiftType === 'morning') return 'bg-black text-white';
    if (shiftType === 'intermediate') return 'bg-purple-200 text-purple-800';
    if (shiftType === 'night') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-200 text-gray-800';
  };
  
  const selectedDateInfo = formatSelectedDate();
  
  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 p-6 transition-all duration-300">
        <Header title="Shift" />
      
      {/* Month and Year with Navigation */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{formattedMonthYear()}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Shift Types Legend */}
      <div className="flex gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-black"></div>
          <span>morning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-200"></div>
          <span>intermediate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-100"></div>
          <span>night</span>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="border rounded-md overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 bg-gray-100 text-center py-2">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>
        
        {/* Calendar Weeks */}
        {weeks().map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-8 border-t">
            {/* Week number */}
            <div className="border-r p-2 flex items-center justify-center text-xs text-gray-500">
              {getWeekNumber(weekIndex + 1)}
            </div>
            
            {/* Days */}
            {week.map((day, dayIndex) => (
              <div 
                key={dayIndex} 
                className={`p-2 border-r last:border-r-0 h-14 flex items-center justify-center ${
                  !day.currentMonth ? 'bg-gray-50' : ''
                } ${day.currentMonth ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => handleDayClick(day.day, day.currentMonth)}
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-full ${
                  day.currentMonth && selectedDay === day.day ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                } ${
                  day.currentMonth && getShiftType(day.day) === 'morning' ? 'bg-black text-white' : 
                  day.currentMonth && getShiftType(day.day) === 'intermediate' ? 'bg-purple-200' :
                  day.currentMonth && getShiftType(day.day) === 'night' ? 'bg-blue-100' : ''
                } ${getDayColor(day.day, day.currentMonth)}`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Selected Day Detail Card */}
      {selectedDay && (
        <div 
          className="mt-4 bg-gray-100 p-4 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={toggleShiftMatesPopup}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{selectedDateInfo.formatted}</h3>
              <p className="text-gray-500">{selectedDateInfo.weekday}</p>
            </div>
            <div className={`px-4 py-1 rounded-full flex items-center gap-2 ${getShiftBackground()}`}>
              {getShiftLabel()} <Users size={16} />
            </div>
          </div>
        </div>
      )}
      
      {/* Shift Mates Popup */}
      {showShiftMatesPopup && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 w-80 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Shift Mates</h3>
              <button onClick={toggleShiftMatesPopup} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className={`px-3 py-2 rounded-md mb-4 ${getShiftBackground()}`}>
              <p className="font-medium">{selectedDateInfo.formatted} - {getShiftLabel()}</p>
            </div>
            
            <ul className="space-y-2">
              {getShiftMates().map((mate, index) => (
                <li key={index} className="flex items-center gap-3 p-2 border-b last:border-0">
                  <div className="bg-gray-200 p-2 rounded-full">
                    <Users size={16} />
                  </div>
                  {mate}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default ShiftCalendarApp;