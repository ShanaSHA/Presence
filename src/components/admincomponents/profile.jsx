import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from "../admincomponents/Sidebar";
import { Camera, User, Mail, Shield, Save, X } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    firstName: 'Farha',
    lastName: 'Cheroor',
    email: 'farhacheroor1@gmail.com',
  });

  // Load profile image from localStorage
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("profileImage") || "/api/placeholder/200/200";
  });

  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("profileImage", profileImage);
  }, [profileImage]);

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
    
    // Create a temporary element for the notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md transform transition-transform duration-500 ease-in-out';
    notification.innerHTML = '<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Profile changes saved successfully!</div>';
    
    document.body.appendChild(notification);
    
    // Remove the notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={true} profileImage={profileImage} setProfileImage={setProfileImage} />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h1>
            <p className="text-gray-500">Manage your account information and preferences</p>
          </div>

          {/* Main content area with subtle shadow and rounded corners */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
            
            {/* Profile Picture with better styling */}
            <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center">
                <div 
                  className="relative cursor-pointer"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onClick={triggerFileInput}
                >
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md"
                  />
                  {isHovering && (
                    <div className="absolute inset-0  bg-opacity-50 rounded-full flex items-center justify-center">
                      <Camera size={18} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <div className="text-lg font-medium text-gray-800 flex items-center">
                    <User size={18} className="mr-2 text-gray-500" />
                    Profile picture
                  </div>
                  <div className="text-sm text-gray-500 mb-4">PNG or JPEG format, maximum size 15MB</div>
                  <div className="flex gap-3">
                    <button 
                      onClick={triggerFileInput}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-sm flex items-center"
                    >
                      <Camera size={16} className="mr-2" />
                      Upload new picture
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <button 
                      onClick={deleteProfilePicture}
                      className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300 shadow-sm flex items-center"
                    >
                      <X size={16} className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Name Section with icon */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User size={18} className="mr-2 text-gray-500" />
                Full name
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 mb-2">First name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-600 mb-2">Last name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
            </div>

            {/* Email Section with icon */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Mail size={18} className="mr-2 text-gray-500" />
                Contact email
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">Email address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Security Section with divider and icon */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Shield size={18} className="mr-2 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-800">Security</h2>
                <div className="flex-grow ml-4 border-t border-gray-200"></div>
              </div>
              
              <button 
                onClick={() => navigate("/change-password")} 
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-300 font-medium flex items-center"
              >
                <Shield size={16} className="mr-2" />
                Change Password
              </button>
            </div>

            {/* Action Buttons with better styling */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <button className="px-5 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-medium">
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges}
                className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-sm font-medium flex items-center"
              >
                <Save size={16} className="mr-2" />
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;