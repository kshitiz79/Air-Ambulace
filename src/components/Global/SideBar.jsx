// components/Global/SideBar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut, FiChevronLeft, FiChevronRight, FiActivity } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

const SideBar = ({
  title = "Air Ambulance",
  navigationLinks = [],
  userName,
  userRole,
  onLogout,
  collapsed = false,
  onToggleCollapse
}) => {
  // Get real user data from localStorage
  const realUserName = userName || localStorage.getItem('full_name') || localStorage.getItem('username') || 'User';
  const realUserRole = userRole || localStorage.getItem('role') || 'Role';
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const { isDark } = useTheme();

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggleCollapse) onToggleCollapse(!isCollapsed);
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-72'} flex flex-col shadow-2xl transition-all duration-300 ease-in-out relative ${
      isDark 
        ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white' 
        : 'bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800 border-r border-slate-200'
    }`}>
      {/* Header with Logo and Toggle */}
      <div className={`p-6 border-b ${
        isDark ? 'border-slate-700/50' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <FiActivity className="text-white text-xl" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className={`text-xl font-bold tracking-tight ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent' 
                    : 'text-slate-800'
                }`}>
                  {title}
                </h1>
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>Emergency Services</p>
              </div>
            )}
          </div>
          <button
            onClick={handleToggle}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDark 
                ? 'hover:bg-slate-700/50 text-slate-400 hover:text-white' 
                : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 py-6">
        <ul className="space-y-2">
          {navigationLinks && navigationLinks.length > 0 ? navigationLinks.map(({ to, label, icon, badge }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                      : isDark 
                        ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  title={isCollapsed ? label : ''}
                >
                  <span className={`text-xl ${
                    isActive 
                      ? 'text-white' 
                      : isDark 
                        ? 'text-slate-400 group-hover:text-white'
                        : 'text-slate-500 group-hover:text-slate-800'
                  }`}>
                    {icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">{label}</span>
                      {badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                </Link>
              </li>
            );
          }) : (
            <li className={`px-4 py-3 text-sm text-center ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {isCollapsed ? '...' : 'No navigation available'}
            </li>
          )}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className={`p-4 border-t ${
        isDark ? 'border-slate-700/50' : 'border-slate-200'
      }`}>
        {!isCollapsed && (
          <div className={`mb-4 px-3 py-3 rounded-xl ${
            isDark ? 'bg-slate-800/50' : 'bg-slate-100'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {realUserName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>{realUserName}</p>
                <p className={`text-xs truncate ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>{realUserRole}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 w-full text-left group ${
            isCollapsed ? 'justify-center' : ''
          } ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
          title={isCollapsed ? 'Log Out' : ''}
        >
          <FiLogOut className="text-lg group-hover:scale-110 transition-transform" />
          {!isCollapsed && <span className="text-sm font-medium">Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default SideBar;