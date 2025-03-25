import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, History, ChevronRight, X, Info } from 'lucide-react';
import Header from '../../components/empcomponents/empheader';
import Sidebar from '../../components/empcomponents/empSidear';
import overtimeService from '../../api/empapi/overtime';

const OvertimeDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [showBarDetailCard, setShowBarDetailCard] = useState(false);
  const [selectedBarData, setSelectedBarData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State for API data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalOvertime, setTotalOvertime] = useState(0);
  const [average, setAverage] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState({ month: '', hours: 0 });
  const [assignedOvertime, setAssignedOvertime] = useState({ upcoming: [], due: [] });
  const [overtimeHistory, setOvertimeHistory] = useState([]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch overtime stats
      const statsData = await overtimeService.getOvertimeStats();
      const formattedChartData = overtimeService.formatChartData(statsData);
      
      setMonthlyData(formattedChartData);
      setTotalOvertime(statsData.total_hours || 0);
      setSelectedMonth(statsData.selected_month || { month: '', hours: 0 });
      
      // Calculate average from non-zero months
      const nonZeroMonths = formattedChartData.filter(month => month.hours > 0);
      const avgHours = nonZeroMonths.length > 0 
        ? (statsData.total_hours / nonZeroMonths.length).toFixed(1) 
        : 0;
      setAverage(avgHours);
      
      // Fetch overtime assignments
      const assignmentsData = await overtimeService.getOvertimeAssignments();
      const formattedAssignments = overtimeService.formatAssignments(assignmentsData);
      
      setAssignedOvertime({
        upcoming: formattedAssignments.upcoming || [],
        due: formattedAssignments.due || []
      });
      
      setOvertimeHistory(formattedAssignments.completed || []);
      
    } catch (err) {
      setError('Failed to load overtime data. Please try again later.');
      console.error('Error fetching overtime data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Find the maximum value for scaling the chart
  const maxHours = Math.max(...monthlyData.map(item => item.hours), 1); // Avoid division by zero
  const chartHeight = 200; // pixels
  
  // Handle bar click
  const handleBarClick = (data) => {
    setSelectedBarData(data);
    setShowBarDetailCard(true);
  };
  
  // History Page Content
  const HistoryPage = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <History className="text-purple-600 mr-2" size={20} />
          <h2 className="text-xl font-bold">Overtime History</h2>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Loading overtime history...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : overtimeHistory.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>No overtime history available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {overtimeHistory.map((entry, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center hover:bg-gray-200 transition duration-200">
              <div>
                <p className="font-medium">{entry.period}</p>
                <div className="flex items-center mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <p className="text-sm text-gray-600">{entry.status}</p>
                </div>
              </div>
              <div className="flex items-center">
                <p className="font-bold text-purple-600">{entry.hours} hrs</p>
                <ChevronRight size={16} className="ml-2 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  // Assigned Overtime Page Content
  const AssignedPage = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Calendar className="text-purple-600 mr-2" size={20} />
          <h2 className="text-xl font-bold">Assigned Overtime</h2>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Loading assigned overtime...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="font-medium text-red-600 mb-2 flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              Due Overtime
            </h3>
            {assignedOvertime.due.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No due overtime assignments</p>
            ) : (
              assignedOvertime.due.map((entry, index) => (
                <div key={index} className="bg-red-50 p-4 rounded-lg mb-2 flex justify-between items-center border-l-4 border-red-500">
                  <div>
                    <p className="font-medium">{entry.date}</p>
                    <div className="flex items-center mt-1">
                      <Clock size={14} className="text-gray-500 mr-1" />
                      <p className="text-sm text-gray-600">{entry.time}</p>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-gray-600 mt-1">{entry.reason}</p>
                    )}
                  </div>
                  <div className="bg-red-100 py-1 px-3 rounded-full">
                    <p className="font-bold text-red-600">{entry.hours} hrs</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div>
            <h3 className="font-medium text-blue-600 mb-2 flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Upcoming Overtime
            </h3>
            {assignedOvertime.upcoming.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming overtime assignments</p>
            ) : (
              assignedOvertime.upcoming.map((entry, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg mb-2 flex justify-between items-center border-l-4 border-blue-500 hover:bg-blue-100 transition duration-200">
                  <div>
                    <p className="font-medium">{entry.date}</p>
                    <div className="flex items-center mt-1">
                      <Clock size={14} className="text-gray-500 mr-1" />
                      <p className="text-sm text-gray-600">{entry.time}</p>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-gray-600 mt-1">{entry.reason}</p>
                    )}
                  </div>
                  <div className="bg-blue-100 py-1 px-3 rounded-full">
                    <p className="font-bold text-blue-600">{entry.hours} hrs</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
  
  // Bar detail card
  const BarDetailCard = () => {
    if (!selectedBarData) return null;
    
    return (
      <div className="fixed inset-0 bg-opacity-25 flex items-center justify-center z-40" onClick={() => setShowBarDetailCard(false)}>
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Info className="text-purple-600 mr-2" size={20} />
              <h2 className="text-xl font-bold">
                {`${selectedBarData.month} ${selectedBarData.year}`}
              </h2>
            </div>
            <button 
              onClick={() => setShowBarDetailCard(false)}
              className="text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-full"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <p className="text-gray-600">Total Overtime</p>
            <p className="text-3xl font-bold text-purple-700">{selectedBarData.hours} hrs</p>
          </div>
          
          {selectedBarData.details && selectedBarData.details.length > 0 ? (
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Weekly Breakdown</h3>
              <div className="space-y-2">
                {selectedBarData.details.map((week, idx) => (
                  <div key={idx} className="bg-gray-100 p-3 rounded flex justify-between items-center">
                    <span className="font-medium">{week.week}</span>
                    <span className="text-purple-700 font-bold">{week.hours} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-700 text-center p-4">
              <p>No weekly breakdown available for this period.</p>
            </div>
          )}
          
          <button 
            className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
            onClick={() => setShowBarDetailCard(false)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Stats & Overview Content
  const StatsPage = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Clock className="mr-2 text-purple-600" size={20} />
          Overtime Overview
        </h2>
        {isLoading ? null : (
          <button 
            onClick={fetchData}
            className="text-purple-600 hover:text-purple-800 bg-purple-100 p-2 rounded"
          >
            Refresh
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="py-20 text-center">
          <p className="text-gray-500">Loading overtime data...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p className="text-gray-600 mb-1">Total Overtime</p>
              <p className="text-2xl font-bold text-purple-700">{totalOvertime} hrs</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-gray-600 mb-1">Monthly Average</p>
              <p className="text-2xl font-bold text-blue-700">{average} hrs</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-gray-600 mb-1">Upcoming Hours</p>
              <p className="text-2xl font-bold text-green-700">
                {assignedOvertime.upcoming.reduce((sum, ot) => sum + ot.hours, 0)} hrs
              </p>
            </div>
          </div>
          
          {/* Bar chart */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">
              Monthly Distribution
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Click on bars for details)
              </span>
            </h3>
            <div className="h-64 border-b border-l border-gray-200 relative">
              {/* Y-axis labels */}
              <div className="absolute -left-10 top-0 h-full flex flex-col justify-between text-gray-500 text-sm">
                <span>{Math.ceil(maxHours)}h</span>
                <span>{Math.ceil(maxHours * 0.75)}h</span>
                <span>{Math.ceil(maxHours * 0.5)}h</span>
                <span>{Math.ceil(maxHours * 0.25)}h</span>
                <span>0h</span>
              </div>
              
              {/* Horizontal grid lines */}
              <div className="absolute w-full h-full">
                {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
                  <div 
                    key={i} 
                    className="border-t border-gray-100 absolute w-full" 
                    style={{ top: `${pos * 100}%` }}
                  />
                ))}
              </div>
              
              {/* Bar chart */}
              <div className="h-full flex items-end justify-between px-2">
                {monthlyData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center w-full">
                    <div className="relative w-full flex justify-center">
                      {item.hours > 0 ? (
                        <div
                          className={`w-12 ${item.hours > 50 ? 'bg-red-400' : 'bg-purple-500'} 
                            rounded-t-md hover:opacity-80 transition-all duration-200 cursor-pointer`}
                          style={{ 
                            height: `${(item.hours / maxHours) * chartHeight}px`,
                          }}
                          onClick={() => handleBarClick(item)}
                        />
                      ) : (
                        <div
                          className="w-12 bg-gray-200 rounded-t-md h-1"
                        />
                      )}
                    </div>
                    <span className="mt-2 text-gray-600 font-medium">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Total overtime - clickable card */}
          <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-lg flex justify-between items-center cursor-pointer hover:shadow-md transition duration-300 text-white"
            onClick={() => setActiveTab('history')}
          >
            <div>
              <h3 className="text-lg font-medium">View Full Overtime History</h3>
              <p className="text-purple-100 mt-1">See all your overtime records</p>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold mr-2">{totalOvertime} hrs</span>
              <ChevronRight size={24} />
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'assigned':
        return <AssignedPage />;
      case 'history':
        return <HistoryPage />;
      case 'stats':
      default:
        return <StatsPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-popins">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 p-6 transition-all duration-300">
        <Header title="Overtime Dashboard" />
      
        {/* Tabs */}
        <div className="bg-white shadow-sm rounded-lg p-1 flex mb-6 max-w-md">
          <button 
            className={`flex-1 py-3 text-center rounded-md transition duration-200 ${
              activeTab === 'stats' ? 'bg-purple-100 text-purple-700 font-medium shadow-sm' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('stats')}
          >
            Stats & Overview
          </button>
          <button 
            className={`flex-1 py-3 text-center rounded-md transition duration-200 ${
              activeTab === 'assigned' ? 'bg-purple-100 text-purple-700 font-medium shadow-sm' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('assigned')}
          >
            Assigned Overtime
          </button>
          <button 
            className={`flex-1 py-3 text-center rounded-md transition duration-200 ${
              activeTab === 'history' ? 'bg-purple-100 text-purple-700 font-medium shadow-sm' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      
        {/* Content area - renders different pages based on active tab */}
        {renderContent()}
      </div>
      
      {/* Bar Detail Card Modal */}
      {showBarDetailCard && <BarDetailCard />}
    </div>
  );
};

export default OvertimeDashboard;