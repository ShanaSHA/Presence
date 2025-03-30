import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import Sidebar from "../../components/hrcomponents/hrSidebar";
import Header from "../../components/hrcomponents/hrHeader";
import { 
  Search, Clock, Calendar, X, User, Briefcase, 
  Clock3, Plus, History, ArrowLeft, Download 
} from "lucide-react";
import { 
  getOvertimeDashboard,
  assignOvertime,
  getEmployeesList,
  getEmployeeOvertime,
  generateOvertimeReport,
} from '../../api/hrapi/OverTime';
import { useParams } from "react-router-dom";

// Employee Row Component
const EmployeeRow = ({ employee, onClick }) => {
  return (
    <div 
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <User className="text-indigo-600" size={18} />
        </div>
        <div>
          <h4 className="font-medium">{employee.name}</h4>
          <p className="text-sm text-gray-500">{employee.role}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{employee.totalOvertime}</p>
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs text-gray-500">{employee.dept}</span>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
            {employee.date}
          </span>
        </div>
      </div>
    </div>
  );
};

EmployeeRow.propTypes = {
  employee: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    dept: PropTypes.string.isRequired,
    totalOvertime: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    employee_id: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

// Assign Modal Component
const AssignModal = ({ onClose, onSubmit, newOvertime, setNewOvertime, employees, error, loadingEmployees, employeesError }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-lg">Assign Overtime</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={newOvertime.employee_id}
                onChange={(e) => setNewOvertime({...newOvertime, employee_id: e.target.value})}
                disabled={loadingEmployees}
              >
                <option value="">Select Employee</option>
                {employeesError ? (
                  <option value="" disabled>{employeesError}</option>
                ) : loadingEmployees ? (
                  <option value="" disabled>Loading employees...</option>
                ) : employees.length === 0 ? (
                  <option value="" disabled>No employees available</option>
                ) : (
                  employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={newOvertime.date}
                onChange={(e) => setNewOvertime({...newOvertime, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input
                type="number"
                min="1"
                step="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. 1"
                value={newOvertime.hours}
                onChange={(e) => setNewOvertime({...newOvertime, hours: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                placeholder="Enter reason for overtime..."
                value={newOvertime.reason}
                onChange={(e) => setNewOvertime({...newOvertime, reason: e.target.value})}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Assign Overtime
          </button>
        </div>
      </div>
    </div>
  );
};

AssignModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  newOvertime: PropTypes.shape({
    date: PropTypes.string,
    hours: PropTypes.string,
    reason: PropTypes.string,
    employee_id: PropTypes.string,
  }).isRequired,
  setNewOvertime: PropTypes.func.isRequired,
  employees: PropTypes.array.isRequired,
  error: PropTypes.string,
  loadingEmployees: PropTypes.bool.isRequired,
  employeesError: PropTypes.string,
};

// Report Modal Component
const ReportModal = ({ onClose, onSubmit, filters, setFilters, departments, loading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-lg">Generate Overtime Report</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
              >
                <option value="All">All Departments</option>
                {departments.filter(d => d !== "Department").map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

ReportModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    department: PropTypes.string,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  departments: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

// Employee History Page Component
const EmployeeHistoryPage = ({ employee, onBack, onAssignOvertime, loading }) => {
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-red-500">No employee data available</p>
          <button 
            onClick={onBack}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Employee Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="text-indigo-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{employee.name || "N/A"}</h2>
              <div className="flex items-center gap-3 text-gray-600">
                <span>{employee.role || "N/A"}</span>
                <span>•</span>
                <span>{employee.dept || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Overtime Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-500 text-sm">Total Overtime</p>
              <p className="text-2xl font-bold">{employee.totalOvertime || "0 Hours"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-500 text-sm">Overtime Records</p>
              <p className="text-2xl font-bold">{employee.overtimeHistory?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Overtime History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium">Overtime History</h3>
          </div>

          {employee.overtimeHistory?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {employee.overtimeHistory.map((ot, index) => (
                <div key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{ot.date}</p>
                      <p className="text-sm text-gray-500">{ot.reason || "No reason provided"}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                      <Clock3 size={14} />
                      <span className="text-sm font-medium">{ot.hours} hours</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500">
              No overtime records found for this employee
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

EmployeeHistoryPage.propTypes = {
  employee: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string,
    dept: PropTypes.string,
    employee_id: PropTypes.string,
    totalOvertime: PropTypes.string,
    overtimeHistory: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string,
        hours: PropTypes.number,
        reason: PropTypes.string,
      })
    ),
  }),
  onBack: PropTypes.func.isRequired,
  onAssignOvertime: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

// Main Overtime Dashboard Component
const OvertimeDashboard = () => {
  // State management
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("Department");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newOvertime, setNewOvertime] = useState({
    date: "",
    hours: "",
    reason: "",
    employee_id: ""
  });

  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    department: 'All'
  });
  const [reportLoading, setReportLoading] = useState(false);

  // Data state
  const [dashboardData, setDashboardData] = useState({
    totalOvertime: '0 Hours',
    employeesOnOT: 0,
    thisMonthOvertime: '0 Hours',
    employees: [],
    departments: []
  });
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState(null);
  const [employeesError, setEmployeesError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getOvertimeDashboard();
        
        setDashboardData({
          totalOvertime: `${data.total_overtime || 0} Hours`,
          employeesOnOT: data.employees_on_ot_today || 0,
          thisMonthOvertime: `${data.total_ot_this_month || 0} Hours`,
          employees: data.employees_overtime ? data.employees_overtime.map(emp => ({
            name: emp.name,
            role: `Designation ${emp.designation}`,
            dept: emp.department || 'Department',
            totalOvertime: `${emp.total_overtime} Hours`,
            employee_id: emp.employee_id ||0,
            date: emp.date || new Date().toISOString().split('T')[0]
          })) : [],
          departments: data.departments || ['Department']
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch overtime dashboard');
        setLoading(false);
        console.error(err);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch employees list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setEmployeesError(null);
        const data = await getEmployeesList();
        setEmployeesList(data);
      } catch (err) {
        setEmployeesError('Failed to load employees list');
        console.error('Failed to fetch employees list', err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  // Departments dropdown
  const departments = ["Department", ...(dashboardData.departments || [])];

  // Filter employees
  const filteredEmployees = (dashboardData.employees || [])
    .filter(emp => selectedDepartment === "Department" || emp.dept === selectedDepartment)
    .filter(emp => 
      searchTerm.trim() === "" || 
      (emp.name && emp.name.toLowerCase().includes(searchTerm.trim().toLowerCase())) || 
      (emp.role && emp.role.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    );

  // Fetch employee history
  const handleEmployeeHistoryFetch = async (employee) => {
    try {
      setLoading(true);
      console.log("employeeeeeeeee",employee.employee_id);
      
      const employeeOvertimeData = await getEmployeeOvertime(employee.employee_id);
      console.log("getuserrrr",employeeOvertimeData);
      
      setSelectedEmployee({
        ...employee,
        overtimeHistory: employeeOvertimeData.overtime_history.map(item => ({
          date: item.date,
          hours: item.hours,
          // Add any other fields from the API response if needed
        })),
        totalOvertime: `${employeeOvertimeData.total_overtime || 0} Hours`
      });
      setShowHistoryPage(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch employee overtime history');
      setLoading(false);
      console.error(err);
    }
  };


  // console.log(selectedEmployee);
  

  // Assign overtime
  const handleOvertimeAssignment = async () => {
    try {
      if (!newOvertime.date || !newOvertime.hours || !newOvertime.reason || !newOvertime.employee_id) {
        setError('Please fill all fields');
        return;
      }

      await assignOvertime({
        employee_id: newOvertime.employee_id,
        date: newOvertime.date,
        hours: parseFloat(newOvertime.hours),
        reason: newOvertime.reason
      });

      // Refresh data
      const data = await getOvertimeDashboard();
      setDashboardData({
        totalOvertime: `${data.total_overtime || 0} Hours`,
        employeesOnOT: data.employees_on_ot_today || 0,
        thisMonthOvertime: `${data.total_ot_this_month || 0} Hours`,
        employees: data.employees_overtime ? data.employees_overtime.map(emp => ({
          name: emp.name,
          role: `Designation ${emp.designation}`,
          dept: emp.department || 'Department',
          totalOvertime: `${emp.total_overtime} Hours`,
          employee_id: emp.id || Math.random().toString(),
          date: emp.date || new Date().toISOString().split('T')[0]
        })) : [],
        departments: data.departments || ['Department']
      });
      
      if (selectedEmployee) {
        const employeeOvertimeData = await getEmployeeOvertime(selectedEmployee.employee_id);
        setSelectedEmployee(prev => ({
          ...prev,
          overtimeHistory: employeeOvertimeData.history || [],
          totalOvertime: `${employeeOvertimeData.total_overtime || 0} Hours`
        }));
      }

      setShowAssignModal(false);
      setNewOvertime({
        date: "",
        hours: "",
        reason: "",
        employee_id: ""
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to assign overtime');
      console.error(err);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      const response = await generateOvertimeReport(reportFilters);
      
      // Create a download link for the Excel file
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'overtime_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setShowReportModal(false);
    } catch (err) {
      setError('Failed to generate report');
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  // Loading state
  if (loading && !showHistoryPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading Overtime Dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !showHistoryPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // History page
  if (showHistoryPage) {
    return (
      <EmployeeHistoryPage 
        employee={selectedEmployee} 
        onBack={() => {
          setShowHistoryPage(false);
          setSelectedEmployee(null);
        }}
        onAssignOvertime={() => {
          setNewOvertime(prev => ({
            ...prev,
            employee_id: selectedEmployee.employee_id
          }));
          setShowAssignModal(true);
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <div className="p-6">
          {/* Header */}
          <Header title="Overtime Management" />

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Overtime</p>
                  <p className="text-2xl font-bold">{dashboardData.totalOvertime}</p>
                </div>
                <div className="p-3 rounded-full bg-indigo-100">
                  <Clock className="text-indigo-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Employees on OT</p>
                  <p className="text-2xl font-bold">{dashboardData.employeesOnOT}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <User className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">This Month</p>
                  <p className="text-2xl font-bold">{dashboardData.thisMonthOvertime}</p>
                </div>
                <div className="p-3 rounded-full bg-amber-100">
                  <Calendar className="text-amber-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <button
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={() => setShowAssignModal(true)}
                >
                  <Plus size={18} />
                  <span>Assign OT</span>
                </button>
                <button
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() => setShowReportModal(true)}
                >
                  <Download size={18} />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Employee List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-24">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-medium">Employee overtime</h3>
              <span className="text-sm text-gray-500">
                Showing {filteredEmployees.length} of {dashboardData.employees.length} employees
              </span>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <EmployeeRow 
                    key={employee.employee_id}
                    employee={employee}
                    onClick={() => handleEmployeeHistoryFetch(employee)}
                  />
                ))
              ) : (
                <div className="py-6 text-center text-gray-500">No employees found</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Overtime Modal */}
      {showAssignModal && (
        <AssignModal
          onClose={() => {
            setShowAssignModal(false);
            setNewOvertime({
              date: "",
              hours: "",
              reason: "",
              employee_id: ""
            });
            setError(null);
          }}
          onSubmit={handleOvertimeAssignment}
          newOvertime={newOvertime}
          setNewOvertime={setNewOvertime}
          employees={employeesList}
          error={error}
          loadingEmployees={loadingEmployees}
          employeesError={employeesError}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleGenerateReport}
          filters={reportFilters}
          setFilters={setReportFilters}
          departments={departments}
          loading={reportLoading}
        />
      )}
    </div>
  );
};

export default OvertimeDashboard;