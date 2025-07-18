import React, { useState } from 'react';
import { FiBell, FiSettings, FiUser, FiSearch, FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({ 
  greeting = "Welcome back", 
  userName,
  showSearch = true,
  showNotifications = true,
  showSettings = true,
  notificationCount = 0,
  onMenuToggle,
  onSearch,
  children 
}) => {
  // Get real user data from localStorage
  const realUserName = userName || localStorage.getItem('full_name') || localStorage.getItem('username') || 'User';
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <header className={`backdrop-blur-sm border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40 transition-colors duration-200 ${
      isDark 
        ? 'bg-slate-900/95 border-slate-700 text-slate-100' 
        : 'bg-white/95 border-slate-200 text-slate-800'
    }`}>
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className={`p-2 rounded-lg transition-colors duration-200 lg:hidden ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <FiMenu className="text-xl" />
          </button>
        )}
        
        <div>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{greeting}</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Center Section - Search */}
      {showSearch && (
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full relative">
            <div className="relative">
              <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`} />
              <input
                type="text"
                placeholder="Search patients, flights, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                }`}
              />
            </div>
          </form>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            isDark 
              ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
          }`}
          title="Toggle theme"
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications */}
        {showNotifications && (
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className={`relative p-2.5 rounded-xl transition-colors duration-200 ${
                isDark 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
              }`}
              title="Notifications"
            >
              <FiBell size={18} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationDropdown && (
              <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl border py-2 z-50 ${
                isDark 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className={`px-4 py-3 border-b ${
                  isDark ? 'border-slate-700' : 'border-slate-100'
                }`}>
                  <h3 className={`font-semibold ${
                    isDark ? 'text-slate-100' : 'text-slate-800'
                  }`}>Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notificationCount > 0 ? (
                    <div className={`px-4 py-3 cursor-pointer ${
                      isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                    }`}>
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-slate-100' : 'text-slate-800'
                      }`}>Emergency Request</p>
                      <p className={`text-xs mt-1 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>New air ambulance request received</p>
                      <p className="text-xs text-blue-600 mt-1">2 minutes ago</p>
                    </div>
                  ) : (
                    <div className={`px-4 py-8 text-center ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <FiBell className="mx-auto mb-2 text-2xl" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {showSettings && (
          <button
            className={`p-2.5 rounded-xl transition-colors duration-200 ${
              isDark 
                ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
            }`}
            title="Settings"
          >
            <FiSettings size={18} />
          </button>
        )}

        {/* User Profile */}
        <div className={`flex items-center space-x-3 pl-3 border-l ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="hidden sm:block text-right">
            <p className={`text-sm font-semibold ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>{realUserName}</p>
            <p className={`text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>Online</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg transition-shadow duration-200">
            {realUserName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Custom children */}
        {children}
      </div>
    </header>
  );
};

export default Header;