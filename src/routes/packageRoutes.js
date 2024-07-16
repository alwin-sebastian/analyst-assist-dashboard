import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Dashboard from "./pages/dashboard";
import PackageList from "../pages/packages";
import CreatePackage from "../pages/create-package";
import PackageDetails from "../pages/package-details";
export default function PackageRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="templates" />} />
            {/* <Route path="/dashboard/*" element={<Dashboard />} /> */}
            <Route path="templates/*" element={<PackageList />} />
            <Route path="create-template/*" element={<CreatePackage />} />
            <Route path="templates/:packageName" element={<PackageDetails />} />
        </Routes>
    );
    }