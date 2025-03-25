import React, { useState, useEffect } from 'react';
import Header from '../../components/hrcomponents/hrHeader';
import Sidebar from '../../components/hrcomponents/hrSidebar';
 import leaveService from '../../api/hrapi/useleave';

const LeaveDashboard = () => {
  const [showLeaveDetailsModal, setShowLeaveDetailsModal] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Icons for different leave types
  const leaveIcons = {
    'Casual Leave': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    'Special Leave': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'Earned Leave': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'Restricted Leave': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    'Unpaid Leave': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    // Default icon for other leave types
    'default': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  };
  
  // Colors for different leave types
  const leaveColors = {
    'Casual Leave': {
      bg: 'bg-blue-100 hover:bg-blue-200',
      text: 'text-blue-500'
    },
    'Special Leave': {
      bg: 'bg-purple-100 hover:bg-purple-200',
      text: 'text-purple-500'
    },
    'Earned Leave': {
      bg: 'bg-green-100 hover:bg-green-200',
      text: 'text-green-500'
    },
    'Restricted Leave': {
      bg: 'bg-yellow-100 hover:bg-yellow-200',
      text: 'text-yellow-500'
    },
    'Unpaid Leave': {
      bg: 'bg-red-100 hover:bg-red-200',
      text: 'text-red-500'
    },
    // Default color for other leave types
    'default': {
      bg: 'bg-gray-100 hover:bg-gray-200',
      text: 'text-gray-500'
    }
  };

  // Fetch leave data from API
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        const leaveBalances = await leaveService.getLeaveBalances();
        
        // Transform API data to match component state structure
        const formattedLeaveTypes = leaveBalances.map(leave => {
          // Parse the used/total string (e.g., "5/12 Used")
          const usedTotalMatch = leave.used.match(/(\d+)\/(\d+|∞)/);
          const used = usedTotalMatch ? parseInt(usedTotalMatch[1]) : 0;
          const total = usedTotalMatch && usedTotalMatch[2] !== '∞' ? parseInt(usedTotalMatch[2]) : Infinity;
          
          // Get color and icon based on leave type or use default
          const color = leaveColors[leave.name] || leaveColors.default;
          const icon = leaveIcons[leave.name] || leaveIcons.default;
          
          // Format dates to create history entries
          // The dates field contains all approved leave dates
          const history = leave.dates.map(date => {
            // Convert date string to Date object
            const leaveDate = new Date(date);
            return {
              date: leaveDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              days: 1, // Default to 1 day (you may need to calculate actual days if you have end_date)
              status: 'Approved'
            };
          });
          
          return {
            type: leave.name,
            used,
            total: total === Infinity ? 0 : total, // Handle unlimited leaves
            unlimited: total === Infinity,
            color: color.bg,
            iconColor: color.text,
            icon,
            history
          };
        });
        
        setLeaveTypes(formattedLeaveTypes);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch leave data:', err);
        setError('Failed to load leave data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchLeaveData();
  }, []);
  
  const handleLeaveCardClick = (leaveType) => {
    setSelectedLeaveType(leaveType);
    setShowLeaveDetailsModal(true);
  };

  const getProgressColor = (used, total, unlimited = false) => {
    if (unlimited) return "bg-gray-300"; // Special case for unlimited leaves
    
    const percentage = (used / total) * 100;
    if (percentage > 75) return "bg-red-500";
    if (percentage > 50) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  // Modal for leave details
  const LeaveDetailsModal = () => {
    if (!selectedLeaveType) return null;
    
    // Get the color from the selected leave type
    const progressColor = getProgressColor(
      selectedLeaveType.used, 
      selectedLeaveType.total,
      selectedLeaveType.unlimited
    );
    
    return (
      <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-auto shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {selectedLeaveType.icon}
              <h2 className="text-xl font-bold ml-2">{selectedLeaveType.type}</h2>
            </div>
            <button 
              onClick={() => setShowLeaveDetailsModal(false)}
              className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <div className={`${selectedLeaveType.color} p-6 rounded-xl mb-4`}>
              <div className="flex justify-between mb-3">
                <span className="font-medium text-gray-700">Used</span>
                <span className="font-bold">{selectedLeaveType.used}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="font-medium text-gray-700">Total</span>
                <span className="font-bold">{selectedLeaveType.unlimited ? '∞' : selectedLeaveType.total}</span>
              </div>
              {!selectedLeaveType.unlimited && (
                <>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((selectedLeaveType.used / selectedLeaveType.total) * 100)}%</span>
                  </div>
                  <div className="mt-2 bg-white bg-opacity-50 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`${progressColor} h-full rounded-full`} 
                      style={{ width: `${(selectedLeaveType.used / selectedLeaveType.total) * 100}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          
          <h3 className="font-semibold mb-3 text-lg border-b pb-2">Leave History</h3>
          {selectedLeaveType.history.length > 0 ? (
            <div className="space-y-3">
              {selectedLeaveType.history.map((leave, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center shadow-sm hover:shadow transition">
                  <div>
                    <p className="font-medium text-gray-800">{leave.date}</p>
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full ${leave.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></span>
                      <p className="text-sm text-gray-600">{leave.status}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{leave.days}</p>
                    <p className="text-xs text-gray-500">day{leave.days > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 font-medium">No leave history available</p>
              <p className="text-gray-400 text-sm mt-1">You haven't used any leaves in this category yet.</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition shadow-sm"
              onClick={() => setShowLeaveDetailsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <Header title="Leaves" />
        
        <div className="p-6">
          {/* Loading and error states */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaveTypes.map((leave, index) => (
                <div 
                  key={index}
                  className={`${leave.color} p-6 rounded-xl cursor-pointer transition shadow-sm hover:shadow-md`}
                  onClick={() => handleLeaveCardClick(leave)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-700 font-medium mb-1">{leave.type}</p>
                      <p className="text-3xl font-bold">
                        <span className={leave.iconColor}>{String(leave.used).padStart(2, '0')}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-gray-800">{leave.unlimited ? '∞' : String(leave.total).padStart(2, '0')}</span>
                      </p>
                    </div>
                    {leave.icon}
                  </div>
                  {!leave.unlimited && (
                    <>
                      <div className="bg-white bg-opacity-50 h-2 rounded-full overflow-hidden">
                        <div 
                          className={getProgressColor(leave.used, leave.total) + " h-full"} 
                          style={{ width: `${(leave.used / leave.total) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Used</span>
                        <span>{Math.round((leave.used / leave.total) * 100)}%</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showLeaveDetailsModal && <LeaveDetailsModal />}
    </div>
  );
};

export default LeaveDashboard;