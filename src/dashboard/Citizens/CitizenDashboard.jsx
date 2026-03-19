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
import { useLanguage } from '../../contexts/LanguageContext';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Get real user information from localStorage
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Citizen User';
  const userRole = t.beneficiary;

  const navigationLinks = [
    { to: '/user', label: t.home, icon: <FiHome /> },
    { to: '/user/enquiry-form', label: t.enquiryCreation, icon: <FiFileText /> },
    { to: '/user/status-check', label: t.statusCheck, icon: <FiSearch /> },
    { to: '/user/dox-upload', label: t.uploadDocuments, icon: <FiUpload /> },
    { to: '/user/emergency-contact', label: t.emergencyContact, icon: <FiPhone /> },
    { to: '/user/notification', label: t.notifications, icon: <FiBell /> },
    { to: '/user/faq-page', label: t.faqs, icon: <FiHelpCircle /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <Sidebar
        title={t.citizenPortal}
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