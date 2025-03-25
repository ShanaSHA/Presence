import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, FileText, Shield, RefreshCw } from 'lucide-react';
import Sidebar from "../../components/admincomponents/Sidebar";
import Holiday from "../../components/admincomponents/holiday";
import LeavePolicy from "../../components/admincomponents/leavepolicy";
import WorkSchedule from "../../components/admincomponents/workshedule";
import {
  fetchLeavePolicies,
  fetchWorkSchedules,
  fetchHolidays
} from '../../redux/admredux/policySlice';

// Tab component for better organization
const TabItem = ({ active, icon, label, onClick }) => {
  return (
    <button
      className={`
        px-5 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
        ${active 
          ? 'bg-white text-blue-600 shadow-sm' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        }
      `}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
};

// Section Header component
const SectionHeader = ({ title, description, icon, onRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-6 bg-white p-5 rounded-xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>
      <button 
        onClick={onRefresh}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
        title="Refresh Data"
      >
        <RefreshCw size={18} />
      </button>
    </div>
  );
};

const PolicyManagement = () => {
  const [activeTab, setActiveTab] = useState('work');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 
  const dispatch = useDispatch();
  const { leavePolicies, workSchedules, holidays, loading } = useSelector(state => state.policy);
 
  // Fetch data from API
  useEffect(() => {
    dispatch(fetchLeavePolicies());
    dispatch(fetchWorkSchedules());
    dispatch(fetchHolidays());
  }, [dispatch]);
 
  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
 
  const refreshLeavePolicies = () => {
    dispatch(fetchLeavePolicies());
  };
 
  const refreshWorkSchedules = () => {
    dispatch(fetchWorkSchedules());
  };
 
  const refreshHolidays = () => {
    dispatch(fetchHolidays());
  };

  // Content config for each tab
  const tabContent = {
    leave: {
      title: "Leave Policies",
      description: "Manage organization-wide leave policies and entitlements",
      icon: <FileText size={20} />,
      onRefresh: refreshLeavePolicies,
      component: <LeavePolicy leavePolicies={leavePolicies} refreshPolicies={refreshLeavePolicies} />
    },
    work: {
      title: "Work Schedules",
      description: "Configure working hours and attendance expectations",
      icon: <Clock size={20} />,
      onRefresh: refreshWorkSchedules,
      component: <WorkSchedule workSchedules={workSchedules} refreshSchedules={refreshWorkSchedules} />
    },
    holiday: {
      title: "Holidays",
      description: "Set up annual holidays and special leave days",
      icon: <Calendar size={20} />,
      onRefresh: refreshHolidays,
      component: <Holiday holidays={holidays} refreshHolidays={refreshHolidays} />
    }
  };

  // Loading state component
  const LoadingState = () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`flex-1 p-6 ${isSidebarOpen ? '' : ''} transition-all duration-300`}>
        <div className="max-w-6xl mx-auto">
          {/* Header with improved styling */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Policy Management</h1>
                <p className="text-gray-500">Manage company policies, schedules, and holidays</p>
              </div>
            </div>
          </div>
          
          {/* Tabs with enhanced styling */}
          <div className="mb-6">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 shadow-sm">
              <TabItem 
                active={activeTab === 'leave'} 
                icon={<FileText size={18} />}
                label="Leave Policy" 
                onClick={() => setActiveTab('leave')} 
              />
              <TabItem 
                active={activeTab === 'work'} 
                icon={<Clock size={18} />}
                label="Work Schedule" 
                onClick={() => setActiveTab('work')} 
              />
              <TabItem 
                active={activeTab === 'holiday'} 
                icon={<Calendar size={18} />}
                label="Holidays" 
                onClick={() => setActiveTab('holiday')} 
              />
            </div>
          </div>

          {/* Section Header */}
          <SectionHeader 
            title={tabContent[activeTab].title} 
            description={tabContent[activeTab].description}
            icon={tabContent[activeTab].icon}
            onRefresh={tabContent[activeTab].onRefresh}
          />
          
          {/* Content with card styling */}
          <div className="bg-white p-6 rounded-xl shadow-sm overflow-hidden">
            {loading ? <LoadingState /> : tabContent[activeTab].component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyManagement;