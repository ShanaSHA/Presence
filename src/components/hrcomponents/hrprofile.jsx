import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from "./hrSidebar";
import { Camera, Upload, Trash2, Save, X } from 'lucide-react';

const HrProfilePage = () => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    firstName: 'Nidha',
    lastName: 'Zainab',
    email: 'nidhazainab@gmail.com',
    position: 'HR Manager',
    department: 'Human Resources',
    phone: '+1 (555) 123-4567',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Load profile image from localStorage
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("profileImage") || "/api/placeholder/200/200";
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("profileImage", profileImage);
  }, [profileImage]);

  useEffect(() => {
    if (showSaveNotification) {
      const timer = setTimeout(() => {
        setShowSaveNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSaveNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const deleteProfilePicture = () => {
    setProfileImage("/api/placeholder/200/200");
    localStorage.removeItem("profileImage");
  };

  const handleSaveChanges = () => {
    console.log("Saving profile changes:", userData);
    setShowSaveNotification(true);
    setIsEditing(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={true} profileImage={profileImage} setProfileImage={setProfileImage} />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with breadcrumb */}
          <div className="mb-8">
            <div className="text-sm text-gray-500 mb-2">Dashboard / Profile Settings</div>
            <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
          </div>

          {/* Save notification */}
          {showSaveNotification && (
            <div className="fixed top-6 right-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
              <span className="mr-2">✓</span>
              Profile updated successfully!
              <button 
                onClick={() => setShowSaveNotification(false)}
                className="ml-4 text-green-500 hover:text-green-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Profile header with background */}
            <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="relative group">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <div 
                    className="absolute inset-0  bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="absolute bottom-4 right-6">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Profile content */}
            <div className="pt-20 px-8 pb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-gray-500">{userData.position} • {userData.department}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Personal Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={userData.firstName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={userData.lastName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Professional Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={userData.position}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={userData.department}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={userData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile picture options */}
              {isEditing && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Profile Picture Options</h3>
                  <div className="flex gap-3">
                    <button 
                      onClick={triggerFileInput}
                      className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm flex items-center gap-2"
                    >
                      <Upload size={16} /> Upload new picture
                    </button>
                    <button 
                      onClick={deleteProfilePicture}
                      className="px-3 py-2 text-sm text-red-600 bg-white border border-gray-300 rounded-md hover:bg-red-50 shadow-sm flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Remove picture
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Supported formats: PNG, JPEG (max 15MB)</p>
                </div>
              )}

              {/* Security section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Security</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-700">Password</p>
                    <p className="text-gray-500 text-sm">Last changed 3 months ago</p>
                  </div>
                  <button 
                    onClick={() => navigate("/change-password")} 
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              {isEditing && (
                <div className="mt-8 flex justify-end gap-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button 
                    onClick={handleSaveChanges}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrProfilePage;