import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Import ReactDOM correctly
import Dashboard from "./modules/Admin/dashboard.jsx";
import Attendance from "./modules/Admin/Attendance.jsx";

const App = () => {
  return (
    <>
      <Dashboard />
      <Attendance />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
