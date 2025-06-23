import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import {
  FiHome,
  FiThumbsUp,
  FiFileText,
  FiAlertCircle,
  FiDollarSign,
  FiSend,
  FiSearch,
} from "react-icons/fi";

const links = [
  { to: "/dm-dashboard", label: "Dashboard", icon: <FiHome /> },
  { to: "/dm-dashboard/approval-reject", label: "Approval / Reject", icon: <FiThumbsUp /> },
  { to: "/dm-dashboard/case-files", label: "CASE File", icon: <FiFileText /> },
  { to: "/dm-dashboard/escalation-page", label: "Escalation Page", icon: <FiAlertCircle /> },
  { to: "/dm-dashboard/financial-page", label: "Financial Page", icon: <FiDollarSign /> },
  { to: "/dm-dashboard/order-release-page", label: "Order Release", icon: <FiSend /> },
  { to: "/dm-dashboard/search-page", label: "Search Page", icon: <FiSearch /> },
];
const CmoDashboard = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg p-6 overflow-y-auto border-r border-gray-200">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-blue-700">DM Dashboard</h1>
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

export default CmoDashboard;
