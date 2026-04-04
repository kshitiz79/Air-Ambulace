import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiSend,
  FiUser,
  FiEdit3,
  FiClipboard,
  FiBell,
  FiTruck,
} from 'react-icons/fi';
import SideBar from './../../components/Global/SideBar';
import Header from './../../components/Global/Header';
import { useLanguage } from './../../contexts/LanguageContext';

const CmhoDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navigationLinks = [
    { to: '/cmho-dashboard', label: t.dashboard, icon: <FiHome /> },
    { to: '/cmho-dashboard/enquiry-creation-page', label: t.enquiryCreation, icon: <FiEdit3 /> },
    { to: '/cmho-dashboard/escalate-case', label: t.escalateCase, icon: <FiSend /> },
    { to: '/cmho-dashboard/ambulance-master', label: t.ambulanceFleet, icon: <FiTruck /> },
    { to: '/cmho-dashboard/beneficiary-detail-page', label: t.beneficiaryDetails, icon: <FiUser /> },
    // { to: '/cmho-dashboard/query-from-sdm', label: t.queriesFromSDM, icon: <FiBell /> },
    { to: '/cmho-dashboard/query-from-collector', label: t.queriesFromCollector, icon: <FiBell /> },
    { to: '/cmho-dashboard/profile', label: t.myProfile, icon: <FiUser /> },
  ];

  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'CMHO User';
  const userRole = t.chiefMedicalOfficer;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      <SideBar
        title={t.cmhoDashboard}
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
          notificationCount={2}
        >
          <Link to="/cmho-dashboard/notification" title="Quick Notifications">

          </Link>
          <Link to="/cmho-dashboard/profile" title={t.profile}>
            <button className="p-2 rounded-full hover:bg-blue-700/50 transition">
              <FiUser className="text-xl" />
            </button>
          </Link>
        </Header>

        <main className="flex-grow p-8 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CmhoDashboard;