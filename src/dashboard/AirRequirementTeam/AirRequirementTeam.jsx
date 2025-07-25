
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiTruck,
  FiFileText,
  FiInfo,
  FiDollarSign,
  FiActivity,
  FiMapPin,
  FiUser,
} from 'react-icons/fi';
import SideBar from '../../components/Global/SideBar';
import Header from '../../components/Global/Header';
import { FaPlane } from 'react-icons/fa';

const navigationLinks = [
  { to: '/air-team', label: 'Dashboard', icon: <FiHome /> },
  { to: '/air-team/ambulance-assignment-page', label: 'Flight Assignments', icon: <FiTruck /> },
  { to: '/air-team/case-detail-page', label: 'Case Management', icon: <FiInfo /> },
  { to: '/air-team/post-operation-page', label: 'Operation Reports', icon: <FiActivity /> },
  { to: '/air-team/ambulance-management-page', label: 'Ambulance Management', icon: <FaPlane /> },
  { to: '/air-team/tracker-page', label: 'Flight Tracker', icon: <FiMapPin /> },
  { to: '/air-team/invoice-generation-page', label: 'Invoice Management', icon: <FiDollarSign /> },
  { to: '/air-team/case-close-file', label: 'Case Closure', icon: <FiFileText /> },
  { to: '/air-team/profile', label: 'My Profile', icon: <FiUser /> },
];
const AirRequirementTeam = () => {
  const navigate = useNavigate();
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Air Team User';
  const userRole = 'Air Requirement Team';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      <SideBar
        title="Air Requirement Team Dashboard"
        navigationLinks={navigationLinks}
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <div className="flex-grow flex flex-col">
        <Header
          greeting={`Welcome, ${userName}`}
          userName={userName}
          showSearch={true}
          showNotifications={true}
          showSettings={true}
          notificationCount={4}
        />

        <main className="flex-grow p-8 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};




export default AirRequirementTeam