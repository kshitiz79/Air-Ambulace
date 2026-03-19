import React, { useState, useEffect } from 'react';
import { FiBell, FiSearch, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useNotifications from '../../hooks/useNotifications';
import NotificationPopup from '../Common/NotificationPopup';
import baseUrl from '../../baseUrl/baseUrl';

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

  const realUserName = userName || localStorage.getItem('full_name') || localStorage.getItem('username') || 'User';

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const { theme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [districtName, setDistrictName] = useState('');

  const districtId = localStorage.getItem('district_id');

  useEffect(() => {
    if (districtId) {
      const fetchDistrict = async () => {
        try {
          const token = localStorage.getItem('token');

          const response = await fetch(`${baseUrl}/api/districts/${districtId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const data = await response.json();

          if (data && data.district_name) {
            setDistrictName(data.district_name);
          }

        } catch (err) {
          console.error('Error fetching district for header:', err);
        }
      };

      fetchDistrict();
    }
  }, [districtId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const getGreeting = () => {
    if (greeting === "Welcome back") return t.welcomeBack;
    if (greeting.startsWith("Welcome, ")) {
      return `${t.welcome}, ${userName}`;
    }
    return greeting;
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
          <h2 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
            {getGreeting()}
          </h2>

          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

      </div>

      {/* Search */}
 
      {/* Right Section */}
      <div className="flex items-center space-x-3">

        {/* Language Switcher */}
        <div className={`flex items-center rounded-lg border px-2 py-1 ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>

          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
              language === 'en'
                ? 'bg-blue-600 text-white'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            EN
          </button>

          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              language === 'hi'
                ? 'bg-blue-600 text-white'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            हि
          </button>

        </div>

        {/* Notifications */}
        {showNotifications && (
          <>
            <button
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              className={`relative p-2.5 rounded-xl ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >

              <FiBell size={18} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}

            </button>

            <NotificationPopup
              isOpen={showNotificationPopup}
              onClose={() => setShowNotificationPopup(false)}
              onViewAll={() => {
                setShowNotificationPopup(false);
                const role = localStorage.getItem('role');

                switch (role) {
                  case 'CMHO':
                    navigate('/cmho-dashboard/notification');
                    break;
                  case 'SDM':
                    navigate('/sdm-dashboard/notification');
                    break;
                  case 'COLLECTOR':
                    navigate('/collector-dashboard/notification');
                    break;
                  case 'SERVICE_PROVIDER':
                    navigate('/air-team/notification');
                    break;
                  case 'SUPPORT':
                    navigate('/it-team/notification');
                    break;
                  case 'ADMIN':
                    navigate('/admin/notification');
                    break;
                  default:
                    navigate('/user/notification');
                }

              }}
            />
          </>
        )}

        {/* Profile */}
        <div className={`flex items-center space-x-3 pl-3 border-l ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>

          <div className="hidden sm:block text-right">

            <p className={`text-sm font-semibold ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              {realUserName}
            </p>

            <p className={`text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {districtName}
            </p>

          </div>

          <div
            onClick={() => {
              const role = localStorage.getItem('role');

              switch (role) {
                case 'CMHO':
                  navigate('/cmho-dashboard/profile');
                  break;
                case 'SDM':
                  navigate('/sdm-dashboard/profile');
                  break;
                case 'COLLECTOR':
                  navigate('/collector-dashboard/profile');
                  break;
                case 'SERVICE_PROVIDER':
                  navigate('/air-team/profile');
                  break;
                default:
                  navigate(`/${role?.toLowerCase().replace('_', '-')}-dashboard/profile`);
              }
            }}

            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95 border-2 border-white/20 shadow-sm"
          >

            {realUserName.charAt(0).toUpperCase()}

          </div>

        </div>

        {children}

      </div>

    </header>
  );
};

export default Header;