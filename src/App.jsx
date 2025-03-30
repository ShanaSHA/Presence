import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

import Login from "./pages/login";
import ForgotPassword from "./pages/forgot";
import Dashboard from "./modules/Admin/dashboard";
import HrUsers from "./modules/Admin/hrUsers";
import LeaveRequest from "./modules/Admin/leaveRequest";
import Attendance from "./modules/Admin/Attendance";
import PolicyManagement from "./modules/Admin/policy";
import ResetPassword from "./pages/reset";
import ProfilePage from "./components/admincomponents/profile";
import ChangePassword from "./pages/Changepassword";
import HrDashboard from "./modules/hr/hrDashboard";
import EmployeeList from "./modules/hr/TotalEmployee";
import AttendanceTracker from "./modules/hr/attendance";
import EmployeeAttendanceDetail from "./modules/hr/EmployeeAttendanceDetail";
import SelfPortal from "./modules/hr/selfportal";
import LeaveRequests from "./components/hrcomponents/hrleave";
import EmployeeLeaveRequestSystem from "./modules/hr/employeeleave";
import OvertimeApp from "./modules/hr/overtime";
import HrProfilePage from "./components/hrcomponents/hrprofile";
import CompleteShiftCalendar from "./modules/hr/shift";
import EmpDashboard from "./modules/employee/empdashboard";
import LeaveRequestApp from "./modules/employee/empLeave";
import AttendanceApp from "./modules/employee/emattendance";
import ShiftcalendarApp from "./modules/employee/empShift";
import Overtimedashboard from "./modules/employee/empovertime";
import LeaveRequestDashboard from "./modules/employee/empusedleave";
import EmpProfilePage from "./components/empcomponents/empprofile";
import Policymanagement from "./components/empcomponents/policyview";
import Policyes from "./components/hrcomponents/policy";
import LeaveDashboard from "./modules/hr/usedleave";
function App() {
  return (
    <div>
     
<Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/policyes" element={<Policyes/>} />
      
        <Route path="/policyview" element={<Policymanagement/>}/>
        <Route element={<PrivateRoute allowedRoles={["admin"]}/>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hrUsers" element={<HrUsers />} />
        <Route path="/leaveRequest" element={<LeaveRequest />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/policy" element={<PolicyManagement />} />
        
        <Route path="/profile" element={<ProfilePage />} />
      
             </Route>
                 
             <Route element={<PrivateRoute allowedRoles={["hr"]}/>}>
        <Route path="/hrprofile" element={<HrProfilePage />} />
        <Route path="/hrDashboard" element={<HrDashboard />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/attendances" element={<AttendanceTracker />} />
        <Route path="/usedleave" element={<LeaveDashboard />} />
        <Route path="/employee/:id/attendance" element={<EmployeeAttendanceDetail />} />
        <Route path="/selfportal" element={<SelfPortal/>} />
        <Route path="/hrleave" element={<LeaveRequests/>} />
        <Route path="/leaverequests" element={<EmployeeLeaveRequestSystem/>} />
        <Route path="/overtime" element={<OvertimeApp/>} />
        <Route path="/shift" element={<CompleteShiftCalendar/>} />
       
              </Route>
              <Route element={<PrivateRoute allowedRoles={["employee"]}/>}>    
        <Route path="/employeedashboard" element={<EmpDashboard/>} />
        <Route path="/leavereque" element={<LeaveRequestApp/>} />
        <Route path="/empattendances" element={<AttendanceApp/>} />
        <Route path="/empshift" element={<ShiftcalendarApp/>} />
        <Route path="/empovertime" element={<Overtimedashboard/>} />
        <Route path="/empleaves" element={<LeaveRequestDashboard/>} />
        <Route path="/empprofile" element={<EmpProfilePage/>} />
        <Route path="/policyes" element={<Policyes/>} />
             </Route>
      </Routes>
    </Router>
 
    </div>
     );
}
export default App;
