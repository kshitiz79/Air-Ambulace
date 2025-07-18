import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiSend,
  FiUser,
  FiEdit3,
  FiClipboard,
  FiBell,
} from 'react-icons/fi';
import SideBar from './../../components/Global/SideBar';
import Header from './../../components/Global/Header';

const navigationLinks = [
  { to: '/cmo-dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/cmo-dashboard/escalate-case', label: 'Escalate Case', icon: <FiSend /> },
  { to: '/cmo-dashboard/beneficiary-detail-page', label: 'Beneficiary Details', icon: <FiUser /> },
  { to: '/cmo-dashboard/enquiry-creation-page', label: 'Enquiry Creation', icon: <FiEdit3 /> },
  { to: '/cmo-dashboard/case-status-page', label: 'Case Status', icon: <FiClipboard /> },
  { to: '/cmo-dashboard/query-from-sdm', label: 'Queries from SDM', icon: <FiBell /> },
  { to: '/cmo-dashboard/profile', label: 'My Profile', icon: <FiUser /> },
];

const CmoDashboard = () => {
  const navigate = useNavigate();

  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'CMO User';
  const userRole = 'Chief Medical Officer';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      <SideBar
        title="CMO Dashboard"
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
          <Link to="/cmo-dashboard/notification" title="Quick Notifications">

          </Link>
          <Link to="/cmo-dashboard/profile" title="Quick Profile">
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

export default CmoDashboard;