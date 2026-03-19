import React from 'react';
import { FaSyncAlt } from 'react-icons/fa';

/**
 * DashboardHeader — top header bar for all dashboards.
 * Props: title, subtitle, badgeLabel, onRefresh, refreshing, accentColor (tailwind color name e.g. 'blue', 'teal')
 */
const DashboardHeader = ({ title, subtitle, badgeLabel, onRefresh, refreshing, accentColor = 'blue' }) => {
  const btnClass = `bg-${accentColor}-600 hover:bg-${accentColor}-700`;
  const badgeClass = `bg-${accentColor}-50 text-${accentColor}-700 border-${accentColor}-100`;
  const dotClass = `bg-${accentColor}-500`;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">{title}</h1>
        {badgeLabel && (
          <div className="flex items-center mt-2 gap-3">
            <div className={`${badgeClass} px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border flex items-center shadow-sm`}>
              <span className={`w-2 h-2 ${dotClass} rounded-full mr-2 animate-pulse`}></span>
              {badgeLabel}
            </div>
          </div>
        )}
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={`flex items-center px-4 py-2 ${btnClass} text-white rounded-lg transition disabled:opacity-50`}
        >
          <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      )}
    </div>
  );
};

export default DashboardHeader;
