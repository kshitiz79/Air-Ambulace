
import { Outlet, useNavigate } from "react-router-dom";
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
import SideBar from '../../components/Global/SideBar';
import Header from '../../components/Global/Header';

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
  const navigate = useNavigate();
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Air Team User';
  const userRole = 'Service Provider';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <SideBar
        title="Air Requirement Team"
        navigationLinks={links}
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col">
        {/* Header */}
        <Header
          greeting={`Welcome, ${userName}`}
          userName={userName}
          showSearch={true}
          showNotifications={true}
          showSettings={true}
          notificationCount={4}
        />

        {/* Content */}
        <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};




export default AirRequirementTeam