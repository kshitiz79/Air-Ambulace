import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiHome, FiTruck, FiFileText, FiInfo, FiActivity, FiUsers, FiBarChart2, FiMessageSquare, FiBell, FiSettings, FiUser, FiList, FiDatabase, FiMail, FiCheckCircle, FiMenu, FiX } from 'react-icons/fi';
import { FaHospital, FaAmbulance, FaHeartbeat, FaUserMd, FaWhatsapp, FaPlus } from 'react-icons/fa';
import Sidebar from '../../components/Global/SideBar';
import Header from '../../components/Global/Header';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/admin', label: t.dashboard, icon: <FiHome /> },
    { to: '/admin/enquiry-creation-page', label: t.enquiryCreation, icon: <FaPlus /> },
    { to: '/admin/admin-report-page', label: t.adminReport, icon: <FiTruck /> },
    { to: '/admin/alert-page', label: t.alerts, icon: <FiFileText /> },
    { to: '/admin/export-page', label: t.exportData, icon: <FiInfo /> },
    { to: '/admin/system-performance-page', label: t.systemPerformance, icon: <FiActivity /> },
    { to: '/admin/user-management', label: t.userManagement, icon: <FiUsers /> },
    { to: '/admin/enquiry-management', label: t.enquiryManagement, icon: <FiMessageSquare /> },
    { to: '/admin/district-data-page', label: t.districtData, icon: <FiBarChart2 /> },
    { to: '/admin/hospital-management', label: t.hospitalData, icon: <FaHospital /> },
    { to: '/admin/all-queries', label: t.allQueries, icon: <FiList /> },
    { to: '/admin/referral-authority-management', label: t.referralMaster || 'Referral Master', icon: <FiDatabase /> },
    { to: '/admin/ambulance-master', label: 'Ambulance Master', icon: <FaAmbulance /> },
    { to: '/admin/medical-condition-master', label: 'Medical Conditions', icon: <FaHeartbeat /> },
    { to: '/admin/doctor-assignments', label: 'Doctor Assignments', icon: <FaUserMd /> },
    { to: '/admin/ambulance-tracking', label: 'Ambulance Tracking', icon: <FaAmbulance /> },
    { to: '/admin/whatsapp-config', label: 'WhatsApp Alerts', icon: <FaWhatsapp /> },
    { to: '/admin/email-config', label: 'Email Alerts', icon: <FiMail /> },
    { to: '/admin/completed-cases', label: 'Completed Cases', icon: <FiCheckCircle /> },
  ];

  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'Admin User';
  const userRole = t.administrator;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden">

      {/* ── Mobile overlay ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar — hidden on mobile unless open ─────────────────────── */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        md:relative md:inset-auto md:z-auto md:flex md:flex-col md:h-full
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar
          navigationLinks={links}
          title={t.adminDashboard}
          userName={userName}
          userRole={userRole}
          onLogout={handleLogout}
          onLinkClick={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <FiActivity className="text-white text-sm" />
            </div>
            <span className="font-black text-gray-900 text-sm uppercase tracking-tight">Admin</span>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userName?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block">
          <Header
            greeting={`Welcome, ${userName}`}
            userName={userName}
            showSearch={true}
            showNotifications={true}
            showSettings={true}
            notificationCount={5}
          >
            <button title={t.settings} className="p-2 rounded-full hover:bg-blue-700/50 transition">
              <FiSettings className="text-xl" />
            </button>
            <button title={t.profile} className="p-2 rounded-full hover:bg-blue-700/50 transition">
              <FiUser className="text-xl" />
            </button>
          </Header>
        </div>

        {/* Page content */}
        <main className="flex-grow overflow-y-auto bg-gray-50 p-3 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;