import React, { useState } from "react";
import Sidebar from "../../components/hrcomponents/hrSidebar";
import Header from "../../components/hrcomponents/hrHeader";
import { Search, Clock, Calendar, X, User, Briefcase, Clock3, File, Plus, History, ClipboardList, ArrowLeft } from "lucide-react";

const OvertimeDashboard = () => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("Department");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const employees = [
    { 
      name: "Nidha", 
      role: "Flutter Developer", 
      hours: "48 Hours", 
      dept: "Flutter",
      avatar: "N",
      color: "bg-blue-100 text-blue-600",
      overtime: [{ date: "20 Aug", hours: "10 hrs" }, { date: "11 Aug", hours: "5 hrs" }]
    },
    { 
      name: "Jadeera", 
      role: "React Developer", 
      hours: "24 Hours", 
      dept: "React",
      avatar: "J",
      color: "bg-purple-100 text-purple-600",
      overtime: [{ date: "15 Aug", hours: "6 hrs" }, { date: "10 Aug", hours: "4 hrs" }]
    }
  ];

  const filteredEmployees = employees
    .filter(emp => selectedDepartment === "Department" || emp.dept === selectedDepartment)
    .filter(emp => 
      searchTerm.trim() === "" || 
      emp.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) || 
      emp.role.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

  const departments = ["Department", "Flutter", "React", "Python"];

  // If showing history page, render that instead of the dashboard
  if (showHistoryPage && selectedEmployee) {
    return <EmployeeHistoryPage 
      employee={selectedEmployee} 
      onBack={() => {
        setShowHistoryPage(false);
        setSelectedEmployee(null);
      }} 
    />;
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
                  <p className="text-2xl font-bold">72 Hours</p>
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
                  <p className="text-2xl font-bold">{employees.length}</p>
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
                  <p className="text-2xl font-bold">21 Hours</p>
                </div>
                <div className="p-3 rounded-full bg-amber-100">
                  <Calendar className="text-amber-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Department Dropdown */}
              <div className="w-full md:w-48">
                <select
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Employee List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-24">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium">Employee Overtime</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee, index) => (
                  <EmployeeRow 
                    key={index}
                    employee={employee}
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowHistoryPage(true);
                    }}
                  />
                ))
              ) : (
                <div className="py-6 text-center text-gray-500">No employees found</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fixed bottom-6 right-6 flex gap-4">
            <button className="bg-gray-800 text-white px-4 py-3 rounded-full hover:bg-gray-700 transition shadow-lg flex items-center">
              <File size={18} className="mr-2" />
              REPORT
            </button>
            <button 
              className="bg-indigo-600 text-white px-4 py-3 rounded-full hover:bg-indigo-700 transition shadow-lg flex items-center" 
              onClick={() => setShowAssignModal(true)}
            >
              <Plus size={18} className="mr-2" />
              ASSIGN
            </button>
          </div>

          {/* Assign Modal */}
          {showAssignModal && <AssignModal onClose={() => setShowAssignModal(false)} employees={filteredEmployees} />}
        </div>
      </div>
    </div>
  );
};

// Employee Row Component
const EmployeeRow = ({ employee, onClick }) => {
  return (
    <div 
      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition cursor-pointer" 
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`w-10 h-10 ${employee.color} rounded-full flex items-center justify-center font-medium`}>
          {employee.avatar}
        </div>
        <div className="ml-4">
          <div className="font-medium">{employee.name}</div>
          <div className="text-sm text-gray-600 flex items-center">
            <Briefcase size={14} className="mr-1" /> {employee.role}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <Clock3 size={16} className="mr-2 text-indigo-500" />
        <span className="font-medium">{employee.hours}</span>
      </div>
    </div>
  );
};

// Assign Modal Component
const AssignModal = ({ onClose, employees }) => {
  const [hours, setHours] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Assign Overtime</h3>
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Employee Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
            <select className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              {employees.map((emp, index) => (
                <option key={index} value={emp.name}>{emp.name} - {emp.role}</option>
              ))}
            </select>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            />
          </div>
          
          {/* Hours Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
            <input 
              type="number" 
              min="0"
              step="0.5"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              placeholder="Enter overtime hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>

          {/* Assign Button */}
          <button 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-full mt-2 hover:bg-indigo-700 transition font-medium" 
            onClick={onClose}
          >
            ASSIGN OVERTIME
          </button>
        </div>
      </div>
    </div>
  );
};

// Employee History Page Component
const EmployeeHistoryPage = ({ employee, onBack }) => {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [hours, setHours] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back Button and Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Employee Overtime</h1>
      </div>

      {/* Employee Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className={`w-14 h-14 ${employee.color} rounded-full flex items-center justify-center text-xl font-medium`}>
            {employee.avatar}
          </div>
          <div className="ml-4">
            <div className="text-xl font-bold">{employee.name}</div>
            <div className="text-gray-600 flex items-center">
              <Briefcase size={16} className="mr-1" />
              {employee.role}
            </div>
          </div>
        </div>
        
        {/* Info Summary */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-sm">Department</span>
              <p className="font-medium">{employee.dept}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Total Overtime</span>
              <p className="font-medium">{employee.hours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-medium flex items-center">
            <History size={18} className="mr-2 text-indigo-600" />
            Overtime History
          </h3>
          <button 
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Assign New
          </button>
        </div>
        
        {/* History List */}
        <div className="divide-y divide-gray-200">
          {employee.overtime.map((item, index) => (
            <div key={index} className="flex justify-between p-4">
              <span className="flex items-center">
                <Calendar size={16} className="mr-2 text-gray-500" />
                {item.date}
              </span>
              <span className="font-medium">{item.hours}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Form */}
      {showAssignForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium flex items-center">
              <ClipboardList size={18} className="mr-2 text-indigo-600" />
              Assign New Overtime
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            {/* Hours Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input 
                type="number" 
                min="0"
                step="0.5"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                placeholder="Enter overtime hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                rows="2"
                placeholder="Enter reason for overtime"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
            </div>

            {/* Assign Button */}
            <button 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-full hover:bg-indigo-700 transition font-medium" 
            >
              ASSIGN OVERTIME
            </button>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="fixed bottom-6 right-6">
        <button 
          onClick={() => setShowAssignForm(!showAssignForm)}
          className="bg-indigo-600 text-white px-4 py-3 rounded-full hover:bg-indigo-700 transition shadow-lg flex items-center"
        >
          {showAssignForm ? (
            <>
              <X size={18} className="mr-2" />
              CANCEL
            </>
          ) : (
            <>
              <Plus size={18} className="mr-2" />
              ASSIGN
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OvertimeDashboard;