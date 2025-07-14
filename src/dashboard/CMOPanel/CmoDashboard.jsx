import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiSend,
  FiUser,
  FiEdit3,
  FiClipboard,
  FiBell,
  FiSettings,
} from 'react-icons/fi';
import SideBar from './../../components/Global/SideBar';
import Header from './../../components/Global/Header';

const navigationLinks = [
  { to: '/cmo-dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/cmo-dashboard/escalate-case', label: 'Escalate Case', icon: <FiSend /> },
  { to: '/cmo-dashboard/beneficiary-detail-page', label: 'Beneficiary Details', icon: <FiUser /> },
  { to: '/cmo-dashboard/enquiry-creation-page', label: 'Enquiry Creation', icon: <FiEdit3 /> },
  { to: '/cmo-dashboard/case-status-page', label: 'Case Status', icon: <FiClipboard /> },
];

const CmoDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userName = 'John Doe';
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
        <Header greeting={`Welcome, ${userName}`}>  
        <Link to="/cmo-dashboard/notification" title="Notifications">
  <button className="p-2 rounded-full hover:bg-blue-700/50 transition">
    <FiBell className="text-xl" />
  </button>
</Link>
          <button title="Settings" className="p-2 rounded-full hover:bg-blue-700/50 transition">
            <FiSettings className="text-xl" />
          </button>
          <button title="Profile" className="p-2 rounded-full hover:bg-blue-700/50 transition">
            <FiUser className="text-xl" />
          </button>
        </Header>

        <main className="flex-grow p-8 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CmoDashboard;