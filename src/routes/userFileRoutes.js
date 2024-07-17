import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserFiles from "../pages/userfiles";
import CreateUserFile from "../pages/create-userfile";
import UserDetails from "../pages/user-details";

export default function UserFileRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="clients" />} />
            {/* <Route path="/dashboard/*" element={<Dashboard />} /> */}
            <Route path="clients/*" element={<UserFiles />} />
            <Route path="create-client/*" element={<CreateUserFile />} />
            <Route path="clients/:username" element={<UserDetails />} />
        </Routes>
    );
}