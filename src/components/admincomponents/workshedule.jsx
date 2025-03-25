import React, { useState, useEffect } from 'react';
import { fetchWorkShifts, createWorkShift, updateWorkShift, deleteWorkShift } from '../../api/adminapi/workapi';
import { Clock, Plus, Edit2, Trash2, X } from 'lucide-react';

const WorkSchedule = () => {
  const [workShifts, setWorkShifts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shiftFormData, setShiftFormData] = useState({
    shift_type: '',
    start_time: '',
    end_time: '',
    status: "active",
  });

  useEffect(() => {
    setIsLoading(true);
    fetchWorkShifts()
      .then((data) => {
        setWorkShifts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, []);

  const handleShiftInputChange = (field, value) => {
    setShiftFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const clearShiftForm = () => {
    setShiftFormData({ shift_type: '', start_time: '', end_time: '', status: "active" });
  };

  const handleAddShift = async (e) => {
    e.preventDefault();
    try {
      const newShift = await createWorkShift(shiftFormData);
      setWorkShifts([...workShifts, newShift]);
      clearShiftForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    try {
      const updatedShift = await updateWorkShift(shiftFormData);
      setWorkShifts(workShifts.map(shift => (shift.id === updatedShift.id ? updatedShift : shift)));
      clearShiftForm();
      setShowUpdateModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteShift = async (id) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await deleteWorkShift(id);
        setWorkShifts(workShifts.filter(shift => shift.id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(hours);
      time.setMinutes(minutes);
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  const Modal = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6 shadow-xl animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const ShiftForm = ({ onSubmit, buttonText, buttonColor }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="shiftType" className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
        <input
          type="text"
          placeholder="Morning Shift, Night Shift, etc."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={shiftFormData.shift_type}
          onChange={(e) => handleShiftInputChange('shift_type', e.target.value)}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={shiftFormData.start_time}
            onChange={(e) => handleShiftInputChange('start_time', e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={shiftFormData.end_time}
            onChange={(e) => handleShiftInputChange('end_time', e.target.value)}
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          value={shiftFormData.status}
          onChange={(e) => handleShiftInputChange('status', e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <button 
        type="submit" 
        className={`w-full py-3 px-4 text-white font-medium rounded-md shadow-sm focus:outline-none ${buttonColor} hover:opacity-90 transition-opacity mt-4`}
      >
        {buttonText}
      </button>
    </form>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Work Schedule Management</h1>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm flex items-center gap-2 transition-colors"
            onClick={() => {
              clearShiftForm();
              setShowCreateModal(true);
            }}
          >
            <Plus size={18} />
            <span>Add Shift</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : workShifts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">No Shifts Available</h2>
            <p className="text-gray-500 mb-4">Start by adding your first work shift.</p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm inline-flex items-center gap-2 transition-colors"
              onClick={() => {
                clearShiftForm();
                setShowCreateModal(true);
              }}
            >
              <Plus size={18} />
              <span>Add Shift</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 font-medium text-gray-700 border-b">
              <div>Shift Type</div>
              <div>Time</div>
              <div>Status & Actions</div>
            </div>
            
            <div className="divide-y">
              {workShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="grid grid-cols-3 gap-4 p-4 items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">{shift.shift_type}</div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shift.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {shift.status}
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        className="p-1 rounded hover:bg-gray-200 text-blue-600 transition-colors"
                        onClick={() => {
                          setShiftFormData(shift);
                          setShowUpdateModal(true);
                        }}
                        title="Edit shift"
                      >
                        <Edit2 size={18} />
                      </button>
                      
                      <button
                        className="p-1 rounded hover:bg-gray-200 text-red-600 transition-colors"
                        onClick={() => handleDeleteShift(shift.id)}
                        title="Delete shift"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal 
        title="Create Work Shift" 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
      >
        <ShiftForm 
          onSubmit={handleAddShift} 
          buttonText="Add Shift" 
          buttonColor="bg-blue-500"
        />
      </Modal>

      {/* Update Modal */}
      <Modal 
        title="Update Work Shift" 
        isOpen={showUpdateModal} 
        onClose={() => setShowUpdateModal(false)}
      >
        <ShiftForm 
          onSubmit={handleUpdateShift} 
          buttonText="Update Shift" 
          buttonColor="bg-green-500"
        />
      </Modal>
    </div>
  );
};

export default WorkSchedule;