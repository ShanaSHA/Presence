import React, { useState, useEffect } from "react";
import Header from '../../components/hrcomponents/hrHeader';
import Sidebar from '../../components/hrcomponents/hrSidebar';
import { policyService } from '../../api/policy';

const Policymanagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [policies, setPolicies] = useState({
        leave_policies: [],
        public_holidays: [],
        working_hours: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const data = await policyService.getAllPolicies();
                setPolicies(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching policy data:", err);
                setError("Failed to load policy data. Please try again later.");
                setLoading(false);
            }
        };

        fetchPolicies();
    }, []);

    return (
        <div className="flex min-h-screen">
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            
            <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
                <Header title="Policy" />
                
                {/* Content */}
                <div className="p-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-lg text-gray-600">Loading policy data...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                            {/* Leave Policies Section */}
                            <section className="mb-8">
                                <h2 className="text-xl font-medium mb-4">Leave Policies</h2>
                                
                                {policies.leave_policies?.length === 0 ? (
                                    <p className="text-gray-500">No leave policies found.</p>
                                ) : (
                                    policies.leave_policies?.map((policy, index) => (
                                        <div 
                                            key={index} 
                                            className="rounded-lg bg-gray-200 p-4 mb-3 flex justify-between items-center"
                                        >
                                            <span className="text-black font-medium">{policy.leave_type}</span>
                                            <span className="text-black">
                                                Amount: {policy.amount} | Frequency: {policy.frequency}
                                                {policy.carry_forward ? " | Carry Forward: Yes" : ""}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </section>
                            
                            {/* Public Holidays Section */}
                            <section className="mb-8">
                                <h2 className="text-xl font-medium mb-4">Public Holidays</h2>
                                
                                {policies.public_holidays?.length === 0 ? (
                                    <p className="text-gray-500">No public holidays found.</p>
                                ) : (
                                    policies.public_holidays?.map((holiday, index) => (
                                        <div 
                                            key={index} 
                                            className="rounded-lg bg-gray-200 p-4 mb-3 flex justify-between items-center"
                                        >
                                            <span className="text-black font-medium">{holiday.name}</span>
                                            <span className="text-black">
                                                {formatDate(holiday.date)} | 
                                                Community: {holiday.community__community_name || holiday.leavetype || 'All'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </section>
                            
                            {/* Shifts Section */}
                            <section>
                                <h2 className="text-xl font-medium mb-4">Shifts</h2>
                                
                                {policies.working_hours?.length === 0 ? (
                                    <p className="text-gray-500">No shift information found.</p>
                                ) : (
                                    policies.working_hours?.map((shift, index) => (
                                        <div 
                                            key={index} 
                                            className="rounded-lg bg-gray-200 p-4 mb-3 flex justify-between items-center"
                                        >
                                            <span className="text-black font-medium">{shift.shift_type}</span>
                                            <span className="text-black">
                                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Utility function to format time
const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    
    // If timeString is already in HH:MM format, return it
    if (timeString.includes(':')) return timeString;
    
    try {
        // If it's in some other format, try to convert it
        const date = new Date(timeString);
        if (!isNaN(date)) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return timeString; // Return original if conversion fails
    } catch (e) {
        return timeString; // Return original on error
    }
};

// Utility function to format date
const formatDate = (dateString) => {
    if (!dateString) return "--/--/----";
    
    try {
        const date = new Date(dateString);
        if (!isNaN(date)) {
            return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        return dateString;
    } catch (e) {
        return dateString;
    }
};

export default Policymanagement;