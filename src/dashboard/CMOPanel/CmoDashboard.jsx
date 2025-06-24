import React from "react";
import { useNavigate } from "react-router-dom";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FiHome, FiSend, FiUser, FiUpload, FiEdit3, FiCheckSquare, FiClipboard, FiLogOut, FiBell, FiSettings } from "react-icons/fi";
import {   FiHelpCircle } from 'react-icons/fi';
const links = [
  { to: "/cmo-dashboard", label: "Dashboard", icon: <FiHome /> },
  { to: "/cmo-dashboard/forwarding-form", label: "Forwarding Form", icon: <FiSend /> },
  { to: "/cmo-dashboard/beneficiary-detail-page", label: "Beneficiary Details", icon: <FiUser /> },
  { to: "/cmo-dashboard/enquiry-creation-page", label: "Enquiry Creation", icon: <FiEdit3 /> },
  { to: "/cmo-dashboard/case-status-page", label: "Case Status", icon: <FiClipboard /> },
];

const CmoDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();



  const handleLogout = () => {
  // Remove auth data from localStorage/sessionStorage
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("district_id");

  // Redirect to login page
  navigate("/");
}

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-bl from-blue-600 to-blue-800 text-white shadow-2xl p-6 flex flex-col justify-between border-r border-blue-900/20">
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold tracking-tight">CMO Dashboard</h1>
          </div>

          {/* Navigation */}
          <nav>
            <ul className="space-y-2">
              {links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 
                        ${isActive
                          ? "bg-white text-blue-900 font-medium shadow-md"
                          : "text-blue-50 hover:bg-blue-600 hover:text-blue-100"}`}
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Profile and Logout */}
        <div className="mt-6 border-t border-blue-600 pt-4">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-blue-300"
            />
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-blue-200">Chief Medical Officer</p>
            </div>
          </div>
         <button
  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200"
  onClick={handleLogout}
>
  <FiLogOut />
  <span>Logout</span>
</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {/* Header */}
  

<header className="bg-white text-white shadow-xs shadow-gray-300 z-10 p-4 flex justify-between items-center">
  <h2 className="text-xl text-blue-900 font-semibold">Welcome, John Doe</h2>
  <div className="flex items-center space-x-4">
    <button className="p-2 rounded-full text-black hover:bg-blue-600 transition duration-200">
      <FiBell className="text-lg" />
    </button>
    <button className="p-2 rounded-full text-black hover:bg-blue-600 transition duration-200">
      <FiSettings className="text-lg" />
    </button>
    <button className="p-2 rounded-full text-black hover:bg-blue-600 transition duration-200">
      <FiUser className="text-lg" />
    </button>
    <button className="p-2 rounded-full text-black hover:bg-blue-600 transition duration-200">
      <FiHelpCircle className="text-lg" />
    </button>
   
  </div>
</header>


        {/* Content */}
        <main className="flex-grow p-8 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CmoDashboard;