import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Bell, 
  Info, 
  X, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle,
  ChevronRight,
  Search,
  Plus
} from "lucide-react";
import Sidebar from "../../components/admincomponents/Sidebar";
import Header from "../../components/admincomponents/Header";
import {
  fetchAllLeaveRequests,
  updateLeaveRequestStatus,
  approveCancellationRequest,
  setActiveTab,
  selectRequest,
  closeRequestDetail,
  toggleCancellationReason,
  toggleSidebar
} from "../../redux/admredux/leaveRequestsSlice";

const LeaveRequest = () => {
  const dispatch = useDispatch();
  const {
    requests: leaveRequests,
    loading,
    activeTab,
    selectedRequest,
    showCancellationReason,
    isSidebarOpen,
    error
  } = useSelector((state) => state.leaveRequests);

  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    employeeId: '',
    employeeName: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null
  });

  // Fetch leave requests on component mount
  useEffect(() => {
    dispatch(fetchAllLeaveRequests());
  }, [dispatch]);

  // Handle Approve/Reject Actions
  const handleAction = (leaveId, action) => {
    dispatch(updateLeaveRequestStatus({ leaveId, action }))
      .unwrap()
      .then(() => {
        setNotification({
          type: "success",
          message: `Leave request ${action === "approve" ? "approve" : "reject"} successfully`
        });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      })
      .catch((error) => {
        console.error(`Error updating leave request: ${error}`);
        setNotification({
          type: "error",
          message: `Failed to ${action} leave request`
        });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      });
  };

  // Handle Cancellation Approval
  const handleCancellationApproval = (leaveId) => {
    dispatch(approveCancellationRequest(leaveId))
      .unwrap()
      .then(() => {
        setNotification({
          type: "success",
          message: "Cancellation request approved successfully"
        });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      })
      .catch((error) => {
        console.error(`Error approving cancellation: ${error}`);
        setNotification({
          type: "error",
          message: "Failed to approve cancellation request"
        });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      });
  };

  // Show error if any API call fails
  useEffect(() => {
    if (error) {
      console.error("Error:", error);
      setNotification({
        type: "error",
        message: error
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  }, [error]);
  
  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return '';
    if (!endDate || startDate === endDate) return new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Sample cancellation requests data
  const cancellationRequests = useSelector((state) => state.leaveRequests.cancellationRequests) || [
    {
      id: 1,
      name: "Robert Joe",
      position: "Python Developer",
      reason: "Due to changes in project timeline, I need to cancel my leave request.",
      leaveType: "Annual Leave",
      dates: "March 15-20, 2025",
      status: "pending"
    },
    {
      id: 2,
      name: "Sarah Miller",
      position: "UI/UX Designer",
      reason: "Family emergency resolved, no longer need time off.",
      leaveType: "Sick Leave",
      dates: "March 18-19, 2025",
      status: "pending"
    }
  ];

  // Handle form input change
  const handleFormInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment' && files.length > 0) {
      setLeaveFormData({
        ...leaveFormData,
        attachment: files[0]
      });
    } else {
      setLeaveFormData({
        ...leaveFormData,
        [name]: value
      });
    }
  };

  // Handle form submit
  const handleFormSubmit = () => {
    // Here you would add the actual form submission logic
    console.log("Form data:", leaveFormData);
    // Close modal after submission
    setShowNewRequestModal(false);
    // Reset form
    setLeaveFormData({
      employeeId: '',
      employeeName: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      attachment: null
    });
  };

  // Filter leave requests based on search term
  const filteredLeaveRequests = leaveRequests.filter(request => 
    (request.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => dispatch(toggleSidebar())} 
      />

      {/* Main Content */}
      <div className="flex-1 p-6 transition-all duration-300">
        {/* Header */}
        <Header title="Leave Requests Management" />

        {/* Notification */}
        {showNotification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {notification.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <p>{notification.message}</p>
            <button 
              onClick={() => setShowNotification(false)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="p-8">
          {/* Tab Buttons */}
          <div className="mb-6">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 shadow-sm">
              <button
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "leave" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => dispatch(setActiveTab("leave"))}
              >
                Leave Requests
              </button>
              <button
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "cancellation" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => dispatch(setActiveTab("cancellation"))}
              >
                Cancellation Requests
              </button>
              <button
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "history" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => dispatch(setActiveTab("history"))}
              >
                Leave History
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex mb-4">
            <div className="flex-1 bg-white shadow-sm rounded-lg flex items-center px-3 py-2">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                className="bg-transparent w-full outline-none text-gray-700"
                placeholder="Search employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === "leave" ? (
            /* Leave Requests List */
            <div className="space-y-4">
              {filteredLeaveRequests.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-xl shadow-md">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No Leave Requests</h3>
                  <p className="text-gray-500 mt-2">There are no pending leave requests to display.</p>
                </div>
              ) : (
                filteredLeaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl shadow-md flex items-center justify-between p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => dispatch(selectRequest(request))}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-800">{request.employee_name}</h3>
                        <p className="text-sm text-gray-500">{request.position || "Hr"}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 mr-2">{request.type}</span>
                          <span className="text-xs text-gray-500">{request.dates || formatDateRange(request.start_date, request.end_date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1.5 bg-white border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(request.id, "approve");
                        }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        className="px-3 py-1.5 bg-white border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(request.id, "reject");
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                      >
                        <Info className="h-4 w-4" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === "cancellation" ? (
            /* Cancellation Request View */
            <div className="space-y-4">
              {cancellationRequests.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-xl shadow-md">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No Cancellation Requests</h3>
                  <p className="text-gray-500 mt-2">There are no pending cancellation requests to display.</p>
                </div>
              ) : (
                cancellationRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl shadow-md flex items-center justify-between p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => dispatch(toggleCancellationReason(true))}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-800">{request.employee_name}</h3>
                        <p className="text-sm text-gray-500">{request.position}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 mr-2">{request.leave_type}</span>
                          <span className="text-xs text-gray-500">{request.dates}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleCancellationReason(true));
                        }}
                      >
                        <Info className="h-4 w-4" />
                        <span>Reason</span>
                      </button>
                      <button
                        className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancellationApproval(request.id);
                        }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Leave History Tab */
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 py-3 px-4 border-b border-gray-200 flex">
                <div className="w-1/3 font-medium text-gray-600">Hr</div>
                <div className="w-1/3 font-medium text-gray-600">Leave Details</div>
                <div className="w-1/3 font-medium text-gray-600">Status</div>
              </div>
              
              {leaveRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No leave history found</p>
                </div>
              ) : (
                filteredLeaveRequests.map((item) => (
                  <div 
                    key={item.id}
                    className="border-b border-gray-100 last:border-0 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex">
                      <div className="w-1/3 flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                          <User size={16} className="text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{item.employee_name}</div>
                          <div className="text-xs text-gray-500">{item.position || "Hr"}</div>
                        </div>
                      </div>
                      <div className="w-1/3">
                        <div className="text-sm text-gray-700 font-medium">{item.leave_type}</div>
                        <div className="text-xs text-gray-500">{item.dates || formatDateRange(item.start_date, item.end_date)}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="inline-block max-w-xs truncate">{item.reason || "Personal reasons"}</span>
                        </div>
                      </div>
                      <div className="w-1/3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'approve' ? 'bg-green-100 text-green-800' : 
                          item.status === 'reject' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
       
      </div>

      {/* Leave Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0  bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl">
            <button
              onClick={() => dispatch(closeRequestDetail())}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-6 text-gray-800">Leave Request Details</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{selectedRequest.employeename}</h4>
                  <p className="text-sm text-gray-500">{selectedRequest.position || "Hr"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Leave Type</h4>
                  <p className="text-gray-900">{selectedRequest.leave_type}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-gray-500 mb-1">Date Range</h4>
                <p className="text-gray-900">{selectedRequest.dates || formatDateRange(selectedRequest.start_date, selectedRequest.end_date)}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-gray-500 mb-1">Reason</h4>
                <p className="text-gray-900">{selectedRequest.reason || "Personal reasons"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  className="py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  onClick={() => {
                    handleAction(selectedRequest.id, "approve");
                    dispatch(closeRequestDetail());
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button
                  className="py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  onClick={() => {
                    handleAction(selectedRequest.id, "reject");
                    dispatch(closeRequestDetail());
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {showCancellationReason && (
        <div className="fixed inset-0  bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl">
            <button 
              onClick={() => dispatch(toggleCancellationReason(false))} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Cancellation Reason</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <p className="text-gray-800">Due to changes in project timeline, I need to cancel my leave request.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg transition-colors hover:bg-gray-300"
                onClick={() => dispatch(toggleCancellationReason(false))}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                onClick={() => {
                  handleCancellationApproval(1);
                  dispatch(toggleCancellationReason(false));
                }}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approve Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequest;