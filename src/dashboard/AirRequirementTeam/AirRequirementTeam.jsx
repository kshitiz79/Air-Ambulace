
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
} from "react-icons/fi";

const links = [
  { to: "/air-team", label: "Dashboard", icon: <FiHome /> },
  { to: "/air-team/ambulance-assignment-page", label: "Ambulance Assignment", icon: <FiTruck /> },
  { to: "/air-team/case-close-file", label: "Case Close File", icon: <FiFileText /> },
  { to: "/air-team/case-detail-page", label: "Case Details", icon: <FiInfo /> },
  { to: "/air-team/invoice-generation-page", label: "Invoice Generation", icon: <FiDollarSign /> },
  { to: "/air-team/post-operation-page", label: "Post Operation", icon: <FiActivity /> },
  { to: "/air-team/tracker-page", label: "Tracker", icon: <FiMapPin /> },
];
const AirRequirementTeam = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg p-6 overflow-y-auto border-r border-gray-200">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-blue-700">Air Requirement Team  </h1>
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