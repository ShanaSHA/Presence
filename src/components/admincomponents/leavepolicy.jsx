import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLeavePolicies,
  createLeavePolicy,
  updateLeavePolicy,
  deleteLeavePolicy,
  setCurrentPolicy,
  resetCurrentPolicy,
  setShowCreateModal,
  setShowUpdateModal,
  updateCurrentPolicyField
} from '../../redux/admredux/leavePoliciesSlice';
import { Plus, Edit, Trash2, X, Check, AlertCircle, Calendar } from 'lucide-react';

// Modified to accept props from PolicyManagement
const LeavePolicy = ({ leavePolicies, refreshPolicies }) => {
  const dispatch = useDispatch();
  const { 
    status, 
    error, 
    currentPolicy, 
    showCreateModal, 
    showUpdateModal 
  } = useSelector(state => state.leavePolicies);

  // Use the provided leavePolicies prop or fall back to Redux state
  const policies = leavePolicies || useSelector(state => state.leavePolicies.policies);

  useEffect(() => {
    if (status === 'idle' && !leavePolicies) {
      dispatch(fetchLeavePolicies());
    }
  }, [status, dispatch, leavePolicies]);

  const handlePolicyInputChange = (field, value) => {
    dispatch(updateCurrentPolicyField({ field, value }));
  };

  const handleAddPolicy = () => {
    dispatch(createLeavePolicy(currentPolicy))
      .then(() => {
        if (refreshPolicies) refreshPolicies();
      });
  };

  const handleUpdatePolicy = () => {
    dispatch(updateLeavePolicy({ id: currentPolicy.id, policyData: currentPolicy }))
      .then(() => {
        if (refreshPolicies) refreshPolicies();
      });
  };

  const handleDeletePolicy = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this leave policy?')) {
      dispatch(deleteLeavePolicy(id))
        .then(() => {
          if (refreshPolicies) refreshPolicies();
        });
    }
  };

  const resetForm = () => {
    dispatch(resetCurrentPolicy());
  };

  // Rest of your component remains the same...
  return (
    <div className="bg-white">
      {status === 'loading' ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div>
          {policies.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Calendar className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave policies</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new leave policy.</p>
              <div className="mt-6">
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  onClick={() => {
                    resetForm();
                    dispatch(setShowCreateModal(true));
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Policy
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-900">Available Leave Policies</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">{policies.length} Policies</span>
                </div>
              </div>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {policies.map(policy => (
                  <div 
                    key={policy.id} 
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    <div 
                      className="p-5 cursor-pointer"
                      onClick={() => {
                        dispatch(setCurrentPolicy(policy));
                        dispatch(setShowUpdateModal(true));
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{policy.leave_type}</h3>
                          <p className="text-gray-500 text-sm mt-1">Frequency: {policy.frequency}</p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {policy.amount} days
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-1">Carry forward:</span>
                          {policy.carry_forward === 'yes' ? (
                            <span className="text-green-500 flex items-center">
                              <Check className="h-4 w-4 mr-1" /> Allowed
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center">
                              <X className="h-4 w-4 mr-1" /> Not allowed
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            className="p-1 rounded-full text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(setCurrentPolicy(policy));
                              dispatch(setShowUpdateModal(true));
                            }}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => handleDeletePolicy(policy.id, e)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Add Policy Button (only shown if we have policies already) */}
      {policies.length > 0 && (
        <div className="text-right mt-4">
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onClick={() => {
              resetForm();
              dispatch(setShowCreateModal(true));
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Policy
          </button>
        </div>
      )}

      {/* Modal for Create/Update */}
      {(showCreateModal || showUpdateModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50" aria-hidden="true">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl transform transition-all">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                {showCreateModal ? (
                  <>
                    <Plus className="h-5 w-5 mr-2 text-purple-600" />
                    Create Leave Policy
                  </>
                ) : (
                  <>
                    <Edit className="h-5 w-5 mr-2 text-purple-600" />
                    Update Leave Policy
                  </>
                )}
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-500 transition duration-150"
                onClick={() => {
                  dispatch(setShowCreateModal(false));
                  dispatch(setShowUpdateModal(false));
                  resetForm();
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <input 
                  id="leaveType"
                  type="text" 
                  placeholder="e.g. Annual Leave, Sick Leave" 
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  value={currentPolicy.leave_type || ''} 
                  onChange={(e) => handlePolicyInputChange('leave_type', e.target.value)} 
                />
              </div>
              
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <input
                  id="frequency"
                  type='number'
                  placeholder="Number of days" 
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  value={currentPolicy.frequency || ''}
                  onChange={(e) => handlePolicyInputChange('frequency', e.target.value)}
                >
                  
                </input>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (days)</label>
                <input 
                  id="amount"
                  type="number" 
                  placeholder="Number of days" 
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  value={currentPolicy.amount || ''} 
                  min="0"
                  step="0.5"
                  onChange={(e) => handlePolicyInputChange('amount', e.target.value)} 
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">Carry Forward</label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="carryForward" 
                      value="yes" 
                      checked={currentPolicy.carry_forward === 'yes'}
                      onChange={() => handlePolicyInputChange('carry_forward', 'yes')}
                      className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="carryForward" 
                      value="no" 
                      checked={currentPolicy.carry_forward === 'no'}
                      onChange={() => handlePolicyInputChange('carry_forward', 'no')}
                      className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex space-x-3 justify-end">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={() => {
                    dispatch(setShowCreateModal(false));
                    dispatch(setShowUpdateModal(false));
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                {showCreateModal ? (
                  <button 
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
                    onClick={handleAddPolicy}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Policy
                  </button>
                ) : (
                  <button 
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
                    onClick={handleUpdatePolicy}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Update Policy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePolicy;