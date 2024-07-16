import React from "react";
import { BrowserRouter as  Router, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/login";
import Dashboard from "./pages/dashboard"; 

export default function Approutes() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        {/* <Route path="/course/*" element={<CourseDashboard/>}/> */}
      </Routes>
  );
}