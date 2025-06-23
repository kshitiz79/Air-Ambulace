import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FiHome, FiSend, FiUser, FiUpload, FiEdit3, FiCheckSquare, FiClipboard } from "react-icons/fi";
import {

  FiUserX,
  FiCornerUpLeft,
  FiFileText,
  FiSearch,
  FiCheckCircle,
} from "react-icons/fi";



const links = [
  { to: "/sdm-dashboard", label: "Dashboard", icon: <FiHome /> },
  { to: "/sdm-dashboard/forwarding-to-dm", label: "Forwarding to DM", icon: <FiSend /> },
  { to: "/sdm-dashboard/approval-reject", label: "Approval / Reject", icon: <FiUserX /> },
  { to: "/sdm-dashboard/query-to-cmo", label: "Query to CMO", icon: <FiCornerUpLeft /> },
  { to: "/sdm-dashboard/enquiry-detail-page", label: "Enquiry Details", icon: <FiFileText /> },
  { to: "/sdm-dashboard/search-page", label: "Search Page", icon: <FiSearch /> },
  { to: "/sdm-dashboard/validation-page", label: "Validation Page", icon: <FiCheckCircle /> },
];

const SDMPanel = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside className="max-w-72 bg-white shadow-lg p-6 overflow-y-auto border-r border-gray-200">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-blue-700">SDM Dashboard</h1>
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



export default SDMPanel