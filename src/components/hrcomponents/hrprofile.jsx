import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from "./hrSidebar";
import { Camera, Upload, Trash2, Save, X } from 'lucide-react';
import Header from './hrHeader';
import ProfileService from '../../api/profile';
import PropTypes from 'prop-types';

const HrProfilePage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState({
    image: '',
    firstName: '',
    email: '',
    position: '',
    department: '',
    community: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [profileImage, setProfileImage] = useState("/api/placeholder/200/200");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await ProfileService.getProfile();
        setUserData({
          firstName: profileData.name,
          email: profileData.email,
          position: profileData.position,
          department: profileData.department,
          community: profileData.community_name
        });
        
        // Set profile image if available
        if (profileData.image) {
          setProfileImage(profileData.image);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Optionally show error notification
      }
    };

    fetchProfileData();
  }, []);

  // Notification timer effect
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 15 * 1024 * 1024; // 15MB

      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload JPEG, PNG, or GIF.');
        return;
      }

      if (file.size > maxSize) {
        alert('File is too large. Maximum size is 15MB.');
        return;
      }

      try {
        setIsImageUploading(true);
        const response = await ProfileService.updateProfileImage(file);
        
        if (response.profile_image) {
          setProfileImage(response.profile_image);
          setShowSaveNotification(true);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsImageUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const deleteProfilePicture = async () => {
    try {
      await ProfileService.deleteProfileImage();
      setProfileImage("/api/placeholder/200/200");
      setShowSaveNotification(true);
    } catch (error) {
      console.error('Failed to delete profile picture:', error);
      alert('Failed to remove profile picture. Please try again.');
    }
  };

  const handleSaveChanges = async () => {
    try {
      await ProfileService.updateProfile(userData);
      setShowSaveNotification(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <div className="flex-1 p-6">
        <div className="mx-auto">
          <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
            <Header title="Profile" />

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
              <div className="h-40 bg-gradient-to-r from-gray-500 to-gray-600 relative">
                <div className="absolute -bottom-16 left-8">
                  <div className="relative group">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <div 
                      className="absolute inset-0 bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={triggerFileInput}
                    >
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageUpload}
                    disabled={isImageUploading}
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
                    {userData.firstName}
                  </h2>
                  <p className="text-gray-500">{userData.position} • {userData.department}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Personal Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={userData.firstName}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-white' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                          className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-white' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div>
                        <label htmlFor="community" className="block text-sm font-medium text-gray-600 mb-1">Community</label>
                        <input
                          type="text"
                          id="community"
                          name="community"
                          value={userData.community}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-white' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                          className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-white' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                          className={`w-full px-3 py-2 border ${isEditing ? 'border-blue-300 bg-white' : 'border-gray-200 bg-gray-50'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                        disabled={isImageUploading}
                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isImageUploading ? 'Uploading...' : <>
                          <Upload size={16} /> Upload new picture
                        </>}
                      </button>
                      <button 
                        onClick={deleteProfilePicture}
                        disabled={isImageUploading}
                        className="px-3 py-2 text-sm text-red-600 bg-white border border-gray-300 rounded-md hover:bg-red-50 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} /> Remove picture
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Supported formats: PNG, JPEG, GIF (max 15MB)</p>
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
                      disabled={isImageUploading}
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default HrProfilePage;