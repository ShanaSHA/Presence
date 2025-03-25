import React, { useState, useEffect } from 'react';
import Header from '../../components/empcomponents/empheader';
import Sidebar from '../../components/empcomponents/empSidear';
import { Calendar, FileText, AlertCircle, Check, X, Upload, ChevronRight, Clock } from 'lucide-react';
import leaveService from '../../api/hrapi/leaveService';

const LeaveRequestApp = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'history', 'cancellation'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Popup states
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  
  // Data states
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({
    balanceLeave: 0,
    usedLeave: 0
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    types: false,
    history: false,
    balance: false,
    submit: false,
    cancel: false
  });
  
  // Error states
  const [errors, setErrors] = useState({
    types: null,
    history: null,
    balance: null,
    submit: null,
    cancel: null
  });

  // Form state
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: '',
    file: null
  });
  const [totalDays, setTotalDays] = useState(0);

  // Calculate total days
  const calculateTotalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end - start;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return daysDifference;
  };
   // Handle form changes
   const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Calculate total days when startDate or endDate changes
    if (name === 'startDate' || name === 'endDate') {
      const { startDate, endDate } = { ...formData, [name]: value };
      const days = calculateTotalDays(startDate, endDate);
      setTotalDays(days);
    }
  };
  // Fetch initial data on component mount
  useEffect(() => {
    fetchLeaveTypes();
    fetchLeaveBalance();
    fetchLeaveHistory();
  }, []);

  // Fetch leave types from API
  const fetchLeaveTypes = async () => {
    setIsLoading(prev => ({ ...prev, types: true }));
    try {
      const types = await leaveService.getLeaveTypes();
      setLeaveTypes(types);
      setErrors(prev => ({ ...prev, types: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, types: 'Failed to load leave types. Please try again later.' }));
    } finally {
      setIsLoading(prev => ({ ...prev, types: false }));
    }
  };

  // Fetch leave balance from API
  const fetchLeaveBalance = async () => {
    setIsLoading(prev => ({ ...prev, balance: true }));
    try {
      const balance = await leaveService.getLeaveBalance();
      setLeaveBalances(balance);
      setErrors(prev => ({ ...prev, balance: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, balance: 'Failed to load leave balance. Please try again later.' }));
    } finally {
      setIsLoading(prev => ({ ...prev, balance: false }));
    }
  };

  // Fetch leave history from API
  const fetchLeaveHistory = async () => {
    setIsLoading(prev => ({ ...prev, history: true }));
    try {
      const history = await leaveService.getLeaveHistory();
      setLeaveHistory(history);
      setErrors(prev => ({ ...prev, history: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, history: 'Failed to load leave history. Please try again later.' }));
    } finally {
      setIsLoading(prev => ({ ...prev, history: false }));
    }
  };

  
  

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, submit: true }));
    try {
      await leaveService.submitLeaveRequest(formData);
      // Reset form
      setFormData({
        startDate: '',
        endDate: '',
        leaveType: '',
        reason: '',
        file: null
      });
      // Refresh leave history and balance after successful submission
      fetchLeaveHistory();
      fetchLeaveBalance();
      setErrors(prev => ({ ...prev, submit: null }));
      alert('Leave request submitted successfully!');
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: 'Failed to submit leave request. Please try again.' }));
      alert('Failed to submit leave request: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Handle opening the reason popup
  const handleViewReason = (leave) => {
    setSelectedLeave(leave);
    setShowReasonPopup(true);
  };

  // Handle opening the cancellation popup
  const handleCancelRequest = (leave) => {
    setSelectedLeave(leave);
    setShowCancelPopup(true);
  };

  // Handle submitting cancellation
  const handleSubmitCancellation = async () => {
    if (!cancellationReason.trim()) return;
    
    setIsLoading(prev => ({ ...prev, cancel: true }));
    try {
      await leaveService.cancelLeaveRequest(selectedLeave.id, cancellationReason);
      // Close popup and reset state
      setShowCancelPopup(false);
      setCancellationReason('');
      // Refresh leave history and balance
      fetchLeaveHistory();
      fetchLeaveBalance();
      setErrors(prev => ({ ...prev, cancel: null }));
      alert('Leave request cancelled successfully!');
    } catch (error) {
      setErrors(prev => ({ ...prev, cancel: 'Failed to cancel leave request. Please try again.' }));
      alert('Failed to cancel leave request: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(prev => ({ ...prev, cancel: false }));
    }
  };

  // Format balance data for display
  const formattedLeaveBalances = [
    { type: 'Balance Leave', remaining: leaveBalances.balanceLeave },
    { type: 'Used Leave', remaining: leaveBalances.usedLeave }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 p-6 transition-all duration-300">
        <Header title="Leave Request" />
        
        <div className="p-6">
          {/* Leave Balance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 flex items-center">
            {isLoading.balance ? (
              <div className="col-span-2 bg-white rounded-lg shadow-md p-4 text-center">
                <p className="text-gray-500">Loading balance data...</p>
              </div>
            ) : errors.balance ? (
              <div className="col-span-2 bg-white rounded-lg shadow-md p-4 text-center">
                <p className="text-red-500">{errors.balance}</p>
              </div>
            ) : (
              formattedLeaveBalances.map((balance, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700">{balance.type}</h3>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className="text-lg font-bold text-green-600">{balance.remaining}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex">
              <button 
                className={`flex-1 py-4 px-6 rounded-tl-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'new' 
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('new')}
              >
                <Calendar size={16} />
                <span>New Request</span>
              </button>
              <button 
                className={`flex-1 py-4 px-6 rounded-tr-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'history' 
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('history')}
              >
                <Clock size={16} />
                <span>Leave History</span>
              </button>
            </div>
          </div>

          {/* New Request Form */}
          {activeTab === 'new' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Apply for Leave</h2>
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
                  {errors.submit}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input 
                      type="date" 
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input 
                      type="date" 
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
                  {/* Total Days Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Days</label>
                  <input
                    type="text"
                    value={totalDays}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  {isLoading.types ? (
                    <p className="text-sm text-gray-500">Loading leave types...</p>
                  ) : errors.types ? (
                    <p className="text-sm text-red-500">{errors.types}</p>
                  ) : (
                    <select 
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select Leave Type</option>
                      <select>
                          {leaveTypes.map((leave) => (
                            <option key={leave.id} value={leave.name}></option>
                          ))}
  
                      </select>

                    </select>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-24"
                    placeholder="Please provide details about your leave..."
                    required
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents (Optional)</label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileUpload"
                    />
                    <label 
                      htmlFor="fileUpload" 
                      className="cursor-pointer border border-dashed border-gray-300 bg-gray-50 rounded-md p-4 flex-grow flex items-center justify-center transition-all duration-200 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center">
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          {formData.file ? formData.file.name : "Click to upload or drag and drop"}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          PDF, JPG, PNG up to 10MB
                        </span>
                      </div>
                    </label>
                    {formData.file && (
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                        className="ml-2 p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all duration-200"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                    disabled={isLoading.submit}
                  >
                    {isLoading.submit ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Submit Request
                        <ChevronRight size={16} className="ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Leave History */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Leave History</h2>
                
                {isLoading.history ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading leave history...</p>
                  </div>
                ) : errors.history ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{errors.history}</p>
                  </div>
                ) : leaveHistory.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No leave requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaveHistory.map((leave) => (
                      <div key={leave.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="mb-4 md:mb-0">
                            <div className="flex items-center mb-2">
                              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                leave.status === 'Approved' ? 'bg-green-500' : 
                                leave.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></span>
                              <h3 className="font-medium text-gray-800">{leave.type}</h3>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar size={14} className="mr-1" />
                              <span>{leave.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 text-xs rounded-full ${
                              leave.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                              leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {leave.status}
                            </span>
                            {leave.cancellationRequest && (
                              <span className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                Cancellation Requested
                              </span>
                            )}
                            <button 
                              onClick={() => handleViewReason(leave)}
                              className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              Details
                            </button>
                            {(leave.status === 'Pending' || leave.status === 'Approved') && !leave.cancellationRequest && (
                              <button 
                                onClick={() => handleCancelRequest(leave)}
                                className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Reason Popup */}
      {showReasonPopup && selectedLeave && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Leave Details</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Leave Type</span>
                  <span className="font-semibold text-gray-800">{selectedLeave.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Date</span>
                  <span className="font-semibold text-gray-800">{selectedLeave.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    selectedLeave.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                    selectedLeave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedLeave.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-2">Reason</span>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded border border-gray-200">{selectedLeave.reason}</p>
                </div>
                {selectedLeave.imageUrl && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-2">Supporting Document</span>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <a 
                        href={selectedLeave.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <FileText size={16} className="mr-2" />
                        View Document
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowReasonPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Leave Popup */}
      {showCancelPopup && selectedLeave && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100">
            <div className="bg-red-50 px-6 py-4 border-b border-gray-200 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Cancel Leave Request</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-gray-600">
                Are you sure you want to cancel your <span className="font-medium">{selectedLeave.type}</span> for <span className="font-medium">{selectedLeave.date}</span>?
              </p>
              {errors.cancel && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
                  {errors.cancel}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason:</label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 min-h-24"
                  placeholder="Please provide a reason for cancellation..."
                  required
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowCancelPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-all duration-200"
                disabled={isLoading.cancel}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitCancellation}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={!cancellationReason.trim() || isLoading.cancel}
              >
                {isLoading.cancel ? (
                  <>Processing...</>
                ) : (
                  <>
                    <X size={16} className="mr-1" />
                    Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestApp;
