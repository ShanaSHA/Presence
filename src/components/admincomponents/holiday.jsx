import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchHolidays, 
  fetchLeaveTypes, 
  addHoliday, 
  updateHoliday, 
  deleteHoliday,
  addLeaveType
} from '../../redux/admredux/holidaySlice';
import { Calendar, Plus, Edit2, Trash2, X, ArrowLeft } from 'lucide-react';

const Holiday = ({ holidays: propHolidays, refreshHolidays }) => {
  const dispatch = useDispatch();
  const [holidays, setHolidays] = useState(propHolidays || []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(!propHolidays);
  const [holidayFormData, setHolidayFormData] = useState({
    name: '',
    date: '',
    description: '',
    status: "active",
    type: "Public",
    community: "Other"
  });
  
  const [holidayTypes, setHolidayTypes] = useState([]);
  const [newTypeData, setNewTypeData] = useState({ name: '', color: 'bg-blue-600' });
  const [selectedType, setSelectedType] = useState(null);
  const [viewMode, setViewMode] = useState('list'); 
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // Load holidays with optional year filter
  const loadHolidays = async () => {
    try {
      const result = await dispatch(fetchHolidays(filterYear));
      if (fetchHolidays.fulfilled.match(result)) {
        setHolidays(result.payload);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to load holidays:', error);
      setIsLoading(false);
    }
  };

  const loadLeaveTypes = async () => {
    try {
      const result = await dispatch(fetchLeaveTypes());
      if (fetchLeaveTypes.fulfilled.match(result)) {
        setHolidayTypes(result.payload);
      }
    } catch (error) {
      console.error('Failed to load leave types:', error);
    }
  };

  useEffect(() => {
    if (propHolidays) {
      setHolidays(propHolidays);
      setIsLoading(false);
    } else {
      loadHolidays();
    }
    loadLeaveTypes();
  }, [propHolidays, filterYear, dispatch]);

  // Group holidays by type
  const groupedHolidays = holidays.reduce((groups, holiday) => {
    const type = holiday.type || 'Public';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(holiday);
    return groups;
  }, {});

  const handleHolidayInputChange = (field, value) => {
    setHolidayFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleTypeInputChange = (field, value) => {
    setNewTypeData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const clearHolidayForm = () => {
    setHolidayFormData({ 
      name: '', 
      date: '', 
      description: '',
      community: 'Other',
      status: "active",
      type: selectedType ? selectedType.name : "Public" 
    });
  };

  const handleAddHolidayType = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(addLeaveType(newTypeData));
      if (addLeaveType.fulfilled.match(result)) {
        // Update local state with the new type
        const newType = result.payload;
        setHolidayTypes([...holidayTypes, newType]);
        setNewTypeData({ name: '', color: 'bg-blue-600' });
        setShowTypeModal(false);
      }
    } catch (error) {
      console.error('Failed to add holiday type:', error);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      const action = await dispatch(addHoliday(holidayFormData));
      if (addHoliday.fulfilled.match(action)) {
        setHolidays([...holidays, action.payload]);
        clearHolidayForm();
        setShowCreateModal(false);
        if (refreshHolidays) refreshHolidays();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateHoliday = async (e) => {
    e.preventDefault();
    try {
      const action = await dispatch(updateHoliday({
        id: holidayFormData.id,
        holidayData: holidayFormData
      }));
      if (updateHoliday.fulfilled.match(action)) {
        setHolidays(holidays.map(holiday => 
          (holiday.id === action.payload.id ? action.payload : holiday)
        ));
        clearHolidayForm();
        setShowUpdateModal(false);
        if (refreshHolidays) refreshHolidays();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      try {
        const action = await dispatch(deleteHoliday(id));
        if (deleteHoliday.fulfilled.match(action)) {
          setHolidays(holidays.filter(holiday => holiday.id !== id));
          if (refreshHolidays) refreshHolidays();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleTypeCardClick = (type) => {
    const typeObj = holidayTypes.find(t => t.name === type) || { name: type, color: 'bg-gray-600' };
    setSelectedType(typeObj);
    setViewMode('typeDetail');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateString;
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

  const HolidayForm = ({ onSubmit, buttonText, buttonColor }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
        <input
          type="text"
          placeholder="New Year's Day, Independence Day, etc."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={holidayFormData.name}
          onChange={(e) => handleHolidayInputChange('name', e.target.value)}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={holidayFormData.date}
          onChange={(e) => handleHolidayInputChange('date', e.target.value)}
          required
        />
      </div>
      
      
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Community</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          value={holidayFormData.community}
          onChange={(e) => handleHolidayInputChange('community', e.target.value)}
        >
          <option value="Muslim">Muslim</option>
          <option value="Hindu">Hindu</option>
          <option value="Christian">Christian</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          value={holidayFormData.type}
          onChange={(e) => handleHolidayInputChange('type', e.target.value)}
        >
          {holidayTypes.length > 0 ? (
            holidayTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))
          ) : (
            <option value="Public">Public Holiday</option>
          )}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          value={holidayFormData.status}
          onChange={(e) => handleHolidayInputChange('status', e.target.value)}
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

  const HolidayTypeForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Type Name</label>
        <input
          type="text"
          placeholder="Enter holiday type name"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={newTypeData.name}
          onChange={(e) => handleTypeInputChange('name', e.target.value)}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          value={newTypeData.color}
          onChange={(e) => handleTypeInputChange('color', e.target.value)}
        >
          <option value="bg-blue-600">Blue</option>
          <option value="bg-green-600">Green</option>
          <option value="bg-red-600">Red</option>
          <option value="bg-purple-600">Purple</option>
          <option value="bg-orange-600">Orange</option>
          <option value="bg-yellow-600">Yellow</option>
          <option value="bg-pink-600">Pink</option>
          <option value="bg-gray-600">Gray</option>
        </select>
      </div>

      <button 
        type="submit" 
        className="w-full py-3 px-4 text-white font-medium rounded-md shadow-sm focus:outline-none bg-blue-500 hover:opacity-90 transition-opacity mt-4"
      >
        Add Holiday Type
      </button>
    </form>
  );

  // Component for each holiday card section
  const HolidayCardSection = ({ title, holidayList, typeColor }) => {
    if (holidayList.length === 0) return null;
    
    return (
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden mb-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleTypeCardClick(title)}
      >
        <div className={`px-6 py-4 ${typeColor} text-white`}>
          <h2 className="text-xl font-bold">{title} Holidays</h2>
          <p className="text-sm opacity-80">{holidayList.length} {holidayList.length === 1 ? 'holiday' : 'holidays'}</p>
        </div>
        
        <div className="p-4">
          {holidayList.slice(0, 2).map((holiday) => (
            <div
              key={holiday.id}
              className="flex justify-between items-center py-2 border-b last:border-b-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-medium text-gray-800">{holiday.name}</div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>{formatDate(holiday.date)}</span>
              </div>
            </div>
          ))}
          {holidayList.length > 2 && (
            <div className="text-center mt-2 text-blue-500 text-sm font-medium">
              {holidayList.length - 2} more holidays
            </div>
          )}
        </div>
      </div>
    );
  };

  // Detailed holiday list for a specific type
  const HolidayTypeDetailView = () => {
    if (!selectedType) return null;
    
    const typeHolidays = groupedHolidays[selectedType.name] || [];
    
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            onClick={() => setViewMode('list')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{selectedType.name} Holidays</h1>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{typeHolidays.length} {typeHolidays.length === 1 ? 'holiday' : 'holidays'} in this category</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm flex items-center gap-2 transition-colors"
            onClick={() => {
              clearHolidayForm();
              setHolidayFormData(prev => ({...prev, type: selectedType.name}));
              setShowCreateModal(true);
            }}
          >
            <Plus size={16} />
            <span>Add New Holiday</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {typeHolidays.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No holidays found in this category.</p>
              <button 
                className="mt-4 text-blue-500 font-medium"
                onClick={() => {
                  clearHolidayForm();
                  setHolidayFormData(prev => ({...prev, type: selectedType.name}));
                  setShowCreateModal(true);
                }}
              >
                Add your first holiday
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {typeHolidays.map(holiday => (
                <div key={holiday.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{holiday.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{formatDate(holiday.date)}</span>
                        {holiday.community && (
                          <span className="ml-2 text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {holiday.community}
                          </span>
                        )}
                        <span className={`ml-2 text-sm px-2 py-1 rounded-full text-white ${
                          holiday.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {holiday.status}
                        </span>
                      </div>
                     
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        onClick={() => {
                          setHolidayFormData({...holiday});
                          setShowUpdateModal(true);
                        }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        onClick={() => handleDeleteHoliday(holiday.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Year filter component
  const YearFilter = () => (
    <div className="flex items-center gap-3 mb-6">
      <label className="text-gray-700 font-medium">Filter by year:</label>
      <select
        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        value={filterYear}
        onChange={(e) => setFilterYear(parseInt(e.target.value))}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const year = new Date().getFullYear() - 2 + i;
          return <option key={year} value={year}>{year}</option>;
        })}
      </select>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {viewMode === 'list' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Holiday Management</h1>
            <div className="flex gap-3">
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm flex items-center gap-2 transition-colors"
                onClick={() => setShowTypeModal(true)}
              >
                <Plus size={16} />
                <span>Add Holiday Type</span>
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm flex items-center gap-2 transition-colors"
                onClick={() => {
                  clearHolidayForm();
                  setShowCreateModal(true);
                }}
              >
                <Plus size={16} />
                <span>Add Holiday</span>
              </button>
            </div>
          </div>
          
          <YearFilter />
          
          <div>
            {Object.keys(groupedHolidays).map(type => {
              const typeObj = holidayTypes.find(t => t.name === type) || 
                              { name: type, color: 'bg-gray-600' };
              return (
                <HolidayCardSection 
                  key={type} 
                  title={type} 
                  holidayList={groupedHolidays[type]} 
                  typeColor={typeObj.color} 
                />
              );
            })}
            
            {Object.keys(groupedHolidays).length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Holidays Added</h3>
                <p className="text-gray-500 mb-6">Start by adding holiday types and holidays for your organization</p>
                <div className="flex justify-center gap-4">
                  <button
                    className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm flex items-center gap-2 transition-colors"
                    onClick={() => setShowTypeModal(true)}
                  >
                    <Plus size={16} />
                    <span>Add Holiday Type</span>
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm flex items-center gap-2 transition-colors"
                    onClick={() => {
                      clearHolidayForm();
                      setShowCreateModal(true);
                    }}
                  >
                    <Plus size={16} />
                    <span>Add Holiday</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <HolidayTypeDetailView />
      )}
      
      {/* Create Holiday Modal */}
      <Modal 
        title="Add New Holiday" 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
      >
        <HolidayForm 
          onSubmit={handleAddHoliday} 
          buttonText="Add Holiday" 
          buttonColor="bg-blue-500"
        />
      </Modal>
      
      {/* Update Holiday Modal */}
      <Modal 
        title="Update Holiday" 
        isOpen={showUpdateModal} 
        onClose={() => setShowUpdateModal(false)}
      >
        <HolidayForm 
          onSubmit={handleUpdateHoliday} 
          buttonText="Update Holiday" 
          buttonColor="bg-green-500"
        />
      </Modal>
      
      {/* Create Holiday Type Modal */}
      <Modal 
        title="Add Holiday Type" 
        isOpen={showTypeModal} 
        onClose={() => setShowTypeModal(false)}
      >
        <HolidayTypeForm onSubmit={handleAddHolidayType} />
      </Modal>
    </div>
  );
};

export default Holiday;