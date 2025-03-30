import { useState, useEffect } from "react";
import Sidebar from "../../components/hrcomponents/hrSidebar";
import Header from "../../components/hrcomponents/hrHeader";
import { Search, UserPlus, X, Upload, User, ChevronDown, Briefcase, Users, Mail, Calendar } from "lucide-react";
import * as apiService from "../../api/hrapi/empapi"; // Import the API service

function EmployeeList() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [formData, setFormData] = useState({
    profilePic: "",
    emp_num: "",
    name: "",
    email: "",
    department: "",
    designation: "",
    community: "",
    hire_date: ""
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample departments for filter
  const departments = ["All", "Engineering", "Marketing", "HR", "Finance", "Operations"];

  // Fetch employees from API with error handling
  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true);
      try {
        const data = await apiService.getEmployees();
        setEmployees(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setError("Failed to load employees. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  // Fetch communities from API
  useEffect(() => {
    async function fetchCommunities() {
      try {
        const data = await apiService.getCommunities();
        setCommunities(data);
      } catch (error) {
        console.error('Error fetching communities:', error);
        // Consider setting an error state for communities if needed
      }
    }
    fetchCommunities();
  }, []);

  // Fetch designations from API
  useEffect(() => {
    async function fetchDesignations() {
      try {
        const data = await apiService.getDesignations();
        setDesignations(data);
      } catch (error) {
        console.error('Error fetching designations:', error);
        // Consider setting an error state for designations if needed
      }
    }
    fetchDesignations();
  }, []);

  const filteredEmployees = employees?.filter(
    (emp) =>
      (emp.name?.toLowerCase() || "").includes(searchTerm?.toLowerCase() || "") &&
      (selectedDepartment === "All" || emp.department === selectedDepartment)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.email || !formData.department || !formData.name || !formData.emp_num || !formData.hire_date) {
      alert("Please fill all required fields");
      return;
    }
    
    const newEmployee = {
      img: formData.profilePic,
      emp_num: formData.emp_num,
      name: formData.name,
      department: formData.department,
      designation: formData.designation,
      email: formData.email,
      hire_date: formData.hire_date,
      community: formData.community,
    };

    try {
      const addedEmployee = await apiService.addEmployee(newEmployee);
      if (addedEmployee) {
        setEmployees([...employees, addedEmployee]); // Update the state
        setIsModalOpen(false);
        setFormData({
          profilePic: "",
          emp_num: "",
          name: "",
          department: "",
          designation: "",
          email: "",
          hire_date: "",
          community: "",
        });
      } else {
        alert("Failed to add employee. Please try again.");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("An error occurred while adding employee: " + (error.message || "Unknown error"));
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 bg-gray-800 text-white h-full shadow-xl z-20 fixed`}
      >
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <Header title="Employees" />

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Employees</p>
                  <h3 className="text-3xl font-bold mt-1">{employees.length}</h3>
                </div>
                <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                  <Users size={24} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Departments</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {new Set(employees.map((e) => e.department)).size}
                  </h3>
                </div>
                <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                  <Briefcase size={24} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">New This Month</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {employees.filter(emp => {
                      // Calculate employees joined in the current month
                      const hireDate = new Date(emp.hire_date);
                      const currentDate = new Date();
                      return hireDate.getMonth() === currentDate.getMonth() && 
                             hireDate.getFullYear() === currentDate.getFullYear();
                    }).length || 0}
                  </h3>
                </div>
                <div className="bg-emerald-400 bg-opacity-30 p-3 rounded-lg">
                  <UserPlus size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-md mt-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  className="bg-gray-100 w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search employees by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-48">
                <div
                  className="bg-gray-100 pl-4 pr-10 py-3 rounded-lg cursor-pointer flex items-center justify-between"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span>{selectedDepartment} Departments</span>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                {showDropdown && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {departments.map((dept) => (
                      <div
                        key={dept}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setShowDropdown(false);
                        }}
                      >
                        {dept}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employee List (Table Structure) */}
          <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-gray-500">Loading employees...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No employees found. Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joining Date
                      </th>
                     
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employee.emp_num || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {employee.img ? (
                                <img
                                  src={employee.img}
                                  alt={employee.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User size={18} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.name || "Unknown"}</div>
                              <div className="text-sm text-gray-500">{employee.community || "No Community"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {employee.department || "No Department"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.designation || "No Designation"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.email || "No Email"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.hire_date || "Not Available"}
                        </td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Employee Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow z-10"
          >
            <UserPlus size={24} />
          </button>

          {/* Modal Overlay */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center p-4 z-50">
              {/* Modal Content */}
              <div className="bg-white rounded-xl w-full max-w-md relative animate-fadeIn overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <h3 className="text-xl font-bold">Add New Employee</h3>
                  
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-white hover:text-gray-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  {/* Profile Picture Upload */}
                  <div className="flex flex-col items-center mb-6">
                    <label htmlFor="profilePic" className="cursor-pointer relative">
                      
                    </label>
                    <input
                      type="file"
                      id="profilePic"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Form Fields with Icons */}
                  <div className="space-y-3">
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="w-full p-1 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        name="emp_num"
                        value={formData.emp_num}
                        onChange={handleChange}
                        placeholder="Employee ID"
                        className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Designation dropdown from API */}
                    <div className="relative">
                      <Briefcase
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <select
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        required
                      >
                        <option value="" >Select Designation</option>
                        {designations.map(designation => (
                          <option key={designation.id} value={designation.id}>
                            {designation.desig_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <Users
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        required
                      >
                        <option value="" disabled>Select Department</option>
                        {departments.filter(dept => dept !== "All").map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    
                    {/* Community dropdown from API */}
                    <div className="relative">
                      <Users
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <select
                        name="community"
                        value={formData.community}
                        onChange={handleChange}
                        className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        required
                      >
                        <option value="" disabled>Select Community</option>
                        {communities?.map(community => (
                          <option key={community.id} value={String(community.id
                          )}>
                            {community.community_name
                            }
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    
                    {/* Joining Date Field */}
                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="date"
                        name="hire_date"
                        value={formData.hire_date}
                        onChange={handleChange}
                        placeholder="Hire Date"
                        className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add Employee
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeList;