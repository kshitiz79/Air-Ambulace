// components/Global/SideBar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

const SideBar = ({ title, navigationLinks, userName, userRole, onLogout }) => {
  const location = useLocation();

  return (
    <aside className="w-[270px] bg-gradient-to-b from-blue-600 to-blue-700 text-white p-6 flex flex-col shadow-xl">
      {/* Dynamic Title */}
      <h1 className="text-2xl font-bold mb-10 tracking-tight">{title}</h1>

      <nav className="flex-grow">
        <ul className="space-y-2">
          {navigationLinks.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                    isActive
                      ? 'bg-gray-100 text-blue-800 font-semibold shadow-md'
                      : 'text-blue-100 hover:bg-blue-800'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-md">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="mt-auto">
        <div className="mb-6 px-4 py-3">
          <p className="text-sm font-semibold">{userName}</p>
          <p className="text-xs text-blue-200">{userRole}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 text-blue-100 hover:bg-blue-700/50 w-full text-left text-sm"
        >
          <FiLogOut className="text-xl" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;