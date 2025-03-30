import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchHolidays, 
  createHoliday, 
  
  fetchLeaveTypes,
  createLeaveType,
  getCommunities
} from '../../api/adminapi/holidayapi';
import { 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  ArrowLeft 
} from 'lucide-react';

const Holiday = () => {
  // State Management
  const [holidays, setHolidays] = useState([]);
  const [holidayTypes, setHolidayTypes] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Form Data States
  const [holidayFormData, setHolidayFormData] = useState({
    name: '',
    date: '',
    description: '',
    status: 'active',
    type: 'Public',
    community: 'Other'
  });

  const [newTypeData, setNewTypeData] = useState({ 
    name: '', 
    color: 'bg-blue-600' 
  });

  // Fetch Data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [holidaysData, typesData, communitiesData] = await Promise.all([
        fetchHolidays(filterYear),
        fetchLeaveTypes(),
        getCommunities()
      ]);
      setHolidays(holidaysData);
      setHolidayTypes(typesData);
      setCommunities(communitiesData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filterYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleHolidayInputChange = (field, value) => {
    setHolidayFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      const newHoliday = await createHoliday(holidayFormData);
      setHolidays(prev => [...prev, newHoliday]);
      setShowCreateModal(false);
      resetForms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add holiday');
    }
  };

  

 

  const handleAddHolidayType = async (e) => {
    e.preventDefault();
    try {
      const newType = await createLeaveType(newTypeData);
      setHolidayTypes(prev => [...prev, newType]);
      setShowTypeModal(false);
      resetForms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add holiday type');
    }
  };

  const resetForms = () => {
    setHolidayFormData({
      name: '',
      date: '',
    
      status: 'active',
      type: 'Public',
      community: 'Other'
    });
    setNewTypeData({ name: '', color: 'bg-blue-600' });
    setError(null);
  };

  // Render Helpers
  const renderHolidayList = () => {
    return holidays.map(holiday => (
      <div key={holiday.id} className="bg-white p-4 rounded shadow mb-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold">{holiday.name}</h3>
            <p>{new Date(holiday.date).toLocaleDateString()}</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                setHolidayFormData(holiday);
                setShowUpdateModal(true);
              }}
              className="text-blue-500"
            >
              <Edit2 />
            </button>
            <button 
              onClick={() => handleDeleteHoliday(holiday.id)}
              className="text-red-500"
            >
              <Trash2 />
            </button>
          </div>
        </div>
      </div>
    ));
  };

  // Main Render
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Holiday Management</h1>
        <div className="space-x-2">
          <button 
            onClick={() => setShowTypeModal(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded"
          >
            Add Holiday Type
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Holiday
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label>Filter Year: </label>
        <select 
          value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))}
          className="border rounded p-1"
        >
          {[2022, 2023, 2024, 2025].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Holidays</h2>
          {renderHolidayList()}
        </div>
        <div>
  <h2 className="text-xl font-semibold mb-2">Holiday Types</h2>
  {Array.isArray(holidayTypes) && holidayTypes.map(type => (
    <div key={type.id} className={`${type.color} text-white p-2 rounded mb-2`}>
      {type.name}
    </div>
  ))}
</div>
      </div>

      {/* Modals would be implemented similarly to previous implementation */}
      {/* Create Holiday Modal */}
      {showCreateModal && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Holiday</h2>
            <form onSubmit={handleAddHoliday}>
              <input
                type="text"
                placeholder="Holiday Name"
                value={holidayFormData.name}
                onChange={(e) => handleHolidayInputChange('name', e.target.value)}
                className="w-full border p-2 mb-2 rounded"
                required
              />
              <input
                type="date"
                value={holidayFormData.date}
                onChange={(e) => handleHolidayInputChange('date', e.target.value)}
                className="w-full border p-2 mb-2 rounded"
                required
              />
              <select
                value={holidayFormData.type}
                onChange={(e) => handleHolidayInputChange('type', e.target.value)}
                className="w-full border p-2 mb-2 rounded"
              >
                {holidayTypes.map(type => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
              <select
                value={holidayFormData.community}
                onChange={(e) => handleHolidayInputChange('community', e.target.value)}
                className="w-full border p-2 mb-2 rounded"
              >
                {communities.map(community => (
                  <option key={community.id} value={community.name}>
                    {community.name}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              <select
                value={holidayFormData.status}
                onChange={(e) => handleHolidayInputChange('status', e.target.value)}
                className="w-full border p-2 mb-2 rounded"
              >
                 <option value="Active">Active</option>
                 <option value="inactive">Inactive</option>
                
              </select>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
       {/* Holiday Type Modal */}
{showTypeModal && (
  <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg w-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add Holiday Type</h2>
        <button 
          onClick={() => setShowTypeModal(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>
      </div>
      <form onSubmit={handleAddHolidayType}>
        <input
          type="text"
          placeholder="Holiday Type Name"
          value={newTypeData.name}
          onChange={(e) => setNewTypeData(prev => ({ 
            ...prev, 
            name: e.target.value 
          }))}
          className="w-full border p-2 mb-2 rounded"
          required
        />
        <div className="mb-2">
          <label className="block mb-1">Choose Color:</label>
          <div className="grid grid-cols-5 gap-2">
            {[
              'bg-blue-600', 
              'bg-green-600', 
              'bg-red-600', 
              'bg-yellow-600', 
              'bg-purple-600',
              'bg-indigo-600', 
              'bg-pink-600', 
              'bg-teal-600', 
              'bg-orange-600', 
              'bg-gray-600'
            ].map((color) => (
              <button
                key={color}
                type="button"
                className={`${color} w-8 h-8 rounded ${
                  newTypeData.color === color ? 'ring-2 ring-offset-2 ring-black' : ''
                }`}
                onClick={() => setNewTypeData(prev => ({ 
                  ...prev, 
                  color: color 
                }))}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button 
            type="button"
            onClick={() => setShowTypeModal(false)}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Type
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      {/* Similar modals for update and type creation */}
    </div>
  );
};

export default Holiday;