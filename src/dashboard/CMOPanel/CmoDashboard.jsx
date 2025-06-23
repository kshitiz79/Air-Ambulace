import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FiHome, FiSend, FiUser, FiUpload, FiEdit3, FiCheckSquare, FiClipboard } from "react-icons/fi";


const links = [
  { to: "/cmo-dashboard", label: "Dashboard", icon: <FiHome /> },
  { to: "/cmo-dashboard/forwarding-form", label: "Forwarding Form", icon: <FiSend /> },
  { to: "/cmo-dashboard/beneficiary-detail-page", label: "Beneficiary Details", icon: <FiUser /> },
  { to: "/cmo-dashboard/cmo-dox-upload", label: "CMO Dox Upload", icon: <FiUpload /> },
  { to: "/cmo-dashboard/enquiry-creation-page", label: "Enquiry Creation", icon: <FiEdit3 /> },
  { to: "/cmo-dashboard/document-verification", label: "Document Verification", icon: <FiCheckSquare /> },
  { to: "/cmo-dashboard/case-status-page", label: "Case Status", icon: <FiClipboard /> },
];

const CmoDashboard = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg p-6 overflow-y-auto border-r border-gray-200">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-blue-700">CMO Dashboard</h1>
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
