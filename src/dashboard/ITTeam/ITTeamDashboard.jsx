import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SideBar from './../../components/Global/SideBar';
import Header from '../../components/Global/Header';
import {
  FiHome,
  FiUsers,
  FiCode,
  FiDatabase,
  FiShield,
  FiSettings,
  FiMapPin,
  FiTruck,
  FiFileText,
  FiDollarSign,
  FiActivity,
  FiUpload,
  FiSearch,
  FiAlertTriangle,
  FiClock,
  FiBarChart2
} from 'react-icons/fi';

import { useLanguage } from './../../contexts/LanguageContext';

const ITTeamDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navigationLinks = [
    { to: '/it-team', label: t.dashboard, icon: <FiHome /> },
    
    // User & System Management
    { to: '/it-team/all-users', label: t.userManagement, icon: <FiUsers /> },
    { to: '/it-team/system-logs', label: t.systemLogs, icon: <FiCode /> },
    { to: '/it-team/database-management', label: t.database, icon: <FiDatabase /> },
    { to: '/it-team/security-center', label: t.securityCenter, icon: <FiShield /> },
    { to: '/it-team/system-settings', label: t.systemSettings, icon: <FiSettings /> },
    
    // Data Management
    { to: '/it-team/district-management', label: t.districtManagement, icon: <FiMapPin /> },
    { to: '/it-team/hospital-management', label: t.hospitalManagement, icon: <FiMapPin /> },
    { to: '/it-team/ambulance-management', label: t.ambulanceFleet, icon: <FiTruck /> },
    
    // Operations Management
    { to: '/it-team/enquiry-management', label: t.allEnquiries, icon: <FiFileText /> },
    { to: '/it-team/flight-assignments', label: t.flightAssignments, icon: <FiActivity /> },
    { to: '/it-team/invoices-management', label: t.invoiceManagement, icon: <FiDollarSign /> },
    { to: '/it-team/case-escalations', label: t.caseEscalations, icon: <FiAlertTriangle /> },
    { to: '/it-team/post-operations', label: t.postOperations, icon: <FiClock /> },
    
    // Import/Export & Analytics
    { to: '/it-team/data-import-export', label: t.dataImportExport, icon: <FiUpload /> },
    { to: '/it-team/analytics-reports', label: t.analyticsReports, icon: <FiBarChart2 /> },
    { to: '/it-team/advanced-search', label: t.advancedSearch, icon: <FiSearch /> },
  ];
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Support Admin';
  const userRole = t.systemAdministrator;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      <SideBar
        title={t.itTeamDashboard}
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
          notificationCount={5}
        />

        <main className="flex-grow p-8 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ITTeamDashboard;