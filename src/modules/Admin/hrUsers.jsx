import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X, Search, UserPlus, Users, Mail, Briefcase, Building, Globe } from "lucide-react";
import Sidebar from "../../components/admincomponents/Sidebar";
import Header from "../../components/admincomponents/Header";
import { 
  fetchAllHrUsers, 
  createHrUser,
  setSearchTerm, 
  togglePopup, 
  updateFormData, 
  resetFormData 
} from "../../redux/admredux/hrUsersSlice";

const HrUsers = () => {
  const dispatch = useDispatch();
  const { 
    users: hrUsers, 
    loading, 
    error, 
    isPopupOpen, 
    searchTerm,
    formData 
  } = useSelector((state) => state.hrUsers);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch HR Users on component mount
  useEffect(() => {
    dispatch(fetchAllHrUsers());
  }, [dispatch]);

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));
  };

  // Handle form submission
  // In your HrUsers.js component
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.name || !formData.email || !formData.role || !formData.department || !formData.community) {
    alert("❌ Please fill in all required fields.");
    return;
  }

  try {
    const result = await dispatch(createHrUser(formData)).unwrap();
    console.log("API Response:", result);
    dispatch(fetchAllHrUsers());
    alert(`✅ Success: ${result.message || "HR user added successfully!"}`);
    // The popup should close automatically as it's handled in the reducer
  } catch (error) {
    console.error("Error adding HR user:", error);
    alert(`❌ Error: ${error || "Failed to add HR user. Please try again."}`);
  }
};

  // Show error if API call fails
  // Remove or modify this effect as it's causing duplicate error messages
useEffect(() => {
  if (error) {
    console.error("❌ Error:", error);
    // Either remove this alert or add a condition to only show it for specific errors
    // alert(`❌ Error: ${error}`);
  }
}, [error]);

  // Get filtered users
  const filteredUsers = hrUsers.filter((employee) =>
    employee.employee__name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div className="flex-1 transition-all duration-300">
        <div className="p-6">
          <Header title="HR User Management" />
          
          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            {/* Header with search and count */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-gray-800">HR Personnel</h2>
                <p className="text-gray-500">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-100 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  placeholder="Search HR users..."
                  value={searchTerm}
                  onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                />
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Loading HR users...</p>
              </div>
            )}
            
            {/* Empty State */}
            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No HR Users Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? `No results found for "${searchTerm}"` : "There are no HR users in the system yet."}
                </p>
                <button 
                  onClick={() => {
                    if (searchTerm) dispatch(setSearchTerm(""));
                    dispatch(togglePopup());
                  }} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center mx-auto"
                >
                  <UserPlus size={18} className="mr-2" />
                  {searchTerm ? "Clear Search & Add User" : "Add First HR User"}
                </button>
              </div>
            )}
            
            {/* HR Users Grid */}
            {!loading && filteredUsers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((employee) => (
                  <div 
                    key={employee.id} 
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition flex items-center"
                  >
                    {employee.img ? (
                      <img
                        src={employee.img}
                        alt={employee.employee__name || "No Name"}
                        className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-blue-100"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-full mr-4 flex items-center justify-center">
                        <Users size={24} className="text-blue-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-800">{employee.employee__name || "Unnamed User"}</div>
                      <div className="text-gray-600 flex items-center">
                        <Briefcase size={14} className="mr-1" />
                        {employee.role || "No Role"}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {employee.department && `${employee.department}`}
                        {employee.department && employee.community && " · "}
                        {employee.community && `${employee.community}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <button 
          onClick={() => dispatch(togglePopup())} 
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
          aria-label="Add HR User"
        >
          <Plus size={24} />
        </button>

        {/* Add HR User Modal */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4 overflow-hidden">
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center">
                  <UserPlus size={20} className="mr-2" />
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

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name || ''} 
                        onChange={handleFormChange} 
                        className="w-full pl-10 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Enter full name"
                        required 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email || ''} 
                        onChange={handleFormChange} 
                        className="w-full pl-10 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="email@example.com"
                        required 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase size={16} className="text-gray-400" />
                      </div>
                      <select 
                        name="role" 
                        value={formData.role || ''} 
                        onChange={handleFormChange} 
                        className="w-full pl-10 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none" 
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="hr">HR </option>
                       
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="department" 
                        value={formData.department || ''} 
                        onChange={handleFormChange} 
                        className="w-full pl-10 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="e.g. Human Resources"
                        required 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Community</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="community" 
                        value={formData.community || ''} 
                        onChange={handleFormChange} 
                        className="w-full pl-10 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="e.g. muslim"
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Submit & Clear Buttons */}
                <div className="flex gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => dispatch(resetFormData())} 
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition flex-1"
                  >
                    Clear Form
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex-1 flex justify-center items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      "Save User"
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