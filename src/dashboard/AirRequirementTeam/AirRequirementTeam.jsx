
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

import { useLanguage } from '../../contexts/LanguageContext';

const AirRequirementTeam = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navigationLinks = [
    { to: '/air-team', label: t.dashboard, icon: <FiHome /> },
    { to: '/air-team/ambulance-assignment-page', label: t.flightAssignments, icon: <FiTruck /> },
    { to: '/air-team/case-detail-page', label: t.caseManagement, icon: <FiInfo /> },
    { to: '/air-team/post-operation-page', label: t.operationReports, icon: <FiActivity /> },
    { to: '/air-team/ambulance-management-page', label: t.ambulanceManagement, icon: <FaPlane /> },
    { to: '/air-team/tracker-page', label: t.flightTracker, icon: <FiMapPin /> },
    { to: '/air-team/crew-management', label: t.crewManagement, icon: <FiUser /> },
    { to: '/air-team/invoice-generation-page', label: t.invoiceManagement, icon: <FiDollarSign /> },
    { to: '/air-team/case-close-file', label: t.caseClosure, icon: <FiFileText /> },
    { to: '/air-team/profile', label: t.myProfile, icon: <FiUser /> },
  ];
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Air Team User';
  const userRole = t.airRequirementTeam;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      <SideBar
        title={t.airTeamDashboard}
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