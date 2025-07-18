import React, { useState } from 'react';
import Header from '../Global/Header';
import SideBar from '../Global/SideBar';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardLayout = ({ 
  children, 
  title = "Dashboard",
  navigationLinks = [],
  userName = "User",
  userRole = "Role",
  greeting = "Welcome back",
  onLogout,
  showSearch = true,
  showNotifications = true,
  showSettings = true,
  notificationCount = 0
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark } = useTheme();

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SideBar
          title={title}
          navigationLinks={navigationLinks}
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative">
            <SideBar
              title={title}
              navigationLinks={navigationLinks}
              userName={userName}
              userRole={userRole}
              onLogout={onLogout}
              collapsed={false}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          greeting={greeting}
          userName={userName}
          showSearch={showSearch}
          showNotifications={showNotifications}
          showSettings={showSettings}
          notificationCount={notificationCount}
          onMenuToggle={handleMobileMenuToggle}
        />
        
        <main className={`flex-1 p-6 overflow-auto ${
          isDark ? 'bg-slate-900' : 'bg-slate-50'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;