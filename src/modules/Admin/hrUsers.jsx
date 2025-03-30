import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X, Search, UserPlus, Users, Mail, Briefcase, Building, Calendar, ChevronDown } from "lucide-react";
import Sidebar from "../../components/admincomponents/Sidebar";
import Header from "../../components/admincomponents/Header";
import { 
  fetchAllHrUsers, 
  createHrUser,
  setSearchTerm, 
  togglePopup, 
  updateFormData, 
  resetFormData,
  fetchDesignations,
  fetchCommunities
} from "../../redux/admredux/hrUsersSlice";

const HrUsers = () => {
  const dispatch = useDispatch();
  const { 
    users: hrUsers, 
    loading, 
    error, 
    isPopupOpen, 
    searchTerm,
    formData,
    designations,
    communities
  } = useSelector((state) => state.hrUsers);
  console.log("redux data", hrUsers);
  console.log(searchTerm);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    dispatch(fetchAllHrUsers());
    console.log("Dispatched fetchAllHrUsers");
    dispatch(fetchDesignations());
    dispatch(fetchCommunities());
  }, [dispatch]);

  console.log("HR Users:", hrUsers);
console.log("Loading:", loading);
console.log("Error:", error);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      name: formData.name,
      email: formData.email,
      emp_num: formData.emp_num,
      role: formData.role.toLowerCase(),
      department: formData.department,
      community_id: Number(formData.community),
      designation_id: Number(formData.designation),
      hire_date: new Date(formData.hire_date).toISOString().split('T')[0],
    };

    try {
      const result = await dispatch(createHrUser(userData)).unwrap();
      dispatch(fetchAllHrUsers());
      dispatch(togglePopup());
      dispatch(resetFormData());
      alert(`✅ Success: ${result.message || "HR user added successfully!"}`);
    } catch (error) {
      console.error("Error adding HR user:", error);
      alert(`❌ Error: ${error || "Failed to add HR user. Please try again."}`);
    }
  };

  const filteredUsers = hrUsers.filter((employee) =>
    employee.employee__name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.emp_num?.includes(searchTerm)
  );

  return (
    <div className="flex  bg-gray-50">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-4' : 'ml-0'}`}>
        <div className="p-6">
          <Header title="HR User Management" />
          
          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            {/* Header with search and count */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">HR Personnel</h2>
                <p className="text-gray-500 mt-1">
                  {filteredUsers.length} {filteredUsers.length >= 1 ? 'user' : 'users'} found
                </p>
              </div>
              
              <div className="flex gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="bg-gray-50 w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Search HR users..."
                    value={searchTerm}
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                  />
                </div>
                
                <button 
                  onClick={() => dispatch(togglePopup())}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
                >
                  <UserPlus size={18} />
                  Add User
                </button>
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading HR users...</p>
              </div>
            )}
            
            {/* Empty State */}
            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No HR Users Found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm ? `No results found for "${searchTerm}"` : "There are no HR users in the system yet."}
                </p>
                <button 
                  onClick={() => {
                    if (searchTerm) dispatch(setSearchTerm(""));
                    dispatch(togglePopup());
                  }} 
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                >
                  <UserPlus size={18} />
                  {searchTerm ? "Clear Search & Add User" : "Add First HR User"}
                </button>
              </div>
            )}
            
            {/* HR Users Grid */}
            {!loading && filteredUsers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredUsers.map((employee) => (
                  <div 
                    key={employee.id} 
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 flex items-start gap-4"
                  >
                    {employee.img ? (
                      <img
                        src={employee.img}
                        alt={employee.employee__name || "No Name"}
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users size={24} className="text-blue-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{employee.employee__name || "Unnamed User"}</h3>
                      <div className="text-gray-600 flex items-center mt-1">
                        <Briefcase size={14} className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">{employee.role || "No Role"}</span>
                      </div>
                      <div className="text-gray-500 text-sm mt-2 space-y-1">
                        {employee.department && (
                          <div className="flex items-start">
                            <Building size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{employee.department}</span>
                          </div>
                        )}
                        {employee.community && (
                          <div className="flex items-start">
                            <Users size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{employee.community}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add HR User Modal */}
        {isPopupOpen && (
          <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md animate-fade-in">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5 rounded-t-xl flex justify-between items-center">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <UserPlus size={20} />
                  Add HR User
                </h3>
                <button 
                  onClick={() => dispatch(togglePopup())} 
                  className="text-white hover:bg-blue-700 rounded-full p-1 transition"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="emp_num"
                      value={formData.emp_num || ''}
                      onChange={handleFormChange}
                      placeholder="Employee ID"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleFormChange}
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleFormChange}
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      name="role"
                      value={formData.role || ''}
                      onChange={handleFormChange}
                      className="w-full pl-10 pr-8 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  
                  <div className="relative">
                    <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ''}
                      onChange={handleFormChange}
                      placeholder="Department"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="hire_date"
                      value={formData.hire_date || ''}
                      onChange={handleFormChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      name="designation"
                      value={formData.designation || ''}
                      onChange={handleFormChange}
                      className="w-full pl-10 pr-8 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      required
                    >
                      <option value="">Select Designation</option>
                      {designations?.map(designation => (
                        <option key={designation.id} value={designation.id}>
                          {designation.desig_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  
                  <div className="relative">
                    <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      name="community"
                      value={formData.community || ''}
                      onChange={handleFormChange}
                      className="w-full pl-10 pr-8 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      required
                    >
                      <option value="">Select Community</option>
                      {communities?.map(community => (
                        <option key={community.id} value={community.id}>
                          {community.community_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                   
                {/* Submit & Clear Buttons */}
                <div className="flex gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => dispatch(resetFormData())} 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-4 rounded-lg border border-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Clear Form
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Save User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HrUsers;