import React, { useState, useEffect } from 'react';
import { Bell, Calendar, X, ChevronDown, Plus, Check, Search, FileText, User } from 'lucide-react';
import Sidebar from '../../components/hrcomponents/hrSidebar';
import Header from '../../components/hrcomponents/hrHeader';
import { employeeService, leaveService } from '../../api/hrapi/leavemanagement';

const EmployeeLeaveRequestSystem = () => {
  // State management
  const [activeTab, setActiveTab] = useState('leave');
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeePopup, setShowEmployeePopup] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState({
    employees: false,
    leaves: false,
    history: false,
    cancellations: false
  });
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    employee: '',
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    attachment: null
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchEmployees();
    
    if (activeTab === 'leave') {
      fetchPendingLeaves();
    } else if (activeTab === 'cancellation') {
      fetchCancellationRequests();
    } else if (activeTab === 'history') {
      fetchLeaveHistory();
    }
  }, [activeTab]);

  // Fetch functions
  const fetchEmployees = async () => {
    setLoading(prev => ({ ...prev, employees: true }));
    try {
      const data = await employeeService.getAllEmployees();
      setAllEmployees(data);
    } catch (error) {
      setError('Failed to fetch employees');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  // console.log(employees);
  
  const fetchPendingLeaves = async () => {
    setLoading(prev => ({ ...prev, leaves: true }));
    try {
      const data = await leaveService.getPendingLeaves();
      setEmployees(data);
    } catch (error) {
      setError('Failed to fetch pending leaves');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, leaves: false }));
    }
  };

  const fetchLeaveHistory = async () => {
    setLoading(prev => ({ ...prev, history: true }));
    try {
      const data = await leaveService.getLeaveHistory();
      setHistoryData(data);
    } catch (error) {
      setError('Failed to fetch leave history');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  };

  const fetchCancellationRequests = async () => {
    setLoading(prev => ({ ...prev, cancellations: true }));
    try {
      const data = await leaveService.getPendingCancellations();
      setCancellationRequests(data);
    } catch (error) {
      setError('Failed to fetch cancellation requests');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, cancellations: false }));
    }
  };

  const fetchLeaveTypes = async (employeeId) => {
    try {
      const data = await leaveService.getAvailableLeaveTypes(employeeId);
      setLeaveTypes(data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  // Event handlers
  const handleApprove = async (id) => {
    try {
      await leaveService.approveRejectLeave(id, 'approve');
      // Update the UI
      setEmployees(employees.map(emp => 
        emp.id === id ? {...emp, status: 'approved'} : emp
      ));
      
      if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee({...selectedEmployee, status: 'approved'});
      }
      
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleReject = async (id, rejectReason = '') => {
    try {
      await leaveService.approveRejectLeave(id, 'reject', rejectReason);
      // Update the UI
      setEmployees(employees.map(emp => 
        emp.id === id ? {...emp, status: 'rejected'} : emp
      ));
      
      if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee({...selectedEmployee, status: 'rejected'});
      }
      
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };
  
  const handleApproveCancellation = async (id) => {
    try {
      await leaveService.approveRejectCancellation(id, 'approve');
      setCancellationRequests(cancellationRequests.filter(req => req.id !== id));
    } catch (error) {
      console.error('Error approving cancellation:', error);
    }
  };
  
  const handleRejectCancellation = async (id, rejectReason = '') => {
    try {
      await leaveService.approveRejectCancellation(id, 'reject', rejectReason);
      setCancellationRequests(cancellationRequests.filter(req => req.id !== id));
    } catch (error) {
      console.error('Error rejecting cancellation:', error);
    }
  };

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;
    setFormData({
      ...formData,
      employee: employeeId
    });
    
    // Fetch available leave types for this employee
    if (employeeId) {
      fetchLeaveTypes(employeeId);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment' && files.length > 0) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = async () => {
    try {
      // Check if all required fields are present
      if (!formData.employee || !formData.leave_type || !formData.start_date || 
          !formData.end_date || !formData.reason) {
        alert("Please fill all required fields");
        return;
      }
      
      setSubmitting(true);
      
      // Create FormData object for file upload support
      const formDataObj = new FormData();
      
      // Append fields with the correct names expected by the backend
      formDataObj.append('employee', formData.employee);
      formDataObj.append('leave_policy', formData.leave_type); // Change from leave_type to leave_policy
      formDataObj.append('start_date', formData.start_date);
      formDataObj.append('end_date', formData.end_date);
      formDataObj.append('reason', formData.reason);
      
      // Only append attachment if it exists
      if (formData.attachment) {
        formDataObj.append('image', formData.attachment); // Change from attachment to image
      }
      
      await leaveService.createLeaveRequest(formDataObj);
      setShowModal(false);
      
      // Reset form data and refresh
      setFormData({
        employee: '',
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        attachment: null
      });
      
      fetchPendingLeaves();
      
    } catch (error) {
      console.error('Error submitting leave request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle employee click and show popup
  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeePopup(true);
  };

  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return '';
    if (!endDate || startDate === endDate) return new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Employee details popup
  const renderEmployeePopup = () => (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <h3 className="font-bold text-xl text-gray-800 mb-4">Leave Details</h3>
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={() => setShowEmployeePopup(false)}
        >
          <X size={20} />
        </button>
        
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
              <User size={24} className="text-gray-500" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-800">{selectedEmployee?.employee_name || selectedEmployee?.name}</h4>
              <p className="text-gray-600">{selectedEmployee?.position}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Leave Type:</span>
              <span className="font-medium text-gray-800">{selectedEmployee?.leave_type || selectedEmployee?.leaveType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-800">
                {selectedEmployee?.duration || formatDateRange(selectedEmployee?.start_date, selectedEmployee?.end_date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                selectedEmployee?.status === 'approved' ? 'text-green-600' : 
                selectedEmployee?.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {selectedEmployee?.status?.charAt(0).toUpperCase() + selectedEmployee?.status?.slice(1)}
              </span>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Reason for Leave:</h5>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedEmployee?.reason}</p>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              onClick={() => setShowEmployeePopup(false)}
            >
              Close
            </button>
            {selectedEmployee?.status === 'Pending' && (
              <div className="flex space-x-2">
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  onClick={() => {
                    handleApprove(selectedEmployee.id);
                    setShowEmployeePopup(false);
                  }}
                >
                  Approve
                </button>
                <button 
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  onClick={() => {
                    handleReject(selectedEmployee.id);
                    setShowEmployeePopup(false);
                  }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Tab rendering functions
  const renderSimpleLeaveTab = () => (
    <div className="space-y-4 mt-6">
      {loading.leaves ? (
        <div className="text-center py-8">Loading leave requests...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl shadow-md">
          <p className="text-gray-500">No pending leave requests</p>
        </div>
      ) : (
        employees.map(employee => (
          <div 
            key={employee.id} 
            className="bg-white rounded-xl shadow-md flex items-center justify-between p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleEmployeeClick(employee)}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                <User size={20} className="text-gray-500" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">{employee.employee_name || employee.name}</div>
                <div className="text-sm text-gray-500">{employee.position}</div>
                <div className="flex items-center mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 mr-2">{employee.leave_type || employee.leaveType}</span>
                  <span className="text-xs text-gray-500">
                    {employee.duration || formatDateRange(employee.start_date, employee.end_date)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              {employee.status === 'Pending' ? (
                <div className="flex space-x-2">
                  <button 
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-200 transition-colors flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(employee.id);
                    }}
                  >
                    <Check size={16} className="mr-1" /> Approve</button>
                  <button 
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(employee.id);
                    }}
                  >
                    Reject
                  </button>
                </div>
              ) : employee.status === 'approved' ? (
                <div className="flex items-center bg-green-50 px-3 py-1 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-700 text-sm font-medium">Approved</span>
                </div>
              ) : (
                <div className="flex items-center bg-red-50 px-3 py-1 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-red-700 text-sm font-medium">Rejected</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
      <button 
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={() => setShowModal(true)}
      >
        <Plus size={24} />
      </button>
    </div>
  );

  const renderCancellationTab = () => (
    <div className="space-y-4 mt-6">
      {loading.cancellations ? (
        <div className="text-center py-8">Loading cancellation requests...</div>
      ) : cancellationRequests.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl shadow-md">
          <p className="text-gray-500">No pending cancellation requests</p>
        </div>
      ) : (
        cancellationRequests.map(request => (
          <div 
            key={request.id} 
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleEmployeeClick({
              ...request,
              reason: request.cancellation_reason || request.reason
            })}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                  <User size={20} className="text-gray-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{request.employee_name}</div>
                  <div className="text-sm text-gray-500">{request.position}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 mr-2">
                      {request.leave_type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDateRange(request.start_date, request.end_date)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveCancellation(request.id);
                  }}
                >
                  Approve Cancel
                </button>
                <button 
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejectCancellation(request.id);
                  }}
                >
                  Reject Cancel
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="mt-6">
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
  
      {/* Filtered History Data */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gray-50 py-3 px-4 border-b border-gray-200 flex justify-between">
          <div className="font-medium text-gray-600">Employee</div>
          <div className="font-medium text-gray-600">Leave Details</div>
        </div>
        
        {loading.history ? (
          <div className="text-center py-8">Loading leave history...</div>
        ) : historyData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No leave history found</p>
          </div>
        ) : (
          historyData
            .filter((item) => (item.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()))
            .map((item) => (
              <div 
                key={item.id}
                className="border-b border-gray-100 last:border-0 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{item.employee_name}</div>
                      <div className="text-xs text-gray-500">{item.position}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-700 font-medium">{item.leave_type}</div>
                    <div className="text-xs text-gray-500">{formatDateRange(item.start_date, item.end_date)}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="inline-block max-w-xs truncate">{item.reason}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );

  // Leave Request Modal
  const renderLeaveRequestModal = () => (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
        <h3 className="font-bold text-xl text-gray-800 mb-4">New Leave Request</h3>
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={() => setShowModal(false)}
        >
          <X size={20} />
        </button>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                name="employee"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.employee}
                onChange={handleEmployeeChange}
              >
                <option value="">Select Employee</option>
                {allEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                name="leave_type"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.leave_type}
                onChange={handleInputChange}
                disabled={!formData.employee}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.leave_type}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                name="reason"
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Enter reason for leave"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (if any)</label>
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  name="attachment"
                  className="hidden"
                  id="file-upload"
                  onChange={handleInputChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <FileText size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      {formData.attachment ? formData.attachment.name : 'Upload supporting document'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
          <button 
  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
  onClick={() => setShowModal(false)}
>
  Cancel
</button>
<button 
  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
  onClick={handleSubmit}
  disabled={submitting}
>
  {submitting ? 'Submitting...' : 'Submit'}
</button>
</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`flex-1 transition-all flex flex-col overflow-hidden duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
     
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          title="Employee Leave Management" 
        />
        <main className="flex-1 overflow-y-auto p-4">
          {/* Tabs */}
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'leave' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('leave')}
            >
              Leave Requests
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'cancellation' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('cancellation')}
            >
              Cancellation Requests
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Leave History
            </button>
          </div>
          
          {/* Content based on active tab */}
          {activeTab === 'leave' && renderSimpleLeaveTab()}
          {activeTab === 'cancellation' && renderCancellationTab()}
          {activeTab === 'history' && renderHistoryTab()}
          
          {/* Modal */}
          {showModal && renderLeaveRequestModal()}
          
          {/* Employee Details Popup */}
          {showEmployeePopup && renderEmployeePopup()}
        </main>
      </div>
    </div>
  );
};

export default EmployeeLeaveRequestSystem;