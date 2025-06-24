
import { Link, Outlet, useLocation } from "react-router-dom";
import React from "react";
import {
  FiHome,
  FiTruck,
  FiFileText,
  FiInfo,
  FiDollarSign,
  FiActivity,
  FiMapPin,
  FiUsers,
  FiBarChart2,
} from "react-icons/fi";
import { FaHospital } from "react-icons/fa";

const links = [
  { to: "/admin", label: "Dashboard", icon: <FiHome /> },
  { to: "/admin/admin-report-page", label: "Admin Report", icon: <FiTruck /> },
  { to: "/admin/alert-page", label: "Alerts", icon: <FiFileText /> },
  { to: "/admin/export-page", label: "Export Data", icon: <FiInfo /> },
  { to: "/admin/permission-page", label: "Permissions", icon: <FiDollarSign /> },
  { to: "/admin/system-performance-page", label: "System Performance", icon: <FiActivity /> },
  { to: "/admin/user-management", label: "User Management", icon: <FiUsers /> },
  { to: "/admin/district-data-page", label: "District Data", icon: <FiBarChart2 /> },
  { to: "/admin/hospital-management", label: "Hospital Data", icon: <FaHospital /> },
];


const AirRequirementTeam = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg p-6 overflow-y-auto border-r border-gray-200">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-blue-700">Admin Dashboard </h1>
        </div>
        <nav>
       
          <ul className="space-y-3">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition duration-200 
                      ${isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};




export default AirRequirementTeam