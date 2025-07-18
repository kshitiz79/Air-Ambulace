import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiFileText, 
  FiSearch, 
  FiUpload, 
  FiPhone, 
  FiBell, 
  FiHelpCircle 
} from 'react-icons/fi';
import SideBar from '../../components/Global/SideBar';
import Header from '../../components/Global/Header';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Citizen User';
  const userRole = 'Beneficiary';

  const navigationLinks = [
    { to: '/user', label: 'Home', icon: <FiHome /> },
    { to: '/user/enquiry-form', label: 'Enquiry Form', icon: <FiFileText /> },
    { to: '/user/status-check', label: 'Status Check', icon: <FiSearch /> },
    { to: '/user/dox-upload', label: 'Upload Documents', icon: <FiUpload /> },
    { to: '/user/emergency-contact', label: 'Emergency Contact', icon: <FiPhone /> },
    { to: '/user/notification', label: 'Notifications', icon: <FiBell /> },
    { to: '/user/faq-page', label: 'FAQs', icon: <FiHelpCircle /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <SideBar
        title="Citizen Portal"
        navigationLinks={navigationLinks}
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
          notificationCount={2}
        />

        {/* Content */}
        <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CitizenDashboard;