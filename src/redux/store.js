import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './admredux/dashboardSlice';
import attendanceReducer from './admredux/attendanceSlice';
import hrUsersReducer from './admredux/hrUsersSlice';
import leaveRequestsReducer from './admredux/leaveRequestsSlice';
import   policyReducer from './admredux/policySlice';

import leavePoliciesReducer  from './admredux/leavePoliciesSlice';



// import userReducer from '../sliderSlice';
const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    attendance: attendanceReducer,
    hrUsers: hrUsersReducer,
    leaveRequests: leaveRequestsReducer,
    policy: policyReducer,
    
    leavePolicies: leavePoliciesReducer,
    
    // user: userReducer,
   
     
    
      
  },
  // Optional: Add middleware or enhancers
 
});

export default store;
